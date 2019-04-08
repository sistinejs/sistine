
import { Core } from "../Core/index"
import { Geom } from "../Geom/index"
import { Utils } from "../Utils/index"
import { Bundles } from "../Bundles/index"
import * as parser from "./parser"
import * as models from "./models"

const NumbersTokenizer = parser.NumbersTokenizer;
const PathDataParser = parser.PathDataParser;
const TransformParser = parser.TransformParser;
const Builtins = Bundles.Builtins;
const Bounds = Geom.Models.Bounds;
const Length = Geom.Models.Length;
const Point = Geom.Models.Point;
const forEachChild = Utils.DOM.forEachChild;
const forEachAttribute = Utils.DOM.forEachAttribute;

const conditionalProcessingAttributes = [ "requiredFeatures", "requiredExtensions", "systemLanguage" ];
const coreAttributes = [ "id", "xml:base", "xml:lang", "xml:space" ]
const documentEventAttributes = [ "onunload", "onabort", "onerror", "onresize", "onscroll", "onzoom" ];
const graphicalEventAttributes = [ "onfocusin", "onfocusout", "onactivate", "onclick", "onmousedown",
                                   "onmouseup", "onmouseover", "onmousemove", "onmouseout", "onload" ];
const presentationAttributes = [ "alignment-baseline", "baseline-shift", "clip", "clip-path", "clip-rule",
                                 "color", "color-interpolation", "color-interpolation-filters", "color-profile",
                                 "color-rendering", "cursor", "direction", "display", "dominant-baseline",
                                 "enable-background", "fill", "fill-opacity", "fill-rule", "filter", "flood-color",
                                 "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch",
                                 "font-style", "font-variant", "font-weight", "glyph-orientation-horizontal",
                                 "glyph-orientation-vertical", "image-rendering", "kerning", "letter-spacing",
                                 "lighting-color", "marker-end", "marker-mid", "marker-start", "mask", "opacity",
                                 "overflow", "pointer-events", "shape-rendering", "stop-color", "stop-opacity",
                                 "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin",
                                 "stroke-miterlimit", "stroke-opacity", "stroke-width", "text-anchor", "text-decoration",
                                 "text-rendering", "unicode-bidi", "visibility", "word-spacing", "writing-mode" ];

const textContentChildElements = [ "altGlyph", "textPath", "tref", "tspan" ];
const animationElements = [ "animate", "animateColor", "animateMotion", "animateTransform", "set" ];
const descriptiveElements = [ "desc", "metadata", "title" ];
const shapeElements = [ "circle", "ellipse", "line", "path", "polygon", "polyline", "rect" ];
const structuralElements = [ "defs", "g", "svg", "symbol", "use" ];
const gradientElements = [ "linearGradient", "radialGradient" ];
const elementProcessors = {
    "svg": { "method": "processSVGElement",
             "validChildren": animationElements
                                .concat(descriptiveElements)
                                .concat(shapeElements)
                                .concat(structuralElements)
                                .concat(gradientElements)
                                .concat(["a", "altGlyphDef", "clipPath", "color-profile",
                                         "cursor", "filter", "font", "font-face", "foreignObject",
                                         "image", "marker", "mask", "pattern", "script", "style",
                                         "switch", "text", "view" ]),
             "validAttributes": conditionalProcessingAttributes
                                    .concat(coreAttributes).concat(documentEventAttributes)
                                    .concat(graphicalEventAttributes)
                                    .concat(presentationAttributes)
                                    .concat([ "class", "style", "externalResourcesRequired", "x", "y",
                                              "width", "height", "viewBox", "preserveAspectRatio",
                                              "zoomAndPan", "version", "baseProfile", "contentScriptType",
                                              "contentStyleType", "version", "baseProfile" ])
    },
    "g": { "method": "processGElement",
             "validChildren": animationElements
                                .concat(descriptiveElements)
                                .concat(shapeElements)
                                .concat(structuralElements)
                                .concat(gradientElements)
                                .concat(["a", "altGlyphDef", "clipPath", "color-profile",
                                         "cursor", "filter", "font", "font-face", "foreignObject",
                                         "image", "marker", "mask", "pattern", "script", "style",
                                         "switch", "text", "view" ]),
             "validAttributes": conditionalProcessingAttributes
                                    .concat(coreAttributes)
                                    .concat(graphicalEventAttributes)
                                    .concat(presentationAttributes)
                                    .concat([ "class", "style", "externalResourcesRequired", "transform" ])
    },
    "path": { "method": "processPathElement",
             "validChildren": animationElements
                                .concat(descriptiveElements),
             "validAttributes": conditionalProcessingAttributes
                                    .concat(coreAttributes)
                                    .concat(graphicalEventAttributes)
                                    .concat(presentationAttributes)
                                    .concat([ "class", "style", "externalResourcesRequired", "transform", "d", "pathLength"])
    },
    "circle": { "method": "processCircleElement",
             "validChildren": animationElements
                                .concat(descriptiveElements),
             "validAttributes": conditionalProcessingAttributes
                                    .concat(coreAttributes)
                                    .concat(graphicalEventAttributes)
                                    .concat(presentationAttributes)
                                    .concat([ "class", "style", "externalResourcesRequired",
                                              "transform", "cx", "cy", "r"])
    },
    "rect": { "method": "processRectElement",
             "validChildren": animationElements
                                .concat(descriptiveElements),
             "validAttributes": conditionalProcessingAttributes
                                    .concat(coreAttributes)
                                    .concat(graphicalEventAttributes)
                                    .concat(presentationAttributes)
                                    .concat([ "class", "style", "externalResourcesRequired",
                                              "transform", "x", "y", "rx", "ry", "width", "height"])
    },
    "text": { "method": "processTextElement",
             "validChildren": animationElements
                                .concat(descriptiveElements)
                                .concat(textContentChildElements)
                                .concat(["a"]),
             "validAttributes": conditionalProcessingAttributes
                                    .concat(coreAttributes)
                                    .concat(graphicalEventAttributes)
                                    .concat(presentationAttributes)
                                    .concat([ "class", "style", "externalResourcesRequired", "transform",
                                              "lengthAdjust", "x", "y", "dx", "dy", "rotate", "textLength"])
    },
    "tspan": { "method": "processTSpanElement",
             "validChildren": descriptiveElements
                              .concat(["a", "altGlyph", "animate", "animateColor",
                                       "set", "tref", "tspan" ]),
             "validAttributes": conditionalProcessingAttributes
                                    .concat(coreAttributes)
                                    .concat(graphicalEventAttributes)
                                    .concat(presentationAttributes)
                                    .concat([ "class", "style", "externalResourcesRequired", "transform",
                                              "lengthAdjust", "x", "y", "dx", "dy", "rotate", "textLength"])
    },
}

