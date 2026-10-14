//Libs necessárias
const cors = require('cors');
const express = require('express');
const authRoute = require('./routes/auth.route.js')

const APP = express();

APP.use(cors());
APP.use(express.json());
APP.use(authRoute);

const PORT = 3000;
const SERVER = "localhost"
const MSG = `Servidor online em  ${SERVER}:${PORT}`
APP.listen(PORT, () => console.log(MSG))