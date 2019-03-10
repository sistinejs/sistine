
class PaintStylePanel extends Panel {
    initialize(configs) {
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
            move: function(color) {
                self.currentColor = color.toRgbString();
                self.markModified();
                self.triggerOn("styleChanged", {
                    "color": self.currentColor
                });
            }
        });

        this.gradientStylePanel = new GradientStylePanel(this.subselector("#gradientStyleDiv"));
        this.gradientStylePanel.eventHub.chain(this.eventHub);
    }

    get currentStyle() {
        if (this._currentStyle == null || this.isModified) {
            this.markCreated();
            // recreate it
            if (this.isPlainStyle) {
                this._currentStyle = this.currentColor;
            } else if (this.isGradientStyle) {
                this._currentStyle = this.gradientStylePanel.currentStyle;
            } else {
                // Pattern style
            }
        }
    }
}

