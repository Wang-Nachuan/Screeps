
const C = require("./constant");
module.exports = Task;

class Task {

    constructor(type, numNodes, nodes, modulePath, func_st, para_st, func_op, para_op, func_br, para_br) {
        // Set when created
        this.type = type;                   // (Const) Type of performer
        this.numNodes = numNodes;           // (num) Number of nodes
        this.nodes = nodes;                 // (List of Node) [Node0, Node1, ...]
        this.modulePath = modulePath;       // (String) Module that contain desired operations
        this.function = {
            st: func_st,                    // (String) Key of branch function
            op: func_op,                    // (List of string) [OpKey0, OpKey1, ...], key of operation to each node
            br: func_br                     // (List of string) [BrKey0, BrKey1, ...], key of branch function at each node
        }
        this.para = {
            st: para_st,                    // (List) [StInput0, StInput1, ...]
            mv: para_mv,                    // (List) [Range0, Range1, ...], acceptable range to node
            op: para_op,                    // (List of list) [[OpInput00, OpInput01, ...], [OpInput10, OpInput11, ...], ...]
            br: para_br,                    // (List of list) [[BrInput00, BrInput01, ...], [BrInput10, BrInput11, ...], ...]
        };
        // Set later
        this.cursor = null;                 // (Num) Index of current target node
        this.ownerId = null;                // (String) Id of task owner
        this.state = C.TASK_STATE_INACTIVE; // (Const) State of task
        this.isMoving = false;              // (boolean) True if creep is moving to the node
    }

    /* Set the owner of task, execute the start function
       Input: task, creep object
       Return: none
    */
    static setOwner(task, creep) {
        task.ownerId = creep.id;
        var module = Game.getModule(task.modulePath);
        task.cursor = module[task.function.st](creep, task.nodes[0].id, this.para.st);
        task.state = C.TASK_STATE_ACTIVE;
        task.isMoving = true;
    }

    /* Optimized moving function for creep
       Input: creep object, RoomPosition object, range of stop
       Return: true if still moving, false if reached the position
    */
   static moveTo(creep, pos, range) {
        if (creep.inRangeTo(pos, range)) {
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
        var module = Game.getModule(task.modulePath);
        var creep = Game.getObjectById(task.ownerId);
        var node = task.nodes[task.cursor];

        // Moving
        if (task.isMoving) {
            var pos = new RoomPosition(node.pos.x, node.pos.y, node.pos.roomName);
            task.isMoving = this.moveTo(creep, pos, task.para.mv[task.cursor]);
            if (task.isMoving) {
                return C.TASK_OP_RET_FLG_OCCUPY;
            }
        }

        // Executing operation
        var flage = module[task.function.op[task.cursor]](creep, node.id, task.para.op[task.cursor]);

        if (flage == C.TASK_OP_RET_FLG_FINISH) {
            // If current operation finishes, update cursor
            if (task.para.br[task.cursor] != null) {
                task.cursor = module[task.function.br[task.cursor]](creep, node.id, task.para.br[task.cursor]);
            } else {
                task.cursor += 1;
            }
            if (task.cursor >= task.numNodes) {
                return C.TASK_OP_RET_FLG_TERMINATE;
            } else {
                return C.TASK_OP_RET_FLG_FINISH;
            }
        } else {
            return flage;
        }
    }
}