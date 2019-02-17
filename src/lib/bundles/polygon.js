
import * as core from "../core"

export function newShape(configs) {
    configs = configs || {};
    return new PolygonShape(configs);
}

export function newShapeForToolbar(configs) {
    return newShape(configs);
}

export class PolygonShape extends core.Shape {
    constructor(configs) {
        super(configs);
        this._numSides = Math.max(3, configs.numSides || 5);
        this._edgePoints = [];
        this._controller = new PolygonController(this);
    }

    get numSides() {
        return this._numSides;
    }

    draw(ctx) {
        var n = this._numSides;
        var theta = (Math.PI * 2.0) / n;
        var cx = this.bounds.centerX;
        var cy = this.bounds.centerY;
        var radius = this.bounds.innerRadius;
        console.log("N, R, theta: ", n, radius, theta);

        var fx = cx;
        var fy = cy - radius;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        console.log("Fx, Fy: ", fx, fy);
        for (var i = 1;i < n;i++) {
            var currangle = (Math.PI / 2.0) + (i * theta);
            var costheta = Math.cos(currangle);
            var sintheta = Math.sin(currangle);
            var px = cx + (radius * costheta);
            var py = cy - (radius * sintheta);
            ctx.lineTo(px, py);
            console.log("Px, Py: ", px, py);
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
export class PolygonController extends core.ShapeController {
    constructor(shape) {
        super(shape);
    }
}
