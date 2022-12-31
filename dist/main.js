'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 *  Base class for all objects/controller in a room
 */
class Proto {
    constructor(mem, id, freq = 1) {
        this.id = id;
        this.freq = freq;
        this.mem = mem;
        // this.obj = Game.getObjectById(id);
        this.obj = null;
    }
    /*  Compress information to a light-weight package to store it in memory
        Input: None
        Return: Set of compressed data
    */
    zip(mem) {
        mem.i = this.id;
        mem.f = this.freq;
    }
    ;
    /*  Extract information from the package in memory, then set properties with them
        Input:
            - mem: memory reference of packaged data
        Return: None
    */
    unzip(mem) {
        this.id = mem.i;
        this.freq = mem.f;
        this.mem = mem;
        // this.obj = Game.getObjectById(mem.i);
        this.obj = null;
    }
    ;
}

class Test extends Proto {
    constructor(isNew, mem, task = 2, id = null, freq = 1) {
        super(mem, id, freq);
        if (isNew) {
            this.task = task;
            this.zip(mem);
        }
        else {
            this.unzip(mem);
        }
    }
    zip(mem) {
        mem.t = this.task;
        super.zip(mem.pre);
    }
    unzip(mem) {
        this.task = mem.t;
        super.unzip(mem.pre);
    }
    act() {
        console.log(this.task);
    }
}

// export const loop = errorMapper(() => {
//     let testObj: Zoo = new Zoo(['dog', 'cat'], ['doggy', 'catty'])
//     console.log(testObj);
// }, true)
const loop = function () {
    if (!Memory.flage) {
        Memory.flage = true;
        Memory.test = { t: 0, pre: { i: 0, f: 0 } };
        global.test = new Test(true, Memory.test, 0, 12345, 6);
        console.log('init');
    }
    // Caching
    if (!global.resetFlag) {
        global.resetFlag = true;
        console.log('[Message] Global reset');
        // Rebuild cache instance
        global.test = new Test(false, Memory.test);
    }
    console.log('tick:', global.test.task, global.test.id, global.test.freq);
};

exports.loop = loop;
//# sourceMappingURL=main.js.map
