/* Las medidas del configurador van en cm con un paso fijo: de 0,5 en 0,5 (100 / 100,5 / 101) en
   todos los productos salvo HoneyComb, que va de 0,1 en 0,1.
   El step del <input type="number"> solo afecta a las flechas; lo que se teclea a mano se
   comprueba con esto antes de valorar o añadir a la cesta */
export const PASO_MEDIDA = 0.5;
export const PASO_MEDIDA_HONEYCOMB = 0.1;

/* Mensaje de error si alguna medida no es múltiplo del paso, o '' si todas lo son.
   Las vacías no se comprueban: de eso ya avisa cada configurador */
export function errorPasoMedidas(medidas: { [nombre: string]: any }, paso: number = PASO_MEDIDA): string {
   for (const nombre of Object.keys(medidas)) {
      const valor = medidas[nombre];
      if (valor === '' || valor === null || valor === undefined) { continue; }
      const pasos = Number(valor) / paso;
      if (isNaN(pasos) || Math.abs(pasos - Math.round(pasos)) > 1e-6) {
         return nombre + ': la medida tiene que ir en múltiplos de ' + String(paso).replace('.', ',') + ' cm';
      }
   }
   return '';
}
