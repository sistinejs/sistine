
import * as mixins from "./mixins";
import * as base from "./base";
import * as events from "./events";
import * as controller from "./controller";
import * as geom from "../Geom/models"
import * as geomutils from "../Geom/utils"

export const DEFAULT_CONTROL_SIZE = 5;

/**
 * Holds information about the instance of a shape.
 */
export class Shape extends mixins.Styleable {
    constructor(configs) {
        configs = configs || {};
        super(configs);
        this._scene = null;
        this._boundingBox = null;

        this.isVisible = true;
        this.controlRadius = DEFAULT_CONTROL_SIZE;
    }

    get boundingBox() {
        if (this._boundingBox == null) {
            this._boundingBox = this._evalBoundingBox();
        }
        return this._boundingBox;
    }

    get scene() { return this._scene; } 
    get controllerClass() { return controller.ShapeController; }
    get controller() { 
        if (this._controller == null) {
            this._controller = new this.controllerClass(this);
        }
        return this._controller; 
    }

    set controller(c) {
        if (this._controller != c) {
            this._controller = c;
        }
    }

    setScene(s) {
        if (this._scene != s) {
            // unchain previous scene
            this.markUpdated();
            if (this._scene) {
                this._eventHub.unchain(this._scene.eventHub);
            }
            this._scene = s;
            if (this._scene) {
                this._eventHub.chain(this._scene.eventHub);
            }
            return true;
        }
        return false;
    }

    /**
     * A easy wrapper to control shape dimensions by just setting its bounds.
     */
    setBounds(newBounds) {
        if (this.canSetBounds(newBounds)) {
            var oldBounds = this.boundingBox.copy();
            var event = new events.GeometryChanged(this, "bounds", oldBounds, newBounds);
            if (this.validateBefore(event.name, event) == false) return false;
            this._setBounds(newBounds);
            this._boundingBox = null;
            this.markTransformed();
            this.triggerOn(event.name, event);
            return true;
        }
    }
    canSetBounds(newBounds) { return true; }
    _setBounds(newBounds) {
        throw Error("Not Implemented for: ", this);
    }

    draw(ctx) { }

    drawControls(ctx, options) {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 0.5
        var lBounds = this.boundingBox;
        var l = lBounds.left;
        var r = lBounds.right;
        var t = lBounds.top;
        var b = lBounds.bottom;
        ctx.strokeRect(l, t, lBounds.width, lBounds.height);
        ctx.fillStyle = "yellow";

        var sizePoints = [
            [l, t],
            [(l + r) / 2, t],
            [r, t],
            [r, (t + b) / 2],
            [r, b],
            [(l + r) / 2, b],
            [l, b],
            [l, (t + b) / 2]
        ]
        for (var i = sizePoints.length - 1;i >= 0;i--) {
            var px = sizePoints[i][0];
            var py = sizePoints[i][1];
            ctx.fillRect(px - this.controlRadius, py - this.controlRadius,
                           this.controlRadius + this.controlRadius,
                           this.controlRadius + this.controlRadius);
            ctx.strokeRect(px - this.controlRadius, py - this.controlRadius,
                           this.controlRadius + this.controlRadius,
                           this.controlRadius + this.controlRadius);
        }
        // Draw the "rotation" control
        ctx.beginPath();
        geomutils.pathEllipse(ctx, lBounds.right + 50 - this.controlRadius, 
                         lBounds.centerY - this.controlRadius, 
                         this.controlRadius * 2, this.controlRadius * 2);
        ctx.fillStyle = 'green';
        ctx.fill();
        ctx.moveTo(lBounds.right, lBounds.centerY);
        ctx.lineTo(lBounds.right + 50, lBounds.centerY);
        ctx.strokeStyle = 'blue';
        ctx.stroke();
    }

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

