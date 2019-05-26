
import * as mixins from "./mixins";
import * as base from "./base";
import * as events from "./events";
import * as controller from "./controller";
import * as geom from "../Geom/models"
import * as geomutils from "../Geom/utils"

type Element = base.Element;

type Int = number;
type Nullable<T> = T | null;

/**
 * Holds information about the instance of a shape.
 */
export class Shape extends mixins.Styleable {
    isVisible : boolean = true;
    private _scene : Nullable<Scene> = null;
    protected _boundingBox : Nullable<geom.Bounds> = null;
    controller : controller.ShapeController<this> | null = null;

    constructor(configs : any) {
        super((configs = configs || {}));
    }

    get boundingBox() : geom.Bounds {
        if (this._boundingBox == null) {
            this._boundingBox = this._evalBoundingBox();
        }
        return this._boundingBox;
    }

    _evalBoundingBox() : geom.Bounds {
        throw new Error("Not implemented");
    }

    get scene() : (Scene | null) { return this._scene; }

    /**
     * A easy wrapper to control shape dimensions by just setting its bounds.
     */
    setBounds(newBounds : geom.Bounds) : boolean {
        if (this.canSetBounds(newBounds)) {
            var oldBounds = this.boundingBox.copy();
            var event = new events.BoundsChanged(this, "bounds", oldBounds, newBounds);
            if (this.validateBefore(event.name, event) == false) return false;
            this._setBounds(newBounds);
            this.markTransformed();
            this.triggerOn(event.name, event);
            return true;
        }
        return false;
    }
    canSetBounds(newBounds: geom.Bounds) : boolean { return true; }
    _setBounds(newBounds : geom.Bounds) {
        throw Error("Not Implemented");
    }

    markTransformed() {
        this._boundingBox = null;
        super.markTransformed();
    }

    draw(ctx : any) { }

    /**
     * Returns true if this shape contains a particular coordinate, 
     * false otherwise.
     */
    containsPoint(x : number, y : number) : boolean {
        var newp = this.globalTransform.apply(x, y, {});
        return this.boundingBox.containsPoint(newp.x, newp.y);
    }

    _locationChanged(oldX : number, oldY : number) { }
    _scaleChanged(oldW : number, oldH : number) { }
    _rotationChanged(oldAngle : number) { }
}

/**
 * Creating explicit group class to handle groups of objects so that we 
 * can extend this to performing layouts etc on child chapes.
 */
export class Group extends Shape {
    protected _children : Array<Shape> = [];
    protected _bounds : Nullable<geom.Bounds>;
    constructor(configs : any) {
        super((configs = configs || {}));
        this._bounds = configs.bounds || new geom.Bounds();
    }

    childAtIndex(i : Int) : Nullable<Element> { return this._children[i]; } 
    hasChildren() : boolean { return this._children.length > 0; } 
    childCount() : Int { return this._children.length; } 

    _setBounds(newBounds : Nullable<geom.Bounds>) {
        this._bounds = newBounds == null ? null : newBounds.copy();
    }

    _evalBoundingBox() {
        if (this._bounds) {
            return this._bounds.copy();
        } else {
            var out = new geom.Bounds(0, 0, 0, 0);
            for (var i = 0;i < this._children.length;i++) {
                out.union(this._children[i].boundingBox);
            }
            return out;
        }
    }
}

/**
 * The Scene is the raw model where all shapes are 
 * managed.  As far as possible this does not perform any view 
 * related operations as that is decoupled into the view entity.
 */
export class Scene extends Group {
    constructor(configs : any) {
        super((configs = configs || {}));
    }
}

