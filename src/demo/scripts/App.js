
class App {
    constructor() {
        this.scene = new Sistine.Core.Models.Scene();
        this.stage = this._setupStage();
        this.sidebar = this._setupSidebar();
        this.shapesPanel = new ShapesPanel("#toolbar_accordian");

        this._setupSplitBar();
        this._setupToolbar();
        this._setupMenus();
        this._layoutElements();
        var self = this;
        $( window ).resize(function() { self._layoutElements(); });
    }

    get eventMachine() {
        return this.stage.eventMachine;
    }

    _setupStage() {
        this.stage = new Sistine.Views.Stage.Stage("stage_div", this.scene);
        this.stage.isEditable = true;
        this.stage.showBackground = true;

        // Add a zoom handler!!
        // this.zoomHandler = new Sistine.Views.Handlers.StageViewPortHandler(this.stage);
        this.eventMachine.registerState(new RootUIState(this), true);
        return this.stage;
    }

    _setupSplitBar() {
        var self = this;
        $("#splitbar").draggable({
            axis: "x",
            drag: function(event) { self._layoutElements(); }
        });
    }

    _setupSidebar() {
        this.sidebar = new Sidebar("#sidebar_panel_div");
        this.layoutPropertiesPanel = new LayoutPropertiesPanel("#SBPanel_LayoutProperties");
        this.strokePropertiesPanel = new StrokePropertiesPanel("#SBPanel_StrokeProperties");
        this.fillPropertiesPanel = new FillPropertiesPanel("#SBPanel_FillProperties");
        this.textPropertiesPanel = new TextPropertiesPanel("#SBPanel_TextProperties");
        return this.sidebar;
    }

    /**
     * Sets up the canvas initially and ensures it dynamically adjusts to the size of the screen.
     */
    _layoutElements(e, ui) {
        var stage_div = $("#stage_div");
        var splitbar = $("#splitbar");
        var toolpanel_div = $("#toolpanel_div");

        // setup toolpanel width
        toolpanel_div.width(splitbar.position().left);

        // setup stage_div width
        stage_div.css("left", splitbar.position().left + splitbar.width());
        if (this.stage) { this.stage.layout(); }
        if (this.sidebar) { this.sidebar.layout(); }
    }

    _setupMenus() {
        $(".menu li").hover(
            function () {
                $(this).addClass("ui-state-hover");
                $("ul", $(this)).show();
            },

            function () {
                $(this).removeClass("ui-state-hover");
                $("ul", $(this)).hide();
            });
        $(".menu li ul").each(function () {
            $(this).menu();
        });
    }

    _setupToolbar() {
        var self = this;
        $("#zoom_option").selectmenu({ width : 100 });
        var toolbar_buttons = $(".toolbar_button");
        toolbar_buttons.each(function(index, tbbutton) {
            var $tbbutton = $(tbbutton);
            var label = $tbbutton.text();
            $tbbutton.empty()
            $tbbutton.attr("title", label);

            var buttonId = tbbutton.id.replace(/TB_/, "");
            var buttonImage = $("<img src = '" + "./src/demo/icons/toolbar/" + buttonId + ".png' />");
            $tbbutton.button({ iconPosition: "top" }).append(buttonImage);
            Sistine.Utils.DOM.fillChildComponent(buttonImage);

            var eventId = "on" + buttonId
            $tbbutton.click(function(event) {
                self.eventMachine.handle(eventId, self, event);
            });
        });
    }
}
