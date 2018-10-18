var moment = require('moment');
const mongoose=require('mongoose');
Schema = mongoose.Schema;
var generateMessage = (from, text) => {
  return {
    from,
    text
  };
};

var generateLocationMessage = (from, latitude, longitude) => {
  return {
    from,
    url: `https://www.google.com/maps?q=${latitude},${longitude}`,
    createdAt: moment().valueOf()
  };
};

module.exports = {generateMessage, generateLocationMessage};
