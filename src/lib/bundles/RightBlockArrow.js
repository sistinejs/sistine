
import * as core from "../core"
import * as rightArrows from "./RightArrow"

export function newShape(configs) {
    configs.shaftWidth = 1.0;
    return new rightArrows.RightArrowShape(configs);
}

export function newShapeForToolbar(configs) {
    configs.y = configs.height / 4;
    configs.height *= 0.6;
    return newShape(configs);
}

