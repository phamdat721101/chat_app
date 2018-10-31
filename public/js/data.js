var socket = io();
//const MongoClient=require('mongodb').MongoClient;
function submit(){
  // var password=document.getElementById('password').value;
  // if(password=="bin1009"){
  //   window.location="chat.html";
  // }
  alert('Cannot access');
}
function scrollToBottom () {
  // Selectors
  var messages = jQuery('#messages');
  var newMessage = messages.children('li:last-child')
  // Heights
  var clientHeight = messages.prop('clientHeight');
  var scrollTop = messages.prop('scrollTop');
  var scrollHeight = messages.prop('scrollHeight');
  var newMessageHeight = newMessage.innerHeight();
  var lastMessageHeight = newMessage.prev().innerHeight();

  if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
    messages.scrollTop(scrollHeight);
  }
}

socket.on('connect', function () {
  // var delivery = new Delivery(socket);
 
  //   delivery.on('delivery.connect',function(delivery){
  //     $("input[type=submit]").click(function(evt){
  //       var file = $("input[type=file]")[0].files[0];
  //       var extraParams = {foo: 'bar'};
  //       delivery.send(file, extraParams);
  //       evt.preventDefault();
  //     });
  //   });
 
  //   delivery.on('send.success',function(fileUID){
  //     console.log("file was successfully sent.");
  //   });
  var params = jQuery.deparam(window.location.search);

  socket.emit('join', params, function (err) {
    if (err) {
      alert(err);
      window.location.href = '/';
    } else {
      console.log('No error');
    }
    
  });
  
});
//   function handleSendFile(e){
//     var data=e.target.files[0];
//     var reader=new FileReader();
//     reader.onload=function(evt){
//       //  var span = document.getElementById('lines');
//       //  span.innerHTML = ['<img src="', evt.target.result,
//       //                    '" title="', escape(evt.name), '" height="300" width="300"/><br>'].join('');
//       socket.emit('user image',evt.target.result);
//       console.log(evt.target.result);
//     };
//     reader.readAsDataURL(data);
//   };
//   document.getElementById('imagefile').addEventListener('change',handleSendFile,false);
  // socket.on('user image',function(message){
  //   console.log(message);
  //   var list=[];
  //   list.push(message);
  //   var span = document.getElementById('lines');
    
  //   for(var i=0; i<list.length; i++){
  //     span.innerHTML+=['<img class="thumb" src="', list[i],
  //                      '" height="300" width="300" /><br>'].join('');
  //     //scrollToBottom();
  //   }
    
  // });
socket.on('disconnect', function () {
  console.log('Disconnected from server');
});

// socket.on('updateUserList', function (users) {
//   var ol = jQuery('<ol></ol>');

//   users.forEach(function (user) {
//     ol.append(jQuery('<li></li>').text(user));
//   });

//   jQuery('#users').html(ol);
// });

// socket.on('newMessage', function (message) {
//   //var formattedTime = moment(message.createdAt).format('h:mm a');
//   var template = jQuery('#message-template').html();
//   var html = Mustache.render(template, {
//     text: message.text,
//     from: message.from
//   });

//   jQuery('#messages').append(html);
//   scrollToBottom();
// });
socket.on('user image', function (message) {
  //var formattedTime = moment(message.createdAt).format('h:mm a');
  var template = jQuery('#data-template').html();
  var html = Mustache.render(template, {
    data: message.data,
    from: message.from
  });

  jQuery('#messages').append(html);
  scrollToBottom();
});
// socket.on('newLocationMessage', function (message) {
//   var formattedTime = moment(message.createdAt).format('h:mm a');
//   var template = jQuery('#location-message-template').html();
//   var html = Mustache.render(template, {
//     from: message.from,
//     url: message.url,
//     createdAt: formattedTime
//   });

//   jQuery('#messages').append(html);
//   scrollToBottom();
// });

// jQuery('#message-form').on('submit', function (e) {
//   e.preventDefault();

//   var messageTextbox = jQuery('[name=message]');

//   socket.emit('createMessage', {
//     text: messageTextbox.val()
//   }, function () {
//     messageTextbox.val('')
//   });
// });

// var locationButton = jQuery('#send-location');
// locationButton.on('click', function () {
//   if (!navigator.geolocation) {
//     return alert('Geolocation not supported by your browser.');
//   }

//   locationButton.attr('disabled', 'disabled').text('Sending location...');

//   navigator.geolocation.getCurrentPosition(function (position) {
//     locationButton.removeAttr('disabled').text('Send location');
//     socket.emit('createLocationMessage', {
//       latitude: position.coords.latitude,
//       longitude: position.coords.longitude
//     });
//   }, function () {
//     locationButton.removeAttr('disabled').text('Send location');
//     alert('Unable to fetch location.');
//   });
// });

// function image (from, base64Image) {
//   $('#lines').append($('<p>').append($('<b>').text(from), '<img src="' + base64Image + '"/>'));
// }
// $(function(){
//   $('#imagefile').bind('change', function(e){
//     var data = e.originalEvent.target.files[0];
//     var reader = new FileReader();
//     reader.onload = function(evt){
//       image('me', evt.target.result);
//       socket.emit('user image', evt.target.result);
//     };
//     reader.readAsDataURL(data);
    
//   });
// });