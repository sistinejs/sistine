
import * as counters from "./counters";

export class EventHandler {
    handleBefore(event) { }
    handleOn(event) { }
}

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

    ensureHub() {
        if (this._eventHub == null) {
            this._eventHub = new EventHub();
        }
        return this._eventHub;
    }

    addHandler(eventTypes, handler) {
        this.ensureHub().addHandler(eventTypes, handler);
        return this;
    }

    removeHandler(eventTypes, handler) {
        this.ensureHub().removeHandler(eventTypes, handler);
        return this;
    }

    on(eventTypes, callback) {
        this.ensureHub().on(eventTypes, callback);
        return this;
    }

    before(eventTypes, callback) {
        this.ensureHub().before(eventTypes, callback);
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
        this._onCallbacks = {};
        this._beforeCallbacks = {};
        this._callbacks = {};
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

    before(eventTypes, callback) {
        return this._addHandler(eventTypes, this._beforeCallbacks, callback);
    }

    on(eventTypes, callback) {
        return this._addHandler(eventTypes, this._onCallbacks, callback);
    }

    removeBefore(eventTypes, callback) {
        return this._removeHandler(eventTypes, this._beforeCallbacks, callback);
    }

    removeOn(eventTypes, callback) {
        return this._removeHandler(eventTypes, this._onCallbacks, callback);
    }

    addHandler(eventTypes, handler) {
        return this._addHandler(eventTypes, this._handlers, handler);
    }

    removeHandler(eventTypes, handler) {
        return this._removeHandler(eventTypes, this._handlers, handler);
    }

    _addHandler(eventTypes, handlerlist, handler) {
        eventTypes = eventTypes.split(",");
        eventTypes.forEach(function(eventType) {
            eventType = eventType.trim();
            handlerlist[eventType] = handlerlist[eventType] || [];
            handlerlist[eventType].push(handler);
        });
        return this;
    }

    _removeHandler(handlerlist, handler) {
        eventTypes = eventTypes.split(",");
        eventTypes.forEach(function(eventType) {
            eventType = eventType.trim();
            var evHandlers = handlerlist[eventType] || [];
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
        if (this._trigger(eventType, source, eventData, this._beforeCallbacks) == false) {
            return false;
        }
        for (var i = 0, L = (this._handlers[eventType] || []).length;i >= 0;i--) {
            if (handlers[i].handleBefore(eventType, source, eventData) == false) {
                return false;
            }
        }
        for (var i = this._next.length - 1;i >= 0;i --) {
            if (this._next[i].validateBefore(eventType, source, eventData) == false) {
                return false;
            }
        }
        return true;
    }
    triggerOn(eventType, source, eventData) {
        if (this._trigger(eventType, source, eventData, this._onCallbacks) == false) {
            return false;
        }
        for (var i = 0, L = (this._handlers[eventType] || []).length;i >= 0;i--) {
            if (handlers[i].handleOn(eventType, source, eventData) == false) {
                return false;
            }
        }

        // also go through handlers
        for (var i = this._next.length - 1;i >= 0;i --) {
            if (this._next[i].triggerOn(eventType, source, eventData) == false) {
                return false;
            }
        }
        return true;
    }

    _trigger(eventType, source, eventData, callbacks) {
        callbacks = callbacks[eventType] || [];
        var L = callbacks.length;
        for (var i = 0;i < L;i++) {
            var callback = callbacks[i];
            if (callback(eventType, source, eventData) == false) {
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

    get name() { return this.constructor.name; }

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
            throw Error("State '" + name + "' not yet registered.");
        }
        return this._states[name];
    }

    /**
     * Register a new state in the state machine.
     */
    registerState(state, isRoot) {
        var name = state.name;
        if (name in this._states) {
            throw Error("State '" + name + "' already registered.");
        }
        this._states[name] = state;
        if (isRoot || false) {
            this.rootState = state.name;
        }
    }

    handle(eventType, source, eventData) {
        if (this._currentState == null) return ;

        var nextState = this._currentState.handle(eventType, source, eventData);
        if (nextState != null) {
            if (nextState == "") {
                this.enter(this._rootState.name);
            } else {
                this.enter(this.getState(nextState));
            }
        }
    }
}

export class TransformChanged extends Event {
    constructor(source, command, oldValue, newValue) {
        super();
        this.source = source;
        this.command = command;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }

    get name() { return "TransformChanged"; }
}

export class BoundsChanged extends Event {
    constructor(source, property, oldValue, newValue) {
        super();
        this.source = source;
        this.property = property;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }

    get name() { return "BoundsChanged"; }
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

export class ElementAdded extends Event {
    constructor(parent, subject) {
        super();
        this.parent = parent;
        this.subject = subject;
    }

    get name() { return "ElementAdded"; }
}

export class ElementRemoved extends Event {
    constructor(parent, subject) {
        super();
        this.parent = parent;
        this.subject = subject;
    }

    get name() { return "ElementRemoved"; }
}

export class ElementIndexChanged extends Event {
    constructor(subject, oldIndex, newIndex) {
        super();
        this.subject = subject;
        this.oldIndex = oldIndex;
        this.newIndex = newIndex;
    }

    get name() { return "ElementIndexChanged"; }
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
