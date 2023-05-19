CREATE DATABASE gestion_db;

USE gestion_db;

CREATE TABLE privacidad (
	`idprivacidad` INT(11) NOT NULL AUTO_INCREMENT,
    `descripcion` VARCHAR(45) NOT NULL,
    PRIMARY KEY (`idprivacidad`)
);

CREATE TABLE estatus (
	`idestatus` INT(11) NOT NULL AUTO_INCREMENT,
    `descripcion` VARCHAR(45) NOT NULL,
    PRIMARY KEY (`idestatus`)
);

CREATE TABLE rol (
	`idrol` INT(11) NOT NULL AUTO_INCREMENT,
    `descripcion` VARCHAR(45) NOT NULL,
    PRIMARY KEY (`idrol`)
);

CREATE TABLE usuarios (
	`idusuario` INT(11) NOT NULL AUTO_INCREMENT,
    `nombreCompleto` VARCHAR(45) NOT NULL,
    `rol` INT(11) NOT NULL ,
    PRIMARY KEY (`idusuario`),
    CONSTRAINT `fk_rol` FOREIGN KEY (`rol`)
    REFERENCES gestion_db.rol (`idrol`)
);

CREATE TABLE tareas (
	`idtarea` INT(11) NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(500) NOT NULL,
    `estatus` INT(11) NOT NULL,
    `fechaEntrega` DATETIME NOT NULL,
    `esPublica` INT(11) NOT NULL,
    `idCreador` INT(11) NOT NULL,
    `idResponsable` INT(11) DEFAULT NULL,
    `tags` VARCHAR(100) DEFAULT NULL,
    `archivo` BLOB DEFAULT NULL,
    PRIMARY KEY (`idtarea`),
    CONSTRAINT `fk_estatus` FOREIGN KEY (`estatus`)
    REFERENCES gestion_db.estatus (`idestatus`),
    CONSTRAINT `fk_espublica` FOREIGN KEY (`esPublica`)
    REFERENCES gestion_db.privacidad (`idprivacidad`),
    CONSTRAINT `fk_creador` FOREIGN KEY (`idCreador`)
    REFERENCES gestion_db.usuarios (`idusuario`),
    CONSTRAINT `fk_responsable` FOREIGN KEY (`idResponsable`)
    REFERENCES gestion_db.usuarios (`idusuario`)
);

CREATE TABLE comentarios (
	`idcomentario` INT(11) NOT NULL AUTO_INCREMENT,
    `comentario` VARCHAR(500) NOT NULL,
    `idtarea` INT(11) NOT NULL,
    `idCreador` INT(11) NOT NULL,
    PRIMARY KEY (`idcomentario`),
    CONSTRAINT `fk_tarea` FOREIGN KEY (`idtarea`)
    REFERENCES gestion_db.tareas (`idtarea`),
    CONSTRAINT `fk_usuario` FOREIGN KEY (`idCreador`)
    REFERENCES gestion_db.usuarios (`idusuario`)
);

CREATE TABLE compartidos (
	`idcompartido` INT(11) NOT NULL AUTO_INCREMENT,
    `idusuario` INT(11) NOT NULL,
    `idtarea` INT(11) NOT NULL,
    PRIMARY KEY (`idcompartido`),
    CONSTRAINT `fk_idusuario` FOREIGN KEY (`idusuario`)
    REFERENCES gestion_db.usuarios (`idusuario`),
    CONSTRAINT `fk_idtarea` FOREIGN KEY (`idtarea`)
    REFERENCES gestion_db.tareas (`idtarea`)
);

CREATE TABLE bitacora (
	`idbitacora` INT(11) NOT NULL AUTO_INCREMENT,
    `fecha` DATETIME,
    `executedSQL` VARCHAR(2000) DEFAULT NULL,
    `reverseSQL` VARCHAR(2000) DEFAULT NULL,
    `log_user` VARCHAR (350) DEFAULT NULL,
    PRIMARY KEY (`idbitacora`)
);

DELIMITER $$
CREATE TRIGGER after_insert_tareas
	AFTER INSERT ON tareas
    FOR EACH ROW
BEGIN
	insert into bitacora ( fecha, executedSQL, reverseSQL, log_user )
    values(
		now(),
		CONCAT("INSERT INTO tareas (idtarea, titulo, descripcion, estatus, fechaEntrega, esPublica, idCreador, tags, archivo) VALUES (",NEW.idtarea,", """,NEW.titulo,", """,NEW.descripcion,", """,NEW.estatus,", """,NEW.fechaEntrega,", """,NEW.esPublica,", """,NEW.idCreador,", """,NEW.tags,", """,NEW.archivo,");"),
		CONCAT("DELETE FROM tareas WHERE idtarea = ", NEW.idtarea,";"),
		CURRENT_USER()
    );
