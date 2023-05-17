const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    database: 'gestion_db',
    user: 'root',
    password: 'dani'
});

connection.connect(( err ) => {
    if( err ) throw err;
    console.log("Connected!");
});

module.exports = { connection };