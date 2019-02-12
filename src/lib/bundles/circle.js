

import * as core from "../core"

export function newShape(configs) {
    return new CircleShape(configs);
}

export function newShapeForToolbar(configs) {
    return new CircleShape(configs);
}

export class CircleShape extends core.Shape {
    constructor(configs) {
        super(configs);
        this._controller = new CircleController(this);
    }

    get radius() { return Math.min(this.bounds.width, this.bounds.height) / 2.0; }

    draw(ctx) {
        var lw = this.lineWidth + 1;
        var x = this.bounds.x + lw;
        var y = this.bounds.y + lw;
        var width = this.bounds.width - (2 * lw);
        var height = this.bounds.height - (2 * lw);

        ctx.beginPath();
        ctx.arc(this.bounds.midX, this.bounds.midY, this.radius, 0, 2 * Math.PI);
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
export class CircleController extends core.ShapeController {
    constructor(shape) {
        super(shape);
    }
}
