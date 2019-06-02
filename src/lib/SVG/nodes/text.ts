
import * as base from "./base"

import * as textmodels from "../../Text/models"
import { Utils } from "../../Utils/index"
import * as models from "../models"
import { Element } from "../../Core/base"
import { PathDataParser, TransformParser, NumbersTokenizer } from "../../Utils/svg"
import { Bounds, Length, Point } from "../../Geom/models"
import { Int, Nullable } from "../Core/types"

const forEachChild = Utils.DOM.forEachChild;
const forEachAttribute = Utils.DOM.forEachAttribute;

class BlockProcessor extends base.NodeProcessor {
    processTextAttributes(elem : HTMLElement, text : textmodels.Block) {
        new NumbersTokenizer(elem.getAttribute("x") || "")
            .all().forEach(function(token) {
                text.addX(token.value);
             });
        new NumbersTokenizer(elem.getAttribute("y") || "")
            .all().forEach(function(token) {
                text.addY(token.value);
             });
        new NumbersTokenizer(elem.getAttribute("dx") || "")
            .all().forEach(function(token) {
                text.addDX(token.value);
             });
        new NumbersTokenizer(elem.getAttribute("dy") || "")
            .all().forEach(function(token) {
                text.addDY(token.value);
             });
        new NumbersTokenizer(elem.getAttribute("rotation") || "")
            .all().forEach(function(token) {
                text.addRotation(token.value);
             });
        // text.textLength = parseFloat(elem.getAttribute("textLength")) || -1;
    }
}

export class TextNodeProcessor extends BlockProcessor {
    get validChildren() : Array<string> {
        return base.animationElements
                .concat(base.descriptiveElements)
                .concat(base.textContentChildElements)
                .concat(["a"]);
    }

    get validAttributes() : Array<string> {
        return base.conditionalProcessingAttributes
                .concat(base.coreAttributes)
                .concat(base.graphicalEventAttributes)
                .concat(base.presentationAttributes)
                .concat([ "class", "style", "externalResourcesRequired",
                          "transform", "lengthAdjust", "x", "y", "dx", "dy",
                          "rotate", "textLength"]);
    }

    processElement(elem : HTMLElement, parent : Nullable<Element>) : Nullable<Element> {
        var text = new textmodels.Text();
        if (parent != null) parent.add(text);
        this.processStyleAttributes(elem, text);
        this.processTextAttributes(elem, text);
        var loader = this.loader;
        Utils.DOM.forEachNode(elem, function(child : any, index : Int) {
            var nodeType = child.nodeType;
            if (nodeType == 8) // HTMLElement.COMMENT_NODE) 
                return ;

            if (nodeType == 1) { // HTMLElement.ELEMENT_NODE) {
                var tag = child.nodeName;
                if (tag == "tspan") {
                    var block = new textmodels.Block();
                    text.add(block);
                    loader.processElement(child, block);
                } else if (tag == "tref") {
                    // NOTSUPPORTED:
                    return ;
                } else {
                    throw new Error("Unsupported child: " + tag);
                    loader.processElement(child, text);
                }
            } else if (nodeType == 3) { // HTMLElement.TEXT_NODE) {
                var block = new textmodels.Block({
                    text: child.nodeValue
                });
                text.add(block);
            } else {
                throw new Error("Invalid node type: " + nodeType);
            }
        });
        return parent;
    }
}

export class TSpanNodeProcessor extends BlockProcessor {
    get validChildren() {
        return base.descriptiveElements
                .concat(["a", "altGlyph", "animate", "animateColor",
                         "set", "tref", "tspan" ]);
    }

    get validAttributes() {
        return base.conditionalProcessingAttributes
                .concat(base.coreAttributes)
                .concat(base.graphicalEventAttributes)
                .concat(base.presentationAttributes)
                .concat(["class", "style", "externalResourcesRequired",
                         "transform", "lengthAdjust", "x", "y", "dx", "dy",
                         "rotate", "textLength"]);
    }

    processElement(elem : HTMLElement, parent : Nullable<Element>) : Nullable<Element> {
        var text = new textmodels.Text();
        if (parent != null) parent.add(text);
        this.processStyleAttributes(elem, text);
        this.processTextAttributes(elem, text);
        return parent;
    }
}
