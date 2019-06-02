
import { Shape } from "../../Core/models"
import { ShapeController } from "../../Core/controller"
import { Point, Bounds } from "../../Geom/models"
import { pointOnEllipse } from "../../Geom/utils"

export class Polygon extends Shape {
    private _p1 : Point
    private _p2 : Point
    private _numSides : number
    private _edgePoints : Array<Point>
    constructor(configs? : any) {
        super((configs = configs || {}));
        this._p1 = configs.p1 || new Point(0, 0);
        this._p2 = configs.p2 || new Point(100, 100);
        this._numSides = Math.max(3, configs.numSides || 5);
        this._edgePoints = [];
    }

    _setBounds(newBounds : Bounds) {
        this._p1.set(newBounds.left, newBounds.top);
        this._p2.set(newBounds.right, newBounds.bottom);
    }

    _evalBoundingBox() {
        var left = Math.min(this._p1.x, this._p2.x);
        var top = Math.min(this._p1.y, this._p2.y);
        var right = Math.max(this._p1.x, this._p2.x);
        var bottom = Math.max(this._p1.y, this._p2.y);
        return new Bounds(left, top, right - left, bottom - top);
    }

    get numSides() {
        return this._numSides;
    }

    draw(ctx : any) {
        var n = this._numSides;
        var theta = (Math.PI * 2.0) / n;
        var cx = this.boundingBox.centerX;
        var cy = this.boundingBox.centerY;
        var A = this.boundingBox.width / 2.0;
        var B = this.boundingBox.height / 2.0;

        var p0 = pointOnEllipse(A, B, Math.PI / 2.0);
        var pi = new Point();
        ctx.beginPath();
        ctx.moveTo(cx + p0.x, cy + p0.y);
        for (var i = 1;i < n;i++) {
            var currangle = (Math.PI / 2.0) + (i * theta);
            pointOnEllipse(A, B, currangle, pi);
            ctx.lineTo(cx + pi.x, cy + pi.y);
        }
        ctx.lineTo(cx + p0.x, cy + p0.y);
        ctx.fill();
        ctx.stroke();
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
export class PolygonController extends ShapeController<Polygon> {
}
