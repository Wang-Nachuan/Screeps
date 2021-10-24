/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('initialize');
 * mod.thing == 'a thing'; // true
 */
var initialize = 
{
run:function(spawner,RoomName1,index)
{
    //新建一个生成器 房间名 建筑工数量 矿工数量 修理工数量 升级工数量 搬运工数量 Spawn的索引 矿工组件 建筑工组件 修理工组件 升级工组件 搬运工组件;
    var Room1 = spawner.newRoomSpawn(RoomName1,1,3,1,1,1,0,[WORK,WORK,MOVE],[WORK,MOVE,CARRY],[WORK,MOVE,CARRY],[WORK,MOVE,CARRY],[MOVE,CARRY,CARRY,MOVE,MOVE,MOVE],index);
    return Room1;
}
}
module.exports = initialize;