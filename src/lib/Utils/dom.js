
export function getcssint(elem, attrib) {
    return parseInt(elem.css(attrib).replace(/px/, ""));
}

export function fillChildComponent(elem) {
    var parent = elem.parent();
    var horiz_padding = getcssint(elem, "padding-left") +
                        getcssint(elem, "padding-right") +
                        getcssint(elem, "margin-left") +
                        getcssint(elem, "margin-right") +
                        getcssint(parent, "border-left") +
                        getcssint(parent, "border-right");
    var vert_padding  = getcssint(elem, "padding-top") +
                        getcssint(elem, "padding-bottom") +
                        getcssint(elem, "margin-top") +
                        getcssint(elem, "margin-bottom") +
                        getcssint(parent, "border-top") +
                        getcssint(parent, "border-bottom");
    var finalHeight = parent.height() - vert_padding;
    var finalWidth = parent.width() - horiz_padding;
    elem.height(finalHeight);
    elem.width(finalWidth);
    elem[0].width = finalWidth;
    elem[0].height = finalHeight;
}
