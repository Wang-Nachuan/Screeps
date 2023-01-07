/**
 *  Prototype classes
 */

// For game objects (which have fixed memory space)
export abstract class ObjectProto {
    protected _isWritten: boolean = false;

    // Read/write the memory space of this object
    abstract get mem(): any;
    abstract set mem(val: any);

    // Compress data to a compact package (to be stored in memory)
    abstract zip();

    // Unzip and load the object with package data
    abstract unzip(pkg: any);

    // Write back latest data to memory
    writeBack() {
        if (this._isWritten) {
            this.zip();
            this._isWritten = false;
        }  
    };
}

// For meta data (which does not have fixed memory space)
export abstract class DataProto {

    // Compress data to a compact package (to be stored in memory)
    abstract zip(): any;

    // Unzip and load the object with package data
    abstract unzip(pkg: any);
}