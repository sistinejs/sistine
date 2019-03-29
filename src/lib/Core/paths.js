import { Geom } from "../Geom/index"
import * as dlist from "../Utils/dlist";
import * as models from "./models"
import * as controller from "./controller"

var ControlPoint = controller.ControlPoint;
var HitType = controller.HitType;
var HitInfo = controller.HitInfo;

/**
 * A wrapper over a path.
 */
export class Path extends models.Shape {
    constructor(configs) {
        super((configs = configs || {}));
        configs = configs || {};
        this._closed = configs.closed || false;
        this._componentList = new dlist.DList();
        this._currPoint = null;
    }

    get currPoint() { return this._currPoint; }

    get controllerClass() { return Path.Controller; }

    _setBounds(newBounds) {
        var oldBounds = this.boundingBox;
        var sx = newBounds.width / oldBounds.width;
        var sy = newBounds.height / oldBounds.height;
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

    _evalBoundingBox() {
        var out = new Geom.Models.Bounds();
        var currComp = this._componentList.head;
        while (currComp != null) {
            out.union(currComp.boundingBox);
            currComp = currComp.next;
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

    close(yesorno) {
        this._closed = yesorno;
        this.markTransformed();
    }

    setCurrentPoint(x, y, isRelative) {
        if (this._currPoint == null) {
            this._currPoint = new Geom.Models.Point(x, y);
        }
        else if (isRelative) {
            this._currPoint.translate(x, y);
        } else {
            this._currPoint.set(x, y);
        }
        return this._currPoint;
    }
    get hasCurrentPoint() {
        return this._currPoint !=- null;
    }
    _ensureCurrentPoint() {
        if (this._currPoint == null) {
            throw new Error("Current point is null");
        }
        return this._currPoint;
    }

    moveTo(x, y, isRelative) { 
        var cp = this.setCurrentPoint(x, y, isRelative);
        this.addComponent(new MoveToComponent(cp.x, cp.y));
    }
    lineTo(x, y, isRelative) { 
        var cp = this.setCurrentPoint(x, y, isRelative);
        this.addComponent(new LineToComponent(cp.x, cp.y));
    }
    hlineTo(x, isRelative) { 
        var cp = this._ensureCurrentPoint();
        if (isRelative) {
            cp.x += x;
        } else {
            cp.x = x;
        }
        this.addComponent(new LineToComponent(cp.x, cp.y));
    }
    vlineTo(y, isRelative) { 
        var cp = this._currPoint;
        if (isRelative) {
            cp.y += y;
        } else {
            cp.y = y;
        }
        this.addComponent(new LineToComponent(cp.x, cp.y));
    }
    quadraticCurveTo(cp1x, cp1y, x, y, isRelative, isSmooth) {
        if (isSmooth) {
            throw new Error("Smooth curves not yet implemented.");
        }
        var cp = this._currPoint || new Geom.Models.Point();
        var x1 = cp1x;
        var y1 = cp1y;
        var x2 = x;
        var y2 = y;
        if (isRelative) {
            x1 += cp.x;
            y1 += cp.y;
            x2 += cp.x;
            y2 += cp.y;
        }
        this._currPoint = new Geom.Models.Point(x2, y2);
        this.addComponent(new QuadraticToComponent(x1, y1, x2, y2));
    }
    bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y, isRelative, isSmooth) {
        if (isSmooth) {
            throw new Error("Smooth curves not yet implemented.");
        }
        var cp = this._currPoint || new Geom.Models.Point();
        var x1 = cp1x;
        var y1 = cp1y;
        var x2 = cp2x;
        var y2 = cp2y;
        var x3 = x;
        var y3 = y;
        if (isRelative) {
            x1 += cp.x;
            y1 += cp.y;
            x2 += cp.x;
            y2 += cp.y;
            x3 += cp.x;
            y3 += cp.y;
        }
        this._currPoint = new Geom.Models.Point(x3, y3);
        this.addComponent(new BezierToComponent(x1, y1, x2, y2, x3, y3));
    }
    arc(x, y, radius, startAngle, endAngle, anticlockwise, isRelative) {
        this.addComponent(new ArcComponent(x, y, radius, startAngle, endAngle, anticlockwise));
    }
    arcTo(x1, y1, x2, y2, radius, isRelative) {
        this.addComponent(new ArcToComponent(this._cmdArcTo, x1, y1, x2, y2, radius));
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
            ctx.arc(this._moveTo.x, this._moveTo.y, models.DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        }
        var currComp = this._componentList.head;
        while (currComp != null) {
            currComp.draw(ctx);
            for (var i = currComp.numControlPoints - 1;i >= 0;i--) {
                var cpt = currComp.getControlPoint(i);
                ctx.beginPath();
                ctx.arc(cpt.x, cpt.y, models.DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
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
        this._boundingBox = null;
    }

    get boundingBox() {
        if (this._boundingBox == null) {
            this._boundingBox = this._evalBoundingBox();
        }
        return this._boundingBox;
    }

    getControlPoint(i) { throw new Error( "Not implemented"); }
    setControlPoint(index, x, y) { throw new Error( "Not implemented"); }
    // get controlPoints() { return this._controlPoints; } 
    // setControlPoint(index, x, y) { this._controlPoints[index].set(x, y); this.markTransformed(); }
    get numControlPoints() { return 0; } 
}

export class MoveToComponent extends PathComponent {
    constructor(x, y) {
        super();
        this._endPoint = new Geom.Models.Point(x, y);
    }

    _evalBoundingBox() {
        return new Geom.Models.Bounds(this._endPoint.x, this._endPoint.y, 0, 0);
    }

    get endPoint() { return this._endPoint; }

    draw(ctx) {
        ctx.moveTo(this._endPoint.x, this._endPoint.y);
    }

    getControlPoint(index) {
        return this._endPoint;
    }

    setControlPoint(index, x, y) {
        this._endPoint.set(x, y);
        this._boundingBox = null;
    }

    get numControlPoints() {
        return 1;
    }
}

export class LineToComponent extends PathComponent {
    constructor(x, y) {
        super();
        this._endPoint = new Geom.Models.Point(x, y);
    }

    _evalBoundingBox() {
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
        return new Geom.Models.Bounds(minx, miny, maxx - minx, maxy - miny);
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
        this._boundingBox = null;
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
        this._arcCenter = new Geom.Models.Point(x, y);
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

    _evalBoundingBox() {
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
        return new Geom.Models.Bounds(minx, miny, maxx - minx, maxy - miny);
    }

    get numControlPoints() {
        return 1;
    }
}

export class ArcToComponent extends PathComponent {
    constructor(x1, y1, x2, y2, radius) {
        super();
        this.p1 = new Geom.Models.Point(x1, y1);
        this.p2 = new Geom.Models.Point(x2, y2);
        // TODO
        this._arcCenter = new Geom.Models.Point(-1, -1);
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

    _evalBoundingBox() {
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
        return new Geom.Models.Bounds(minx, miny, maxx - minx, maxy - miny);
    }

    draw(ctx) {
        ctx.arcTo(this.p1.x, this.p1.y, this.p2.x, this.p2.x, this.radius);
    }
}

export class QuadraticToComponent extends PathComponent {
    constructor(x1, y1, x2, y2) {
        super();
        this.p1 = new Geom.Models.Point(x1, y1);
        this.p2 = new Geom.Models.Point(x2, y2);
    }

    _evalBoundingBox() {
        var result = null;
        if (this.prev) {
            var p0 = this.prev.endPoint;
            var p1 = this.p1;
            var p2 = this.p2;
            result = Geom.Utils.boundsOfQuadCurve(p0.x, p0.y, p1.x, p1.y, p2.x, p2.y);
            return new Geom.Models.Bounds(result.left, result.top,
                                          result.right - result.left,
                                          result.bottom - result.top);
        } else {
            var minx = Math.min(this.p1.x, this.p2.x);
            var miny = Math.min(this.p1.y, this.p2.y);
            var maxx = Math.max(this.p1.x, this.p2.x);
            var maxy = Math.max(this.p1.y, this.p2.y);
            return new Geom.Models.Bounds(minx, miny, maxx - minx, maxy - miny);
        }
    }

    draw(ctx) {
        ctx.quadraticCurveTo(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
    }

    get endPoint() {
        return this.p2;
    }

    getControlPoint(index) {
        if (index == 0) {
            return this.p1;
        } else {
            return this.p2;
        }
    }

    setControlPoint(index, x, y) {
        if (index == 0) {
            this.p1.set(x, y);
        } else {
            this.p2.set(x, y);
        }
        this._boundingBox = null;
    }

    get numControlPoints() {
        return 2;
    }
}

export class BezierToComponent extends PathComponent {
    constructor(x1, y1, x2, y2, x3, y3) {
        super();
        this.p1 = new Geom.Models.Point(x1, y1);
        this.p2 = new Geom.Models.Point(x2, y2);
        this.p3 = new Geom.Models.Point(x3, y3);
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
        this._boundingBox = null;
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

    _evalBoundingBox() {
        var result = null;
        if (this.prev) {
            result = Geom.Utils.boundsOfCubicCurve(this.prev.endPoint.x, this.prev.endPoint.y, 
                                                  this.p1.x, this.p1.y,
                                                  this.p2.x, this.p2.y,
                                                  this.p3.x, this.p3.y);
        } else {
            result = Geom.Utils.boundsOfCubicCurve(this.p1.x, this.p1.y,
                                                   this.p1.x, this.p1.y,
                                                   this.p2.x, this.p2.y,
                                                   this.p3.x, this.p3.y);
        }
        return new Geom.Models.Bounds(result.left, result.top,
                                      result.right - result.left,
                                      result.bottom - result.top);
    }
}

Path.Controller = class PathController extends controller.ShapeController {
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
        return ours.concat(parents);
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
        path._boundingBox = null;
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
