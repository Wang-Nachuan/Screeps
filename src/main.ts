import {errorMapper} from './test/errorMapper';
import './global';

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
    if (!global.resetFlag) {
        global.resetFlag = true
        console.log('[MESSAGE] Global reset');
        /* TODO: Rebuild all objects */
    } 
}