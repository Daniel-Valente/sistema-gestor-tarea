const { Router } = require('express');
const { connection } = require('../services/connection');

const router = Router();

router.get( '/', async( req, res ) =>{
    try {
        const { page, limit } =  req.query;

        if( !page || !limit ) {
            connection.query(' SELECT idtarea, titulo, descripcion, idCreador, fechaEntrega, idResponsable FROM tarea WHERE esPublica = 1;', ( err, result, fields ) => {
                if( err ) return res.status( 400 ).send([ err.message ]);

                return res.status(200).json( result );
            });
        } else {
            connection.query(' CALL Get_Task_Pagination( ?, ? );', [ +limit, +page ], ( err, result, fields ) => {
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

router.get( '/:idtarea', async( req, res ) =>{
    try {
        const { idtarea } = req.params;
        if( +idtarea < 0 ) return res.status( 400 ).send(['This param is not valid']);

        connection.query(`SELECT * FROM tarea WHERE idtarea = ${ +idtarea };`, ( err, result, fields ) => {
            if( err ) return res.status( 400 ).send([ err.message ]);
            if( !result.length ) return res.status( 400 ).send(['Content not found by this idtarea']);
            
            return res.status(200).json( result );
        });

    } catch (error) {
        return res.status( 500 ).send([ error.message ]);
    }
});

router.get( '/search', async( req, res ) =>{});

router.post( '/', async( req, res ) =>{
    try {
        const { titulo, descripcion, fechaEntrega, esPublica, idCreador, tags, archivo, compartidoList } = req.body;
    
        if( !titulo || !descripcion || !fechaEntrega || !esPublica || !idCreador ) return res.status( 400 ).send(['The param cannot go empty']);
        
        const data = { titulo, descripcion, estatus: 1, fechaEntrega, esPublica, idCreador, tags, archivo };
        
        connection.query( 'INSERT INTO tarea SET ?', data, 
            ( err, result, fields ) => {
            if( err ) return res.status( 400 ).send([ err.message ]);

            const { insertId } = result;
            if( compartidoList && compartidoList.length ) {
                connection.query( 'INSERT INTO compartido (`idtarea`, `idusuario`) VALUE ?',
                [ compartidoList.map( user => [ insertId, user ]) ], 
                ( err, result, fields ) => {
                    if( err ) return res.status( 400 ).send([ err.message ]);
                    return res.status( 200 ).send(['Task created']);
                });
            }
            else return res.status( 200 ).send(['Task created']);
        });

    } catch (error) {
        return res.status( 500 ).send([ error.message ]);
    }
});

router.post( '/:idtarea/comment', async( req, res ) => {
    try {
        const { idtarea } = req.params;
        const { comentario } = req.body;
        
        if( !comentario ) return res.status( 400 ).send(['The param cannot go empty']);
        if( +idtarea < 0 ) return res.status( 400 ).send(['This param is not valid']);
        
        const data = { comentario, idtarea };
        
        connection.query( `SELECT COUNT(*) AS count FROM tarea WHERE idtarea = ${ idtarea }`, (err, result) => {
            if( err ) return res.status( 400 ).send([ err.message ]);
            const [{ count }] = result;

            if( count === 1 ) {
                connection.query( 'INSERT INTO comentarios SET ?', data, 
                    ( err, result, fields ) => {
                    if( err ) return res.status( 400 ).send([ err.message ]);
                    return res.status( 200 ).send(['Comment created']);
                });
            } else return res.status( 400 ).send(['Task not found by this idtarea']);
        });

    } catch (error) {
        return res.status( 500 ).send([ error.message ]);
    }
});

router.put( '/:idtarea', async( req, res ) =>{
    try {
        const { idtarea } = req.params;
        const { titulo, descripcion, fechaEntrega, estatus, esPublica, idResponsable, tags, archivo, compartidoList, idEditor } = req.body;
        
        connection.query(' CALL GET_EDITOR( ?, ? );', [ idtarea, idEditor || idResponsable ], ( err, result, fields ) => {
            if( err ) return res.status( 400 ).send([ err.message ]);
            if( result.length > 2 ) {
                const [{ count : esCreador }] = result[0];
                const [{ count: esResponsable }] = result[1];

                if( esCreador === 1 || esResponsable === 1 ) {
                    const data = idResponsable ? { titulo, descripcion, estatus, fechaEntrega, esPublica, idResponsable, tags, archivo } : { titulo, descripcion, estatus, fechaEntrega, esPublica, tags, archivo };
        
                    connection.query( `UPDATE tarea SET ? WHERE idtarea= ${ idtarea }`, data, 
                        ( err, result, fields ) => {
                        if( err ) return res.status( 400 ).send([ err.message ]);

                        const { insertId } = result;
                        if( compartidoList && compartidoList.length ) {
                            connection.query( 'INSERT INTO compartido (`idtarea`, `idusuario`) VALUE ?',
                            [ compartidoList.map( user => [ insertId, user ]) ], 
                            ( err, result, fields ) => {
                                if( err ) return res.status( 400 ).send([ err.message ]);
                                return res.status( 200 ).send(['updated task']);
                            });
                        }
                        else return res.status( 200 ).send(['updated task']);
                    });
                } else return res.status( 204 ).send(['Task not update']);
            }
            else return res.status( 201 ).send(['No response from Database']);
        });
        
    } catch (error) {
        return res.status( 500 ).send([ error.message ]);
    }
});

router.delete( '/:idtarea', async( req, res ) =>{
    try {
        const { idtarea } = req.params;
        if( +idtarea < 0 ) return res.status( 400 ).send(['This param is not valid']);

        connection.query(`DELETE FROM tarea WHERE idtarea = ${ +idtarea } AND esPublico = 1;`, ( err, result, fields ) => {
            if( err ) return res.status( 400 ).send([ err.message ]);
            if( !result.length ) return res.status( 400 ).send(['Content not found by this idtarea']);
            
            return res.status(200).json( result );
        });

    } catch (error) {
        return res.status( 500 ).send([ error.message ]);
    }
});

module.exports = router;