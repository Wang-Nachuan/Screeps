/* Name: process.js
   Function: 
   - Store everything about a process
   - Provide relavent API
*/

const Task = require('./task');
const C = require('./constant');

class Process {

    constructor (token, type, room, dep) {
        this.token = token;     // (Num) Token of the process
        this.type = type;       // (String) Type of process
        this.room = room;       // (String) Room that process take place, null if trivial or interroom
        this.dep = dep;         // (List of num) Number of tasks remain to finish before proposing this task
    }

    /* Start a process
       Input: agent name, process object
       Return: none
    */
    static start(queue, process, funcList) {
        var find_flage = false;
        var header = process.token;

        // Add task to the queue
        for (var i in queue) {
            if (queue[i] == null) {
                process.token |= (i << 8);
                queue[i] = process;
                find_flage = true;
            }
        }
        if (!find_flage) {
            process.token |= (queue.length << 8);
            queue.push(process);
        }
        
        // Execute all functions that have no predecessor
        for (var i in process.dep) {
            if (process.dep[i] == 0) {
                funcList[i].func(process.room, header);
            }
        }
    }

    /* End a process
       Input: agent name, process token
       Return: none
    */
    static end(queue, token) {
        var idx = (token & 0x0F00) >>> 8;
        if (idx == queue.length - 1) {
            queue.pop();
        } else {
            queue[idx] = null;
        }
    }

    /* Promote the execution a process
       Input: process object, function lists, index of function
       Return: false if process is not found
    */
    static promote(process, funcList, token) {
        var idx = token & 0x00FF;
        var header = token & 0xFF00;

        console.log('[0]', idx, header);

        // Update dependence list
        for (var i of funcList[idx].dep) {
            console.log('[1]', i)
            process.dep[i] -= 1;
            if (process.dep[i] == 0) {
                funcList[i].func(process.room, header);
            }
        }
    }
}

module.exports = Process;