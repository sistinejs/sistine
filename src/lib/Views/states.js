
import * as panes from "./panes";
import * as events from "../Core/events";
import * as geom from "../Geom/models"
import * as geomutils from "../Geom/utils"

export class StageState extends events.State {
    constructor(stage) {
        super();
        this.stage = stage;
        this.downPoints = [];
        this.currPoints = [];
        this._mainPane = this.stage.acquirePane("main");
        for (var i = 0;i < stage.touchState.maxPoints;i++) {
            this.downPoints.push(null);
            this.currPoints.push(new geom.Point());
        }
    }

    detach() { this.stage.releasePane("main"); }

    handle(eventType, source, event) {
        if (eventType == "mousedown") {
            return this._onMouseDown(eventType, source, event);
        } else if (eventType == "mouseup") {
            return this._onMouseUp(eventType, source, event);
        } else if (eventType == "mousemove") {
            return this._onMouseMove(eventType, source, event);
        } else if (eventType == "keyup") {
            return this._onKeyUp(eventType, source, event);
        } else if (eventType == "keydown") {
            return this._onKeyDown(eventType, source, event);
        } else if (eventType == "keypress") {
            return this._onKeyPress(eventType, source, event);
        } else if (eventType == "mouseover") {
            this.stage.focus();
            return this._onMouseOver(eventType, source, event);
        } else if (eventType == "mouseentered") {
            this.stage.focus();
            return this._onMouseEntered(eventType, source, event);
        } else if (eventType == "mouseleave") {
            this.stage.blur();
            return this._onMouseLeave(eventType, source, event);
        } else if (eventType == "mouseout") {
            return this._onMouseOut(eventType, source, event);
        }
    }

    toWorld(x, y, result) { return this._mainPane.toWorld(x, y, result); } 

    _onKeyDown(eventType, source, event) {
        console.log("KeyDown: ", event);
        if (this.downPoints && this.downPoints[0]) 
            console.log("DownPoint: ", this.downPoints[0].x, this.downPoints[0].y);
        console.log("CurrPoints: ", this.currPoints[0].x, this.currPoints[0].y);
    }
    _onKeyPress(eventType, source, event) { console.log("KeyPress: ", event); }
    _onKeyUp(eventType, source, event) {
        if (event.key == "Escape") {
            this.stage.selection.clear();
            // Go to root state
            return "";
        }
    }

    _onMouseEntered(eventType, source, event) {
        this.stage.cursor = "auto";
    }

    _onMouseOver(eventType, source, event) {
        this.stage.cursor = "auto";
    }

    _onMouseLeave(eventType, source, event) {
        this.stage.cursor = "auto";
    }

    _onMouseOut(eventType, source, event) {
        this.stage.cursor = "auto";
    }

    _onMouseDown(eventType, source, event) {
        var index = event.button;
        this.currPoints[index] = this.toWorld(event.offsetX, event.offsetY, this.currPoints[index]);
        this.downPoints[index] = this.toWorld(event.offsetX, event.offsetY, this.downPoints[index]);
    }

    _onMouseUp(eventType, source, event) {
        var index = event.button;
        this.currPoints[index] = this.toWorld(event.offsetX, event.offsetY, this.currPoints[index]);
        this.downPoints[index] = null;
    }

    _onMouseMove(eventType, source, event) { 
        var index = event.button;
        this.currPoints[index] = this.toWorld(event.offsetX, event.offsetY, this.currPoints[index]);
    }
}

/**
 * A state that handles events related to view port panning.
 */
export class ViewPortPanningState extends StageState {
    constructor(stage) {
        super(stage);
        this.downOffset = null;
        this._bgPane = this.stage.acquirePane("bg", panes.BGPane);
        this.stage.movePane(this._bgPane, 0);
    }

    detach() { this.stage.releasePane("bg"); }

    toWorld(x, y, result) {
        result = result || new geom.Point(x, y);
        if (this.downPoints[0] != null) {
            result.x = (x / this._bgPane.zoom) + this.downOffset.x;
            result.y = (y / this._bgPane.zoom) + this.downOffset.y;
            return result;
        } else {
            return this._bgPane.toWorld(x, y, result);
        }
    }

    _onMouseDown(eventType, source, event) {
        // Specific to this state
        super._onMouseDown(eventType, source, event);
        if (event.button == 0) {
            this.downOffset = this.stage.offset.copy();
        }
    }

