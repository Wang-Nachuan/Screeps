var Plato = require('./kernelPlato');
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
            this.setSpawnReq(C.WORKER, [WORK, CARRY, MOVE, MOVE, MOVE]);
            this.setSpawnReq(C.WORKER, [WORK, CARRY, MOVE, MOVE, MOVE]);
        }
    }


    /* Function:
       Input
       - : 
       - : 
       Return
       - 
    */

}



// Task 2:

module.exports = Demeter;