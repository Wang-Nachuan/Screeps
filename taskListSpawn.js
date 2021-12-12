var TaskHandler = require('./taskHandler');
const C = require("./constant");

/*-----------------------------------Tasks-----------------------------------*/

/* Task 0 - creat a creep, highest priority
   Type: spawn
   Tag: Event & Emergency
   Phase: 1
   Additional input:
        Para[0] - body
        Para[1] - name
        Para[2] - type of creep
*/

/*-----------------------------Export Task List------------------------------*/

var taskList_spawn = [
    // task0_creatCreepI,
];

module.exports = taskList_spawn;
