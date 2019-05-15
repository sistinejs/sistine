
import * as base from "./base"
import { Text } from "../../Text/index"
import { Geom } from "../../Geom/index"
import { Utils } from "../../Utils/index"
import * as models from "../models"

const NumbersTokenizer = Utils.SVG.NumbersTokenizer;
const TransformParser = Utils.SVG.TransformParser;
const Length = Geom.Models.Length;
const Point = Geom.Models.Point;
const forEachNode = Utils.DOM.forEachNode;
const forEachAttribute = Utils.DOM.forEachAttribute;

class BlockProcessor extends base.NodeProcessor {
    processTextAttributes(elem, text) {
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
        text.textLength = elem.getAttribute("textLength") || null;
    }
}

export class TextNodeProcessor extends BlockProcessor {
    get validChildren() {
        return base.animationElements
                .concat(base.descriptiveElements)
                .concat(base.textContentChildElements)
                .concat(["a"]);
    }

    get validAttributes() {
        return base.conditionalProcessingAttributes
                .concat(base.coreAttributes)
                .concat(base.graphicalEventAttributes)
                .concat(base.presentationAttributes)
                .concat([ "class", "style", "externalResourcesRequired",
                          "transform", "lengthAdjust", "x", "y", "dx", "dy",
                          "rotate", "textLength"]);
    }

    processElement(elem, parent) {
        var text = new Text.Text();
        parent.add(text);
        this.processStyleAttributes(elem, text);
        this.processTextAttributes(elem, text);
        var loader = this.loader;
        Utils.DOM.forEachNode(elem, function(child, index) {
            var nodeType = child.nodeType;
            if (nodeType == HTMLElement.COMMENT_NODE) 
                return ;

            if (nodeType == HTMLElement.ELEMENT_NODE) {
                var tag = child.nodeName;
                if (tag == "tspan") {
                    var block = new Text.Block();
                    text.add(block);
                    loader.processElement(child, block);
                } else if (tag == "tref") {
                    // NOTSUPPORTED:
                    return ;
                } else {
                    throw new Error("Unsupported child: ", node.tag);
                    loader.processElement(child, text);
                }
            } else if (nodeType == HTMLElement.TEXT_NODE) {
                var block = new Text.Block({
                    text: child.nodeValue
                });
                text.add(block);
            } else {
                throw new Error("Invalid node type: ", nodeType);
            }
        });
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

    processElement(elem, parent) {
        var text = new Text.Text();
        this.processStyleAttributes(elem, text);
        this.processTextAttributes(elem, text);
        parent.add(text);
    }
}
