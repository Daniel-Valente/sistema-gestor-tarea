const { Router } = require("express");
const { connection } = require('../services/connection');

const router = Router();
/**
 * @swagger
 * /bitacora:
 *   get:
 *     tags:
 *       - Bitacoras
 *     summary: "List all bitacora"
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
            connection.query(' SELECT * FROM bitacora;', ( err, result, fields ) => {
                if( err ) return res.status( 400 ).send([ err.message ]);

                return res.status(200).json( result );
            });
        } else {
            connection.query(' CALL Get_Bitacora_Pagination( ?, ? );', [ +limit, +page ], ( err, result, fields ) => {
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
 * /bitacora/{idbitacora}:
 *   get:
 *     tags:
 *       - Bitacoras
 *     summary: "Get specific bitacora"
 *     parameters:
 *        - in: path
 *          name: idbitacora
 *          schema:
 *             type: integer
 *             required: true
 *             description: Numeric ID of the bitacora to get
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
 *       404:
 *         description: Not Found  
 *       400:
 *         description: Bad Request 
*/
router.get( '/:idbitacora', async( req, res ) => {
    try {
        const { idbitacora } = req.params;
        if( +idbitacora < 0 ) return res.status( 400 ).send(['This param is not valid']);

        connection.query(`SELECT * FROM bitacora WHERE idbitacora = ${ +idbitacora };`, ( err, result, fields ) => {
            if( err ) return res.status( 400 ).send([ err.message ]);
            if( !result.length ) return res.status( 404 ).send(['Content not found by this idbitacora']);
            
            return res.status(200).json( result );
        });

    } catch (error) {
        return res.status( 500 ).send([ error.message ]);
    }
});

module.exports = router;