import * as dlist from "../Utils/dlist";
import { Int, Nullable } from "./types"
import { Shape } from "./models"
import { DEFAULT_CONTROL_SIZE, ShapeController, ControlPoint, HitType, HitInfo, HitInfoSnapshot } from "./controller"
import { Point, Bounds } from "../Geom/models"
import { boundsOfQuadCurve, boundsOfCubicCurve, ellipticalArcBounds, centerToEndpoints, endpointsToCenter, svgArcBounds } from "../Geom/utils"

/**
 * A wrapper over a path.
 */
export class Path extends Shape {
    private _components : Array<PathComponent> = [];
    private _currPoint : Nullable<Point> = null;
    private _path2D : any = null
    constructor(configs? : any) {
        super((configs = configs || {}));
    }

    newInstance() : this {
        var out = this.constructor();
        out._currPoint = this._currPoint == null ? null : this._currPoint.copy();
        var last : Nullable<PathComponent> = null;
        this._components.forEach(function(component) {
            var c = component.clone();
            out._components.push(c);
            c.prev = last;
            if (last != null)
                last.next = c;
            last = c;
        });
        return out;
    }

    _setBounds(newBounds : Bounds) {
        var oldBounds = this.boundingBox;
        var sx = newBounds.width / oldBounds.width;
        var sy = newBounds.height / oldBounds.height;
        for (var i = 0;i < this._components.length;i++) {
            var currComp = this._components[i];
            var nCPT = currComp.numControlPoints;
            for (var i = nCPT - 1;i >= 0;i--) {
                var cpt = currComp.getControlPoint(i);
                var nx = newBounds.x + ((cpt.x - oldBounds.x) * sx);
                var ny = newBounds.y + ((cpt.y - oldBounds.y) * sy);
                currComp.setControlPoint(i, nx, ny);
            }
        }
    }

    _evalBoundingBox() : Bounds {
        var out = new Bounds();
        for (var i = 0;i < this._components.length;i++) {
            var currComp = this._components[i];
            out.union(currComp.boundingBox);
        }
        return out;
    }

    /**
     * Add a new path component at the end of the path.
     */
    addComponent(component : PathComponent) {
        this._components.push(component);
        this.markTransformed();
    }

    get components() { return this._components; }

    get componentCount() : Int {
        return this._components.length;
    }

    setCurrentPoint(x: number, y: number, isRelative : boolean) {
        if (this._currPoint == null) {
            this._currPoint = new Point(x, y);
        }
        else if (isRelative) {
            this._currPoint.translate(x, y);
        } else {
            this._currPoint.set(x, y);
        }
        return this._currPoint;
    }
    get hasCurrentPoint() : boolean {
        return this._currPoint != null;
    }
    _ensureCurrentPoint() : Point {
        if (this._currPoint == null) {
            throw new Error("Current point is null");
        }
        return this._currPoint;
    }

    get currentComponent() {
        if (this._components.length == 0) return null;
        return this._components[this._components.length - 1];
    }

    get path2D() {
        if (this._path2D == null) {
            this._path2D = new Path2D();
            if (this._path2D) {
                for (var i = 0;i < this._components.length;i++) {
                    var currComp = this._components[i];
                    currComp.extendPath2D(this._path2D);
                }
            }
        }
        return this._path2D;
    }

