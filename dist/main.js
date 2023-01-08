'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 *  Global function/constants
 */
// Ref can be either Id<_HasId> or MemRef type
global.getObjectInCache = function (isId, ref) {
    if (isId) {
        let obj = global.cache.log[ref];
        if (!obj) {
            console.log("[WARNING] Function 'getObjectInCache()': object not found in cache");
            return null;
        }
        else {
            return obj;
        }
    }
    else {
        let itr = global.cache;
        for (let key in ref) {
            itr = itr[key];
        }
        return itr;
    }
};
global.derefMem = function (ref) {
    let itr = Memory;
    for (let key of ref) {
        itr = itr[key];
    }
    return itr;
};
// Generate an unique name for creep
global.getCreepName = function (roomName, role) {
    let record = Memory.room[roomName].data.nameIdx[role];
    let idx = 0;
    while (true) {
        idx += 1;
        if (record.indexOf(idx) == -1) {
            record.push(idx);
            return roomName + '-' + role + idx.toString();
        }
    }
};

/**
 *  Prototype classes
 */
// For game objects (which have fixed memory space)
class ObjectProto {
    constructor() {
        this._isWritten = false;
    }
    // Write back latest data to memory
    writeBack() {
        if (this._isWritten) {
            this.zip();
            this._isWritten = false;
        }
    }
    ;
}
// For meta data (which does not have fixed memory space)
class DataProto {
}

class Task extends DataProto {
    constructor(isInit, opt) {
        super();
        /*----------------------- Constant ----------------------*/
        this.RET_OK = 0; // Task is being executed normally
        this.RET_FINISH = 1; // Task finishes normally
        this.RET_HALT = 2; // Task finishes abnormally
        if (isInit) {
            if (opt.owner) {
                this._ownerIsAgent = opt.owner.isAgent;
                this._ownerRef = opt.owner.ref;
                this._owner = null;
            }
            else {
                this._ownerIsAgent = false;
                this._ownerRef = null;
                this._owner = null;
            }
            this.taskId = opt.taskId;
            this.target = opt.target;
            this.data = {};
            this.child = null;
        }
        else {
            this.unzip(opt.pkg);
        }
    }
    /*-------------------- Getter/Setter --------------------*/
    get target() {
        if (!this._target && this._targetId) {
            this._target = getObjectInCache(true, this._targetId);
        }
        return this._target;
    }
    set target(tar) {
        this._targetId = (tar) ? null : tar.obj.id;
        this._target = tar;
    }
    get owner() {
        if (!this._owner && this._ownerRef) {
            this._owner = getObjectInCache(!this._ownerIsAgent, this._ownerRef);
        }
        return this._owner;
    }
    /*------------------------ Method -----------------------*/
    zip() {
        return {
            t: this.type,
            oi: this._ownerIsAgent,
            or: this._ownerRef,
            ti: this.taskId,
            i: this._targetId,
            d: this.data,
            c: (this.child == null) ? null : this.child.zip()
        };
    }
    // Note: proto task does not unzip _child
    unzip(pkg) {
        this._ownerIsAgent = pkg.oi;
        this._ownerRef = pkg.or;
        this._owner = null;
        this.taskId = pkg.ti;
        this._targetId = pkg.i;
        this._target = null;
        this.data = pkg.d;
        this.child = Tasks.buildTask(pkg.c);
    }
    // Wrapper function
    exe(creep) {
        if (this.child) {
            switch (this.child.exe(creep)) {
                case this.RET_OK: {
                    return this.RET_OK;
                }
                case this.RET_FINISH: {
                    this.child = null;
                    break;
                }
                case this.RET_HALT: {
                    this.child = null;
                    return this.RET_HALT;
                }
            }
        }
        return this.work(creep);
    }
}

