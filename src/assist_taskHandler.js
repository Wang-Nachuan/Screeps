class TaskHandler {

    constructor(taskExecute, taskCheck, taskEnd) {
        this.taskExecute = taskExecute;     // (function reference list) Functions of the task phases
        this.taskCheck = taskCheck;         // (function reference list) Functions that check the end of task phases (jump if true)
        this.taskEnd = taskEnd;             // (function reference) Function to be perform right after task is finished
    }
}

module.exports = TaskHandler;