
import * as base from "./base"

export class TitleNodeProcessor extends base.NodeProcessor {
    get validChildren() {
        return "*";
    }

    get validAttributes() {
        return base.coreAttributes.concat([ "class", "style"]);
    }

    processElement(elem, item) {
        item.addTitle(elem);
    }
}

export class DescNodeProcessor extends base.NodeProcessor {
    get validChildren() {
        return "*";
    }

    get validAttributes() {
        return base.coreAttributes.concat([ "class", "style"]);
    }

    processElement(elem, item) {
        item.addDescription(elem);
    }
}