class TaskMoveTo extends Task {
    constructor(isInit, opt) {
        super(isInit, opt); // Just let fields remains undefined
        this.type = 'moveTo';
        if (isInit) {
            this.data.pos = opt.pos;
            this.data.range = opt.range;
        }
    }
    work(creep) {
        // Check object
        if (!creep) {
            return this.RET_HALT;
        }
        // Check terminate condition
        let pos = new RoomPosition(this.data.pos.x, this.data.pos.y, this.data.pos.roomName);
        if (creep.pos.inRangeTo(pos, this.data.range)) {
            return this.RET_FINISH;
        }
        // Move
        creep.say('MoveTo');
        creep.moveTo(pos, { reusePath: 5 });
        return this.RET_OK;
    }
    eval(creep) {
        return -creep.pos.getRangeTo(this.data.pos);
    }
}

class TaskHarvest extends Task {
    constructor(isInit, opt) {
        super(isInit, opt);
        this.type = 'harvest';
        this.MOVE_TO_SOURCE = 0;
        this.HARVEST = 1;
        this.MOVE_TO_TARGET = 2;
        this.STORE = 3;
        if (isInit) {
            this.data.srcType = opt.srcType;
            this.data.isOC = opt.isOC;
            this.data.stage = this.MOVE_TO_SOURCE;
            if (opt.amount) {
                this.data.tarAmount = opt.amount; // Target amount
                this.data.curAmount = 0; // Finished amount
                this.data.preSt = 0; // Amount of resource stored in creep in last tick 
                this.data.isTr = false; // True if creep perform a transfer in last tick
            }
        }
    }
    work(creep) {
        // Check object
        if (!creep) {
            return this.RET_HALT;
        }
        // Check target
        if (!this.target) {
            return this.RET_HALT;
        }
        // Update process
        if (this.data.isTr) {
            this.data.isTr = false;
            this.data.curAmount += this.data.preSt - creep.store[this.data.srcType];
        }
        // Check terminate condition
        if (this.data.tarAmount) {
            if (this.data.curAmount >= this.data.tarAmount) {
                return this.RET_FINISH;
            }
        }
        // Harvest
        creep.say('Harvest');
        if (this.data.isOC) {
            // Move to target
            if (!creep.pos.inRangeTo(this.target, 0)) {
                this.child = Tasks.moveTo(null, null, this.target.pos, 0);
                return this.RET_OK;
            }
            // Keep harvesting
            creep.harvest(this.target);
        }
        else {
            switch (this.data.stage) {
                case this.MOVE_TO_SOURCE: {
                    // If half empty, go to source, otherwise go to owner first
                    if (creep.store[this.data.srcType] / creep.store.getCapacity(this.data.srcType) < 0.5) {
                        if (!creep.pos.inRangeTo(this.target, 1)) {
                            this.child = Tasks.moveTo(null, null, this.target.pos, 1);
                            return this.RET_OK;
                        }
                        this.data.stage = this.HARVEST;
                    }
                    else {
                        this.data.stage = this.MOVE_TO_TARGET;
                    }
                    break;
                }
                case this.HARVEST: {
                    if (creep.store.getFreeCapacity() > 0) {
                        creep.harvest(this.target);
                        return this.RET_OK;
                    }
                    this.data.stage = this.MOVE_TO_TARGET;
                    break;
                }
                case this.MOVE_TO_TARGET: {
                    if (!creep.pos.inRangeTo(this.owner, 1)) {
                        this.child = Tasks.moveTo(null, null, this.owner.pos, 1);
                        return this.RET_OK;
                    }
                    this.data.stage = this.STORE;
                    break;
                }
                case this.STORE: {
                    creep.transfer(this.owner, this.data.srcType);
                    this.data.stage = this.MOVE_TO_SOURCE;
                    this.data.preSt = creep.store[this.data.srcType];
                    this.data.isTr = true;
                    break;
                }
            }
            return this.RET_OK;
        }
    }
    eval(creep) {
        if (creep.store[this.data.srcType] / creep.store.getCapacity(this.data.srcType) < 0.5) {
            return -creep.pos.getRangeTo(this.target);
        }
        else {
            return -creep.pos.getRangeTo(this.owner);
        }
    }
}

