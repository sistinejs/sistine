
import * as geom from "../Geom/models"

const Length = geom.Length;

export class Style {
    constructor() {
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

    set relativeToBounds(value) {
        if (this._relativeToBounds != value) {
            this._relativeToBounds != value;
            this._realValue = null;
        }
    }

    forContext(shape, ctx) {
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

    apply(shape, property, ctx) {
        ctx[property] = this.forContext(shape, ctx);
    }

    _hasChanged(shape, ctx) {
        return this._realValue == null || this._context != ctx ||
                shape.boundingBox.x != this._shapeX ||
                shape.boundingBox.y != this._shapeY ||
                shape.boundingBox.width != this._shapeW ||
                shape.boundingBox.height != this._shapeH;
    }
}

export class Literal extends Style {
    constructor(value) {
        super();
        this._value = value;
    }

    _createStyle(shape, ctx) {
        return this._value;
    }

    copy() {
        return Literal(this._value);
    }
}

export class Gradient extends Style {
    constructor() {
        super();
        this._stops = [];
    }

    addStop(stop, color, index) {
        index = index || -1;
        if (index < 0) {
            this._stops.push([stop, color]);
        } else {
            this._stops.splice(index, 0, [stop, color]);
        }
        return this;
    }
}

export class LinearGradient extends Gradient {
    constructor(x0, y0, x1, y1) {
        super();
        this.x0 = Length.parse(x0);
        this.y0 = Length.parse(y0);
        this.x1 = Length.parse(x1);
        this.y1 = Length.parse(y1);
    }

    _createStyle(shape, ctx) {
        var x0 = this._shapeX + (this.x0 * this._shapeW);
        var y0 = this._shapeY + (this.y0 * this._shapeH);
        var x1 = this._shapeX + (this.x1 * this._shapeW);
        var y1 = this._shapeY + (this.y1 * this._shapeH);
        var out = ctx.createLinearGradient(x0, y0, x1, y1);
        this._stops.forEach(function(value) {
            out.addColorStop(value[0], value[1]);
        });
        return out;
    }

    copy() {
        var x0, y0, r0, x1, y1, r1;
        var boundsX, boundsY, boundsW, boundsH;
        if (this._relativeToBounds || !shape.hasParent) {
            // relative to object bounds
            boundsX = this._shapeX;
            boundsY = this._shapeY;
            boundsW = this._shapeW;
            boundsH = this._shapeH;
        } else {
            // relative to object parent bounds?
            var parentBounds = shape.parent.boundingBox;
            boundsX = parentBounds.x;
            boundsY = parentBounds.y;
            boundsW = parentBounds.width;
            boundsH = parentBounds.height;
        }
        x0 = boundsX + (this.x0.isAbsolute ? this.x0.pixelValue : this.x0.value * boundsW);
        y0 = boundsY + (this.y0.isAbsolute ? this.y0.pixelValue : this.y0.value * boundsH);
        x1 = boundsX + (this.x1.isAbsolute ? this.x1.pixelValue : this.x1.value * boundsW);
        y1 = boundsY + (this.y1.isAbsolute ? this.y1.pixelValue : this.y1.value * boundsH);
        var out = new LinearGradient(x0, y0, x1, y1);
        this._stops.forEach(function(value) {
            out.addColorStop(value[0], value[1]);
        });
        return out;
    }
}

export class RadialGradient extends Gradient {
    constructor(x0, y0, r0, x1, y1, r1) {
        super();
        this.x0 = Length.parse(x0);
        this.y0 = Length.parse(y0);
        this.r0 = Length.parse(r0);
        this.x1 = Length.parse(x1);
        this.y1 = Length.parse(y1);
        this.r1 = Length.parse(r1);
    }

    _createStyle(shape, ctx) {
        var x0, y0, r0, x1, y1, r1;
        var boundsX, boundsY, boundsW, boundsH;
        if (this._relativeToBounds || !shape.hasParent) {
            // relative to object bounds
            boundsX = this._shapeX;
            boundsY = this._shapeY;
            boundsW = this._shapeW;
            boundsH = this._shapeH;
        } else {
            // relative to object parent bounds?
            var parentBounds = shape.parent.boundingBox;
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
        this._stops.forEach(function(value) {
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
    constructor(elementOrId, repeatType) {
        super();
        this._elementOrId = elementOrId;
        this._repeatType = repeatType;
    }

    get element() {
        var out = this.elementOrId;
        if (typeof out === "string") {
            out = document.getElementById(out);
        }
        return out;
    }

    _createStyle(shape, ctx) {
        return ctx.createPattern(this.element, this._repeatType)
    }
}
