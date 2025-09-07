/**
 * Servicio de un módulo.
 * 
 * Responsabilidades:
 * - Contener la lógica de negocio principal del módulo.
 * - Interactuar con la base de datos, APIs externas u otros servicios si es necesario.
 * - Retornar resultados al controlador.
 * 
 * Nota: El servicio no debe manejar solicitudes HTTP ni preocuparse por la respuesta al cliente.
 */



export class ExampleService {

    sendHelloMessage = () => {
        return 'Hello world';
    }
}