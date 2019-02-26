
class Gradient {
    constructor() {
        this._stops = [];
        this._realValue = null;
    }

    addStop(stop, color, index) {
        index = index || -1;
        if (index < 0) {
            this._stops.push([stop, color]);
        } else {
            this._stops.splice(index, 0, [stop, color]);
        }
    }

    forContext(ctx) {
        if (this._realValue == null) {
            this._realValue = this._createStyle();
            var gradient = this;
            this._stops.forEach(function(value) {
                gradient._realValue.addColorStop(value[0], value[1]);
            });
        }
        return this._realValue;
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
        return ctx.createLinearGradient(this.x0, this.y0, this.x1, this.y1);
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
        return ctx.createLinearGradient(this.x0, this.y0, this.r0, this.x1, this.y1, this.r1);
    }
}

export class Pattern {
    constructor(elementOrId, repeatType) {
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