class Tasks {
    /**
     *  owner: task owner, can be null
     *  taskId: unique task identifer of task publisher
     *  pos: position to move to
     *  range: range of valid area
     */
    static moveTo(owner, taskId, pos, range) {
        return new TaskMoveTo(true, { owner: owner, taskId: taskId, pos: pos, range: range });
    }
    /**
     *  owner: task owner, can be null
     *  taskId: unique task identifer of task publisher
     *  target: structure to store energy/resource
     *  srcType: type of resource
     *  isOC: true - the creep will stands on a container and harvest continuously
     */
    static harvest(owner, taskId, target, srcType, isOC, amount) {
        return new TaskHarvest(true, { owner: owner, taskId: taskId, target: target, srcType: srcType, isOC: isOC, amount: amount });
    }
    /**
     *  pkg: zipped package in memory
     */
    static buildTask(pkg) {
        switch (pkg.t) {
            case 'moveTo': {
                return new TaskMoveTo(false, { pkg: pkg });
            }
            case 'harvest': {
                return new TaskHarvest(false, { pkg: pkg });
            }
            default: {
                return null;
            }
        }
    }
}

class CreepWrapper extends ObjectProto {
    // Role must be provided at first instantiation
    constructor(isInit, id, opt) {
        super();
        this._obj = Game.getObjectById(id);
        if (isInit) { // At creation
            this.role = opt.role;
            this.task = null;
            this.writeBack();
        }
        else { // At rebuild
            this.unzip(this.mem);
        }
    }
    /*-------------------- Getter/Setter --------------------*/
    get mem() { return this._obj.memory; }
    set mem(val) { this._obj.memory = val; }
    get obj() { return this._obj; }
    set obj(val) { this._obj = val; this._isWritten = true; }
    get role() { return this._role; }
    set role(val) { this._role = val; this._isWritten = true; }
    get task() { return this._task; }
    set task(val) { this._task = val; this._isWritten = true; }
    /*------------------------ Method -----------------------*/
    zip() {
        this.mem.r = this._role;
        this.mem.t = (this._task == null) ? null : this._task.zip();
    }
    unzip(pkg) {
        this._role = pkg.r;
        this._task = Tasks.buildTask(pkg.t);
    }
    // Execute task if any
    work() {
        if (this.task) {
            let ret = this.task.exe(this.obj);
            if (ret == this.task.RET_FINISH) {
                this.task.owner.taskLog.finishTask(this.task.taskId);
                this.task = null;
            }
            else if (ret == this.task.RET_HALT) {
                this.task.owner.taskLog.haltTask(this.task.taskId);
                this.task = null;
            }
            else ;
        }
    }
    // Wrapper function
    exe() {
        // TODO: Check lifetime
        // TODO: Check hit
        this.work();
    }
}

/**
 *  Every task publisher should maintain a task log
 */
class TaskLog extends DataProto {
    constructor(isInit, pkg) {
        super();
        this.STATE_UNFINISH = 0;
        this.STATE_FINISH = 1;
        this.STATE_HALT = 2;
        if (isInit) {
            this.log = {};
        }
        else {
            this.unzip(pkg);
        }
    }
    zip() {
        return this.log;
    }
    unzip(pkg) {
        for (let id in pkg) {
            this.log[id] = pkg[id];
        }
    }
    addTask(id, data) {
        this.log[id] = {
            state: this.STATE_UNFINISH,
            data: data
        };
    }
    haltTask(id) {
        this.log[id].state = this.STATE_HALT;
    }
    finishTask(id) {
        this.log[id].state = this.STATE_FINISH;
    }
    isTaskHalt(id) {
        return this.log[id].state == this.STATE_HALT;
    }
    isTaskFinish(id) {
        return this.log[id].state == this.STATE_FINISH;
    }
    delTask(id) {
        delete this.log[id];
    }
    cleanAll() {
        this.log = {};
    }
}

