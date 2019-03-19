
import * as geom from "../Geom/models"
import * as geomutils from "../Geom/utils"
import * as models from "../Core/models"
import * as controller from "../Core/controller"

export function newShape(configs) {
    configs = configs || {};
    return new CylinderShape(configs);
}

export function newShapeForToolbar(x, y, width, height, configs) {
    configs = configs || {};
    y += height / 5;
    height *= 0.6;
    configs.p1 = new geom.Point(x, y);
    configs.p2 = new geom.Point(x + width, y + height);
    return newShape(configs);
}

export class CylinderShape extends models.Shape {
    constructor(configs) {
        super(configs);
        this._p1 = configs.p1 || new geom.Point(0, 0);
        this._p2 = configs.p2 || new geom.Point(100, 100);
        this._ellipseHeight = configs.ellipseHeight || 0.4;
        this._controller = new CylinderController(this);
    }

    _evalBounds() {
        var left = Math.min(this._p1.x, this._p2.x);
        var top = Math.min(this._p1.y, this._p2.y);
        var right = Math.max(this._p1.x, this._p2.x);
        var bottom = Math.max(this._p1.y, this._p2.y);
        var eh = (bottom - top) * this._ellipseHeight;
        return new geom.Bounds(left, top - (eh / 2), right - left, eh + bottom - top);
    }

    draw(ctx) {
        var lw = this.lineWidth + 1;
        var lBounds = this.logicalBounds;
        var x = lBounds.x + lw;
        var y = lBounds.y + lw;
        var width = lBounds.width - (2 * lw);
        var height = lBounds.height - (2 * lw);
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
export class CylinderController extends controller.ShapeController {
    constructor(shape) {
        super(shape);
    }
}
