require('./mount')();
require('./memory')();
const Plato = require('./plato');
const Euclid = require('./agent.euclid');
const Demeter = require('./agent.demeter');

// Main loop (order matters)
module.exports.loop = function () {
    // Decision-making stage
    Demeter.wrapper();
    // Execution statge
    Plato.wrapper();
    Euclid.wrapper();
    
}