class StructureWrapper extends ObjectProto {
    // Id and type must be provide at first instantiation
    constructor(isInit, ref, opt) {
        super();
        this._ref = ref;
        this._memObj = derefMem(this._ref);
        this._roomTaskFlow = null;
        if (isInit) {
            this._obj = Game.getObjectById(opt.id);
            this.taskLog = new TaskLog(true);
            this.data = {};
            this.writeBack();
        }
        else {
            this.unzip(this.mem);
        }
    }
    /*-------------------- Getter/Setter --------------------*/
    get mem() {
        if (!this._memObj) {
            this._memObj = derefMem(this._ref);
        }
        return this._memObj;
    }
    set mem(val) {
        if (!this._memObj) {
            this._memObj = derefMem(this._ref);
        }
        this._memObj = val;
    }
    get obj() { return this._obj; }
    get taskLog() { return this._taskLog; }
    set taskLog(val) { this._taskLog = val; this._isWritten = true; }
    get data() { return this._data; }
    set data(val) { this._data = val; this._isWritten = true; }
    get roomTaskFlow() {
        if (!this._roomTaskFlow) {
            this._roomTaskFlow = getObjectInCache(false, this._ref.slice(0, -2)).taskFlow;
        }
        return this._roomTaskFlow;
    }
    /*------------------------ Method -----------------------*/
    zip() {
        this.mem.i = this._obj.id,
            this.mem.t = this._taskLog.zip(),
            this.mem.d = this._data;
    }
    unzip(pkg) {
        this._obj = Game.getObjectById(pkg.i);
        this._taskLog = new TaskLog(false, pkg.t);
        this._data = pkg.d;
    }
    // Check hit, publish task if necessary
    checkHit() { }
    // Do work, publish task if necessary
    work() { }
    // Wrapper function
    exe() {
        this.checkHit();
        this.work();
    }
}

class SpawnWrapper extends StructureWrapper {
    constructor(isInit, ref, opt) {
        super(isInit, ref, opt);
        if (isInit) {
            this.data.queue = (Array);
            this.data.rTime = 0; // Remaining time to finish all spawn request
            this.data.curReq = null;
        }
    }
    addSpawnReq(role, body) {
        let time = 0;
        let energy = 0;
        for (let i in body) {
            time += body[i] * 3;
            switch (i) {
                case MOVE: {
                    energy += body[i] * 50;
                    break;
                }
                case WORK: {
                    energy += body[i] * 100;
                    break;
                }
                case CARRY: {
                    energy += body[i] * 50;
                    break;
                }
                case ATTACK: {
                    energy += body[i] * 80;
                    break;
                }
                case RANGED_ATTACK: {
                    energy += body[i] * 150;
                    break;
                }
                case HEAL: {
                    energy += body[i] * 250;
                    break;
                }
                case CLAIM: {
                    energy += body[i] * 600;
                    break;
                }
                case TOUGH: {
                    energy += body[i] * 10;
                    break;
                }
            }
        }
        this.data.queue.push({ n: null, r: role, b: body, ti: time, e: energy });
        this.data.rTime += time;
    }
    spawn(req) {
        let body = [];
        for (let bodyType of [TOUGH, CARRY, WORK, ATTACK, RANGED_ATTACK, HEAL, CLAIM, MOVE]) {
            if (req.b[bodyType]) {
                for (let i = 0; i < req.b[bodyType]; i++) {
                    body.push(bodyType);
                }
            }
        }
        return this.obj.spawnCreep(body, req.n);
    }
    work() {
        if (this.taskLog.log['harvest']) {
            if (this.taskLog.isTaskHalt('harvest') || this.taskLog.isTaskFinish('harvest')) {
                this.taskLog.delTask('harvest');
            }
        }
        else {
            // Require energy
            let free = this.obj.store.getFreeCapacity();
            if (free > 0) {
                let taskId = 'harvest';
                let task = Tasks.harvest({ isAgent: false, ref: this.obj.id }, taskId, this.obj.room.find(FIND_SOURCES)[0], RESOURCE_ENERGY, false, free);
                this.taskLog.addTask(taskId, null);
                this.roomTaskFlow['worker'].pubTask(task);
            }
        }
        if (!this.obj.spawning) {
            // Record the spawned creep
            if (this.data.curReq) {
                let creep = Game.creeps[this.data.curReq.n];
                this.roomTaskFlow[this.data.curReq.r].addReceiver(new CreepWrapper(true, creep.id, { role: this.data.curReq.r }));
                this.data.rTime -= this.data.curReq.ti;
                this.data.curReq = null;
            }
            // Spawn a creep
            let idx = -1;
            for (let i = 0; i < this.data.queue.length; i++) {
                let req = this.data.queue.length[i];
                if (req.e > this.obj.room.energyAvailable) {
                    continue;
                }
                req.n = getCreepName(this.obj.room.name, req.r);
                this.spawn(req);
                this.data.curReq = req;
                idx = i;
                break;
            }
            // Delete request in the queue
            if (idx != -1) {
                this.data.queue.splice(idx, 1);
            }
        }
    }
}

