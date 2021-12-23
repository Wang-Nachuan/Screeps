/* Name: node.js
   Function: represention of a position/static object in game
*/

const C = require('./constant');

class Node {

    constructor(pos, type, id = null) {
        this.pos = pos;             // (RoomPosition) {x: _, y: _, roomName: _}
        this.type = type;           // (String) type of object at the position, see OBSTACLE_OBJECT_TYPES
        this.id = id;               // (String) id of object
    }
    
    static pos(node) {
        return new RoomPosition(node.pos.x, node.pos.y, node.pos.roomName);
    }
}

module.exports = Node;