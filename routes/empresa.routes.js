'use strict'

var express = require('express');
var empresaController = require('../controller.js/empresa.controller');

var api = express.Router();

api.post('/loginEmpresa', empresaController.loginEmpresa);

api.put('/:id/createEmpleado', empresaController.createEmpleado);
api.put('/:id/updateEmpleado/:idEm', empresaController.updateEmpleado);
api.put('/:id/deleteEmpleado/:idEm', empresaController.deleteEmpleado);

api.get('/:id/controlPersonal', empresaController.controlPersonal);

api.post('/search', empresaController.search);

api.get('/:id/createPDF', empresaController.creatPDFEmpleado);

module.exports = api;