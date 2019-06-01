import { Core } from "../Core"
import { DEFAULT_CONTROL_SIZE, ShapeController, ControlPoint, HitType, HitInfo, HitInfoSnapshot } from "../Core/controller";
import { Bounds, Length } from "../Geom/models"

export class Ellipse extends Core.Models.Shape {
    private created : boolean = false
    private _cx : number = 0;
    private _cy : number = 0;
    private _rx : number = 0;
    private _ry : number = 0;
    constructor(configs? : any) {
        super((configs = configs || {}));
        if (configs.cx && configs.cy) {
            this.created = true;
        } else {
            this._cx = configs.cx || 0;
            this._cy = configs.cy || 0;
            this._rx = configs.rx || 0;
            this._ry = configs.ry || 0;
        }
    }

    get cx() { return this._cx; }
    get cy() { return this._cy; }
    set cx(value) { this._cx = value; }
    set cy(value) { this._cy = value; }

    get rx() { return this._rx; }
    set rx (value) {
        this._rx = value;
        if (this._rx < 0) {
            throw new Error("Radius X cannot be negative");
        }
    }

    get ry() { return this._ry; }
    set ry (value) {
        this._ry = value;
        if (this._ry < 0) {
            throw new Error("Radius Y cannot be negative");
        }
    }

    _evalBoundingBox() : Bounds {
        return new Bounds(this._cx - this._rx,
                          this._cy - this._ry,
                          this._rx * 2,
                          this._ry * 2);
    }
    _setBounds(newBounds : Bounds) {
        this.cx = newBounds.centerX;
        this.cy = newBounds.centerY;
        this.rx = newBounds.width / 2;
        this.ry = newBounds.height / 2;
    }

    draw(ctx : any) {
        ctx.beginPath();
        ctx.ellipse(this._cx, this._cy, this._rx, this._ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
export class EllipseController extends ShapeController<Ellipse> {
}
