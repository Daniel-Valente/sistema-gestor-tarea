const { Router } = require("express");
const { connection } = require('../services/connection');

const router = Router();

router.get( '/', async( req, res ) => {});

router.get( '/:idusuario', async( req, res ) => {});

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

router.patch( '/:idusuario/rol', async(req, res) => {});

router.delete( '/:idusuario', async(req, res) => {});

module.exports = router;