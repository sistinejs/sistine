
import * as geom from "../../Geom/models"
import * as geomutils from "../../Geom/utils"
import * as models from "../../Core/models"
import * as controller from "../../Core/controller"

export class Triangle extends models.Shape {
    constructor(configs : any) {
        super((configs = configs || {}));
        this._p0 = configs.p0 || null;
        this._p1 = configs.p1 || null;
        this._p2 = configs.p2 || null;
    }

    _setBounds(newBounds) {
        if (this._p0 == null) {
            this._p0 = new geom.Point(newBounds.centerX, newBounds.top);
            this._p1 = new geom.Point(newBounds.left, newBounds.bottom);
            this._p2 = new geom.Point(newBounds.right, newBounds.bottom);
        } else {
            var oldBounds = this.boundingBox;
            var sx = newBounds.width / oldBounds.width;
            var sy = newBounds.height / oldBounds.height;
            this._p0.x = newBounds.x + ((this._p0.x - oldBounds.x) * sx)
            this._p0.y = newBounds.y + ((this._p0.y - oldBounds.y) * sy)
            this._p1.x = newBounds.x + ((this._p1.x - oldBounds.x) * sx)
            this._p1.y = newBounds.y + ((this._p1.y - oldBounds.y) * sy)
            this._p2.x = newBounds.x + ((this._p2.x - oldBounds.x) * sx)
            this._p2.y = newBounds.y + ((this._p2.y - oldBounds.y) * sy)
        }
    }

    _evalBoundingBox() {
        if (this._p0 == null) {
            // shape hasnt been created yet
            return new geom.Bounds();
        }
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
        ctx.fill();
        ctx.stroke();
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
