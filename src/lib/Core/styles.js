
export class Style {
    constructor() {
        this._realValue = null;
        this._context = null;
        this._shapeX = null;
        this._shapeY = null;
        this._shapeW = null;
        this._shapeH = null;
    }

    forContext(shape, ctx) {
        if (this._hasChanged(shape, ctx)) {
            this._shapeX = shape.logicalBounds.x;
            this._shapeY = shape.logicalBounds.y;
            this._shapeW = shape.logicalBounds.width;
            this._shapeH = shape.logicalBounds.height;
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
                shape.logicalBounds.x != this._shapeX ||
                shape.logicalBounds.y != this._shapeY ||
                shape.logicalBounds.width != this._shapeW ||
                shape.logicalBounds.height != this._shapeH;
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
        this.x0 = x0;
        this.y0 = y0;
        this.x1 = x1;
        this.y1 = y1;
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
        var out = new LinearGradient(this.x0, this.y0, this.x1, this.y1);
        out._stops = this._stops.slice(0, this._stops.length);
        return out;
    }
}

export class RadialGradient extends Gradient {
    constructor(x0, y0, r0, x1, y1, r1) {
        super();
        this.x0 = x0;
        this.y0 = y0;
        this.r0 = r0;
        this.x1 = x1;
        this.y1 = y1;
        this.r1 = r1;
    }

    _createStyle(shape, ctx) {
        var out = ctx.createRadialGradient(
                    this._shapeX + (this.x0 * this._shapeW),
                    this._shapeY + (this.y0 * this._shapeH),
                    (this.r0 * this._shapeW),
                    this._shapeX + (this.x1 * this._shapeW),
                    this._shapeY + (this.y1 * this._shapeH),
                    (this.r1 * this._shapeH));
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