class Structs {
    static createStruct(ref, obj) {
        let id = obj.id;
        let type = obj.structureType;
        switch (type) {
            case STRUCTURE_SPAWN: {
                return new SpawnWrapper(true, ref, { id: id });
            }
            default: {
                return new StructureWrapper(true, ref, { id: id });
            }
        }
    }
    static buildStruct(ref, type) {
        switch (type) {
            case STRUCTURE_SPAWN: {
                return new SpawnWrapper(false, ref);
            }
            default: {
                return new StructureWrapper(false, ref);
            }
        }
    }
}

class Agent extends ObjectProto {
    constructor(isInit, ref, roomName) {
        super();
        this.STATE_INIT = 0;
        this._ref = ref;
        this._memObj = derefMem(this._ref);
        this._taskFlow = null;
        if (isInit) {
            this._roomName = roomName;
            this.room = (roomName) ? Game.rooms[roomName] : null;
            this.taskLog = new TaskLog(true);
            this.state = this.STATE_INIT;
            this.data = {};
            this.writeBack();
        }
        else {
            this.unzip(this.mem);
        }
    }
    /*-------------------- Getter/Setter --------------------*/
    get mem() {
        if (!this._memObj) {
            this._memObj = derefMem(this._ref);
        }
        return this._memObj;
    }
    set mem(val) {
        if (!this._memObj) {
            this._memObj = derefMem(this._ref);
        }
        this._memObj = val;
    }
    get taskLog() { return this._taskLog; }
    set taskLog(val) { this._taskLog = val; this._isWritten = true; }
    get state() { return this._state; }
    set state(val) { this._state = val; this._isWritten = true; }
    get data() { return this._data; }
    set data(val) { this._data = val; this._isWritten = true; }
    get taskFlow() {
        if (!this._taskFlow) {
            this._taskFlow = getObjectInCache(false, this._ref.slice(0, -2)).taskFlow;
        }
        return this._taskFlow;
    }
    /*------------------------ Method -----------------------*/
    zip() {
        this.mem.t = this.type;
        this.mem.r = this._roomName;
        this.mem.tl = this._taskLog.zip();
        this.mem.s = this._state;
        this.mem.d = this._data;
    }
    unzip(pkg) {
        this._roomName = pkg.r;
        this.room = (pkg.r) ? Game.rooms[pkg.r] : null;
        this._taskLog = new TaskLog(false, pkg.tl);
        this._state = pkg.s;
        this._data = pkg.d;
    }
}

