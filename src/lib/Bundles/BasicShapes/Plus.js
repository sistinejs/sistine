
import * as geom from "../../Geom/models"
import * as geomutils from "../../Geom/utils"
import * as models from "../../Core/models"
import * as controller from "../../Core/controller"

export class Plus extends models.Shape {
    constructor(configs) {
        super((configs = configs || {}));
        this._p1 = configs.p1 || new geom.Point(0, 0);
        this._p2 = configs.p2 || new geom.Point(100, 100);
        this._innerWidth = configs.innerWidth || 0.3;
        this._innerHeight = configs.innerHeight || 0.3;
    }

    get controllerClass() { return Plus.Controller; }

    _setBounds(newBounds) {
        this._p1.set(newBounds.left, newBounds.top);
        this._p2.set(newBounds.right, newBounds.bottom);
    }

    _evalBoundingBox() {
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
        var lBounds = this.boundingBox;
        var x = lBounds.x;
        var y = lBounds.y;
        var width = lBounds.width;
        var height = lBounds.height;
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
        ctx.fill();
        ctx.stroke();
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
Plus.Controller = class PlusController extends controller.ShapeController {
    constructor(shape) {
        super(shape);
    }
}
