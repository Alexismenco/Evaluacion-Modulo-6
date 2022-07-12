const express= require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const axios = require('axios').default;
const url = require('url');
const app = express();
const puerto = 8081;

// Agregar roommates
app.post("/roommates",function(req,res){
    buscarR();
    res.send("Nuevo roommates agregado exitosamente <a href='http://localhost:8081/'>Volver al inicio</a>")
})
// Inicio
app.get("/", function(req,res){
    
    leerUser(req,res);
})
// Crear un gasto
app.get('/historial_gasto',function(req,res){
    historialGastos(req, res);
})

// eliminar gasto
app.get('/borrar_gasto', function (req, res) {
    let gasto = Object.values( req.query)
    fs.readFile("datos/gastos.txt",function(err,data){
        if(err){
            console.log("Error: "+err.message);
            res.send('Error no se pudo borrar <a href="http://localhost:8081/">Volver al inicio</a>');
        }else{
            let x =data.toString();
            let gastos=x.split('\n');
            let arra = [];
            fs.writeFile('datos/gastos.txt', '', {}, () => {})
            for(i=0;i<gastos.length-1;i++){
                arra.push(JSON.parse(gastos[i]));
                if(gastos[i]!=gastos[gasto]){
                    fs.appendFile('datos/gastos.txt', gastos[i]+'\n', {}, () => {
                    });
                } 
            }
            res.send('Gasto borrado correctamente <a href="http://localhost:8081/">Volver al inicio</a>');
            }
        })
  });

  // Hacer modificaciones a gastos
app.get('/editar_gasto',function(req,res){
    let gasto = Object.values( req.query.identificadore)
    console.log(req.query.identificadore)
    fs.readFile("datos/gastos.txt",function(err,data){
        if(err){
            console.log("Error: "+err.message);
            res.send("Error no se logro modificar  <a href='http://localhost:8081/'>Volver al inicio</a>")
        }else{
            let x =data.toString();
            let gastos=x.split('\n');
            let arra = [];
            fs.writeFile('datos/gastos.txt', '', {}, () => {})
            for(i=0;i<gastos.length-1;i++){
                arra.push(JSON.parse(gastos[i]));
                if(gastos[i]!=gastos[gasto]){

                    fs.appendFile('datos/gastos.txt', gastos[i]+'\n', {}, () => {
                    });
                } else if(gastos[i]==gastos[gasto]){
                    var modificacion = {"nombre":req.query.nombre,"descripcion":req.query.descripcion,"monto":req.query.monto}
                    console.log(modificacion)
                    fs.appendFile('datos/gastos.txt', JSON.stringify(modificacion)+'\n', {}, () => {
                    });
                }
            }
            res.send("Modificación exitosa <a href='http://localhost:8081/'>Volver al inicio</a>")
            }
        })
})
  
 // Archivos estaticos
app.use(express.static('public'));

// Ejecución
app.listen(puerto, () => console.log(`Servidor iniciado en el puerto ${puerto}!`));

// guarda el nombre en usuarios.txt
function guardarNombre(nombre) {
    fs.appendFile("datos/usuarios.txt", nombre+",\n", function(err){
        if(err){
            console.log("Error",err.message);
        }else {
            console.log("Nuevo roommates guardado correctamente")
        }
    })
}
// Buscar roommates( usuarios) de https://randomuser.me/api
async function buscarR(inicio,cantidad){
    let respuesta = await axios.get('https://randomuser.me/api');
    let user = respuesta.data.results[0].name.first.toString()
    guardarNombre(user);
}
// Mostrar usuarios en el html
function leerUser(req,res){
    
    fs.readFile('datos/usuarios.txt',function(err,data){
        if(err){
            console.log(err.message)
            res.send("Error")
        }else{
            let nombres = data.toString().split(',')
            let texto = '';
            for(i=0;i<=nombres.length-2;i++){
                if (nombres[i]!='' && nombres[i]!=undefined){
                    texto += '<option>'+nombres[i]+'</option>';
                }
            }
            fs.readFile("public/html/index.html",function(err,data){
                if(err){
                    console.log(err.message);
                }else{
                    var html = data.toString().replace("__usuarios__",texto)
                    leer(req,res,html);
                }
            })
        }
    })
}

// Guardar el gasto en historial
function historialGastos(req, res){

    // formato del gasto
    var registro = {
        nombre:req.query['nombre-gasto'],
        descripcion:req.query.descripcion,
        monto:req.query.monto,
    };
    
    // validando && guardando
        if(registro.nombre  !=undefined && registro.descripcion != undefined && registro.monto != undefined){
        fs.appendFile("datos/gastos.txt", JSON.stringify(registro)+'\n', function(err){
            if(err){
                console.log("Error",err.message);
                res.send("Error",err.message);
            }else {
                console.log("Archivo guardado correctamente");
                res.send("Gasto guardado correctamente <a href='http://localhost:8081/'>Volver al inicio</a>");
            }
        })
    }
}

// GMostrar gasto en el historial
 function leer(req,res, html) {
    fs.readFile("datos/gastos.txt",function(err,data){
        if(err){
            console.log("Error: "+err.message);
        }else{
            let basura ='<button id="btnDelete" type="submit"><i class="icon-trash"></i></button>';
            let editar = '<button id="btnEdit" type="submit"><i class="icon-file-text"></i></button>';
            let x =data.toString();
            let gastos=x.split('\n');
            let gastosObj=[];
            let textoHtml='';
            
            for(i=0;i<gastos.length-1;i++){
                gastosObj.push(JSON.parse(gastos[i]));
                textoHtml+='<tr><form action="/editar_gasto" method="get"><th><input name="nombre" id="nombre" type="text" value="'
                textoHtml+= gastosObj[i].nombre+'" > </th><th><input name="descripcion" id="descripcion" type="text" value="'+gastosObj[i].descripcion
                textoHtml+= '" ></th><th><input name="monto" id="monto" type="text" value="'+gastosObj[i].monto
                textoHtml+= '" ></th><th><input name="identificadore" type="text" style="display: none;" value="'+[i]+'"></th><th>'+editar+'</th></form>'
                textoHtml+= '<form action="/borrar_gasto" method="get"><td>'+basura;
                textoHtml+= '</td></tr><input name="identificador" type="text" style="display: none;" value="'+[i]+'"></form>'
            }
            html = html.toString().replace("__historial__",textoHtml);
            gastoTotal(req,res,html);
        }
    })
}

// Mostrar gastos resumidos 
function gastoTotal(req,res,html){

    fs.readFile("datos/usuarios.txt",function(err,data){
        if(err){
            console.log("Error: "+err.message);
        }else{
            let x =data.toString();
            let gastos=x.split(',\n');
            let usuariosObj=[];
            
            for(i=0;i<gastos.length-1;i++){ 
                usuariosObj.push(gastos[i]);
            }

            fs.readFile("datos/gastos.txt",function(err,datos){
                let y =datos.toString();
                let gastosV=y.split('\n');
                let gastosObj= [];
                for (i=0;i <gastosV.length-1;i++){
                    gastosObj.push(JSON.parse(gastosV[i]))
                }
                let textoTotal='';
                usuariosObj.map(l=>{
                    let dato = {
                        nombre:l,
                        gasto : gastosObj.filter(g => { return g.nombre==l}).reduce((a,v)=>{ return a+Number(v.monto)},0)
                    }
                    textoTotal += '<tr><td id="nombreT">'+dato.nombre+'</td><td id="debe">-'+dato.gasto+'</td></tr>'
                })
                html = html.replace("__gastoTotal__",textoTotal);
                res.send(html);
            })
        }
    })
}




