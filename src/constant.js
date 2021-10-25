class Constant {

    // Priority (the smaller the higher the priority)
    static get HOLYSHIT() {return 0};
    static get URGENT() {return 1};
    static get NORMAL() {return 2};
    static get TRIVIAL() {return 3};

    // Task character
    static get SINGLE() {return 0};     // Single 
    static get PERSIS() {return 1};     // Persistent 
    static get EVEEM() {return 2};      // Event & Emergency 
    static get EVEDY() {return 2};      // Event & Dynamic

    // Item type
    static get ENERGE() {return 0};         // Energy
    static get MINERAL() {return 1};        // Mineral
    static get DEPOSIT() {return 2};        // Deposit
    static get COMPOSITE() {return 3};      // Composite
    static get COMMODITIY() {return 4};     // Commodity


    static get X() {return 0};
}

module.exports = Constant;