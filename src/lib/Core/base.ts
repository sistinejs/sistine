import * as counters from "./counters";
import * as events from "./events";

export type Int = number;
export type Nullable<T> = T | null;
export type Timestamp = number;
const ElementCounter = new counters.Counter("ElementIDs");

/**
 * A property instance.  
 * Properties enable capturing some common behaviours for attributes 
 * on objects like inheritance from parents, default values, updated 
 * timestamps and change notifications.
 *
 * @param {string}   name   Name of the property (used only for debugging).
 * @param {Value}    value  Value of the property.  If the value is undefined 
 *                          then it is marked as "to be inherited".
 */
export class Property {
    name : string
    inherit : boolean
    constructor(name, value) {
        this.name = name;
        this.inherit = value === undefined;
        this.set(value);
    }

    /**
     * Clones the property instance.
     * @returns  {Property}     A shallow copy of this property with the same name, 
     *                          value and inherit flags.
     */
    clone() {
        return new Property(this.name, this.value);
    }

    /**
     * Sets the value of the property and also in the process notifies listeners (if any) of changes.
     * @param   {value}         newValue    The new value to set this property to.
     * @param   {EventSource}   eventSource The event source, if any, on which to notify listeners of changes.
     *
     * @returns {Bool}          true if the change was applied, false if change rejected by the eventSource's validation.
     */
    set(newValue, eventSource) {
        var oldValue = this.vaue;
        if (oldValue == newValue) 
            return null;
        var event = null;
        if (eventSource) {
            event = new events.PropertyChanged(this, property, oldValue, newValue);
            if (eventSource.validateBefore(event.name, event) == false)
                return false;
        }

        this.value = newValue || null;
        this.inherit = newValue === undefined;

        this.markUpdated();
        if (eventSource) 
            eventSource.triggerOn(event.name, event);
        return true;
    }

    /**
     * Sets the property's updated time stamp to now.
     */
    markUpdated() { this.lastUpdated = Date.now(); }
}

/**
 * Base of all Element nodes in a virtual document tree.  Elements allow for unique IDs
 * for instances, to have meta data and (ofcourse) child elements.  Elements play a key
 * role in building and maintaining Scenes with hierarchical shapes.
 */
export class Element extends events.EventSource {
    protected _parent : Nullable<Element> = null;
    private _uuid : Int = 0;
    private _defs : any = {};
    private _metadata : any = {};
    constructor() {
        super();
        this._uuid = ElementCounter.next();
    }

    /**
     * Returns a new instance of this element when cloning it.
     * @return {Element} 
     */
    newInstance() { return new this.constructor(); };

    /**
     * Performs a shallow copy of this element by creating a new instance of it
     * and copying over the children.
     * @return {Element} 
     */
    clone() {
        var out = this.newInstance();
        for (var i = 0;i < this.childCount;i++) {
            var child = this.childAtIndex(i);
            this.add(child.clone());
        }
        return out;
    }

    /**
     * Indicates whether a parent exists.
     *
     * @return {Bool} true if parent exists, false otherwise.
     */
    get hasParent() { return this._parent != null; }

    /**
     * A visitor method over the children.
     *
     * @param {Function<Element, int, TypeOf<This>>} handler
     *          A handler method to process each child.  If the handler returns a false, looping is stopped.
     * @param {Object}  caller
     *          In a typical callback pattern, the caller could be an object that will have to be scoped
     *          with a "self".  By passing the caller into this method, this creation of a local "self"
     *          variable can be avoided for cleanliness.
     * @param {Bool}  mutable
     *          If mutable is true, then modifications of the children is allowed.  This is done by
     *          making a copy of the child elements before looping over them.
     */
    forEachChild(handler, caller, mutable) {
        var children = this._children;
        if (mutable == true) {
            children = children.slice(0, children.length);
        }
        for (var index in children) {
            var child = children[index];
            if (handler(child, index, caller) == false)
                break;
        }
    }

    /**
     * Makes the value of a particular property inherited.
     */
    inherit(property) {
    }

    /**
     * Tells if a given property is inherited or not.
     */
    isInherited(property) {
    }

    /**
     * Returns the unique ID of this instance.
     * @returns {long}   Unique ID of this instance.
     */
    get uuid() { return this._uuid; }

    /**
     * Gets a particular metadata entry.
     *
     * @param {String} key   Key of the entry to return.
     *
     * @returns {Object} Value of the key if it exists, null otherwise.
     */
    getMetaData(key) { return this._metadata[key] || null; }

    /**
     * Sets a particular metadata entry.
     *
     * @param {String} key      Key of the entry to set.
     * @param {Object} value    Value of the entry to set.
     *
     * @returns {TypeOf<this>} This instance.
     */
    setMetaData(key, value) { this._metadata[key] = value; return this; }

