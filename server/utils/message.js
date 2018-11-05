/*------------------------------
        MESSAGE MODEL
------------------------------*/
var moment = require('moment');
const mongoose=require('mongoose');
Schema = mongoose.Schema;
var generateMessage = (from, text) => {
  return {
    from,
    text
  };
};
var generateData = (from, data) => {
  return {
    from,
    data
  };
};

module.exports = {generateMessage, generateData};
