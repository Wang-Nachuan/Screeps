/* Name: node.js
   Function: represention of a position/static object in game
*/

const C = require('./constant');

class Node {

    constructor(pos, type, id = null, isVirtual = false, filter = null) {
        this.pos = pos;             // (RoomPosition) {x: _, y: _, roomName: _}, roomName is required
        this.type = type;           // (String) Type of object at the position, see OBSTACLE_OBJECT_TYPES
        this.id = id;               // (String) ID of object
        // Virtual node: not a concrete node, but represent a set of nodes
        this.isVirtual = isVirtual; // (Boolean) Wheather the node is a virtual node
        this.filter = filter;       // (String) Filter used to find the real node
        this._virFlag = isVirtual;  // (Boolean) Indicate that whether the node is originally virtual
    }
    
    static pos(node) {
        return new RoomPosition(node.pos.x, node.pos.y, node.pos.roomName);
    }

    // Only applicable to virtual node
    static concretize(node) {
        if (node.isVirtual) {
            var target = this.filters[node.filter](Game.rooms[node.pos.roomName]);
            if (target != undefined) {
                node.pos = target.pos;
                node.id = target.id;
                node.isVirtual = false;
            }
        }
        return node;
    }

    // Only applicable to virtual node that have been concretized before
    static virtualize(node) {
        if (node._virFlag) {
            node.isVirtual = true;
            node.id = null;
        }
        return node;
    }

    static filters = {

        // Active source
        source: function(room) {
            return room.find(FIND_SOURCES_ACTIVE)[0];
        },

        // Energy storage structure with free capacity
        energyStore: function (room) {
            return room.find(FIND_MY_STRUCTURES, {
                filter: (obj) => {
                    return (obj.structureType == STRUCTURE_EXTENSION || obj.structureType == STRUCTURE_SPAWN) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            })[0];
        },

        // Construction site that has been issued
        constructSite: function(room) {
            return room.find(FIND_MY_CONSTRUCTION_SITES, {
                filter: (obj) => {
                    return Memory.constructQueue.sche.includes(obj.id);
                }
            })[0];
        },

    };
}

module.exports = Node;