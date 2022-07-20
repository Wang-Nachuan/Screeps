const C = require('./constant');

module.exports = function () {
    _.assign(Creep.prototype, methodExtension);
    for (var setField of fieldExtension) {
        setField;
    }
}

// Method extension
const methodExtension = {
    // F1
    // f1() { 
    //     // Code...
    // },
}

// Field extention
const fieldExtension = [
    
    // isBusy
    Object.defineProperty(Creep.prototype, 'isBusy', 
        {
            get: function() {
                // If no value in this tick, search in memory
                if (!this._isBusy) {
                    // If no value in value, set to defualt false
                    if (!this.memory.isBusy) {
                        this.memory.isBusy = false;
                    }
                    this._isBusy = this.memory.isBusy;
                }
                return this._isBusy;
            },
            set: function(newValue) {
                this.memory.isBusy = newValue;
                this._isBusy = newValue;
            },
            enumerable: false,
            configurable: true
        }
    ),

    // role
    Object.defineProperty(Creep.prototype, 'role', 
        {
            get: function() {
                if (!this._role) {
                    if (!this.memory.role) {
                        this.memory.role = null;
                    }
                    this._role = this.memory.role;
                }
                return this._role;
            },
            set: function(newValue) {
                this.memory.role = newValue;
                this._role = newValue;
            },
            enumerable: false,
            configurable: true
        }
    ),

    // taskCursor
    Object.defineProperty(Creep.prototype, 'taskCursor', 
        {
            get: function() {
                if (!this._taskCursor) {
                    if (!this.memory.taskCursor) {
                        this.memory.taskCursor = null;
                    }
                    this._taskCursor = this.memory.taskCursor;
                }
                return this._taskCursor;
            },
            set: function(newValue) {
                this.memory.taskCursor = newValue;
                this._taskCursor = newValue;
            },
            enumerable: false,
            configurable: true
        }
    ),

    // bodyCount
    Object.defineProperty(Creep.prototype, 'bodyCount', 
        {
            get: function() {
                if (!this._bodyCount) {
                    if (!this.memory.bodyCount) {
                        // Count body parts of the creep
                        var count = {move: 0, work: 0, carry: 0, attack: 0, rangedAttack: 0, heal: 0, claim: 0, tough: 0};
                        for (var part of this.body) {
                            switch (part.type) {
                                case MOVE:
                                    count.move += 1;
                                    break;
                                case WORK:
                                    count.work += 1;
                                    break;
                                case CARRY:
                                    count.carry += 1;
                                    break;
                                case ATTACK:
                                    count.attack += 1;
                                    break;
                                case RANGED_ATTACK:
                                    count.rangedAttack += 1;
                                    break;
                                case HEAL:
                                    count.heal += 1;
                                    break;
                                case CLAIM:
                                    count.claim += 1;
                                    break;
                                case TOUGH:
                                    count.tough += 1;
                                    break;
                            }
                        }
                        this.memory.bodyCount = count;
                    }
                    this._bodyCount = this.memory.bodyCount;
                }
                return this._bodyCount;
            },
            set: function(newValue) {
                this.memory.bodyCount = newValue;
                this._bodyCount = newValue;
            },
            enumerable: false,
            configurable: true
        }
    ),

    // Process
    Object.defineProperty(Creep.prototype, 'process', 
        {
            get: function() {
                if (!this._process) {
                    if (!this.memory.process) {
                        this.memory.process = null;
                    }
                    this._process = this.memory.process;
                }
                return this._process;
            },
            set: function(newValue) {
                this.memory.process = newValue;
                this._process = newValue;
            },
            enumerable: false,
            configurable: true
        }
    ),

    // lastTickEn
    Object.defineProperty(Creep.prototype, 'lastTickEn', 
        {
            get: function() {
                if (!this._lastTickEn) {
                    if (!this.memory.lastTickEn) {
                        this.memory.lastTickEn = 0;
                    }
                    this._lastTickEn = this.memory.lastTickEn;
                }
                return this._lastTickEn;
            },
            set: function(newValue) {
                this.memory.lastTickEn = newValue;
                this._lastTickEn = newValue;
            },
            enumerable: false,
            configurable: true
        }
    ),

    // State
    Object.defineProperty(Creep.prototype, 'state', 
        {
            get: function() {
                if (!this._state) {
                    if (!this.memory.state) {
                        this.memory.state = C.CREEP_STATE_NONE;
                    }
                    this._state = this.memory.state;
                }
                return this._state;
            },
            set: function(newValue) {
                this.memory.state = newValue;
                this._state = newValue;
            },
            enumerable: false,
            configurable: true
        }
    ),

    // // name
    // Object.defineProperty(Creep.prototype, 'name', 
    //     {
    //         get: function() {
    //             if (!this._name) {
    //                 if (!this.memory.name) {
    //                     this.memory.name = /* defualt value */;
    //                 }
    //                 this._name = this.memory.name;
    //             }
    //             return this._name;
    //         },
    //         set: function(newValue) {
    //             this.memory.name = newValue;
    //             this._name = newValue;
    //         },
    //         enumerable: false,
    //         configurable: true
    //     }
    // ),
]