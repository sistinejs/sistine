
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
        this._dialog.dialog({"title": s.name + " - " s.id});
    }

    _reloadData() {
    }

    show() { this._dialog.dialog("open"); }
    hide() { this._dialog.dialog("close"); }
    get isShowing() { this._dialog.dialog("isOpen"); }
}

