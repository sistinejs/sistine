
import * as geom from "../Geom/models"
import * as geomutils from "../Geom/utils"
import * as models from "../Core/models"
import * as controller from "../Core/controller"

export function newShape(configs) {
    configs = configs || {};
    return new TriangleShape(configs);
}

export function newShapeForToolbar(x, y, width, height, configs) {
    configs = configs || {};
    configs.p0 = configs.p0 || new geom.Point(x + width / 2, y);
    configs.p1 = configs.p1 || new geom.Point(x + width, y + height);
    configs.p2 = configs.p2 || new geom.Point(x, y + height);
    return newShape(configs);
}

export class TriangleShape extends models.Shape {
    constructor(configs) {
        super(configs);
        this._p0 = configs.p0 || new geom.Point();
        this._p1 = configs.p1 || new geom.Point();
        this._p2 = configs.p2 || new geom.Point();
        this._controller = new TriangleController(this);
    }

    _setBounds(bounds) {
        this._p0.x = bounds.centerX;
        this._p0.y = bounds.y;
        this._p1.x = bounds.x;
        this._p1.y = bounds.bottom;
        this._p2.x = bounds.right;
        this._p2.y = bounds.bottom;
    }

    _evalBounds() {
        var left = Math.min(this._p0.x, this._p1.x, this._p2.x);
        var top = Math.min(this._p0.y, this._p1.y, this._p2.y);
        var right = Math.max(this._p0.x, this._p1.x, this._p2.x);
        var bottom = Math.max(this._p0.y, this._p1.y, this._p2.y);
        return new geom.Bounds(left, top, right - left, bottom - top);
    }

    get className() { return "Triangle"; };

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this._p0.x, this._p0.y);
        ctx.lineTo(this._p1.x, this._p1.y);
        ctx.lineTo(this._p2.x, this._p2.y);
        ctx.lineTo(this._p0.x, this._p0.y);
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
export class TriangleController extends controller.ShapeController {
    constructor(shape) {
        super(shape);
    }
}
