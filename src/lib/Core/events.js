
import * as counters from "./counters";

export class Event {
    constructor() {
        this._eventType = null ; // eventType;
        this._timeStamp = Date.now();
        this._suppressed = false;
    }

    get timeStamp() {
        return this._timeStamp;
    }

    suppress() {
        this._suppressed = true;
    }

    get wasSuppressed() {
        return this._suppressed;
    }

    get eventType() {
        return this._eventType;
    }
}

export class EventSource {
    constructor() {
        this._eventHub = new EventHub();
    }

    get eventHub() {
        return this._eventHub;
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

    validateBefore(eventType, eventData) {
        var source = this;
        return this._eventHub.validateBefore(eventType, source, eventData) != false;
    }

    triggerOn(eventType, eventData) {
        var source = this;
        return this._eventHub.triggerOn(eventType, source, eventData) != false;
    }

    validateAndTrigger(eventType, eventData, action) {
        var source = this;
        return this._eventHub.validateAndTrigger(eventType, source, eventData, action);
    }
}

export class EventHub {
    constructor(next) {
        this._onHandlers = {};
        this._beforeHandlers = {};
        this._next = [];
        if (next != null) {
            this._next.push(next);
        }
    }

    chain(another) {
        if (another != null) {
            if (this._next.findIndex(function(value) { return value == another; }) < 0) {
                this._next.push(another);
            }
        }
    }

    unchain(another) {
        if (another != null) {
            var index = this._next.findIndex(function(value) { return value == another; });
            if (index >= 0) {
                this._next.splice(index, 1);
            }
        }
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
    validateBefore(eventType, source, eventData) {
        if (this._trigger(eventType, source, eventData, this._beforeHandlers) == false) {
            return false;
        }
        for (var i = this._next.length - 1;i >= 0;i --) {
            if (this._next[i].validateBefore(eventType, source, eventData) == false) {
                return false;
            }
        }
        return true;
    }
    triggerOn(eventType, source, eventData) {
        if (this._trigger(eventType, source, eventData, this._onHandlers) == false) {
            return false;
        }
        for (var i = this._next.length - 1;i >= 0;i --) {
            if (this._next[i].triggerOn(eventType, source, eventData) == false) {
                return false;
            }
        }
        return true;
    }

    _trigger(eventType, source, eventData, handlers) {
        handlers = handlers[eventType] || [];
        var L = handlers.length;
        for (var i = 0;i < L;i++) {
            var handler = handlers[i];
            if (handler(eventType, source, eventData) == false) {
                return false;
            }
        }
        return true;
    }

    validateAndTrigger(eventType, source, eventData, action) {
        if (this.validateBefore(eventType, source, eventData) == false) 
            return false;
        action();
        return this.triggerOn(eventType, source, eventData) != false;
    }
}

const StateIdCounter = new counters.Counter("StateIds");

export class State {
    constructor() {
        this._id = StateIdCounter.next();
    }

    get id() { return this._id; }

    enter(data) { this.stateData = data; }
}

export class StateMachine {
    constructor() {
        this._states = {};
        this._rootState = null;
        this._currentState = null;
    }

    set rootState(name) {
        this._rootState = this.getState(name);
        if (this._currentState == null) {
            this._currentState = this._rootState;
        }
    }

    /**
     * Exists the current state (if any) and enters a new state.
     */
    enter(state, data) {
        if (state == "") {
            this._currentState = this._rootState;
        } else {
            this._currentState = this.getState(state);
        }
        if (this._currentState != null) {
            this._currentState.enter(data);
        }
    }

    /**
     * Get a new state given.
     */
    getState(name) {
        if (!(name in this._states)) {
            throw Error("State '" + name + "' not yet registered");
        }
        return this._states[name];
    }

    /**
     * Register a new state in the state machine.
     */
    registerState(name, state, isRoot) {
        this._states[name] = state;
        if (isRoot || false) {
            this.rootState = name;
        }
    }

    handle(eventType, source, eventData) {
        if (this._currentState == null) return ;

        var nextState = this._currentState.handle(eventType, source, eventData);
        if (nextState != null) {
            if (nextState == "") {
                this.enter(this._rootState);
            } else {
                this.enter(this.getState(nextState));
            }
        }
    }
}

export class GeometryChanged extends Event {
    constructor(source, property, oldValue, newValue) {
        super();
        this.source = source;
        this.property = property;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }

    get name() { return "GeometryChanged"; }
}

export class PropertyChanged extends Event {
    constructor(source, property, oldValue, newValue) {
        super();
        this.source = source;
        this.property = property;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }

    get name() { return "PropertyChanged"; }
}

export class ShapeAdded extends Event {
    constructor(parent, shape) {
        super();
        this.parent = parent;
        this.shape = shape;
    }

    get name() { return "ShapeAdded"; }
}

export class ShapeRemoved extends Event {
    constructor(parent, shape) {
        super();
        this.parent = parent;
        this.shape = shape;
    }

    get name() { return "ShapeRemoved"; }
}

export class ShapeIndexChanged extends Event {
    constructor(shape, oldIndex, newIndex) {
        super();
        this.shape = shape;
        this.oldIndex = oldIndex;
        this.newIndex = newIndex;
    }

    get name() { return "ShapeIndexChanged"; }
}

export class ShapesSelected extends Event {
    constructor(selection, shapes) {
        super();
        this.selection = selection;
        this.shapes = shapes;
    }

    get name() { return "ShapesSelected"; }
}

export class ShapesUnselected extends Event {
    constructor(selection, shapes) {
        super();
        this.selection = selection;
        this.shapes = shapes;
    }

    get name() { return "ShapesUnselected"; }
}
