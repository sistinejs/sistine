
import { Core } from "../../Core/index"
import { Geom } from "../../Geom/index"
import { Utils } from "../../Utils/index"
import * as base from "./base"
import * as layouts from "../layouts"

const Bounds = Geom.Models.Bounds;
const PathDataParser = Utils.SVG.PathDataParser;
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

    get hasStyles() { return true; }
    get hasTransforms() { return true; }

    processElement(elem, parent) {
        var newPath = new Core.Path();
        parent.add(newPath);
        super.processElement(elem, newPath);
        this.processPathDataAttributes(elem, newPath);
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
        var p = new PathDataParser(attrib);
        while (p.hasNext()) {
            var command = p.next();
            var func = funcs[command.name];
            shape[func].apply(shape, command.args);
        }
    }
}
