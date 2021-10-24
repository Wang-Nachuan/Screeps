
var initialize = require('initialize');
var energyDisplay = require('EnergyDisplay');
var MemoryInitializeForRoom = {
    run: function (Spawner, Room, RoomName) {
        energyDisplay.display(RoomName);
        if (Memory.NeedIntialize == true || typeof Memory.spawner == 'undefined') {
            var setspawner = new Array();
            Memory.NeedIntialize = false;
            for (let index = 0; index < RoomName.length; index++) {
                if (typeof Memory.spawner != 'undefined') {
                    var iscontinue = false;

                    for (let a = 0; a < Memory.spawner.length; a++) {
                        if (Memory.spawner[a] == null) {
                            Memory.spawner.splice(a, 1); a--; continue;
                        }
                        if (RoomName[index] == Memory.spawner[a].Name) {
                            setspawner[index] = Memory.spawner[a];
                            iscontinue = true;
                        }
                    }
                    if (iscontinue) { continue; }
                }
                var Get = initialize.run(Spawner, RoomName[index], index);
                switch (Get) {
                    case null:
                        Memory.NeedIntialize = true;
                        break;
                    case 'null-Container':
                        Memory.NeedIntialize = true;
                        break;
                    default:
                        setspawner[index] = Get;
                        console.log('房间控制器已录入内存！');
                        break;
                }


            }
            if (typeof Memory.spawner != 'undefined') {
                for (let i = 0; i < setspawner.length; i++) {
                    for (let a = 0; a < Memory.spawner.length; a++) {
                        if (setspawner[i] == null) { setspawner.splice(i, 1); i--; continue; }
                        if (setspawner[i].Name == Memory.spawner[a].Name) {
                            setspawner[i] = Memory.spawner[a];
                        }
                    }
                }
            }
            Memory.spawner = setspawner;
        }
        else {
            if (Memory.spawner.length != RoomName.length) { Memory.NeedIntialize = true; return; }
            for (let i = 0; i < Memory.spawner.length; i++) {
                Memory.spawner[i].index = i;
                if (typeof Memory.spawner[i] == 'undefined' || Memory.spawner[i] == null) {
                    Memory.NeedIntialize = true;
                    return;
                }
                else {
                    if (Memory.spawner[i].Name != Room[i]) { Memory.NeedIntialize = true; return; }
                }
            }
        }
    }
}
module.exports = MemoryInitializeForRoom;