
import * as core from "../core"

export function newShape(configs) {
    return new Shape(configs);
}

export function newShapeForToolbar(configs) {
    return newShape(configs);
}

export class Shape extends core.Shape {
    constructor(configs) {
        super(configs);
        var size = Math.min(this.bounds.width, this.bounds.height);
        this.bounds._width = this.bounds._height = size;
        this._controller = new Controller(this);
    }

    draw(ctx) {
        var size = Math.min(this.bounds.width, this.bounds.height);
        var left = (this.bounds.left + this.bounds.right - size) / 2;
        var top = (this.bounds.top + this.bounds.bottom - size) / 2;
        if (this.fillStyle) {
            ctx.fillRect(left, top, size, size);
        }
        if (this.lineWidth > 0) {
            ctx.strokeRect(left, top, size, size);
        }
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
export class Controller extends core.Controller {
    constructor(shape) {
        super(shape);
    }
}

