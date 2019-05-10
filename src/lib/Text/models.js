

import * as models from "./models"
import * as geom from "../Geom/models"
import * as geomutils from "../Geom/utils"
import * as Utils from "../Utils/index"

const Arrays = Utils.Arrays;

export const DEFAULT_CONTROL_SIZE = 5;

/**
 * Defines a block of text with certain parameters.
 */
class Block extends models.Shape {
    constructor(configs) {
        super((configs = configs || {}));
    }
}

/**
 * Holds information about the instance of a Text.  A piece of text is a tree 
 * of text content blocks, each with its own set of styleable properties.
 */
export class Text extends models.Shape {
    constructor(configs) {
        super((configs = configs || {}));
        this._xCoords = [];
        this._yCoords = [];
        this._dxValues = [];
        this._dyValues = [];
        this._rotationValues = [];
        this._textLength = 0;
    }

    add(element, index) {
        if (typeof(element) === "string") {
        } else if (element.constructor.name === "TextBlock") {
        } else {
        }
    }

    addX(value, index) {
        Arrays.insert(this._xCoords, value, index);
        this.markTransformed();
        return this;
    }
    addY(value, index) {
        Arrays.insert(this._yCoords, value, index);
        this.markTransformed();
        return this;
    }
    addDX(value, index) {
        Arrays.insert(this._dxValues, value, index);
        this.markTransformed();
        return this;
    }
    addDY(value, index) {
        Arrays.insert(this._dyValues, value, index);
        this.markTransformed();
        return this;
    }
    addRotation(value, index) {
        Arrays.insert(this._rotationValues, value, index);
        this.markTransformed();
        return this;
    }

    get controllerClass() { return TextController; }

    draw(ctx) {
    }
}

Text.Controller = class TextController extends controller.ShapeController {
}

