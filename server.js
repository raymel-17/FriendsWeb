var express = require('express');
const bodyParser = require('body-parser');
const { Server } = require('http');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http)
//servir contenido estatico

app.set('port', process.env.PORT || 3000);


app.use(express.static(__dirname));

//body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

var mensajes = [];

var usuarios = [];

app.get('/mensajes', (req, res)=>{
    res.send(mensajes);
});

app.get('/usuarios', (req, res)=>{
    res.send(usuarios);
});

app.post('/mensajes', (req, res)=>{
    mensajes.push(req.body);
    io.emit('mensaje', req.body);
    res.sendStatus(200);
})

io.on('connection', (socket)=>{
    var newUser = "";
    socket.on('nuevouser', function(nick){
        newUser = nick+"_"+usuarios.length
        usuarios.push({nombre: newUser})
        console.log("usuario conectado: "+newUser);
        
        io.emit("clienteconectado", usuarios)
    })
    socket.on('disconnect', ()=>{
        eliminarUsuario(newUser);
        io.emit('usuariodesconectado', 'desconectado: '+newUser)
    })
})

function eliminarUsuario(val){
    for(var i=0; i<usuarios.length; i++){
        if (usuarios[i].nombre == val) {
            usuarios.splice(i, 1)
            break;
        }
    }
}

app.listen(app.get('port'), () => {
    console.log(`server on port ${app.get('port')}`);
});