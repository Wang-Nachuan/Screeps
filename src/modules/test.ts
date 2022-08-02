export class Animal {
    type: string;
    name: string;

    constructor(type: string, name: string) {
        this.type = type;
        this.name = name;
    }

    method() {
        console.log('Animal method called')
    }
}

export class Zoo {
    animals: Array<Animal> = [];

    constructor(types: Array<string>, names: Array<string>) {
        for (var idx in types) {
            let animal: Animal = new Animal(types[idx], names[idx]);
            this.animals.push(animal);
        }
    }

    method() {
        console.log('Zoo method called')
    }
}