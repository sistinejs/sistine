
import { Core } from "../Core/index"
import { Geom } from "../Geom/index"
import { Utils } from "../Utils/index"
import { Builtins } from "../Builtins/index"
import * as svgutils from "../Utils/svg"
import * as models from "./models"
import { Nodes } from "./nodes"

const Bounds = Geom.Models.Bounds;
const NumbersTokenizer = svgutils.NumbersTokenizer;
const PathDataParser = svgutils.PathDataParser;
const TransformParser = svgutils.TransformParser;
const Point = Geom.Models.Point;
const forEachChild = Utils.DOM.forEachChild;
const forEachAttribute = Utils.DOM.forEachAttribute;

const elementProcessors = {
    "defs": "DefsNodeProcessor",
    "svg": "SVGNodeProcessor",
    "g": "GNodeProcessor",
    "rect": "RectNodeProcessor",
    "image": "ImageNodeProcessor",
    "circle": "CircleNodeProcessor",
    "ellipse": "EllipseNodeProcessor",
    "line": "LineNodeProcessor",
    "path": "PathNodeProcessor",
    "text": "TextNodeProcessor",
    "a": "ANodeProcessor",
    "tspan": "TSpanNodeProcessor",
    "title": "TitleNodeProcessor",
    "desc": "DescNodeProcessor",
    "use": "UseNodeProcessor",
    "symbol": "SymbolNodeProcessor",
    "linearGradient": "LinearGradientNodeProcessor",
    "radialGradient": "RadialGradientNodeProcessor",
    "pattern": "PatternNodeProcessor",
    "audio": "IgnoreNodeProcessor",
    "filter": "IgnoreNodeProcessor",
    "script": "IgnoreNodeProcessor",
    "font-face": "IgnoreNodeProcessor",
    "SVGTestCase": "IgnoreNodeProcessor",
}

/**
 * Utilities to load shapes from a URL or an input stream.
 */
export function loadFromURL(url, configs, callback) {
    url = url.trim();
    var startTime = Date.now();
    var loader = new SVGLoader(configs);
    $.get(url, function(data) {
        var result = loader.processElement(data.rootElement, null);
        result.loadTime = Date.now() - startTime;
        console.log("Element loaded in: ", result.loadTime);
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
        var processor = this.getProcessor(root.tagName);
        if (processor == null) {
            console.log("Cannot find processor for node: ", root.tagName);
        } else {
            return processor.processElement(root, parent);
        }
    }

    getProcessor(name) {
        if (name.startsWith("inkscape:") ||
            name.startsWith("metadata") ||
            name.startsWith("sodipodi:")) return null;
        if (name.endsWith("SVGTestCase") ||
            name.endsWith(":SVGTestCase")) return null;

        var name = name.replace("svg:", "").trim();
        var procName = elementProcessors[name];
        var processorClass = Nodes[procName];
        return new processorClass(this);
    }
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
