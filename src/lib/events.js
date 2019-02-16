
export class EventHandler {
    /**
     * All events are syncronous and follow a "shouldTriggerX" followed by a 
     * "triggerX" call.  This is a chance for listeners to "prevent" the sending 
     * of the event there by preventing a certain change that may be going on.
     */
    shouldTrigger(event) {
        return true;
    }

    /**
     * This is called after a particular change has been approved to notify that 
     * a change has indeed gone through.
     */
    eventTriggered(event) {
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