    _onMouseMove(eventType, source, event) {
        super._onMouseMove(eventType, source, event);
        if (this.downPoints[0] != null) {
            var stage = this.stage;
            var selection = stage.selection;
            var deltaX = this.currPoints[0].x - this.downPoints[0].x;
            var deltaY = this.currPoints[0].y - this.downPoints[0].y;
            this.stage.setOffset(this.downOffset.x - deltaX,
                                 this.downOffset.y - deltaY);
        }
    }

    _onMouseOver(eventType, source, event) { this.stage.cursor = "grab"; }
    _onMouseEntered(eventType, source, event) { return this._onMouseOver(eventType, source, event); }
}

export class ViewPortZoomingState extends StageState {
    _onMouseEntered(eventType, source, event) {
        return this._onMouseOver(eventType, source, event);
    }

    _onMouseOver(eventType, source, event) {
        if (this.stateData == "zoomin") {
            this.stage.cursor = "zoom-in";
        } else {
            this.stage.cursor = "zoom-out";
        }
    }

    _onMouseUp(eventType, source, event) {
        if (this.stateData == "zoomin") {
            var newZoom = this.stage.zoom * 1.1;
            this.stage.setZoom(newZoom);
        } else {
            var newZoom = this.stage.zoom * 0.9;
            this.stage.setZoom(newZoom);
        }
    }
}

export class DefaultState extends StageState {
    constructor(stage) {
        super(stage);
        this._editPane = this.stage.acquirePane("edit");
        this.stage.tabIndex = 1;
        this.stage.movePane(this._editPane, -1);
        this.selectingMultiple = false;
    }

    _selectingMultipleShapes(event) {
        return event.button == 0 && event.metaKey;
    }

    toWorld(x, y, result) { return this._editPane.toWorld(x, y, result); } 
    detach() { this.stage.releasePane("edit"); }

    _onKeyUp(eventType, source, event) {
        if (event.key == "Backspace") {
            var shapes = this.stage.selection.allShapes;
            this.stage.selection.clear();
            for (var i = 0;i < shapes.length;i++) {
                shapes[i].removeFromParent();
            }
        } else {
            return super._onKeyUp(eventType, source, event);
        }
    }

    _onKeyDown(eventType, source, event) {
        if (event.key == "ArrowLeft") {
            this.stage.selection.forEach(function(shape) {
                shape.move(-1, 0);
            });
        } else if (event.key == "ArrowUp") {
            this.stage.selection.forEach(function(shape) {
                shape.move(0, -1);
            });
        } else if (event.key == "ArrowDown") {
            this.stage.selection.forEach(function(shape) {
                shape.move(0, 1);
            });
        } else if (event.key == "ArrowRight") {
            this.stage.selection.forEach(function(shape) {
                shape.move(1, 0);
            });
        } else {
            return super._onKeyDown(eventType, source, event);
        }
    }

    _onMouseDown(eventType, source, event) {
        super._onMouseDown(eventType, source, event);
        if (event.button != 0) { return ; }

        this.downHitInfo = null;
        var shapeIndex = this.stage.shapeIndex;
        var selection = this.stage.selection;
        var currPoint = this.currPoints[0];
        var downPoint = this.downPoints[0];

        this.selectingMultiple = this._selectingMultipleShapes(event);
        // See if first any existing items in our selection can handle this "down"
        var hitShape = null;
        selection.forEach(function(shape, self) {
            var currHitInfo = shape.controller.getHitInfo(currPoint.x, currPoint.y);
            if (currHitInfo != null) {
                self.stage.cursor = currHitInfo.cursor;
                hitShape = shape;
                return false;
            }
        }, this);

        if (hitShape == null) {
            hitShape = shapeIndex.getShapeAt(downPoint.x, downPoint.y);
        }
        if (hitShape == null) {
            selection.clear();
        } else {
            this.downHitInfo = hitShape.controller.getHitInfo(downPoint.x, downPoint.y);
            if (this.selectingMultiple) {
                selection.toggleMembership(hitShape);
            } else if ( ! selection.contains(hitShape)) {
                // On clear and add a new shape if it is not already selected
                selection.clear();
                selection.toggleMembership(hitShape);
            }
        }
        selection.checkpointShapes(this.downHitInfo);
    }