/**
 * Utilities to load shapes from a URL or an input stream.
 */
export function loadFromURL(url, configs, callback) {
    url = url.trim();
    var loader = new SVGLoader(configs);
    $.get(url, function(data) {
         // var svgDoc = $.processXML(data);
        var result = loader.processElement(data.rootElement, null);
        callback(result, data.rootElement);
    }).fail(function() {
        console.log("Error parsing SVG: ", arguments);
    });
}

export function loadFromString(input, configs) {
}

export class SVGLoader {
    constructor(configs) {
        this.configs = configs || {};
        configs.bounds = configs.bounds || new Bounds(50, 50, 100, 100);
    }

    processElement(root, parent) {
        // Find the right "converter" for the root object
        var name = root.tagName.replace("svg:", "").trim();
        var processor = elementProcessors[name]
        var method = processor.method;
        return this[method](root, parent);
    }

    processSVGElement(elem, parent) {
        var out = new models.SVG();
        var bounds = parent ? new Bounds() : this.configs.bounds.copy();
        var viewBox = null;
        this.processStyleAttributes(elem, out);
        this.processBoundsAttributes(elem, bounds);
        this.processTransformAttributes(elem, out);
        this.processMetaAttributes(elem, out);
        forEachAttribute(elem, function(attrib, value) {
            attrib = attrib.toLowerCase();
            if (attrib === "viewbox") {
                var value = value.split(" ");
                viewBox = new Bounds();
                viewBox.x = parseFloat(value[0]);
                viewBox.y = parseFloat(value[1]);
                viewBox.width = parseFloat(value[2]);
                viewBox.height = parseFloat(value[3]);
            } else if (attrib === "version") {
                out.setMetaData("version", value);
            } else if (attrib === "baseProfile") {
                out.setMetaData("baseProfile", value);
            } else if (attrib.startsWith("xmlns:") ||
                        [ "xmlns", "inkscape:version" ].indexOf(attrib) >= 0 ||
                       elementProcessors[elem.tagName].validAttributes.indexOf(attrib) >= 0) {
                    // ignore list
                console.log("Ingoring attribute: ", attrib, " = ", value);
            } else {
                throw new Error("Cannot process attribute: " + attrib);
            }
        });
        var self = this;
        forEachChild(elem, function(child, index) {
            self.processElement(child, out);
        });
        out.setBounds(bounds);
        out.viewBox = viewBox;
        return out;
    }

