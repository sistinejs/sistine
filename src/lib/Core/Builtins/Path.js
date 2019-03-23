import { Geom } from "../../Geom/index"
import * as models from "../models"
import * as controller from "../controller"

var ControlPoint = controller.ControlPoint;
var HitType = controller.HitType;
var HitInfo = controller.HitInfo;

export function newShape(configs) {
    configs = configs || {};
    return new Path(configs);
}

/**
 * A wrapper over a path.
 */
export class Path extends Shape {
    constructor(configs) {
        super(configs);
        configs = configs || {};
        this._closed = configs.closed || false;
        this._moveTo = configs.moveTo || null;
        this._componentList = new dlist.DList();
        this._controller = new controller.PathController(this);
    }

    _setBounds(newBounds) {
        var oldBounds = this.logicalBounds;
        var sx = newBounds.width / oldBounds.width;
        var sy = newBounds.height / oldBounds.height;
        if (this._moveTo) {
            this._moveTo.x = newBounds.x + ((this._moveTo.x - oldBounds.x) * sx);
            this._moveTo.y = newBounds.y + ((this._moveTo.y - oldBounds.y) * sy);
        }
        var currComp = this._componentList.head;
        while (currComp != null) {
            var nCPT = currComp.numControlPoints;
            for (var i = nCPT - 1;i >= 0;i--) {
                var cpt = currComp.getControlPoint(i);
                var nx = newBounds.x + ((cpt.x - oldBounds.x) * sx);
                var ny = newBounds.y + ((cpt.y - oldBounds.y) * sy);
                currComp.setControlPoint(i, nx, ny);
            }
            currComp = currComp.next;
        }
    }

    _evalBounds() {
        var out = new geom.Bounds();
        if (this._moveTo) {
            out.x = this._moveTo.x;
            out.y = this._moveTo.y;
        }
        var currComp = this._componentList.head;
        while (currComp != null) {
            out.union(currComp.logicalBounds);
            currComp = currComp.next;
        }
        out.x -= 5;
        out.y -= 5;
        out.width += 10;
        out.height += 10;
        if (this.lineWidth > 0) {
            out.x -= this.lineWidth / 2;
            out.y -= this.lineWidth / 2;
            out.width += this.lineWidth;
            out.height += this.lineWidth;
        }
        return out;
    }

    /**
     * Add a new path component at the end of the path.
     */
    addComponent(component) {
        this._componentList.add(component);
        this.markTransformed();
    }

    get componentCount() {
        return this._componentList.count;
    }

    moveTo(x, y) {
        this._moveTo = new Geom.models.Point(x, y);
        this.markTransformed();
    }

    close(yesorno) {
        this._closed = yesorno;
        this.markTransformed();
    }

