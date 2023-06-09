module.exports = function () {
    _.assign(Structure.prototype, methodExtension);
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
    Object.defineProperty(StructureSpawn.prototype, 'isBusy', 
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
    Object.defineProperty(StructureSpawn.prototype, 'role', 
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
    Object.defineProperty(StructureSpawn.prototype, 'taskCursor', 
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

    // // name
    // Object.defineProperty(Structure.prototype, 'name', 
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