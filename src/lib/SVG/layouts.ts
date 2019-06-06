import { Length } from "../Geom/models"
import { Int, Nullable, Undefined } from "../Core/types"
import { Shape } from "../Core/models"
import { EventHandler, BoundsChanged, EventType, EventSource } from "../Core/events"
import { ElementAdded, ElementRemoved } from "../Core/base"

export class ConstraintManager implements EventHandler {
    private _allConstraints : any = {};
    private _parentTargetRefs : any = {};
    constructor() {
        this._allConstraints = {};
        this._parentTargetRefs= {};
    }

    handleBefore(_eventType : EventType, _source : EventSource, _eventData : any) : Undefined<boolean> {
        return true;
    }

    handleOn(eventType : EventType, source : EventSource, event : any) : Undefined<boolean> {
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
    refreshConstraints(target : Shape) {
        if (target.parent != null) {
            var attribs = this._allConstraints[target.uuid] || {};
            var parent = target.parent as Shape;
            var width = parent.boundingBox.width;
            var height = parent.boundingBox.height;
            for (var key in attribs) {
                var attrib : any = attribs[key];
                if (attrib.dimension == 1) {
                    (target as any).set(key, attrib.value * width);
                } else if (attrib.dimension == 2) {
                    (target as any).set(key, attrib.value * height);
                } else {
                    var lsquared = width * width + height * height;
                    (target as any).set(key , Math.sqrt(lsquared / 2.0));
                }
            }
        }
    }

    /**
     * Returns true if a particular target shape has any constraints on 
     * any of its attributes.
     */
    hasConstraints(target : Shape) {
        if (!(target.uuid in this._allConstraints)) {
            this._allConstraints[target.uuid] = {};
        }
        var constraintMap = this._allConstraints[target.uuid];
        return Object.keys(constraintMap).length > 0;
    }

    addXConstraint(target : Shape, attrib : string, length : Nullable<Length> = null) {
        return this.addConstraint(target, attrib, 1, length);
    }

    addYConstraint(target : Shape, attrib : string, length : Nullable<Length> = null) {
        return this.addConstraint(target, attrib, 2, length);
    }

    addXYConstraint(target : Shape, attrib : string, length : Nullable<Length> = null) {
        return this.addConstraint(target, attrib, 3, length);
    }

    addConstraint(target : Shape, attrib : string, dimension : Int, length : Nullable<Length> = null) {
        // Remove this constraint if it already exists
        this.removeConstraints(target, attrib);

        if (length != null) {
            if (length.isAbsolute) {
                (target as any).set(attrib, length.pixelValue);
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
    removeConstraints(target : Shape, attrib : string) {
        if (target.uuid in this._allConstraints) {
            var attribs : any = {};
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
                if (target.parent != null)
                    this._removeParentRef(target.parent as Shape, target);
                target.removeHandler(ElementAdded.name, this);
                target.removeHandler(ElementRemoved.name, this);
            }
        }
    }

    _addConstraint(target : Shape, attrib : string, value : any) {
        if (!this.hasConstraints(target)) {
            target.addHandler(ElementAdded.name, this);
            target.addHandler(ElementRemoved.name, this);
            if (target.parent != null)
                this._addParentRef(target.parent as Shape, target);
        }
        this._allConstraints[target.uuid][attrib] = value;
    }

    _removeParentRef(parent : Shape, target : Shape) {
        if (parent == null) return ;
        var childSet = this._parentTargetRefs[parent.uuid] || {};
        delete childSet[target.uuid];
        if (Object.keys(childSet).length == 0) {
            parent.removeHandler(BoundsChanged.name, this);
        }
    }

    _addParentRef(parent : Shape, target : Shape) {
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
