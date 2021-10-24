var pickup = require('pickup');
var pickTomb = require('pickTomb');
var TransferTo = require('TransferEveryThing');
var deliver =
{
    run: function (creep) {
        creep.memory.AlreadyActionId = null;
        creep.memory.AlreadyWithdraw = false;
        creep.memory.NeedGetSources  = false;
        Action(creep);
    }
}
function Action(creep) {
    if(Creep_signController(creep)){return;}
    var Target = null;
    if (creep.memory.Target != null && creep.memory.Target != undefined) {
        Target = Game.getObjectById(creep.memory.Target.Id);
    }
    //有目标 检测是否有资源 如果没有 去拿，如果背包满了 放到STORAGE里
    if (Target != null) {
        //如果Creep有目标资源
        if ((CheckHaveCreepTargetResource(creep, creep.memory.Target.NeedSources,creep.memory.Target) || creep.memory.AlreadyWithdraw == true)&&creep.memory.NeedGetSources==false) {
            //给目标传递资源
            TransferToTarget(creep, Target);
        }
        else {
            //背包满了，去给STORAGE
            if (TransferTo.run(creep) || pickup.run(creep) || pickTomb.run(creep)) {
                return;
            }
            var store = Game.getObjectById(creep.memory.UseContainer);
            if (store != null && ((store.store[creep.memory.Target.NeedSources[0]] >= creep.store.getFreeCapacity()&&creep.memory.NeedGetSources==false)||(creep.memory.NeedGetSources==true&&store.store[creep.memory.Target.NeedGetSources[0]]>=(creep.store.getFreeCapacity()-creep.memory.MinusSources)))) {
                WithDrawFromUseContainer(creep,Target);
                return;
            }
            //去查找目标附近的UseContainer并选择...如果没有 返回 
            if (!CheckTargetNearUseContainer(creep, Target)) {
                return;
            }
        }
    }
    else {
        //没目标 从目标组第一个拿
        if (creep.memory.TargetGroup.length > 0) {
            //对目标组排序
            var group = ToSortTargetGroup(creep.memory.TargetGroup, creep);
            if(group.length>0){
                
            var GetTarget = group[0];
            creep.memory.TargetGroup.splice(GetTarget.Index,1);
            creep.memory.Target = GetTarget;
            Action(creep);
            }
        }
    }
}

function WithDrawFromUseContainer(creep,Target) {
    var UseContainer = Game.getObjectById(creep.memory.UseContainer);
    creep.room.visual.circle(UseContainer.pos, { fill: ' #f88454', radius: 0.2, stroke: 'green' });
    if (creep.withdraw(UseContainer, creep.memory.Target.NeedSources[0]) == ERR_NOT_IN_RANGE) {
        creep.moveTo_Changed( UseContainer);
    }
    else {
        if(UseContainer.structureType==STRUCTURE_STORAGE){creep.memory.UseContainer=null;}
        creep.memory.AlreadyWithdraw = true;
        if(creep.memory.TargetGroup.length>0){
        if(creep.memory.TargetGroup[0].Weight>=creep.memory.Target.Weight){
        RefreshTarget(creep);
        }
    }
        Action(creep);
    }
}
function ToSortTargetGroup(TargetGroup, creep) {
    var NeedSortGroup = new Array();
    if (TargetGroup[0] == null||TargetGroup[0].Id==undefined) { TargetGroup.splice(0, 1); return NeedSortGroup; }
    var TheHighestWeight = TargetGroup[0].Weight;
    var creeppos = creep.pos;
    CheckTheHighestWeightTarget(TargetGroup, NeedSortGroup, TheHighestWeight, 0, creeppos);
    NeedSortGroup.sort((a, b) =>a.Distance- b.Distance);
    return  NeedSortGroup;
}
function CheckTheHighestWeightTarget(TargetGroup, AddedGroup, HighestWeight, Index, creeppos) {
    for (let i = 0; i < TargetGroup.length; i++) {
        if(TargetGroup[i].Weight==HighestWeight)
        {
            var obj = Game.getObjectById(TargetGroup[i].Id);
            if(obj==null){TargetGroup.splice(i,1);i--;continue;}
            TargetGroup[i].Index = i;
            TargetGroup[i].Distance = creeppos.getRangeTo(obj);
            AddedGroup[AddedGroup.length]=TargetGroup[i];
            if(TargetGroup[i].Distance<=1){break;}
        }
        
    }
    return;

}

