import * as fs from 'fs';
import * as path from 'path';

// Interfaz para los errores del analizador
interface ErrorAnalisis {
    tipo: string;
    descripcion: string;
    linea?: number;
    columna?: number;
}

// Interfaz para los errores de Jison
interface JisonError extends Error {
    hash?: {
        line?: number;
        loc?: {
            first_column?: number;
        }
    };
}

// Interfaz para la bomba
interface Bomba {
    x: number;
    y: number;
}

// Interfaz para el elemento de configuración
interface ElementoConfig {
    contenido?: Bomba;
    linea?: number;
    columna?: number;
}

// Interfaz para el AST de configuración
interface ConfigAST {
    tipo: string;
    config: ElementoConfig[];
}

export interface ResultadoAnalisis {
    configuracion: ConfigAST | null;
    errores: ErrorAnalisis[];
}

// El analizador generado por Jison se importará así después de compilarlo
const Parser = require('./gameConfig').parser;

// Clase que encapsula la funcionalidad del analizador
export class Analizador {
    private parser: any;
    
    constructor() {
        this.parser = Parser;
    }
    
    /**
     * Analiza una cadena de entrada y genera el AST correspondiente
     * @param entrada Texto a analizar
     * @returns Árbol de sintaxis abstracta (AST)
     */
    public analizar(entrada: string) {
        try {
            // Ejecutar el analizador con la entrada proporcionada
            const ast = this.parser.parse(entrada);
            return {
                ast: ast as ConfigAST,
                errores: [] as ErrorAnalisis[]
            };
        } catch (e: unknown) {
            const error = e as JisonError;
            return {
                ast: null,
                errores: [{
                    tipo: 'Error de análisis',
                    descripcion: error.message || 'Error desconocido',
                    linea: error.hash?.line || 0,
                    columna: error.hash?.loc?.first_column || 0
                }] as ErrorAnalisis[]
            };
        }
    }

    /**
     * Procesa la configuración del juego
     * @param entrada Texto de configuración
     * @returns Resultado del procesamiento
     */
    public procesarConfiguracion(entrada: string) {
        const resultado = this.analizar(entrada);
        
        if (resultado.errores.length > 0) {
            return {
                configuracion: null,
                errores: resultado.errores
            };
        }
        
        try {
            // El AST debería tener la estructura definida en configGame.jison
            const configuracion = resultado.ast as ConfigAST;
            
            // Mostrar en consola las bombas agregadas
            if (configuracion.tipo === 'juego' && Array.isArray(configuracion.config)) {
                configuracion.config.forEach((item: ElementoConfig) => {
                    if (item && item.contenido) {
                        console.log(`Bomba Agregada en X: ${item.contenido.x}, Y: ${item.contenido.y}`);
                    }
                });
            }
            
            return {
                configuracion,
                errores: [] as ErrorAnalisis[]
            };
        } catch (e: unknown) {
            const error = e as Error;
            return {
                configuracion: null,
                errores: [{
                    tipo: 'Error de procesamiento',
                    descripcion: error.message || 'Error desconocido durante el procesamiento'
                }] as ErrorAnalisis[]
            };
        }
    }

    /**
     * Lee y analiza el contenido de un archivo de configuración
     * @param rutaArchivo Ruta del archivo a analizar
     * @returns Resultado del análisis
     */
    public analizarArchivoConfig(rutaArchivo: string) {
        try {
            // Verificar si el archivo existe
            if (!fs.existsSync(rutaArchivo)) {
                console.error(`El archivo '${rutaArchivo}' no existe`);
                return {
                    configuracion: null,
                    errores: [{
                        tipo: 'Error de archivo',
                        descripcion: `El archivo '${rutaArchivo}' no existe`
                    }] as ErrorAnalisis[]
                };
            }
    
            // Leer el contenido del archivo
            const contenido = fs.readFileSync(rutaArchivo, 'utf8');
            
            // Registro para depuración
            console.log(`Analizando archivo: ${rutaArchivo}`);
            console.log(`Tamaño del contenido: ${contenido.length} caracteres`);
    
            // Analizar el contenido
            return this.procesarConfiguracion(contenido);
        } catch (e: unknown) {
            const error = e as Error;
            console.error('Error al procesar el archivo:', error);
            return {
                configuracion: null,
                errores: [{
                    tipo: 'Error de archivo',
                    descripcion: `Error al procesar el archivo: ${error.message}`
                }] as ErrorAnalisis[]
            };
        }
    }
}

/*/ Ejemplo de uso (para pruebas)
if (require.main === module) {
    const analizador = new Analizador();
    
    console.log("\n=== PRUEBA CON ARCHIVO DE CONFIGURACIÓN ===");
    
    // Ruta del archivo a analizar
    const rutaArchivo = path.resolve(__dirname, 'leer.org');
    console.log(`Analizando archivo: ${rutaArchivo}`);
    
    // Ejecutar el análisis del archivo
    const resultado = analizador.analizarArchivoConfig(rutaArchivo);
    
    // Mostrar resultados
    if (resultado.errores.length > 0) {
        console.error('Errores:', resultado.errores);
    } else {
        console.log('Análisis exitoso');
        console.log('Configuración:', resultado.configuracion);
    }*/
// }