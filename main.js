require('./mount')();
// Main loop (order matters)
module.exports.loop = function () {
    Demeter.routine();
    Plato.routine();
}

// const Plato = require('./plato');
// const Demeter = require('./agent.demeter');

// // Memory initialization (order matters)
// if (Memory.initFlag != 1) {
//     Memory.initFlag = 0;
//     Plato.init();
//     Demeter.init();
// }

// // Main loop (order matters)
// module.exports.loop = function () {
//     Demeter.routine();
//     Plato.routine();
// }