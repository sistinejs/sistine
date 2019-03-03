
export class EventSource {
    constructor() {
        this._eventHub = new EventHub();
    }

    on(eventTypes, handler) {
        if (this._eventHub == null) {
            this._eventHub = new EventHub();
        }
        this._eventHub.on(eventTypes, handler);
        return this;
    }

    before(eventTypes, handler) {
        if (this._eventHub == null) {
            this._eventHub = new EventHub();
        }
        this._eventHub.before(eventTypes, handler);
        return this;
    }

    validateBefore(eventTypes, event) {
        event.source = this;
        return this._eventHub.validateBefore(eventTypes, event) != false;
    }

    triggerOn(eventTypes, event) {
        event.source = this;
        return this._eventHub.triggerOn(eventTypes, event) != false;
    }
}

export class EventHub {
    constructor(next) {
        this._onHandlers = {};
        this._beforeHandlers = {};
        this.next = next;
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
        if (this._trigger(eventType, this._beforeHandlers, event) == false) {
            return false;
        }
        if (this.next != null) {
            return this.next.validateBefore(eventType, event) != false;
        }
        return true;
    }
    triggerOn(eventType, event) {
        if (this._trigger(eventType, this._onHandlers, event) == false) {
            return false;
        }
        if (this.next != null) {
            return this.next.triggerOn(eventType, event) != false;
        }
        return true;
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
    constructor(shape, property, oldValue, newValue) {
        super("PropertyChanged", shape)
        this.property = property;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }
}

export class ShapeAdded extends Event {
    constructor(parent, shape) {
        super("ShapeAdded", null);
        this.parent = parent;
        this.shape = shape;
    }
}

export class ShapeRemoved extends Event {
    constructor(parent, shape) {
        super("ShapeRemoved", null);
        this.parent = parent;
        this.shape = shape;
    }
}

export class ShapeIndexChanged extends Event {
    constructor(shape, oldIndex, newIndex) {
        super("ShapeIndexChanged", shape)
        this.oldIndex = oldIndex;
        this.newIndex = newIndex;
    }
}

