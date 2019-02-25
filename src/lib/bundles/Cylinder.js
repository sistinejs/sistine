
import * as core from "../core"
import * as geom from "../../utils/geom"

export function newShape(configs) {
    configs = configs || {};
    return new CylinderShape(configs);
}

export function newShapeForToolbar(configs) {
    return newShape(configs);
}

export class CylinderShape extends core.Shape {
    constructor(configs) {
        super(configs);
        this._ellipseHeight = 0.4;
        this._controller = new CylinderController(this);
    }

    draw(ctx) {
        var lw = this.lineWidth + 1;
        var x = this.bounds.x + lw;
        var y = this.bounds.y + lw;
        var width = this.bounds.width - (2 * lw);
        var height = this.bounds.height - (2 * lw);
        var eh = height * this._ellipseHeight;

        ctx.beginPath();
        geom.pathEllipse(ctx, x, y, width, eh);
        ctx.moveTo(x, y + eh / 2)
        ctx.lineTo(x, y + height);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x + width, y + eh / 2);
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
export class CylinderController extends core.ShapeController {
    constructor(shape) {
        super(shape);
    }
}