    lineTo(x, y) { 
        this.addComponent(new LineToComponent(x, y));
    }
    arc(x, y, radius, startAngle, endAngle, anticlockwise) {
        this.addComponent(new ArcComponent(x, y, radius, startAngle, endAngle, anticlockwise));
    }
    arcTo(x1, y1, x2, y2, radius) {
        this.addComponent(new ArcToComponent(this._cmdArcTo, x1, y1, x2, y2, radius));
    }
    quadraticCurveTo(cp1x, cp1y, x, y) {
        this.addComponent(new QuadraticCurveToComponent(cp1x, cp1y, x, y));
    }
    bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
        this.addComponent(this.BezierCurveToComponent, cp1x, cp1y, cp2x, cp2y, x, y);
    }

    draw(ctx) {
        ctx.beginPath();
        if (this._moveTo != null)
            ctx.moveTo(this._moveTo.x, this._moveTo.y);
        var currComp = this._componentList.head;
        while (currComp != null) {
            currComp.draw(ctx);
            currComp = currComp.next;
        }
        if (this._closed) ctx.closePath();
        if (this.fillStyle) {
            ctx.fill();
        }
        if (this.lineWidth > 0) {
            ctx.stroke();
        }
        // Draw fornow till we figure out hit tests and bounding boxes
        // this.drawControls(ctx);
    }

    drawControls(ctx, options) {
        super.drawControls(ctx, options);
        ctx.fillStyle = "yellow";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        if (this._moveTo != null) {
            ctx.beginPath();
            ctx.arc(this._moveTo.x, this._moveTo.y, DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        }
        var currComp = this._componentList.head;
        while (currComp != null) {
            currComp.draw(ctx);
            for (var i = currComp.numControlPoints - 1;i >= 0;i--) {
                var cpt = currComp.getControlPoint(i);
                ctx.beginPath();
                ctx.arc(cpt.x, cpt.y, DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            }
            currComp = currComp.next;
        }
    }
}

/**
 * A path is composed of several path components and form different kinds of units in a path
 * like lines, arcs, quadratic beziers etc.
 */
export class PathComponent {
    constructor() {
        this.next = null;
        this.prev = null;
        this._logicalBounds = null;
    }

    get logicalBounds() {
        if (this._logicalBounds == null) {
            this._logicalBounds = this._evalBounds();
        }
        return this._logicalBounds;
    }

    getControlPoint(i) { throw new Error( "Not implemented"); }
    setControlPoint(index, x, y) { throw new Error( "Not implemented"); }
    // get controlPoints() { return this._controlPoints; } 
    // setControlPoint(index, x, y) { this._controlPoints[index].set(x, y); this.markTransformed(); }
    get numControlPoints() { return 0; } 
}

export class LineToComponent extends PathComponent {
    constructor(x, y) {
        super();
        this._endPoint = new Geom.models.Point(x, y);
    }

    _evalBounds() {
        var minx = this._endPoint.x;
        var miny = this._endPoint.y;
        var maxx = minx;
        var maxy = miny;
        if (this.prev) {
            minx = Math.min(minx, this.prev.endPoint.x);
            miny = Math.min(miny, this.prev.endPoint.y);
            maxx = Math.max(maxx, this.prev.endPoint.x);
            maxy = Math.max(maxy, this.prev.endPoint.y);
        }
        return new geom.Bounds(minx, miny, maxx - minx, maxy - miny);
    }

    get endPoint() { return this._endPoint; }

    draw(ctx) {
        ctx.lineTo(this._endPoint.x, this._endPoint.y);
    }

    getControlPoint(index) {
        return this._endPoint;
    }

    setControlPoint(index, x, y) {
        this._endPoint.set(x, y);
        this._logicalBounds = null;
    }

    get numControlPoints() {
        return 1;
    }
}

export class ArcComponent extends PathComponent {
    constructor(x, y, radius, startAngle, endAngle, anticlockwise) {
        super();
        this.radius = radius;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.anticlockwise = anticlockwise;
        this._startPoint = Geom.Utils.pointOnCircle(radius, startAngle);
        this._endPoint = Geom.Utils.pointOnCircle(radius, endAngle);
        this._arcCenter = new Geom.models.Point(x, y);
    }

    get endPoint() { return this._endPoint; }

    getControlPoint(index) {
        if (index == 0) {
            return this._endPoint;
        } else if (index == 1) {
            return this._startPoint;
        } else {
            return this._arcCenter;
        }
    }

    _evalBounds() {
        var minx = this._controlPoints[0].x;
        var miny = this._controlPoints[0].y;
        var maxx = minx;
        var maxy = miny;
        if (this.prev) {
            minx = Math.min(minx, this.prev.endPoint.x);
            miny = Math.min(miny, this.prev.endPoint.y);
            maxx = Math.max(maxx, this.prev.endPoint.x);
            maxy = Math.max(maxy, this.prev.endPoint.y);
        }
        return new geom.Bounds(minx, miny, maxx - minx, maxy - miny);
    }

    get numControlPoints() {
        return 1;
    }
}

export class ArcToComponent extends PathComponent {
    constructor(x1, y1, x2, y2, radius) {
        super();
        this.p1 = new Geom.models.Point(x1, y1);
        this.p2 = new Geom.models.Point(x2, y2);
        // TODO
        this._arcCenter = new Geom.models.Point(-1, -1);
        this.radius = radius;
    }

    get endPoint() { return this.p2; }

    getControlPoint(index) {
        if (index == 0) {
            return this.p1;
        } else if (index == 1) {
            return this.p2;
        } else {
            return this._arcCenter;
        }
    }

    get numControlPoints() {
        return 3;
    }

    _evalBounds() {
        var minx = Math.min(this.p1.x, this.p2.x);
        var miny = Math.min(this.p1.y, this.p2.y);
        var maxx = Math.max(this.p1.x, this.p2.x);
        var maxy = Math.max(this.p1.y, this.p2.y);
        if (this.prev) {
            minx = Math.min(minx, this.prev.endPoint.x);
            miny = Math.min(miny, this.prev.endPoint.y);
            maxx = Math.max(maxx, this.prev.endPoint.x);
            maxy = Math.max(maxy, this.prev.endPoint.y);
        }
        return new geom.Bounds(minx, miny, maxx - minx, maxy - miny);
    }

    draw(ctx) {
        ctx.arcTo(this.p1.x, this.p1.y, this.p2.x, this.p2.x, this.radius);
    }
}

export class QuadraticToComponent extends PathComponent {
    constructor(x1, y1, x2, y2) {
        super();
        this.p1 = new Geom.models.Point(x1, y1);
        this.p2 = new Geom.models.Point(x2, y2);
    }

    _evalBounds() {
        var minx = Math.min(this.p1.x, this.p2.x);
        var miny = Math.min(this.p1.y, this.p2.y);
        var maxx = Math.max(this.p1.x, this.p2.x);
        var maxy = Math.max(this.p1.y, this.p2.y);
        if (this.prev) {
            minx = Math.min(minx, this.prev.endPoint.x);
            miny = Math.min(miny, this.prev.endPoint.y);
            maxx = Math.max(maxx, this.prev.endPoint.x);
            maxy = Math.max(maxy, this.prev.endPoint.y);
        }
        return new geom.Bounds(minx, miny, maxx - minx, maxy - miny);
    }

    draw(ctx) {
        ctx.quadraticCurveTo(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
    }

    get endPoint() {
        return this.p2;
    }

    setControlPoint(index, x, y) {
        if (index == 0) {
            this.p1.set(x, y);
        } else {
            this.p2.set(x, y);
        }
        this._logicalBounds = null;
    }

    get numControlPoints() {
        return 2;
    }
}

export class BezierToComponent extends PathComponent {
    constructor(x1, y1, x2, y2, x3, y3) {
        super();
        this.p1 = new Geom.models.Point(x1, y1);
        this.p2 = new Geom.models.Point(x2, y2);
        this.p3 = new Geom.models.Point(x3, y3);
    }

    draw(ctx) {
        ctx.bezierCurveTo(this.p1.x, this.p1.y, this.p2.x, this.p2.y, this.p3.x, this.p3.y);
    }

    get endPoint() {
        return this.p3;
    }

    setControlPoint(index, x, y) {
        if (index == 0) {
            this.p1.set(x, y);
        } else if (index == 1) {
            this.p2.set(x, y);
        } else {
            this.p3.set(x, y);
        }
        this._logicalBounds = null;
    }

    getControlPoint(i) {
        if (i == 0) {
            return this.p1;
        } else if (i == 1) {
            return this.p2;
        } else {
            return this.p3;
        }
    }

    get numControlPoints() {
        return 3;
    }

    _evalBounds() {
        var minx = Math.min(this.p1.x, this.p2.x, this.p3.x);
        var miny = Math.min(this.p1.y, this.p2.y, this.p3.y);
        var maxx = Math.max(this.p1.x, this.p2.x, this.p3.x);
        var maxy = Math.max(this.p1.y, this.p2.y, this.p3.y);
        if (this.prev) {
            minx = Math.min(minx, this.prev.endPoint.x);
            miny = Math.min(miny, this.prev.endPoint.y);
            maxx = Math.max(maxx, this.prev.endPoint.x);
            maxy = Math.max(maxy, this.prev.endPoint.y);
        }
        var out = new geom.Bounds(minx, miny, maxx - minx, maxy - miny);
        return out;
    }
}

export class PathController extends ShapeController {
    _evalControlPoints() {
        var ours = [];
        var path = this.shape;
        if (path._moveTo) {
            ours.push(new ControlPoint(path._moveTo, HitType.CONTROL, 0, "grab", {'component': null, 'index': 0}));
        }
        var j = 1;
        var currComp = path._componentList.head;
        while (currComp != null) {
            var nCPT = currComp.numControlPoints;
            for (var i = 0;i < nCPT;i++) {
                var cpt = currComp.getControlPoint(i);
                var controlPoint = new ControlPoint(cpt, HitType.CONTROL, j++, "grab", {'component': currComp, 'index': i})
                ours.push(controlPoint);
            }
            currComp = currComp.next;
        }
        var parents = super._evalControlPoints();
        var out = ours.concat(parents);
        return out;
    }

    applyHitChanges(hitInfo, savedInfo, downX, downY, currX, currY) {
        if (hitInfo.hitType != HitType.CONTROL) {
            return super.applyHitChanges(hitInfo, savedInfo, downX, downY, currX, currY);
        }

        var deltaX = currX - downX;
        var deltaY = currY - downY;
        var path = this.shape;
        var downPoint = savedInfo.downPoint;
        var nx = downPoint.x + deltaX;
        var ny = downPoint.y + deltaY;
        if (hitInfo.hitIndex == 0) {
            // change moveTo
            path._moveTo.set(nx, ny);
        } else {
            var cpComponent = hitInfo.controlPoint.extraData.component;
            var cpIndex = hitInfo.controlPoint.extraData.index;
            cpComponent.setControlPoint(cpIndex, nx, ny);
        }
        path._logicalBounds = null;
        path.markTransformed();
    }

    snapshotFor(hitInfo) {
        var out = super.snapshotFor(hitInfo);
        if (hitInfo && hitInfo.hitType == HitType.CONTROL) {
            out.downPoint = hitInfo.controlPoint.point.copy();
        }
        return out;
    }
}
