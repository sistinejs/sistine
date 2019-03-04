
import * as models from "../Core/models"
import * as controller from "../Core/controller"

export function newShape(configs) {
    configs = configs || {};
    return new RoundedRectangleShape(configs);
}

export function newShapeForToolbar(configs) {
    configs.y = configs.height / 5;
    configs.height *= 0.6;
    return newShape(configs);
}

export class RoundedRectangleShape extends models.Shape {
    constructor(configs) {
        super(configs);
        this._cornerRadius = configs.cornerRadius || 5;
        this._controller = new RoundedRectangleController(this);
    }

    get className() { return "RoundedRectangle"; }

    draw(ctx) {
        var x = this.bounds.x;
        var y = this.bounds.y;
        var width = this.bounds.width;
        var height = this.bounds.height;
        var radius = this._cornerRadius;

        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();

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
export class RoundedRectangleController extends controller.ShapeController {
    constructor(shape) {
        super(shape);
    }
}
