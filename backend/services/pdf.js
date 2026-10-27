'use strict'

/* Generación de PDF con Puppeteer (Chromium headless).
   - Un único navegador para todo el proceso, que se arranca la primera vez que se pide un PDF
     y se vuelve a arrancar si se cae.
   - Cada PDF abre su propia página y la cierra al terminar.
   - Como mucho MAX_CONCURRENTES PDFs a la vez; el resto espera en cola.
   - El HTML se pasa ya montado (page.setContent): Chromium no llama a la API, así que no le
     afecta el certificado autofirmado. Las imágenes y fuentes tienen que ir embebidas.
   - El perfil de Chromium va en backend/tmp/chromium y no en la carpeta temporal del sistema:
     con pm2 la variable TEMP puede apuntar a la carpeta de una sesión de escritorio remoto que
     ya no existe, y entonces Chromium no arranca. Un perfil nuevo por arranque del navegador,
     que se borra al cerrarlo; los que queden de caídas se borran al cargar este módulo.
     Chromium también usa TEMP para escribir el PDF, así que se le da una dentro del perfil. */

var fs = require('fs');
var path = require('path');
var puppeteer = require('puppeteer');
var PDFDocument = require('pdf-lib').PDFDocument;

var MAX_CONCURRENTES = 3;
var TIMEOUT_MS = 30000;

var CARPETA_PERFILES = path.join(__dirname, '..', 'tmp', 'chromium');

var navegador = null;      // promesa del navegador arrancado
var procesoChromium = null; // proceso del navegador, para matarlo al salir sin esperar
var perfil = null;         // carpeta del perfil del navegador arrancado
var enCurso = 0;
var cola = [];

// Si Chromium aún tiene ficheros abiertos el borrado puede fallar: se queda para la próxima limpieza
function borrarCarpeta(carpeta) {
	try {
		fs.rmSync(carpeta, { recursive: true, force: true });
	} catch (err) { }
}

function limpiarPerfilesAntiguos() {
	if (!fs.existsSync(CARPETA_PERFILES)) return;
	fs.readdirSync(CARPETA_PERFILES).forEach(function (nombre) {
		if (nombre.indexOf('perfil-') === 0) borrarCarpeta(path.join(CARPETA_PERFILES, nombre));
	});
}

limpiarPerfilesAntiguos();

function obtenerNavegador() {
	if (!navegador) {
		fs.mkdirSync(CARPETA_PERFILES, { recursive: true });
		var perfilNuevo = fs.mkdtempSync(path.join(CARPETA_PERFILES, 'perfil-'));
		var temporal = path.join(perfilNuevo, 'temp');
		fs.mkdirSync(temporal);
		perfil = perfilNuevo;
		navegador = puppeteer.launch({
			headless: 'new',
			userDataDir: perfilNuevo,
			env: Object.assign({}, process.env, { TEMP: temporal, TMP: temporal }),
			args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none']
		}).then(function (browser) {
			var proceso = browser.process();
			procesoChromium = proceso;
			browser.on('disconnected', function () {
				navegador = null;
				procesoChromium = null;
				perfil = null;
				// En Windows el perfil no se puede borrar hasta que el proceso de Chromium ha terminado
				if (proceso && proceso.exitCode === null) {
					proceso.once('exit', function () { borrarCarpeta(perfilNuevo); });
				} else {
					borrarCarpeta(perfilNuevo);
				}
			});
			return browser;
		}).catch(function (err) {
			navegador = null;
			perfil = null;
			borrarCarpeta(perfilNuevo);
			throw err;
		});
	}
	return navegador;
}

function pedirTurno() {
	if (enCurso < MAX_CONCURRENTES) {
		enCurso++;
		return Promise.resolve();
	}
	return new Promise(function (resolve) {
		cola.push(resolve);
	});
}

function liberarTurno() {
	var siguiente = cola.shift();
	if (siguiente) {
		siguiente();
	} else {
		enCurso--;
	}
}

async function ponerTitulo(pdf, titulo) {
	var documento = await PDFDocument.load(pdf, { updateMetadata: false });
	documento.setTitle(titulo);
	return Buffer.from(await documento.save());
}

/* Devuelve un Buffer con el PDF del HTML recibido.
   opciones: las de page.pdf() de Puppeteer (format, landscape, margin, headerTemplate...).
   Por defecto A4 vertical con fondos impresos.
   opciones.titulo: título del documento. Chrome no lo escribe en el PDF, y el visor del navegador
   lo usa como nombre al descargarlo; por eso se añade después con pdf-lib. */
exports.generarPdf = async function (html, opciones) {
	await pedirTurno();
	var titulo = opciones && opciones.titulo;
	opciones = Object.assign({}, opciones);
	delete opciones.titulo;
	var page = null;
	try {
		var browser = await obtenerNavegador();
		page = await browser.newPage();
		page.setDefaultTimeout(TIMEOUT_MS);
		await page.setContent(html, { waitUntil: 'networkidle0' });
		var pdf = await page.pdf(Object.assign({
			format: 'A4',
			printBackground: true,
			preferCSSPageSize: true
		}, opciones));
		return titulo ? await ponerTitulo(pdf, titulo) : Buffer.from(pdf);
	} finally {
		if (page) {
			await page.close().catch(function () { });
		}
		liberarTurno();
	}
};

/* Cierra el navegador. Se llama al parar el proceso para no dejar Chromium huérfanos. */
exports.cerrar = async function () {
	if (!navegador) return;
	var browser = await navegador.catch(function () { return null; });
	navegador = null;
	if (browser) {
		await browser.close().catch(function () { });
	}
};

/* Al salir del proceso (también cuando nodemon reinicia) no se puede esperar a nada:
   se mata Chromium directamente. */
process.once('exit', function () {
	if (procesoChromium) procesoChromium.kill();
	if (perfil) borrarCarpeta(perfil);
});
['SIGINT', 'SIGTERM'].forEach(function (senal) {
	process.once(senal, function () {
		exports.cerrar().finally(function () {
			process.exit(0);
		});
	});
});
