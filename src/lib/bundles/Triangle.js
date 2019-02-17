
import * as core from "../core"

export function newShape(configs) {
    configs = configs || {};
    return new TriangleShape(configs);
}

export function newShapeForToolbar(configs) {
    return newShape(configs);
}

export class TriangleShape extends core.Shape {
    constructor(configs) {
        super(configs);
        this._controller = new TriangleController(this);
    }

    draw(ctx) {
        var p0x = this.bounds.left;
        var p0y = this.bounds.bottom;

        var p1x = (this.bounds.left + this.bounds.right) / 2;
        var p1y = this.bounds.top;

        var p2x = this.bounds.right;
        var p2y = this.bounds.bottom;

        ctx.beginPath();
        ctx.moveTo(p0x, p0y);
        ctx.lineTo(p1x, p1y);
        ctx.lineTo(p2x, p2y);
        ctx.lineTo(p0x, p0y);
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
export class TriangleController extends core.ShapeController {
    constructor(shape) {
        super(shape);
    }
}
