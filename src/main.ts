import {errorMapper} from './modules/errorMapper';
import {Test} from './modules/test';

// export const loop = errorMapper(() => {
//     let testObj: Zoo = new Zoo(['dog', 'cat'], ['doggy', 'catty'])
//     console.log(testObj);
// }, true)

export const loop = function() {

    if (!Memory.flage) {
        Memory.flage = true;
        Memory.test = {t:0, pre:{i:0, f:0}};
        global.test = new Test(true, Memory.test, 0, 12345, 6);
        console.log('init');
    }
    
    // Caching
    if (!global.resetFlag) {
        global.resetFlag = true
        console.log('[Message] Global reset');
        // Rebuild cache instance
        global.test = new Test(false, Memory.test);
    }
    
    console.log('tick:', global.test.task, global.test.id, global.test.freq);
    
}