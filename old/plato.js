/* Name: plato.js
   Function: 
   - Prototype for all agents
*/

const Process = require('./class.process');
const C = require('./constant');

class Plato {

    /* Propose a task
       Input: task, priority
       Return: none
    */
    static propTask(task, prio) {
        Memory.propTaskQueue[task.type][prio].push(task);
    }

    /* Propose a spawn request
       Input: creep name, type, room to spawn, token of process, priority
       Return: none
    */
    static propSpawnReq(type, room, token, prio, body=null) {
        var energy = 0;     // Energy required to spawn the creep
        var body_real;

        if (body == null) {
            body_real = Memory.statistics.stdBody[room][type];
        } else {
            body_real = body;
        }

        // Update statistic
        Memory.statistics.creep[type] += 1;

        // Find a unique name
        var name;
        do {
            Memory.statistics.creep.nameCount = (Memory.statistics.creep.nameCount + 1) % 8000;
            name = type[0] + Memory.statistics.creep.nameCount;
        } while (Game.creeps[name] != undefined);

        // Calculate energy consumption
        for (var part of body_real) {energy += BODYPART_COST[part];}

        // Set request
        var req = {
            name: name, 
            type: type, 
            room: room, 
            body: body_real, 
            energy: energy,
            state: C.TASK_STATE_PROPOSED,
            token: token
        };
        Memory.spawnQueue.prop[prio].push(req);
    }

    /* Claim some amount of energy
       Input: room, energy
       Return: true if granted, fale otherwise
    */
    static claimEnergy(room, energy) {
        var data = Memory.statistics.energy[room];
        
        if (energy <= data.available) {
            data.available -= energy;
            data.pinned += energy;
            return true;
        } else {
            return false;
        }
    }

    /* Send message to a agent's message queue
       Input: message [token, message type, additional information (option)]
       Return: 
    */
    static sendMsg(msg) {
        // Check validity
        if (msg[0] == null) {return;}
        // Deliver message
        Memory.msgQueue[msg[0] >>> 12].push(msg);
    }

    /* Get process
       Input: token
       Return: process object
    */
    static getProcess(token) {
        var agent_idx = (token & 0xF000) >>> 12;
        var pro_idx = (token & 0x0F00) >>> 8;
        return Memory.proQueue[agent_idx][pro_idx];
    }

    /* Start a process for agent
       Input: agent header, process object, list of process functions
       Return: true if sucess, false if process number reaches limit
    */
    static propProcess(agentHeader, process, proFuncList) {
        var find_flage = false;
        var queue = Memory.proQueue[agentHeader >>> 12];
        var idx;

        // Find a position in the process queue, set token
        for (idx = 0; idx < queue.length; idx++) {
            if (queue[idx] == null) {
                var token = agentHeader | (idx << 8);
                queue[idx] = process;
                process.token = token;
                find_flage = true;
                break;
            }
        }

        // Return if the queue is full
        if (!find_flage) {return false;}

        // Run start function for the process
        Process.start(process, proFuncList);
    }

    /* Update process state in the process queue
       Input: token, list of processes
       Return: none
    */
    static promoProcess(token, proFuncList) {
        var process = this.getProcess(token);
        Process.promote(process, token, proFuncList);
    }

    /* Delete a process in the queue
       Input: token
       Return: none
    */
    static endProcess(token) {
        var agent_idx = (token & 0xF000) >>> 12;
        var pro_idx = (token & 0x0F00) >>> 8;
        Memory.proQueue[agent_idx][pro_idx] = null;
    }

    /* Monitor creep number for an agent's process
       Input: none
       Return: none
    */
    static monitorTargetNum(agentHeader) {
        var queue = Memory.proQueue[agentHeader >>> 12];

        for (var process of queue) {
            if (process == null) {continue;}
            for (var type in process.targetNum) {
                if (process.realNum[type] < process.targetNum[type]) {
                    var diff = process.targetNum[type] - process.realNum[type];
                    for (var i = 0; i < diff; i++) {
                        this.propSpawnReq(type, process.room, process.token, 1);
                    }
                    process.realNum[type] = process.targetNum[type];
                }
            }
        }
    }

    /* ...
       Input:
       Return:
    */
}

module.exports = Plato;