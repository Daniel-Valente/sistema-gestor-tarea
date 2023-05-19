const { Router } = require("express");
const { connection } = require('../services/connection');

const router = Router();
/**
 * @swagger
 * /user:
 *   get:
 *     tags:
 *       - Users
 *     summary: "List all user that are public"
 *     parameters:
 *        - in: query
 *          name: page
 *          description: "Specific page to pagination"
 *        - in: query
 *          name: limit
 *          description: "Specific limit to pagination"
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 data:
 *                   type: array 
 *                   items: 
 *                     type: object
 *       400:
 *         description: Bad Request 
*/
router.get( '/', async( req, res ) => {
    try {
        const { page, limit } =  req.query;

        if( !page || !limit ) {
            connection.query(' SELECT * FROM usuario;', ( err, result, fields ) => {
                if( err ) return res.status( 400 ).send([ err.message ]);

                return res.status(200).json( result );
            });
        } else {
            connection.query(' CALL Get_User_Pagination( ?, ? );', [ +limit, +page ], ( err, result, fields ) => {
                if( err ) return res.status( 400 ).send([ err.message ]);
                if( result.length > 2 ) {
                    const data = result[0];
                    const pagination = result[1];

                    return res.status( 200 ).json({ data, pagination });
                }
                else return res.status( 201 ).send(['No response from Database']);
            });
        }
    } catch (error) {
        return res.status( 400 ).send([ error.message ]);
    }
});

/**
 * @openapi
 * /user/{idusuario}:
 *   get:
 *     tags:
 *       - Users
 *     summary: "Get specific user"
 *     parameters:
 *        - in: path
 *          name: idusuario
 *          schema:
 *             type: integer
 *             required: true
 *             description: Numeric ID of the user to get
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 data:
 *                   type: array 
 *                   items: 
 *                     type: object
 *       204:
 *         description: Not Found  
 *       400:
 *         description: Bad Request 
*/
router.get( '/:idusuario', async( req, res ) => {
    try {
        const { idusuario } = req.params;
        if( +idusuario < 0 ) return res.status( 400 ).send(['This param is not valid']);

        connection.query(`SELECT * FROM usuario WHERE idusuario = ${ +idusuario };`, ( err, result, fields ) => {
            if( err ) return res.status( 400 ).send([ err.message ]);
            if( !result.length ) return res.status( 400 ).send(['Content not found by this idusuario']);
            
            return res.status(200).json( result );
        });

    } catch (error) {
        return res.status( 500 ).send([ error.message ]);
    }
});

/**
 * @openapi
 * /user:
 *   post:
 *     tags:
 *       - Users
 *     summary: "Create a new user"
 *     parameters:
 *         - in: body
 *           name: data
 *           schema:
 *              type: object
 *              propierties:
 *                  nombreCompleto:
 *                      type: string
 *                  rol:
 *                      type: integer
 *              required: 
 *                  - nombreCompleto
 *                  - rol
 *           example:
 *              nombreCompleto: "Jose Maria Macias Perez"
 *              rol: 2
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 data:
 *                   type: array 
 *                   items: 
 *                     type: object
 *       400:
 *         description: Bad Request 
*/
router.post( '/', async( req, res ) => {
    try {
        const { nombreCompleto, rol  } = req.body;
        if( !nombreCompleto || !rol ) return res.status( 400 ).send(['The param cannot go empty']);
        if( +rol < 0 ) return res.status( 400 ).send(['This param is not valid']);

        connection.query( 'INSERT INTO usuario (`nombreCompleto`, `rol`) VALUE' + ` ('${ nombreCompleto }', ${ +rol });`, 
            ( err, result, fields ) => {
            if( err ) return res.status( 400 ).send([ err.message ]);
            return res.status( 200 ).send(['user created']);
        });

    } catch (error) {
        return res.status( 500 ).send([ error.message ]);
    }
});

/**
 * @openapi
 * /user/{idusuario}:
 *   put:
 *     tags:
 *       - Users
 *     summary: "Edit a specific user"
 *     parameters:
 *         - in: path
 *           name: idusuario
 *           schema:
 *              type: integer
 *         - in: body
 *           name: data
 *           schema:
 *              type: object
 *              propierties:
 *                  nombreCompleto:
 *                      type: string
 *                  rol:
 *                      type: integer
 *              required: 
 *                  - nombreCompleto
 *                  - rol
 *           example:
 *              nombreCompleto: "Jose Maria Perez"
 *              rol: 1
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 data:
 *                   type: array 
 *                   items: 
 *                     type: object
 *       204:
 *         description: Not Found
 *       400:
 *         description: Bad Request 
*/
router.put( '/:idusuario', async(req, res) => {});

/**
 * @openapi
 * /user/{idusuario}:
 *   delete:
 *     tags:
 *       - Users
 *     summary: "delete a specific user"
 *     parameters:
 *         - in: path
 *           name: idusuario
 *           schema:
 *             type: integer
 *             required: true
 *             description: Numeric ID of the user to get
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 data:
 *                   type: array 
 *                   items: 
 *                     type: object
 *       400:
 *         description: Bad Request 
*/
router.delete( '/:idusuario', async(req, res) => {
    try {
        const { idusuario } = req.params;
        if( +idusuario < 0 ) return res.status( 400 ).send(['This param is not valid']);

        connection.query(`DELETE FROM usuario WHERE idusuario = ${ +idusuario };`, ( err, result, fields ) => {
            if( err ) return res.status( 400 ).send([ err.message ]);
            
            return res.status(200).json( 'User deleted' );
        });

    } catch (error) {
        return res.status( 500 ).send([ error.message ]);
    }
});

module.exports = router;