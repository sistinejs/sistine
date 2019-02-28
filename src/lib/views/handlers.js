
import * as geom from "../core/geom";
import * as panes from "./panes";
import { getcssint } from "../utils/dom"

export const TouchModes = {
    NONE: 0,
    CREATE: 1,
    ZOOM_IN: 2,
    ZOOM_OUT: 3,
    HAND_TOOL: 4,
}

export class TouchContext {
    constructor(mode, data) {
        this.mode = mode || TouchModes.NONE;
        this.data = data;
    }
}

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
        }
    }

    _onKeyUp(event) {
        console.log("KeyUp: ", event);
        if (event.key == "Backspace") {
            var shapes = this.stage.selection.allShapes;
            this.stage.selection.clear();
            for (var i = 0;i < shapes.length;i++) {
                shapes[i].removeFromParent();
            }
        } else if (event.key == "Escape") {
            this.stage.setTouchContext();
            this.stage.selection.clear();
        }
    }
}

export class BaseTouchHandler {
    constructor(stage) {
        this.stage = stage;
        this.downPoint = null;
        this.currPoint = new geom.Point();
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
        if (event.button == 0) {
            this.currPoint = this.toWorld(event.offsetX, event.offsetY, this.currPoint);
            this.downPoint = this.toWorld(event.offsetX, event.offsetY, this.downPoint);
            this.downTime = event.timeStamp;
            console.log("CP, DP: ", this.currPoint, this.downPoint);
        }
    }

    _onMouseUp(event) {
        this.currPoint = this.toWorld(event.offsetX, event.offsetY, this.currPoint);
        this.currTime = event.timeStamp;
        this.timeDelta = this.currTime - this.downTime;
        this.isClick = this.timeDelta <= this.clickThresholdTime;
        this.downTime = null;
        this.downPoint = null;
        console.log("Up, over, enter: ", this.mouseOver, this.mouseEntered);

        if (this.isClick) {
            this._onMouseClick(event);
        } else {
            this._onMouseReleased(event);
        }
    }

    _onMouseClick(event) {
    }


    _onMouseReleased(event) {
    }

    _onMouseMove(event) { 
        this.currPoint = this.toWorld(event.offsetX, event.offsetY, this.currPoint);
    }

    _onMouseEnter(event) { 
        this.mouseEntered = true;
    }
    _onMouseLeave(event) { 
        this.mouseEntered = false;
    }
    _onMouseOver(event) { 
        this.mouseOver = true;
    }
    _onMouseOut(event) { 
        this.mouseOver = false;
    }
}

export class StageBGHandler extends BaseTouchHandler {
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


export class StageViewPortHandler extends BaseTouchHandler {
    constructor(stage) {
        super(stage);
        this._bgPane = this.stage.acquirePane("bg");
        this.downOffset = null;
    }

    detach() {
        this.stage.releasePane("bg");
    }

    toWorld(x, y, result) {
        result = result || new geom.Point(x, y);
        if (this.downPoint != null) {
            result.x = (x / this._bgPane.zoom) + this.downOffset.x;
            result.y = (y / this._bgPane.zoom) + this.downOffset.y;
            return result;
        } else {
            return this._bgPane.toWorld(x, y, result);
        }
    }

    _onMouseDown(event) {
        super._onMouseDown(event);
        this.downOffset = this.stage.offset.copy();
    }

    _onMouseUp(event) {
        super._onMouseUp(event);

        if (this.stage.touchContext.mode == TouchModes.ZOOM_IN) {
        } else if (this.stage.touchContext.mode == TouchModes.ZOOM_OUT) {
        } else if (this.stage.touchContext.mode == TouchModes.HAND_TOOL) {
            // this.stage.setTouchContext();
        }
    }

