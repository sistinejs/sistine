
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

export class LocationChanged extends Event {
    constructor(oldX, oldY, newX, newY) {
        super(null)
        this.oldX = oldX;
        this.newX = newX;
        this.oldY = oldY;
        this.newY = newY;
    }

    get name() { return "LocationChanged"; };
}

export class SizeChanged extends Event {
    constructor(oldWidth, oldHeight, newWidth, newHeight) {
        super(null)
        this.oldWidth = oldWidth;
        this.newWidth = newWidth;
        this.oldHeight = oldHeight;
        this.newHeight = newHeight;
    }

    get name() { return "SizeChanged"; };
}

export class AngleChanged extends Event {
    constructor(oldAngle, newAngle) {
        super(null)
        this.oldAngle = oldAngle;
        this.newAngle = newAngle;
    }

    get name() { return "AngleChanged"; };
}

export class PropertiesChanged extends Event {
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
