var config = require('../config');
var baseUrl = 'https://app.personabilities.com/#/';
// var config = '../config';

var utils = {

  createFileId: function() {
    return "PDF" + utils.generateRandomString("0", 7);
  },
  createResultsId: function() {
    return "RE" + utils.generateRandomString("0aA", 7);
  },
  createPasswordResetId: function() {
    return "PAB" + utils.generateRandomString("0aA", 7);
  },
  generateRandomString: function(type, length) {
    var text = "";
    var options = "";
    if(type.includes('0')) options += '0123456789';
    if(type.includes('a')) options += 'abcdefghijklmnopqrstuvwxyz';
    if(type.includes('A')) options += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < length && options.length > 0; i++) {
      text += options.charAt(Math.floor(Math.random() * options.length));
    }
    return text;
  },
  createResultsLink: function(id) {
    return baseUrl + "results/" + id;
  },
  requireLogin(req, res, next) {
    if(!req.user) {
      // res.redirect(config.frontEndUrl + '/#/login')
      next();
    } else {
      next();
    }
  }
}

module.exports = utils;