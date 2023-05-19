const { Router } = require('express');
const { connection } = require('../services/connection');

const router = Router();

/**
 * @swagger
 * /task:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: "List all task that are public"
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

/**
 * @openapi
 * /task/{idtarea}:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: "Get specific task"
 *     parameters:
 *        - in: path
 *          name: idtarea
 *          shema:
 *             type: integer
 *             required: true
 *             description: Numeric ID of the task to get
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

/**
 * @openapi
 * /task:
 *   post:
 *     tags:
 *       - Tasks
 *     summary: "Create a new task"
 *     parameters:
 *         - in: body
 *           name: data
 *           shema:
 *              type: object
 *              propierties:
 *                  titulo:
 *                      type: string
 *                  descripcion:
 *                      type: string
 *                  fechaEntrega:
 *                      type: string
 *                      format: date
 *                  esPublica:
 *                      type: integer
 *                  idCreador:
 *                      type: integer
 *                  tags:
 *                      type: string
 *                  archivo:
 *                      type: string
 *                  compartidoList:
 *                      type: string
 *              required: 
 *                  - titulo
 *                  - descipcion
 *                  - fechaEntrega
 *                  - esPublica
 *                  - idCreador
 *           example:
 *              titulo: "Creación de clasificiacion"
 *              descripcion: "Esta es una nueva tarea para clasificar la información"
 *              fechaEntrega: "2023-5-19"
 *              esPublica: 1
 *              idCreador: 1
 *              tags: null
 *              archivo: null
 *              compartidoList: null
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


/**
 * @openapi
 * /task/{idtarea}/comment:
 *   post:
 *     tags:
 *       - Tasks
 *     summary: "Create a new comment"
 *     parameters:
 *         - in: path
 *           name: idtarea
 *           shema:
 *             type: integer
 *             required: true
 *             description: Numeric ID of the task to get
 *         - in: body
 *           name: data
 *           shema:
 *              type: object
 *              propierties:
 *                  comentario:
 *                      type: string
 *              required: 
 *                  - comentario
 *           example:
 *              comentario: "Con gusto participo en tu tarea"
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

/**
 * @openapi
 * /task/{idtarea}:
 *   put:
 *     tags:
 *       - Tasks
 *     summary: "edit a specific task"
 *     parameters:
 *         - in: path
 *           name: idtarea
 *           shema:
 *              type: integer
 *              required: true
 *         - in: body
 *           name: data
 *           shema:
 *              type: object
 *              propierties:
 *                  titulo:
 *                      type: string
 *                  descripcion:
 *                      type: string
 *                  fechaEntrega:
 *                      type: string
 *                      format: date
 *                  esPublica:
 *                      type: integer
 *                  idResponsable:
 *                      type: integer
 *                  tags:
 *                      type: string
 *                  archivo:
 *                      type: string
 *                  compartidoList:
 *                      type: string
 *                  idEditor:
 *                      type: integer
 *              required: 
 *                  - titulo
 *                  - descipcion
 *                  - fechaEntrega
 *                  - esPublica
 *                  - idEditor
 *           example:
 *              titulo: "Creación de clasificiacion"
 *              descripcion: "Esta es una nueva tarea para clasificar la información"
 *              fechaEntrega: "2023-5-19"
 *              esPublica: 1
 *              idResponsable: null
 *              tags: null
 *              archivo: null
 *              compartidoList: null
 *              idEditor: 1
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
router.put( '/:idtarea', async( req, res ) =>{
    try {
        const { idtarea } = req.params;
        const { titulo, descripcion, fechaEntrega, estatus, esPublica, idResponsable, tags, archivo, compartidoList, idEditor } = req.body;
        const responsable = idResponsable ? idResponsable : idEditor;
        connection.query(' CALL Get_Editor( ?, ?, ? );', [ idtarea, idEditor, responsable ], ( err, result, fields ) => {
            if( err ) return res.status( 400 ).send([ err.message ]);
            if( result.length > 2 ) {
                const [{ count : esCreador }] = result[0];
                const [{ count : seCompartio }] = result[1];
                const [{ count: responsable }] = result[2];

                if( esCreador === 1 || seCompartio === 1 ) {
                    const data = idResponsable ? { titulo, descripcion, estatus, fechaEntrega, esPublica, idResponsable, tags, archivo } : { titulo, descripcion, estatus, fechaEntrega, esPublica, tags, archivo };
                    
                    if( responsable !== 1 ) return res.status( 400 ).send(['this user cannot be responsible for this task']);

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

/**
 * @openapi
 * /task/{idtarea}:
 *   delete:
 *     tags:
 *       - Tasks
 *     summary: "delete a specific task"
 *     parameters:
 *         - in: path
 *           name: idtarea
 *           shema:
 *             type: integer
 *             required: true
 *             description: Numeric ID of the task to get
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
 */
router.delete( '/:idtarea', async( req, res ) =>{
    try {
        const { idtarea } = req.params;
        if( +idtarea < 0 ) return res.status( 400 ).send(['This param is not valid']);

        connection.query(`DELETE FROM tarea WHERE idtarea = ${ +idtarea } AND esPublica = 1;`, ( err, result, fields ) => {
            if( err ) return res.status( 400 ).send([ err.message ]);
            if( !result.length ) return res.status( 400 ).send(['Content not found by this idtarea']);
            
            return res.status(200).json( result );
        });

    } catch (error) {
        return res.status( 500 ).send([ error.message ]);
    }
});

module.exports = router;