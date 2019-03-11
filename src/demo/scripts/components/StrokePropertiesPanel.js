
class StrokePropertiesPanel extends Panel {
    setupElements() {
        var self = this;

        this.paintStylePanel = new PaintStylePanel(this.subselector("#paintStylePanelTab"));
        this.paintStylePanel.eventHub.chain(this.eventHub);

        /*
        this.opacitySlider = this.rootElement.find("#opacity_slider");
        var handle = this.find("#custom-handle");
        this.opacitySlider.slider({
            min: 0,
            max: 100,
            value: 50,
            create: function() {
                handle.text( $( this ).slider( "value" ) );
            },
            slide: function( event, ui ) {
                handle.text( ui.value );
                self.opacity = ui.value;
            }
        });
        */
    }

    set opacity(value) {
        this.rootElement.find("#opacity_value").html(value / 100.0);
    }

    layout() {
    }
}

