
import * as geom from "../Geom/models"
import * as geomutils from "../Geom/utils"
import * as models from "../Core/models"
import * as controller from "../Core/controller"

export function newShape(configs) {
    configs = configs || {};
    return new PlusShape(configs);
}

export function newShapeForToolbar(x, y, width, height, configs) {
    configs = configs || {};
    configs.p1 = new geom.Point(x, y);
    configs.p2 = new geom.Point(x + width, y + height);
    return newShape(configs);
}

export class PlusShape extends models.Shape {
    constructor(configs) {
        super(configs);
        this._p1 = configs.p1 || new geom.Point(0, 0);
        this._p2 = configs.p2 || new geom.Point(100, 100);
        this._innerWidth = configs.innerWidth || 0.3;
        this._innerHeight = configs.innerHeight || 0.3;
        this._controller = new PlusController(this);
    }

    _evalBounds() {
        var left = Math.min(this._p1.x, this._p2.x);
        var top = Math.min(this._p1.y, this._p2.y);
        var right = Math.max(this._p1.x, this._p2.x);
        var bottom = Math.max(this._p1.y, this._p2.y);
        return new geom.Bounds(left, top, right - left, bottom - top);
    }

    get className() { return "Plus"; }

    get innerWidth() { return this._innerWidth; }
    get innerHeight() { return this._innerHeight; }

    draw(ctx) {
        var lBounds = this.logicalBounds;
        var lw = this.lineWidth + 2;
        var x = lBounds.x + lw;
        var y = lBounds.y + lw;
        var width = lBounds.width - (2 * lw);
        var height = lBounds.height - (2 * lw);
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
