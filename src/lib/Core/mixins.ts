import { Property, Element } from "./base"
import { Length, Transform, Bounds } from "../Geom/models"
import { Event } from "./events";
import { Literal, Style } from "./styles"
import { Int, Nullable } from "./types"

export class Transformable extends Element {
    lastTransformed : number
    protected _globalTransform : Transform = new Transform();
    protected _globalInverseTransform : Transform = new Transform();
    protected _transform : Transform = new Transform();
    protected _boundingBox : Nullable<Bounds> = null;

    constructor() {
        super();
        // Transform properties
        // What is the point of the global transform?

        // Transforms on this shape
        this.markTransformed();
    }

    newInstance() : this {
        var out = super.newInstance();
        out._transform = this._transform.copy();
        return out;
    }

    get boundingBox() : Bounds {
        if (this._boundingBox == null) {
            this._boundingBox = this._evalBoundingBox();
        }
        return this._boundingBox;
    }

    _evalBoundingBox() : Bounds {
        throw new Error("Not implemented");
    }

    markTransformed() {
        this._boundingBox = null;
        this.lastTransformed = Date.now(); 
        this.markUpdated();
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
            var pt = (this._parent as Transformable).globalTransform;
            if (pt.timeStamp > gt.timeStamp ||
                this.lastTransformed > gt.timeStamp) {
                // updated ourselves
                this._globalTransform = this._updateTransform(pt.copy());
            }
        } else if (this._lastUpdated > gt.timeStamp) {
            this._globalTransform = this._updateTransform();
        }
        return this._globalTransform;
    }
    _updateTransform(result? : Transform) {
        result = result || new Transform();
        // Notice we are doing "invserse transforms here"
        // since we need to map a point "back" to global form
        result.multiply(this._transform);
        return result;
    }

    /**
     * Sets the shape's current transform matrix.
     */
    setTransform(t : Transform) {
        this._transform = t.copy();
        this.markTransformed();
    }

    /**
     * Transform's the shape by the given transform matrix.
     */
    transform(t : Transform) {
        this._transform.multiply(t);
        this.markTransformed();
    }

    translate(tx : number, ty : number) : boolean {
        var event = new TransformChanged(this, "translate", null, [ tx, ty ]);

        if (this.validateBefore(event.name, event) == false) return false;
        this._transform.translate(tx, ty);
        this.markTransformed();
        this.triggerOn(event.name, event);
        return true;
    }
    scale(sx : number, sy : number) : boolean {
        var event = new TransformChanged(this, "scale", null, [ sx, sy ]);

        if (this.validateBefore(event.name, event) == false) return false;
        this._transform.scale(sx, sy);
        this.markTransformed();
        this.triggerOn(event.name, event);
        return true;
    }
    rotate(theta : number) : boolean {
        var event = new TransformChanged(this, "rotation", null, theta);

        if (this.validateBefore(event.name, event) == false) return false;
        this._transform.rotate(theta);
        this.markTransformed();
        this.triggerOn(event.name, event);
        return true;
    }
    skew(sx : number, sy : number) : boolean {
        var event = new TransformChanged(this, "skew", null, [ sx, sy ]);
        if (this.validateBefore(event.name, event) == false) return false;
        this._transform.skew(sx, sy);
        this.markTransformed();
        this.triggerOn(event.name, event);
        return true;
    }

    applyTransforms(ctx : any) {
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

    revertTransforms(ctx : any) {
        if (!this._transform.isIdentity) {
            ctx.restore(); 
        }
    }
}

export class Styleable extends Transformable {
    private zIndex = 0;

    private _fillStyle : Property<Style>;
    private _fillRule : Property<string>;
    private _fillOpacity : Property<number>;

    private _strokeStyle : Property<Style>;
    private _lineWidth : Property<Length>;
    private _lineJoin : Property<string>;
    private _lineCap : Property<string>;
    private _dashOffset : Property<number>;
    private _dashArray : Property<Array<number>>;
    private _miterLimit : Property<number>
    private _strokeOpacity : Property<number>

        // handle text parameters
    private _fontWeight : Property<number>
    private _fontStyle : Property<string>
    private _fontFamily : Property<string>
    constructor(configs? : any) {
        super();
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

        // handle text parameters
        this._fontWeight = new Property("fontWeight", configs.fontWeight);
        this._fontStyle = new Property("fontStyle", configs.fontStyle);
        this._fontFamily = new Property("fontFamily", configs.fontFamily);
    }

