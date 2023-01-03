// Refence format for all game objects
interface Ref {
    id?: Id<_HasId>;
    flagName?: string;
}

// Reference format for objects stored in memory
interface RefMem extends Array<string | number> {}
