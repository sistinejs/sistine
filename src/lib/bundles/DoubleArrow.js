
import * as models from "../Core/models"
import * as controller from "../Core/controller"

export function newShape(configs) {
    configs = configs || {};
    return new DoubleArrowShape(configs);
}

export function newShapeForToolbar(configs) {
    return newShape(configs);
}

export class DoubleArrowShape extends models.Shape {
    constructor(configs) {
        super(configs);
        this._shaftWidth = configs.shaftWidth || 0.3;
        this._tipLength = configs.tipLength || 0.3;
        this._tipPullback = configs.tipPullback || 0.1;
        this._controller = new DoubleArrowController(this);
    }

    draw(ctx) {
        var lw = this.lineWidth + 1;
        var x = this.bounds.x + lw;
        var y = this.bounds.y + lw;
        var width = this.bounds.width - (2 * lw);
        var height = this.bounds.height - (2 * lw);
        var sh = height * this._shaftWidth;
        var tl = width * this._tipLength;
        var tp = width * this._tipPullback;

        ctx.beginPath();
        ctx.moveTo(x, y + height / 2);
        ctx.lineTo(x + tp + tl, y);
        ctx.lineTo(x + tl, y + (height - sh) / 2);
        ctx.lineTo(x + width - tl, y + (height - sh) / 2);
        ctx.lineTo(x + width - tp - tl, y);
        ctx.lineTo(x + width, y + height / 2);
        ctx.lineTo(x + width - tp - tl, y + height);
        ctx.lineTo(x + width - tl, y + (height + sh) / 2);
        ctx.lineTo(x + tl, y + (height + sh) / 2);
        ctx.lineTo(x + tp + tl, y + height);
        ctx.lineTo(x, y + height / 2);
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
export class DoubleArrowController extends controller.ShapeController {
    constructor(shape) {
        super(shape);
    }
}
