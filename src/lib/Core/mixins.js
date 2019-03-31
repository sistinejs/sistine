import * as base from "./base"
import * as geom from "../Geom/models"
import * as events from "./events";
import * as styles from "./styles";

export class Transformable extends base.Element {
    constructor(configs) {
        super(configs);
        // Transform properties
        // What is the point of the global transform?
        this._globalTransform = new geom.Transform();
        this._globalInverseTransform = new geom.Transform();
        this._transform = new geom.Transform();
        this._translation = new geom.Point(0, 0);
        this._rotation = 0;
        this._scaleFactor = new geom.Point(1, 1);
        this.markTransformed();
    }

    markTransformed() { 
        this.markUpdated();
        this._lastTransformed = Date.now(); 
    }

    /**
    * The globalTransform tells how to convert a global coordinate into 
    * the coordinate system representing this shape.
    * The inverse of this transform will map a point with respect to the shape
    * back into the global coordinate system.
    *
    * The globalTransform of a shape is simply the cumulative transforms 
    * applied inorder from the root shape all the way to this shape's transform.
    */
    get globalTransform() {
        var gt = this._globalTransform;
        if (this._parent != null) {
            var pt = this._parent.globalTransform;
            if (pt.timeStamp > gt.timeStamp ||
                this._lastTransformed > gt.timeStamp) {
                // updated ourselves
                this._globalTransform = this._updateTransform(pt.copy());
            }
        } else if (this._lastUpdated > gt.timeStamp) {
            this._globalTransform = this._updateTransform();
        }
        return this._globalTransform;
    }
    _updateTransform(result) {
        result = result || new geom.Transform();
        var cx = this._translation.x;
        var cy = this._translation.y;
        // Notice we are doing "invserse transforms here"
        // since we need to map a point "back" to global form
        result.translate(cx, cy)
              .rotate(- this._rotation)
              .scale(1.0 / this._scaleFactor.x, 1.0 / this._scaleFactor.y)
              .translate(-cx, -cy);
        return result;
    }

    move(dx, dy) {
        return this.moveTo(this._translation.x + dx, this._translation.y + dy);
    }

    moveTo(x, y) {
        var oldX = this._translation.x;
        var oldY = this._translation.y;
        if (x == oldX && y == oldY) return false;

        var event = new events.GeometryChanged(this, "location", [ oldX, oldY ], [ x, y ]);

        if (this.validateBefore(event.name, event) == false) return false;

        this._translation.x = x;
        this._translation.y = y;
        this.markTransformed();
        this._locationChanged(oldX, oldY);
        this.triggerOn(event.name, event);
        return true;
    }
    scale(sx, sy) {
        return this.scaleTo(this._scaleFactor.x * sx, this._scaleFactor.y * sy);
    }
    scaleTo(x, y) {
        var oldScaleX = this._scaleFactor.x;
        var oldScaleY = this._scaleFactor.y;
        if (x == oldScaleX && y == oldScaleY) return false;

        // Check minimum sizes
        var C2 = this.controlRadius + this.controlRadius;
        if (x * this.boundingBox.width <= C2 || y * this.boundingBox.height <= C2) return false;

        var event = new events.GeometryChanged(this, "scale", [ oldScaleX, oldScaleY ], [ x, y ]);
        if (this.validateBefore(event.name, event) == false) return false;

        this._scaleFactor.set(x, y);
        this.markTransformed();
        this._scaleChanged(oldScaleX, oldScaleY);
        this.triggerOn(event.name, event);
        return true;
    }
    rotate(theta) { return this.rotateTo(this._rotation + theta); }
    rotateTo(theta) {
        if (theta == this._rotation) return false;

        var event = new events.GeometryChanged(this, "angle", this._rotation, theta);
        if (this.validateBefore(event.name, event) == false) return false;

        var oldAngle = this._rotation;
        this._rotation = theta;
        this.markTransformed();
        this._rotationChanged(oldAngle);
        this.triggerOn(event.name, event);
        return true;
    }

    applyTransforms(ctx) {
        var angle = this._rotation;
        if (angle || this._scaleFactor.x != 1 || this._scaleFactor.y != 1 ||
            this._translation.x || this._translation.y) {
            ctx.save(); 
            var lBounds = this.boundingBox;
            var cx = this.boundingBox.centerX;
            var cy = this.boundingBox.centerY;
            ctx.translate(cx, cy);
            ctx.rotate(angle);
            ctx.scale(this._scaleFactor.x, this._scaleFactor.y);
            ctx.translate(-cx + this._translation.x, -cy + this._translation.y);
        }
    }

    revertTransforms(ctx) {
        var angle = this._rotation;
        if (angle) {
            ctx.restore(); 
        }
    }
}

export class Styleable extends Transformable {
    constructor(configs) {
        super(configs);
        // Observable properties
        this.zIndex = configs.zIndex || 0;
        this.lineWidth = configs.lineWidth || 2;
        this.lineJoin = configs.lineJoin || null;
        this.lineCap = configs.lineCap || null;
        this.miterLimit = configs.miterLimit || null;
        this.fillStyle = configs.fillStyle || null;
        this.strokeStyle = configs.strokeStyle || null;
        this.shouldFill = true;
        this.shouldStroke = true;
    }

    // Observable Properties that will trigger change events
    get rotation() { return this._rotation; }
    set rotation(value) { return this.set("rotation", value); }

    get zIndex() { return this._zIndex; }
    set zIndex(value) { return this.set("zIndex", value); }

    get lineWidth() { return this._lineWidth; }
    set lineWidth(value) { return this.set("lineWidth", value); }

    get lineJoin() { return this._lineJoin; }
    set lineJoin(value) { return this.set("lineJoin", value); }

    get lineCap() { return this._lineCap; }
    set lineCap(value) { return this.set("lineCap", value); }

    get miterLimit() { return this._miterLimit; }
    set miterLimit(value) { return this.set("miterLimit", value); }

    get strokeStyle() { return this._strokeStyle; }
    set strokeStyle(value) {
        if (value != null && typeof value === "string") {
            value = new styles.Literal(value);
        }
        return this.set("strokeStyle", value); 
    }

    get fillStyle() { return this._fillStyle; }
    set fillStyle(value) { 
        if (value != null && typeof value === "string") {
            value = new styles.Literal(value);
        }
        return this.set("fillStyle", value); 
    }
}
