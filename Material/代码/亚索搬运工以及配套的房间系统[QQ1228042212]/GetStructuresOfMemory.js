/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('GetStructuresOfMemory');
 * mod.thing == 'a thing'; // true
 */
var Get = 
{
    run:function(RoomSpawn,structureType,isAll)
    {
        if(isAll)
        {
            var GetObjGroup =new Array();
            for (let i = 0; i < RoomSpawn.Allstructs.length; i++) {
                for (let b = 0; b < RoomSpawn.Allstructs[i].structs.length; b++) {
                    var obj = Game.getObjectById(RoomSpawn.Allstructs[i].structs[b]);
                    if(obj==null)
                    {
                        RoomSpawn.Allstructs[i].structs.splice(b,1);
                        CheckIsInSpawner(RoomSpawn.Allstructs[i],RoomSpawn,RoomSpawn.Allstructs[i].type);
                        b--;
                        continue;
                    }
                    else
                    {
                        GetObjGroup[GetObjGroup.length]=obj;
                    }
                }
            }
            return       GetObjGroup;
        }
      var index = checkIsHaveStructureType(structureType,RoomSpawn.Allstructs)
      var GetObjGroup =new Array();
      if(index==-1)
      {
          return GetObjGroup;
      }
      for (let i = 0; i < RoomSpawn.Allstructs[index].structs.length; i++) {
          var obj = Game.getObjectById(RoomSpawn.Allstructs[index].structs[i]);
        if(obj==null)
        {
            RoomSpawn.Allstructs[index].structs.splice(i,1);
            CheckIsInSpawner(RoomSpawn.Allstructs[i],RoomSpawn,structureType);
            i--;
            continue;
        }
        else
        {
            GetObjGroup[i]=obj;
        }
      }
      return GetObjGroup;
    }
    ,GetIndex:function(RoomName)
    {
for (let i = 0; i < Memory.spawner.length; i++) 
{
    if(Memory.spawner[i].Name==RoomName)
    {
        return i;
    }
}
return -1;
    }
}
function CheckIsInSpawner(Allstructsi,RoomSpawn,TYPE)
{switch(TYPE)
    {
        case STRUCTURE_CONTAINER:
            for (let i = 0; i < RoomSpawn.Container.length; i++) {
                if(RoomSpawn.Container[i]==Allstructsi)
                {
                    RoomSpawn.Container.spilice(i,1);
                    i--;
                }
            }
            for (let i = 0; i < RoomSpawn.otherContainer.length; i++) {
                if(RoomSpawn.otherContainer[i]==Allstructsi){
                RoomSpawn.otherContainer.spilice(i,1);
                i--;           
                }
            }
        break;
        case STRUCTURE_TOWER:
            for (let i = 0; i < RoomSpawn.Tower.length; i++) {
                if(RoomSpawn.Tower[i]==Allstructsi)
                {
                    RoomSpawn.Tower.spilice(i,1);
                    i--;           
                }
            }
            break;
    }

}
function checkIsHaveStructureType(structtype,array)
{
for (let i = 0; i < array.length; i++) {
    if(array[i].type==structtype)
    {
        return i;
    }
    
}
return -1;
}
module.exports = Get;