class Constant {

    // Priority (the smaller the higher the priority)
    static get HOLYSHIT() {return 0};
    static get URGENT() {return 1};
    static get NORMAL() {return 2};
    static get TRIVIAL() {return 3};

    // Task type
    static get S() {return 0};      // Single 
    static get P() {return 1};      // Persistent 
    static get EE() {return 2};     // Event & Emergency 
    static get ED() {return 2};     // Event & Dynamic
}

module.exports = Constant;