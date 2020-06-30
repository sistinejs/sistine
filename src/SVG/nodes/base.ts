
import { forEachChild } from "../../Utils/dom"
import { Nullable } from "../../Core/types"
import { Element } from "../../Core/base"
import { Shape } from "../../Core/models"
import { SVGLoader } from "../loader"
import { Bounds, Length } from "../../Geom/models"
import { TransformParser } from "../../Utils/svg"

export const conditionalProcessingAttributes = [
    "requiredFeatures", "requiredExtensions", "systemLanguage"
];
export const coreAttributes = [
    "id", "xml:base", "xml:lang", "xml:space"
];
export const documentEventAttributes : string[] = [
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

export function getAttribute(elem : HTMLElement, attrib : string) {
    var value = elem.getAttribute(attrib);
    for (var i = 2;i < arguments.length;i++) {
        value = arguments[i](value);
    }
    return value;
}

export function getAttributeOrStyle(elem : HTMLElement, attribName : string, cssStyles : any, styleName : string) {
    return elem.getAttribute(attribName) || cssStyles[styleName];
}

/**
 * Processing of different kinds of attributes.
 */
function parseCSSStyles(value : string) {
    var out : any = {};
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

function parseList(value : string | null, delimiter : string) {
    if (value == null) return [];
    var out : string[] = [];
    var values = (value || "").split(delimiter);
    values.forEach(function(v : string) {
        v = v.trim();
        if (v.length > 0) {
            out.push(v);
        }
    });
    return out;
}

export class NodeProcessor {
    loader : any;
    constructor(loader : SVGLoader) {
        this.loader = loader;
    }

    get configs() {
        return this.loader.configs;
    }

    get hasStyles() { return false; }
    get hasTransforms() { return false; }

    validChildren()  : Array<string> {
        return [];
    }

    validAttributes() : Array<string> {
        return [];
    }

    getLength(elem : HTMLElement, attrib : string) {
        return Length.parse(elem.getAttribute(attrib) || 0);
    }

    processChildrenOf(elem : HTMLElement, parent : Element) {
        var loader = this.loader;
        forEachChild(elem, function(child, index) {
            loader.processElement(child, parent);
        });
    }

    processElement(elem : HTMLElement, shape : Nullable<Element>) : Nullable<Element> {
        if (this.hasStyles) this.processStyleAttributes(elem, shape);
        if (this.hasTransforms) this.processTransformAttributes(elem, shape);
        return shape;
    }

    /**
     * Processing of different kinds of attributes.
     */
    processStyleAttributes(elem : HTMLElement, element : Nullable<Element>) {
        var attrib = elem.getAttribute("style");
        var cssStyles = parseCSSStyles(attrib as string);
        var shape = element as Shape;
        shape.fillRule = getAttributeOrStyle(elem, "fill-rule", cssStyles, "fill-rule");
        shape.fillOpacity = getAttributeOrStyle(elem, "fill-opacity", cssStyles, "fill-opacity");
        shape.setFillStyle(this.processUrl(shape, getAttributeOrStyle(elem, "fill", cssStyles, "fill")));
        shape.setStrokeStyle(this.processUrl(shape, getAttributeOrStyle(elem, "stroke", cssStyles, "stroke")));
        shape.setLineWidth(getAttributeOrStyle(elem, "stroke-width", cssStyles, "stroke-width"));
        shape.lineCap = getAttributeOrStyle(elem, "stroke-linecap", cssStyles, "stroke-linecap");
        shape.lineJoin = getAttributeOrStyle(elem, "stroke-linejoin", cssStyles, "stroke-linejoin");
        shape.miterLimit = parseFloat(elem.getAttribute("stroke-miterlimit") as string);
        shape.strokeOpacity = getAttributeOrStyle(elem, "stroke-opacity", cssStyles, "stroke-opacity");
        shape.dashArray = parseList(elem.getAttribute("stroke-dasharray"), ",").map(parseFloat);

        var dashOffset = elem.getAttribute("stroke-dashoffset");
        if (dashOffset != null) {
            shape.dashOffset = parseFloat(dashOffset);
        }
        return shape;
    }

    processUrl(shape : Element, value : string)  {
        if (value == null) return value;
        value = value.trim();
        if (!value.startsWith("url(")) {
            return value;
        }

        value = value.substring(4);
        var cbIndex = value.indexOf(")");
        if (cbIndex >= 0) {
            value = value.substring(0, cbIndex);
        }

        return this.getRef(shape, value);
    }

    getRef(shape : Element, value : string) {
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

    processMetaAttributes(elem : HTMLElement, shape : Element) {
        if (elem.hasAttribute("version")) {
            shape.setMetaData("version", elem.getAttribute("version"));
        }
        if (elem.hasAttribute("baseProfile")) {
            shape.setMetaData("baseProfile", elem.getAttribute("baseProfile"));
        }
    }

    processBoundsAttributes(elem : HTMLElement, bounds : Bounds) {
        if (elem.hasAttribute("x")) {
            bounds.x = parseFloat(elem.getAttribute("x") as string);
        }
        if (elem.hasAttribute("y")) {
            bounds.y = parseFloat(elem.getAttribute("y") as string);
        }
        if (elem.hasAttribute("width")) {
            bounds.width = parseFloat(elem.getAttribute("width") as string);
        }
        if (elem.hasAttribute("height")) {
            bounds.height = parseFloat(elem.getAttribute("height") as string);
        }
    }

    processTransformAttributes(elem : HTMLElement, shape : Nullable<Element>, attribName : string = "transform") {
        var attribValue = elem.getAttribute(attribName);
        if (attribValue) {
            var p = new TransformParser(attribValue);
            while (p.hasNext()) {
                var command = p.next();
                if (command != null) {
                    if (command.name == "matrix") {
                        (shape as Shape).transform.apply(shape, command.args);
                    } else {
                        (shape as any)[command.name].apply(shape, command.args);
                    }
                }
            }
        }
    }

    ensureAttribute(elem : HTMLElement, attrib : string) {
        var value = elem.getAttribute(attrib) || null;
        if (value == null) {
            throw new Error("Element MUST have ID");
        }
        return value;
    }
}