    /**
     * Add a definition for a particular ID.  Definitions allow entries to
     * be referenced and reused without being duplicated.  Particularly useful
     * for pattern definitions for stroke and fill styles.
     *
     * @param {String}   id      ID of the entry being defined.
     * @param {Object}   value   Value of the entry being defined.
     * @returns {TypeOf<this>}   This instance.
     */
    addDef(id, value) { this._defs[id] = value; return this; }

    /**
     * Returns the definition for a particular ID.  
     * If the definition does not exist in this element, the parent (and so on) is looked 
     * up until one is found or the root is reached.
     * 
     * @param {String}  id  ID of the definition to be looked up.
     * @returns {Object}  Value of the definition within the closest ancestor, null if no entry found.
     */
    getDef(id) { 
        if (id in this._defs) {
            return this._defs[id];
        } else if (this._parent != null) {
            return this._parent.getDef(id);
        }
        return null;
    }

    /**
     * Sets the last udpated timestamp of this element to now.
     */
    markUpdated() { this._lastUpdated = Date.now(); }

    /**
     * Returns if the element has any children.
     */
    hasChildren() : boolean { return false; }

    /**
     * Returns the child count of this element.
     */
    childCount() : Int { return 0; }

    childAtIndex(i : Int) : Nullable<Element> { return null; }

    /**
     * Returns the parent of this eleemnt.
     */
    get parent() { return this._parent; } 

    /**
     * Adds a new element to this group.
     * As part of the addition, the {ElementAdded} event is also fired for both
     * the parent as well as the element being added for more finegrained and efficient
     * filtering of events.
     *
     * @param {Element} element  The element to be added.
     * @param {int}     index    Optional index where element is to be inserted.  If 
     *                           omitted, the element is appended to the end of the child list.
     *
     * @returns {Bool} true if a element was successfully added false if the addition was blocked (via event handling).
     */
    add(element : Element, index : Int = -1) : boolean {
        if (element.parent != this) {
            var event = new events.ElementAdded(this, element);
            if (this.validateBefore(event.name, event) != false &&
                element.validateBefore(event.name, event) != false) {
                // remove from old parent - Important!
                if (element.removeFromParent()) {
                    if (!this._children) this._children = [];
                    this._children.push(element);
                    element._parent = this;
                    this.triggerOn(event.name, event);
                    element.triggerOn(event.name, event);
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Removes an existing element from this group.
     * As part of the removal, the {ElementRemoved} event is also fired for both
     * the parent as well as the element being removed for more finegrained and efficient
     * filtering of events.
     *
     * @param {Element} element  The element to be removed.
     *
     * @returns {Bool} true if a element was successfully removed, false if the removal was blocked (via event handling).
     */
    remove(element) {
        if (element.parent == this) {
            var parentEvent = new events.ElementRemoved(this, element);
            var childEvent = new events.ElementRemoved(element, this);
            if (this.validateBefore(event.name, event) != false &&
                element.validateBefore(event.name, event) != false) {
                for (var i = 0;i < this._children.length;i++) {
                    if (this._children[i] == element) {
                        this._children.splice(i, 1);
                        element._parent = null;
                        this.triggerOn(event.name, event);
                        element.triggerOn(event.name, event);
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Removes all child elements from this element.
     */
    removeAll() {
        for (var i = 0;i < this._children.length;i++) {
            this._children[i].removeFromParent();
        }
        this._children = [];
    }

    /**
     * Helper method to kick off the removal of an element from its parent.
     */
    removeFromParent() {
        if (this.parent == null) return true;
        if (this.parent.remove(this)) {
            this._parent = null;
            return true;
        }
        return false;
    }
    
    /**
     * Changes the index of a given element within the parent.
     *
     * @param {Element} element     The element to be moved around within the parent.
     * @param {int} indexOrDelta    Denotes whether the element is to be moved to an 
     *                              absolute index or relative to its current position.  
     *                              This depends on the boolean `relative` parameter.
     * @param {Bool} relative       Denotes if the indexOrDelta parameter is relative or absolute.
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
        if (this.validateBefore(event.name, event) != false &&
            element.validateBefore(event.name, event) != false) {
            this._children.splice(index, 1);
            this._children.splice(newIndex, 0, element);
            this.triggerOn(event.name, event);
            element.triggerOn(event.name, event);
        }
    }

    /**
     * Brings a child element forward by one.
     */
    bringForward(element) {
        return this.changeIndexTo(element, 1, true);
    }

    /**
     * Sends a child element backward by one index.
     */
    sendBackward(element) {
        return this.changeIndexTo(element, -1, true);
    }

    /**
     * Brings a child element to the front of the child stack.
     */
    bringToFront(element) {
        return this.changeIndexTo(element, this._children.length, false);
    }

    /**
     * Sends a child element to the back of the child stack.
     */
    sendToBack(element) {
        return this.changeIndexTo(element, 0, false);
    }
}
