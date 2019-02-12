
import * as core from "../core"

export function newShape(configs) {
    return new Shape(configs);
}

export function newShapeForToolbar(configs) {
    configs.y = configs.height / 5;
    configs.height *= 0.6;
    return newShape(configs);
}

export class Shape extends core.Shape {
    constructor(configs) {
        super(configs);
        this._controller = new Controller(this);
    }

    draw(ctx) {
        if (this.fillStyle) {
            ctx.fillRect(this.bounds.left, this.bounds.top, this.bounds.width, this.bounds.height);
        }
        if (this.lineWidth > 0) {
            ctx.strokeRect(this.bounds.left, this.bounds.top, this.bounds.width, this.bounds.height);
        }
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
export class Controller extends core.Controller {
    constructor(triangle) {
        super(triangle);
    }
}

