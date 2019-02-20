
import * as events from "./events";
import * as core from "./core";
import * as panes from "./panes";
import { getcssint } from "../utils/dom"

export class TouchMode {
    constructor(mode, data) {
        this.mode = mode;
        this.data = data;
    }
}

/**
 * The stage model if where all layers and shapes are managed. 
 * As far as possible this does not perform any view related operations as 
 * that is decoupled into the view entity.
 */
export class Stage extends events.EventHandler {
    constructor(divId, scene, configs) {
        super();
        configs = configs || {};
        configs.x = configs.x || 0;
        configs.y = configs.y || 0;
        configs.width = configs.width || 1000;
        configs.height = configs.height || 1000;

        // By default stages are not editable
        this._editable = false;
        this._showBackground = false;

        // The boundaries of the "Stage"
        this._bounds = new core.Bounds(configs);
        this._zoom = 1.0;
        this._offset = new core.Point()

        this._divId = divId;
        this._parentDiv = $("#" + divId);
        this._scene = scene || new core.Scene();
        this._shapeIndex = new ShapeIndex(scene);
        this._shapeIndex.defaultPane = "main";

        // Track mouse/touch drag events
        this._panes = [];

        // Main panel where shapes are drawn at rest
        this._mainPane = this.acquirePane("main");
        this.scene.addHandler(this);

        // Information regarding Selections
        this.selection = new Selection(this);

        // The touch mode passes information on what each of the handlers are ok to perform
        this.touchMode = null;
    }

    get bounds() { return this._bounds; }

    get zoom() { return this._zoom; }
    setZoom(z) {
        if (z < 0) z = 1;
        if (z > 10) z = 10;
        if (this._zoom != z) {
            this._zoom = z;
            this._panes.forEach(function(pane, index) {
                pane.setZoom(z);
            });
            this.repaint();
        }
    }

    get offset() { return this._offset; }
    setOffset(x, y) {
        if (x < this._bounds.x) x = this._bounds.x;
        if (y < this._bounds.y) y = this._bounds.y;
        if (x > this._bounds.right) { x = this._bounds.right; }
        if (y > this._bounds.bottom) { y = this._bounds.bottom; }
        if (this._offset.x != x || this._offset.y != y) {
            this._offset = new core.Point(x, y);
            this._panes.forEach(function(pane, index) {
                pane.setOffset(x, y);
            });
            this.repaint();
        }
    }

    get element() {
        return this._parentDiv;
    }

    get showBackground() {
        return this._showBackground;
    }

    set showBackground(show) {
        if (this._showBackground != show) {
            this._showBackground = show;
            if (show) {
                this.bgHandler = new StageBackgroundHandler(this);
            } else {
                this.bgHandler.detach();
                this.bgHandler.null;
            }
        }
    }

    get isEditable() {
        return this._editable;
    }

    set isEditable(editable) {
        if (this._editable != editable) {
            this._editable = editable;
            if (editable) {
                this.touchHandler = new StageTouchHandler(this);
                this.keyHandler = new StageKeyHandler(this);
            } else {
                this.keyHandler.detach();
                this.keyHandler.null;
                this.touchHandler.detach();
                this.touchHandler.null;
            }
        }
    }

    acquirePane(name, PaneClass) {
        PaneClass = PaneClass || panes.ShapesPane;
        var pane = this.getPane(name);
        if (pane == null) {
            pane = new PaneClass(name, this, name + "pane_" + this.divId);
            this._panes.push(pane);
            this.layout();
        } else {
            pane.acquire();
        }
        return pane;
    }

    releasePane(name) {
        for (var i = this._panes.length;i >= 0;i--) {
            var pane = this._panes[i];
            if (pane.name == name) {
                if ( ! pane.release() ) {
                    pane.remove();
                    this._panes.splice(i, 1);
                    return ;
                }
            }
        }
    }

    getPane(name) {
        for (var i = this._panes.length - 1; i >= 0;i--)  {
            if (this._panes[i].name == name) {
                return this._panes[i];
            }
        }
        return null;
    }

    get numPanes() {
        return this._panes.length;
    }

    indexOfPane(pane) {
        for (var i = this._panes.length;i >= 0;i--) {
            if (this._panes[i] == pane) return i;
        }
        return -1;
    }

    movePane(pane, newIndex) {
        var currIndex = this.indexOfPane(pane);
        if (newIndex < 0) newIndex = this._panes.length;
        if (currIndex >= 0 && currIndex != newIndex) {
            this._panes.splice(currIndex, 1);
            this._panes.splice(newIndex, 0, pane);
            var elem = pane.element.detach();
            if (newIndex >= this.element.children().length) {
                this.element.append(pane.element);
            } else {
                var child = $(this.element.children()[newIndex]);
                pane.element.insertBefore(child);
            }
        }
    }

