const { Router } = require('express');
const { connection } = require('../services/connection');

const router = Router();

router.get( '/', async( req, res ) =>{
    try {
        const { page, limit } =  req.query;

        if( !page || !limit ) {
            connection.query(' SELECT idtarea, titulo, descripcion, idCreador, fechaEntrega, idResponsable FROM tarea', ( err, result, fields ) => {
                if( err ) return res.status( 400 ).send([ err.message ]);

                return res.status(200).json( result );
            });
        } else {
            connection.query(' CALL Get_Pagination( ?, ? );', [ +limit, +page ], ( err, result, fields ) => {
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

router.get( '/:idtarea', async( req, res ) =>{});

router.get( '/search', async( req, res ) =>{});

router.post( '/', async( req, res ) =>{});

router.put( '/:idtarea', async( req, res ) =>{});

router.delete( '/:idtarea', async( req, res ) =>{});

module.exports = router;