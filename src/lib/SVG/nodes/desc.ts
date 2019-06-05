
import * as base from "./base"
import { Int, Nullable } from "../../Core/types"

export class TitleNodeProcessor extends base.NodeProcessor {
    validChildren() {
        return "*";
    }

    validAttributes() {
        return base.coreAttributes.concat([ "class", "style"]);
    }

    processElement(elem : HTMLElement, item: Nullable<Element>) : Nullable<Element> {
        item.addTitle(elem);
    }
}

export class DescNodeProcessor extends base.NodeProcessor {
    validChildren() {
        return "*";
    }

    validAttributes() {
        return base.coreAttributes.concat([ "class", "style"]);
    }

    processElement(elem : HTMLElement, item: Nullable<Element>) : Nullable<Element> {
        item.addDescription(elem);
    }
}