    processGElement(elem, parent) {
        var out = new Core.Models.Group();
        var bounds = parent ? new Bounds() : this.configs.bounds.copy();
        var viewBox = null;
        this.processStyleAttributes(elem, out);
        this.processBoundsAttributes(elem, bounds);
        this.processTransformAttributes(elem, out);
        this.processMetaAttributes(elem, out);
        forEachAttribute(elem, function(attrib, value) {
            if ([ "xmlns" ].indexOf(attrib) >= 0 ||
                elementProcessors[elem.tagName].validAttributes.indexOf(attrib) >= 0) {
                    // ignore list
                console.log("Ingoring attribute: ", attrib, " = ", value);
            } else {
                throw new Error("Cannot process attribute: " + attrib);
            }
        });
        var self = this;
        forEachChild(elem, function(child, index) {
            self.processElement(child, out);
        });
        out.setBounds(bounds);
        out.viewBox = viewBox;
        parent.add(out);
        return out;
    }

    processPathElement(elem, parent) {
        var newPath = new Core.Path();
        this.processStyleAttributes(elem, newPath);
        this.processPathDataAttributes(elem, newPath);
        parent.add(newPath);
        return newPath;
    }

    processCircleElement(elem, parent) {
        var configs = {};
        var value = 
        configs.cx = elem.getAttribute("cx") || 0;
        configs.cy = elem.getAttribute("cy") || 0;
        configs.radius = elem.getAttribute("r");
        var out = new Builtins.Circle(configs);
        this.processStyleAttributes(elem, out);
        parent.add(out);
        return out;
    }

    processRectElement(elem, parent) {
        var configs = {};
        configs.cx = elem.getAttribute("cx") || 0;
        configs.cy = elem.getAttribute("cy") || 0;
        configs.radius = elem.getAttribute("r");
        configs.x = elem.getAttribute("x") || 0;
        configs.y = elem.getAttribute("y") || 0;
        configs.rx = elem.getAttribute("rx") || 0;
        configs.ry = elem.getAttribute("ry") || 0;
        configs.width = elem.getAttribute("width");
        configs.height = elem.getAttribute("height");
        var out = new Builtins.Rectangle(configs);
        parent.add(out);
        return out;
    }

    processTextElement(elem, parent) {
        var text = new Core.Text();
        this.processStyleAttributes(elem, text);
        this.processTextAttributes(elem, text);
        parent.add(text);
    }

    processTSpanElement(elem, parent) {
        var text = new Core.Text();
        this.processStyleAttributes(elem, text);
        this.processTextAttributes(elem, text);
        parent.add(text);
    }

    processDefsElement(elem, parent) {
    }

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

    /**
     * Processing of different kinds of attributes.
     */
    processStyleAttributes(elem, shape) {
        shape.fillStyle = elem.getAttribute("fill");
        shape.fillRule = elem.getAttribute("fill-rule");
        shape.fillOpacity = elem.getAttribute("fill-opacity")
        shape.strokeStyle = elem.getAttribute("stroke");
        shape.lineWidth = elem.getAttribute("stroke-width");
        shape.lineCap = elem.getAttribute("stroke-linecap");
        shape.lineJoin = elem.getAttribute("stroke-linejoin");
        shape.miterLimit = elem.getAttribute("stroke-miterlimit");
        shape.strokeOpacity = elem.getAttribute("stroke-opacity");
        shape.dashArray = elem.getAttribute("stroke-dasharray");
        shape.dashOffset = elem.getAttribute("stroke-dashoffset");
        return shape;
    }

    processMetaAttributes(elem, shape) {
        if (elem.hasAttribute("version")) {
            shape.setMetaData("version", elem.getAttribute("version"));
        }
        if (elem.hasAttribute("baseProfile")) {
            shape.setMetaData("baseProfile", elem.getAttribute("baseProfile"));
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

    processTransformAttributes(elem, shape) {
        var attrib = elem.getAttribute("transform");
        if (attrib) {
            var parser = new TransformParser(attrib);
            while (parser.hasNext()) {
                var command = parser.next();
                shape[command.name].apply(shape, command.args);
            }
        }
    }

    processPathDataAttributes(elem, shape) {
        var attrib = elem.getAttribute("d");
        var funcs = {
            "closePath": "closePath",
            "moveTo": "moveTo",
            "lineTo": "lineTo",
            "hlineTo": "hlineTo",
            "vlineTo": "vlineTo",
            "arcTo": "svgArcTo",
            "quadCurve": "quadCurveTo",
            "cubicCurve": "bezierCurveTo",
        }
        if (!attrib) return ;
        var parser = new PathDataParser(attrib);
        while (parser.hasNext()) {
            var command = parser.next();
            var func = funcs[command.name];
            shape[func].apply(shape, command.args);
        }
    }
}

function getAttribute(elem, attrib) {
    var value = elem.getAttribute(attrib);
    for (var i = 2;i < arguments.length;i++) {
        value = arguments[i](value);
    }
    return value;
}

function defaultZero(value) {
    return value || 0;
}

function ensurePositive(value) {
    if (value < 0) {
        throw new Error("Value must be positive: ", value);
    }
    return value;
}

function ensurePositiveLength(length) {
    if (length.value < 0) {
        throw new Error("Value must be positive: ", length);
    }
    return length;
}
