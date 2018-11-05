var socket = io.connect('http://192.168.100.14:3000');
function submit(){
  alert('Cannot access');
}
/*-------------------------
          DESIGN UI
--------------------------*/
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
/*-------------------------
      OPEN CONNECTION
--------------------------*/
socket.on('connect', function () {
  var params = jQuery.deparam(window.location.search);
  socket.emit('join', params, function (err) {
    if (err) {
      alert(err);
      window.location.href = '/';
    } else {
      console.log('No error');
    }   
    console.log('Hello to chat app');
  });  
});
/*------------SEND FILE METHOD----------------*/
  function handleSendFile(e){
    var data=e.target.files[0];
    var reader=new FileReader();
    reader.onload=function(evt){
      socket.emit('user image',evt.target.result);
      console.log(evt.target.result);
    };
    reader.readAsDataURL(data);
  };
  document.getElementById('imagefile').addEventListener('change',handleSendFile,false);
/*-------------------------
    DISCONNECTION
--------------------------*/
socket.on('disconnect', function () {
  console.log('Disconnected from server');
});
/*-------------------------
    GET LIST USER
--------------------------*/
socket.on('updateUserList', function (users) {
  var ol = jQuery('<ol></ol>');

  users.forEach(function (user) {
    ol.append(jQuery('<li></li>').text(user));
  });
  jQuery('#users').html(ol);
});
/*---------------------------------
      GET AND SEND MESSAGE METHOD
----------------------------------*/
socket.on('newMessage', function (message) {
  //var formattedTime = moment(message.createdAt).format('h:mm a');
  var template = jQuery('#message-template').html();
  var html = Mustache.render(template, {
    text: message.text,
    from: message.from
  });
  jQuery('#messages').append(html);
  scrollToBottom();
});
/*---------------------------------
      GET AND SEND FILE METHOD
----------------------------------*/
socket.on('user image', function (message) {
  var template = jQuery('#data-template').html();
  var html = Mustache.render(template, {
    data: message.data,
    from: message.from
  });
  jQuery('#messages').append(html);
  scrollToBottom();
});
/*---------------------------------
        DESIGN UI MESSAGE
----------------------------------*/
jQuery('#message-form').on('submit', function (e) {
  e.preventDefault();
  var messageTextbox = jQuery('[name=message]');
  socket.emit('createMessage', {
    text: messageTextbox.val()
  }, function () {
    messageTextbox.val('')
  });
});
