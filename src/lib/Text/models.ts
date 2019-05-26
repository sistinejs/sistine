

import { Core } from "../Core/index"
import { Utils } from "../Utils/index"
import * as geom from "../Geom/models"
import * as geomutils from "../Geom/utils"

type Int = number;

const Arrays = Utils.Arrays;
const Element = Core.Models.Element;

export const DEFAULT_CONTROL_SIZE = 5;
export const CHUNK_TYPE_PLAIN = 0;
export const CHUNK_TYPE_PATH = 1;
export const CHUNK_TYPE_SPAN = 2;

/**
 * Defines a block of text with certain parameters.  Each block should be 
 * layoutable on its own but also can contain a hierarchy of other blocks.
 */
export class Block extends Core.Models.Shape {
    readonly xCoords : Array<number> = [];
    readonly yCoords : Array<number> = [];
    readonly dxValues : Array<number> = [];
    readonly dyValues : Array<number> = [];
    readonly rotationValues : Array<number> = [];
    readonly textLength : number = 0;
    readonly text : string = ""
    protected _rootBlock : Block | null = null;
    protected _parentBlock : Block | null = null;
    constructor(configs : any) {
        super((configs = configs || {}));
        this.xCoords = configs.xCoords || [];
        this.yCoords = configs.yCoords || [];
        this.dxValues = configs.dxValues || [];
        this.dyValues = configs.dyValues || [];
        this.rotationValues = configs.rotationValues || [];
        this.textLength = configs.textLength || 0;
        this.text = configs.text || "";
    }

    hasChildren() : boolean {
        return this.text.length == 0 && super.hasChildren();
    }

    childCount() : Int {
        return this.text.length > 0 ? 0 : super.childCount();
    } 

    childAtIndex(i : Int) : Element {
        return this.text.length > 0 ? null : super.childAtIndex(i);
    }

    add(element : string | Block, index? : Int) {
        if (this.text.length > 0) {
            throw new Error("Cannot add children to plain text blocks.");
        }
        if (typeof(element) === "string") {
            // Then add it as a plain text block
            element = new Block({text: element});
        }
        if (element.constructor.name == "Block") {
            element._rootBlock = this._rootBlock;
        }
        return super.add(element, index);
    }

    addX(value : number, index : Int) {
        Arrays.insert(this.xCoords, value, index);
        this.markTransformed();
        return this;
    }
    addY(value : number, index : Int) {
        Arrays.insert(this.yCoords, value, index);
        this.markTransformed();
        return this;
    }
    addDX(value : number, index : Int) {
        Arrays.insert(this.dxValues, value, index);
        this.markTransformed();
        return this;
    }
    addDY(value : number, index : Int) {
        Arrays.insert(this.dyValues, value, index);
        this.markTransformed();
        return this;
    }
    addRotation(value : number, index : Int) {
        Arrays.insert(this.rotationValues, value, index);
        this.markTransformed();
        return this;
    }

    _evalBoundingBox() : geom.Bounds {
        return this._rootBlock == null ? new geom.Bounds() : this._rootBlock.layout(false);
    }
}

/**
 * Holds information about the instance of a Text.  This block is the root block 
 * of a piece of text to begin rendering at.
 */
export class Text extends Block {
    constructor(configs : any) {
        super((configs = configs || {}));
        this._rootBlock = this;
        this._layout = LayoutEngine();
    }

    draw(ctx) {
        this.layout(ctx, this, true);
    }

    /**
     * Lays out the text on a given a context and also draws if the draw flag 
     * is set to true.  
     * Returns the bounding box of the laid out text.
     */
    layout(ctx, block, draw) {
    }
}

export class TextController extends Core.Controller.ShapeController {
}

class LayoutEngine {
}
