
import * as corebase from "../Core/base"
import * as geom from "../Geom/models"
import * as svgutils from "../Utils/svg"
import * as models from "./models"
import { Nodes } from "./nodes"
import { Nullable } from "../Core/types"

const Bounds = geom.Bounds;

let elementProcessors : { [key: string]: string } = {
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
    "SVGTestCase": "IgnoreNodeProcessor"
};

/**
 * Utilities to load shapes from a URL or an input stream.
 */
 export function loadFromURL(url : string, configs : any,
                             callback : (shape : Nullable<models.SVG>, element : HTMLElement) => void) : void {
    url = url.trim();
    var startTime = Date.now();
    var loader = new SVGLoader(configs);
    $.get(url, function(data : any) {
        var result = loader.processRootElement(data.rootElement);
        var loadTime = Date.now() - startTime;
        console.log("Element loaded in: ", loadTime);
        callback(result, data.rootElement);
    }).fail(function() {
        console.log("Error parsing SVG: ", arguments);
    });
}

export function loadFromString(input : string, configs : any = null) : Nullable<models.SVG> {
    return null;
}

export class SVGLoader {
    private configs : any = {}
    constructor(configs : any) {
        this.configs = configs || {};
        configs.bounds = configs.bounds || new Bounds(50, 50, 100, 100);
    }

    processRootElement(root : any) : Nullable<models.SVG> {
        return null;
    }

    processElement(root : any, parent : Nullable<corebase.Element>) : Nullable<corebase.Element> {
        // Find the right "converter" for the root object
        var processor = this.getProcessor(root.tagName);
        if (processor == null) {
            console.log("Cannot find processor for node: ", root.tagName);
            return null;
        } else {
            return processor.processElement(root, parent);
        }
    }

    getProcessor(name : string) {
        if (name.startsWith("inkscape:") ||
            name.startsWith("metadata") ||
            name.startsWith("sodipodi:")) return null;
        if (name.endsWith("SVGTestCase") ||
            name.endsWith(":SVGTestCase")) return null;

        var name = name.replace("svg:", "").trim();
        var procName = elementProcessors[name] as string;
        var processorClass = Nodes[procName];
        return new processorClass(this);
    }
}

function defaultZero(value : any) {
    return value || 0;
}

function ensurePositive(value : any) {
    if (value < 0) {
        throw new Error("Value must be positive: " + value);
    }
    return value;
}

function ensurePositiveLength(length : geom.Length) {
    if (length.value < 0) {
        throw new Error("Value must be positive: " + length);
    }
    return length;
}
