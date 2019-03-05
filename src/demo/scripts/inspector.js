
class Inspector {
    constructor(divid) {
        this._divId = divid;
        this._dialog = $("#" + divid).dialog({
            position: { my: "right center", at: "right center", of: window }
        });
    }

    set shape(s) {
        this._shape = s;
        this._reloadData();
    }

    _reloadData() {
        var s = this._shape;
        this._dialog.dialog({"title": ""});
        // First fill dimension and transformation data

        // Fill and Stroke style data.
        if (s != null) {
            this._dialog.dialog({"title": s.name + " - " + s.id});
        } else {
            this.hide();
        }
    }

    show() { this._dialog.dialog("open"); }
    hide() { this._dialog.dialog("close"); }
    get isShowing() { return this._dialog.dialog("isOpen"); }
}

