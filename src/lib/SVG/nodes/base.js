
import { Geom } from "../../Geom/index"
import { Utils } from "../../Utils/index"
import * as parser from "../parser"
import * as models from "../models"

const NumbersTokenizer = parser.NumbersTokenizer;
const PathDataParser = parser.PathDataParser;
const TransformParser = parser.TransformParser;
const Length = Geom.Models.Length;
const Point = Geom.Models.Point;
const forEachChild = Utils.DOM.forEachChild;
const forEachAttribute = Utils.DOM.forEachAttribute;

export const conditionalProcessingAttributes = [
    "requiredFeatures", "requiredExtensions", "systemLanguage"
];
export const coreAttributes = [
    "id", "xml:base", "xml:lang", "xml:space"
];
export const documentEventAttributes = [
    "onunload", "onabort", "onerror", "onresize", "onscroll", "onzoom"
];
export const graphicalEventAttributes = [
    "onfocusin", "onfocusout", "onactivate", "onclick", "onmousedown",
    "onmouseup", "onmouseover", "onmousemove", "onmouseout", "onload"
];
export const presentationAttributes = [
    "alignment-baseline", "baseline-shift", "clip", "clip-path", "clip-rule",
    "color", "color-interpolation", "color-interpolation-filters", 
    "color-profile", "color-rendering", "cursor", "direction", "display", 
    "dominant-baseline", "enable-background", "fill", "fill-opacity", 
    "fill-rule", "filter", "flood-color", "flood-opacity", "font-family", 
    "font-size", "font-size-adjust", "font-stretch", "font-style", 
    "font-variant", "font-weight", "glyph-orientation-horizontal", 
    "glyph-orientation-vertical", "image-rendering", "kerning", 
    "letter-spacing", "lighting-color", "marker-end", "marker-mid", 
    "marker-start", "mask", "opacity", "overflow", "pointer-events", 
    "shape-rendering", "stop-color", "stop-opacity", "stroke", 
    "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", 
    "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", 
    "text-anchor", "text-decoration", "text-rendering", "unicode-bidi", 
    "visibility", "word-spacing", "writing-mode"
];
export const xlinkAttributes = [
    "xlink:href", "xlink:show", "xlink:actuate", "xlink:type", "xlink:role",
    "xlink:arcrole", "xlink:title"
];

export const textContentChildElements = [ "altGlyph", "textPath", "tref", "tspan" ];

export const animationElements = [
    "animate", "animateColor", "animateMotion", "animateTransform", "set"
];

export const descriptiveElements = [ "desc", "metadata", "title" ];

export const shapeElements = [
    "circle", "ellipse", "line", "path", "polygon", "polyline", "rect"
];
export const structuralElements = [ "defs", "g", "svg", "symbol", "use" ];
export const gradientElements = [ "linearGradient", "radialGradient" ];

function getAttribute(elem, attrib) {
    var value = elem.getAttribute(attrib);
    for (var i = 2;i < arguments.length;i++) {
        value = arguments[i](value);
    }
    return value;
}

function getAttributeOrStyle(elem, attribName, cssStyles, styleName) {
    return elem.getAttribute(attribName) || cssStyles[styleName];
}

/**
 * Processing of different kinds of attributes.
 */
function parseCSSStyles(value) {
    var out = {};
    if (value && value != null) {
        var values = value.split(";");
        values.forEach(function(elem) {
            if (elem.trim().length > 0) {
                var kvpair = elem.split(":");
                if (kvpair.length >= 2) {
                    var key = kvpair[0].trim();
                    var value = kvpair[1].trim();
                    if (key.length > 0) {
                        out[key] = value;
                    }
                }
            }
        });
    }
    return out;
}

function parseList(value, delimiter) {
    var out = [];
    var values = (value || "").split(delimiter);
    values.forEach(function(v) {
        v = v.trim();
        if (v.length > 0) {
            out.push(v);
        }
    });
    return out;
}

export class NodeProcessor {
    constructor(loader) {
        this.loader = loader;
    }

    get configs() {
        return this.loader.configs;
    }

    get hasStyles() { return false; }
    get hasTransforms() { return false; }

