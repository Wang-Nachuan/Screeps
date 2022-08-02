import {errorMapper} from './modules/errorMapper';
import {Zoo} from './modules/test';

// export const loop = errorMapper(() => {
//     let testObj: Zoo = new Zoo(['dog', 'cat'], ['doggy', 'catty'])
//     console.log(testObj);
// }, true)

export const loop = function() {
    
    // Caching
    if (!global.resetFlag) {
        global.resetFlag = true
        console.log('[Message] Global reset.')
        // Rebuild cache instance
    }
    
}