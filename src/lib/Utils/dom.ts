
const fontMetrics = {
}

export function getcssint(elem, attrib : string) : int {
    return parseInt(elem.css(attrib).replace(/px/, ""));
}

export function getFontMetrics(fontFamily, fontSize) {
    if (!(fontFamily in fontMetrics)) {
        fontMetrics[fontFamily] = {};
    }
    var familyMetrics = fontMetrics[fontFamily];
    if (!(fontSize in familyMetrics)) {
        var a = $("<div style='position:absolute;top:0;left:0'>M</div>");
        a.css("font-family", fontFamily);
        a.css("font-size", fontSize);
        $($(document)[0].body).append(a)
        familyMetrics[fontSize] = {
            'height': a[0].offsetHeight,
            'size': fontSize
        };
        a.remove();
    }
    return familyMetrics[fontSize];
}

export function centerElem(elem, axis) {
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
    if (axis == "x") {
        elem.css("left", (finalWidth - elem.width()) / 2);
    } else if (axis == "y") {
        elem.css("top", (finalHeight - elem.height()) / 2);
    } else {
        elem.css("left", (finalWidth - elem.width()) / 2);
        elem.css("top", (finalHeight - elem.height()) / 2);
    }
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

export function forEachChild(elem, visitor) {
    var children = elem.children;
    var L = children.length;
    for (var i = 0;i < L;i++) {
        var child = children[i];
        if (visitor(child, i) == false) 
            return ;
    }
}

export function forEachNode(elem, visitor) {
    var children = elem.childNodes;
    var L = children.length;
    for (var i = 0;i < L;i++) {
        var child = children[i];
        if (visitor(child, i) == false) 
            return ;
    }
}

export function forEachAttribute(elem, visitor) {
    var nodeNameMap = elem.attributes;
    for (var i = 0;i < nodeNameMap.length; i++) {
        var attrib = nodeNameMap[i];
        if (visitor(attrib.name, attrib.value) == false) 
            return ;
    }
}
