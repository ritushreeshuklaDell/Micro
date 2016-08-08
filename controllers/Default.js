'use strict';

var url = require('url');


var Default = require('./DefaultService');


module.exports.pdiAccountsResourceIDGET = function pdiAccountsResourceIDGET (req, res, next) {
  Default.pdiAccountsResourceIDGET(req.swagger.params, res, next);
};
