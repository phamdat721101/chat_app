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
  var count=1; 
  socket.on('join', (params, callback) => {
    if (!isRealString(params.name) || !isRealString(params.room)) {
      return callback('Name and room name are required.');
    }
    
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
      socket.join(params.room);
      users.removeUser(socket.id);
      users.addUser(socket.id, params.name, params.room);
      io.to(params.room).emit('updateUserList', users.getUserList(params.room));
      socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));     
      while(count==1){
        db.collection('Users').find().toArray(function(err,result){
          if(err){
            console.log('cannot connect to users datatable');
          }
          for(var i=0;i<result.length;i++){
            if(params.room==result[i]["room"]){
              io.to(params.room).emit('newMessage', generateMessage(result[i]["name"], result[i]["message"]));
            }
          }
        });
        db.collection('image').find().toArray(function(err,result){
          if(err){
            console.log('cannot connect to image datatable');
          }
          for(var i=0;i<result.length;i++){
            if(params.room==result[i]["room"]){
              io.to(params.room).emit('user image',generateData(result[i]["user"],result[i]["image"]));
            }    
          }
        });
        count++;
      }
      db.close();
    });
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined.`));
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
        message:message.text,
        room:user.room
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
    MongoClient.connect('mongodb://localhost:27017/TodoApp',function(err,db){
      if(err){
        console.log('Fail To Connect');
      }
      console.log('Connected to MongoDB server');
      db.collection('image').insertOne({
        user:user.name,
        image:msg,
        room:user.room
      },function(err,result){
        if(err){
          return console.log('Fail to add image');
        }
        console.log('Success to add image');
      });
      db.close();
    });
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
