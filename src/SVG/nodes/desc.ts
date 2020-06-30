
import * as base from "./base"
import { Int, Nullable } from "../../Core/types"
import { Element } from "../../Core/base"

export class TitleNodeProcessor extends base.NodeProcessor {
    validChildren() {
        return ["*"];
    }

    validAttributes() {
        return base.coreAttributes.concat([ "class", "style"]);
    }

    processElement(elem : HTMLElement, item: Nullable<Element>) : Nullable<Element> {
        if (item != null) item.setMetaData("svg:title", elem);
        return item;
    }
}

export class DescNodeProcessor extends base.NodeProcessor {
    validChildren() {
        return ["*"];
    }

    validAttributes() {
        return base.coreAttributes.concat([ "class", "style"]);
    }

    processElement(elem : HTMLElement, item: Nullable<Element>) : Nullable<Element> {
        if (item != null) item.setMetaData("svg:description", elem);
        return item;
    }
}