    moveTo(x: number, y: number, isRelative : boolean) { 
        var cp = this.setCurrentPoint(x, y, isRelative);
        var newComp = new MoveToComponent(this.currentComponent, cp.x, cp.y, isRelative);
        this.addComponent(newComp);
    }
    closePath() {
        this.addComponent(new CloseComponent(this.currentComponent));
    }
    lineTo(x: number, y: number, isRelative : boolean) { 
        var cp = this.setCurrentPoint(x, y, isRelative);
        var newComp = new LineToComponent(this.currentComponent, cp.x, cp.y, isRelative);
        this.addComponent(newComp);
    }
    hlineTo(x : number, isRelative : boolean) { 
        var cp = this._ensureCurrentPoint();
        if (isRelative) {
            cp.x += x;
        } else {
            cp.x = x;
        }
        var newComp = new LineToComponent(this.currentComponent, cp.x, cp.y, isRelative);
        this.addComponent(newComp);
    }
    vlineTo(y : number, isRelative : boolean) { 
        var cp = this._currPoint as Point;
        if (isRelative) {
            cp.y += y;
        } else {
            cp.y = y;
        }
        var newComp = new LineToComponent(this.currentComponent, cp.x, cp.y, isRelative);
        this.addComponent(newComp);
    }
    smoothQuadCurveTo(x: number, y: number, isRelative : boolean) {
        throw new Error("Smooth curves not yet implemented.");
    }
    quadCurveTo(cp1x : number, cp1y : number, x: number, y: number, isRelative : boolean) {
        var cp = this._currPoint || new Point();
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
        this._currPoint = new Point(x2, y2);
        var newComp = new QuadraticToComponent(this.currentComponent,
                                               x1, y1, x2, y2, isRelative);
        this.addComponent(newComp);
    }
    smoothBezierCurveTo(cp2x : number, cp2y : number, x: number, y: number, isRelative : boolean) {
        var cp = this._currPoint || new Point();
        var last = this.currentComponent;
        var x1 = cp.x, y1 = cp.y;
        if (last != null && last.constructor.name == "BezierToComponent") {
            // use the bezier's "second last" control point
            x1 = (last as BezierToComponent).p2.x;
            y1 = (last as BezierToComponent).p2.y;
        }
        var x2 = cp2x;
        var y2 = cp2y;
        var x3 = x;
        var y3 = y;
        if (isRelative) {
            x2 += cp.x; y2 += cp.y;
            x3 += cp.x; y3 += cp.y;
        }
        this._currPoint = new Point(x3, y3);
        var newComp = new BezierToComponent(this.currentComponent, x1, y1, x2, y2, x3, y3, isRelative);
        this.addComponent(newComp);
    }
    bezierCurveTo(cp1x : number, cp1y : number, cp2x : number, cp2y : number, x: number, y: number, isRelative : boolean) {
        var cp = this._currPoint || new Point();
        var x1 = cp1x;
        var y1 = cp1y;
        var x2 = cp2x;
        var y2 = cp2y;
        var x3 = x;
        var y3 = y;
        if (isRelative) {
            x1 += cp.x; y1 += cp.y;
            x2 += cp.x; y2 += cp.y;
            x3 += cp.x; y3 += cp.y;
        }
        this._currPoint = new Point(x3, y3);
        var newComp = new BezierToComponent(this.currentComponent, x1, y1, x2, y2, x3, y3, isRelative);
        this.addComponent(newComp);
    }
    arc(x: number, y: number, radius : number, startAngle : number, endAngle : number, anticlockwise : boolean, isRelative : boolean) {
        this.addComponent(new ArcComponent(this.currentComponent, x, y, radius, startAngle, endAngle, anticlockwise, isRelative));
    }
    arcTo(x1 : number, y1 : number, x2 : number, y2 : number, radius : number, isRelative : boolean) {
        this.addComponent(new ArcToComponent(this.currentComponent, x1, y1, x2, y2, radius, isRelative));
    }
    svgArcTo(rx : number, ry : number, rotation : number, isLargeArc : boolean, shouldSweep : boolean, endX : number, endY : number, isRelative : boolean) {
        var cp = this.setCurrentPoint(endX, endY, isRelative);
        var comp = new SVGArcToComponent(this.currentComponent, rx, ry, rotation, isLargeArc, shouldSweep, cp.x, cp.y, isRelative)
        this.addComponent(comp);
    }

    draw(ctx : any) {
        ctx.beginPath();
        var path2D = this.path2D;
        if (path2D)  {
            ctx.fill(path2D);
            ctx.stroke(path2D);
        } else {
            for (var i = 0;i < this._components.length;i++) {
                var currComp = this._components[i];
                currComp.draw(ctx);
            }
            ctx.fill();
            ctx.stroke();
        }
        // Draw fornow till we figure out hit tests and bounding boxes
        // this.drawControls(ctx);
    }
}

