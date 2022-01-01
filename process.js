/* Name: process.js
   Function: 
   - Store everything about a process
   - Provide relavent API
*/

const Task = require('./task');
const C = require('./constant');

class Process {

    constructor (module, name, room) {
        this.module = module;       // (String) Path of process module
        this.name = name;           // (String) Type of process
        this.room = room;           // (String) Room that process take place, null if trivial or interroom
        // Set at runtime
        this.token = token;     // (Num) Token of the process
        this.dep = null;        // (List of num) Number of tasks remain to finish before proposing this task
        this.targetNum = {};    // (Set of num) Target number of creeps
        this.realNum = {};      // (Set of num) Real number of creeps
    }

    /* Start a process
       Input: agent name, process object
       Return: none
    */
    static start(process) {
        var funcList = require(process.module)[process.name];
        var header = process.token & 0xF000;

        // Set dependence
        var count = new Array(funcList.length);   // Count of dependence
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
                funcList[i].func(process.room, header);
            }
        }
    }

    /* Promote the execution a process
       Input: process object, token of message
       Return: false if process is not found
    */
    static promote(process, token) {
        var idx = token & 0x00FF;
        var header = token & 0xFF00;
        var funcList = require(process.module)[process.name];

        // Update dependence list
        for (var i of funcList[idx].dep) {
            process.dep[i] -= 1;
            if (process.dep[i] == 0) {
                funcList[i].func(process, process.room, header);
            }
        }
    }
}

module.exports = Process;