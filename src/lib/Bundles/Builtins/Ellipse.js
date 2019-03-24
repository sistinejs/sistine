
import { Geom } from "../../Geom/index"
import * as models from "../../Core/models"
import * as controller from "../../Core/controller"

var ControlPoint = controller.ControlPoint;
var HitType = controller.HitType;
var HitInfo = controller.HitInfo;

export class Ellipse extends models.Shape {
    constructor(configs) {
        super((configs = configs || {}));
        this._p1 = configs.p1 || new Geom.Models.Point(0, 0);
        this._p2 = configs.p2 || new Geom.Models.Point(100, 100);
    }

    get controllerClass() { return Ellipse.Controller; }

    _evalBounds() {
        var left = Math.min(this._p1.x, this._p2.x);
        var top = Math.min(this._p1.y, this._p2.y);
        var right = Math.max(this._p1.x, this._p2.x);
        var bottom = Math.max(this._p1.y, this._p2.y);
        return new Geom.Models.Bounds(left, top, right - left, bottom - top);
    }
    _setBounds(newBounds) {
        this._p1.set(newBounds.left, newBounds.top);
        this._p2.set(newBounds.right, newBounds.bottom);
    }

    get className() { return "Ellipse"; };

    draw(ctx) {
        var lBounds = this.logicalBounds;
        var x = lBounds.x;
        var y = lBounds.y;
        var w = lBounds.width;
        var h = lBounds.height;

        ctx.beginPath();
        Geom.Utils.pathEllipse(ctx, x, y, w, h);
        ctx.stroke();
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
Ellipse.Controller = class EllipseController extends controller.ShapeController {
    constructor(shape) {
        super(shape);
    }
}