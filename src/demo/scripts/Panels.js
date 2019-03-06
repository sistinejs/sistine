
class Panel extends Sistine.Core.Events.EventSource {
    constructor(divId, configs) {
        super();
        this._divId = divId;
        this._parentDiv = $("#" + divId);
        this.initialize(configs);
        this.setupElements();
        this.layout();
    }

    get divId() { return this._divId; };
    get parentDiv() { return this._parentDiv; };

    setupElements() {
    }

    layout() {
    }
}

class FillStylePanel extends Panel {
    initialize(configs) {
    }

    setupElements() {
        var tabDiv = $("#" + this.divId + " div[id=fill_type_panel]");
        tabDiv.append("<ul> </ul>");
        tabDiv.tabs();

        var tabUL = tabDiv.children("ul");
        tabUL.append($("<li><a href='#tab_FillStylePlain'>Plain</a></li>"));
        tabDiv.append($("<div id='tab_FillStylePlain'></div>"));

        tabUL.append($("<li><a href='#tab_FillStyleLinear'>Linear</a></li>"));
        tabDiv.append($("<div id='tab_FillStyleLinear'></div>"));

        tabUL.append($("<li><a href='#tab_FillStyleRadial'>Radial</a></li>"));
        tabDiv.append($("<div id='tab_FillStyleRadial'></div>"));

        tabUL.append($("<li><a href='#tab_FillStylePattern'>Pattern</a></li>"));
        tabDiv.append($("<div id='tab_FillStylePattern'></div>"));

        tabDiv.tabs("refresh");

        var self = this;
        this.opacitySlider = this.parentDiv.find("#opacity_slider");
        this.opacitySlider.slider( {
            min: 0,
            max: 100,
            value: 50,
            change: function(event, ui) {
                self.opacity = ui.value;
            }
        });
    }

    set opacity(value) {
        this.parentDiv.find("#opacity_value").html(value / 100.0);
    }

    layout() {
    }
}

class ColorPickerPanel extends Panel {
    initialize(configs) {
    }

    setupElements() {
    }

    layout() {
    }
}
