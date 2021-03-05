'use strict'

var bcrypt = require('bcrypt-nodejs');
var Admin = require('../models.js/admin.model');
var Empresa = require('../models.js/empresa.model');

function adminInit(req, res){
    let admin = new Admin();

    admin.username = 'Admin';
    admin.password = '12345';

    Admin.findOne({username: admin.username}, (err, adminFind) => {
        if(err){
            console.log('Error al crear el administrador')
        }else if(adminFind){
            console.log('Administrador ya creado');
        }else{
            admin.save((err, adminSaved) => {
                if(err){
                    console.log('Error al crear el administrador');
                }else if(adminSaved){
                    console.log('Usuario administrador ya creado');
                }else{
                    console.log('Usuario administrador no creado');
                }
            })
        }
    })
}

function setEmpresas(req, res){
    let empresa = new Empresa();
    let params = req.body;
    let adminId = req.params.id;

    Admin.findOne({_id:adminId}, (err, adminIdFind) => {
        if(err){
            res.status(500).send({message:'Error al buscar adminId'});
        }else if(adminIdFind){
            if(params.nombreEmpresa && params.direccion && params.password){
                Empresa.findOne({nombreEmpresa: params.nombreEmpresa}, (err, nombreEmpresaFind) => {
                    if(err){
                        res.status(500).send({message:'Error al buscar nombre de empresa', err});  
                    }else if(nombreEmpresaFind){
                        res.status(200).send({message:'nombre de empresa ya está utilizado'});
                    }else{
                        bcrypt.hash(params.password, null, null, (err, passwordHash) => {
                            if(err){
                                res.status(500).send({message:'Error al encriptar la contraseña'});
                            }else if(passwordHash){
                                empresa.nombreEmpresa = params.nombreEmpresa;
                                empresa.direccion = params.direccion;
                                empresa.phone = params.phone;
                                empresa.cantidad_Empleados = 0;
                                empresa.password = passwordHash;

                                empresa.save( (err, empresaSaved) => {
                                    if(err){
                                        res.status(500).send({message:'Error al guardar los datos', err});
                                    }else if(empresaSaved){
                                        res.status(200).send({message:'Empresa agregada exitosamente'});
                                    }
                                })
                            }
                        })
                    }
                })
            }else{
                res.status(200).send({message:'Ingresa todos los parámetros solicitados'});
            }
        }else{
            res.status(404).send({message:'Solo el administrador puede acceder crear empresas o el id no existe'});
        }
    })
}

function updateEmpresas(req, res){
    let empresaId = req.params.id;
    let adminId = req.params.idA;
    let params = req.body;

    Admin.findById(adminId, (err, adminFind) => {
        if(err){
            res.status(500).send({message: 'Error en la busqueda de Administrador'});
        }else if(adminFind){
            if(params.nombreEmpresa && params.nombreEmpresa != ''){
                Empresa.findOne({nombreEmpresa: params.nombreEmpresa}, (err, nombreEmpresaFind) => {
                    if(err){
                        res.status(500).send({message: 'Error en buscar Nombre de Empresa'});
                    }else if(nombreEmpresaFind){
                        res.status(200).send({message: 'Nombre de empresa ya existente, no se puede actualizar'});
                    }else if(params.password || update.password == ''){
                        res.status(200).send({message: 'No se puede actualizar la contraseña, ingrese los datos nuevamente sin contraseña'});
                    }else{
                        Empresa.findByIdAndUpdate(empresaId, params, {new: true}, (err, empresaIdFind) => {
                            if(err){
                                res.status(500).send({message: 'Error en el servidor al intentar actualizar'});
                            }else if(empresaIdFind){
                                res.status(200).send({message:'Empresa actualizada exitosamente', empresaIdFind});
                            }else{
                                res.status(200).send({message: 'No hay registros para actualizar'});
                            }
                        })
                    }
                })
            }else if(params.password || params.password == ''){
                res.status(200).send({message: 'No se puede actualizar la contraseña, ingrese los datos nuevamente sin contraseña'});
            }else{
                Empresa.findByIdAndUpdate(empresaId, params, {new: true}, (err, empresaIdFind) => {
                    if(err){
                        res.status(500).send({message: 'Error en el servidor al intentar actualizar'});
                    }else if(empresaIdFind){
                        res.status(200).send({message:'Empresa actualizada exitosamente', empresaIdFind});
                    }else{
                        res.status(200).send({message: 'No hay registros para actualizar'});
                    }
                })
            }
        }else{
            res.status(500).send({message: 'Ingresa el id de administrador'});
        }
    });
}

function listEmpresas(req, res){
    let adminId = req.params.idA; 

    Admin.findById(adminId, (err, result) => {
        if(err){
            res.status(500).send({message: 'Error al intentar buscar administrador'});
        }else if(result){
            Empresa.find({}).exec( (err, empresaFind) => {
                if(err){
                    res.status(500).send({message: 'Error en el servidor al intentear buscar'});
                }else if(empresaFind){
                    res.status(200).send({message: 'Empresas encontradas', empresaFind});
                }else{
                    res.status(200).send({message: 'No hay registros'});
                }
            })
        }else{
            res.status(500).send({message: 'El id es incorrecto o no tienes permiso como administrador'});
        }
    })
    
}

function removeEmpresas(req, res){
    let adminId = req.params.idA;
    let empresaId = req.params.id;
    
    Admin.findById(adminId, (err, result) => {
        if(err){
            res.status(500).send({message: 'Error en el servidor al intentear buscar ID'});
        }else if(result){
            Empresa.findByIdAndRemove(empresaId, (err, empresaR) => {
                if(err){
                    res.status(500).send({message: 'Error en el servidor al intentear eliminar el registro'});
                }else if(empresaR){
                    res.status(200).send({message: 'Empresa eliminada', empresaR});
                }else{
                    res.status(200).send({message: 'No existe la empresa o ya fue eliminada'});
                }
            });
        }else{
            res.status(500).send({message: 'El id es incorrecto o no tienes permiso como administrador'});
        }
    })
}

module.exports = {
    adminInit,
    setEmpresas,
    updateEmpresas,
    listEmpresas,
    removeEmpresas
}