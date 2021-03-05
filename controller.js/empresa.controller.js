'use strict'

var bcrypt = require('bcrypt-nodejs');
var Empresa = require('../models.js/empresa.model');
var Empleado = require('../models.js/empleado.model');
var pdf = require('html-pdf');

function loginEmpresa(req, res){
    let params = req.body;

    if(params.nombreEmpresa && params.password){
        Empresa.findOne({nombreEmpresa: params.nombreEmpresa}, (err, nombreEmpresaFind) => {
            if(err){
                res.status(500).send({message: 'Error al intentar buscar nombreEmpresaFind'});
            }else if(nombreEmpresaFind){
                bcrypt.compare(params.password, nombreEmpresaFind.password, (err, passwordFind) => {
                    if(err){
                        res.status(500).send({message: 'Error al intentar comparar'});
                    }else if(passwordFind){
                        res.status(200).send({message: 'Empresa logeada exitosamente'});
                    }else{
                        res.status(404).send({message: 'Nombre de empresa o contraseña no encontrados'})
                    }
                })
            }else{
                res.status(404).send({message: 'Nombre de empresa o contraseña no encontrados'})
            }
        })
    }else{
        res.status(200).send({message: 'Por favor ingresa todos los datos necesarios'});
    }
}

/*Funciones de Empleados*/
function createEmpleado(req, res){
    let empresaId = req.params.id;
    let paramsEmpleado = req.body;
    let empleado = new Empleado(); 

    Empleado.findById(empresaId, (err, empresaIdFind) => {
        if(err){
            res.status(500).send({message: 'Error en el servidor al intentear buscar el registro'});
        }else if(empresaIdFind){
            if(paramsEmpleado.nombre && paramsEmpleado.puesto && paramsEmpleado.departamento && paramsEmpleado.nombre_Empresa){;                 
                empleado.nombre = paramsEmpleado.nombre;
                empleado.puesto = paramsEmpleado.puesto;
                empleado.departamento = paramsEmpleado.departamento;
                empleado.nombre_Empresa = paramsEmpleado.nombre_Empresa;
                if(empresaIdFind.nombreEmpresa == empleado.nombre_Empresa){
                    Empresa.findByIdAndUpdate(empresaId, {$push: {empleados: empleado}}, {new: true}, (err, empresaFind) => {
                        if(err){
                            res.status(500).send({message:'Error al buscar ID'});
                        }else if(empresaFind){
                            Empresa.findByIdAndUpdate(empresaId, {$inc: {cantidad_Empleados:1}}, {new: true}, (err, contFind) => {
                                if(err){
                                    res.status(500).send({message:'Error al intentar agregar'});
                                }else if(contFind){
                                    res.status(200).send({message: 'empleado agregado exitosamente', contFind});
                                }
                            })                          
                        }else{
                            res.status(404).send({message: 'empleado no agregado'});
                        }
                    })                    
                }else{
                    res.status(200).send({message: 'verifica que el nombre de la empresa coincida'});
                }
            }else{
                res.status(200).send({message: 'Ingresa los datos minimos para agregar un empleado'});
            }
        }else{
            res.status(200).send({message: 'No existe la empresa'});
        }
    })
}

function updateEmpleado(req, res){
    let empresaId = req.params.id;
    let empleadoId = req.params.idEm;
    let update = req.body

    Empleado.findOne({_id: empresaId}, (err, empresaFind) => {
        if(err){
            res.status(500).send({message:'Error general al buscar empresa'});
        }else if(empresaFind){
            if(update.nombre_Empresa && update.nombre_Empresa != ''){
                var nombre_Empresa = empresaFind.nombreEmpresa;
            Empresa.findOne({_id: empresaId, 'empleados._id': empleadoId, 'empleados.nombre_Empresa': nombre_Empresa},{'empleados.$':1} , (err, empleadoFind) => {
                if(err){
                    res.status(500).send({message:'Error al buscar empleado'});
                }else if(empleadoFind){
                    Empresa.findOneAndUpdate({_id: empresaId, 'empleados._id': empleadoId},
                    {'empleados.$.nombre': update.nombre,
                    'empleados.$.puesto': update.puesto,
                    'empleados.$.departamento': update.departamento,
                    'empleados.$.nombre_Empresa': update.nombre_Empresa}, {new: true}, (err, empleadoUpdate) => {
                        if(err){
                            res.status(500).send({message:'Error al actualizar empleado'});
                        }else if(empleadoUpdate){
                            res.status(200).send({message: 'Empleado actualizado exitosamente', empleadoUpdate});
                        }else{
                            res.status(404).send({message: 'Empleado no actualizado'});
                        }
                    }
                )
                }else{
                    res.status(404).send({message:'Este empleado no corresponde a tu empresa o no existe'});
                }
            })
            }else{
                return res.send({message:'Por favor ingresa los parametros necesarios (Nombre Empresa)'})
            }            
        }else{
            res.status(404).send({message: 'Empresa no encontrada'});
        }
    })
}

