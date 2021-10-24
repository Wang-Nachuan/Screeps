var Archive = require('L0_Archive');

// Main loop
module.exports.loop = function () {
    
    var a = new Archive();

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        console.log(1);
        a.fun();
    }
}