    get scene() {
        return this._scene;
    }

    get shapeIndex() {
        return this._shapeIndex;
    }

    get bounds() { return this._bounds; }
    get divId() { return this._divId; }
    get viewBounds() { return this._viewBounds; }

    layout() {
        for (var i = this._panes.length - 1; i >= 0;i--) this._panes[i].layout();
        this.repaint();
    }

    repaint(force) {
        for (var i = this._panes.length - 1; i >= 0;i--)
            this._panes[i].repaint(force);
    }

    setShapePane(shape, pane) {
        if (shape.pane != pane) {
            this.paneNeedsRepaint(shape.pane);
            this.shapeIndex.setPane(shape, "edit");
            this.paneNeedsRepaint(shape.pane);
        }
    }

    eventTriggered(event) {
        // console.log("Event: ", event);
        if (event.name == "ShapeAdded") {
            this.shapeIndex.add(event.shape);
            this.paneNeedsRepaint(event.shape.pane)
        } else if (event.name == "ShapeRemoved") {
            this.shapeIndex.remove(event.shape);
            this.paneNeedsRepaint(event.shape.pane)
        } else if (event.name == "PropertyChanged") {
            this.paneNeedsRepaint(event.source.pane)
        }
        this.repaint();
    }

    paneNeedsRepaint(name) {
        name = name || null;
        if (name == null) {
            // all panes
            for (var i = 0;i < this._panes.length;i++) {
                this._panes[i].needsRepaint = true;
            }
        } else {
            var pane = this.getPane(name);
            if (pane == null) pane = this._mainPane;
            pane.needsRepaint = true;
        }
    }

    _setupHandler(element, method, handler) {
        var source = this;
        element[method](function(event) {
            event.theSource = source;
            handler(event);
        });
        return this;
    }

    keypress(handler) { return this._setupHandler(this.element, "keypress", handler); }
    keyup(handler) { return this._setupHandler(this.element, "keyup", handler); }
    keydown(handler) { return this._setupHandler(this.element, "keydown", handler); }

    click(handler) { return this._setupHandler(this.element, "click", handler); }
    mouseover(handler) { return this._setupHandler(this.element, "mouseover", handler); }
    mouseout(handler) { return this._setupHandler(this.element, "mouseout", handler); }
    mouseenter(handler) { return this._setupHandler(this.element, "mouseenter", handler); }
    mouseleave(handler) { return this._setupHandler(this.element, "mouseleave", handler); }
    mousedown(handler) { return this._setupHandler(this.element, "mousedown", handler); }
    mouseup(handler) { return this._setupHandler(this.element, "mouseup", handler); }
    mousemove(handler) { return this._setupHandler(this.element, "mousemove", handler); }
    contextmenu(handler) { return this._setupHandler(this.element, "contextmenu", handler); }
    scroll(handler) { return this._setupHandler(this.element, "scroll", handler); }
}

class StageKeyHandler {
    constructor(stage) {
        this.stage = stage;

        this._editPane = this.stage.acquirePane("edit");
        this._editPane.element.attr("tabindex", 1);
        this.stage.movePane(this._editPane, -1);

        var handler = this;
        this.stage.keypress(function(event) { return handler._onKeyPress(event); });
        this.stage.keyup(function(event) { return handler._onKeyUp(event); });
        this.stage.keydown(function(event) { return handler._onKeyDown(event); });
    }

    detach() {
        this.stage.releasePane("edit");
    }

    _onKeyPress(event) { console.log("KeyPress: ", event); }
    _onKeyDown(event) { 
        console.log("KeyDown: ", event); 
        if (event.key == "ArrowLeft") {
            this.stage.selection.forEach(function(self, shape) {
                shape.move(-1, 0);
            }, this);
        } else if (event.key == "ArrowUp") {
            this.stage.selection.forEach(function(self, shape) {
                shape.move(0, -1);
            }, this);
        } else if (event.key == "ArrowDown") {
            this.stage.selection.forEach(function(self, shape) {
                shape.move(0, 1);
            }, this);
        } else if (event.key == "ArrowRight") {
            this.stage.selection.forEach(function(self, shape) {
                shape.move(1, 0);
            }, this);
        }
        this.stage.repaint();
    }

