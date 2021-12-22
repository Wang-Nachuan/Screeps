/* Name: node.js
   Function: represention of a position/static object in game
*/

const C = require("./constant");

class Node {

    constructor(pos, type, id = null, monitor = null) {
        this.pos = pos;             // (RoomPosition) {x: _, y: _, roomName: _}
        this.type = type;           // (String) type of object at the position, see OBSTACLE_OBJECT_TYPES
        this.id = id;               // (String) id of object, if any
        this.monitor = monitor;     // (Object) {modulePath: 'path of module', key: 'key of monitor functioin'}
    }

    /* Run the monitor function (if exist) of this node
       Input: (node object) node object
       Return: whatever the function return / false if no monitor or id
    */
    static runMonitor(node) {
        if (node.monitor == null || node.id == null) {
            return false;
        }
        return require(node.monitor.modulePath)[node.monitor.key](node.id);
    }
}

module.exports = Node;