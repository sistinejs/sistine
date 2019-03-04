
import * as models from "../Core/models"
import * as controller from "../Core/controller"

export function newShape(configs) {
    configs = configs || {};
    return new LeftArrowShape(configs);
}

export function newShapeForToolbar(configs) {
    return newShape(configs);
}

export class LeftArrowShape extends models.Shape {
    constructor(configs) {
        super(configs);
        this._shaftWidth = configs.shaftWidth || 0.4;
        this._tipLength = configs.tipLength || 0.4;
        this._tipPullback = configs.tipPullback || 0;
        this._backDepth = configs.backDepth || 0;
        this._controller = new LeftArrowController(this);
    }

    get className() { return "LeftArrow"; };

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
        ctx.moveTo(x + width, y + (height - sh) / 2);
        if (bd > 0) {
            ctx.lineTo(x + width - bd, y + height / 2);
        }
        ctx.lineTo(x + width, y + (height + sh) / 2);
        ctx.lineTo(x + tl, y + (height + sh) / 2);
        ctx.lineTo(x + tl - tp, y + height);
        ctx.lineTo(x, y + height / 2);
        ctx.lineTo(x + tl + tp, y);
        ctx.lineTo(x + tl, y + (height - sh) / 2);
        ctx.lineTo(x + width, y + (height - sh) / 2);
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
export class LeftArrowController extends controller.ShapeController {
    constructor(shape) {
        super(shape);
    }
}