function deleteEmpleado(req, res){
    let empresaId = req.params.id;
    let empleadoId = req.params.idEm;

    Empleado.findById(empresaId, (err, empresaIdFind) => {
        if(err){
            res.status(500).send({message:'Error al buscar empresaId'});
        }else if(empresaIdFind){
            var x = empresaIdFind.nombreEmpresa;
            Empresa.findOne({'empleados._id': empleadoId, 'empleados.nombre_Empresa':x},{'empleados.$':1}, (err, empleadoFind) => {
                if(err){
                    res.status(500).send({message:'Error cuando buscaba empleado '});
                }else if(empleadoFind){
                    Empresa.findByIdAndUpdate(empresaId, {$inc: {cantidad_Empleados:-1}}, {new: true}, (err, contFind) => {
                        if(err){
                            res.status(500).send({message:'Error al intentar agregar', cantidad_Empleados});
                        }else if(contFind){
                            Empresa.findOneAndUpdate({_id: empresaId, 'empleados._id': empleadoId},
                            {$pull: {empleados: {_id: empleadoId}}}, {new: true}, (err, empleadoDelete) => {
                                if(err){
                                    res.status(500).send({message:'Error general al eliminar documento embedido'});
                                }else if(empleadoDelete){
                                    res.status(200).send({message: 'El empleado fue eliminado', empleadoDelete});
                                }else{
                                    res.status(404).send({message: 'Empleado no encontrado o ya eliminado'});
                                }
                            })
                        }
                    })                    
                }else{
                    res.status(404).send({message: 'Este empleado no corresponde a tu empresa o ya fue eliminado'});
                }
            })
        }else{
            res.status(404).send({message: 'La empresa no fue encontrada'});
        }
    })
}

function controlPersonal(req, res){
    let empresaId = req.params.id;
    
    Empleado.findById(empresaId, (err, empresaIdFind) => {
        if(err){
            res.status(500).send({message:'Error al intentar buscar empresa'});
        }else if(empresaIdFind){            
            res.status(200).send({message: 'Control de personal laborando actualmente',
                cantidad_Empleados: empresaIdFind.cantidad_Empleados,
                Empleados: empresaIdFind.empleados});
        }else{
            res.status(404).send({message: 'No se encontro la empresa'});
        }
    })
}

/*Funcion de busqueda*/
function search(req, res){
    var params = req.body;

    if(params.search){
        Empleado.find({$or:[{nombre_Empresa: params.search},
                        {nombre: params.search},
                        {puesto: params.search},
                        {departamento: params.search}]}, (err, resultSearch)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general'});
                            }else if(resultSearch){
                                return res.send({message: 'Coincidencias encontradas: ', resultSearch});
                            }else{
                                return res.status(403).send({message: 'Búsqueda sin coincidencias'});
                            }
                        })
    }else{
        return res.status(403).send({message: 'Ingrese datos en el campo de búsqueda'});
    }
}

function creatPDFEmpleado(req,res){
    let empresaId = req.params.id;    

    Empresa.findById(empresaId, (err, empresaFind)=>{
        if(err){
            res.status(500).send({message:'Error al buscar la empresa'});
        }else if(empresaFind){
            let empleados = empresaFind.empleados;
            let empleadoFinded = [];
            
            empleados.forEach(round=>{
                empleadoFinded.push(round)
            });
            let content = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>LISTA DE EMPLEADOS DE EMPRESA</title>
            </head>
            <style>
                div{
                    border: 3px solid black;
                    border-collapse: collapse;
                    padding-top: 1.2px;
                    padding-left: 1.2px;
                    padding-right: 1.2px;
                    padding-bottom: 1.2px;
                    margin-bottom: 20px;
                    margin-top: 20px;
                    margin-right: 20px;
                    margin-left: 20px;
                }
            </style>
            <div>
            <body>
                <style>
                    table{
                        width:80%;
                        margin: 0 auto;
                        padding: 10px;
                        margin-bottom: 120px;
                    }
                    table, th, td{
                        border: 1.5px solid black;
                        border-collapse: collapse;
                    }
                    th{
                        font-size: 24px;
                        font-family: arial;
                        background-color: rgb(179, 233, 206);
                        padding: 15px;
                    }
                    td{
                        font-size: 18px;
                        font-family: arial;
                        padding: 15px;
                    }
                    caption{
                        font-size: 32px;
                        padding: 8px;
                        color: black;
                        caption-side: top;
                        padding-bottom: 15px;
                    }
                    header{
                        font-size: 16px;
                        color: black;
                        background-color:  rgb(127, 212, 149);
                        padding: 2px;
                        margin-bottom: 35px;
                        padding: 15px;
                        font-style: italic;
                    }
                    footer{
                        font-size: 16px;
                        color: black;
                        background-color:  rgb(127, 212, 149);
                        padding: 2px;
                        font-style: italic;
                        padding: 15px;
                    }
                </style>
                <header>
                    <p>
                    Empresa: ${empresaFind.nombreEmpresa}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Cantidad Empleados: ${empresaFind.cantidad_Empleados}</p>
                </header>
                <table>
                    <caption>Lista de empleados de la empresa</caption>
                    <tr>
                        <th>Nombre</th>
                        <th>Puesto</th>
                        <th>Departamento</th>
                    </tr>
                    ${empleadoFinded.map(empleados => `<tr>
                    <td>${empleados.nombre}</td>
                    <td>${empleados.puesto}</td>
                    <td>${empleados.departamento}</td>
                    </tr>`).join('')}                    
                </table>    
                <footer>
                    <p>Proyecto: Control de empresas&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Angel Adolfo Par Ramírez&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;IN6AM - 2016182</p>
                </footer>
            </body>
            </div>
            </html>
            `;

            pdf.create(content).toFile('./pdf/Empleados'+ empresaFind.nombreEmpresa+'.pdf', (err, res) => {
                if(err){
                    console.log(res);
                }else if(res){
                    console.log(res);
                }
            })
            res.status(200).send({message: 'Se ha creado el PDF'});
        }else{
            res.status(404).send({message:'No se ha encontrado la empresa'});
        }
    })
}

module.exports = {
    loginEmpresa,
    createEmpleado,
    updateEmpleado,
    deleteEmpleado,

    controlPersonal,
    search,

    creatPDFEmpleado
}