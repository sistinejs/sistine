import * as base from "./base"
import * as geom from "../Geom/models"
import * as events from "./events";
import * as styles from "./styles";

const Property = base.Property;

export class Transformable extends base.Element {
    constructor(configs) {
        super(configs);
        // Transform properties
        // What is the point of the global transform?
        this._globalTransform = new geom.Transform();
        this._globalInverseTransform = new geom.Transform();

        // Transforms on this shape
        this._transform = new geom.Transform();
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
        // Notice we are doing "invserse transforms here"
        // since we need to map a point "back" to global form
        result.multiply(this._transform);
        return result;
    }

    /**
     * Sets the shape's current transform matrix.
     */
    setTransform(t) {
        this._transform = t.copy();
        this.markTransformed();
    }

    /**
     * Transform's the shape by the given transform matrix.
     */
    transform(t) {
        this._transform.multiply(t);
        this.markTransformed();
    }

    translate(tx, ty) {
        var event = new events.TransformChanged(this, "translate", [ tx, ty ]);

        if (this.validateBefore(event.name, event) == false) return false;
        this._transform.translate(tx, ty);
        this.markTransformed();
        this.triggerOn(event.name, event);
        return true;
    }
    scale(sx, sy) {
        var event = new events.TransformChanged(this, "scale", [ sx, sy ]);

        if (this.validateBefore(event.name, event) == false) return false;
        this._transform.scale(sx, sy);
        this.markTransformed();
        this.triggerOn(event.name, event);
        return true;
    }
    rotate(theta) {
        var event = new events.TransformChanged(this, "rotation", [ theta ]);

        if (this.validateBefore(event.name, event) == false) return false;
        this._transform.rotate(theta);
        this.markTransformed();
        this.triggerOn(event.name, event);
        return true;
    }
    skew(sx, sy) {
        var event = new events.TransformChanged(this, "skew", this._transform, [ sx, sy ]);
        if (this.validateBefore(event.name, event) == false) return false;
        this._transform.skew(sx, sy);
        this.markTransformed();
        this.triggerOn(event.name, event);
        return true;
    }

    applyTransforms(ctx) {
        if (!this._transform.isIdentity) {
            ctx.save(); 
            ctx.transform(this._transform.a,
                          this._transform.b,
                          this._transform.c,
                          this._transform.d,
                          this._transform.e,
                          this._transform.f);
        }
    }

    revertTransforms(ctx) {
        if (!this._transform.isIdentity) {
            ctx.restore(); 
        }
    }
}

export class Styleable extends Transformable {
    constructor(configs) {
        super(configs);
        // Observable properties
        this.zIndex = configs.zIndex;

        this._fillStyle = new Property("fillStyle", configs.fillStyle);
        this._fillRule = new Property("fillRule", configs.fillRule);
        this._fillOpacity = new Property("fillOpacity", configs.fillOpacity);

        this._strokeStyle = new Property("strokeStyle", configs.strokeStyle);
        this._lineWidth = new Property("lineWidth", configs.lineWidth);
        this._lineJoin = new Property("lineJoin", configs.lineJoin);
        this._lineCap = new Property("lineCap", configs.lineCap);
        this._dashOffset = new Property("dashOffset", configs.dashOffset);
        this._dashArray = new Property("dashArray", configs.dashArray);
        this._miterLimit = new Property("miterLimit", configs.miterLimit);
        this._strokeOpacity = new Property("strokeOpacity", configs.strokeOpacity);
    }

    // Observable Properties that will trigger change events
    get lineWidth() { return this._lineWidth; }
    set lineWidth(value) {
        if (value) {
            this._lineWidth.set(geom.Length.parse(value));
        } else {
            this._lineWidth.set(value);
        }
    }

    get lineJoin() { return this._lineJoin; }
    set lineJoin(value) { this._lineJoin.set(value); }

    get lineCap() { return this._lineCap; }
    set lineCap(value) { this._lineCap.set(value); }

    get miterLimit() { return this._miterLimit; }
    set miterLimit(value) { this._miterLimit.set(value); }

    get strokeOpacity() { return this._strokeOpacity; }
    set strokeOpacity(value) { this._strokeOpacity.set(value); }

    get dashOffset() { return this._dashOffset; }
    set dashOffset(value) { this._dashOffset.set(value); }

    get dashArray() { return this._dashArray; }
    set dashArray(value) { this._dashArray.set(value); }

    get strokeStyle() { return this._strokeStyle; }
    set strokeStyle(value) {
        if (value != null && typeof value === "string") {
            value = new styles.Literal(value);
        }
        this._strokeStyle.set(value);
    }

    get fillStyle() { return this._fillStyle; }
    set fillStyle(value) {
        if (value != null && typeof value === "string") {
            value = new styles.Literal(value);
        }
        this._fillStyle.set(value);
    }

    get fillOpacity() { return this._fillOpacity; }
    set fillOpacity(value) { this._fillOpacity.set(value); }

    get fillRule() { return this._fillRule; }
    set fillRule(value) { this._fillRule.set(value); }

    /**
     * Draws this shape on a given context.
     */
    applyStyles(ctx, options) {
        ctx.save();
        if (this.fillStyle.value && !this.fillStyle.inherit) {
            this.fillStyle.value.apply(this, "fillStyle", ctx);
        }
        if (this.strokeStyle.value && !this.strokeStyle.inherit) {
            this.strokeStyle.value.apply(this, "strokeStyle", ctx);
        }
        if (this.fillRule.value || !this.fillRule.inherit) {
            ctx.fillRule = this.fillRule.value;
        }
        if (this.dashArray.value && !this.dashArray.inherit) {
            ctx.setLineDash(this.dashArray.value);
        }
        if (this.lineJoin.value || !this.lineJoin.inherit) {
            ctx.lineJoin = this.lineJoin.value;
        }
        if (this.lineCap.value || !this.lineCap.inherit) {
            ctx.lineCap = this.lineCap.value;
        }
        if (this.lineWidth.value || !this.lineCap.inherit) {
            ctx.lineWidth = this.lineWidth.value;
        }
        if (this.dashOffset.value || !this.dashOffset.inherit) {
            ctx.dashOffset = this.dashOffset.value;
        }
    }

    revertStyles(ctx) {
        ctx.restore();
    }
}
