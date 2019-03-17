
class Counter {
    constructor(name) {
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

class NameIdMap {
    constructor(name) {
        this._idCounter = new Counter(name);
        this._idMap = {};
    }

    register(name) {
        if (!(name in this._idMap)) {
            this._idMap[name] = this._idCounter.next();
        }
        return this._idMap[name];
    }
}
