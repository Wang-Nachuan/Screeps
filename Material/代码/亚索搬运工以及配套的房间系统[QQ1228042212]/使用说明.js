
//本来是想单独发出来 但是发现和房间耦合性太高，如果没有房间系统很难使用这个脚本....
//房间系统使用说明:
//Main外 var RoomName = new Array();
//       var Spawner = require('TheSecondStageRespawn');
//module.exports.loop = function () {
    //        MemoryInitializeForRoom.run(Spawner, RoomName, RoomName);
//......

    //}


//前置方法，使用亚索搬运工需要自行撰写多个方法 1.拾取地上的物品 2.拾取墓碑里的物品 3.将所有物品放到storage 并分别替换
//var pickup = require('pickup');
//var pickTomb = require('pickTomb');
//var TransferTo = require('TransferEveryThing');