/**
 * A path is composed of several path components and form different kinds of units in a path
 * like lines, arcs, quadratic beziers etc.
 */
export abstract class PathComponent {
    prev : Nullable<PathComponent> = null;
    next : Nullable<PathComponent> = null;
    isRelative = false;
    protected _boundingBox : Nullable<Bounds> = null;
    constructor(prev : Nullable<PathComponent>, isRelative : boolean = false) {
        this.isRelative = isRelative;
        this.prev = prev || null;
        if (prev) prev.next = this;
    }

    clone() : this {
        return this.constructor();
    }

    get boundingBox() {
        if (this._boundingBox == null) {
            this._boundingBox = this._evalBoundingBox();
        }
        return this._boundingBox;
    }

    draw(ctx : any) : void {
        throw new Error("Not yet implemented");
    }
    get endPoint() : Nullable<Point> {
        throw new Error("Not yet implemented");
        return null;
    }
    extendPath2D(_path2D : any) : void { }
    protected _evalBoundingBox() : Bounds {
        throw new Error("Not yet implemented");
        return new Bounds();
    }

    getControlPoint(index : Int) : Point { return new Point(); }
    setControlPoint(index : Int, x : number, y : number) { }
    get numControlPoints() { return 0; } 

    /**
     * Called when the previous component has changed in which case the 
     * current component needs to be updated.
     */
    previousChanged() { }

    protected _notifyNext() {
        if (this.next != null) {
            this.next.previousChanged();
        }
    }
}

export class CloseComponent extends PathComponent {
    _evalBoundingBox() {
        return new Bounds();
    }

    extendPath2D(path2D : any) { path2D.closePath(); }

    get endPoint() : Nullable<Point> {
        return this.prev != null ? this.prev.endPoint : null;
    }

    draw(ctx : any) { ctx.closePath(); }
}

export class MoveToComponent extends PathComponent {
    private _endPoint : Point
    constructor(prev : Nullable<PathComponent>, x: number, y: number, isRelative : boolean) {
        super(prev, isRelative);
        this._endPoint = new Point(x, y);
    }

    clone() : this {
        var out = this.constructor();
        out._endPoint = this._endPoint.copy();
        return out;
    }

    extendPath2D(path2D : any) { path2D.moveTo(this.endPoint.x, this.endPoint.y); }

    _evalBoundingBox() {
        return new Bounds(this._endPoint.x, this._endPoint.y, 0, 0);
    }

    get endPoint() { return this._endPoint; }

    draw(ctx : any) {
        ctx.moveTo(this._endPoint.x, this._endPoint.y);
    }

    getControlPoint(index : Int) : Point {
        return this._endPoint;
    }

    setControlPoint(index : Int, x : number, y : number) {
        this._endPoint.set(x, y);
        this._boundingBox = null;
        this._notifyNext();
    }

    get numControlPoints() {
        return 1;
    }
}

export class LineToComponent extends PathComponent {
    private _endPoint : Point
    constructor(prev : Nullable<PathComponent>, x: number, y: number, isRelative : boolean) {
        super(prev, isRelative);
        this._endPoint = new Point(x, y);
    }

    extendPath2D(path2D : any) { path2D.lineTo(this.endPoint.x, this.endPoint.y); }

    clone() : this {
        var out = this.constructor();
        out._endPoint = this._endPoint.copy();
        return out;
    }

    _evalBoundingBox() : Bounds {
        var minx = this._endPoint.x;
        var miny = this._endPoint.y;
        var maxx = minx;
        var maxy = miny;
        if (this.prev != null && this.prev.endPoint != null) {
            minx = Math.min(minx, this.prev.endPoint.x);
            miny = Math.min(miny, this.prev.endPoint.y);
            maxx = Math.max(maxx, this.prev.endPoint.x);
            maxy = Math.max(maxy, this.prev.endPoint.y);
        }
        return new Bounds(minx, miny, maxx - minx, maxy - miny);
    }

