
import * as models from "../Core/models"
import * as controller from "../Core/controller"
import * as geom from "../Utils/geom"

export function newShape(configs) {
    configs = configs || {};
    return new PolygonShape(configs);
}

export function newShapeForToolbar(configs) {
    return newShape(configs);
}

export class PolygonShape extends models.Shape {
    constructor(configs) {
        super(configs);
        this._numSides = Math.max(3, configs.numSides || 5);
        this._edgePoints = [];
        this._controller = new PolygonController(this);
    }

    setSize(w, h, force) {
        w = h = Math.min(w, h);
        return super.setSize(w, h, force);
    }

    get numSides() {
        return this._numSides;
    }

    draw(ctx) {
        var n = this._numSides;
        var theta = (Math.PI * 2.0) / n;
        var cx = this.bounds.centerX;
        var cy = this.bounds.centerY;
        var A = this.bounds.width / 2.0;
        var B = this.bounds.height / 2.0;

        var p0 = [0,0];
        var pi = [0,0];
        geom.pointOnEllipse(A, B, Math.PI / 2.0, p0);
        ctx.beginPath();
        ctx.moveTo(cx + p0[0], cy + p0[1]);
        for (var i = 1;i < n;i++) {
            var currangle = (Math.PI / 2.0) + (i * theta);
            geom.pointOnEllipse(A, B, currangle, pi);
            ctx.lineTo(cx + pi[0], cy + pi[1]);
        }
        ctx.lineTo(cx + p0[0], cy + p0[1]);
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
export class PolygonController extends controller.ShapeController {
    constructor(shape) {
        super(shape);
    }
}
