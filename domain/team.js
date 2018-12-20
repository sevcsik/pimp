"use strict";
exports.__esModule = true;
var fp_1 = require("lodash/fp");
exports.validateTeam = function (name, email) { return fp_1.includes(' ', name) && fp_1.includes('@', email); };
