
import * as base from "./base"
import { Core } from "../../Core/index"
import { Utils } from "../../Utils/index"
import { Builtins } from "../../Builtins/index"
import { Int, Nullable, Element } from "../../Core/base"
import { NumbersTokenizer, PathDataParser, TransformParser } from "../../Utils/svg"
import { Point, Length, Bounds } from "../../Geom/models"
import { Path } from "../../Core/paths"

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

    processElement(elem : HTMLElement, parent : Nullable<Element>) : Nullable<Element> {
        var newPath = new Path();
        if (parent != null) parent.add(newPath);
        super.processElement(elem, newPath);
        this.processPathDataAttributes(elem, newPath);
        return newPath;
    }

    processPathDataAttributes(elem : HTMLElement, shape : Element) {
        var attrib = elem.getAttribute("d");
        var path = shape as Path;
        var funcs = {
            "closePath": "closePath",
            "moveTo": "moveTo",
            "lineTo": "lineTo",
            "hlineTo": "hlineTo",
            "vlineTo": "vlineTo",
            "arcTo": "svgArcTo",
            "quadCurve": "quadCurveTo",
            "cubicCurve": "bezierCurveTo",
            "smoothQuadCurve": "smoothQuadCurveTo",
            "smoothCubicCurve": "smoothBezierCurveTo",
        }
        if (!attrib) return ;
        var p = new PathDataParser(attrib);
        while (p.hasNext()) {
            var command = p.next();
            var func = funcs[command.name] as string;
            shape[func].apply(shape, command.args);
        }
    }
}