    _onKeyUp(event) {
        console.log("KeyUp: ", event);
        if (event.key == "Backspace") {
            var shapes = this.stage.selection.allShapes;
            this.stage.selection.clear();
            for (var i = 0;i < shapes.length;i++) {
                shapes[i].removeFromParent();
            }
        }
        this.stage.repaint();
    }
}

class BaseTouchHandler {
    constructor(stage) {
        this.stage = stage;
        this.downPoint = null;
        this.currPoint = new core.Point();
        this.isClick = false;
        this.timeDelta = 0;
        this.currTime = 0;
        this.downTime = 0;

        // Max time before a mouse down goes from a "click" to a "hold"
        this.clickThresholdTime = 500;

        var handler = this;
        this.stage.contextmenu(function(event) { return handler._onContextMenu(event); });
        this.stage.click(function(event) { return handler._onClick(event); });
        this.stage.mousedown(function(event) { return handler._onMouseDown(event); });
        this.stage.mouseup(function(event) { return handler._onMouseUp(event); });
        this.stage.mouseover(function(event) { return handler._onMouseOver(event); });
        this.stage.mouseout(function(event) { return handler._onMouseOut(event); });
        this.stage.mouseenter(function(event) { return handler._onMouseEnter(event); });
        this.stage.mouseleave(function(event) { return handler._onMouseLeave(event); });
        this.stage.mousemove(function(event) { return handler._onMouseMove(event); });
        this.stage.scroll(function(event) { return handler._onScroll(event); });
    }

    toWorld(x, y, result) {
        return null;
    }

    _onClick(event) { }

    ////  Local handling of mouse/touch events
    _onContextMenu(event) {
        console.log("Context Menu Clicked");
        return false;
    }

    _onMouseDown(event) {
        this.currPoint = this.toWorld(event.offsetX, event.offsetY, this.currPoint);
        this.downPoint = this.toWorld(event.offsetX, event.offsetY, this.downPoint);
        this.downTime = event.timeStamp;
    }

    _onMouseUp(event) {
        this.currPoint = this.toWorld(event.offsetX, event.offsetY, this.currPoint);
        this.currTime = event.timeStamp;
        this.timeDelta = this.currTime - this.downTime;
        this.isClick = this.timeDelta <= this.clickThresholdTime;
        this.downTime = null;
        this.downPoint = null;
    }

    _onMouseMove(event) { 
        this.currPoint = this.toWorld(event.offsetX, event.offsetY, this.currPoint);
    }

    _onMouseEnter(event) { }
    _onMouseLeave(event) { }
    _onMouseOver(event) { }
    _onMouseOut(event) { }
}

class StageBackgroundHandler extends BaseTouchHandler {
    constructor(stage) {
        super(stage);

        this._bgPane = this.stage.acquirePane("bg", panes.BGPane);
        this.stage.movePane(this._bgPane, 0);
    }

    detach() {
        this.stage.releasePane("bg");
    }

    _onScroll(event) {
        console.log("Scroll Event: ", event);
    }

    toWorld(x, y, result) {
        return this._bgPane.toWorld(x, y, result);
    }
}


class StageTouchHandler extends BaseTouchHandler {
    constructor(stage) {
        super(stage);
        this.selectingMultiple = false;
        this._editPane = this.stage.acquirePane("edit");
    }

    toWorld(x, y, result) {
        return this._editPane.toWorld(x, y, result);
    }

    detach() {
        this.stage.releasePane("edit");
    }

    _selectingMultipleShapes(event) {
        console.log("MetaKey, Button, Buttons: ", event.metaKey, event.button, event.buttons);
        return event.button == 0 && event.metaKey;
    }

    _onMouseDown(event) {
        super._onMouseDown(event);
        this.downHitInfo = null;
        var shapeIndex = this.stage.shapeIndex;
        var selection = this.stage.selection;

        if (this.stage.touchMode == null) {
            this.selectingMultiple = this._selectingMultipleShapes(event);
            if (event.button == 0) {
                // We have alt button down so allow multiple shapes to be added
                var hitShape = shapeIndex.getShapeAt(this.downPoint.x, this.downPoint.y);
                if (hitShape == null) {
                    selection.clear();
                } else {
                    this.downHitInfo = hitShape.controller.getHitInfo(this.downPoint.x, this.downPoint.y);
                    if (this.selectingMultiple) {
                        selection.toggleMembership(hitShape);
                    } else if ( ! selection.contains(hitShape)) {
                        // On clear and add a new shape if it is not already selected
                        selection.clear();
                        selection.toggleMembership(hitShape);
                    }
                }
                selection.checkpointShapes(this.downHitInfo);
                this.stage.repaint();
            }
        }
        else if (this.stage.touchMode.mode == "create") {
            var shapeForCreation = this.stage.touchMode.data;
            console.log("Creating: ", _shapeForCreation);
            selection.clear();
            _shapeForCreation.setLocation(this.downPoint.x, this.downPoint.y);
            this.stage.shapeIndex.setPane(_shapeForCreation, "edit");
            this.stage.scene.add(_shapeForCreation);
        }
    }

