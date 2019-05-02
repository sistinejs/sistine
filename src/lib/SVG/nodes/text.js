
import * as base from "./base"
import { Core } from "../../Core/index"
import { Geom } from "../../Geom/index"
import { Utils } from "../../Utils/index"
import * as models from "../models"

const Length = Geom.Models.Length;
const Point = Geom.Models.Point;
const forEachChild = Utils.DOM.forEachChild;
const forEachAttribute = Utils.DOM.forEachAttribute;

class TextChunkProcessor extends base.NodeProcessor {
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

export class TextNodeProcessor extends TextChunkProcessor {
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
        var text = new Core.Text();
        parent.add(text);
        this.processStyleAttributes(elem, text);
        this.processTextAttributes(elem, text);
    }
}

export class TSpanNodeProcessor extends TextChunkProcessor {
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
        var text = new Core.Text();
        this.processStyleAttributes(elem, text);
        this.processTextAttributes(elem, text);
        parent.add(text);
    }
}
