import { Panel } from "./Panel";
import { PaintStylePanel } from "./PaintStylePanel";

export class FillPropertiesPanel extends Panel {
  paintStylePanel: PaintStylePanel;
  setupElements() {
    this.paintStylePanel = new PaintStylePanel(this.app,
      this.subselector("#paintStylePanelTab")
    );
    this.paintStylePanel.eventHub.chain(this.eventHub);
  }
}
