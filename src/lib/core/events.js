
export class EventHub {
    constructor() {
        this._onHandlers = {};
        this._beforeHandlers = {};
    }

    before(eventTypes, handler) {
        return this._addHandler(eventTypes, this._beforeHandlers, handler);
    }

    on(eventTypes, handler) {
        return this._addHandler(eventTypes, this._onHandlers, handler);
    }

    removeBefore(eventTypes, handler) {
        return this._removeHandler(eventTypes, this._beforeHandlers, handler);
    }

    removeOn(eventTypes, handler) {
        return this._removeHandler(eventTypes, this._onHandlers, handler);
    }

    _addHandler(eventTypes, handlers, handler) {
        eventTypes = eventTypes.split(",");
        eventTypes.forEach(function(eventType) {
            eventType = eventType.trim();
            handlers[eventType] = handlers[eventType] || [];
            handlers[eventType].push(handler);
        });
        return this;
    }

    _removeHandler(handlers, handler) {
        eventTypes = eventTypes.split(",");
        eventTypes.forEach(function(eventType) {
            eventType = eventType.trim();
            var evHandlers = handlers[eventType] || [];
            for (var i = 0;i < evHandlers.length;i++) {
                if (evHandlers[i] == handler) {
                    evHandlers.splice(i, 1);
                    break;
                }
            }
        });
        return this;
    }

    /**
     * This is called after a particular change has been approved to notify that 
     * a change has indeed gone through.
     */
    validateBefore(eventType, event) {
        return this._trigger(eventType, this._beforeHandlers, event);
    }
    triggerOn(eventType, event) {
        return this._trigger(eventType, this._onHandlers, event);
    }

    _trigger(eventType, handlers, event) {
        handlers = handlers[eventType] || [];
        var L = handlers.length;
        for (var i = 0;i < L;i++) {
            var handler = handlers[i];
            if (handler(event, eventType) == false) {
                return false;
            }
        }
        return true;
    }
}

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
