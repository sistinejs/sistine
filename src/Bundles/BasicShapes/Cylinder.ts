
import { Shape } from "../../Core/models"
import { ShapeController } from "../../Core/controller"
import { Point, Bounds } from "../../Geom/models"

export class Cylinder extends Shape {
    private _p1 : Point
    private _p2 : Point
    private _ellipseHeight : number = 0.4;
    constructor(configs : any) {
        super((configs = configs || {}));
        this._p1 = configs.p1 || new Point(0, 0);
        this._p2 = configs.p2 || new Point(100, 100);
        this._ellipseHeight = configs.ellipseHeight || 0.4;
    }

    _evalBoundingBox() {
        var left = Math.min(this._p1.x, this._p2.x);
        var top = Math.min(this._p1.y, this._p2.y);
        var right = Math.max(this._p1.x, this._p2.x);
        var bottom = Math.max(this._p1.y, this._p2.y);
        return new Bounds(left, top, right - left, bottom - top);
    }

    _setBounds(newBounds : Bounds) {
        console.log("Setting cylinder bounds: ", newBounds);
        this._p1.set(newBounds.left, newBounds.top);
        this._p2.set(newBounds.right, newBounds.bottom);
    }

    draw(ctx : any) {
        var lBounds = this.boundingBox;
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
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x, y + eh2);
        ctx.lineTo(x, y + height - eh2);
        ctx.ellipse(x + rx, y + height - eh2, rx, eh2, 0, Math.PI, 0, true);
        ctx.lineTo(x + width, y + eh2);
        ctx.ellipse(x + rx, y + eh2, rx, eh2, 0, 0, Math.PI);
        // ctx.lineTo(x + width, y + eh / 2);
        ctx.fill();
        ctx.stroke();
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
export class CylinderController extends ShapeController<Cylinder> {
}
