import { Geom } from "../Geom/index"
import * as models from "../Core/models"
import * as controller from "../Core/controller"

var ControlPoint = controller.ControlPoint;
var HitType = controller.HitType;
var HitInfo = controller.HitInfo;
var Bounds = Geom.Models.Bounds;

export class Arc extends models.Shape {
    private created : boolean = false
    readonly x0 : number = 0;
    readonly y0 : number = 0;
    readonly x1 : number = 0;
    readonly y1 : number = 0;
    readonly x2 : number = 0;
    readonly y2 : number = 0;
    constructor(configs : any) {
        super((configs = configs || {}));
        if (configs.x0 && configs.y0) {
            this.created = true;
        } else {
            this.x0 = configs.x0 || 0;
            this.y0 = configs.y0 || 0;
            this.x1 = configs.x1 || 0;
            this.y1 = configs.y1 || 0;
            this.x2 = configs.x2 || 0;
            this.y2 = configs.y2 || 0;
        }
    }

    _setBounds(newBounds : Bounds) {
        if (!this.created) {
            // creating by bounds
            this.x0 = newBounds.left;
            this.y0 = newBounds.bottom;
            this.x1 = newBounds.centerX;
            this.y1 = newBounds.top;
            this.x2 = newBounds.right;
            this.y2 = newBounds.bottom;
            this.created = true;
        } else {
            var oldBounds = this.boundingBox;
            var sx = newBounds.width / oldBounds.width;
            var sy = newBounds.height / oldBounds.height;
            this.x0 = newBounds.x + ((this.x0 - oldBounds.x) * sx)
            this.y0 = newBounds.y + ((this.y0 - oldBounds.y) * sy)
            this.x1 = newBounds.x + ((this.x1 - oldBounds.x) * sx)
            this.y1 = newBounds.y + ((this.y1 - oldBounds.y) * sy)
            this.x2 = newBounds.x + ((this.x2 - oldBounds.x) * sx)
            this.y2 = newBounds.y + ((this.y2 - oldBounds.y) * sy);
        }
    }

    _evalBoundingBox() {
        if (!this.created) {
            // shape hasnt been created yet
            return new Geom.Models.Bounds();
        }
        var left = Math.min(this.x0, this.x1);
        var top = Math.min(this.y0, this.y1);
        var right = Math.max(this.x0, this.x1);
        var bottom = Math.max(this.y0, this.y1);
        return new Geom.Models.Bounds(left, top, right - left, bottom - top);
    }

    get className() { return "Arc"; };

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.x0, this.y0);
        ctx.arcTo(this.x1, this.y1);
        ctx.stroke();
    }

    drawControls(ctx) {
        ctx.fillStyle = "yellow";
        ctx.strokeStyle = "black";
        ctx.arcWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x0, this.y0, controllers.DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(this.x1, this.y1, controllers.DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
export class ArcController extends controller.ShapeController {
    constructor(shape) {
        super(shape);
    }

    _evalControlPoints() {
        var arc = this.shape;
        return [new ControlPoint(arc.x0, arc.y0, HitType.CONTROL, 0, "grab"),
                new ControlPoint(arc.x1, arc.y1, HitType.CONTROL, 1, "grab")]
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
        var arc = this.shape;
        if (hitInfo.hitType == HitType.MOVE) {
            arc.x0 = savedInfo.downX0 + deltaX;
            arc.y0 = savedInfo.downY0 + deltaY;
            arc.x1 = savedInfo.downX1 + deltaX;
            arc.y1 = savedInfo.downY1 + deltaY;
            arc.x2 = savedInfo.downX2 + deltaX;
            arc.y2 = savedInfo.downY2 + deltaY;
        }
        else if (hitInfo.hitIndex == 0) {
            arc.x0 = savedInfo.downX0 + deltaX;
            arc.y0 = savedInfo.downY0 + deltaY;
        } else if (hitInfo.hitIndex == 1) {
            arc.x1 = savedInfo.downX1 + deltaX;
            arc.y1 = savedInfo.downY1 + deltaY;
        } else if (hitInfo.hitIndex == 2) {
            arc.x2 = savedInfo.downX2 + deltaX;
            arc.y2 = savedInfo.downY2 + deltaY;
        }
        arc._boundingBox = null;
        arc.markTransformed();
    }

    snapshotFor(hitInfo) {
        return {
            downX0: this.shape.x0,
            downY0: this.shape.y0,
            downX1: this.shape.x1,
            downY1: this.shape.y1,
        };
    }
}
