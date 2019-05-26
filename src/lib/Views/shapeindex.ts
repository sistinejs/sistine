
/**
 * The index structure of a scene lets us re-model how we store and index shapes in a scene
 * for faster access and grouping not just by hierarchy but also to cater for various access
 * characteristics. (say by location, by attribute type, by zIndex etc)
 */
export class ShapeIndex {
    defaultPane : string = "main"
    constructor(scene) {
        this._shapeIndexes = {};
        this._allShapes = [];
        this.scene = scene;
    }

    get scene() {
        return this._scene || null;
    }

    set scene(s) {
        this._scene = this._scene || null;
        if (this._scene != s) {
            this._scene = s
            this._shapeIndexes = {};
            this._allShapes = [];
            var self = this;
            s.on("ElementAdded", function(eventType, source, event) {
                self.add(event.subject);
            }).on("ElementRemoved", function(eventType, source, event) {
                self.remove(event.subject);
            });
            this.reIndex();     // Build the index for this new scene!
        }
    }

    setPane(shape, pane) {
        if (shape != null && shape.pane != pane) {
            shape.pane = pane;
        }
        shape.forEachChild(function(child, index, self) {
            self.setPane(child, pane);
        }, this);
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

    /**
     * Returns true if shape exists in this index.
     */
    shapeExists(shape) {
        return shape.uuid in this._shapeIndexes;
    }

    /**
     * A new shape is added to the index.
     */
    add(shape) {
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
        var index = this._shapeIndexes[shape.uuid];
        this._allShapes[index] = null;
    }

    removeShapes(shapes) {
        for (var i in shapes) {
            this.remove(shapes[i]);
        }
    }

    /**
     * Returns true if shape exists in this index.
     */
    getShape(id) {
        return shape.uuid in this._shapeIndexes;
    }

    /**
     * Given a coordinate (x,y) returns the topmost shape that contains this point.
     */
    getShapeAt(x, y, root) {
        root = root || this._scene;
        for (var i = 0;i < root.childCount;i++) {
            var shape = root.childAtIndex(i);
            if (shape.containsPoint(x, y)) {
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

    _reIndexShape(shape) {
        this.add(shape);
        for (var index in shape.children) {
            var child = shape.children[index];
            this._reIndexShape(child);
        }
    }
}