    _onMouseMove(event) { 
        super._onMouseMove(event);
        var stage = this.stage;
        var selection = stage.selection;
        if (this.stage.touchContext.mode == TouchModes.HAND_TOOL) {
            this.stage.cursor = "grab";
        } else if (this.stage.touchContext.mode == TouchModes.ZOOM_IN) {
            this.stage.cursor = "zoom-in";
        } else if (this.stage.touchContext.mode == TouchModes.ZOOM_OUT) {
            this.stage.cursor = "zoom-out";
        } else {
            return ;
        }
        if (this.downPoint != null) {
            var deltaX = this.currPoint.x - this.downPoint.x;
            var deltaY = this.currPoint.y - this.downPoint.y;
            if (this.stage.touchContext.mode == TouchModes.HAND_TOOL) {
                this.stage.setOffset(this.downOffset.x - deltaX, this.downOffset.y - deltaY);
            } else if (this.stage.touchContext.mode == TouchModes.ZOOM_IN) {
                this.stage.cursor = "zoom-in";
            } else if (this.stage.touchContext.mode == TouchModes.ZOOM_OUT) {
                this.stage.cursor = "zoom-out";
            }
        }
    }
}

export class StageTouchHandler extends BaseTouchHandler {
    constructor(stage) {
        super(stage);
        this._editPane = this.stage.acquirePane("edit");
        this.selectingMultiple = false;
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

        if (this.stage.touchContext.mode == TouchModes.NONE) {
            this.selectingMultiple = this._selectingMultipleShapes(event);
            if (event.button == 0) {
                // See if first any existing items in our selection can handle this "down"
                var hitShape = null;
                selection.forEach(function(shape, self) {
                    var currHitInfo = shape.controller.getHitInfo(self.currPoint.x, self.currPoint.y);
                    if (currHitInfo != null) {
                        self.stage.cursor = currHitInfo.cursor;
                        hitShape = shape;
                        return false;
                    }
                }, this);

                if (hitShape == null) {
                    hitShape = shapeIndex.getShapeAt(this.downPoint.x, this.downPoint.y);
                }
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
            }
        }
        else if (this.stage.touchContext.mode == TouchModes.CREATE) {
            var shapeForCreation = this.stage.touchContext.data;
            console.log("Creating: ", shapeForCreation);
            selection.clear();
            shapeForCreation.setLocation(this.downPoint.x, this.downPoint.y);
            this.stage.shapeIndex.setPane(shapeForCreation, "edit");
            this.stage.scene.add(shapeForCreation);
        }
    }

    _onMouseMove(event) { 
        super._onMouseMove(event);
        var stage = this.stage;
        var selection = stage.selection;
        if (this.stage.touchContext.mode == TouchModes.NONE) {
            this.stage.cursor = "auto";
            // Mouse is not primed for "creating" an object
            selection.forEach(function(shape, self) {
                var currHitInfo = shape.controller.getHitInfo(self.currPoint.x, self.currPoint.y);
                if (currHitInfo != null) {
                    self.stage.cursor = currHitInfo.cursor;
                    return false;
                }
            }, this);

            if (this.downPoint != null) {
                // We are in a position to "transform" the entry pressed
                var shapesFound = false;
                selection.forEach(function(shape, self) {
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
                    console.log("DP, CP: ", this.downPoint, this.currPoint);
                    this._editPane.context.lineWidth = 1;
                    this._editPane.context.strokeRect(x, y, w, h);
                }
            }
        } else if (this.stage.touchContext.mode == TouchModes.ZOOM_IN) {
            this.stage.cursor = "zoom-in";
        } else if (this.stage.touchContext.mode == TouchModes.ZOOM_OUT) {
            this.stage.cursor = "zoom-out";
        } else if (this.stage.touchContext.mode == TouchModes.CREATE) {
            // This mode is when we are showing a cross hair for creating an object
            this.stage.cursor = "crosshair";
            var shapeForCreation = this.stage.touchContext.data;
            if (this.downPoint != null) {
                var minX = Math.min(this.downPoint.x, this.currPoint.x);
                var minY = Math.min(this.downPoint.y, this.currPoint.y);
                shapeForCreation.setLocation(minX, minY);
                shapeForCreation.setSize(Math.abs(this.currPoint.x - this.downPoint.x),
                                             Math.abs(this.currPoint.y - this.downPoint.y));
            }
        }
    }

    _onMouseUp(event) {
        super._onMouseUp(event);
        var selection = this.stage.selection;

        if (this.stage.touchContext.mode == TouchModes.NONE) {
            if (event.button == 0) {
                if ( ! this.selectingMultiple) {
                    if (this.isClick) {
                        // this was a click so just "toggleMembership" the shape selection
                        var shapeIndex = this.stage.shapeIndex;
                        var hitShape = shapeIndex.getShapeAt(this.currPoint.x, this.currPoint.y);
                        selection.clear();
                        selection.toggleMembership(hitShape);
                    } else {
                    }
                }
            } else {
                console.log("Mouse Over, Button: ", event.button);
            }
        } else if (this.stage.touchContext.mode == TouchModes.ZOOM_IN) {
            var newZoom = this.stage.zoom * 1.1;
            this.stage.setZoom(newZoom);
        } else if (this.stage.touchContext.mode == TouchModes.ZOOM_OUT) {
            var newZoom = this.stage.zoom * 0.9;
            this.stage.setZoom(newZoom);
        } else if (this.stage.touchContext.mode == TouchModes.CREATE) {
            // only add a new shape once!
            var shapeForCreation = this.stage.touchContext.data;
            this.stage.setTouchContext();
            this.stage.shapeIndex.setPane(shapeForCreation, "main");
        }
    }

    _onMouseEnter(event) { 
        super._onMouseEnter(event);
        this._editPane.element.focus();
    }
    _onMouseLeave(event) { 
        super._onMouseLeave(event);
        this._editPane.element.blur();
    }
    _onMouseOver(event) {
        super._onMouseOver(event);
    }
    _onMouseOut(event) { 
        super._onMouseOut(event);
    }
}
