require('./mount')();
require('./memory')();
const update = require('./update');
const Plato = require('./plato');
const Euclid = require('./agent.euclid');
const Demeter = require('./agent.demeter');

// Main loop (order matters)
module.exports.loop = function () {
    update();
    // Decision-making stage
    Demeter.wrapper();
    // Execution statge
    Euclid.wrapper();
}