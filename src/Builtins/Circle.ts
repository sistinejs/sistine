
import { Shape } from "../Core/models"
import { DEFAULT_CONTROL_SIZE, ShapeController, ControlPoint, HitType, HitInfo, HitInfoSnapshot } from "../Core/controller";
import { Bounds, Length } from "../Geom/models"

export class Circle extends Shape {
    private created : boolean = false;
    private _cx : number = 0;
    private _cy : number = 0;
    private _radius : number = 0;
    constructor(configs : any = {}) {
        super((configs = configs || {}));
        if (configs.cx && configs.cy) {
            this.created = true;
        } else {
            this._cx = configs.cx || 0;
            this._cy = configs.cy || 0;
            this._radius = configs.radius || 0;
        }
    }

    newInstance() {
        var out = super.newInstance();
        out._cx = this._cx;
        out._cy = this._cy;
        out._radius = this._radius;
        return out;
    }

    get cx() { return this._cx; }
    get cy() { return this._cy; }
    get radius() { return this._radius; }

    set cx(value) { this._cx = value; this.markTransformed(); }
    set cy(value) { this._cy = value; this.markTransformed(); }
    set radius(value) {
        if (value < 0) {
            throw new Error("Radius cannot be negative");
        }
        this._radius = value;
        this.markTransformed(); 
    }

    _evalBoundingBox() {
        var r = this._radius;
        return new Bounds(this._cx - r, this._cy - r, r * 2, r * 2);
    }
    _setBounds(newBounds : Bounds) {
        this.cx = newBounds.centerX;
        this.cy = newBounds.centerY;
        this.radius = newBounds.innerRadius;
    }
    canSetBounds(newBounds : Bounds) : boolean {
        newBounds.width = newBounds.height = Math.min(newBounds.width, newBounds.height);
        return true;
    }

    draw(ctx : any) {
        ctx.beginPath();
        ctx.arc(this._cx, this._cy, this._radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
export class CircleController extends ShapeController<Circle> {
}
