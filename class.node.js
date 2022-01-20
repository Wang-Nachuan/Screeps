/* Name: node.js
   Function: represention of a position/static object in game
*/

const C = require('./constant');

class Node {

    constructor(pos, type, id = null, isVirtual = false, filter = null) {
        this.pos = pos;             // (RoomPosition) {x: _, y: _, roomName: _}, roomName is required
        this.type = type;           // (String) Type of object at the position, see OBSTACLE_OBJECT_TYPES
        this.id = id;               // (String) ID of object
        this.isVirtual = isVirtual; // (Boolean) Wheather the node is a virtual node
        this.filter = filter;       // (String) Filter used to find the real node
        this._virFlag = isVirtual;  // (Boolean) Indicate that whether the node is originally virtual
        this.attach = [];           // (String) ID of creeps that is working on this node
        this.request = [];          // (List if num) Proposed request
    }
    
    static pos(node) {
        return new RoomPosition(node.pos.x, node.pos.y, node.pos.roomName);
    }

    /* Only applicable to virtual node
    */ 
    static concretize(node, creep) {
        if (node.isVirtual) {
            var target = this.filters[node.filter](Game.rooms[node.pos.roomName], creep);
            if (target != undefined) {
                node.pos = target.pos;
                node.id = target.id;
                node.isVirtual = false;
                // Attach object to the node (no need to search in memory)
                if (!node.attach.includes(creep.id)) {node.attach.push(creep.id);}
                return node;
            } else {
                return null;
            }
        }

        // Attach object to the node (need to search in memory)
        var pool = Memory.nodePool[node.pos.roomName][node.type];
        if (pool != undefined) {
            for (var i of pool) {
                if (i.id == node.id) {
                    if (!i.attach.includes(creep.id)) {i.attach.push(creep.id);}
                    break;
                }
            }
        }
        return node;
    }

    /* Only applicable to virtual node that have been concretized before
    */ 
    static virtualize(node, creep) {
        var pool = Memory.nodePool[node.pos.roomName][node.type];

        // Detach object from the node (do not need to search in memory)
        if (pool != undefined) {
            for (var i of pool) {
                if (i.id == node.id) {
                    var idx = i.attach.indexOf(creep.id);
                    if (idx != -1) {i.attach.splice(idx, 1);}
                    break;
                }
            }
        }

        if (node._virFlag) {
            node.isVirtual = true;
            node.id = null;
        }
        return node;
    }

    static filters = {

        // Active source
        source: function(room, creep) {
            var node_list = [];
            
            // Loop through memory to find the node
            for (var node of Memory.nodePool[room.name].source) {
                var dist = creep.pos.getRangeTo(node.pos.x, node.pos.y);
                node_list.push([dist, node]);
            }

            // Sort distance in increasing order
            node_list.sort(function(a, b) {return a[0] - b[0];});

            // Find the cloest node whose attach number is within the limit
            var limit = Memory.agents.demeter.statistics.attachLimit;
            for (var i of node_list) {
                if (i[1].attach.length < limit) {
                    return i[1];
                }
            }

            // If node found, simply chose the cloest node
            return node_list[0][1];
        },

        // Energy storage structure with free capacity
        energyStore: function (room, creep) {
            return room.find(FIND_MY_STRUCTURES, {
                filter: (obj) => {
                    return ([STRUCTURE_EXTENSION, STRUCTURE_SPAWN, STRUCTURE_STORAGE].includes(obj.structureType)) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            })[0];
        },

        // Energy storage structure with energy available
        energyAvai: function (room, creep) {
            return room.find(FIND_MY_STRUCTURES, {
                filter: (obj) => {
                    return ([STRUCTURE_EXTENSION, STRUCTURE_SPAWN, STRUCTURE_STORAGE].includes(obj.structureType)) &&
                        structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
                }
            })[0];
        },

        // Construction site that has been issued
        constructSite: function(room, creep) {
            var found = room.find(FIND_MY_CONSTRUCTION_SITES);
            for (var site of found) {
                for (var node of Memory.constructQueue.sche) {
                    if (node.id == site.id) {return site;}
                }
            }
        },

    };
}

module.exports = Node;