class AgentPraetor extends Agent {
    constructor(isInit, ref, roomName) {
        super(isInit, ref, roomName);
        this.type = 'praetor';
        this.STATE_RCL0 = 0;
        this.STATE_RCL1 = 1;
        this.STATE_RCL2 = 2;
        this.STATE_RCL3 = 3;
        this.STATE_RCL4 = 4;
        this.STATE_RCL5 = 5;
        this.STATE_RCL6 = 6;
        this.STATE_RCL7 = 7;
        this.STATE_RCL8 = 8;
        this.state = this.STATE_RCL0;
        this._spawns = null;
        if (isInit) {
            this.controller = this.room.controller;
            this.data.ctrId = this.room.controller.id;
            this.data.spawnLog = {};
        }
        else {
            this.controller = Game.getObjectById(this.data.ctrId);
        }
    }
    get spawns() {
        if (!this._spawns) {
            this._spawns = getObjectInCache(false, this._ref.slice(0, -2)).struct.spawn;
        }
        return this._spawns;
    }
    printMsg(msg) {
        console.log('[MESSAGE] Room ' + this.room.name + ' Praetor: ' + msg);
    }
    spawnCreep(role, body) {
        let idx = -1;
        let minTime = Infinity;
        for (let i = 0; i < this.spawns.length; i++) {
            if (this.spawns[i].data.rTime < minTime) {
                idx = i;
                minTime = this.spawns[i].data.rTime;
            }
        }
        if (idx != -1) {
            this.spawns[idx].addSpawnReq(role, body);
        }
    }
    exe() {
        switch (this.state) {
            case this.STATE_RCL0: {
                if (this.controller.level == 1) {
                    this.state = this.STATE_RCL1;
                    this.printMsg('RCL reaches level 1');
                }
                break;
            }
            case this.STATE_RCL1: {
                if (!this.data.spawnLog['w1']) {
                    this.data.spawnLog['w1'] = true;
                    this.spawnCreep('worker', { 'work': 1, 'move': 2, 'carry': 2 });
                }
                if (this.controller.level == 2) {
                    this.state = this.STATE_RCL2;
                    this.data.spawnLog = {};
                    this.printMsg('RCL reaches level 2');
                }
                break;
            }
            case this.STATE_RCL2: {
                if (this.controller.level == 3) {
                    this.state = this.STATE_RCL3;
                    this.data.spawnLog = {};
                    this.printMsg('RCL reaches level 3');
                }
                break;
            }
            case this.STATE_RCL3: {
                if (this.controller.level == 4) {
                    this.state = this.STATE_RCL4;
                    this.data.spawnLog = {};
                    this.printMsg('RCL reaches level 4');
                }
                break;
            }
            case this.STATE_RCL4: {
                if (this.controller.level == 5) {
                    this.state = this.STATE_RCL5;
                    this.data.spawnLog = {};
                    this.printMsg('RCL reaches level 5');
                }
                break;
            }
            case this.STATE_RCL5: {
                if (this.controller.level == 6) {
                    this.state = this.STATE_RCL6;
                    this.data.spawnLog = {};
                    this.printMsg('RCL reaches level 6');
                }
                break;
            }
            case this.STATE_RCL6: {
                if (this.controller.level == 7) {
                    this.state = this.STATE_RCL7;
                    this.data.spawnLog = {};
                    this.printMsg('RCL reaches level 7');
                }
                break;
            }
            case this.STATE_RCL7: {
                if (this.controller.level == 8) {
                    this.state = this.STATE_RCL8;
                    this.data.spawnLog = {};
                    this.printMsg('RCL reaches level 8');
                }
                break;
            }
            case this.STATE_RCL8: {
                break;
            }
        }
    }
}

class Agents {
    static praetor(ref, roomName) {
        return new AgentPraetor(true, ref, roomName);
    }
    static buildAgent(ref, type) {
        switch (type) {
            case 'praetor': {
                return new AgentPraetor(false, ref);
            }
        }
    }
}

