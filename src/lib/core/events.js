
export class EventDispatcher {
    constructor() {
        this._handlers = [];
    }

    addHandler(handler) {
        var i = this._handlers.indexOf(handler);
        if (i < 0) {
            this._handlers.push(handler);
        }
    }

    removeHandler(handler) {
        var i = this._handlers.indexOf(handler);
        if (i >= 0) {
            this._handlers.splice(i, 1);
        }
    }

    /**
     * All events are syncronous and follow a "shouldTriggerX" followed by a 
     * "triggerX" call.  This is a chance for listeners to "prevent" the sending 
     * of the event there by preventing a certain change that may be going on.
     */
    validateBefore(event) {
        for (var i = 0, L = this._handlers.length;i < L;i++) {
            var handler = this._handlers[i];
            if (handler.beforeEvent(event) == false) {
                return false;
            }
        }
        return true;
    }

    /**
     * This is called after a particular change has been approved to notify that 
     * a change has indeed gone through.
     */
    triggerOn(event) {
        var L = this._handlers.length;
        for (var i = L - 1;i >= 0;i--) {
            var handler = this._handlers[i];
            if (handler.eventTriggered(event) == false) {
                return false;
            }
        }
        return true;
    }
}

export class EventHandler {
    /**
     * All events are syncronous and follow a "shouldTriggerX" followed by a 
     * "triggerX" call.  This is a chance for listeners to "prevent" the sending 
     * of the event there by preventing a certain change that may be going on.
     */
    beforeEvent(event) {
        return true;
    }

    /**
     * This is called after a particular change has been approved to notify that 
     * a change has indeed gone through.
     */
    onEvent(event) {
    }
}

export class Event {
    constructor(source) {
        this.source = source;
    }

    get name() { return "Event"; };
}

export class PropertyChanged extends Event {
    constructor(property, oldValue, newValue) {
        super(null)
        this.property = property;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }

    get name() { return "PropertyChanged"; };
}

export class ShapeAdded extends Event {
    constructor(parent, shape) {
        super(null)
        this.parent = parent;
        this.shape = shape;
    }

    get name() { return "ShapeAdded"; };
}

export class ShapeRemoved extends Event {
    constructor(parent, shape) {
        super(null)
        this.parent = parent;
        this.shape = shape;
    }

    get name() { return "ShapeRemoved"; };
}
