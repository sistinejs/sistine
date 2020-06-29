export function ensureElement(elem_or_id: any, root: any = null) {
  if (typeof elem_or_id === "string") {
    if (root != null && root.length > 0) return root.find("#" + elem_or_id);
    else return $("#" + elem_or_id);
  } else {
    if (elem_or_id.find) {
      return elem_or_id;
    } else {
      return $(elem_or_id);
    }
  }
}

export function ensureCreated(
  elem_or_id: any,
  root: any = null,
  elemType: string = "div"
) {
  var out = ensureElement(elem_or_id, root);
  if (out == null || out.length == 0) {
    // creat it then
    out = $("<" + elemType + "></" + elemType + ">");
    if (elem_or_id != null && typeof elem_or_id === "string")
      out.attr("id", elem_or_id);
    if (root == null) root = $("body");
    root.append(out);
  }
  return out;
}

export function setEnabled(elem: any, enable: boolean = true) {
  elem.prop("disabled", !enable);
  return elem;
}

export function setVisible(elem: any, show: boolean = true) {
  if (show) {
    elem.show();
  } else {
    elem.hide();
  }
  return elem;
}
