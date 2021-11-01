const Plato = require('./root_plato');
const Demeter = require('./agent_demeter');
const taskList_worker = require('./taskList_worker');
const taskList_spawn = require('./taskList_spawn');


// Memory initialization (order matters)
Memory.initFlag = 0;
Plato.init();
Demeter.init();

// Main loop
module.exports.loop = function () {

    Plato.assignTask();
    Demeter.educate();

}