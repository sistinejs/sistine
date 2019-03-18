
import * as geom from "../Utils/geom"
import * as models from "../Core/models"
import * as controller from "../Core/controller"

export function newShape(configs) {
    configs = configs || {};
    return new StarShape(configs);
}

export function newShapeForToolbar(x, y, width, height, configs) {
    configs = configs || {};
    configs.p1 = new geom.Point(x, y);
    configs.p2 = new geom.Point(x + width, y + height);
    return new StarShape(configs);
}

export class StarShape extends models.Shape {
    constructor(configs) {
        super(configs);
        this._p1 = configs.p1 || new geom.Point(0, 0);
        this._p2 = configs.p2 || new geom.Point(100, 100);
        this._numSides = Math.max(3, configs.numSides || 5);
        this._innerRadius = configs.innerRadius || null;
        this._controller = new StarController(this);
    }

    _evalBounds() {
        var left = Math.min(this._p1.x, this._p2.x);
        var top = Math.min(this._p1.y, this._p2.y);
        var right = Math.max(this._p1.x, this._p2.x);
        var bottom = Math.max(this._p1.y, this._p2.y);
        return new geom.Bounds(left, top, right - left, bottom - top);
    }

    get className() { return "Star"; }

    setSize(w, h, force) {
        w = h = Math.min(w, h);
        return super.setSize(w, h, force);
    }

    get numSides() {
        return this._numSides;
    }

    get innerRadius() {
        return this._innerRadius || (this.bounds.innerRadius / 3.0);
    }

    draw(ctx) {
        var n = 2 * this._numSides;
        var theta = (Math.PI * 2.0) / n;
        var cx = this.bounds.centerX;
        var cy = this.bounds.centerY;
        var R = Math.min(this.bounds.width, this.bounds.height) / 2.0;
        var innerR = this.innerRadius;

        var fx = cx;
        var fy = cy - R;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        for (var i = 1;i < n;i += 2) {
            var currangle = (Math.PI / 2.0) + (i * theta);
            var costheta = Math.cos(currangle);
            var sintheta = Math.sin(currangle);
            var px = cx + (innerR * costheta);
            var py = cy - (innerR * sintheta);
            ctx.lineTo(px, py);

            var currangle = (Math.PI / 2.0) + ((i + 1) * theta);
            var costheta = Math.cos(currangle);
            var sintheta = Math.sin(currangle);
            var px = cx + (R * costheta);
            var py = cy - (R * sintheta);
            ctx.lineTo(px, py);
        }
        ctx.lineTo(fx, fy);
        if (this.fillStyle) {
            ctx.fill();
        }
        if (this.lineWidth > 0) {
            ctx.stroke();
        }
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
export class StarController extends controller.ShapeController {
    constructor(shape) {
        super(shape);
    }
}
