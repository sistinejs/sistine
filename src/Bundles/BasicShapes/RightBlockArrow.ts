
import * as rightArrows from "./RightArrow"

function sanitizeConfigs(configs? : any) {
    configs = configs || {};
    configs.shaftWidth = 1.0;
    return configs;
}

export class RightBlockArrow extends rightArrows.RightArrow {
    constructor(configs? : any) {
        super((configs = sanitizeConfigs(configs)));
    }
}

