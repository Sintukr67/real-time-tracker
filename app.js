const express=require('express');
const app=express();
const path=require('path');


//step-2->this is the boiler plate of socketio
const http=require('http');//socket run on http server so we need to create it
const socketio=require('socket.io');
const server=http.createServer(app);//now http server is created
const io=socketio(server);//socketio is a function


//step-3-> now setup the ejs
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname,'public')));


io.on('connection',function(socket){
    socket.on("send-location",function(data){
        io.emit('receive-location',{id: socket.id, ...data});
    });

    socket.on('disconnect',function(){
        io.emit('user-disconnected',socket.id);
    });
    // console.log('connected');
});



app.get('/', (req,res)=>{
    res.render('index');
})

// app.listen(3000);
server.listen(3000);