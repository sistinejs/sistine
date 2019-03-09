
class GradientStylePanel extends Panel {
    initialize(configs) {
        this._stops = [{
            offset: 0,
            color: "#000000",
        }, {
            offset: 1000,
            color: "#FFFFFF",
        }];
        this._selectedStopIndex = 0;
    }

    get _ranges() {
        return this._stops.map(function(value) {
            return true;
        });
    }

    get numStops() {
        return this._stops.length;
    }

    stopOffsetAt(i) {
        return this._stops[i].offset;
    }

    get stopOffsets() {
        return this._stops.map(function(value) {
            return value.offset;
        });
    }

    get stopColors() {
        return this._stops.map(function(value) {
            return value.value;
        });
    }

    get stops() {
        return this._stops.map(function(value) {
            return value;
        });
    }

    setStopAt(index, offset, color) {
        if (index >= 0 && index < this._stops.length) {
            this._stops[i] = {'offset': offset, 'color': color};
            this.reloadData();
        }
        return this;
    }

    setStopColorAt(index, color) {
        if (index >= 0 && index < this._stops.length) {
            this._stops[i]['color'] = color;
            this.reloadData();
        }
        return this;
    }

    setStopOffsetAt(index, offset) {
        if (index >= 0 && index < this._stops.length) {
            this._stops[i]['offset'] = offset;
            this.reloadData();
        }
        return this;
    }

    removeStopAt(index) {
        if (index >= 0 && index < this._stops.length && this._stops.length > 1) {
            this._stops.splice(index, 1);
            if (this._selectedStopIndex >= this._stops.length) {
                this._selectedStopIndex --;
            }
            this.reloadData();
        }
        return this;
    }

    addStop(offset, color, index) {
        index = index || -1;
        if (color == null) {
            color = this.currentColor;
        }
        // If offset is not provided then find the most "pleasing" offset
        if (offset < 0 || offset == null) {
            offset = (1000 + this.stopOffsetAt(this.numStops - 1)) / 2.0;
        }
        var entry = {'offset': offset, 'color': color};
        if (index < 0) {
            this._stops.push(entry);
            this._selectedStopIndex = this._stops.length - 1;
        } else {
            this._stops.splice(index, 0, entry);
            this._selectedStopIndex = index;
        }
        this.reloadData();
    }

    get currentColor() {
        return this.stopColorPicker.spectrum("get");
    }

    set currentColor(color) {
        this._stops[this._selectedStopIndex].color = color;
        this._handleAtIndex(this._selectedStopIndex).css("background", color);
        this.stopColorPicker.spectrum("set", color);
    }

    _handleAtIndex(index) {
        return this.stopsSlider.find(".ui-slider-handle").eq(index);
    }

    setupElements() {
        var self = this;
        this.inputGradientX1 = this.find("#gradientX1");
        this.inputGradientY1 = this.find("#gradientY1");
        this.inputGradientR1 = this.find("#gradientR1");
        this.inputGradientX2 = this.find("#gradientX2");
        this.inputGradientY2 = this.find("#gradientY2");
        this.inputGradientR2 = this.find("#gradientR2");

        this.rootElement.controlgroup();

        this.stopColorPicker = this.find("#StopColorPicker");
        this.stopColorPicker.spectrum({
            value: "#ffaabb",
            showAlpha: true,
            showInput: true,
            showButtons: true,
            preferredFormat: "rgb",
            move: function(color) {
                self.currentColor = color.toRgbString();
            }
        });

        this.addStopButton = this.find("#addStopButton");
        this.addStopButton.button({
            showLabel: false
        });
        this.addStopButton.click(function(event) {
            self.addStop(null, null, -1);
        });
        this.removeStopButton = this.find("#removeStopButton");
        this.removeStopButton.button({
            showLabel: false
        });
        this.removeStopButton.click(function(event) {
            self.removeStopAt(self._selectedStopIndex);
        });

        this._setupStopsSlider()
    }

    reloadData() {
        this.stopsSlider.limitslider("destroy");
        this._setupStopsSlider();
        this.stopColorPicker.spectrum("set", this._stops[this._selectedStopIndex].color);
    }

    set selectedStopIndex(index) {
        var theStop = this._stops[index];
        this._selectedStopIndex = index;
        this.stopColorPicker.spectrum("set", theStop.color);
    }

    _setupStopsSlider() {
        var self = this;
        this.stopsSlider = this.find("#stopsSlider");
        this.stopsSlider.limitslider({
            values:     this.stopOffsets,
            max:        1000,
            title:      function(value) {
                return value / 1000.0;
            },
            create:      function(event, ui) {
                console.log("Create: ", ui);
            },
            slide:      function(event, ui) {
                var handleIndex = ui.handleIndex;
                var nextStop = self._stops[handleIndex];
                nextStop.offset = ui.value;
                self.selectedStopIndex = handleIndex;
            },
            start:      function(event, ui) {
                var handleIndex = ui.handleIndex;
                var nextStop = self._stops[handleIndex];
                console.log("OnStart CurrSelIndex, ui.index: ", self._selectedStopIndex, handleIndex, nextStop);
                self.selectedStopIndex = handleIndex;
            },
            showRanges: true,
            ranges:     this._ranges
        });
        this._stops.forEach(function(stop, index) {
            self.stopsSlider.find(".ui-slider-handle").eq(index).css("background", stop.color);
        });
    }
}
