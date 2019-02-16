

import * as core from "../core"

export function newShape(configs) {
    return new StarShape(configs);
}

export function newShapeForToolbar(configs) {
    return new StarShape(configs);
}

export class StarShape extends core.Shape {
    constructor(configs) {
        super(configs);
        this._numSides = Math.max(3, configs.numSides || 5);
        this._innerRadius = configs.innerRadius || (Math.min(this.bounds.width, this.bounds.height) / 5.0);
        this._controller = new StarController(this);
    }

    get numSides() {
        return this._numSides;
    }

    get innerRadius() {
        return this._innerRadius;
    }

    draw(ctx) {
        var n = 2 * this._numSides;
        var theta = (Math.PI * 2.0) / n;
        var cx = this.bounds.midX;
        var cy = this.bounds.midY;
        var R = Math.min(this.bounds.width, this.bounds.height) / 2.0;
        var innerR = this._innerRadius;

        var fx = cx;
        var fy = cy - R;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        for (var i = 1;i < n;i += 2) {
            var currangle = (Math.PI / 2.0) + (i * theta);
            var costheta = Math.cos(currangle);
            var sintheta = Math.sin(currangle);
            var px = cx + (innerR * costheta);
            var py = cy - (innerR * sintheta);
            ctx.lineTo(px, py);

            var currangle = (Math.PI / 2.0) + ((i + 1) * theta);
            var costheta = Math.cos(currangle);
            var sintheta = Math.sin(currangle);
            var px = cx + (R * costheta);
            var py = cy - (R * sintheta);
            ctx.lineTo(px, py);
        }
        ctx.lineTo(fx, fy);
        if (this.fillStyle) {
            ctx.fill();
        }
        if (this.lineWidth > 0) {
            ctx.stroke();
        }
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
export class StarController extends core.ShapeController {
    constructor(shape) {
        super(shape);
    }
}