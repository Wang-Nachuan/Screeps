const Plato = require('./root_plato');
const Demeter = require('./agent_demeter');
const taskList_worker = require('./taskList_worker');
const taskList_spawn = require('./taskList_spawn');


// Memory initialization (order matters)
Memory.initFlag = 0;
Plato.init();
Demeter.init();

var count = 0;

// Main loop
module.exports.loop = function () {
    
    var idx0 = 3;
    var idx1 = 3;
    

    if (count == 0) {
        Demeter.test();
        count += 1;
    }

    idx0 = Plato.workerTaskQueue.Fixed[0];
    idx1 = Plato.workerTaskQueue.Fixed[1];

    var i = 0;
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (i == 0) {
            taskList_worker[idx0].taskHandler[0](creep);
        } else {
            taskList_worker[idx1].taskHandler[0](creep);
        }
        i++;
    }

}