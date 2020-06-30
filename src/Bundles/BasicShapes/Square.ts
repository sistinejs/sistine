import { Shape } from "../../Core/models"
import { ShapeController } from "../../Core/controller"
import { Point, Bounds } from "../../Geom/models"

export class Square extends Shape {
    private _p0 : Point;
    private _size : number;

    constructor(configs? : any) {
        super((configs = configs || {}));
        this._p0 = configs.p0 || new Point(0, 0);
        this._size = configs.size || 10;
    }

    canSetSize(newBounds : Bounds) {
        newBounds.width = newBounds.height = Math.min(newBounds.width, newBounds.height);
        return true;
    }
    _setBounds(newBounds : Bounds) {
        this._p0.set(newBounds.left, newBounds.top);
        this._size = newBounds.width;
    }

    _evalBoundingBox() {
        return new Bounds(this._p0.x, this._p0.y, this._size, this._size);
    }

    draw(ctx : any) {
        var size = this._size;
        var left = this._p0.x;
        var top = this._p0.y;
        ctx.fillRect(left, top, size, size);
        ctx.strokeRect(left, top, size, size);
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
export class SquareController extends ShapeController<Square> {
}
