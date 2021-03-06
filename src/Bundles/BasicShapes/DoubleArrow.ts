
import { Shape } from "../../Core/models"
import { ShapeController } from "../../Core/controller"
import { Point, Bounds } from "../../Geom/models"

export class DoubleArrow extends Shape {
    private _p1 : Point
    private _p2 : Point
    private _shaftWidth : number
    private _tipLength : number
    private _tipPullback : number
    constructor(configs? : any) {
        super((configs = configs || {}));
        this._p1 = configs.p1 || new Point(0, 0);
        this._p2 = configs.p2 || new Point(100, 100);
        this._shaftWidth = configs.shaftWidth || 0.3;
        this._tipLength = configs.tipLength || 0.3;
        this._tipPullback = configs.tipPullback || 0.1;
    }

    _evalBoundingBox() {
        var left = Math.min(this._p1.x, this._p2.x);
        var top = Math.min(this._p1.y, this._p2.y);
        var right = Math.max(this._p1.x, this._p2.x);
        var bottom = Math.max(this._p1.y, this._p2.y);
        return new Bounds(left, top, right - left, bottom - top);
    }
    _setBounds(newBounds : Bounds) {
        this._p1.set(newBounds.left, newBounds.top);
        this._p2.set(newBounds.right, newBounds.bottom);
    }

    get className() { return "DoubleArrow"; };

    draw(ctx : any) {
        var lBounds = this.boundingBox;
        var x = lBounds.x;
        var y = lBounds.y;
        var width = lBounds.width;
        var height = lBounds.height;
        var sh = height * this._shaftWidth;
        var tl = width * this._tipLength;
        var tp = width * this._tipPullback;

        ctx.beginPath();
        ctx.moveTo(x, y + height / 2);
        ctx.lineTo(x + tp + tl, y);
        ctx.lineTo(x + tl, y + (height - sh) / 2);
        ctx.lineTo(x + width - tl, y + (height - sh) / 2);
        ctx.lineTo(x + width - tp - tl, y);
        ctx.lineTo(x + width, y + height / 2);
        ctx.lineTo(x + width - tp - tl, y + height);
        ctx.lineTo(x + width - tl, y + (height + sh) / 2);
        ctx.lineTo(x + tl, y + (height + sh) / 2);
        ctx.lineTo(x + tp + tl, y + height);
        ctx.lineTo(x, y + height / 2);
        ctx.fill();
        ctx.stroke();
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
export class DoubleArrowController extends ShapeController<DoubleArrow> {
}
