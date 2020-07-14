import { Panel } from "./Panel";
import { PaintStylePanel } from "./PaintStylePanel";

export class TextPropertiesPanel extends Panel {
  paintStylePanel: PaintStylePanel;
  opacitySlider: any;
  setupElements() {
    var self = this;

    this.paintStylePanel = new PaintStylePanel(
      this.app,
      this.subselector("#paintStylePanelTab")
    );

    this.opacitySlider = this.rootElement.find("#opacity_slider");
    var handle = this.find("#custom-handle");
    this.opacitySlider.slider({
      min: 0,
      max: 100,
      value: 50,
      create: function (event: any) {
        handle.text(($(this) as any).slider("value"));
      },
      slide: function (event: any, ui: any) {
        handle.text(ui.value);
        self.opacity = ui.value;
      },
    });
  }

  set opacity(value: number) {
    this.rootElement.find("#opacity_value").html(value / 100.0);
  }

  layout() {}
}
