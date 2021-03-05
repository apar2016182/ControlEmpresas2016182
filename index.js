'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 300;
var adminInit = require('./controller.js/admin.controller');

mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);

mongoose.connect('mongodb://localhost:27017/ControlEmpresas', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(()=>{
        console.log('Conectado a la BD');
        adminInit.adminInit();
        app.listen(port,()=>{
            console.log('El servidor esta activado');
        })
    })
    .catch((err)=>{
        console.log('Error de conexión con la BD', err);
    })