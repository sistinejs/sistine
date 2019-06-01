
import { Int, Nullable, Timestamp } from "../Core/base"
import * as coreevents from "../Core/events";
import * as events from "./events";
import { Core } from "../Core";
import * as panes from "./panes";
import { ShapeIndex } from "./shapeindex";
import * as cursors from "./cursors";
import { getcssint } from "../Utils/dom"
import * as geom from "../Geom/models"
import * as geomutils from "../Geom/utils"
import { Point, Bounds } from "../Geom/models"

class TouchState {
    readonly maxPoints : Int;
    downTimes: Array<Number> = [];
    downPoints: Array<Nullable<Point>> = [];
    currTimes: Array<Number> = [];
    currPoints: Array<Nullable<Point>> = [];
    timeDeltas: Array<Number> = [];
    isClick: Array<boolean> = [];
    private _active : Array<boolean> = [];
    // Max time before a down goes from a "click" to a "hold"
    clickThresholdTime : number = 500;

    constructor(maxPoints = 10) {
        this.maxPoints = maxPoints;
        for (var i = 0;i < maxPoints;i++) {
            this._active.push(false);
            this.downTimes.push(0);
            this.downPoints.push(null);
            this.currTimes.push(0);
            this.currPoints.push(new geom.Point());
            this.isClick.push(false);
            this.timeDeltas.push(0);
        }
    }

    touchDown(index : Int, x : number, y : number, timeStamp : Timestamp) {
        this.downPoints[index] = new geom.Point(x, y);
        this.currPoints[index].x = x;
        this.currPoints[index].y = y;
        this.currTimes[index] = timeStamp;
        this.downTimes[index] = timeStamp;
        this._active[index] = true;
    }

    touchUp(index, x, y, timeStamp) {
        this._active[index] = false;
        this.currPoints[index].x = x;
        this.currPoints[index].y = y;
        this.currTimes[index] = timeStamp;
        this.timeDeltas[index] = this.currTimes[index] - this.downTimes[index];
        this.isClick[index] = this.timeDeltas[index] <= this.clickThresholdTime;
        this.downTimes[index] = null;
        this.downPoints[index] = null;
    }
}

/**
 * The stage model if where all shapes are managed. 
 * As far as possible this does not perform any view related operations as 
 * that is decoupled into the view entity.
 */
export class Stage extends coreevents.EventSource {
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
        this._bounds = new geom.Bounds(configs);
        this._zoom = 1.0;
        this._offset = new geom.Point()

        this._divId = divId;
        this._parentDiv = $("#" + divId);
        this.scene = scene || new Core.Models.Scene();
        this._shapeIndex = new ShapeIndex(this._scene);

        // Track mouse/touch drag events
        this._panes = [];

        // Main panel where shapes are drawn at rest
        this._mainPane = this.acquirePane("main");

        // Information regarding Selections
        this.selection = new Core.Selection();
        var self = this;
        this.selection.on("ShapesSelected", function(eventType, source, event) {
            event.shapes.forEach(function(shape) {
                self.setShapePane(shape, "edit");
            });
        }).on("ShapesUnselected", function(eventType, source, event) {
            event.shapes.forEach(function(shape) {
                self.setShapePane(shape, "main");
            });
        });

        this.cursorMap = Object.assign({}, cursors.DefaultCursorMap);

        // Setup event state machines for push based event handling
        this.touchState = new TouchState();
        this._setupEventMachine();

