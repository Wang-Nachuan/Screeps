/* Name: class.memory.js
   Function: memory structure/interface
*/

const Node = require('./class.node');
const C = require('./constant');

class MemoryIO {

    /* Initialize memory
    */
    static init() {
        if (!Memory.initFlag) {
            Memory.initFlag = true;
            // Room data
            Memory.room = {};
            // Inter-room data
            Memory.interRoom = {};
            // Collection of statistics
            Memory.statistics = {};
            // Store agents' data
            Memory.agent = {
                demeter: {
                    process = [],
                    msg = []
                },
                hephaestus: {
                    process = [],
                    msg = []
                },
                minerva: {
                    process = [],
                    msg = []
                }
            };
        }
    }

    /* Scan a room, generate room object and store it in memory (if old data exists in memory, cover it)
       Input: room name
       Return: none
    */
    static addRoom(roomName) {

        // Check for duplication
        if (Memory.room[roomName] && !cover) {return false;}

        var roomData = {
            // Task queue
            taskQueue = {
                prop: {
                    worker: [[], [], [], [], []],
                    transporter: [[], [], [], [], []]
                },
                sche: {
                    worker: [[], [], [], [], []],
                    transporter: [[], [], [], [], []]
                }
            },

            // Spawn queue
            spawnQueue = {
                prop: [[], [], []],
                sche: [[], [], []]
            },

            // Construction queue
            constructQueue = {
                prop: [],
                sche: []
            },

            // Creep pool
            creep = {
                worker: [],
                transporter: []
            },

            // Node pool
            node = {
                // Structure
                spawn: [], extension: [], road: [],constructedWall: [], rampart: [], keeperLair: [], portal: [], 
                controller: [], link: [], storage: [], tower: [], observer: [], powerBank: [], powerSpawn: [], 
                extractor: [], lab: [], terminal: [], container: [], nuker: [], factory: [], invaderCore: [],
                // Others
                source: [], mineral: []
            },

            // Block sequence
            blockSeq = {
                cursor: null,
                seq: null
            },

            // Statistics
            statistics = {
                energy: {
                    available: 0,
                    pinned: 0
                },
                nameCount: {
                    worker: 0,
                    transporter: 0
                },
                stdBody: {
                    worker: null,
                    transporter: null
                }
            },

            // Flages
            flage = {
                isDeveloping: false,
                owned: false
            },
        };
        var structures = Game.rooms[roomName].find(FIND_MY_STRUCTURES);
        var sources = Game.rooms[roomName].find(FIND_MY_STRUCTURES);
        var minerals = Game.rooms[roomName].find(FIND_MINERALS);

        
        roomData.statistics.energy.available = Game.rooms[roomName].energyAvailable;
        this.calBody(roomName);
    }

    /* Calculate standard body parts based on available energy in the room
       Input: room name
       Return: none
    */
    static calBody(roomName) {

    }
}

module.exports = MemoryIO;