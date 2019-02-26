
export class Style {
    constructor() {
        this._realValue = null;
        this._context = null;
        this._x = null;
        this._y = null;
    }

    forContext(shape, ctx) {
        if (this._hasChanged(shape, ctx)) {
            this._x = shape.bounds.x;
            this._y = shape.bounds.y;
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
                shape.bounds.x != this._x || shape.bounds.y != this._y;
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
        var out = ctx.createLinearGradient(this.x0 + this._x, this.y0 + this._y,
                                           this.x1 + this._x, this.y1 + this._y);
        this._stops.forEach(function(value) {
            out.addColorStop(value[0], value[1]);
        });
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
        var out = ctx.createRadialGradient(this.x0 + this._x, this.y0 + this._y, this.r0,
                                           this.x1 + this._x, this.y1 + this._y, this.r1);
        this._stops.forEach(function(value) {
            out.addColorStop(value[0], value[1]);
        });
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
