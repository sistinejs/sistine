import { Panel } from "./Panel";
import { GradientStylePanel } from "./GradientStylePanel";

export class PaintStylePanel extends Panel {
  currentColor: any;
  _currentStyle: any;
  paintColorPicker: any;
  gradientStylePanel: GradientStylePanel;
  initialize(configs: any) {
    this.currentColor = "#000000";
    this._currentStyle = null;
  }

  setupElements() {
    var self = this;
    this.rootElement.tabs();

    this.paintColorPicker = this.find("input[id=PaintColorPicker]");
    this.paintColorPicker.spectrum({
      flat: true,
      allowEmpty: true,
      width: 200,
      showAlpha: true,
      showInput: true,
      showButtons: false,
      move: function (color: any) {
        self.currentColor = color.toRgbString();
        self.markModified();
        self.triggerOn("styleChanged", {
          color: self.currentColor,
        });
      },
    });

    this.gradientStylePanel = new GradientStylePanel(this.app, this.subselector("#gradientStyleDiv"));
    this.gradientStylePanel.eventHub.chain(this.eventHub);
  }

  get isPlainStyle() {
    return this.rootElement.tabs("option", "active") == 0;
  }

  get isGradientStyle() {
    return this.rootElement.tabs("option", "active") == 1;
  }

  get isPatternStyle() {
    return this.rootElement.tabs("option", "active") == 2;
  }

  get currentStyle() {
    if (this.isGradientStyle) {
      return this.gradientStylePanel.currentStyle;
    } else if (this.isPatternStyle) {
      // Pattern style
      // TODO: enable gradients
    }
    return this.currentColor;
  }
}
