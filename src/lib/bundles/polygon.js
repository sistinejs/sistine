
import * as core from "../core"

export function create(configs) {
    return new Polygon(configs);
}

export function createForToolbar(configs) {
    return create(configs);
}

export class Polygon extends core.Shape {
    constructor(configs) {
        super(configs);
        this._numSides = Math.max(3, configs.numSides || 5);
        this._edgePoints = [];
    }

    get numSides() {
        return this._numSides;
    }

    draw(ctx) {
        var n = this._numSides;
        var theta = (Math.PI * 2.0) / n;
        var cx = this.bounds.midX;
        var cy = this.bounds.midY;
        var radius = Math.min(this.bounds.width, this.bounds.height) / 2.0;
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
