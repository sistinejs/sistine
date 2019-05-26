
import { Geom } from "../Geom/index"
import * as models from "../Core/models"
import * as controller from "../Core/controller"

var ControlPoint = controller.ControlPoint;
var HitType = controller.HitType;
var HitInfo = controller.HitInfo;

export class Line extends models.Shape {
    constructor(configs) {
        super((configs = configs || {}));
        this._created = false;
        if (configs.x0 && configs.y0) {
            this._created = true;
        } else {
            this._x0 = configs.x0 || 0;
            this._y0 = configs.y0 || 0;
            this._y1 = configs.y1 || 0;
            this._x1 = configs.x1 || 0;
        }
    }

    get controllerClass() { return Line.Controller; }

    _setBounds(newBounds) {
        this._x0 = newBounds.x0;
        this._y0 = newBounds.y0;
        this._x1 = newBounds.x1;
        this._y1 = newBounds.y1;
    }

    _evalBoundingBox() {
        var left = Math.min(this._x0, this._x1);
        var right = Math.max(this._x0, this._x1);
        var top = Math.min(this._y0, this._y1);
        var bottom = Math.max(this._y0, this._y1);
        return new Geom.Models.Bounds(left, top, right - left, bottom - top);
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this._x0, this._y0);
        ctx.lineTo(this._x1, this._y1);
        ctx.stroke();
    }

    drawControls(ctx) {
        ctx.fillStyle = "yellow";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this._x0, this._y0, models.DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(this._x1, this._y1, models.DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
Line.Controller = class LineController extends controller.ShapeController {
    constructor(shape) {
        super(shape);
    }

    _evalControlPoints() {
        var line = this.shape;
        return [new ControlPoint(line._x0, line._y0, HitType.CONTROL, 0, "grab"),
                new ControlPoint(line._x1, line._y1, HitType.CONTROL, 1, "grab")]
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
            line._x0 = savedInfo.downX0 + deltaX;
            line._y0 = savedInfo.downY0 + deltaY;
            line._x1 = savedInfo.downX1 + deltaX;
            line._y1 = savedInfo.downY1 + deltaY;
        }
        else if (hitInfo.hitIndex == 1) {
            line._x0 = savedInfo.downX0 + deltaX;
            line._y0 = savedInfo.downY0 + deltaY;
        } else {
            line._x1 = savedInfo.downX1 + deltaX;
            line._y1 = savedInfo.downY1 + deltaY;
        }
        line._boundingBox = null;
        line.markTransformed();
    }

    snapshotFor(hitInfo) {
        var out = super.snapshotFor(hitInfo);
        out.downX0 = this.shape._x0;
        out.downY0 = this.shape._y0;
        out.downX1 = this.shape._x1;
        out.downY1 = this.shape._y1;
        return out;
    }
}
