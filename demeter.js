const Plato = require('./plato');
const TaskStamp = require('./taskStamp');
const WorkerTasks = require('./tasks_worker');
const C = require("./constant");

const TIME_LINE = [];
const TIME_LINE_LEN = TIME_LINE.length;

class Demeter extends Plato {

    static get memory() {return Memory.agents.Demeter;}
    static set memory(para) {Memory.agents.Demeter = para;}

    static init() {
        // Initialize memory when run constructor at the first time
        if (Memory.initFlag == 1) {

            this.memory = {
                // ID list of ConstructionSites
                constructQueue: {
                    proposed: [],
                    scheduled: []
                },
            }
            
            // Set original task
            this.setTask(WorkerTasks.spawn(C.WORKER, [WORK, WORK, CARRY, MOVE]), 2);
            // this.setTask(WorkerTasks.spawn(C.WORKER, [WORK, CARRY, MOVE, MOVE, MOVE]), 2);
            // this.setTask(WorkerTasks.harvestEnergy(Game.spawns['Spawn0'].id), 2);
            // this.setTask(WorkerTasks.upgradeController(9), 2);
            // this.setTask(WorkerTasks.upgradeController(2), 2);
            this.setTask(WorkerTasks.buildStruct(), 0);
        }
    }

    /* Function: routine function that run at the begining of each tick
       Input: none 
       Return: none
    */
    static routine() {
        this.monitorNewConstructSite();
    }


    /* Function: monitor manually added construction sites, add them to constructQueue
       Input: none
       Return: none 
    */
    static monitorNewConstructSite() {

        // Update constructQueue
        for (var name of Memory.ownRooms) {
            var room = Game.rooms[name];
            var siteList = room.find(FIND_MY_CONSTRUCTION_SITES);
            
            for (var site of siteList) {
                if ((!this.memory.constructQueue.proposed.includes(site.id)) && (!this.memory.constructQueue.scheduled.includes(site.id))) {
                    this.memory.constructQueue.proposed.push(site.id);
                }
            }  
        }

        // Publish construction tasks
    }
    

   

}

module.exports = Demeter;