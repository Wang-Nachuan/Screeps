var Archive = require('./l0_archive');
var Plato = require('./l1_plato');
const C = require("./constant");

// Main loop
module.exports.loop = function () {

    var archive = new Archive();
    var plato = new Plato();

    console.log(plato.taskQueue);

}