
import * as models from "../Core/models"
import * as controller from "../Core/controller"

export function newShape(configs) {
    configs = configs || {};
    return new RightArrowShape(configs);
}

export function newShapeForToolbar(configs) {
    return newShape(configs);
}

export class RightArrowShape extends models.Shape {
    constructor(configs) {
        super(configs);
        this._shaftWidth = configs.shaftWidth || 0.4;
        this._tipLength = configs.tipLength || 0.4;
        this._tipPullback = configs.tipPullback || 0;
        this._backDepth = configs.backDepth || 0;
        this._controller = new RightArrowController(this);
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
        var bd = width * this._backDepth;

        ctx.beginPath();
        ctx.moveTo(x, y + (height - sh) / 2);
        if (bd > 0) {
            ctx.lineTo(x + bd, y + height / 2);
        }
        ctx.lineTo(x, y + (height + sh) / 2);
        ctx.lineTo(x + width - tl, y + (height + sh) / 2);
        ctx.lineTo(x + width - tl - tp, y + height);
        ctx.lineTo(x + width, y + height / 2);
        ctx.lineTo(x + width - tl - tp, y);
        ctx.lineTo(x + width - tl, y + (height - sh) / 2);
        ctx.lineTo(x, y + (height - sh) / 2);
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
export class RightArrowController extends controller.ShapeController {
    constructor(shape) {
        super(shape);
    }
}
