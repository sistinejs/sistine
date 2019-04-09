
import { Core } from "../../Core/index"
import { Geom } from "../../Geom/index"
import { Utils } from "../../Utils/index"
import * as parser from "../parser"
import * as base from "./base"

const Bounds = Geom.Models.Bounds;
const NumbersTokenizer = parser.NumbersTokenizer;
const PathDataParser = parser.PathDataParser;
const TransformParser = parser.TransformParser;
const Length = Geom.Models.Length;
const Point = Geom.Models.Point;
const forEachChild = Utils.DOM.forEachChild;
const forEachAttribute = Utils.DOM.forEachAttribute;

export class PathNodeProcessor extends base.NodeProcessor {
    get validChildren() {
        return base.animationElements.concat(base.descriptiveElements);
    }

    get validAttributes() {
        return base.conditionalProcessingAttributes
                .concat(base.coreAttributes)
                .concat(base.graphicalEventAttributes)
                .concat(base.presentationAttributes)
                .concat([ "class", "style", "externalResourcesRequired",
                          "transform", "d", "pathLength"])
    }

    processElement(elem, parent) {
        var newPath = new Core.Path();
        this.processStyleAttributes(elem, newPath);
        this.processPathDataAttributes(elem, newPath);
        parent.add(newPath);
        return newPath;
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
