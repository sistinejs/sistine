
import { Geom } from "../Geom/index"
import { Core } from "../Core/index"
import { Utils } from "../Utils/index"
import { Bundles } from "../Bundles/index"

const PathTokenizer = Utils.SVG.PathTokenizer;
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

const animationElements = [ "animate", "animateColor", "animateMotion", "animateTransform", "set" ];
const descriptiveElements = [ "desc", "metadata", "title" ];
const shapeElements = [ "circle", "ellipse", "line", "path", "polygon", "polyline", "rect" ];
const structuralElements = [ "defs", "g", "svg", "symbol", "use" ];
const gradientElements = [ "linearGradient", "radialGradient" ];
const elementProcessors = {
    "svg": { "method": processSVGElement,
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
    "path": { "method": processPathElement,
             "validChildren": animationElements
                                .concat(descriptiveElements),
             "validAttributes": conditionalProcessingAttributes
                                    .concat(coreAttributes)
                                    .concat(graphicalEventAttributes)
                                    .concat(presentationAttributes)
                                    .concat([ "class", "style", "externalResourcesRequired", "transform", "d", "pathLength"])
    },
    "circle": { "method": processCircleElement,
             "validChildren": animationElements
                                .concat(descriptiveElements),
             "validAttributes": conditionalProcessingAttributes
                                    .concat(coreAttributes)
                                    .concat(graphicalEventAttributes)
                                    .concat(presentationAttributes)
                                    .concat([ "class", "style", "externalResourcesRequired",
                                              "transform", "cx", "cy", "r"])
    },
    "rect": { "method": processRectElement,
             "validChildren": animationElements
                                .concat(descriptiveElements),
             "validAttributes": conditionalProcessingAttributes
                                    .concat(coreAttributes)
                                    .concat(graphicalEventAttributes)
                                    .concat(presentationAttributes)
                                    .concat([ "class", "style", "externalResourcesRequired",
                                              "transform", "x", "y", "rx", "ry", "width", "height"])
    }
}

/**
 * Utilities to load shapes from a URL or an input stream.
 */
export function loadFromURL(url, callback) {
    url = url.trim();
    $.get(url, function(data) {
         // var svgDoc = $.processXML(data);
        var result = processElement(data.rootElement, null);
        callback(result);
    });
}

export function loadFromString(input) {
}

export function processElement(root, parent) {
    // Find the right "converter" for the root object
    var name = root.tagName.replace("svg:", "").trim();
    var processor = elementProcessors[name]
    var method = processor.method;
    return method(root, parent);
}

function processSVGElement(elem, parent) {
    var out = new Core.Models.Group();
    var bounds = new Bounds();
    forEachAttribute(elem, function(attrib, value) {
        if (attrib === "x") {
            bounds.x = parseFloat(value);
        } else if (attrib === "y") {
            bounds.y = parseFloat(value);
        } else if (attrib === "width") {
            bounds.width = parseFloat(value);
        } else if (attrib === "height") {
            bounds.height = parseFloat(value);
        } else if (attrib === "version") {
            out.setMetaData("version", value);
        } else if (attrib === "baseProfile") {
            out.setMetaData("baseProfile", value);
        } else if ([ "xmlns", "viewBox" ].indexOf(attrib) >= 0) {
                // ignore list
            console.log("Ingoring attribute: ", attrib, " = ", value);
        } else {
            throw new Error("Cannot process attribute: ", attrib);
        }
    });
    out.setBounds(bounds);
    forEachChild(elem, function(child, index) {
        processElement(child, out);
    });
    return out;
}

function processPathElement(elem, parent) {
    var d = getAttribute(elem, "d");
    // var comps = tokenizePathString(d);
    var tokenizer = new PathTokenizer(d);
    var newPath = new Core.Path();
    while (tokenizer.hasNext()) {
        var command = tokenizer.ensureToken("COMMAND");
        console.log("Found command: ", command);
        var isRelative = command.isRelative || false;
        var isSmooth = command.isSmooth || false;
        if (command.name == "closePath") {
            newPath.closePath();
        } else if (command.name == "moveTo") {
            var point = tokenizer.ensurePoint();
            newPath.moveTo(point.x, point.y, isRelative);
            // Subsequent numbers are lineTo commands
            while (tokenizer.peekType() == "NUMBER") {
                point = tokenizer.ensurePoint();
                newPath.lineTo(point.x, point.y, isRelative);
            }
        } else if (command.name == "lineTo") {
            while (true) {
                var point = tokenizer.ensurePoint();
                newPath.lineTo(point.x, point.y, isRelative);
                if (tokenizer.peekType() != "NUMBER") break ;
            }
        } else if (command.name == "hlineTo") {
            while (true) {
                var newval = tokenizer.ensureNumber();
                newPath.hlineTo(newval, isRelative);
                if (tokenizer.peekType() != "NUMBER") break ;
            }
        } else if (command.name == "vlineTo") {
            while (true) {
                var newval = tokenizer.ensureNumber();
                newPath.vlineTo(newval, isRelative);
                if (tokenizer.peekType() != "NUMBER") break ;
            }
        } else if (command.name == "quadCurve") {
            while (true) {
                var x1 = tokenizer.ensureNumber();
                var y1 = tokenizer.ensureNumber();
                var x2 = tokenizer.ensureNumber();
                var y2 = tokenizer.ensureNumber();
                newPath.quadraticCurveTo(x1, y1, x2, y2, isRelative, isSmooth);
                if (tokenizer.peekType() != "NUMBER") break ;
            }
        } else if (command.name == "cubicCurve") {
            while (true) {
                var x1 = tokenizer.ensureNumber();
                var y1 = tokenizer.ensureNumber();
                var x2 = tokenizer.ensureNumber();
                var y2 = tokenizer.ensureNumber();
                var x3 = tokenizer.ensureNumber();
                var y3 = tokenizer.ensureNumber();
                newPath.bezierCurveTo(x1, y1, x2, y2, x3, y3, isRelative, isSmooth);
                if (tokenizer.peekType() != "NUMBER") break ;
            }
        } else {
            throw new Error("Command not implemented: ", command);
            if (command.name == "arcTo") {
            }
        }
    }
    parent.add(newPath);
    return newPath;
}

function processCircleElement(elem, parent) {
    var configs = {};
    var value = 
    configs.cx = elem.getAttribute("cx") || 0;
    configs.cy = elem.getAttribute("cy") || 0;
    configs.radius = elem.getAttribute("r");
    var out = new Builtins.Circle(configs);
    parent.add(out);
    return out;
}

function processRectElement(elem, parent) {
    var configs = {};
    configs.cx = 
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

function processDefsElement(elem, parent) {
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
