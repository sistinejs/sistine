
import * as core from "../core"
import * as leftArrows from "./LeftArrow"

export function newShape(configs) {
    configs = configs || {};
    configs.shaftWidth = 1.0;
    return new leftArrows.LeftArrowShape(configs);
}

export function newShapeForToolbar(configs) {
    configs.y = configs.height / 4;
    configs.height *= 0.6;
    return newShape(configs);
}