class TaskFlow extends ObjectProto {
    constructor(isInit, ref) {
        super();
        this._ref = ref;
        this._memObj = derefMem(this._ref);
        if (isInit) {
            this.receivers = [];
            this.queue = [[], [], [], [], []];
            this.writeBack();
        }
        else {
            this.unzip(this.mem);
        }
    }
    /*-------------------- Getter/Setter --------------------*/
    get mem() {
        if (!this._memObj) {
            this._memObj = derefMem(this._ref);
        }
        return this._memObj;
    }
    set mem(val) {
        if (!this._memObj) {
            this._memObj = derefMem(this._ref);
        }
        this._memObj = val;
    }
    get ref() { return this._ref; }
    set ref(val) {
        this._ref = val;
        this._isWritten = true;
        this._memObj = derefMem(this._ref);
    }
    get receivers() { return this._receivers; }
    set receivers(val) { this._receivers = val; this._isWritten = true; }
    get queue() { return this._queue; }
    set queue(val) { this._queue = val; this._isWritten = true; }
    /*------------------------ Method -----------------------*/
    zip() {
        for (let receivers of this._receivers) {
            this.mem.r.push(receivers.obj.id);
        }
        for (let i of this._queue) {
            let temp = [];
            for (let task of i) {
                temp.push(task.zip());
            }
            this.mem.q.push(temp);
        }
    }
    unzip(pkg) {
        this._receivers = [];
        this._queue = [[], [], [], [], []];
        for (let id of pkg.r) {
            this._receivers.push(getObjectInCache(true, id));
        }
        for (let i in pkg.q) {
            for (let t of pkg.q[i]) {
                this._queue[i].push(Tasks.buildTask(t));
            }
        }
    }
    // Addd a receiver to the poor
    addReceiver(receiver) {
        this.receivers.push(receiver);
    }
    // Publish a task with a priority in 0-4 (smaller means higher)
    pubTask(task, prio) {
        this.queue[prio].push(task);
    }
    // Issue all tasks
    issue() {
        for (let prio = 0; prio < 5; prio++) {
            while (this.queue[prio][0]) {
                let maxEval = -Infinity;
                let idx = -1;
                for (let i = 0; i < this.receivers.length; i++) {
                    if (!this.receivers[i].task) {
                        let temp = this.queue[prio][0].eval(this.receivers[i]);
                        if (temp > maxEval) {
                            maxEval = temp;
                            idx = i;
                        }
                    }
                }
                if (idx == -1) {
                    return;
                }
                else {
                    this.receivers[idx].task = this.queue[prio].shift();
                }
            }
        }
    }
    // Wrapper function
    exe() {
        this.issue();
        for (let rec of this.receivers) {
            rec.exe();
        }
    }
}

/**
 * Caching data in global memory
 */
class Cache {
    constructor() {
        this.log = {};
        this.global = {
            struct: getStructureTypes(),
            agent: {},
            taskFlow: {}
        };
        this.room = {};
        // First initialize objects that have ID
        // All Sreeps
        for (let creepName in Game.creeps) {
            let creep = new CreepWrapper(false, Game.creeps[creepName].id);
            this.log[creep.obj.id] = creep;
        }
        // Global structures
        for (let type in Memory.global.struct) {
            for (let idx in Memory.global.struct[type]) {
                let struct = Structs.buildStruct(['global', 'struct', type, idx], type);
                this.global.struct[type].push(struct);
                this.log[struct.obj.id] = struct;
            }
        }
        // Global agents
        for (let name in Memory.global.agent) {
            this.global.agent[name] = Agents.buildAgent(['global', 'agent', name], name);
        }
        // Global taskflows
        for (let name in Memory.global.taskFlow) {
            this.global.taskFlow[name] = new TaskFlow(false, ['global', 'taskFlow', name]);
        }
        for (let roomName in Memory.room) {
            this.room[roomName] = {
                struct: getStructureTypes(),
                agent: {},
                taskFlow: {}
            };
            // Room structures
            for (let type in Memory.room[roomName].struct) {
                for (let idx in Memory.room[roomName].struct[type]) {
                    let struct = Structs.buildStruct(['room', roomName, 'struct', type, idx], type);
                    this.room[roomName].struct[type].push(struct);
                    this.log[struct.obj.id] = struct;
                }
            }
            // Room sources (TODO: need a wrapper)
            // for (let source of Memory.room[roomName].source) {
            //     this.room[roomName].source.push(Game.getObjectById(source.id))
            // }
            // Room agents
            for (let name in Memory.room[roomName].agent) {
                this.room[roomName].agent[name] = Agents.buildAgent(['room', roomName, 'agent', name], name);
            }
            // Room taskflows
            for (let name in Memory.room[roomName].taskFlow) {
                this.room[roomName].taskFlow[name] = new TaskFlow(false, ['room', roomName, 'taskFlow', name]);
            }
        }
    }
}
function getStructureTypes() {
    return {
        spawn: [], extension: [], road: [], constructedWall: [],
        rampart: [], keeperLair: [], portal: [], controller: [],
        link: [], storage: [], tower: [], observer: [], powerBank: [],
        powerSpawn: [], extractor: [], lab: [], terminal: [],
        container: [], nuker: [], factory: [], invaderCore: []
    };
}

