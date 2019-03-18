
import * as geom from "../Core/geom"
import * as rightArrows from "./RightArrow"

export function newShape(configs) {
    configs = configs || {};
    configs.shaftWidth = 1.0;
    configs._name = configs._name || "RightBlockArrow";
    return new rightArrows.RightArrowShape(configs);
}

export function newShapeForToolbar(x, y, width, height, configs) {
    configs = configs || {};
    y += height / 4;
    height *= 0.6;
    configs.p1 = new geom.Point(x, y);
    configs.p2 = new geom.Point(x + width, y + height);
    return newShape(configs);
}

