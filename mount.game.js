module.exports = function () {
    _.assign(Game.prototype, methodExtension);
    for (var setField of fieldExtension) {
        setField;
    }
}

// Method extension
const methodExtension = {
    /* Load the module with given path to cache
       Input:
       - path
       Return:
       - module object
    */
    getModule(path) { 
        if (!path in Game.modules) {
            Game.modules[path] = require(path);
        }
        return Game.modules[path];
    },
}

// Field extention
const fieldExtension = [

    // modules
    Object.defineProperty(Game.prototype, 'modules', 
        {
            get: function() {
                if (!this._modules) {
                    this._modules = {};
                }
                return this._modules;
            },
            set: function(newValue) {
                this._modules = newValue;
            },
            enumerable: true,
            configurable: true
        }
    ),
    
    // // name
    // Object.defineProperty(Game.prototype, 'name', 
    //     {
    //         get: function() {
    //             if (!this._name) {
    //                 /* TODO */
    //             }
    //             return this._name;
    //         },
    //         set: function(newValue) {
    //             this._name = newValue;
    //         },
    //         enumerable: false,
    //         configurable: true
    //     }
    // ),
]