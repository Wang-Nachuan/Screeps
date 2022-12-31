/**
 *  Base class for all objects/controller in a room
 */

export abstract class Proto {
    id: any;        // Object's id
    freq: number;   // Frequncy of executing act() function, in terms of number of tick
    mem: any;       // Memory reference
    obj: any;       // Object itself

    constructor(mem: any, id: any, freq: number = 1) {
        this.id = id;
        this.freq = freq;
        this.mem = mem;
        // this.obj = Game.getObjectById(id);
        this.obj = null;
    }

    /*  Compress information to a light-weight package to store it in memory
        Input: None
        Return: Set of compressed data
    */
    zip(mem: any): any {
        mem.i = this.id;
        mem.f = this.freq;
    };

    /*  Extract information from the package in memory, then set properties with them
        Input:
            - mem: memory reference of packaged data
        Return: None
    */
    unzip(mem: any): any {
        this.id = mem.i;
        this.freq = mem.f;
        this.mem = mem;
        // this.obj = Game.getObjectById(mem.i);
        this.obj = null;
    };

    // Do something
    abstract act(): any;
}