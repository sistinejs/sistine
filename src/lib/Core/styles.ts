
import { Int, Nullable} from "./types"
import { Shape } from "./models"
import { Styleable } from "./mixins"
import { Length } from "../Geom/models"
import { Element } from "./base"

export class Style extends Element {
    protected _realValue : any = null;
    protected _context : any = null;
    protected _relativeToBounds = true;
    protected _shapeX : Nullable<number>
    protected _shapeY : Nullable<number>
    protected _shapeW : Nullable<number>
    protected _shapeH : Nullable<number>
    constructor() {
        super();
        this._realValue = null;
        this._context = null;
        this._relativeToBounds = true;
        this._shapeX = null;
        this._shapeY = null;
        this._shapeW = null;
        this._shapeH = null;
    }

    get isRelativeToBounds() {
        return this._relativeToBounds;
    }

    set relativeToBounds(value : boolean) {
        if (this._relativeToBounds != value) {
            this._relativeToBounds = value;
            this._realValue = null;
        }
    }

    forContext(shape : Styleable, ctx : any) {
        if (this._hasChanged(shape, ctx)) {
            this._shapeX = shape.boundingBox.x;
            this._shapeY = shape.boundingBox.y;
            this._shapeW = shape.boundingBox.width;
            this._shapeH = shape.boundingBox.height;
            this._context = ctx;
            this._realValue = this._createStyle(shape, ctx);
        }
        return this._realValue;
    }

    apply(shape : Styleable, property : string, ctx : any) {
        ctx[property] = this.forContext(shape, ctx);
    }

    _hasChanged(shape : Styleable, ctx : any) {
        return this._realValue == null || this._context != ctx ||
                shape.boundingBox.x != this._shapeX ||
                shape.boundingBox.y != this._shapeY ||
                shape.boundingBox.width != this._shapeW ||
                shape.boundingBox.height != this._shapeH;
    }

    _createStyle(shape : Styleable, ctx : any) : any {
        return null;
    }
}

export class Literal extends Style {
    private _value : any;
    constructor(value : any) {
        super();
        this._value = value;
    }

    _createStyle(shape : Styleable, ctx : any) : any {
        return this._value;
    }

    copy() {
        return new Literal(this._value);
    }
}

export class Gradient extends Style {
    protected _stops : any = [];
    constructor() {
        super();
        this._stops = [];
    }

    addStop(stop : number, color : any, index : Int = -1) {
        if (index < 0) {
            this._stops.push([stop, color]);
        } else {
            this._stops.splice(index, 0, [stop, color]);
        }
        return this;
    }
}

export class LinearGradient extends Gradient {
    x0 : Length
    y0 : Length
    x1 : Length
    y1 : Length
    constructor(x0 : number | Length, y0 : number | Length, x1 : number | Length, y1 : number | Length) {
        super();
        this.x0 = Length.parse(x0);
        this.y0 = Length.parse(y0);
        this.x1 = Length.parse(x1);
        this.y1 = Length.parse(y1);
    }

    _createStyle(shape : Shape, ctx : any) {
        var x0, y0, x1, y1;
        var boundsX = 0, boundsY = 0, boundsW = 0, boundsH = 0;
        if (this._relativeToBounds || !shape.hasParent || shape.parent == null) {
            // relative to object bounds
            boundsX = this._shapeX as number;
            boundsY = this._shapeY as number;
            boundsW = this._shapeW as number;
            boundsH = this._shapeH as number;
        } else {
            // relative to object parent bounds?
            var parentBounds = (shape.parent as Shape).boundingBox;
            boundsX = parentBounds.x;
            boundsY = parentBounds.y;
            boundsW = parentBounds.width;
            boundsH = parentBounds.height;
        }
        x0 = boundsX + (this.x0.isAbsolute ? this.x0.pixelValue : this.x0.value * boundsW);
        y0 = boundsY + (this.y0.isAbsolute ? this.y0.pixelValue : this.y0.value * boundsH);
        x1 = boundsX + (this.x1.isAbsolute ? this.x1.pixelValue : this.x1.value * boundsW);
        y1 = boundsY + (this.y1.isAbsolute ? this.y1.pixelValue : this.y1.value * boundsH);
        var out = ctx.createLinearGradient(x0, y0, x1, y1);
        this._stops.forEach(function(value : [any, any]) {
            out.addColorStop(value[0], value[1]);
        });
        return out;
    }

    copy() {
        var out = new LinearGradient(this.x0, this.y0, this.x1, this.y1);
        out._stops = this._stops.slice(0, this._stops.length);
        return out;
    }
}

export class RadialGradient extends Gradient {
    x0 : Length
    y0 : Length
    r0 : Length
    x1 : Length
    y1 : Length
    r1 : Length
    constructor(x0 : number | Length, y0 : number | Length, r0 : number | Length,
                x1 : number | Length, y1 : number | Length, r1 : number | Length) {
        super();
        this.x0 = Length.parse(x0);
        this.y0 = Length.parse(y0);
        this.r0 = Length.parse(r0);
        this.x1 = Length.parse(x1);
        this.y1 = Length.parse(y1);
        this.r1 = Length.parse(r1);
    }

    _createStyle(shape : Styleable, ctx : any) {
        var x0, y0, r0, x1, y1, r1;
        var boundsX, boundsY, boundsW, boundsH;
        if (this._relativeToBounds || !shape.hasParent) {
            // relative to object bounds
            boundsX = this._shapeX as number;
            boundsY = this._shapeY as number;
            boundsW = this._shapeW as number;
            boundsH = this._shapeH as number;
        } else {
            // relative to object parent bounds?
            var parentBounds = (shape.parent as Shape).boundingBox;
            boundsX = parentBounds.x;
            boundsY = parentBounds.y;
            boundsW = parentBounds.width;
            boundsH = parentBounds.height;
        }
        x0 = boundsX + (this.x0.isAbsolute ? this.x0.pixelValue : this.x0.value * boundsW);
        y0 = boundsY + (this.y0.isAbsolute ? this.y0.pixelValue : this.y0.value * boundsH);
        r0 = (this.r0.isAbsolute ? this.r0.pixelValue : this.r0.value * boundsW);
        x1 = boundsX + (this.x1.isAbsolute ? this.x1.pixelValue : this.x1.value * boundsW);
        y1 = boundsY + (this.y1.isAbsolute ? this.y1.pixelValue : this.y1.value * boundsH);
        r1 = (this.r1.isAbsolute ? this.r1.pixelValue : this.r1.value * boundsW);
        var out = ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
        this._stops.forEach(function(value : [any,any]) {
            out.addColorStop(value[0], value[1]);
        });
        return out;
    }

    copy() {
        var out = new RadialGradient(this.x0, this.y0, this.r0,
                                     this.x1, this.y1, this.r1);
        out._stops = this._stops.slice(0, this._stops.length);
        return out;
    }
}

export class Pattern extends Style {
    _elementOrId : HTMLElement | string;
    _repeatType : string
    constructor(elementOrId : HTMLElement | string, repeatType : string) {
        super();
        this._elementOrId = elementOrId;
        this._repeatType = repeatType;
    }

    get element() : Nullable<HTMLElement> {
        var out = this._elementOrId;
        if (typeof out === "string") {
            return document.getElementById(out);
        } else {
            return out as HTMLElement;
        }
    }

    _createStyle(shape : Shape, ctx : any) {
        return ctx.createPattern(this.element, this._repeatType)
    }
}
