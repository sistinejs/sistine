

import * as core from "../core"

export function newShape(configs) {
    configs = configs || {};
    return new EllipseShape(configs);
}

export function newShapeForToolbar(configs) {
    configs = configs || {};
    configs.y = configs.height / 4;
    configs.height *= 0.7;
    return newShape(configs);
}

export class EllipseShape extends core.Shape {
    constructor(configs) {
        super(configs);
        this._controller = new EllipseController(this);
    }

    get radius() { return Math.min(this.bounds.width, this.bounds.height) / 2.0; }

    draw(ctx) {
        var lw = this.lineWidth + 1;
        var x = this.bounds.x + lw;
        var y = this.bounds.y + lw;
        var w = this.bounds.width - (2 * lw);
        var h = this.bounds.height - (2 * lw);

        var kappa = .5522848,
            ox = (w / 2) * kappa, // control point offset horizontal
            oy = (h / 2) * kappa, // control point offset vertical
            xe = x + w,           // x-end
            ye = y + h,           // y-end
            xm = x + w / 2,       // x-middle
            ym = y + h / 2;       // y-middle

        ctx.beginPath();
        ctx.moveTo(x, ym);
        ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
        ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
        ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
        ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
        //ctx.closePath(); // not used correctly, see comments (use to close off open path)
        ctx.stroke();
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
export class EllipseController extends core.ShapeController {
    constructor(shape) {
        super(shape);
    }
}