    get validChildren() {
        return [];
    }

    get validAttributes() {
        return [];
    }

    getLength(elem, attrib) {
        return Length.parse(elem.getAttribute(attrib) || 0);
    }

    processChildrenOf(elem, parent) {
        var loader = this.loader;
        forEachChild(elem, function(child, index) {
            loader.processElement(child, parent);
        });
    }

    processElement(elem, shape) {
        if (this.hasStyles) this.processStyleAttributes(elem, shape);
        if (this.hasTransforms) this.processTransformAttributes(elem, shape);
    }

    /**
     * Processing of different kinds of attributes.
     */
    processStyleAttributes(elem, shape) {
        var cssStyles = parseCSSStyles(elem.getAttribute("style"));
        shape.fillRule = getAttributeOrStyle(elem, "fill-rule", cssStyles, "fill-rule");
        shape.fillOpacity = getAttributeOrStyle(elem, "fill-opacity", cssStyles, "fill-opacity");
        shape.fillStyle = this.processUrl(shape, getAttributeOrStyle(elem, "fill", cssStyles, "fill"));
        shape.strokeStyle = this.processUrl(shape, getAttributeOrStyle(elem, "stroke", cssStyles, "stroke"));
        shape.lineWidth = this.processUrl(shape, getAttributeOrStyle(elem, "stroke-width", cssStyles, "stroke-width"));
        shape.lineCap = getAttributeOrStyle(elem, "stroke-linecap", cssStyles, "stroke-linecap");
        shape.lineJoin = getAttributeOrStyle(elem, "stroke-linejoin", cssStyles, "stroke-linejoin");
        shape.miterLimit = elem.getAttribute("stroke-miterlimit");
        shape.strokeOpacity = getAttributeOrStyle(elem, "stroke-opacity", cssStyles, "stroke-opacity");
        shape.dashArray = parseList(elem.getAttribute("stroke-dasharray"), ",").map(parseFloat);
        shape.dashOffset = elem.getAttribute("stroke-dashoffset");
        return shape;
    }

    processUrl(shape, value) {
        if (value == null) return value;
        value = value.trim();
        if (!value.startsWith("url(")) {
            return value;
        }

        value = value.substring(4);
        if (value.endsWith(")")) {
            value = value.substring(0, value.length - 1);
        }

        return this.getRef(shape, value);
    }

    getRef(shape, value) {
        // Look for a definition to use
        var id = value;
        if (!id.startsWith("#")) {
            throw new Error("ID Must begin with #");
        }
        id = id.substring(1);
        var target = shape.getDef(id);
        if (target == null) {
            throw new Error("Cannot find item referenced by : " + id);
        }
        return target;
    }

    processMetaAttributes(elem, shape) {
        if (elem.hasAttribute("version")) {
            shape.setMiscData("version", elem.getAttribute("version"));
        }
        if (elem.hasAttribute("baseProfile")) {
            shape.setMiscData("baseProfile", elem.getAttribute("baseProfile"));
        }
    }

    processBoundsAttributes(elem, bounds) {
        if (elem.hasAttribute("x")) {
            bounds.x = elem.getAttribute("x");
        }
        if (elem.hasAttribute("y")) {
            bounds.y = elem.getAttribute("y");
        }
        if (elem.hasAttribute("width")) {
            bounds.width = elem.getAttribute("width");
        }
        if (elem.hasAttribute("height")) {
            bounds.height = elem.getAttribute("height");
        }
    }

    processTransformAttributes(elem, shape, attribName) {
        var attribName = attribName || "transform";
        var attribValue = elem.getAttribute("transform");
        if (attribValue) {
            var parser = new TransformParser(attribValue);
            while (parser.hasNext()) {
                var command = parser.next();
                if (command.name == "matrix") {
                    shape.transform.apply(shape, command.args);
                } else {
                    shape[command.name].apply(shape, command.args);
                }
            }
        }
    }

    ensureAttribute(elem, attrib) {
        var value = elem.getAttribute(attrib) || null;
        if (value == null) {
            throw new ("Element MUST have ID");
        }
        return value;
    }
}
