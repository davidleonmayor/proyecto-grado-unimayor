import { ExampleService } from "./example.service";
import { Request, Response } from "express";


/**
 * Controlador de un módulo.
 * 
 * Responsabilidades:
 * - Recibir los datos enviados por las rutas (req.params, req.body, req.query).
 * - Validar o transformar los datos si es necesario.
 * - Llamar a los servicios para ejecutar la lógica de negocio.
 * - Construir y devolver la respuesta HTTP al cliente (res.json, res.send, etc.).
 * 
 * Nota: El controlador no debe manejar lógica de negocio compleja ni acceso directo a la base de datos.
 */




export class ExampleController {

    private exampleService: ExampleService;

    constructor() {
        this.exampleService = new ExampleService();
    }

    sendHelloMessage = (req: Request, res: Response) => {
        const message = this.exampleService.sendHelloMessage();
        res.send(message);
    }

}