const express = require('express');

const { connection } = require('./services/connection');
const { swaggerDocs } = require('./routes/swagger');

const dotenv = require('dotenv').config();

const app = express();

const port = process.env.PORT || 5000;

app.use( express.json() );
app.use( express.urlencoded({ extended: true }));

app.get( '/', ( req, res ) => res.status(200).json({ message: "This server is online", connection: connection.threadId }) );

app.use( '/task', require('./routes/task'));
app.use( '/user', require('./routes/user'));
app.use( '/bitacora', require('./routes/bitacora'));

app.listen( port, () => {
    console.log(` This server is running on port ${ port }`);
    swaggerDocs( app, port );
});