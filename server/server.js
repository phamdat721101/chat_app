const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const bodyParser = require("body-parser");
const {generateMessage, generateLocationMessage, generateData} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');
const dl=require('delivery');
const fs=require('fs');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();
const mongodb=require('mongodb');
const MongoClient = require('mongodb').MongoClient;
app.use(express.static(publicPath));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
io.on('connection', (socket) => {
  console.log('New user connected');
  
  var arr=[];
  socket.on('join', (params, callback) => {
    // if (!isRealString(params.name) || !isRealString(params.room)) {
    //   return callback('Name and room name are required.');
    // }
    
    MongoClient.connect('mongodb://localhost:27017/TodoApp',function(err,db){
      if(err){
        console.log('Fail To Connect');
      }
      console.log('Connected to MongoDB server');
      db.collection('Users').insertOne({
        user_id:socket.id,
        user:params.name,
        room:params.room
      },function(err,result){
        if (err) {
          return console.log('Unable to insert user', err);
        }
        console.log('Success to Add User');
      });
      var arr=[];
      db.collection('Users').find().toArray(function(err,result){
        for(var i=0;i<result.length;i++){
          if(result[i]["room"]==params.room){
            
            socket.join(params.room);
            
            arr[i]=result[i]["user"];
            users.addUser(result[i]["user_id"], arr[i], params.room);
            io.to(params.room).emit('updateUserList', users.getUserList(params.room));
            
          }
        }
      });

      users.removeUser(socket.id);
      socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
      
      socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined.`));
      db.collection('Users').find().toArray(function(err,result){
        for(var i=0;i<result.length;i++){
          io.to(params.room).emit('newMessage', generateMessage(result[i]["name"], result[i]["message"]));
        }
      });
      db.close();
    });
    
    callback();
  });

  socket.on('createMessage', (message, callback) => {
    var user = users.getUser(socket.id);

    if (user && isRealString(message.text)) {
      io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
    }
    MongoClient.connect('mongodb://localhost:27017/TodoApp',function(err,db){
      if(err){
        console.log('Fail To Connect');
      }
      console.log('Connected to MongoDB server');
      
      db.collection('Users').insertOne({
        name:user.name,
        message:message.text
      },function(err,result){
        if (err) {
          return console.log('Unable to insert user', err);
        }
        console.log('Success');
      });
      
      db.close();
    });
    callback();
  });
  socket.on('user image', function (msg) {
    var user = users.getUser(socket.id);
    console.log(msg);
    io.to(user.room).emit('user image', generateData(user.name,msg));
    //socket.emit('user image', msg);
    // MongoClient.connect('mongodb://localhost:27017/TodoApp',function(err,db){
    //   if(err){
    //     console.log('Fail To Connect');
    //   }
    //   console.log('Connected to MongoDB server');
    //   db.collection('image').insertOne({
    //     image:msg
    //   },function(err,result){
    //     if(err){
    //       return console.log('Fail to add image');
    //     }
    //     console.log('Success to add image');
    //   });
    //   db.collection('image').find().toArray(function(err,result){
    //     for(var i=0;i<result.length;i++){
    //       socket.emit('user image',result[i]["image"]);
    //     }
    //   });
    //   db.close();
    // });
  });
  
  socket.on('createLocationMessage', (coords) => {
    var user = users.getUser(socket.id);

    if (user) {
      io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));  
    }
  });

  socket.on('disconnect', () => {
    var user = users.removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