function TransferToTarget(creep, Target) {
    if (Target.store.getFreeCapacity(creep.memory.Target.NeedSources[0]) == 0) {
        RemoveTarget(creep,Target); Action(creep);
        return;
    }
    if (creep.memory.AlreadyActionId != null && Target.pos.getRangeTo(creep) <= 1) { return; }
    creep.room.visual.circle(Target.pos, { fill: ' #f88454', radius: 0.3, stroke: 'red' });
    if (creep.transfer(Target, creep.memory.Target.NeedSources[0]) == ERR_NOT_IN_RANGE) {
        creep.moveTo_Changed( Target);
        return;
    }
    else {
        if(CheckHaveCreepTargetResource(creep, creep.memory.Target.NeedSources,creep.memory.Target)==false){return;}
        if(Target.store.getFreeCapacity(creep.memory.Target.NeedSources[0])>=creep.store[creep.memory.Target.NeedSources[0]]){creep.memory.NeedGetSources = true;creep.memory.MinusSources = creep.store[creep.memory.Target.NeedSources[0]];}
        RemoveTarget(creep,Target)
        Action(creep);
        return;
    }
}
function RefreshTarget(creep)
{  
    var group = ToSortTargetGroup(creep.memory.TargetGroup, creep);
    if(group.length>0){      
    var GetTarget = group[0];
    if(GetTarget.NeedSources[0]==creep.memory.Target.NeedSources[0])
    {
    AddToTwoForkedTree(creep,creep.memory.Target); 
    creep.memory.Target=GetTarget;
    }
    else{return;    }
    }
}
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
function RemoveTarget(creep,Target)
{
    DeleteTheDeliverFromTarget(Target,creep);
    creep.memory.Target = null;
    creep.memory.UseContainer = null;
    creep.memory.AlreadyActionId = Target.id;
}
function DeleteTheDeliverFromTarget(Target, creep) 
{
    var group = Memory.spawner[creep.memory.Index].NeedEnergyGroup;
    if(group==undefined){return;}
    for (let i = 0; i < group.length; i++) {
        if(Target.structureType!=group[i].type){continue;}
        else
        {
if(group[i].structs[creep.memory.Target.NeedEnergyIndex]!=undefined){
           var nextgroup =  group[i].structs[creep.memory.Target.NeedEnergyIndex].IsAlreadySendRequest;
            for (let a = 0; a < nextgroup.length; a++) {
                if(nextgroup[a]==creep.id){nextgroup.splice(a,1);break;}
            }
        }
    }
        
    }
}
function CheckTargetNearUseContainer(creep, Target) {
    var AllUseContainer = new Array();
    for (let i = 0; i < Memory.spawner[creep.memory.Index].UseContainerGroup.length; i++) {
        if (Memory.spawner[creep.memory.Index].UseContainerGroup[i].Link == null) {
            AllUseContainer[AllUseContainer.length] = Memory.spawner[creep.memory.Index].UseContainerGroup[i];
        }
    }
    if (AllUseContainer.length == 0) {
        return false;
    }
    else {
        var storage = null;
        var Distance = 999;
        var UseContainer = null;
        for (let i = 0; i < AllUseContainer.length; i++) {
            var container = Game.getObjectById(AllUseContainer[i].Container);
            if ((container == null||container.id==Target.id) || container.store[creep.memory.Target.NeedSources[0]] < creep.store.getFreeCapacity()) {continue; }
            if(container.structureType==STRUCTURE_CONTAINER&&container.store[creep.memory.Target.NeedSources[0]]>=1900){                UseContainer = AllUseContainer[i].Container;break;}
          if(container.structureType==STRUCTURE_STORAGE){storage = container;continue};
            var distance2 = container.pos.getRangeTo(creep);
            if (distance2 < Distance) {
                Distance = distance2;
                UseContainer = AllUseContainer[i].Container;
            }

        }
        if (UseContainer == null&&storage!=null) { UseContainer = storage.id; }
        if(UseContainer==null){return false;}
        creep.memory.UseContainer = UseContainer;
        return true;
    }
}
function CheckHaveCreepTargetResource(creep, resourceGroup,Target) {
    let check = Game.getObjectById(Target.Id);
if(check!=null&&creep.store[resourceGroup[0]]>0){return true;}
    return false;
}
function Creep_signController(creep) {
    var text = '亚索搬运工，作者QQ1228042212';
 
    if (creep.room.controller != null && (creep.room.controller.sign == null || creep.room.controller.sign.text != text)) { if (creep.signController(creep.room.controller, text) == ERR_NOT_IN_RANGE) { creep.moveTo_Changed(creep.room.controller); return true; } }
return false;
}

module.exports = deliver;