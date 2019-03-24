
import * as geom from "../../Geom/models"
import * as geomutils from "../../Geom/utils"
import * as models from "../../Core/models"
import * as controller from "../../Core/controller"

export class Cylinder extends models.Shape {
    constructor(configs) {
        super((configs = configs || {}));
        this._p1 = configs.p1 || new geom.Point(0, 0);
        this._p2 = configs.p2 || new geom.Point(100, 100);
        this._ellipseHeight = configs.ellipseHeight || 0.4;
    }

    get controllerClass() { return Cylinder.Controller; }

    _evalBounds() {
        var left = Math.min(this._p1.x, this._p2.x);
        var top = Math.min(this._p1.y, this._p2.y);
        var right = Math.max(this._p1.x, this._p2.x);
        var bottom = Math.max(this._p1.y, this._p2.y);
        return new geom.Bounds(left, top, right - left, bottom - top);
    }

    _setBounds(newBounds) {
        console.log("Setting cylinder bounds: ", newBounds);
        this._p1.set(newBounds.left, newBounds.top);
        this._p2.set(newBounds.right, newBounds.bottom);
    }

    draw(ctx) {
        var lBounds = this.logicalBounds;
        var x = lBounds.x;
        var y = lBounds.y;
        var width = lBounds.width;
        var height = lBounds.height;
        var rx = width / 2;
        var eh = height * this._ellipseHeight;
        var eh2 = eh / 2;

        // Top component
        // TODO - Can we just make this a "group" with an ellipse and a path?
        ctx.beginPath();
        ctx.ellipse(x + rx, y + eh2, rx, eh2, 0, 0, 2 * Math.PI);
        if (this.fillStyle) {
            ctx.fill();
        }
        if (this.lineWidth > 0) {
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.moveTo(x, y + eh2);
        ctx.lineTo(x, y + height - eh2);
        ctx.ellipse(x + rx, y + height - eh2, rx, eh2, 0, Math.PI, 0, true);
        ctx.lineTo(x + width, y + eh2);
        ctx.ellipse(x + rx, y + eh2, rx, eh2, 0, 0, Math.PI);
        // ctx.lineTo(x + width, y + eh / 2);
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
Cylinder.Controller = class CylinderController extends controller.ShapeController {
    constructor(shape) {
        super(shape);
    }
}