    newInstance() : this {
        var out = super.newInstance();
        out._fillStyle = this._fillStyle.clone();
        out._fillRule = this._fillRule.clone();
        out._fillOpacity = this._fillOpacity.clone();

        out._strokeStyle = this._strokeStyle.clone();
        out._lineWidth = this._lineWidth.clone();
        out._lineJoin = this._lineJoin.clone();
        out._lineCap = this._lineCap.clone();
        out._dashOffset = this._dashOffset.clone();
        out._dashArray = this._dashArray.clone();
        out._miterLimit = this._miterLimit.clone();
        out._strokeOpacity = this._strokeOpacity.clone();
        return out;
    }

    // Observable Properties that will trigger change events
    get lineWidth() : Nullable<Length> { return this._lineWidth.value; }
    setLineWidth(value? : number | string | Length) {
        if (value) {
            this._lineWidth.set(Length.parse(value));
        } else {
            this._lineWidth.set(null);
        }
    }

    get lineJoin() : Nullable<string> { return this._lineJoin.value; }
    set lineJoin(value : Nullable<string>) { this._lineJoin.set(value); }

    get lineCap() : Nullable<string> { return this._lineCap.value; }
    set lineCap(value : Nullable<string>) { this._lineCap.set(value); }

    get miterLimit() : Nullable<number> { return this._miterLimit.value; }
    set miterLimit(value : Nullable<number>) { this._miterLimit.set(value); }

    get strokeOpacity() : Nullable<number> { return this._strokeOpacity.value; }
    set strokeOpacity(value : Nullable<number>) { this._strokeOpacity.set(value); }

    get dashOffset() : Nullable<number> { return this._dashOffset.value; }
    set dashOffset(value : Nullable<number>) { this._dashOffset.set(value); }

    get dashArray() : Nullable<Array<number>> { return this._dashArray.value; }
    set dashArray(value : Nullable<Array<number>>) { this._dashArray.set(value); }

    get strokeStyle() : Nullable<Style> { return this._strokeStyle.value; }
    setStrokeStyle(value : string | Style) {
        var theStyle : Style;
        if (value != null && typeof value === "string") {
            theStyle = new Literal(value);
        } else {
            theStyle = value;
        }
        this._strokeStyle.set(theStyle);
        return this;
    }

    get fillStyle() : Nullable<Style> { return this._fillStyle.value; }
    setFillStyle(value : string | Style) {
        var theStyle : Style;
        if (value != null && typeof value === "string") {
            theStyle = new Literal(value);
        } else {
            theStyle = value;
        }
        this._fillStyle.set(theStyle);
        return this;
    }

    get fillOpacity() : Nullable<number> { return this._fillOpacity.value; }
    set fillOpacity(value : Nullable<number>) { this._fillOpacity.set(value); }

    get fillRule() : Nullable<string> { return this._fillRule.value; }
    set fillRule(value : Nullable<string>) { this._fillRule.set(value); }

    get fontFamily() : Nullable<string> { return this._fontFamily.value; }
    set fontFamily(value : Nullable<string>) { this._fontFamily.set(value); }

    get fontStyle() : Nullable<string> { return this._fontStyle.value; }
    set fontStyle(value : Nullable<string>) { this._fontStyle.set(value); }

    get fontWeight() : Nullable<number> { return this._fontWeight.value; }
    set fontWeight(value : Nullable<number>) { this._fontWeight.set(value); }

    /**
     * Draws this shape on a given context.
     */
    applyStyles(ctx : any, options : any) {
        ctx.save();
        if (this._fillStyle.value != null && !this._fillStyle.inherit) {
            this._fillStyle.value.apply(this, "fillStyle", ctx);
        }
        if (this._strokeStyle.value != null && !this._strokeStyle.inherit) {
            this._strokeStyle.value.apply(this, "strokeStyle", ctx);
        }
        if (this._fillRule.value != null && !this._fillRule.inherit) {
            ctx.fillRule = this._fillRule.value;
        }
        if (this._dashArray.value != null && !this._dashArray.inherit) {
            ctx.setLineDash(this._dashArray.value);
        }
        if (this._lineJoin.value || !this._lineJoin.inherit) {
            ctx.lineJoin = this._lineJoin.value;
        }
        if (this._lineCap.value || !this._lineCap.inherit) {
            ctx.lineCap = this._lineCap.value;
        }
        if (this._lineWidth.value != null) {
            ctx.lineWidth = this._lineWidth.value.pixelValue;
        }
        if (this._dashOffset.value != null || !this._dashOffset.inherit) {
            ctx.dashOffset = this._dashOffset.value;
        }
    }

    revertStyles(ctx : any) {
        ctx.restore();
    }
}

export class TransformChanged extends Event {
    source : any;
    command : string;
    oldValue : any;
    newValue : any;
    constructor(source : any, command : string, oldValue : any, newValue : any) {
        super();
        this.source = source;
        this.command = command;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }
    get klass() { return TransformChanged; }
}