    _onMouseMove(eventType, source, event) { 
        super._onMouseMove(eventType, source, event);
        var stage = this.stage;
        var selection = stage.selection;
        var currPoint = this.currPoints[0];
        var downPoint = this.downPoints[0];

        // Mouse is not primed for "creating" an object
        selection.forEach(function(shape, self) {
            var currHitInfo = shape.controller.getHitInfo(currPoint.x, currPoint.y);
            if (currHitInfo != null) {
                self.stage.cursor = currHitInfo.cursor;
                return false;
            }
        }, this);

        if (downPoint != null) {
            // We are in a position to "transform" the entry pressed
            var shapesFound = false;
            selection.forEach(function(shape, self) {
                shapesFound = true;
                var savedInfo = selection.getSavedInfo(shape);
                shape.controller.applyHitChanges(self.downHitInfo, savedInfo,
                                                 downPoint.x, downPoint.y,
                                                 currPoint.x, currPoint.y);
            }, this);
            stage.paneNeedsRepaint("edit");
            if ( ! shapesFound ) {
                // Just draw a "selection rectangle"
                var x = Math.min(downPoint.x, currPoint.x);
                var y = Math.min(downPoint.y, currPoint.y);
                var w = Math.abs(downPoint.x - currPoint.x);
                var h = Math.abs(downPoint.y - currPoint.y);
                this._editPane.context.lineWidth = 1;
                this._editPane.context.strokeRect(x, y, w, h);
            }
        }
    }

    _onMouseUp(eventType, source, event) {
        super._onMouseUp(eventType, source, event);
        if (event.button == 0 && ( ! this.selectingMultiple ) && this.stage.touchState.isClick[0]) {
            // this was a click so just "toggleMembership" the shape selection
            var shapeIndex = this.stage.shapeIndex;
            var currPoint = this.currPoints[0];
            var hitShape = shapeIndex.getShapeAt(currPoint.x, currPoint.y);
            var selection = this.stage.selection;
            selection.clear();
            selection.toggleMembership(hitShape);
        }
    }
}

/**
 * The state that takes care of creation of shapes that only need a 
 * single drag to create the shape's bounding area.
 */
export class CreatingShapeState extends StageState {
    constructor(stage) {
        super(stage);
        this._editPane = this.stage.acquirePane("edit");
    }

    toWorld(x, y, result) { return this._editPane.toWorld(x, y, result); } 
    detach() { this.stage.releasePane("edit"); }

    _onMouseDown(eventType, source, event) {
        super._onMouseDown(eventType, source, event);
        var shapeIndex = this.stage.shapeIndex;
        var shapeForCreation = this.stateData;
        var downPoint = this.downPoints[0];
        this.stage.selection.clear();
        shapeForCreation.setBounds(new geom.Bounds(downPoint.x, downPoint.y, 1, 1));
        this.stage.shapeIndex.setPane(shapeForCreation, "edit");
        this.stage.scene.add(shapeForCreation);
    }

    _onMouseMove(eventType, source, event) { 
        super._onMouseMove(eventType, source, event);
        var stage = this.stage;
        var selection = stage.selection;
        var currPoint = this.currPoints[0];
        var downPoint = this.downPoints[0];

        // This mode is when we are showing a cross hair for creating an object
        var shapeForCreation = this.stateData;
        if (downPoint != null) {
            var minX = Math.min(downPoint.x, currPoint.x);
            var minY = Math.min(downPoint.y, currPoint.y);
            var maxX = Math.max(downPoint.x, currPoint.x);
            var maxY = Math.max(downPoint.y, currPoint.y);
            shapeForCreation.setBounds(new geom.Bounds(minX, minY, maxX - minX, maxY - minY));
            stage.paneNeedsRepaint("edit");
        }
    }

    _onMouseOver(eventType, source, event) { this.stage.cursor = "crosshair"; }
    _onMouseEntered(eventType, source, event) { return this._onMouseOver(eventType, source, event); }

    _onMouseUp(eventType, source, event) {
        super._onMouseUp(eventType, source, event);

        // only add a new shape once!
        var shapeForCreation = this.stateData;
        this.stage.shapeIndex.setPane(shapeForCreation, "main");
        this.stateData = null;
        this.stage.paneNeedsRepaint("main");
        return "";  // kick off a transition to root
    }
}

