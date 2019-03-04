
import * as models from "../Core/models"
import * as controller from "../Core/controller"

export function newShape(configs) {
    configs = configs || {};
    return new CircleShape(configs);
}

export function newShapeForToolbar(configs) {
    return newShape(configs);
}

export class CircleShape extends models.Shape {
    constructor(configs) {
        super(configs);
        this._controller = new CircleController(this);
    }

    get className() { return "Circle"; };

    get radius() { return this.bounds.innerRadius; }

    setSize(w, h, force) {
        w = h = Math.min(w, h);
        return super.setSize(w, h, force);
    }

    draw(ctx) {
        var lw = this.lineWidth + 1;
        var x = this.bounds.x + lw;
        var y = this.bounds.y + lw;
        var width = this.bounds.width - (2 * lw);
        var height = this.bounds.height - (2 * lw);
        var R = Math.max(0, this.radius);

        ctx.beginPath();
        ctx.arc(this.bounds.centerX, this.bounds.centerY, R, 0, 2 * Math.PI);
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
export class CircleController extends controller.ShapeController {
    constructor(shape) {
        super(shape);
    }
}
