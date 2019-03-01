
export class EventHub {
    constructor() {
        this._onHandlers = {};
        this._beforeHandlers = {};
    }

    before(eventType, handler) {
        return this._addHandler(this._beforeHandlers, eventType, handler);
    }

    on(eventType, handler) {
        return this._addHandler(this._onHandlers, eventType, handler);
    }

    removeBefore(eventType, handler) {
        return this._removeHandler(this._beforeHandlers, eventType, handler);
    }

    removeOn(eventType, handler) {
        return this._removeHandler(this._onHandlers, eventType, handler);
    }

    _addHandler(handlers, eventType, handler) {
        if (!(eventType in handlers)) {
            handlers[eventType] = [];
        }
        handlers[eventType].push(handler);
        return this;
    }

    _removeHandler(handlers, eventType, handler) {
        handlers = handlers[eventType] || [];
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
    validateBefore(eventType, event) {
        return this._trigger(this._beforeHandlers, eventType, event);
    }
    triggerOn(eventType, event) {
        return this._trigger(this._onHandlers, eventType, event);
    }

    _trigger(handlers, eventType, event) {
        handlers = handlers[eventType] || [];
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
    constructor(source) {
        this.source = source;
    }

    get name() { null.a = 3; }
}

export class PropertyChanged extends Event {
    constructor(property, oldValue, newValue) {
        super(null)
        this.property = property;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }
}

export class ShapeAdded extends Event {
    constructor(parent, shape) {
        super(null)
        this.parent = parent;
        this.shape = shape;
    }
}

export class ShapeRemoved extends Event {
    constructor(parent, shape) {
        super(null)
        this.parent = parent;
        this.shape = shape;
    }
}
