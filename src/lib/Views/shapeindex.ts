
import { Int, Nullable, Undefined } from "../Core/types"
import { Shape, Scene } from "../Core/models"
import { EventSource, EventType } from "../Core/events"
import { Pane } from "./panes"
import { Bounds } from "../Geom/models"

/**
 * The index structure of a scene lets us re-model how we store and index shapes in a scene
 * for faster access and grouping not just by hierarchy but also to cater for various access
 * characteristics. (say by location, by attribute type, by zIndex etc)
 */
export class ShapeIndex {
    defaultPane : string = "main"
    private _scene : Nullable<Scene> = null;
    private _shapeIndexes : { [key:string] : Int } = {};
    private _allShapes : Array<Nullable<Shape>> = [];

    get scene() { return this._scene; }
    set scene(s) {
        this._scene = this._scene || null;
        if (this._scene != s) {
            this._scene = s
            this._shapeIndexes = {};
            this._allShapes = [];
            var self = this;
            if (s != null) {
                s.on("ElementAdded", function(eventType : EventType, source : EventSource, event : any) {
                    self.add(event.subject);
                }).on("ElementRemoved", function(eventType : EventType, source : EventSource, event : any) {
                    self.remove(event.subject);
                });
            }
            this.reIndex();     // Build the index for this new scene!
        }
    }

    setPane(shape : Shape, pane : Pane) {
        if (shape != null && shape.pane != pane) {
            shape.pane = pane;
        }
        shape.forEachChild(function(child, index, self) : Undefined<boolean> {
            self.setPane(child, pane);
        }, this);
    }

    /**
     * Applies a visitor for shapes in a given view port in a given pane.
     */
    forShapesInViewPort(pane : Pane, viewPort : Bounds, visitor : any) {
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

    /**
     * Returns true if shape exists in this index.
     */
    shapeExists(shape : Shape) : boolean {
        return shape.uuid in this._shapeIndexes;
    }

    /**
     * A new shape is added to the index.
     */
    add(shape : Shape) {
        shape.pane = shape.pane || this.defaultPane;
        // See if shape already has an index assigned to it
        if (this.shapeExists(shape)) {
            var index = this._shapeIndexes[shape.uuid];
            if (this._allShapes[index] != null) {
                throw Error("Adding shape again without removing it first");
            }
            this._allShapes[index] = shape;
        } else {
            this._shapeIndexes[shape.uuid] = this._allShapes.length;
            this._allShapes.push(shape);
        }
    }

    addShapes(shapes : Array<Shape>) {
        for (var i in shapes) {
            this.add(shapes[i]);
        }
    }

    /**
     * Remove a shape from the index.
     */
    remove(shape : Shape) {
        if (!this.shapeExists(shape)) {
            throw Error("Shape does not exist in this index.");
        }
        var index = this._shapeIndexes[shape.uuid];
        this._allShapes[index] = null;
    }

    removeShapes(shapes : Array<Shape>) {
        for (var i in shapes) {
            this.remove(shapes[i]);
        }
    }

    /**
     * Returns true if shape exists in this index.
     */
    hasShape(shape : Shape) {
        return shape.uuid in this._shapeIndexes;
    }

    /**
     * Given a coordinate (x,y) returns the topmost shape that contains this point.
     */
    getShapeAt(x: number, y: number, root: Shape) {
        root = root || this._scene;
        for (var i = 0;i < root.childCount();i++) {
            var shape = root.childAtIndex(i);
            if ((shape as Shape).containsPoint(x, y)) {
                return shape;
            }
        }
        return null;
    }

    reIndex() {
        var scene = this._scene;
        if (scene) {
            this._reIndexShape(scene);
        }
    }

    _reIndexShape(shape : Shape) {
        this.add(shape);
        for (var index in shape.children) {
            var child = shape.children[index];
            this._reIndexShape(child);
        }
    }
}
