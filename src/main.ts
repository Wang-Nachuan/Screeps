import {errorMapper} from './test/errorMapper';
import './global';
import {Cache} from './cache/cache';

// export const loop = errorMapper(() => {
//     let testObj: Zoo = new Zoo(['dog', 'cat'], ['doggy', 'catty'])
//     console.log(testObj);
// }, true)

export const loop = function() {

    // Initialize memory
    if (!Memory.initFlag) {
        Memory.initFlag = true;
        /* TODO: initialize memory */
        console.log('[MESSAGE] Memory initialized');
    }
    
    // Caching
    if (!global.cache) {
        global.cache = new Cache();
        console.log('[MESSAGE] Global reset');
    } 
}