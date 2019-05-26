
import * as geom from "../../Geom/models"
import * as geomutils from "../../Geom/utils"
import * as models from "../../Core/models"
import * as controller from "../../Core/controller"

export class DoubleArrow extends models.Shape {
    constructor(configs : any) {
        super((configs = configs || {}));
        this._p1 = configs.p1 || new geom.Point(0, 0);
        this._p2 = configs.p2 || new geom.Point(100, 100);
        this._shaftWidth = configs.shaftWidth || 0.3;
        this._tipLength = configs.tipLength || 0.3;
        this._tipPullback = configs.tipPullback || 0.1;
    }

    get controllerClass() { return DoubleArrow.Controller; }

    _evalBoundingBox() {
        var left = Math.min(this._p1.x, this._p2.x);
        var top = Math.min(this._p1.y, this._p2.y);
        var right = Math.max(this._p1.x, this._p2.x);
        var bottom = Math.max(this._p1.y, this._p2.y);
        return new geom.Bounds(left, top, right - left, bottom - top);
    }
    _setBounds(newBounds) {
        this._p1.set(newBounds.left, newBounds.top);
        this._p2.set(newBounds.right, newBounds.bottom);
    }

    get className() { return "DoubleArrow"; };

    draw(ctx) {
        var lBounds = this.boundingBox;
        var x = lBounds.x;
        var y = lBounds.y;
        var width = lBounds.width;
        var height = lBounds.height;
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
        ctx.fill();
        ctx.stroke();
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
DoubleArrow.Controller = class DoubleArrowController extends controller.ShapeController {
    constructor(shape) {
        super(shape);
    }
}
