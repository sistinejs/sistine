
class Sidebar extends Panel {
    initialize(configs) {
        this._panelWidth = 300;
        this._sidebarButtons = [];
        this._sidebarPanels = [];
        this._currPanelId = null;
    }

    setupElements() {
        var sidebar_buttons = $("#" + this._divId + " > .sidebar_button");
        var self = this;
        sidebar_buttons.each(function(index, sbbutton) {
            var $sbbutton = $(sbbutton);
            var $sbpanel = $(sbbutton).children().detach();
            $(document.documentElement).append($sbpanel);
            $sbpanel.hide();

            self._sidebarButtons.push($sbbutton);
            self._sidebarPanels.push($sbpanel);

            var buttonId = sbbutton.id.replace(/SB_/, "");
            var iconId = "tb_icon_" + buttonId;
            var buttonImage = $("<img src = '" + "./src/demo/icons/" + buttonId + ".png' />");
            $sbbutton.button({
                iconPosition: "top"
            }).append(buttonImage);
            Sistine.Utils.DOM.fillChildComponent(buttonImage);
            $sbbutton.click((function(buttonId) {
                return function(event) {
                    var handler = "on" + buttonId;
                    self[handler]();
                }
            })(buttonId));
        });
    }

    layout() {
        var self = this;
        var offset = this._parentDiv.offset();
        offset = {'left': offset.left, 'top': offset.top};
        var parentHeight = this._parentDiv.height();
        this._sidebarPanels.forEach(function($panel) {
            if ($panel.is(":visible")) {
                offset.left -= $panel.width();
                $panel.show(false);
                $panel.offset(offset);
            } else {
                $panel.offset(offset);
                $panel.hide();
            }
        });
    }

    onLayoutProperties() {
        this.toggle("LayoutProperties");
    }

    onFillProperties() {
        this.toggle("FillProperties");
    }

    onLineProperties() {
        this.toggle("LineProperties");
    }

    toggle(panelId) {
        var offset = this._parentDiv.offset();
        offset = {'left': offset.left, 'top': offset.top};
        var parentHeight = this._parentDiv.height();
        if (this._currPanelId != null && this._currPanelId != panelId) {
            // hide current one
            var $panel = $("#SBPanel_" + this._currPanelId);
            $panel.hide();
            this.triggerOn("PanelHidden", {panel: this._currPanelId});
            this._currPanelId = null;
        }
        this._togglePanel(panelId);
    }

    _togglePanel(panelId) {
        var offset = this._parentDiv.offset();
        offset = {'left': offset.left, 'top': offset.top};
        var parentHeight = this._parentDiv.height();
        var $panel = $("#SBPanel_" + panelId);
        $panel.width(this._panelWidth);
        $panel.height(parentHeight);
        if ($panel.is(":visible")) {
            $panel.offset(offset);
            $panel.hide();
            this.triggerOn("PanelHidden", {panel: panelId});
        } else {
            this._currPanelId = panelId;
            // $panel.offset(offset);
            offset.left -= $panel.width();
            $panel.show(false);
            $panel.offset(offset);
            this.triggerOn("PanelShown", {panel: panelId});
        }
    }
}

function setupSidebar() {
    theSidebar = new Sidebar("inspector_panel_div");
    theSidebar.fillStylePanel = new FillStylePanel("SBPanel_FillProperties");
}
