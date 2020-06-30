
import * as base from "./base"
import { Path } from "../../Core/paths"
import * as layouts from "../layouts"
import { Nullable } from "../../Core/types"
import { Element } from "../../Core/base"
import { PathDataParser } from "../../Utils/svg"

export class PathNodeProcessor extends base.NodeProcessor {
    validChildren() {
        return base.animationElements.concat(base.descriptiveElements);
    }

    validAttributes() {
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
            var command : any = p.next();
            if (command == null) break;
            if (!(command.name in funcs)) {
                throw new Error("Invalid path function: " + command.name);
            }
            var func = (funcs as any)[command.name] as string;
            (shape as any)[func].apply(shape, command.args);
        }
    }
}
