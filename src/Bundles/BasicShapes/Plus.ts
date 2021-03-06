
import { Shape } from "../../Core/models"
import { ShapeController } from "../../Core/controller"
import { Point, Bounds } from "../../Geom/models"

export class Plus extends Shape {
    private _p1 : Point
    private _p2 : Point
    private _innerWidth : number;
    private _innerHeight : number;
    constructor(configs? : any) {
        super((configs = configs || {}));
        this._p1 = configs.p1 || new Point(0, 0);
        this._p2 = configs.p2 || new Point(100, 100);
        this._innerWidth = configs.innerWidth || 0.3;
        this._innerHeight = configs.innerHeight || 0.3;
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

    get className() { return "Plus"; }

    get innerWidth() { return this._innerWidth; }
    get innerHeight() { return this._innerHeight; }

    draw(ctx : any) {
        var lBounds = this.boundingBox;
        var x = lBounds.x;
        var y = lBounds.y;
        var width = lBounds.width;
        var height = lBounds.height;
        var iw = this.innerWidth * width;
        var ih = this.innerHeight * height;

        ctx.beginPath();
        ctx.moveTo(x + (width - iw) / 2, y);
        ctx.lineTo(x + (width + iw) / 2, y);
        ctx.lineTo(x + (width + iw) / 2, y + (height - iw) / 2);
        ctx.lineTo(x + width, y + (height - iw) / 2);
        ctx.lineTo(x + width, y + (height + iw) / 2);
        ctx.lineTo(x + (width + iw) / 2, y + (height + iw) / 2);
        ctx.lineTo(x + (width + iw) / 2, y + height);
        ctx.lineTo(x + (width - iw) / 2, y + height);
        ctx.lineTo(x + (width - iw) / 2, y + (height + iw) / 2);
        ctx.lineTo(x, y + (height + iw) / 2);
        ctx.lineTo(x, y + (height - iw) / 2);
        ctx.lineTo(x + (width - iw) / 2, y + (height - iw) / 2);
        ctx.lineTo(x + (width - iw) / 2, y);
        ctx.fill();
        ctx.stroke();
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
export class PlusController extends ShapeController<Plus> {
}
