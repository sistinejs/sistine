
import * as shapes from "./shapes"

/**
 * A wrapper over a path.
 */
export class Path extends shapes.Shape {
    constructor(configs) {
        super(configs);
        this._commands = [];
    }

    _cmdMoveTo(ctx, args) { ctx.moveTo.apply(args); }
    _cmdLineTo(ctx, args) { ctx.lineTo.apply(args); }
    _cmdClosePath(ctx, args) { ctx.closePath(); }
    _cmdArc(ctx, args) { ctx.arc.apply(args); }
    _cmdArcTo(ctx, args) { ctx.arcTo.apply(args); }
    _cmdQuadraticCurveTo(ctx, args) { ctx.quadraticCurveTo.apply(args); }
    _cmdBezierCurveTo(ctx, args) { ctx.bezierCurveTo.apply(args); }
    _addCommand(cmd, args) {
        this._commands.push([cmd, args]);
    }

    moveTo(x, y) { this._addCommand(this._cmdMoveTo, [x, y]); }
    lineTo(x, y) { this._addCommand(this._cmdLineTo, [x, y]); }
    arc(x, y, radius, startAngle, endAngle, anticlockwise) {
        this._addCommand(this._cmdArc, [x, y, radius, startAngle, endAngle, anticlockwise]);
    }
    arcTo(x1, y1, x2, y2, radius) {
        this._addCommand(this._cmdArcTo, [x1, y1, x2, y2, radius]);
    }
    quadraticCurveTo(cp1x, cp1y, x, y) {
        this._addCommand(this._cmdQuadraticCurveTo, [cp1x, cp1y, x, y]);
    }
    bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
        this._addCommand(this._cmdQuadraticCurveTo, [cp1x, cp1y, cp2x, cp2y, x, y]);
    }
    closePath() {
        this._addCommand(this._cmdClosePath);
    }

    draw(ctx) {
        ctx.beginPath();
        this._commands.forEach(function(cmd) {
            var func = cmd[0];
            var args = cmd[1];
            func(ctx, args);
        });
        if (this.fillStyle) {
            ctx.fill();
        }
        if (this.lineWidth > 0) {
            ctx.stroke();
        }
    }
}

