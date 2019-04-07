
class App {
    constructor() {
        this.scene = new Sistine.Core.Models.Scene();
        this.stage = this._setupStage();
        this.sidebar = this._setupSidebar();
        this.shapesPanel = new ShapesPanel("#shapespanel_accordian");
        this.toolbar = new Toolbar("#toolbar_div");

        this._setupSplitBar();
        this._setupMenus();
        this._layoutElements();
        var self = this;
        $( window ).resize(function() { self._layoutElements(); });
    }

    get eventMachine() {
        return this.stage.eventMachine;
    }

    _setupStage() {
        this.stage = new Sistine.Views.Stage("stage_div", this.scene);
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
        var shapespanel_div = $("#shapespanel_div");

        // setup toolpanel width
        shapespanel_div.width(splitbar.position().left);

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
}
