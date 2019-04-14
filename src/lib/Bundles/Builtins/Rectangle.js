
import { Geom } from "../../Geom/index"
import * as models from "../../Core/models"
import * as controller from "../../Core/controller"

var ControlPoint = controller.ControlPoint;
var HitType = controller.HitType;
var HitInfo = controller.HitInfo;

export class Rectangle extends models.Shape {
    constructor(configs) {
        super((configs = configs || {}));
        this._x = configs._x || 0;
        this._y = configs._y || 0;
        this._rx = configs._rx || 0;
        this._ry = configs._ry || 0;
        this._width = configs._width || 0;
        this._height = configs._height || 0;
    }

    get controllerClass() { return Rectangle.Controller; }

    get x() { return this._x; }
    get y() { return this._y; }
    set x(value) { this._x = value; }
    set y(value) { this._y = value; }

    get width() { return this._width; }
    set width (value) {
        this._width = value;
        if (this._width < 0) {
            throw new Error("Width cannot be negative");
        }
    }

    get height() { return this._height; }
    set height (value) {
        this._height = value;
        if (this._height < 0) {
            throw new Error("Height cannot be negative");
        }
    }

    get rx() { return this._rx; }
    get ry() { return this._ry; }
    set rx (value) {
        this._rx = value;
        if (this._rx < 0) {
            throw new Error("Radius X cannot be negative");
        }
    }
    set ry (value) {
        this._ry = value;
        if (this._ry < 0) {
            throw new Error("Radius Y cannot be negative");
        }
    }

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
