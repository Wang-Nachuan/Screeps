/**
 *  Prototype classes
 */

// For game objects (which have fixed memory space)
export abstract class ObjectProto {

    // Write back latest data to memory
    abstract wb();

    // Unzip and load the object with package data
    abstract load();

    // Wrapper function
    abstract exe();
}

// For meta data (which does not have fixed memory space)
export abstract class DataProto {

    // Compress data to a compact package (to be stored in memory)
    abstract zip(): any;

    // Unzip and load the object with package data
    abstract unzip(pkg: any);
}