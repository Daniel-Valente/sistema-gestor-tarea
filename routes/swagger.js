const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

/* Metada info about our API */
const options = {
    definition: {
        opeapi: "3.1.0",
        info: {
            title: "SISTEMA-GESTOR-TAREA",
            version: "1.0.0",
            description: " RESUTful API - Sistema de Gestión de Tareas",
            license: {
                name: "MIT",
                url: "https://spdx.org/licenses/MIT.html",
            },
            contact: {
                name: "Daniel-Valente",
                email: "valente.gar.daniel@gmail.com",
            },
        },
        servers: [{
                url: `http://localhost:5001/`,
            },
        ],
    },
    apis: ["./routes/*.js"],
}

/* Docs en JSON format*/
const swaggerSpec = swaggerJSDoc( options );

/* Function to setup our docs*/
const swaggerDocs = ( app, port ) => {
    app.use( '/v1/docs', swaggerUi.serve, swaggerUi.setup( swaggerSpec ));

    app.get( '/v1/docs.json', ( req, res ) => {
        res.setHeader( 'Content-Type', 'application/json' );
        res.send( swaggerSpec );
    });

    console.log(
        ` Version 1 Docs are available at http://localhost:${ port }/v1/docs`
    );
};

module.exports = { swaggerDocs };
