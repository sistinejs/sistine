
export class Style {
    constructor() {
        this._realValue = null;
        this._context = null;
    }

    forContext(ctx) {
        if (this._realValue == null || this._context != ctx) {
            this._context = ctx;
            this._realValue = this._createStyle(ctx);
        }
        return this._realValue;
    }

    apply(property, ctx) {
        ctx[property] = this.forContext(ctx);
    }
}

export class Literal extends Style {
    constructor(value) {
        super();
        this._value = value;
    }

    _createStyle(ctx) {
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

    _createStyle(ctx) {
        var out = ctx.createLinearGradient(this.x0, this.y0, this.x1, this.y1);
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

    _createStyle(ctx) {
        var out = ctx.createRadialGradient(this.x0, this.y0, this.r0,
                                           this.x1, this.y1, this.r1);
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

    _createStyle(ctx) {
        return ctx.createPattern(this.element, this._repeatType)
    }
}
