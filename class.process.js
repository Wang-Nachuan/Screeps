/* Name: process.js
   Function: 
   - Store everything about a process
   - Provide relavent API
*/

const C = require('./constant');

class Process {

    constructor (name, room) {
        this.name = name;           // (String) Type of process
        this.room = room;           // (String) Room that process take place, null if trivial or interroom
        // Set at runtime
        this.token = null;      // (Num) Token of the process
        this.dep = null;        // (List of num) Number of tasks remain to finish before proposing this task
        this.targetNum = {};    // (Set of num) Target number of creeps
        this.realNum = {};      // (Set of num) Real number of creeps (including the number of spawn request)
    }

    /* Start a process
       Input: agent name, process object
       Return: none
    */
    static start(process, proList) {
        var funcList = proList[process.name];
        var header = process.token & 0xF000;

        // Set dependence
        var count = new Array(funcList.length).fill(0);   // Count of dependence
        for (var i = 0; i < funcList.length; i++) {
            var func_i = funcList[i];
            for (var idx of func_i.dep) {
                count[idx] += func_i.weight;
            }
        }
        process.dep = count;
        
        // Execute all functions that have no predecessor
        for (var i in process.dep) {
            if (process.dep[i] == 0) {
                funcList[i].func(process, process.room, header);
            }
        }
    }

    /* Promote the execution a process
       Input: process object, token of message
       Return: false if process is not found
    */
    static promote(process, token, proList) {
        var idx = token & 0x00FF;
        var header = token & 0xFF00;
        var funcList = proList[process.name];

        // Update dependence list
        for (var i of funcList[idx].dep) {
            process.dep[i] -= 1;
            if (process.dep[i] == 0) {
                funcList[i].func(process, process.room, header);
            }
        }
    }

    /* Set target number of one item
       Input: process, key name, target number
       Return: none
    */
    static setTarget(process, key, num) {
        if (!process.targetNum[key]) {
            process.targetNum[key] = num;
            process.realNum[key] = 0;
        } else {
            process.targetNum[key] = num;
        }
    }
}

module.exports = Process;