        // Kick off the repaint loop
        this._kickOffRepaint();
    }

    set scene(s) {
        this._scene = this._scene || null;
        if (this._scene != s) {
            this._scene = s
            var self = this;
            s.on("ElementAdded, ElementRemoved", function(eventType, source, event) {
                if (!event.subject.pane) {
                    self.setShapePane(event.subject, "main");
                }
                self.paneNeedsRepaint(event.subject.pane);
            }).on("PropertyChanged", function(eventType, source, event) {
                self.paneNeedsRepaint(event.source.pane)
            });
        }
    }

    set cursor(c) {
        c = c || "auto";
        if (c in this.cursorMap) {
            c = this.cursorMap[c];
        }
        this._parentDiv.css("cursor", c);
    }

    get zoom() { return this._zoom; }
    setZoom(z) {
        if (z < 0) z = 1;
        if (z > 10) z = 10;
        if (this._zoom != z) {
            var event = new events.ZoomChanged(this._zoom, z);
            if (this.validateBefore("ZoomChanged", event) != false) {
                this._zoom = z;
                this._panes.forEach(function(pane, index) {
                    pane.setZoom(z);
                });
                this.triggerOn("ZoomChanged", event);
            }
        }
    }

    get offset() { return this._offset; }
    setOffset(x, y) {
        if (this._offset.x != x || this._offset.y != y) {
            var event = new events.ViewPortChanged(this._offset.x, this._offset.y, x, y);
            if (this.validateBefore("ViewPortChanged", event) != false) {
                this._offset = new geom.Point(x, y);
                this._panes.forEach(function(pane, index) {
                    pane.setOffset(x, y);
                });
                this.triggerOn("ViewPortChanged", event);
            }
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
                this.acquirePane("bg", panes.BGPane);
            } else {
                this.releasePane("bg");
            }
        }
    }

    get isEditable() {
        return this._editable;
    }

    set isEditable(editable) {
        if (this._editable != editable) {
            this._editable = editable;
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
    get parentDiv() { return this._parentDiv; }
    get viewBounds() { return this._viewBounds; }

    set tabIndex(value) {
        this.element.attr("tabindex", 1);
    }
    focus() { this.element.focus(); }
    blur() { this.element.blur(); }

    layout() {
        for (var i = this._panes.length - 1; i >= 0;i--)
            this._panes[i].layout();
    }

    _kickOffRepaint() {
        var self = this;
        this.animFrameId = requestAnimationFrame(function() {
            for (var i = self._panes.length - 1; i >= 0;i--)
                self._panes[i].paint();
            self._kickOffRepaint();
        });
    }

    setShapePane(shape, pane) {
        if (shape.pane != pane) {
            this.paneNeedsRepaint(shape.pane);
            this.shapeIndex.setPane(shape, pane);
            this.paneNeedsRepaint(shape.pane);
        }
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

    _setupEventMachine() {
        var self = this;
        var machine = new coreevents.StateMachine();
        self.eventMachine = machine;
        self.element.on("keydown", function(event) {
            machine.handle("keydown", self, event);
        });
        self.element.on("keyup", function(event) {
            machine.handle("keyup", self, event);
        });
        self.element.on("keypress", function(event) {
            machine.handle("keypress", self, event);
        });
        self.element.on("mouseenter", function(event) {
            machine.handle("mouseentered", self, event);
        });
        self.element.on("mouseleave", function(event) {
            machine.handle("mouseleave", self, event);
        });
        self.element.on("mouseover", function(event) {
            machine.handle("mouseover", self, event);
        });
        self.element.on("mouseout", function(event) {
            machine.handle("mouseout", self, event);
        });
        self.element.on("mousedown", function(event) {
            self.touchState.touchDown(event.button, event.offsetX, event.offsetY, event.timeStamp);
            machine.handle("mousedown", self, event);
        });
        self.element.on("mouseup", function(event) {
            self.touchState.touchUp(event.button, event.offsetX, event.offsetY, event.timeStamp);
            machine.handle("mouseup", self, event);
        });
        self.element.on("mousemove", function(event) {
            machine.handle("mousemove", self, event);
        });
    }

    // Subscribtion based event handling for more custom handling 
    // if needed.
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

    _setupHandler(element, method, handler) {
        var source = this;
        element[method](function(event) {
            event.theSource = source;
            handler(event);
        });
        return this;
    }
}
