'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var empresaSchema = Schema({
    nombreEmpresa: String,
    direccion: String,
    phone: Number,
    cantidad_Empleados: Number,
    password: String,
    empleados: [{type: Schema.ObjectId, ref: 'empleado'}]
});

module.exports = mongoose.model('empresa', empresaSchema);