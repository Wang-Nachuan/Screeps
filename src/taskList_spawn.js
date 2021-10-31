var TaskHandler = require('./assist_taskHandler');
const C = require("./assist_constant");

/*-----------------------------------Tasks-----------------------------------*/

/* Task 0 - creat a creep, highest priority
   Type: spawn
   Tag: Event & Emergency
   Phase: 1
   Additional input:
        Para[0] - body
        Para[1] - name
*/
function task0_handler_0(spawn, para) {
    spawn.spawnCreep(para[0], para[1]);
    Memory.workerList.push(para[1]);
}
function task0_check_0() {
    return true;
}
function task0_end() {
    return null;
}
var task0_creatCreepI = new TaskHandler([task0_handler_0], [task0_check_0], task0_end);

/*-----------------------------Export Task List------------------------------*/

var taskList_spawn = [
    task0_creatCreepI,
];

module.exports = taskList_spawn;
