
import * as mixins from "./mixins";
import * as base from "./base";
import * as events from "./events";
import * as controller from "./controller";
import * as geom from "../Geom/models"
import * as geomutils from "../Geom/utils"

/**
 * Holds information about the instance of a shape.
 */
export class Shape extends mixins.Styleable {
    isVisible : boolean
    readonly scene : Scene = null;

    constructor(configs) {
        configs = configs || {};
        super(configs);
        this._boundingBox = null;

        this.isVisible = true;
    }

    get boundingBox() : Bounds {
        if (this._boundingBox == null) {
            this._boundingBox = this._evalBoundingBox();
        }
        return this._boundingBox;
    }

    get controllerClass() : { new (shape : Shape) : controller.Controller } { return controller.ShapeController; }
    get controller() : controller.Controller { 
        if (this._controller == null) {
            this._controller = new this.controllerClass(this);
        }
        return this._controller; 
    }

    set controller(c : controller.Controller) {
        if (this._controller != c) {
            this._controller = c;
        }
    }

    setScene(s : Scene) : boolean {
        if (this.scene != s) {
            // unchain previous scene
            this.markUpdated();
            if (this.scene) {
                this.eventHub.unchain(this.scene.eventHub);
            }
            this.scene = s;
            if (this.scene) {
                this.eventHub.chain(this.scene.eventHub);
            }
            return true;
        }
        return false;
    }

    /**
     * A easy wrapper to control shape dimensions by just setting its bounds.
     */
    setBounds(newBounds : geom.Bounds) : boolean {
        if (this.canSetBounds(newBounds)) {
            var oldBounds = this.boundingBox.copy();
            var event = new events.BoundsChanged(this, "bounds", oldBounds, newBounds);
            if (this.validateBefore(event.name, event) == false) return false;
            this._setBounds(newBounds);
            this._boundingBox = null;
            this.markTransformed();
            this.triggerOn(event.name, event);
            return true;
        }
    }
    canSetBounds(newBounds: geom.Bounds) : boolean { return true; }
    _setBounds(newBounds : geom.Bounds) {
        throw Error("Not Implemented for: ", this);
    }

    draw(ctx) { }

    /**
     * Returns true if this shape contains a particular coordinate, 
     * false otherwise.
     */
    containsPoint(x, y) {
        var newp = this.globalTransform.apply(x, y, {});
        return this.boundingBox.containsPoint(newp.x, newp.y);
    }

    _locationChanged(oldX, oldY) { }
    _scaleChanged(oldW, oldH) { }
    _rotationChanged(oldAngle) { }
}

/**
 * Creating explicit group class to handle groups of objects so that we 
 * can extend this to performing layouts etc on child chapes.
 */
export class Group extends Shape {
    constructor(configs) {
        super((configs = configs || {}));
        this._bounds = configs.bounds || new geom.Bounds();
        this._children = [];
    }

    childAtIndex(i) { return this._children[i]; } 
    get hasChildren() { return this._children.length > 0; } 
    get childCount() { return this._children.length; } 

    setScene(s) {
        if (!super.setScene(s)) return false;
        for (var i = 0, L = this._children.length;i < L;i++) {
            this._children[i].setScene(s);
        }
        return true;
    }

    _setBounds(newBounds) {
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
    constructor(configs) {
        super((configs = configs || {}));
    }
}

