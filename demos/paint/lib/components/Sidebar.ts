import { fillChildComponent } from "../../../../src/Utils/dom";
import { Nullable } from "../../../../src/Core/types";
import { Panel } from "./Panel";

export class Sidebar extends Panel {
  _panelWidth: number = 300;
  _sidebarButtons: any[] = [];
  _sidebarPanels: Panel[] = [];
  _currPanelId: Nullable<string> = null;

  initialize(configs: any) {
    this._panelWidth = 300;
    this._sidebarButtons = [];
    this._sidebarPanels = [];
    this._currPanelId = null;
  }

  setupElements() {
    var sidebar_buttons = $(this._elemSelector + " > .sidebar_button");
    var self = this;
    sidebar_buttons.each(function (index, sbbutton) {
      var $sbbutton: any = $(sbbutton);
      var $sbpanel: any = $(sbbutton).children().detach();
      $(document.documentElement).append($sbpanel);
      $sbpanel.hide();

      self._sidebarButtons.push($sbbutton);
      self._sidebarPanels.push($sbpanel);

      var buttonId = sbbutton.id.replace(/SB_/, "");
      var iconId = "tb_icon_" + buttonId;
      var buttonImage = $("<img src = '" + "./src/demos/paint/icons/toolbar/" + buttonId + ".png' />");
      $sbbutton
        .button({
          iconPosition: "top",
        })
        .append(buttonImage);
      fillChildComponent(buttonImage);
      $sbbutton.click(
        (function (buttonId) {
          return function (_event: any) {
            var handler = "on" + buttonId;
            ((self as any)[handler] as any)();
          };
        })(buttonId),
      );
    });
  }

  layout() {
    var offset = this._rootElement.offset();
    offset = { left: offset.left, top: offset.top };
    // var parentHeight = this._rootElement.height();
    this._sidebarPanels.forEach(function ($panel: any) {
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

  onStrokeProperties() {
    this.toggle("StrokeProperties");
  }

  onTextProperties() {
    this.toggle("TextProperties");
  }

  toggle(panelId: string) {
    var offset = this._rootElement.offset();
    offset = { left: offset.left, top: offset.top };
    var parentHeight = this._rootElement.height();
    if (this._currPanelId != null && this._currPanelId != panelId) {
      // hide current one
      var $panel = $("#SBPanel_" + this._currPanelId);
      $panel.hide();
      this.triggerOn("PanelHidden", { panel: this._currPanelId });
      this._currPanelId = null;
    }
    this._togglePanel(panelId);
  }

  _togglePanel(panelId: string) {
    var offset = this._rootElement.offset();
    offset = { left: offset.left, top: offset.top };
    var parentHeight = this._rootElement.height();
    var $panel: any = $("#SBPanel_" + panelId);
    $panel.width(this._panelWidth);
    $panel.height(parentHeight);
    if ($panel.is(":visible")) {
      $panel.offset(offset);
      $panel.hide();
      this.triggerOn("PanelHidden", { panel: panelId });
    } else {
      this._currPanelId = panelId;
      // $panel.offset(offset);
      offset.left -= $panel.width();
      $panel.show(false);
      $panel.offset(offset);
      this.triggerOn("PanelShown", { panel: panelId });
    }
  }
}
