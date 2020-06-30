
export class Counter {
    _name : string;
    _value : number = 0;
    constructor(name : string) {
        this._name = name;
        this._value = 0;
    }

    get current() {
        return this._value;
    }

    next() {
        return ++this._value;
    }
}

export class NameIdMap {
    _idCounter : Counter;
    _idMap : any = {};
    constructor(name : string) {
        this._idCounter = new Counter(name);
    }

    register(name : string) {
        if (!(name in this._idMap)) {
            this._idMap[name] = this._idCounter.next();
        }
        return this._idMap[name];
    }
}