    _onMouseUp(event) {
        super._onMouseUp(event);
        var selection = this.stage.selection;

        if (this.stage.touchMode == null) {
            if (event.button == 0) {
                if ( ! this.selectingMultiple) {
                    if (this.isClick) {
                        // this was a click so just "toggleMembership" the shape selection
                        var shapeIndex = this.stage.shapeIndex;
                        var hitShape = shapeIndex.getShapeAt(this.currPoint.x, this.currPoint.y);
                        selection.clear();
                        selection.toggleMembership(hitShape);
                    } else {
                        console.log("HitApplyDone");
                    }
                }
            } else {
                console.log("Mouse Over, Button: ", event.button);
            }
        } else if (this.stage.touchMode.mode == "create") {
            // only add a new shape once!
            this.stage.touchMode = null;
            this._editPane.cursor = "auto";
        }
        this.stage.repaint();
    }

    _onMouseMove(event) { 
        super._onMouseMove(event);
        var stage = this.stage;
        var selection = stage.selection;
        console.log("EventPt: ", event.offsetX, event.offsetY, ", WorldPt: ", this.currPoint.x, this.currPoint.y);
        if (this.stage.touchMode == null) {
            // Mouse is not primed for "creating" an object
            selection.forEach(function(self, shape) {
                var currHitInfo = shape.controller.getHitInfo(self.currPoint.x, self.currPoint.y);
                if (currHitInfo != null) {
                    self._editPane.cursor = currHitInfo.cursor;
                    return false;
                } else {
                    self._editPane.cursor = "auto";
                }
            }, this);

            if (this.downPoint != null) {
                // We are in a position to "transform" the entry pressed
                var shapesFound = false;
                selection.forEach(function(self, shape) {
                    shapesFound = true;
                    var savedInfo = selection.getSavedInfo(shape);
                    shape.controller.applyHitChanges(self.downHitInfo, savedInfo,
                                                     self.downPoint.x, self.downPoint.y,
                                                     self.currPoint.x, self.currPoint.y);
                }, this);
                stage.paneNeedsRepaint("edit");
                if ( ! shapesFound ) {
                    // Just draw a "selection rectangle"
                    var x = Math.min(this.downPoint.x, this.currPoint.x);
                    var y = Math.min(this.downPoint.y, this.currPoint.y);
                    var w = Math.abs(this.downPoint.x - this.currPoint.x);
                    var h = Math.abs(this.downPoint.y - this.currPoint.y);
                    this._editPane.context.strokeRect(x, y, w, h);
                }
            }
        } else if (this.stage.touchMode.mode == "create") {
            // This mode is when we are showing a cross hair for creating an object
            var _shapeForCreation = this.stage.touchMode.data;
            this._editPane.cursor = "crosshair";
            if (this.downPoint != null) {
                var minX = Math.min(this.downPoint.x, this.currPoint.x);
                var minY = Math.min(this.downPoint.y, this.currPoint.y);
                _shapeForCreation.setLocation(minX, minY);
                _shapeForCreation.setSize(Math.abs(this.currPoint.x - this.downPoint.x),
                                             Math.abs(this.currPoint.y - this.downPoint.y));
            }
        }
    }

    _onMouseEnter(event) { 
        this._editPane.element.focus();
    }
    _onMouseLeave(event) { 
        this._editPane.element.blur();
    }
    _onMouseOver(event) {
        this._editPane.element.focus();
    }
    _onMouseOut(event) { 
        this._editPane.element.blur();
    }
}

class Selection {
    constructor(stage) {
        this.stage = stage;
        this.shapes = {};
        this.downHitInfo = null;
        this.savedInfos = {};
        this._count = 0;
    }

    get count() {
        return this._count;
    }

    get allShapes() {
        var out = [];
        this.forEach(function(self, shape) {
            out.push(shape);
        }, this);
        return out;
    }

    forEach(handler, self) {
        for (var shapeId in this.shapes) {
            var shape = this.shapes[shapeId];
            if (handler(self, shape, this) == false)
                break;
        }
    }

