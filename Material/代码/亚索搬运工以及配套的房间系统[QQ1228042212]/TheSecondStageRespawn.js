/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('Respawn.Digger');
 * mod.thing == 'a thing'; // true
 */
function CheckWorkAmount(place) {
    var amount = 0;
    for (let i = 0; i < place.length; i++) {
        if (place[i] == WORK) { amount++ }
    }
    return amount;
}
var RespawnDigger =
{
    newRoomSpawn: function (RoomName, BuilderLimit, DiggerLimit, RepairLimit, UpgraderLimit, DeliverLimit, SpawnIndex, diggerplace, builderplace, repairplace, upgraderplace, deliverplace, RoomIndex) {
        if (Game.rooms[RoomName] == null || Game.rooms[RoomName].controller.my == false) { return null; }
        var Sources = Game.rooms[RoomName].find(FIND_SOURCES).concat(Game.rooms[RoomName].find(FIND_MINERALS));
        var RoomSpawn = new Object;
        RoomSpawn.Name = RoomName;
        var Allstructs = Game.rooms[RoomName].find(FIND_STRUCTURES);
        var myspawn = _.filter(Allstructs, (struct) => struct.structureType == STRUCTURE_SPAWN)[SpawnIndex];
        if (typeof myspawn == 'undefined') {
            var sources = Game.rooms[RoomSpawn.Name].find(FIND_SOURCES);
            var controller = Game.rooms[RoomSpawn.Name].controller;
            var Position = new RoomPosition(sources[0].pos.x + (controller.pos.x - sources[0].pos.x) / 2, sources[0].pos.y + (controller.pos.y - sources[0].pos.y) / 2, RoomSpawn.Name);
            CreateSpawnConstructionsite(Position);
            //console.log('你没有spawn，请检查'+RoomName);
            return null;
        }
        RoomSpawn.Spawn = myspawn.id;
        RoomSpawn.Container = new Array();
        RoomSpawn.Sources = new Array();
        for (let index = 0; index < Sources.length; index++) {
            RoomSpawn.Sources[index] = Sources[index].id;

        }
        RoomSpawn.Index = RoomIndex;
        RoomSpawn.DeliverTargetGroup = new Array();
        RoomSpawn.Respawn = false;
        RoomSpawn.diggerplace = diggerplace;
        RoomSpawn.builderplace = builderplace;
        RoomSpawn.repairplace = repairplace;
        RoomSpawn.upgraderplace = upgraderplace;
        RoomSpawn.deliverplace = deliverplace;
        RoomSpawn.BuilderLimit = BuilderLimit;
        RoomSpawn.DiggerLimit = DiggerLimit;
        RoomSpawn.RepairLimit = RepairLimit;
        RoomSpawn.UpgraderLimit = UpgraderLimit;
        RoomSpawn.DeliverLimit = DeliverLimit;
        // ContainerRefresh(RoomSpawn);
        // TowerRefresh(RoomSpawn);
        StructureRefresh2(RoomSpawn, true);
        console.log('录入成功' + RoomName);
        SetContainer(RoomSpawn);
        return RoomSpawn;
    }
    , spawn: function (RoomSpawn, place, Name, torole, count) {
        //内存清理+Container清理
        var price = 0
        place.forEach(element => {
            switch (element) {
                case WORK:
                    price += 100;
                    break;

                case MOVE:
                    price += 50;
                    break;
                case CARRY:
                    price += 50;
                    break;
                case ATTACK:
                    price += 80
                    break;
                case CLAIM:
                    price += 600;
                    break;
                case HEAL:
                    price += 250;
                    break;
                case TOUGH:
                    price += 10;
                    break;
                case RANGED_ATTACK:
                    price += 120;
                    break;
            }
        });
        if (Game.getObjectById(RoomSpawn.Spawn) == null) { return; }
        if (Game.getObjectById(RoomSpawn.Spawn).spawning == null && Game.rooms[RoomSpawn.Name].energyAvailable >= price && RoomSpawn.Respawn == false) {
            RoomSpawn.Respawn = true;
            if (Game.getObjectById(RoomSpawn.Spawn).spawnCreep(place, Name + count, { memory: { role: torole, spawnid: RoomSpawn.Index } }) != 0) {
                RoomSpawn.Respawn = false;
                console.log(Name + count + '生成失败,原因是' + Game.getObjectById(RoomSpawn.Spawn).spawnCreep(place, Name + count, { memory: { role: torole, spawnid: RoomSpawn.Index } }));
                return;
            }
            var mycreep = Game.creeps[Name + count];
            if (mycreep == null) {
                RoomSpawn.Respawn = false;
                console.log('生成错误');
                return;
            }
            RoomSpawn.spawnid = mycreep.id;
            mycreep.memory.Index = RoomSpawn.Index;
            switch (torole) {
                case 'Digger':
                    mycreep.memory.dontPullMe=true;
                    var checksources = new Array();
                    var i = 0;
                    var mineral = null;
                    var IsSkipMineral = false
                    for (let a = 0; a < RoomSpawn.Sources.length; a++) {
                        if (EXTRATORget == 0 && typeof Game.getObjectById(RoomSpawn.Sources[a]).mineralType != 'undefined') { IsSkipMineral = true; mineral = RoomSpawn.Sources[a]; continue; }
                        checksources[i] = RoomSpawn.Sources[a];
                        i++;
                    }
                    var EXTRATORget = GetStructuresOfMemory.run(RoomSpawn, STRUCTURE_EXTRACTOR, false).length;
                    for (let a = 0; a < RoomSpawn.Container.length; a++) {
                        if (Game.creeps[RoomSpawn.Container[a].creep] == null) {
                            RoomSpawn.Container[a].creep = 'None';
                        }
                        if (IsSkipMineral && Game.getObjectById(RoomSpawn.Container[a].Id).pos.getRangeTo(mineral) == 1) { continue; }
                        var RoomContainer = RoomSpawn.Container[a];
                        if (RoomContainer.creep == 'None') {
                            if (Game.getObjectById(RoomContainer.Id) == null) { RoomSpawn.Container.splice(a, 1); a--; continue; }
                            Memory.spawner[RoomSpawn.Index].Container[a].creep = Name + count;
                            mycreep.memory.Digposition = RoomContainer.Id;
                            mycreep.memory.digsource = checksources[0];
                            var getpos = Game.getObjectById(RoomContainer.Id).pos;
                            var topos = Game.getObjectById(mycreep.memory.digsource).pos;
                            var distance = getpos.getRangeTo(topos);
                            for (let b = 0; b < checksources.length; b++) {
                                var distance2 = getpos.getRangeTo(Game.getObjectById(checksources[b]).pos);
                                if (distance2 < distance) {
                                    distance = distance2;
                                    mycreep.memory.digsource = checksources[b];
                                }
                            }
                            console.log('生成阶段' + mycreep.memory.digsource + 'Name=' + Name + count);
                            break;
                        }

                    }

                    break;

                case 'Repair':
                    mycreep.memory.NeedfixObj = 'None';
                    break;
                case 'Deliver':
                    mycreep.memory.UseContainer = null;
                    mycreep.memory.Target = null;
                    mycreep.memory.TargetGroup = new Array();
                    mycreep.memory.AlreadyActionId = null;
                    break;
                case 'Upgrader':
                    mycreep.memory.ConsumeSpeed = CheckWorkAmount(place);
                    mycreep.memory.dontPullMe=true;
                    break;
            }
            console.log(Name + count + '建造中，花费了' + price + '能量!');
        }
    }
    //建筑工数量 矿工数量 修理工数量 升级工数量 搬运工数量
    , LimitChange: function (RoomSpawn, BuilderLimit, DiggerLimit, RepairLimit, UpgraderLimit, DeliverLimit, GuarderLimit) {
        if (RoomSpawn == null || typeof Memory.spawner[RoomSpawn.Index] == 'undefined') { return; }
        Memory.spawner[RoomSpawn.Index].BuilderLimit = BuilderLimit;
        Memory.spawner[RoomSpawn.Index].DiggerLimit = DiggerLimit;
        Memory.spawner[RoomSpawn.Index].RepairLimit = RepairLimit;
        Memory.spawner[RoomSpawn.Index].UpgraderLimit = UpgraderLimit;
        Memory.spawner[RoomSpawn.Index].DeliverLimit = DeliverLimit;
        Memory.spawner[RoomSpawn.Index].GuarderLimit = GuarderLimit;
    }, PlaceChange: function (RoomSpawn, diggerplace, builderplace, repairplace, upgraderplace, deliverplace, GuarderPlace) {
        if (RoomSpawn == null || typeof Memory.spawner[RoomSpawn.Index] == 'undefined') { return; }
        Memory.spawner[RoomSpawn.Index].diggerplace = diggerplace;
        Memory.spawner[RoomSpawn.Index].builderplace = builderplace;
        Memory.spawner[RoomSpawn.Index].repairplace = repairplace;
        Memory.spawner[RoomSpawn.Index].upgraderplace = upgraderplace;
        Memory.spawner[RoomSpawn.Index].deliverplace = deliverplace;
        Memory.spawner[RoomSpawn.Index].GuarderPlace = GuarderPlace;
    }
    , SpawnIndexChange: function (RoomSpawn, spawnid) {
        if (RoomSpawn == null || typeof Memory.spawner[RoomSpawn.Index] == 'undefined') { return; }
        RoomSpawn.Spawn = spawnid;

    }
    , SpawnController: function (RespawnDigger, RoomSpawn, cooldown) {
        var RoomName = RoomSpawn.Name;
        var targets = Game.rooms[RoomName].find(FIND_CONSTRUCTION_SITES);
        var Spawner = RespawnDigger;
        var diggerplace = RoomSpawn.diggerplace;
        var builderplace = RoomSpawn.builderplace;
        var repairplace = RoomSpawn.repairplace;
        var upgraderplace = RoomSpawn.upgraderplace;
        var deliverplace = RoomSpawn.deliverplace;
        var length2 = _.filter(Game.creeps, (creep) => creep.memory.role == 'Builder' && creep.memory.Index == RoomSpawn.Index).length;
        var length = _.filter(Game.creeps, (creep) => creep.memory.role == 'Digger' && creep.memory.Index == RoomSpawn.Index).length;
        //生成搬运工
        var length5 = _.filter(Game.creeps, (creep) => creep.memory.role == 'Deliver' && creep.memory.Index == RoomSpawn.Index).length;
        var DeliverList = _.filter(Game.creeps, (creep) => creep.memory.role == 'Deliver' && creep.memory.Index == RoomSpawn.Index);

        if ((length5 < RoomSpawn.DeliverLimit && ((RoomSpawn.DiggerLimit > 0 && length > 0) || (RoomSpawn.DiggerLimit == 0 && length > 0))) || (DeliverList.length > 0 && DeliverList[0].ticksToLive <= 30 && DeliverList.length < RoomSpawn.DiggerLimit + 1)||(DeliverList.length>0&& DeliverList.length < RoomSpawn.DiggerLimit + 1&&DeliverList[0].body.length<4)) {
            Spawner.spawn(RoomSpawn, deliverplace, 'Deliver', 'Deliver', cooldown);
        }
        //生成矿工
        if (((length5 > 0 && length < RoomSpawn.DiggerLimit) || (RoomSpawn.Container.length == 0 && length < RoomSpawn.DiggerLimit) || (length2 == 0 && length < RoomSpawn.DiggerLimit))) {
            Spawner.spawn(RoomSpawn, diggerplace, 'Digger', 'Digger', cooldown);
        }
        if (length5 < RoomSpawn.DeliverLimit && length5 == 0 && Game.rooms[RoomSpawn.Name].energyAvailable >= 150 && Game.rooms[RoomSpawn.Name].energyAvailable < Game.rooms[RoomSpawn.Name].energyCapacityAvailable) {
            Spawner.spawn(RoomSpawn, [CARRY, CARRY, MOVE], 'Deliver', 'Deliver', cooldown);
        }
        if (length < RoomSpawn.DiggerLimit && length < 1 && length5 >= 1 && Game.rooms[RoomSpawn.Name].energyAvailable >= 150 && Game.rooms[RoomSpawn.Name].energyAvailable < Game.rooms[RoomSpawn.Name].energyCapacityAvailable) {
            Spawner.spawn(RoomSpawn, [WORK, MOVE], 'Digger', 'Digger', cooldown);

        }
        if (length5 < RoomSpawn.DeliverLimit) { return; };
        if (targets.length > 0) {
            //生成建筑工
            if (length2 < RoomSpawn.BuilderLimit && length == RoomSpawn.DiggerLimit) {
                Spawner.spawn(RoomSpawn, builderplace, 'Builder', 'Builder', cooldown);
            }
        }
        //生成Repair工
        var length3 = _.filter(Game.creeps, (creep) => creep.memory.role == 'Repair' && creep.memory.Index == RoomSpawn.Index).length;
        if (length3 < RoomSpawn.RepairLimit && length == RoomSpawn.DiggerLimit) {
            Spawner.spawn(RoomSpawn, repairplace, 'Repair', 'Repair', cooldown);
        }
        //生成升级工
        var length4 = _.filter(Game.creeps, (creep) => creep.memory.role == 'Upgrader' && creep.memory.Index == RoomSpawn.Index).length;
        if (length4 < RoomSpawn.UpgraderLimit && length == RoomSpawn.DiggerLimit) {
            Spawner.spawn(RoomSpawn, upgraderplace, 'Upgrader', 'Upgrader', cooldown);
        }
        RespawnDigger.Warning(RespawnDigger, RoomSpawn, cooldown);
    }
    , AllController: function (RespawnDigger, RoomSpawn, cooldown, IsNeedMineralDeliver, Added) {
        if (RoomSpawn == null ||RoomSpawn==undefined|| typeof Memory.spawner[RoomSpawn.Index] == 'undefined' || Game.rooms[RoomSpawn.Name] == null) { return; }
        if (Added != null) {
            Added.run(RoomSpawn);
        }
        if (RoomSpawn.NewFunction) { return; }
        var EXTRATORget = GetStructuresOfMemory.run(RoomSpawn, STRUCTURE_EXTRACTOR, false).length;
        if (EXTRATORget == 0 && RoomSpawn.Container.length == 3) { RoomSpawn.DiggerLimit = RoomSpawn.DiggerLimit - 1; }
        //内存清理
        for (var name in Memory.creeps) {
            if (!Game.creeps[name]) {
                if (name.indexOf('Digger') != -1) {
                    for (let i = 0; i < RoomSpawn.Container.length; i++) {
                        if (name == RoomSpawn.Container[i].creep) {
                            RoomSpawn.Container[i].creep = 'None';
                        }

                    }
                }
                else {
                    if (name.indexOf('Deliver') != -1) {
                        var CheckGroup = Memory.creeps[name].TargetGroup;
                        var Group = Memory.spawner[Memory.creeps[name].Index].NeedEnergyGroup;
                        if (Group == undefined || CheckGroup == undefined) { continue; }
                        if (Memory.creeps[name].Target != null) {
                            CheckGroup[CheckGroup.length] = Memory.creeps[name].Target;
                        }
                        for (let i = 0; i < CheckGroup.length; i++) {
                            var checkobj =Game.getObjectById(CheckGroup[i].Id);
                            if(checkobj==null){continue;}
                            STtype = checkobj.structureType;
                            for (let a = 0; a < Group.length; a++) {
                                if (STtype != Group[a].type) { continue }
                                else {
                                    NeedEnergyIndex = CheckGroup[i].NeedEnergyIndex;
                                    if(Group[a].structs[NeedEnergyIndex]==undefined){continue}
                                    var checksend = Group[a].structs[NeedEnergyIndex].IsAlreadySendRequest;
                                    for (let c = 0; c < checksend.length; c++) {
                                        if (Game.getObjectById(checksend[c]) == null || checksend[c] == Memory.creeps[name].id) {
                                            checksend.splice(c, 1);
                                            c--;
                                        }
                                    }
                                    break;
                                }

                            }

                        }
                    }
                }

                delete Memory.creeps[name];

                console.log('已清除内存：', name);
            }
        }
        if (RoomSpawn.Respawn == true && RoomSpawn.spawnid != 'None' && typeof RoomSpawn.spawnid != 'undefined') {
            if (Game.getObjectById(RoomSpawn.spawnid) != null) {
                RoomSpawn.spawnid = 'None';
                RoomSpawn.Respawn = false;
            }
        }
        else {
            RoomSpawn.spawnid = 'None';
            RoomSpawn.Respawn = false;
        }
        RespawnDigger.SpawnController(RespawnDigger, RoomSpawn, cooldown);
        RespawnDigger.Distribute(RoomSpawn);
        RespawnDigger.StructureRefresh(RoomSpawn, false);
        RespawnDigger.checkTERMINAL(RoomSpawn);
        RespawnDigger.NeedDeliverStructures(RoomSpawn);
        if (IsNeedMineralDeliver && RoomSpawn.Sources.length == RoomSpawn.Container.length && EXTRATORget > 0) {
            var GetMineral = Game.rooms[RoomSpawn.Name].find(FIND_MINERALS)[0];
            if (GetMineral.mineralAmount != 0) {
                var mineraldeliver = _.filter(Game.creeps, (creep) => creep.memory.role == 'MineralDeliver' && creep.memory.Index == RoomSpawn.Index);
                if (mineraldeliver.length == 0) {
                    RespawnDigger.spawn(RoomSpawn, [MOVE, CARRY], 'MineralDeliver', 'MineralDeliver', cooldown);
                }
                else {
                    MineralDeliver.run(mineraldeliver[0]);
                }
            }
        }
    }, Distribute: function (RoomSpawn) {
        Distribute.run(RoomSpawn)
    }, ContainerRefresh(RoomSpawn) {
        ContainerRefresh(RoomSpawn);

    }, TowerRefresh(RoomSpawn) {
        TowerRefresh(RoomSpawn);
    }, Warning: function (RespawnDigger, RoomSpawn, cooldown) {
        var otherCreep = _.filter(Game.rooms[RoomSpawn.Name].find(FIND_HOSTILE_CREEPS), (Creep) => Creep.hits > 0);
        var guard = _.filter(Game.creeps, (creep) => creep.memory.role == 'Guarder' && creep.memory.Index == RoomSpawn.Index);
        if (otherCreep.length >= 2) { RoomSpawn.HaveEnermy = true; } else { RoomSpawn.HaveEnermy = false; }
        if ((otherCreep.length >= 2 || Game.rooms[RoomSpawn.Name].find(FIND_HOSTILE_STRUCTURES) > 0) && guard.length < RoomSpawn.GuarderLimit) {
            RespawnDigger.spawn(RoomSpawn, RoomSpawn.GuarderPlace, 'guarder', 'Guarder', cooldown);
        }
    }

    , StructureRefresh(RoomSpawn, need) {
        StructureRefresh2(RoomSpawn, need);
    }, checkTERMINAL(RoomSpawn) {
        if (typeof RoomSpawn.marketid != 'undefined' && Game.market.getOrderById(RoomSpawn.marketid).remainingAmount > 0 && Game.market.getOrderById(RoomSpawn.marketid).active) {
            return;
        }
        if (typeof RoomSpawn.Allstructs != 'undefined') {
            var Room = Game.rooms[RoomSpawn.Name];
            var terminal = Room.terminal;
            if (terminal != null && terminal.store.getFreeCapacity() == 0) {
                var type = Room.find(FIND_MINERALS)[0].mineralType;
                type = GetTypeInTerminal(type, terminal);
                var checkprice = Game.market.getHistory(type);
                var price = 0;
                if (checkprice > 20) {
                    checkprice = 20;
                }
                for (let a = 0; a < checkprice; a++) {
                    price += Game.market.getHistory(type)[a].avgPrice;

                }
                price = price / checkprice;
                var amount = 0;
                while (amount < terminal.store[type]) {
                    var needcredits = price * amount * 0.05;
                    if (needcredits <= Game.market.credits) {
                        amount += 1;
                    }
                    else {
                        amount -= 1;
                        break;
                    }
                }
                if (amount > terminal.store[type]) {
                    amount = terminal.store[type];
                }
                if (Game.market.createOrder({
                    type: ORDER_SELL,
                    resourceType: type,
                    price: price,
                    totalAmount: amount,
                    roomName: RoomSpawn.Name
                }) == 0) {
                    for (a in Game.market.orders) {
                        RoomSpawn.marketid = a;
                    }
                }
            }
        }
    }, SetContainer2(RoomSpawn) { SetContainer(RoomSpawn); },


    //搬运工模块
    NeedDeliverStructures(RoomSpawn) {
        if (typeof RoomSpawn.NeedEnergyGroup == 'undefined') { return; }
        var DeliverList = _.filter(Game.creeps, (creep) => creep.memory.role == 'Deliver' && creep.memory.Index == RoomSpawn.Index);
        for (let i = 0; i < RoomSpawn.NeedEnergyGroup.length; i++) {
            var itisbaned = false;
            if (RoomSpawn.NeedEnergyGroup[i].structs == undefined) { continue; }
            for (let a = 0; a < RoomSpawn.NeedEnergyGroup[i].structs.length; a++) {
                RoomSpawn.NeedEnergyGroup[i].structs[a].NeedEnergyIndex = a;
                var obj = Game.getObjectById(RoomSpawn.NeedEnergyGroup[i].structs[a].id);
                if (obj == null) { RoomSpawn.NeedEnergyGroup[i].structs.splice(a, 1); a--; continue; }

                // for (let m = 0; m < RoomSpawn.NeedEnergyGroup[i].structs[a].IsAlreadySendRequest.length; m++) {
                //     if(Game.getObjectById(RoomSpawn.NeedEnergyGroup[i].structs[a].IsAlreadySendRequest[m])==null||obj.store.getFreeCapacity(RoomSpawn.NeedEnergyGroup[i].structs[a].NeedSources[0])==0)
                //     {
                //         RoomSpawn.NeedEnergyGroup[i].structs[a].IsAlreadySendRequest.splice(m,1);
                //         m--;
                //     }
                // }
                if (RoomSpawn.NeedEnergyGroup[i].structs[a].IsAlreadySendRequest.length < DeliverList.length && obj.store.getFreeCapacity(RoomSpawn.NeedEnergyGroup[i].structs[a].NeedSources[0]) > 0) {
                    for (let c = 0; c < DeliverList.length; c++) {
                        if (RoomSpawn.NeedEnergyGroup[i].structs[a].IsAlreadySendRequest.indexOf(DeliverList[c].id) != -1||DeliverList[c]==null||DeliverList[c].id==null) { continue; }
                        var get = AddDeliverTargetGroup(DeliverList[c], obj, RoomSpawn.NeedEnergyGroup[i].structs[a], RoomSpawn.NeedEnergyGroup[i].structs[a].NeedSources, RoomSpawn.NeedEnergyGroup[i].structs[a].NeedEnergyIndex);
                        if (get != 'Baned' && get != 'None') {
                            var length = RoomSpawn.NeedEnergyGroup[i].structs[a].IsAlreadySendRequest.length
                            RoomSpawn.NeedEnergyGroup[i].structs[a].IsAlreadySendRequest[length] = DeliverList[c].id;
                        }
                        else if (get == 'Baned') { isisbaned = true; break; }
                    }
                }
                if (itisbaned) {
                    break;
                }
            }
            if (itisbaned) { continue; }
        }
    }
}
//Deliver目标组
const Weight3Group = new Array(STRUCTURE_TOWER);
const Weight2Group = new Array(STRUCTURE_EXTENSION, STRUCTURE_SPAWN);
const Weight1Group = new Array(STRUCTURE_CONTAINER);
const Weightminius1Group = new Array(STRUCTURE_TERMINAL, STRUCTURE_STORAGE);
const BanedGroup = new Array(STRUCTURE_LINK);
//新建与添加目标到目标组
function AddDeliverTargetGroup(creep, structure, Quote, NeedSources, EnergyIndex) {
    if (creep == null) { return 'None'; }
    var Weight = 0;
    if (BanedGroup.indexOf(structure.structureType) != -1) { return 'Baned'; }
    if (Weight3Group.indexOf(structure.structureType) != -1 && filterOfWeight3Group(structure)) { Weight = 3; }
    if (Weight2Group.indexOf(structure.structureType) != -1) { Weight = 2; }
    if (Weight1Group.indexOf(structure.structureType) != -1) { Weight = 1; }
    if (Weightminius1Group.indexOf(structure.structureType) != -1) { Weight = -2; }
    var ToAddObj = GetSortingObj(structure.id, Weight, Quote, 0, NeedSources, EnergyIndex);
    AddToTwoForkedTree(creep, ToAddObj);
    return true;
}
//////
function AddToTwoForkedTree(creep, ToAddObj) {
    var Index = creep.memory.TargetGroup.length;
    creep.memory.TargetGroup[creep.memory.TargetGroup.length] = ToAddObj;
    TwoForkedTreeSort(creep.memory.TargetGroup, Index);
}
function TwoForkedTreeSort(Group, Index) {
    if (Index == 0) { return; }
    var Parent = parseInt(Index / 2 - 1);
    if (Group[Index].Weight > Group[Parent].Weight) {
        var exchange = Group[Parent];
        Group[Parent] = Group[Index]
        Group[Index] = exchange;
        Index = Parent;
        TwoForkedTreeSort(Group, Index);
    }
    else { return; }

}
//////








