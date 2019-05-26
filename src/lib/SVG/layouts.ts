
import * as events from "../Core/events"

const BoundsChanged = events.BoundsChanged;
const ElementAdded = events.ElementAdded;
const ElementRemoved = events.ElementRemoved;

export class ConstraintManager implements events.EventHandler {
    constructor() {
        super();
        this._allConstraints = {};
        this._parentTargetRefs= {};
    }

    handleBefore(eventType : string, source : events.EventSource, eventData : any) : boolean {
        return true;
    }

    handleOn(eventType : string, source : events.EventSource, eventData : any) : boolean {
        if (eventType == ElementAdded.name) {
            this._addParentRef(event.parent, event.subject);
            this.refreshConstraints(event.subject);
        } else if (eventType == ElementRemoved.name) {
            // reduce a reference to this parent
            this._removeParentRef(event.parent, event.subject);
        } else {    // Bounds changed
            this.refreshConstraints(event.source);
        }
    }

    /**
     * Refreshes the constraints of a particular target shape.
     */
    refreshConstraints(target) {
        if (target.hasParent) {
            var attribs = this._allConstraints[target.uuid] || {};
            var parent = target.parent;
            var width = parent.width;
            var height = parent.height;
            for (var attrib in atribs) {
                if (attrib.dimension == 1) {
                    target[attrib] = attrib.value * width;
                } else if (attrib.dimension == 2) {
                    target[attrib] = attrib.value * height;
                } else {
                    var lsquared = width * width + height * height;
                    target[attrib] = Math.sqrt(lsquared / 2.0);
                }
            }
        }
    }

    /**
     * Returns true if a particular target shape has any constraints on 
     * any of its attributes.
     */
    hasConstraints(target) {
        if (!(target.uuid in this._allConstraints)) {
            this._allConstraints[target.uuid] = {};
        }
        var constraintMap = this._allConstraints[target.uuid];
        return Object.keys(constraintMap).length > 0;
    }

    addXConstraint(target, attrib, length) {
        return this.addConstraint(target, attrib, length, 1);
    }

    addYConstraint(target, attrib, length) {
        return this.addConstraint(target, attrib, length, 2);
    }

    addXYConstraint(target, attrib, length) {
        return this.addConstraint(target, attrib, length, 3);
    }

    addConstraint(target, attrib, length, dimension) {
        // Remove this constraint if it already exists
        this.removeConstraints(target, attrib);

        if (length && length != null) {
            if (length.isAbsolute) {
                target[attrib] = length.pixelValue;
            } else {
                this._addConstraint(target, attrib, {
                    value: length.value / 100.0,
                    dimension: dimension
                });
            }
        }
    }

    /**
     * Removes constraints on a particular target shape or one of its attribute.
     */
    removeConstraints(target, attrib) {
        if (target.uuid in this._allConstraints) {
            var attribs = {};
            if (attrib && attrib != null) {
                attribs[attrib] = true;
            } else {
                attribs = Object.keys(this._allConstraints[target.uuid]);
            }

            for (var attrib in attribs) {
                delete this._allConstraints[target.uuid]
            }

            // if there are on constraints then we can remove the Added,Removed 
            // listeners as well as parent's
            if (!this.hasConstraints(target)) {
                this._removeParentRef(target.parent, target);
                target.removeHandler(ElementAdded.name, this);
                target.removeHandler(ElementRemoved.name, this);
            }
        }
    }

    _addConstraint(target, attrib, value) {
        if (!this.hasConstraints(target)) {
            target.addHandler(ElementAdded.name, this);
            target.addHandler(ElementRemoved.name, this);
            this._addParentRef(target.parent, target);
        }
        this._allConstraints[target.uuid][attrib] = value;
    }

    _removeParentRef(parent, target) {
        if (parent == null) return ;
        var childSet = this._parentTargetRefs[parent.uuid] || {};
        delete childSet[target.uuid];
        if (Object.keys(childSet).length == 0) {
            parent.removeHandler(BoundsChanged.name, this);
        }
    }

    _addParentRef(parent, target) {
        if (parent == null) return ;
        if (!(parent.uuid in this._parentTargetRefs)) {
            this._parentTargetRefs[parent.uuid] = {};
        }
        var childSet = this._parentTargetRefs[parent.uuid];
        if (!(target.uuid in childSet)) {
            var wasEmpty = Object.keys(childSet).length == 0;
            childSet[target.uuid] = true;
            if (wasEmpty)
                parent.addHandler(BoundsChanged.name, this);
        }
    }
}

export const defaultCM = new ConstraintManager();
