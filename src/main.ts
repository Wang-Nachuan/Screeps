import {errorMapper} from './test/errorMapper';
import './global';
import {Cache} from './cache/cache';
import {Mem} from './memory/mem';

// export const loop = errorMapper(() => {
//     let testObj: Zoo = new Zoo(['dog', 'cat'], ['doggy', 'catty'])
//     console.log(testObj);
// }, true)

export const loop = function() {

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

    global.cache.exe();

    global.cache.writeBack();

    console.log(Memory.room['sim'].struct.spawn[0].d.curReq);

}
