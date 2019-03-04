
import * as rightArrows from "./RightArrow"

export function newShape(configs) {
    configs = configs || {};
    configs.shaftWidth = 1.0;
    configs._name = configs._name || "RightBlockArrow";
    return new rightArrows.RightArrowShape(configs);
}

export function newShapeForToolbar(configs) {
    configs = configs || {};
    configs.y = configs.height / 4;
    configs.height *= 0.6;
    return newShape(configs);
}

