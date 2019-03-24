
import * as geom from "../../Geom/models"
import * as geomutils from "../../Geom/utils"
import * as models from "../../Core/models"
import * as controller from "../../Core/controller"

export function newShape(configs) {
    configs = configs || {};
    return new RightArrowShape(configs);
}

export class RightArrowShape extends models.Shape {
    constructor(configs) {
        super(configs);
        this._p1 = configs.p1 || new geom.Point(0, 0);
        this._p2 = configs.p2 || new geom.Point(100, 100);
        this._shaftWidth = configs.shaftWidth || 0.4;
        this._tipLength = configs.tipLength || 0.4;
        this._tipPullback = configs.tipPullback || 0;
        this._backDepth = configs.backDepth || 0;
        this._controller = new RightArrowController(this);
    }

    _setBounds(newBounds) {
        this._p1.set(newBounds.left, newBounds.top);
        this._p2.set(newBounds.right, newBounds.bottom);
    }

    _evalBounds() {
        var left = Math.min(this._p1.x, this._p2.x);
        var top = Math.min(this._p1.y, this._p2.y);
        var right = Math.max(this._p1.x, this._p2.x);
        var bottom = Math.max(this._p1.y, this._p2.y);
        return new geom.Bounds(left, top, right - left, bottom - top);
    }

    get className() { return "RightArrow"; }

    draw(ctx) {
        var lw = this.lineWidth + 1;
        var lBounds = this.logicalBounds;
        var x = lBounds.x + lw;
        var y = lBounds.y + lw;
        var width = lBounds.width - (2 * lw);
        var height = lBounds.height - (2 * lw);
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