END;
$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER after_delete_tareas
	AFTER DELETE ON tareas
    FOR EACH ROW
BEGIN
	insert into bitacora ( fecha, executedSQL, reverseSQL, log_user )
    values(
		now(),
		CONCAT("DELETE FROM tareas WHERE idtarea = ", OLD.idtarea,";"),
		CONCAT("INSERT INTO tareas (idtarea, titulo, descripcion, estatus, fechaEntrega, esPublica, idCreador, tags, archivo) VALUES (",OLD.idtarea,", """,OLD.titulo,", """,OLD.descripcion,", """,OLD.estatus,", """,OLD.fechaEntrega,", """,OLD.esPublica,", """,OLD.idCreador,", """,OLD.tags,", """,OLD.archivo,");"),
		CURRENT_USER()
    );
END;
$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER after_update_tareas
	AFTER UPDATE ON tareas
    FOR EACH ROW
BEGIN
	insert into bitacora ( fecha, executedSQL, reverseSQL, log_user )
    values(
		now(),
		CONCAT("UPDATE tareas SET idtarea = ", NEW.idtarea,", titulo = ", NEW.titulo,", descripcion = ", NEW.descripcion,", estatus = ", NEW.estatus,", fechaEntrega = ", NEW.fechaEntrega,", esPublica = ", NEW.esPublica,", idResponsable = ", NEW.idResponsable,", tags = ", NEW.tags,", archivo = ", NEW.archivo,");"),
		CONCAT("UPDATE tareas SET idtarea = ", OLD.idtarea,", titulo = ", OLD.titulo,", descripcion = ", OLD.descripcion,", estatus = ", OLD.estatus,", fechaEntrega = ", OLD.fechaEntrega,", esPublica = ", OLD.esPublica,", idResponsable = ", OLD.idResponsable,", tags = ", OLD.tags,", archivo = ", OLD.archivo,");"),
		CURRENT_USER()
    );
END;
$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER after_insert_usuarios
	AFTER INSERT ON usuarios
    FOR EACH ROW
BEGIN
	insert into bitacora ( fecha, executedSQL, reverseSQL, log_user )
    values(
		now(),
		CONCAT("INSERT INTO usuarios (idusuario, nombreCompleto, rol) VALUES (",NEW.idusuario,", """,NEW.nombreCompleto,", """,NEW.rol,");"),
		CONCAT("DELETE FROM usuarios WHERE idusuario = ", NEW.idusuario,";"),
		CURRENT_USER()
    );
END;
$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER after_delete_usuarios
	AFTER DELETE ON usuarios
    FOR EACH ROW
BEGIN
	insert into bitacora ( fecha, executedSQL, reverseSQL, log_user )
    values(
		now(),
		CONCAT("DELETE FROM usuarios WHERE idusuario = ", OLD.idusuario,";"),
		CONCAT("INSERT INTO usuarios (idusuario, nombreCompleto, rol) VALUES (",OLD.idusuario,", """,OLD.nombreCompleto,", """,OLD.rol,");"),
		CURRENT_USER()
    );
END;
$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER after_update_usuarios
	AFTER UPDATE ON usuarios
    FOR EACH ROW
BEGIN
	insert into bitacora ( fecha, executedSQL, reverseSQL, log_user )
    values(
		now(),
		CONCAT("UPDATE usuarios SET idusuario = ", NEW.idusuario,", nombreCompleto = ", NEW.nombreCompleto,", rol = ", NEW.rol,");"),
		CONCAT("UPDATE usuarios SET idusuario = ", OLD.idusuario,", nombreCompleto = ", OLD.nombreCompleto,", rol = ", OLD.rol,");"),
		CURRENT_USER()
    );
END;
$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER after_insert_comentarios
	AFTER INSERT ON comentarios
    FOR EACH ROW
BEGIN
	insert into bitacora ( fecha, executedSQL, reverseSQL, log_user )
    values(
		now(),
		CONCAT("INSERT INTO comentarios (idcomentario, comentario, idtarea, idCreador) VALUES (",NEW.idcomentario,", """,NEW.comentario,", """,NEW.idtarea,", """,NEW.idCreador,");"),
		CONCAT("DELETE FROM comentarios WHERE idcomentario = ", NEW.idcomentario,";"),
		CURRENT_USER()
    );
END;
$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER after_delete_comentarios
	AFTER DELETE ON comentarios
    FOR EACH ROW
