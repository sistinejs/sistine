
import { Geom } from "../../Geom/index"
import * as models from "../../Core/models"
import * as controller from "../../Core/controller"

var ControlPoint = controller.ControlPoint;
var HitType = controller.HitType;
var HitInfo = controller.HitInfo;

export class Arc extends models.Shape {
    constructor(configs) {
        super((configs = configs || {}));
        this._p0 = configs.p0 || new Geom.Models.Point();
        this._p1 = configs.p1 || new Geom.Models.Point();
        this._p2 = configs.p1 || new Geom.Models.Point();
    }

    get controllerClass() { return Arc.Controller; }

    _setBounds(newBounds) {
        this._p0.set(newBounds.left, newBounds.top);
        this._p1.set(newBounds.centerX, newBounds.centerY);
        this._p2.set(newBounds.right, newBounds.bottom);
    }

    _evalBoundingBox() {
        var left = Math.min(this._p0.x, this._p1.x);
        var top = Math.min(this._p0.y, this._p1.y);
        var right = Math.max(this._p0.x, this._p1.x);
        var bottom = Math.max(this._p0.y, this._p1.y);
        return new Geom.Models.Bounds(left, top, right - left, bottom - top);
    }

    get className() { return "Arc"; };

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this._p0.x, this._p0.y);
        ctx.lineTo(this._p1.x, this._p1.y);
        ctx.stroke();
    }

    drawControls(ctx) {
        ctx.fillStyle = "yellow";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this._p0.x, this._p0.y, models.DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(this._p1.x, this._p1.y, models.DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
Arc.Controller = class ArcController extends controller.ShapeController {
    constructor(shape) {
        super(shape);
    }

    _evalControlPoints() {
        var line = this.shape;
        return [new ControlPoint(line._p0, HitType.CONTROL, 0, "grab"),
                new ControlPoint(line._p1, HitType.CONTROL, 1, "grab")]
    }

    _checkMoveHitInfo(x, y) {
        var boundingBox = this.shape.boundingBox;
        if (boundingBox.containsPoint(x, y)) {
            return new HitInfo(this.shape, HitType.MOVE, 0, "move");
        }
        return null;
    }

    applyHitChanges(hitInfo, savedInfo, downX, downY, currX, currY) {
        var deltaX = currX - downX;
        var deltaY = currY - downY;
        var line = this.shape;
        if (hitInfo.hitType == HitType.MOVE) {
            line._p0.set(savedInfo.downP0.x + deltaX, savedInfo.downP0.y + deltaY);
            line._p1.set(savedInfo.downP1.x + deltaX, savedInfo.downP1.y + deltaY);
        }
        else if (hitInfo.hitIndex == 0) {
            line._p0.set(savedInfo.downP0.x + deltaX, savedInfo.downP0.y + deltaY);
        } else {
            line._p1.set(savedInfo.downP1.x + deltaX, savedInfo.downP1.y + deltaY);
        }
        line._boundingBox = null;
        line.markTransformed();
    }

    snapshotFor(hitInfo) {
        return {
            downP0: this.shape._p0.copy(),
            downP1: this.shape._p1.copy(),
        };
    }
}
