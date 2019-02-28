
import * as models from "../Core/models"
import * as controller from "../Core/controller"

export function newShape(configs) {
    configs = configs || {};
    return new PlusShape(configs);
}

export function newShapeForToolbar(configs) {
    return newShape(configs);
}

export class PlusShape extends models.Shape {
    constructor(configs) {
        super(configs);
        this._innerWidth = configs.innerWidth || 0.3;
        this._innerHeight = configs.innerHeight || 0.3;
        this._controller = new PlusController(this);
    }

    get innerWidth() { return this._innerWidth; }
    get innerHeight() { return this._innerHeight; }

    draw(ctx) {
        var lw = this.lineWidth + 2;
        var x = this.bounds.x + lw;
        var y = this.bounds.y + lw;
        var width = this.bounds.width - (2 * lw);
        var height = this.bounds.height - (2 * lw);
        var iw = this.innerWidth * width;
        var ih = this.innerHeight * height;

        ctx.beginPath();
        ctx.moveTo(x + (width - iw) / 2, y);
        ctx.lineTo(x + (width + iw) / 2, y);
        ctx.lineTo(x + (width + iw) / 2, y + (height - iw) / 2);
        ctx.lineTo(x + width, y + (height - iw) / 2);
        ctx.lineTo(x + width, y + (height + iw) / 2);
        ctx.lineTo(x + (width + iw) / 2, y + (height + iw) / 2);
        ctx.lineTo(x + (width + iw) / 2, y + height);
        ctx.lineTo(x + (width - iw) / 2, y + height);
        ctx.lineTo(x + (width - iw) / 2, y + (height + iw) / 2);
        ctx.lineTo(x, y + (height + iw) / 2);
        ctx.lineTo(x, y + (height - iw) / 2);
        ctx.lineTo(x + (width - iw) / 2, y + (height - iw) / 2);
        ctx.lineTo(x + (width - iw) / 2, y);
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
export class PlusController extends controller.ShapeController {
    constructor(shape) {
        super(shape);
    }
}
