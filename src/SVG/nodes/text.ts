
import * as base from "./base"

import * as textmodels from "../../Text/models"
import Utils from "../../Utils/index"
import { Element } from "../../Core/base"
import { NumbersTokenizer } from "../../Utils/svg"
import { Int, Nullable } from "../../Core/types"

class BlockProcessor extends base.NodeProcessor {
    processTextAttributes(elem : HTMLElement, text : textmodels.Block) {
        new NumbersTokenizer(elem.getAttribute("x") || "")
            .all().forEach(function(token) {
                if (token != null)
                    text.addX(token.value as number);
             });
        new NumbersTokenizer(elem.getAttribute("y") || "")
            .all().forEach(function(token) {
                if (token != null)
                    text.addY(token.value as number);
             });
        new NumbersTokenizer(elem.getAttribute("dx") || "")
            .all().forEach(function(token) {
                if (token != null)
                    text.addDX(token.value as number);
             });
        new NumbersTokenizer(elem.getAttribute("dy") || "")
            .all().forEach(function(token) {
                if (token != null)
                    text.addDY(token.value as number);
             });
        new NumbersTokenizer(elem.getAttribute("rotation") || "")
            .all().forEach(function(token) {
                if (token != null)
                    text.addRotation(token.value as number);
             });
        // text.textLength = parseFloat(elem.getAttribute("textLength")) || -1;
    }
}

export class TextNodeProcessor extends BlockProcessor {
    validChildren() : Array<string> {
        return base.animationElements
                .concat(base.descriptiveElements)
                .concat(base.textContentChildElements)
                .concat(["a"]);
    }

    validAttributes() : Array<string> {
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
    validChildren() {
        return base.descriptiveElements
                .concat(["a", "altGlyph", "animate", "animateColor",
                         "set", "tref", "tspan" ]);
    }

    validAttributes() {
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
