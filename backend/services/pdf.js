'use strict'

/* Generación de PDF con Puppeteer (Chromium headless).
   - Un único navegador para todo el proceso, que se arranca la primera vez que se pide un PDF
     y se vuelve a arrancar si se cae.
   - Cada PDF abre su propia página y la cierra al terminar.
   - Como mucho MAX_CONCURRENTES PDFs a la vez; el resto espera en cola.
   - El HTML se pasa ya montado (page.setContent): Chromium no llama a la API, así que no le
     afecta el certificado autofirmado. Las imágenes y fuentes tienen que ir embebidas. */

var puppeteer = require('puppeteer');
var PDFDocument = require('pdf-lib').PDFDocument;

var MAX_CONCURRENTES = 3;
var TIMEOUT_MS = 30000;

var navegador = null;      // promesa del navegador arrancado
var procesoChromium = null; // proceso del navegador, para matarlo al salir sin esperar
var enCurso = 0;
var cola = [];

function obtenerNavegador() {
	if (!navegador) {
		navegador = puppeteer.launch({
			headless: 'new',
			args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none']
		}).then(function (browser) {
			procesoChromium = browser.process();
			browser.on('disconnected', function () {
				navegador = null;
				procesoChromium = null;
			});
			return browser;
		}).catch(function (err) {
			navegador = null;
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
});
['SIGINT', 'SIGTERM'].forEach(function (senal) {
	process.once(senal, function () {
		exports.cerrar().finally(function () {
			process.exit(0);
		});
	});
});
