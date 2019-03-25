
import { Geom } from "../Geom/index"
import { Core } from "../Core/index"
import { Utils } from "../Utils/index"
import { Bundles } from "../Bundles/index"

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

class PathTokenizer {
    constructor(input) {
        this._input = input;
        this._comps = input.split(/([MmLlHhZzvVcCsSQqTtAa \n\t\r,Ee\.\-])/g);
        this._pos = 0;
        this.L = this._comps.length;
        this._currToken = null;
    }

    _skipSpaces() { 
        while (this._pos < this.L) {
            var c = this._input[this._pos];
            if (",\n\r\t ".indexOf(c) < 0) break ;
            this._pos++;
        }
    }
    _readDigits() {
        var out = "";
        while (this._pos < this.L) {
            var c = this._input[this._pos];
            if ("0123456789".indexOf(c) < 0) break;
            out += c;
            this._pos ++;
        }
        return out;
    }

    _currch() {
        if (this._pos < this.L) {
            return this._input[this._pos];
        }
        return null;
    }

    peek() {
        while (this._currToken == null) {
            this._skipSpaces();
            var c = this._currch();
            if (c == null) {
                break ;
            }
            else if ("MmLlHhZzvVcCsSQqTtAa".indexOf(c) >= 0) {
                this._currToken = c;
                this._pos++;
            } else {
                // parse number
                /**
                    number:
                        sign? integer-constant
                        | sign? floating-point-constant
                    integer-constant:   digit-sequence
                    floating-point-constant:
                        fractional-constant exponent?
                        | digit-sequence exponent
                    fractional-constant:
                        digit-sequence? "." digit-sequence
                        | digit-sequence "."
                    exponent: ( "e" | "E" ) sign? digit-sequence
                    sign: "+" | "-"
                    digit-sequence: [0-9]+
                  */
                var out = "";
                var isFloat = false;
                if (c == "-") {
                    out += c;
                    this._pos++;
                    this._skipSpaces();
                }

                // get all digits if we can
                out += this._readDigits();
                if (this._currch() == ".") {
                    this._pos++;
                    out += ".";
                    isFloat = true;
                }
                out += this._readDigits();

                // read the exponent
                var c = this._currch();
                if (c == "e" || c == "E") {
                    out += c;
                    this._pos++;
                    if (this._currch() == "-") {
                        this._pos++;
                        out += "-";
                    }
                    out += this._readDigits();
                    isFloat = true;
                }
                this._currToken = isFloat ? parseFloat(out) : parseInt(out);
            }
        }
        return this._currToken;
    }

    next() {
        var out = this.peek();
        this._currToken = null;
        return out;
    }

    hasNext() {
        this.peek();
        return this._currToken != null;
    }

    all() {
        var out = [];
        while (this.hasNext()) {
            out.push(this.next());
        }
        return out;
    }
}

function tokenizePathString(d) {
    var comps = d.split(/([MmLlHhZzvVcCsSQqTtAa \n\t\r,\-])/g);
    console.log("Comps: ", comps);
    for (var i = comps.length - 1;i >= 0;i--) {
        var c = comps[i];
        if (c == "" || c == "," || c == "\n" || c == "\r" || c == "\t") {
            // remove spaces
            comps.splice(i, 1);
        } else if (c == "-") {
            comps.splice(i, 1);
            comps[i] = "-" + comps[i];
        } else if (c.endsWith("e") || c.endsWith("E")) {
            comps[i] = comps[i] + comps[i + 1];
            comps.splice(i + 1, 1);
        } else if (c.length == 1 && "MmLlHhZzvVcCsSQqTtAa".indexOf(c) >= 0) {
            // command do nothing
        }
    }
    return comps;
}

function processPathElement(elem, parent) {
    var d = getAttribute(elem, "d");
    // var comps = tokenizePathString(d);
    var tokenizer = new PathTokenizer(d);
    var tokens = tokenizer.all();
    while (tokenizer.hasNext()) {
    }
    for (var i = 0;i < comps.length;) {
        var c = comps[i++];
        if (c == "M") {
        }
    }
    var out = new Builtins.Path();
    parent.add(out);
    return out;
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