BEGIN
	insert into bitacora ( fecha, executedSQL, reverseSQL, log_user )
    values(
		now(),
		CONCAT("DELETE FROM comentarios WHERE idcomentario = ", OLD.idcomentario,";"),
		CONCAT("INSERT INTO comentarios (idcomentario, comentario, idtarea, idCreador) VALUES (",OLD.idcomentario,", """,OLD.comentario,", """,OLD.idtarea,", """,OLD.idCreador,");"),
		CURRENT_USER()
    );
END;
$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER after_insert_compartidos
	AFTER INSERT ON compartidos
    FOR EACH ROW
BEGIN
	insert into bitacora ( fecha, executedSQL, reverseSQL, log_user )
    values(
		now(),
		CONCAT("INSERT INTO compartidos (idcompartido, idusuario, idtarea) VALUES (",NEW.idcompartido,", """,NEW.idusuario,", """,NEW.idtarea,");"),
		CONCAT("DELETE FROM compartidos WHERE idcompartido = ", NEW.idcompartido,";"),
		CURRENT_USER()
    );
END;
$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER after_delete_compartidos
	AFTER DELETE ON compartidos
    FOR EACH ROW
BEGIN
	insert into bitacora ( fecha, executedSQL, reverseSQL, log_user )
    values(
		now(),
		CONCAT("DELETE FROM compartidos WHERE idcompartido = ", OLD.idcompartido,";"),
		CONCAT("INSERT INTO compartidos (idcompartido, idusuario, idtarea) VALUES (",OLD.idcompartido,", """,OLD.idusuario,", """,OLD.idtarea,");"),
		CURRENT_USER()
    );
END;
$$
DELIMITER ;

INSERT INTO rol (`descripcion`) VALUES ('admin');
INSERT INTO rol (`descripcion`) VALUES ('basico');

INSERT INTO privacidad (`descripcion`) VALUES ('publica');
INSERT INTO privacidad (`descripcion`) VALUES ('privada');

INSERT INTO estatus (`descripcion`) VALUES ('por hacer');
INSERT INTO estatus (`descripcion`) VALUES ('en cola');
INSERT INTO estatus (`descripcion`) VALUES ('en proceso');
INSERT INTO estatus (`descripcion`) VALUES ('completada');

DELIMITER $$
CREATE PROCEDURE `Get_Task_Pagination` (
	P_PageSize INT,
    P_PageIndex INT
)
BEGIN
	DECLARE offSetPage INT;
    SET offSetPage = ((P_PageIndex - 1) * P_PageSize);
    SELECT idtarea, titulo, descripcion, idCreador, fechaEntrega, idResponsable FROM tareas
    LIMIT P_PageSize
    OFFSET offSetPage;
    
    SELECT P_PageSize AS PageLimit, P_PageIndex AS PageIndex, COUNT(*) AS TotalCount, CEIL(COUNT(*) / P_PageSize) AS TotalPages FROM tareas; 
END
$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `Get_Editor` (
	E_idTarea INT,
    E_idEditor INT,
    E_idResponsable INT
)
BEGIN
	SELECT COUNT(*) FROM tareas WHERE idtarea = E_idTarea AND idCreador = E_idEditor;
    SELECT COUNT(*) FROM compartidos WHERE idtarea = E_idTarea AND idusuario = E_idEditor;
    SELECT COUNT(*) FROM compartidos WHERE idtarea = E_idTarea AND idusuario = E_idResponsable;      
END
$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `Get_User_Pagination` (
	P_PageSize INT,
    P_PageIndex INT
)
BEGIN
	DECLARE offSetPage INT;
    SET offSetPage = ((P_PageIndex - 1) * P_PageSize);
    SELECT * FROM usuarios
    LIMIT P_PageSize
    OFFSET offSetPage;
    
    SELECT P_PageSize AS PageLimit, P_PageIndex AS PageIndex, COUNT(*) AS TotalCount, CEIL(COUNT(*) / P_PageSize) AS TotalPages FROM usuarios; 
END
$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `Get_Bitacora_Pagination` (
	P_PageSize INT,
    P_PageIndex INT
)
BEGIN
	DECLARE offSetPage INT;
    SET offSetPage = ((P_PageIndex - 1) * P_PageSize);
    SELECT * FROM bitacora
    LIMIT P_PageSize
    OFFSET offSetPage;
    
    SELECT P_PageSize AS PageLimit, P_PageIndex AS PageIndex, COUNT(*) AS TotalCount, CEIL(COUNT(*) / P_PageSize) AS TotalPages FROM bitacora; 
END
$$
DELIMITER ;