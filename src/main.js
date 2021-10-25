var Archive = require('./l0_archive');
var Plato = require('./l1_plato');
const C = require("./constant");

var archive = new Archive();
var plato = new Plato();

// Main loop
module.exports.loop = function () {

    console.log(plato.taskQueue);

}