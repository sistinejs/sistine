import { Bounds } from "../../Geom/models";
import { Group } from "../../Core/models";
import * as base from "./base";
import { Element } from "../../Core/base";
import { Nullable } from "../../Core/types";

export class UseNodeProcessor extends base.NodeProcessor {
  validChildren() {
    return base.animationElements.concat(base.descriptiveElements);
  }

  validAttributes() {
    return base.conditionalProcessingAttributes
      .concat(base.coreAttributes)
      .concat(base.graphicalEventAttributes)
      .concat(base.presentationAttributes)
      .concat(base.xlinkAttributes)
      .concat([
        "class",
        "style",
        "externalResourcesRequired",
        "transform",
        "x",
        "y",
        "width",
        "height",
        "xlink:href",
      ]);
  }

  processElement(
    elem: HTMLElement,
    parent: Nullable<Element>
  ): Nullable<Element> {
    var href =
      elem.getAttribute("xlink:href") || elem.getAttribute("href") || null;
    if (href == null) {
      throw new Error("Use needs a xlink:href attribute.");
    }

    if (parent == null) return null;

    // Get and clone the source pointed by href
    var source = this.getRef(parent, href);
    var sourceCopy = source.clone();

    var out = new Group();

    var bounds = parent ? new Bounds() : this.configs.bounds.copy();
    out.setBounds(bounds);
    if (parent != null) parent.add(out);
    this.processStyleAttributes(elem, out);
    this.processBoundsAttributes(elem, bounds);
    this.processTransformAttributes(elem, out);
    this.processMetaAttributes(elem, out);
    return parent;
  }
}
