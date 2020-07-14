import { Event, EventSource } from "./events";
import { Element } from "./base";
import { Shape, Group } from "./models";
import { HitInfo } from "./controller";
import { Int, Nullable, Undefined } from "./types";

export class Selection extends EventSource {
  private _shapes: Array<Shape> = [];
  private _shapesByUUID: { [key: string]: Shape } = {};
  private _savedInfos: { [key: string]: any } = {};
  private _count = 0;

  get count() {
    return this._shapes.length;
  }

  get allShapes() {
    var out: Array<Shape> = [];
    this.forEach(function (shape: Shape) {
      out.push(shape);
      return true;
    });
    return out;
  }

  forEach<T>(handler: (shape: Shape, caller: Nullable<T>) => Undefined<boolean>, self?: T, mutable: boolean = false) {
    var shapesByUUID = this._shapesByUUID;
    if (mutable == true) {
      shapesByUUID = Object.assign({}, shapesByUUID);
    }
    for (var shapeId in shapesByUUID) {
      var shape = shapesByUUID[shapeId];
      if (handler(shape, self || null) === false) break;
    }
  }

  contains(shape: Shape): boolean {
    return shape.uuid in this._shapesByUUID;
  }

  get(index: Int) {
    return this._shapes[index];
  }

  add(shape: Shape) {
    var event = new ShapesSelected(this, [shape]);
    if (this.validateBefore("ShapesSelected", event) != false) {
      if (!(shape.uuid in this._shapesByUUID)) {
        this._shapes.push(shape);
      }
      this._shapesByUUID[shape.uuid] = shape;
      this._savedInfos[shape.uuid] = (shape as any).controller.snapshotFor();
      this.triggerOn("ShapesSelected", event);
    }
  }

  remove(shape: Shape) {
    var event = new ShapesUnselected(this, [shape]);
    if (this.validateBefore(event.name, event) != false) {
      if (shape.uuid in this._shapesByUUID) {
        for (var i = 0; i < this._shapes.length; i++) {
          if (this._shapes[i].uuid == shape.uuid) {
            this._shapes.splice(i, 1);
            break;
          }
        }
      }
      delete this._shapesByUUID[shape.uuid];
      delete this._savedInfos[shape.uuid];
      this.triggerOn("ShapesUnselected", event);
    }
  }

  checkpointShapes(hitInfo: HitInfo) {
    // Updated the save info for all selected shapes
    this.forEach<Selection>(function (shape: Shape, self: Selection) {
      self._savedInfos[shape.uuid] = (shape as any).controller.snapshotFor(hitInfo);
      return true;
    }, this);
  }

  getSavedInfo(shape: Shape) {
    return this._savedInfos[shape.uuid];
  }

  toggleMembership(shape: Shape) {
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
    var event = new ShapesUnselected(this, this.allShapes);
    this.triggerOn("ShapesUnselected", event);
    this._savedInfos = {};
    this._shapes = [];
    this._shapesByUUID = {};
    this._count = 0;
  }

  /**
   * Brings the selected shapes forward by one level within their parents.
   */
  bringForward() {
    this.forEach(function (shape: Shape) {
      if (shape.parent != null) shape.parent.bringForward(shape);
      return true;
    });
  }

  /**
   * Sends the selected shapes backward by one level within their parents.
   */
  sendBackward() {
    this.forEach(function (shape: Shape) {
      if (shape.parent != null) shape.parent.sendBackward(shape);
      return true;
    });
  }

  /**
   * Brings the selected shapes to the front of the stack within their parents.
   */
  bringToFront() {
    this.forEach(function (shape: Shape) {
      if (shape.parent != null) shape.parent.bringToFront(shape);
      return true;
    });
  }

  /**
   * Sends the selected shapes to the back of the stack within their parents.
   */
  sendToBack() {
    this.forEach(function (shape: Shape) {
      if (shape.parent != null) shape.parent.sendToBack(shape);
      return true;
    });
  }

  /**
   * Create a group out of the elements in this Selection.
   */
  group() {
    // Collect all shapes in this selection
    // Identify their parents.
    // Do they all have the same parent?
    // if all parents are "null" then they are all at the top level
    // if they are all non null but same then they are all at teh same
    // level under the same parent so same as above and OK.
    // But if different shapes have different parents then only
    // those shapes that share a parent can be grouped together.
    var groups: any = {};
    this.forEach(function (shape: Shape) {
      var parId = 0;
      if (shape.parent != null) {
        parId = shape.parent.uuid;
      }
      if (!(parId in groups)) {
        groups[parId] = {
          parent: shape.parent,
          boundingBox: shape.boundingBox.copy(),
          shapes: [],
        };
      }
      groups[parId].shapes.push(shape);
      groups[parId].boundingBox.union(shape.boundingBox);
      return true;
    });

    this.clear();
    for (var parentId in groups) {
      var currGroup = groups[parentId];
      var currBounds = currGroup.boundingBox;
      var currParent = currGroup.parent;
      // Here create a new shape group if we have atleast 2 shapes
      if (currGroup.shapes.length > 1) {
        var newParent = new Group();
        currParent.add(newParent);
        newParent.setBounds(currBounds);
        currGroup.shapes.forEach(function (child: Shape, _index: Int) {
          newParent.add(child);
          (child as any).setLocation(child.boundingBox.x - currBounds.x, child.boundingBox.y - currBounds.y);
        });
        this.add(newParent);
      }
    }
  }

  /**
   * Ungroups all elements in the current selection.  This is a no-op if number
   * of elements in the selection is not 1 and the existing element is not a ShapeGroup.
   */
  ungroup() {
    var selection = this;
    this.forEach(
      function (shape: Shape, self: Selection) {
        if (shape instanceof Group) {
          selection.remove(shape);
          var newParent = shape.parent;
          var lBounds = shape.boundingBox;
          shape.forEachChild(
            function (child: Element, index: Int, self: any) {
              if (newParent != null) newParent.add(child);
              if (child instanceof Shape) {
                (child as any).setLocation(lBounds.x + child.boundingBox.x, lBounds.y + child.boundingBox.y);
                selection.add(child);
              }
              return true;
            },
            this,
            true,
          );
          if (newParent != null) newParent.remove(shape);
        }
        return true;
      },
      this,
      true,
    );
  }

  /**
   * Regroups elements in the selection.  This is useful if elements are added after
   * grouping and we want to add to existing groups consolidating multiple groups
   * into a single group.
   */
  regroup() {}

  /**
   * "Copies" the shapes in this selection to the clipboard along with their current state
   * so that it can be pasted later.   The "cut" parameter also dictates whether the
   * selected shapes are to be removed from the Scene model too.
   */
  copyToClipboard(_cut: boolean = false) {}

  /**
   * Paste a copy of shapes stored in the clipboard.
   */
  pasteFromClipboard() {}
}

export class ShapesSelected extends Event {
  selection: Selection;
  shapes: Array<Shape>;
  constructor(selection: Selection, shapes: Array<Shape>) {
    super();
    this.selection = selection;
    this.shapes = shapes;
  }

  get name() {
    return "ShapesSelected";
  }
}

export class ShapesUnselected extends Event {
  selection: Selection;
  shapes: Array<Shape>;
  constructor(selection: Selection, shapes: Array<Shape>) {
    super();
    this.selection = selection;
    this.shapes = shapes;
  }

  get name() {
    return "ShapesUnselected";
  }
}