    get endPoint() { return this._endPoint; }

    draw(ctx : any) {
        ctx.lineTo(this._endPoint.x, this._endPoint.y);
    }

    getControlPoint(_index : Int) : Point {
        return this._endPoint;
    }

    setControlPoint(_index : Int, x : number, y : number) {
        this._endPoint.set(x, y);
        this._boundingBox = null;
        this._notifyNext();
    }

    get numControlPoints() {
        return 1;
    }
}

export class QuadraticToComponent extends PathComponent {
    p1 : Point
    p2 : Point
    constructor(prev : Nullable<PathComponent>, x1 : number, y1 : number, x2 : number, y2 : number, isRelative : boolean) {
        super(prev, isRelative);
        this.p1 = new Point(x1, y1);
        this.p2 = new Point(x2, y2);
    }

    extendPath2D(path2D : any) {
        path2D.quadraticCurveTo(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
    }

    clone() {
        var out = this.constructor();
        out.p1 = this.p1.copy();
        out.p2 = this.p2.copy();
        return out;
    }

    _evalBoundingBox() {
        var result = null;
        if (this.prev != null && this.prev.endPoint != null) {
            var p0 = this.prev.endPoint as Point;
            var p1 = this.p1;
            var p2 = this.p2;
            result = boundsOfQuadCurve(p0.x, p0.y, p1.x, p1.y, p2.x, p2.y);
            return new Bounds(result.left, result.top,
                                          result.right - result.left,
                                          result.bottom - result.top);
        } else {
            var minx = Math.min(this.p1.x, this.p2.x);
            var miny = Math.min(this.p1.y, this.p2.y);
            var maxx = Math.max(this.p1.x, this.p2.x);
            var maxy = Math.max(this.p1.y, this.p2.y);
            return new Bounds(minx, miny, maxx - minx, maxy - miny);
        }
    }

    draw(ctx : any) {
        ctx.quadraticCurveTo(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
    }

    get endPoint() {
        return this.p2;
    }

    getControlPoint(index : Int) : Point {
        if (index == 0) {
            return this.p1;
        } else {
            return this.p2;
        }
    }

    setControlPoint(index : Int, x : number, y : number) {
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
    p1 : Point
    p2 : Point
    p3 : Point
    constructor(prev : Nullable<PathComponent>, x1 : number, y1 : number, x2 : number, y2 : number, x3 : number, y3 : number, isRelative : boolean) {
        super(prev, isRelative);
        this.p1 = new Point(x1, y1);
        this.p2 = new Point(x2, y2);
        this.p3 = new Point(x3, y3);
    }

    clone() : this {
        var out = this.constructor();
        out.p1 = this.p1.copy();
        out.p2 = this.p2.copy();
        out.p3 = this.p3.copy();
        return out;
    }

    extendPath2D(path2D : any) {
        path2D.bezierCurveTo(this.p1.x, this.p1.y, this.p2.x, this.p2.y, this.p3.x, this.p3.y);
    }

    draw(ctx : any) {
        ctx.bezierCurveTo(this.p1.x, this.p1.y, this.p2.x, this.p2.y, this.p3.x, this.p3.y);
    }

    get endPoint() : Point {
        return this.p3;
    }

    setControlPoint(index : Int, x : number, y : number) {
        if (index == 0) {
            this.p1.set(x, y);
        } else if (index == 1) {
            this.p2.set(x, y);
        } else {
            this.p3.set(x, y);
        }
        this._boundingBox = null;
    }

    getControlPoint(i : Int) {
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
        if (this.prev != null && this.prev.endPoint != null) {
            result = boundsOfCubicCurve(this.prev.endPoint.x, this.prev.endPoint.y,
                                        this.p1.x, this.p1.y,
                                        this.p2.x, this.p2.y,
                                        this.p3.x, this.p3.y);
        } else {
            result = boundsOfCubicCurve(this.p1.x, this.p1.y,
                                        this.p1.x, this.p1.y,
                                        this.p2.x, this.p2.y,
                                        this.p3.x, this.p3.y);
        }
        return new Bounds(result.left, result.top,
                                      result.right - result.left,
                                      result.bottom - result.top);
    }
}

export class ArcComponent extends PathComponent {
    private _cx : number;
    private _cy : number;
    private _radius : number;
    private _startAngle : number;
    private _endAngle : number;
    private _anticlockwise : boolean;
    constructor(prev : Nullable<PathComponent>, cx : number, cy : number, radius : number,
                startAngle : number, endAngle : number, anticlockwise : boolean, isRelative : boolean) {
        super(prev, isRelative);
        this._cx = cx;
        this._cy = cy;
        this._radius = radius;
        this._startAngle = startAngle;
        this._endAngle = endAngle;
        this._anticlockwise = anticlockwise;
    }

    clone() {
        var out = this.constructor();
        out._cx = this._cx;
        out._cy = this._cy;
        out._radius = this._radius;
        out._startAngle = this._startAngle;
        out._endAngle = this._endAngle;
        out._anticlockwise = this._anticlockwise;
        return out;
    }

    extendPath2D(path2D : any) {
        path2D.arc(this._cx, this._cy, this._radius, this._startAngle, this._endAngle, this._anticlockwise);
    }

    draw(ctx : any) {
        ctx.arc(this._cx, this._cy, this._radius, this._startAngle, this._endAngle, this._anticlockwise);
    }
}

export class ArcToComponent extends PathComponent {
    p1 : Point
    p2 : Point
    radius : number
    constructor(prev : Nullable<PathComponent>, x1 : number, y1 : number, x2 : number, y2 : number, radius : number, isRelative : boolean) {
        super(prev, isRelative);
        this.p1 = new Point(x1, y1);
        this.p2 = new Point(x2, y2);
        this.radius = radius;
    }

    extendPath2D(path2D : any) {
        path2D.arcTo(this.p1.x, this.p1.y, this.p2.x, this.p2.y, this.radius);
    }

    draw(ctx : any) {
        ctx.arcTo(this.startPoint.x, this.startPoint.y,
                  this.endPoint.x, this.endPoint.x, this.radius);
    }

    get startPoint() : Point {
        if (this.prev != null && this.prev.endPoint != null) {
            return this.prev.endPoint as Point;
        } else {
            return this.p1;
        }
    }

    get endPoint() {
        return this.p2;
    }

    getControlPoint(index : Int) : Point {
        if (index == 0) {
            return this.p1;
        } else {
            return this.p2;
        }
    }

    setControlPoint(index : Int, x : number, y : number) {
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

/**
 * An elliptical arc parametrized by endpoints as in an SVG path.
 */
export class SVGArcToComponent extends PathComponent {
    private _rx : number;
    private _ry : number;
    private _rotation : number
    private _rotationPoint : Point
    private _center : Point
    private _endPoint : Point;
    private _isLargeArc : boolean;
    private _shouldSweep : boolean;
    private _startAngle : number = 0;
    private _endAngle : number = 0;
    private _isAnticlockwise : boolean;
    constructor(prev : Nullable<PathComponent>,
                rx : number, ry : number, rotation : number, isLargeArc : boolean, shouldSweep : boolean,
                endX : number, endY : number, isRelative : boolean) {
        super(prev, isRelative);
        this._rx = rx;
        this._ry = ry;
        this._rotation = rotation;
        this._rotationPoint = new Point();
        this._center = new Point();
        this._endPoint = new Point(endX, endY);
        this._isLargeArc = isLargeArc;
        this._shouldSweep = shouldSweep;
    }

    clone() {
        var out = this.constructor();
        out._rx = this._rx;
        out._ry = this._ry;
        out._rotation = this._rotation;
        out._rotationPoint = this._rotationPoint;
        out._center = this._center;
        out._endPoint = this._endPoint;
        out._isLargeArc = this._isLargeArc;
        out._shouldSweep = this._shouldSweep;
        return out;
    }

    get startPoint() : Point { return this.prev == null ? this._center : this.prev.endPoint as Point; }
    get endPoint() : Point { return this._endPoint; }
    get startAngle() : number { return this._startAngle; }
    get endAngle() : number { return this._endAngle; }
    get isAnticlockwise() { return this._isAnticlockwise; }

    extendPath2D(path2D : any) {
        this.boundingBox;   // ensures missing pieces are evaluated
        path2D.ellipse(this._center.x, this._center.y,
                       this._rx, this._ry, this._rotation,
                       this._startAngle, this._endAngle, this._isAnticlockwise);
    }

    draw(ctx : any) {
        this.boundingBox;   // ensures missing pieces are evaluated
        ctx.ellipse(this._center.x, this._center.y,
                    this._rx, this._ry, this._rotation,
                    this._startAngle, this._endAngle, this._isAnticlockwise);
    }

    set isAnticlockwise(anticlockwise : boolean) {
        this._isAnticlockwise = anticlockwise || false;
        this._boundingBox = null;
    }

    _evalBoundingBox() {
        var prevX = this.startPoint.x;
        var prevY = this.startPoint.y;
        var params = endpointsToCenter(prevX, prevY, this._rx, this._ry, this._rotation,
                                       this._isLargeArc, this._shouldSweep,
                                       this._endPoint.x, this._endPoint.y);
        this._rotationPoint.set();
        this._center.set(params.cx, params.cy);
        this._rx = params.rx;
        this._ry = params.ry;
        this._startAngle = params.startAngle;
        this._endAngle = params.endAngle;
        this._isAnticlockwise = !params.clockwise;

        var bounds = svgArcBounds(prevX, prevY, this._rx, this._ry,
                                  this._rotation, this._isLargeArc,
                                  this._shouldSweep,
                                  this._endPoint.x, this._endPoint.y);
        return new Bounds(bounds.xmin, bounds.ymin,
                                      bounds.xmax - bounds.xmin,
                                      bounds.ymax - bounds.ymin);
    }
}

/**
 * An elliptical arc parametrized by center points.
 */
export class EllipticalArcComponent extends PathComponent {
    private _rx : number
    private _ry : number
    private _center : Point
    private _startPoint : Point
    private _endPoint : Point
    private _startAngle : number
    private _endAngle : number
    private _rotation : number
    private _rotationPoint : Point
    private _isAnticlockwise : boolean = false
    constructor(prev : Nullable<PathComponent>, centerX : number, centerY : number, rx : number, ry : number,
                 rotation : number, startAngle : number, endAngle : number, anticlockwise : boolean, isRelative : boolean) {
        super(prev, isRelative);
        this._rx = rx;
        this._ry = ry;
        this._center = new Point(centerX, centerY);
        this._startPoint = new Point();
        this._endPoint = new Point();
        this._startAngle = startAngle;
        this._endAngle = endAngle;
        this._rotation = rotation;
        this._rotationPoint = new Point();
        this._isAnticlockwise = anticlockwise || false;
    }

    clone() {
        var out = this.constructor();
        out._rx = this._rx;
        out._ry = this._ry;
        out._center = this._center;
        out._startPoint = this._startPoint;
        out._endPoint = this._endPoint;
        out._startAngle = this._startAngle;
        out._endAngle = this._endAngle;
        out._rotation = this._rotation;
        out._rotationPoint = this._rotationPoint;
        out._isAnticlockwise = this._isAnticlockwise;
        return out;
    }

    get startPoint() { return this._startPoint; }
    get endPoint() { return this._endPoint; }
    get startAngle() { return this._startAngle; }
    get endAngle() { return this._endAngle; }

    draw(ctx : any) {
        ctx.ellipse(this._center.x, this._center.y,
                    this._rx, this._ry, this._rotation,
                    this._startAngle, this._endAngle, this._isAnticlockwise);
    }

    set isAnticlockwise(anticlockwise : boolean) {
        this._isAnticlockwise = anticlockwise || false;
        this._boundingBox = null;
    }

    get numControlPoints() { return 4; } 

    getControlPoint(index : Int) : Point {
        if (index == 0) {
            return this._endPoint;
        } else if (index == 1) {
            return this._center;
        } else if (index == 2) {
            return this._startPoint;
        } else {
            return this._rotationPoint;
        }
    }

    setControlPoint(index : Int, x : number, y : number) {
        if (index == 0) {
            this._endPoint.set(x, y);
            this._notifyNext();
        } else if (index == 1) {
            this._center.set(x, y);
        } else if (index == 2) {
            this._startPoint.set(x, y);
        } else {
            this._rotationPoint.set(x, y);
        }
        this._boundingBox = null;
    }

    _evalBoundingBox() {
        var params = centerToEndpoints(this._center.x, this._center.y,
                                                  this._rx, this._ry,
                                                  this._rotation, this._startAngle,
                                                  this._endAngle - this._startAngle);
        this._startPoint.set(params.x1, params.y1);
        this._endPoint.set(params.x2, params.y2);
        var bounds = ellipticalArcBounds(this._center.x, this._center.y,
                                                    this._rx, this._ry,
                                                    this._rotation, this._startAngle,
                                                    this._endAngle - this._startAngle,
                                                    this._isAnticlockwise);
        return new Bounds(params.xmin, params.ymin,
                                      params.xmax - params.xmin,
                                      params.ymax - params.ymin);
    }
}


export class PathController extends ShapeController<Path> {
    _evalControlPoints() {
        var ours = [];
        var path = this.shape;
        var j = 1;
        var components = path.components;
        for (var i = 0;i < components.length;i++) {
            var currComp = components[i];
            var nCPT = currComp.numControlPoints;
            for (var i = 0;i < nCPT;i++) {
                var cpt = currComp.getControlPoint(i);
                var controlPoint = new ControlPoint(cpt.x, cpt.y, HitType.CONTROL, j++, "grab", {'component': currComp, 'index': i})
                ours.push(controlPoint);
            }
        }
        var parents = super._evalControlPoints();
        return ours.concat(parents);
    }

    drawControls(ctx : any, options : any) {
        super.drawControls(ctx, options);
        var path = this.shape;
        var components = path.components;
        ctx.fillStyle = "yellow";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        for (var i = 0;i < components.length;i++) {
            var currComp = components[i];
            currComp.draw(ctx);
            for (var i = currComp.numControlPoints - 1;i >= 0;i--) {
                var cpt = currComp.getControlPoint(i);
                ctx.beginPath();
                ctx.arc(cpt.x, cpt.y, DEFAULT_CONTROL_SIZE, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            }
        }
    }

    applyHitChanges(hitInfo : HitInfo, savedInfo : any, downX : number, downY : number, currX : number, currY : number) {
        if (hitInfo.hitType != HitType.CONTROL) {
            return super.applyHitChanges(hitInfo, savedInfo, downX, downY, currX, currY);
        }

        var deltaX = currX - downX;
        var deltaY = currY - downY;
        var path = this.shape;
        var downPoint = savedInfo.downPoint;
        var nx = downPoint.x + deltaX;
        var ny = downPoint.y + deltaY;
        var extraData = (hitInfo.controlPoint as ControlPoint).extraData;
        var cpComponent = extraData.component;
        var cpIndex = extraData.index;
        cpComponent.setControlPoint(cpIndex, nx, ny);
        path.markTransformed();
    }

    snapshotFor(hitInfo : HitInfo) {
        var out = super.snapshotFor(hitInfo);
        if (hitInfo && hitInfo.hitType == HitType.CONTROL) {
            out.downPoint = (hitInfo.controlPoint as ControlPoint).copy();
        }
        return out;
    }
}
