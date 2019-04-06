
import { Geom } from "../../Geom/index"
import * as models from "../../Core/models"
import * as controller from "../../Core/controller"

var ControlPoint = controller.ControlPoint;
var HitType = controller.HitType;
var HitInfo = controller.HitInfo;

export class Rectangle extends models.Shape {
    constructor(configs) {
        super((configs = configs || {}));
        this._p1 = configs.p1 || new Geom.Models.Point(0, 0);
        this._p2 = configs.p2 || new Geom.Models.Point(100, 100);
    }

    get controllerClass() { return Rectangle.Controller; }

    _setBounds(newBounds) {
        this._p1.set(newBounds.left, newBounds.top);
        this._p2.set(newBounds.right, newBounds.bottom);
    }

    _evalBoundingBox() {
        var left = Math.min(this._p1.x, this._p2.x);
        var top = Math.min(this._p1.y, this._p2.y);
        var right = Math.max(this._p1.x, this._p2.x);
        var bottom = Math.max(this._p1.y, this._p2.y);
        return new Geom.Models.Bounds(left, top, right - left, bottom - top);
    }

    get className() { return "Rectangle"; }

    draw(ctx) {
        var lBounds = this.boundingBox;
        ctx.fillRect(lBounds.left, lBounds.top, lBounds.width, lBounds.height);
        ctx.strokeRect(lBounds.left, lBounds.top, lBounds.width, lBounds.height);
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
Rectangle.Controller = class RectangleController extends controller.ShapeController {
    constructor(shape) {
        super(shape);
    }
}
