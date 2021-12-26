/* Name: process.js
   Function: 
   - Store everything about a process
   - Provide relavent API
*/

const Task = require('./task');
const C = require('./constant');

class Process {

    constructor (module, token, dep) {
        this.module = module;   // (String) Module that contain task generating functions
        this.token = token;     // (Num) Token of the process
        this.dep = dep;         // (List of num) Number of tasks remain to finish before proposing this task
    }
}

module.exports = Process;