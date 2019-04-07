import * as counters from "./counters";
import * as events from "./events";

const ElementCounter = new counters.Counter("ElementIDs");

export class Property {
    constructor(name, value) {
        this.name = name;
        this.inherit = value === undefined;
        this.set(value);
    }

    set(newValue, eventSource) {
        var oldValue = this.vaue;
        if (oldValue == newValue) 
            return null;
        var event = null;
        if (eventSource) {
            event = new events.PropertyChanged(this, property, oldValue, newValue);
            if (eventSource.validateBefore("PropertyChanged:" + this.name, event) == false)
                return false;
        }

        this.value = newValue || null;
        this.inherit = newValue === undefined;

        this.markUpdated();
        if (eventSource) 
            eventSource.triggerOn("PropertyChanged:" + this.name, event);
        return true;
    }

    markUpdated() { this.lastUpdated = Date.now(); }
}

export class Element extends events.EventSource {
    constructor() {
        super();
        this._uuid = ElementCounter.next();
        this._parent = null;
        this._defs = {};
        this._metadata = {};
        var self = this;
    }

    forEachChild(handler, self, mutable) {
        var children = this._children;
        if (mutable == true) {
            children = children.slice(0, children.length);
        }
        for (var index in children) {
            var child = children[index];
            if (handler(child, index, self) == false)
                break;
        }
    }

    /**
     * Makes the value of a particular property inherited.
     */
    inherit(property) {
    }

    isInherited(property) {
    }

    get uuid() { return this._uuid; }

    getMetaData(key) { return this._metadata[key] || null; }
    setMetaData(key, value) { this._metadata[key] = value; return this; }

    markUpdated() { this._lastUpdated = Date.now(); }

    get hasChildren() { return false; }
    get childCount() { return 0; } 

    get parent() { return this._parent; } 

    /**
     * Adds a new element to this group.
     * Returns true if a element was successfully added
     * false if the addition was blocked.
     */
    add(element, index) {
        index = index || -1;
        if (element.parent != this) {
            var event = new events.ElementAdded(this, element);
            if (this.validateBefore("ElementAdded", event) != false) {
                // remove from old parent - Important!
                if (element.removeFromParent()) {
                    this._children.push(element);
                    element._parent = this;
                    element.setScene(this.scene);
                    this.triggerOn("ElementAdded", event);
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Removes an existing element from this group.
     * Returns true if a element was successfully removed,
     * false if the removal was blocked.
     */
    remove(element) {
        if (element.parent == this) {
            var event = new events.ElementRemoved(this, element);
            if (this.validateBefore("ElementRemoved", event) != false) {
                for (var i = 0;i < this._children.length;i++) {
                    if (this._children[i] == element) {
                        this._children.splice(i, 1);
                        element._parent = null;
                        this.triggerOn("ElementRemoved", event);
                        return true;
                    }
                }
            }
        }
        return false;
    }

    removeAll() {
        for (var i = 0;i < this._children.length;i++) {
            this._children[i].removeFromParent();
        }
        this._children = [];
    }

    removeFromParent() {
        if (this.parent == null) return true;
        if (this.parent.remove(this)) {
            this._parent = null;
            return true;
        }
        return false;
    }
    
    /**
     * Changes the index of a given element within the parent.  The indexOrDelta 
     * parameter denotes whether a element is to be moved to an absolute index or 
     * relative to its current position depending on the 'relative' parameter.
     */
    changeIndexTo(element, indexOrDelta, relative) {
        if (element.parent != this) return ;

        var newIndex = indexOrDelta;
        if (relative || false) {
            newIndex = index + indexOrDelta;
        }

        if (newIndex < 0)
            newIndex = 0;
        if (newIndex >= this._children.length)
            newIndex = this._children.length - 1;

        var index = this._children.indexOf(element);
        if (newIndex == index) {
            return ;
        }
        var event = new events.ElementIndexChanged(element, index, newIndex);
        if (this.validateBefore("ElementIndexChanged", event) != false) {
            this._children.splice(index, 1);
            this._children.splice(newIndex, 0, element);
            this.triggerOn("ElementIndexChanged", event);
        }
    }

    /**
     * Brings a child element forward by one level.
     */
    bringForward(element) {
        return this.changeIndexTo(element, 1, true);

        if (index >= 0 && index < this._children.length - 1) {
            var temp = this._children[index];
            this._children[index] = this._children[index + 1];
            this._children[index + 1] = temp;
        }
    }

    /**
     * Sends a child element backward by one index.
     */
    sendBackward(element) {
        return this.changeIndexTo(element, -1, true);

        if (index > 0) {
            var temp = this._children[index];
            this._children[index] = this._children[index - 1];
            this._children[index - 1] = temp;
        }
    }

    /**
     * Brings a child element to the front of the child stack.
     */
    bringToFront(element) {
        return this.changeIndexTo(element, this._children.length, false);

        if (element.parent != this) return ;
        var index = this._children.indexOf(element);
        if (index >= 0 && index < this._children.length - 1) {
            this._children.splice(index, 1);
            this._children.push(element);
        }
    }

    /**
     * Sends a child element to the back of the child stack.
     */
    sendToBack(element) {
        return this.changeIndexTo(element, 0, false);

        if (index > 0) {
            this._children.splice(index, 1);
            this._children.splice(0, 0, element);
        }
    }
}
