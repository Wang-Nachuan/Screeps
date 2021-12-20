const C = require("./constant");
module.exports = Node;

class Node {

    constructor(pos, type, id = null, monitor = null) {
        this.pos = pos;             // (RoomPosition) {x: _, y: _, roomName: _}
        this.type = type;           // (string) type of object at the position, see OBSTACLE_OBJECT_TYPES
        this.id = id;               // (string) id of object, if any
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
        return Game.getModule(node.monitor.modulePath)[node.monitor.key](node.id);
    }
}