
export class EventHub {
    constructor() {
        this._onHandlers = [];
        this._beforeHandlers = [];
    }

    before(handler) {
        return this._addHandler(this._beforeHandlers, handler);
    }

    on(handler) {
        return this._addHandler(this._onHandlers, handler);
    }

    removeBefore(handler) {
        return this._removeHandler(this._beforeHandlers, handler);
    }

    removeOn(handler) {
        return this._removeHandler(this._onHandlers, handler);
    }

    _addHandler(handlers, handler) {
        handlers.push(handler);
        return this;
    }

    _removeHandler(handlers, handler) {
        for (var i = 0;i < handlers.length;i++) {
            if (handlers[i] == handler) {
                handlers.splice(i, 1);
                break;
            }
        }
        return this;
    }

    /**
     * This is called after a particular change has been approved to notify that 
     * a change has indeed gone through.
     */
    validateBefore(event) {
        return this._trigger(this._beforeHandlers, event);
    }
    triggerOn(event) {
        return this._trigger(this._onHandlers, event);
    }

    _trigger(handlers, event) {
        var L = handlers.length;
        for (var i = 0;i < L;i++) {
            var handler = handlers[i];
            if (handler(event) == false) {
                return false;
            }
        }
        return true;
    }
}

export const GlobalHub = new EventHub();

export class Event {
    constructor(name, source) {
        this.name = name;
        this.source = source;
    }
}

export class PropertyChanged extends Event {
    constructor(property, oldValue, newValue) {
        super("PropertyChanged", null)
        this.property = property;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }
}

export class ShapeAdded extends Event {
    constructor(parent, shape) {
        super("ShapeAdded", null)
        this.parent = parent;
        this.shape = shape;
    }
}

export class ShapeRemoved extends Event {
    constructor(parent, shape) {
        super("ShapeRemoved", null)
        this.parent = parent;
        this.shape = shape;
    }
}
