
import * as rightArrows from "./RightArrow"

function sanitizeConfigs(configs) {
    configs = configs || {};
    configs.shaftWidth = 1.0;
    return configs;
}

export class RightBlockArrow extends rightArrows.RightArrow {
    constructor(configs) {
        super((configs = sanitizeConfigs(configs)));
    }
}

