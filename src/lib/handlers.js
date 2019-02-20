
import * as events from "./events";
import * as core from "./core";
import * as panes from "./panes";
import { getcssint } from "../utils/dom"

export class BaseKeyHandler {
    constructor(stage) {
        this.stage = stage;

        var handler = this;
        this.stage.keypress(function(event) { return handler._onKeyPress(event); });
        this.stage.keyup(function(event) { return handler._onKeyUp(event); });
        this.stage.keydown(function(event) { return handler._onKeyDown(event); });
    }

    _onKeyPress(event) { console.log("KeyPress: ", event); }
    _onKeyDown(event) { console.log("KeyDown: ", event); }
    _onKeyUp(event) { console.log("KeyUp: ", event); }
}

export class StageKeyHandler extends BaseKeyHandler {
    constructor(stage) {
        super(stage);

        this._editPane = this.stage.acquirePane("edit");
        this._editPane.element.attr("tabindex", 1);
        this.stage.movePane(this._editPane, -1);
    }

    detach() {
        this.stage.releasePane("edit");
    }

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

export class BaseTouchHandler {
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

export class StageBackgroundHandler extends BaseTouchHandler {
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


export class StageTouchHandler extends BaseTouchHandler {
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
            console.log("Creating: ", shapeForCreation);
            selection.clear();
            shapeForCreation.setLocation(this.downPoint.x, this.downPoint.y);
            this.stage.shapeIndex.setPane(shapeForCreation, "edit");
            this.stage.scene.add(shapeForCreation);
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
                    this._editPane.repaint();
                    this._editPane.context.strokeRect(x, y, w, h);
                }
            }
        } else if (this.stage.touchMode.mode == "create") {
            // This mode is when we are showing a cross hair for creating an object
            var shapeForCreation = this.stage.touchMode.data;
            this._editPane.cursor = "crosshair";
            if (this.downPoint != null) {
                var minX = Math.min(this.downPoint.x, this.currPoint.x);
                var minY = Math.min(this.downPoint.y, this.currPoint.y);
                shapeForCreation.setLocation(minX, minY);
                shapeForCreation.setSize(Math.abs(this.currPoint.x - this.downPoint.x),
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
