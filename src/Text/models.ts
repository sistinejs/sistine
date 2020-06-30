

import { Shape } from "../Core/models"
import { ShapeController } from "../Core/controller"
import * as Arrays from "../Utils/arrays"
import * as corebase from "../Core/base"
import * as geom from "../Geom/models"
import { Int, Nullable } from "../Core/types"

export const DEFAULT_CONTROL_SIZE = 5;
export const CHUNK_TYPE_PLAIN = 0;
export const CHUNK_TYPE_PATH = 1;
export const CHUNK_TYPE_SPAN = 2;

/**
 * Defines a block of text with certain parameters.  Each block should be 
 * layoutable on its own but also can contain a hierarchy of other blocks.
 */
export class Block extends Shape {
    readonly xCoords : Array<number> = [];
    readonly yCoords : Array<number> = [];
    readonly dxValues : Array<number> = [];
    readonly dyValues : Array<number> = [];
    readonly rotationValues : Array<number> = [];
    textLength : number = -1;
    protected _text : string = ""
    protected _rootBlock : Text | null = null;
    protected _parentBlock : Block | null = null;
    constructor(configs? : any) {
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

    childAtIndex(i : Int) : Nullable<corebase.Element> {
        return this.text.length > 0 ? null : super.childAtIndex(i);
    }

    add(element : corebase.Element | string | Block, index : Int = -1) : boolean {
        if (this.text.length > 0) {
            throw new Error("Cannot add children to plain text blocks.");
        }
        var normalizedElement : corebase.Element;
        if (typeof(element) === "string") {
            // Then add it as a plain text block
            normalizedElement = new Block({text: element});
        }
        else {
            normalizedElement = element as corebase.Element;
        }
        if (normalizedElement instanceof Block) {
            normalizedElement._rootBlock = this._rootBlock;
        }
        return super.add(normalizedElement, index);
    }

    addX(value : number, index : Int = -1) : Block {
        Arrays.insert(this.xCoords, value, index);
        this.markTransformed();
        return this;
    }
    addY(value : number, index : Int = -1) : Block {
        Arrays.insert(this.yCoords, value, index);
        this.markTransformed();
        return this;
    }
    addDX(value : number, index : Int = -1) : Block {
        Arrays.insert(this.dxValues, value, index);
        this.markTransformed();
        return this;
    }
    addDY(value : number, index : Int = -1) : Block {
        Arrays.insert(this.dyValues, value, index);
        this.markTransformed();
        return this;
    }
    addRotation(value : number, index : Int = -1) : Block {
        Arrays.insert(this.rotationValues, value, index);
        this.markTransformed();
        return this;
    }

    get text() : string { return this._text; }
    set text(t : string) { this._text = t; this.markTransformed(); }

    _evalBoundingBox() : geom.Bounds {
        return this._rootBlock == null ? new geom.Bounds() : this._rootBlock.layout(null, this, false);
    }
}

/**
 * Holds information about the instance of a Text.  This block is the root block 
 * of a piece of text to begin rendering at.
 */
export class Text extends Block {
    private _layout : LayoutEngine = new LayoutEngine();
    constructor(configs? : any) {
        super((configs = configs || {}));
        this._rootBlock = this;
    }

    draw(ctx : any) {
        this.layout(ctx, this, true);
    }

    /**
     * Lays out the text on a given a context and also draws if the draw flag 
     * is set to true.  
     * Returns the bounding box of the laid out text.
     */
    layout(ctx : any, block : Block, draw : boolean) : geom.Bounds {
        return new geom.Bounds();
    }
}

export class TextController extends ShapeController<Text> {
}

class LayoutEngine {
}
