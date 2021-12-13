const Plato = require('./kernelPlato');
const Demeter = require('./agentDemeter');
const TaskStamp = require('./taskStamp');
const taskList_worker = require('./taskListWorker');
const taskList_spawn = require('./taskListSpawn');

// Memory initialization (order matters)
Memory.initFlag = 0;
Plato.init();

// Main loop
module.exports.loop = function () {

    // TaskStamp.execute(Memory.taskArray.realTime[0][0], taskList_worker);

}
