var TaskHandler = require('./taskHandler');
var TaskStamp = require('./taskStamp');
const C = require("./constant");

/*-----------------------------------Tasks-----------------------------------*/

/* Task 0 - test task
   Type: real-time
   Phase: 3
*/
var task0_moveList = [
    function(creep, para) {console.log("[Test] task 0 : move 0"); return 0;},
    function(creep, para) {console.log("[Test] task 0 : move 1"); return 0;},
    function(creep, para) {console.log("[Test] task 0 : move 2"); return 0;}
];
var task0_actionList = [
    function(creep, para) {console.log("[Test] task 0 : action 0"); return [C.TASKHANDLER_ACTION_RET_FLG_FINISH, 1];},
    function(creep, para) {console.log("[Test] task 0 : action 1"); return [C.TASKHANDLER_ACTION_RET_FLG_FINISH, 2];},
    function(creep, para) {console.log("[Test] task 0 : action 2"); return [C.TASKHANDLER_ACTION_RET_FLG_FINISH, 0];}
];
var task0_endList = [
    function(creep, para) {console.log("[Test] task 0 : end 0");},
    function(creep, para) {console.log("[Test] task 0 : end 1");},
    function(creep, para) {console.log("[Test] task 0 : end 2");}
];
var task0_test = new TaskHandler(task0_moveList, task0_actionList, task0_endList);

/* Task 1 - harvest energy
   Type: 
   Phase: n
*/
// var taski_moveList = [];
// var taski_actionList = [];
// var taski_endList = [];
// var taski_name = new TaskHandler(taski_moveList, taski_actionList, taski_endList);
// var task0_stamp = new TaskStamp();




/* Task i - *name*
   Type: 
   Phase: n
*/
var taski_moveList = [];
var taski_actionList = [];
var taski_endList = [];
var taski_name = new TaskHandler(taski_moveList, taski_actionList, taski_endList);
var taski_stamp = new TaskStamp();

/*-----------------------------Export Task List------------------------------*/

var taskList_worker = [
    task0_test
    // task1_harvEnergy,
    // task2_upgradeRoom,
];

module.exports = taskList_worker;

