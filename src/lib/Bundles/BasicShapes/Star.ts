
import * as geom from "../../Geom/models"
import * as geomutils from "../../Geom/utils"
import * as models from "../../Core/models"
import * as controller from "../../Core/controller"

export class Star extends models.Shape {
    constructor(configs) {
        super((configs = configs || {}));
        this._p1 = configs.p1 || new geom.Point(0, 0);
        this._p2 = configs.p2 || new geom.Point(100, 100);
        this._numSides = Math.max(3, configs.numSides || 5);
        this._innerRadius = configs.innerRadius || null;
    }

    get controllerClass() { return Star.Controller; }

    _setBounds(newBounds) {
        this._p1.set(newBounds.left, newBounds.top);
        this._p2.set(newBounds.right, newBounds.bottom);
    }

    _evalBoundingBox() {
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
        return this._innerRadius || (this.boundingBox.innerRadius / 3.0);
    }

    draw(ctx) {
        var n = 2 * this._numSides;
        var theta = (Math.PI * 2.0) / n;
        var cx = this.boundingBox.centerX;
        var cy = this.boundingBox.centerY;
        var R = Math.min(this.boundingBox.width, this.boundingBox.height) / 2.0;
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
        ctx.fill();
        ctx.stroke();
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
Star.Controller = class StarController extends controller.ShapeController {
    constructor(shape) {
        super(shape);
    }
}
