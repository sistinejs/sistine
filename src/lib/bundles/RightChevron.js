
import * as rightArrows from "./RightArrow"

export function newShape(configs) {
    configs = configs || {};
    configs.backDepth = 0.2;
    configs.tipLength = 0.2;
    configs.shaftWidth = 1.0;
    return new rightArrows.RightArrowShape(configs);
}

export function newShapeForToolbar(configs) {
    configs = configs || {};
    configs.y = configs.height / 4;
    configs.backDepth = 0.2;
    configs.tipLength = 0.2;
    configs.height *= 0.6;
    return newShape(configs);
}