    contains(shape) {
        return shape.id in this.shapes;
    }
    
    add(shape) {
        if ( ! (shape.id in this.shapes)) {
            this._count ++;
        }
        this.shapes[shape.id] = shape;
        this.savedInfos[shape.id] = shape.controller.snapshotFor();
        this.stage.setShapePane(shape, "edit");
    }

    remove(shape) {
        if ( shape.id in this.shapes ) {
            this._count --;
        }
        this.stage.setShapePane(shape, "main");
        delete this.shapes[shape.id];
        delete this.savedInfos[shape.id];
    }

    checkpointShapes(hitInfo) {
        // Updated the save info for all selected shapes
        this.forEach(function(self, shape) {
            self.savedInfos[shape.id] = shape.controller.snapshotFor(hitInfo);
        }, this);
    }

    getSavedInfo(shape) {
        return this.savedInfos[shape.id];
    }

    toggleMembership(shape) {
        if (shape == null) return false;
        if (this.contains(shape)) {
            this.remove(shape);
            return false;
        } else {
            this.add(shape);
            return true;
        }
    }

    clear() {
        var shapeIndex = this.stage.shapeIndex;
        for (var shapeId in this.shapes) {
            this.stage.setShapePane(this.shapes[shapeId], "main");
        }
        this.savedInfos = {};
        this.shapes = {};
    }

    /**
     * Create a group out of the elements in this Selection.
     */
    group() {
    }
}

/**
 * The index structure of a scene lets us re-model how we store and index shapes in a scene
 * for faster access and grouping not just by hierarchy but also to cater for various access
 * characteristics. (say by location, by attribute type, by zIndex etc)
 */
export class ShapeIndex {
    constructor(scene) {
        this._shapeIndexes = {};
        this._allShapes = [];
        this.scene = scene;
        this.defaultPane = null;
    }

    get scene() {
        return this._scene || null;
    }

    set scene(s) {
        if (s != this._scene) {
            this._scene = s;
            this._shapeIndexes = {};
            this._allShapes = [];
            this.reIndex();     // Build the index for this new scene!
        }
    }

    setPane(shape, pane) {
        if (shape != null && shape.pane != pane) {
            shape.pane = pane;
        }
    }

    /**
     * Applies a visitor for shapes in a given view port in a given pane.
     */
    forShapesInViewPort(pane, viewPort, visitor) {
        var allShapes = this._allShapes;
        for (var index in allShapes) {
            var shape = allShapes[index];
            if (shape != null) {
                var spane = shape.pane || null;
                if (spane == null) {
                    if (pane.name == this.defaultPane) {
                        visitor(shape);
                    }
                } else if (spane == pane.name) {
                    visitor(shape);
                }
            }
        }
    }

    shapeExists(shape) {
        return shape.id in this._shapeIndexes;
    }

    /**
     * A new shape is added to the index.
     */
    add(shape) {
        shape.pane = shape.pane || null;
        // See if shape already has an index assigned to it
        if (this.shapeExists(shape)) {
            var index = this._shapeIndexes[shape.id];
            if (this._allShapes[index] != null) {
                throw Error("Adding shape again without removing it first");
            }
            this._allShapes[index] = shape;
        } else {
            this._shapeIndexes[shape.id] = this._allShapes.length;
            this._allShapes.push(shape);
        }
        shape.pane = shape.pane || this.defaultPane;
    }

    addShapes(shapes) {
        for (var i in shapes) {
            this.add(shapes[i]);
        }
    }

    /**
     * Remove a shape from the index.
     */
    remove(shape) {
        if (!this.shapeExists(shape)) {
            throw Error("Shape does not exist in this index.");
        }
        var index = this._shapeIndexes[shape.id];
        this._allShapes[index] = null;
    }

    removeShapes(shapes) {
        for (var i in shapes) {
            this.remove(shapes[i]);
        }
    }

    /**
     * Given a coordinate (x,y) returns the topmost shape that contains this point.
     */
    getShapeAt(x, y) {
        var allShapes = this._allShapes;
        for (var index in allShapes) {
            var shape = allShapes[index];
            if (shape != null && shape.containsPoint(x, y)) {
                return shape;
            }
        }
        return null;
    }

    reIndex() {
        var scene = this._scene;
        if (scene) {
            for (var index in scene.layers) {
                var layer = scene.layers[index];
                this._reIndexShape(layer);
            }
        }
    }

    _reIndexShape(shape) {
        this.add(shape);
        for (var index in shape.children) {
            var child = shape.children[index];
            this._reIndexShape(child);
        }
    }
}
