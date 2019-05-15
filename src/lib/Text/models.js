

import { Core } from "../Core/index"
import { Utils } from "../Utils/index"
import * as geom from "../Geom/models"
import * as geomutils from "../Geom/utils"

const Arrays = Utils.Arrays;

export const DEFAULT_CONTROL_SIZE = 5;
export const CHUNK_TYPE_PLAIN = 0;
export const CHUNK_TYPE_PATH = 1;
export const CHUNK_TYPE_SPAN = 2;

/**
 * Defines a block of text with certain parameters.  Each block should be 
 * layoutable on its own but also can contain a hierarchy of other blocks.
 */
export class Block extends Core.Models.Shape {
    constructor(configs) {
        super((configs = configs || {}));
        this._xCoords = configs.xCoords || [];
        this._yCoords = configs.yCoords || [];
        this._dxValues = configs.dxValues || [];
        this._dyValues = configs.dyValues || [];
        this._rotationValues = configs.rotationValues || [];
        this._textLength = configs.textLength || 0;
        this._text = configs.text || "";

        // Are these required or can be computed on demand?
        this._rootBlock = null;
        this._parentBlock = null;
    }

    get hasChildren() {
        return this._text.length == 0 && super.hasChildren;
    }

    get childCount() {
        return this._text.length > 0 ? 0 : super.childCount;
    } 

    childAtIndex(i) {
        return this._text.length > 0 ? null : super.childAtIndex(i);
    }

    add(element, index) {
        if (this._text.length > 0) {
            throw new Error("Cannot add children to plain text blocks.");
        }
        if (typeof(element) === "string") {
            // Then add it as a plain text block
            element = new Block({text: element});
        }
        return super.add(element, index);
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
}

/**
 * Holds information about the instance of a Text.  This block is the root block 
 * of a piece of text to begin rendering at.
 */
export class Text extends Block {
    constructor(configs) {
        super((configs = configs || {}));
    }

    get controllerClass() { return Text.Controller; }

    draw(ctx) {
    }
}

Text.Controller = class TextController extends Core.Controller.ShapeController {
}

