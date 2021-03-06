/* Name: task.js
   Function: 
   - Store everything about a task
   - Provide relavent API
*/

const Node = require('./class.node');
const C = require('./constant');

class Task {

    constructor(type, room, energy, numNodes, nodes, module, para_mv, func_st, para_st, func_op, para_op, func_br, para_br, func_ed = null, para_ed = null, token = null) {
        // Set when created
        this.type = type;                   // (Const) Type of performer
        this.room = room;                   // (String) Which room's energy will be used, null if no energy consumption
        this.energy = energy;               // (Num) Total energy required by the task (0 for no consumption or harvesting energy from source)
        this.numNodes = numNodes;           // (Num) Number of nodes invovled
        this.nodes = nodes;                 // (List of Node) [Node0, Node1, ...]
        this.module = module;               // (String) Module that contain desired operations
        this.func = {
            st: func_st,                    // (String) Key of start function
            op: func_op,                    // (List of string) [OpKey0, OpKey1, ...], key of operation to each node
            br: func_br,                    // (List of string) [BrKey0, BrKey1, ...], key of branch function at each node, null if no branch
            ed: func_ed                     // (String) Key of end function
        }
        this.para = {
            st: para_st,                    // (List) [StInput0, StInput1, ...]
            mv: para_mv,                    // (List) [Range0, Range1, ...], acceptable range to node
            op: para_op,                    // (List of list) [[OpInput00, OpInput01, ...], [OpInput10, OpInput11, ...], ...]
            br: para_br,                    // (List of list) [[BrInput00, BrInput01, ...], [BrInput10, BrInput11, ...], ...], null if no branch
            ed: para_ed                     // (List) [EdInput0, EdInput1, ...]
        };
        this.token = token;                 // (Num) In hex format, generate a message to corresponding agent if token is specified
        // Set later
        this.cursor = null;                 // (Num) Index of current target node
        this.ownerId = null;                // (String) Id of task owner
        this.state = C.TASK_STATE_PROPOSED; // (Const) State of task
        this.isMoving = false;              // (Boolean) True if creep is moving to the node
        this.energyAcq = 0;                 // (Num) Total energy that is actually acquired by creep from structure
        this.energyStore = 0;               // (Num) Energy that is aquired from structure but not yet used
    }

    /* Find the actual starting node of task
       Input: task, creep
       Output: cursor index of staring node
    */
    static startIdx(task, creep) {
        var module = require(task.module);
        Node.concretize(task.nodes[0], creep);
        var idx = module[task.func.st](creep, task.nodes[0], task.para.st, task);
        Node.virtualize(task.nodes[0], creep);
        return idx;
    }

    /* Optimized moving function for creep
       Input: creep object, RoomPosition object, range of stop
       Return: true if still moving, false if reached the position
    */
    static moveTo(creep, pos, range) {
        if (creep.pos.inRangeTo(pos, range)) {
            return false;
        }
        creep.moveTo(pos);
        return true;
    }

    /* Execute and update a task in one tick
       Input: task object
       Return: flage
    */
    static execute(task) {
        var module = require(task.module);
        var creep = Game.getObjectById(task.ownerId);
        var node = Node.concretize(task.nodes[task.cursor], creep);

        // Checking for node validity
        if (node == null) {
            // Execute end function and terminate the task
            if (task.func.ed != null) {module[task.func.ed](creep, node, task.para.ed, task);}
            return C.TASK_OP_RET_FLG_TERMINATE;
        }

        // Moving
        if (task.isMoving) {
            var pos = Node.pos(node);
            task.isMoving = this.moveTo(creep, pos, task.para.mv[task.cursor]);
            if (task.isMoving) {
                return C.TASK_OP_RET_FLG_OCCUPY;
            }
        }

        // Executing operation
        var flage = module[task.func.op[task.cursor]](creep, node, task.para.op[task.cursor], task);

        if (flage == C.TASK_OP_RET_FLG_FINISH) {
            // If current operation finishes, update cursor
            if (task.func.br[task.cursor] != null) {
                task.cursor = module[task.func.br[task.cursor]](creep, node, task.para.br[task.cursor], task);
                task.isMoving = true;
            } else {
                task.cursor += 1;
                task.isMoving = true;
            }
            if (task.cursor >= task.numNodes) {
                Node.virtualize(node, creep);
                if (task.func.ed != null) {module[task.func.ed](creep, node, task.para.ed, task);}
                return C.TASK_OP_RET_FLG_TERMINATE;
            } else {
                Node.virtualize(node, creep);
                return C.TASK_OP_RET_FLG_FINISH;
            }
        } else if (flage == C.TASK_OP_RET_FLG_TERMINATE || flage == C.TASK_OP_RET_FLG_HALT) {
            if (task.func.ed != null) {module[task.func.ed](creep, node, task.para.ed, task);}
            return flage;
        } else {
            return flage;
        }
    }
}

module.exports = Task;