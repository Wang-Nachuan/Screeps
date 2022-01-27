require('./mount')();
const update = require('./update');
const Plato = require('./plato');
const Euclid = require('./agent.euclid');
const Demeter = require('./agent.demeter');

// Main loop (order matters)
module.exports.loop = function () {
    update();
    Demeter.wrapper();
    Euclid.wrapper();
}