function GetSortingObj(Id, weight, structureQuote, Index, NeedSources, EnergyIndex) {
    var Obj = new Object();
    Obj.Id = Id;
    Obj.Weight = weight;
    Obj.Distance = 0;
    Obj.NeedSources = NeedSources;
    Obj.Index = Index;
    Obj.NeedEnergyIndex = EnergyIndex;
    Obj.StructureQuote = structureQuote;
    return Obj;
}
function filterOfWeight3Group(structure) {
    if (structure.structureType != STRUCTURE_TOWER || (structure.structureType == STRUCTURE_TOWER && structure.store[RESOURCE_ENERGY] <= 100)) {
        return true;
    }
    return false;
}
function SetContainer(RoomSpawn) {
    var RoomName = RoomSpawn.Name;
    var terrain = Game.map.getRoomTerrain(RoomName);
    var myspawn = Game.getObjectById(RoomSpawn.Spawn);
    for (let i = 0; i < RoomSpawn.Sources.length; i++) {
        var source = Game.getObjectById(RoomSpawn.Sources[i]);
        var position = new RoomPosition(0, 0, RoomSpawn.Name);
        var Distance = 999;
        var newpos = new RoomPosition(25, 25, RoomSpawn.Name)
        for (let w = 0; w < 3; w++) {
            var lorr = 0;
            switch (w) {
                case 0: lorr = 0; break;
                case 1: lorr = 1; break;
                case 2: lorr = -1; break;
            }
            var getterrain = terrain.get(source.pos.x + lorr, source.pos.y + 1);
            newpos = new RoomPosition(source.pos.x + lorr, source.pos.y + 1, RoomSpawn.Name);
            if ((getterrain == 0 || getterrain == 2) && newpos.getRangeTo(myspawn) < Distance) {
                Distance = newpos.getRangeTo(myspawn);
                position = newpos;
            }

        }
        for (let s = 0; s < 3; s++) {
            var lorr = 0;
            switch (s) {
                case 0: lorr = 0; break;
                case 1: lorr = 1; break;
                case 2: lorr = -1; break;
            }
            var getterrain = terrain.get(source.pos.x + lorr, source.pos.y - 1);
            newpos = new RoomPosition(source.pos.x + lorr, source.pos.y - 1, RoomSpawn.Name);
            if ((getterrain == 0 || getterrain == 2) && newpos.getRangeTo(myspawn) < Distance) {
                Distance = newpos.getRangeTo(myspawn);
                position = newpos;
            }

        }
        for (let ad = 0; ad < 2; ad++) {
            switch (ad) {
                case 0: lorr = 1; break;
                case 1: lorr = -1; break;
            }
            var getterrain = terrain.get(source.pos.x + lorr, source.pos.y);
            newpos = new RoomPosition(source.pos.x + lorr, source.pos.y, RoomSpawn.Name);
            if ((getterrain == 0 || getterrain == 2) && newpos.getRangeTo(myspawn) < Distance) {
                Distance = newpos.getRangeTo(myspawn);
                position = newpos;
            }
        }
        position.createConstructionSite(STRUCTURE_CONTAINER);
    }
    var source = Game.rooms[RoomSpawn.Name].controller;
    var newpos = new RoomPosition(25, 25, RoomSpawn.Name)
    var position = new RoomPosition(0, 0, RoomSpawn.Name);
    var Distance = 999;
    for (let a = 1; a < 3; a++) {

        for (let w = 0; w < 5; w++) {
            var lorr = 0;
            switch (w) {
                case 0: lorr = 0; break;
                case 1: lorr = 1; break;
                case 2: lorr = -1; break;
                case 3: lorr = 2; break;
                case 4: lorr = -2; break;
            }
            var getterrain = terrain.get(source.pos.x + lorr, source.pos.y + a);
            newpos = new RoomPosition(source.pos.x + lorr, source.pos.y + a, RoomSpawn.Name);
            if ((getterrain == 0 || getterrain == 2) && newpos.getRangeTo(myspawn) < Distance) {
                Distance = newpos.getRangeTo(myspawn);
                position = newpos;
            }

        }
        for (let s = 0; s < 5; s++) {
            var lorr = 0;
            switch (s) {
                case 0: lorr = 0; break;
                case 1: lorr = 1; break;
                case 2: lorr = -1; break;
                case 3: lorr = 2; break;
                case 4: lorr = -2; break;
            }
            var getterrain = terrain.get(source.pos.x + lorr, source.pos.y - 1);
            newpos = new RoomPosition(source.pos.x + lorr, source.pos.y - a, RoomSpawn.Name);
            if ((getterrain == 0 || getterrain == 2) && newpos.getRangeTo(myspawn) < Distance) {
                Distance = newpos.getRangeTo(myspawn);
                position = newpos;
            }

        }
        for (let ad = 0; ad < 4; ad++) {
            switch (ad) {
                case 0: lorr = 1; break;
                case 1: lorr = -1; break;
                case 2: lorr = 2; break;
                case 3: lorr = -2; break;
            }
            var getterrain = terrain.get(source.pos.x + lorr, source.pos.y);
            newpos = new RoomPosition(source.pos.x + lorr, source.pos.y, RoomSpawn.Name);
            if ((getterrain == 0 || getterrain == 2) && newpos.getRangeTo(myspawn) < Distance) {
                Distance = newpos.getRangeTo(myspawn);
                position = newpos;
            }
        }
    }
    position.createConstructionSite(STRUCTURE_CONTAINER);
}
function CreateSpawnConstructionsite(Position) {
    if (Position.createConstructionSite(STRUCTURE_SPAWN) == ERR_INVALID_TARGET && Position.x <= 50) {
        Position.x += 1;
        CreateSpawnConstructionsite(Position);
    }
}
function GetTypeInTerminal(Resource_type, terminal) {
    var type = Resource_type
    for (let i = 0; i < RESOURCES_ALL.length; i++) {
        if (terminal.store[RESOURCES_ALL[i]] > terminal.store[type]) {

            type = RESOURCES_ALL[i];
        }

    }
    return type;
}
function StructureRefresh2(RoomSpawn, need) {
    var needRefresh = false;
    var constructionlength = 0;
    for (let a in Game.constructionSites) {
        if (Game.constructionSites[a].pos.roomName == RoomSpawn.Name) {
            constructionlength++;
        }

    }
    var FindConstruction = constructionlength;
    if (RoomSpawn.construction != FindConstruction) {
        needRefresh = true;
        RoomSpawn.construction = FindConstruction;
    }

    if (needRefresh || need) {

        console.log('建筑已刷新');
        TowerRefresh(RoomSpawn);
        ContainerRefresh(RoomSpawn);
        SourcesRefresh(RoomSpawn);
        var allstructure = Game.rooms[RoomSpawn.Name].find(FIND_STRUCTURES);
        RoomSpawn.Allstructs = new Array();
        for (let i = 0; i < allstructure.length; i++) {
            var index = 0;
            if (checkIsHaveStructureType(allstructure[i].structureType, RoomSpawn.Allstructs) == -1) {
                index = RoomSpawn.Allstructs.length;
                RoomSpawn.Allstructs[RoomSpawn.Allstructs.length] = GetNewStructArray(allstructure[i].structureType);
            }
            else {
                index = checkIsHaveStructureType(allstructure[i].structureType, RoomSpawn.Allstructs);
            }

            RoomSpawn.Allstructs[index].structs[RoomSpawn.Allstructs[index].structs.length] = allstructure[i].id;
        }
        CreateNeedEnergyGroup(RoomSpawn);
    }
}
function CreateNeedEnergyGroup(RoomSpawn) {
    if (typeof RoomSpawn.Allstructs != 'undefined') {
        var GetAll = GetStructuresOfMemory.run(RoomSpawn, null, true);
        var filterStore = _.filter(GetAll, (struct) => struct!=null&&typeof struct.store != 'undefined');
            if (typeof RoomSpawn.NeedEnergyGroup != 'undefined') {
                var createneed = RoomSpawn.NeedEnergyGroup
                var Containerlength = RoomSpawn.Container.length;
                for (let a = 0; a < filterStore.length; a++) {
                    var check = false;
                        for (let i = 0; i < RoomSpawn.NeedEnergyGroup.length; i++) {

                            if (filterStore[a].structureType != RoomSpawn.NeedEnergyGroup[i].type) { continue; }
                            for (let t = 0; t < RoomSpawn.NeedEnergyGroup[i].structs.length; t++) {
                                if (RoomSpawn.NeedEnergyGroup[i].structs[t].id == filterStore[a].id) {
                                    filterStore.splice(a, 1);
                                    a--;
                                    check = true;
                                    break;
                                }
                            }
                            if(check){break;}
                        }
                        if(check){continue;}
                        if (Containerlength > 0) {
                            for (let m = 0; m < RoomSpawn.Container.length; m++) {
                                if (filterStore[a].id == RoomSpawn.Container[m].Id) {
                                    Containerlength--;
                                    filterStore.splice(a, 1);
                                    a--;
                                    break;
                                }
                            }
                        }

                }
                for (let i = 0; i < filterStore.length; i++) {
                    let index = checkIsHaveStructureType(filterStore[i].structureType, createneed);
                    if (index == -1) {
                        index = createneed.length
                        createneed[createneed.length] = GetNewStructArray(filterStore[i].structureType);
                    }
                    var needsources = new Array();
                    needsources[0] = RESOURCE_ENERGY;
                    createneed[index].structs[createneed[index].structs.length] = NeedSourcesStructure(filterStore[i].id, needsources, filterStore[i].structureType, index);
                }
            }
            else {
                var createneed = new Array();
                var Containerlength = RoomSpawn.Container.length;
                for (let i = 0; i < filterStore.length; i++) {
                    isContainer = false;
                    if (Containerlength > 0) {
                        for (let a = 0; a < RoomSpawn.Container.length; a++) {
                            if (filterStore[i].id == RoomSpawn.Container[a].Id) {
                                filterStore.splice(i, 1);
                                i--;
                                Containerlength--;
                                isContainer = true;
                                break;
                            }
                        }
                    }
                    if (isContainer) { continue; }
                    let index = checkIsHaveStructureType(filterStore[i].structureType, createneed);
                    if (index == -1) {
                        index = createneed.length;
                        createneed[createneed.length] = GetNewStructArray(filterStore[i].structureType);
                    }
                    var needsources = new Array();
                    needsources[0] = RESOURCE_ENERGY;
                    createneed[index].structs[createneed[index].structs.length] = NeedSourcesStructure(filterStore[i].id, needsources, filterStore[i].structureType, index);
                }
                RoomSpawn.NeedEnergyGroup = createneed;
            }
            var UseContainerGroup = new Array();
            for (let i = 0; i < RoomSpawn.Container.length; i++) {
                UseConatinerStruct[i] = UseContainerGroup
            }
        var UseContainerGroup = new Array();
        for (let i = 0; i < RoomSpawn.Container.length; i++) {
            UseContainerGroup[i] = UseConatinerStruct(Game.getObjectById(RoomSpawn.Container[i].Id), GetStructuresOfMemory.run(RoomSpawn, STRUCTURE_LINK, false));
        }
        var storage = GetStructuresOfMemory.run(RoomSpawn, STRUCTURE_STORAGE, false)[0];
        var terminal = GetStructuresOfMemory.run(RoomSpawn, STRUCTURE_TERMINAL, false)[0];
        if (storage != null) {
            UseContainerGroup[UseContainerGroup.length] = UseConatinerStruct(storage, GetStructuresOfMemory.run(RoomSpawn, STRUCTURE_LINK, false));
        }
        if (terminal != null) {
            UseContainerGroup[UseContainerGroup.length] = UseConatinerStruct(terminal, GetStructuresOfMemory.run(RoomSpawn, STRUCTURE_LINK, false));
        }
    }
    RoomSpawn.UseContainerGroup = UseContainerGroup;
}
function UseConatinerStruct(Container, Linkgroup) {
    var CreateContainerToLinkStruct = new Object();
    CreateContainerToLinkStruct.Container = Container.id;
    var GetLink = null
    if (Linkgroup != null) {
        for (let i = 0; i < Linkgroup.length; i++) {
            if (Linkgroup[i].pos.getRangeTo(Container) == 1) {
                GetLink = Linkgroup[i].id;
                break;
            }
        }
    }
    CreateContainerToLinkStruct.Link = GetLink;
    return CreateContainerToLinkStruct;
}
function checkIsHaveStructureType(structtype, array) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].type == structtype) {
            return i;
        }

    }
    return -1;
}
function GetNewStructArray(structtype) {
    var newarray = new Object;
    newarray.type = structtype;
    newarray.structs = new Array();
    return newarray;
}
function SourcesRefresh(RoomSpawn) {
    var Sources = Game.rooms[RoomSpawn.Name].find(FIND_SOURCES).concat(Game.rooms[RoomSpawn.Name].find(FIND_MINERALS));
    RoomSpawn.Sources = new Array();
    for (let i = 0; i < Sources.length; i++) {
        RoomSpawn.Sources[i] = Sources[i].id;

    }
}
function ContainerRefresh(RoomSpawn) {
    var refreashAdd = null
    if (RoomSpawn.Container.length != 0) {
        refreashAdd = RoomSpawn.Container;
    }
    RoomSpawn.Container = new Array();
    var sources = Game.rooms[RoomSpawn.Name].find(FIND_SOURCES);
    var minerals = Game.rooms[RoomSpawn.Name].find(FIND_MINERALS);
    var container = _.filter(Game.rooms[RoomSpawn.Name].find(FIND_STRUCTURES), (struct) => struct.structureType == STRUCTURE_CONTAINER && checkdig(struct, sources, minerals));
    var othercontainer = _.filter(Game.rooms[RoomSpawn.Name].find(FIND_STRUCTURES), (struct) => struct.structureType == STRUCTURE_CONTAINER && !checkdig(struct, sources, minerals));
    RoomSpawn.otherContainer = new Array();
    if (othercontainer.length > 0) {
        for (let i = 0; i < othercontainer.length; i++) {
            RoomSpawn.otherContainer[i] = othercontainer[i].id;
        }
    }
    if (container.length == 0) {
        console.log('您的Container数量为0，请在需要挖掘的地方放置！');
        return false;
    }
    for (let i = 0; i < container.length; i++) {
        RoomSpawn.Container[i] = new Object;
        RoomSpawn.Container[i].Id = container[i].id;
        RoomSpawn.Container[i].creep = 'None';
    }
    if (refreashAdd != null) {
        for (let index = 0; index < RoomSpawn.Container.length; index++) {
            for (let i = 0; i < refreashAdd.length; i++) {
                if (RoomSpawn.Container[index].Id == refreashAdd[i].Id) {
                    RoomSpawn.Container[index].creep = refreashAdd[i].creep
                }
            }

        }
    }
}
function TowerRefresh(RoomSpawn) {
    var Allstructs = Game.rooms[RoomSpawn.Name].find(FIND_MY_STRUCTURES);
    var mytower = _.filter(Allstructs, (struct) => struct.structureType == STRUCTURE_TOWER);
    if (mytower.length == 0) { return; }
    RoomSpawn.Tower = new Array();
    for (let i = 0; i < mytower.length; i++) {
        RoomSpawn.Tower[i] = mytower[i].id;

    }
    if (typeof Memory.spawner == 'undefined' || typeof Memory.spawner[RoomSpawn.Index] == 'undefined') { return; }
    Memory.spawner[RoomSpawn.Index].TowerAttack == 'None'
    Memory.spawner[RoomSpawn.Index].TowerAttackGroup = new Array();
    return true;
}
function checkdig(container, sources, minerals) {
    for (let i = 0; i < sources.length; i++) {
        if (container.pos.inRangeTo(sources[i], 1)) {
            return true;
        }
    }
    for (let i = 0; i < minerals.length; i++) {
        if (container.pos.inRangeTo(minerals[i], 1)) {
            return true;
        }

    }
    return false;
}
function NeedSourcesStructure(structureid, Needsources, SType, Index) {
    var Structure = new Object();
    Structure.id = structureid;
    Structure.Index = Index;
    Structure.type = SType;
    Structure.NeedSources = Needsources;
    Structure.IsAlreadySendRequest = new Array();
    return Structure;
}

module.exports = RespawnDigger;