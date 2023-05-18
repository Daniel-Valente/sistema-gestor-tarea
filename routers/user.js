const { Router } = require("express");
const { connection } = require('../services/connection');

const router = Router();

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

router.put( '/:idusuario', async(req, res) => {});

router.delete( '/:idusuario', async(req, res) => {
    try {
        const { idusuario } = req.params;
        if( +idusuario < 0 ) return res.status( 400 ).send(['This param is not valid']);

        connection.query(`DELETE FROM usuario WHERE idusuario = ${ +idusuario };`, ( err, result, fields ) => {
            if( err ) return res.status( 400 ).send([ err.message ]);
            if( !result.length ) return res.status( 400 ).send(['Content not found by this idusuario']);
            
            return res.status(200).json( result );
        });

    } catch (error) {
        return res.status( 500 ).send([ error.message ]);
    }
});

module.exports = router;