const Plato = require('./plato');
const TaskStamp = require('./taskStamp');
const WorkerTasks = require('./tasks_worker');
const C = require("./constant");

const TIME_LINE = [];
const TIME_LINE_LEN = TIME_LINE.length;

class Demeter extends Plato {

    static init() {
        // Initialize memory when run constructor at the first time
        if (Memory.initFlag == 1) {

            Memory.agents.Demeter = {
                timelineCursor: 0
            }
                
        }
    }

    /* Function: routine function that run at the begining of each tick
       Input: none 
       Return: none
    */
    static routine() {
        if (Memory.agents.Demeter.timelineCursor == 0) {
            Memory.agents.Demeter.timelineCursor += 1;
            this.setTask(WorkerTasks.spawn(C.WORKER, [WORK, CARRY, MOVE, MOVE, MOVE]), 2);
            this.setTask(WorkerTasks.spawn(C.WORKER, [WORK, CARRY, MOVE, MOVE, MOVE]), 2);
        }
        if (Memory.agents.Demeter.timelineCursor == 1) {
            Memory.agents.Demeter.timelineCursor += 1;
            this.setTask(WorkerTasks.harvestEnergy(Game.spawns['Spawn0'].id), 0);
            this.setTask(WorkerTasks.upgradeController(), 1);
            this.setTask(WorkerTasks.upgradeController(), 1);
        }
        if (Memory.agents.Demeter.timelineCursor == 2) {
            Memory.agents.Demeter.timelineCursor += 1;
        }
    }


    /* Function:
       Input
       - : 
       - : 
       Return
       - 
    */
    
    /*------------------------------ Shortcuts for creating taskStamp ------------------------------*/

   

}

module.exports = Demeter;