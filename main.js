const Plato = require('./kernelPlato');
const Demeter = require('./agentDemeter');
const TaskStamp = require('./taskStamp');

// Memory initialization (order matters)
if (Memory.initFlag != 1) {
    Memory.initFlag = 0;
    Plato.init();
    Demeter.init();
}

// Main loop
module.exports.loop = function () {

    Demeter.routine();
    Plato.routine();
    // console.log(Game.creeps['Worker0'].memory.busy);
}
