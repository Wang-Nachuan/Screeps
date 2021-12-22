require("./mount")();
require("./memory")();
const Plato = require("./plato");
const Euclid = require("./agent.euclid");
const Demeter = require("./agent.demeter");

// Main loop (order matters)
module.exports.loop = function () {
    Demeter.wrapper();
    Plato.wrapper();
    Euclid.wrapper();
}