class Mem {
    static MemInit() {
        Memory.initFlag = true;
        Memory.global = {
            struct: {
                spawn: [], extension: [], road: [], constructedWall: [],
                rampart: [], keeperLair: [], portal: [], controller: [],
                link: [], storage: [], tower: [], observer: [], powerBank: [],
                powerSpawn: [], extractor: [], lab: [], terminal: [],
                container: [], nuker: [], factory: [], invaderCore: []
            },
            agent: {},
            taskFlow: {}
        };
        delete Memory.creeps;
        delete Memory.spawns;
        delete Memory.rooms;
        delete Memory.flags;
        Memory.room = {};
        for (let roomName in Game.rooms) {
            this.RoomMemInit(roomName, true);
        }
    }
    static RoomMemInit(roomName, isColonyCenter) {
        Memory.room[roomName] = {
            struct: {
                spawn: [], extension: [], road: [], constructedWall: [],
                rampart: [], keeperLair: [], portal: [], controller: [],
                link: [], storage: [], tower: [], observer: [], powerBank: [],
                powerSpawn: [], extractor: [], lab: [], terminal: [],
                container: [], nuker: [], factory: [], invaderCore: []
            },
            source: [],
            agent: {},
            taskFlow: {
                harvester: { r: [], q: [] },
                worker: { r: [], q: [] },
                transporter: { r: [], q: [] },
                attacker: { r: [], q: [] },
                healer: { r: [], q: [] }
            },
            data: {
                nameIdx: {
                    harvester: [],
                    worker: [],
                    transporter: [],
                    attacker: [],
                    healer: []
                }
            }
        };
        let roomMem = Memory.room[roomName];
        let room = Game.rooms[roomName];
        // Structures
        for (let struct of room.find(FIND_MY_STRUCTURES)) {
            roomMem.struct[struct.structureType].push({});
            Structs.createStruct(['room', roomName, 'struct', struct.structureType, roomMem.struct[struct.structureType].length - 1], struct);
        }
        // Sources
        for (let source of room.find(FIND_SOURCES)) {
            roomMem.source.push({ id: source.id, attach: 0 });
        }
        // Agents
        if (isColonyCenter) {
            roomMem.agent['praetor'] = { t: null, r: null, tl: null, s: null, d: {} };
            Agents.praetor(['room', roomName, 'agent', 'praetor'], roomName);
            new TaskFlow(true, ['room', roomName, 'taskFlow', 'harvester']);
            new TaskFlow(true, ['room', roomName, 'taskFlow', 'worker']);
            new TaskFlow(true, ['room', roomName, 'taskFlow', 'transporter']);
            new TaskFlow(true, ['room', roomName, 'taskFlow', 'attacker']);
            new TaskFlow(true, ['room', roomName, 'taskFlow', 'healer']);
        }
    }
}

// export const loop = errorMapper(() => {
//     let testObj: Zoo = new Zoo(['dog', 'cat'], ['doggy', 'catty'])
//     console.log(testObj);
// }, true)
const loop = function () {
    // Initialize memory
    if (!Memory.initFlag) {
        Mem.MemInit();
        console.log('[MESSAGE] Memory initialized');
        // Memory.test = [];
    }
    // Caching
    if (!global.cache) {
        global.cache = new Cache();
        console.log('[MESSAGE] Global reset');
    }
};

exports.loop = loop;
//# sourceMappingURL=main.js.map
