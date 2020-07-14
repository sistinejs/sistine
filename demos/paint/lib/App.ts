// TODO: how to actually refer to a library instead of a hardcoded path?
import { Toolbar } from "./components/Toolbar";
import { Sidebar } from "./components/Sidebar";
import { ShapesPanel } from "./components/ShapesPanel";
import { LayoutPropertiesPanel } from "./components/LayoutPropertiesPanel";
import { StrokePropertiesPanel } from "./components/StrokePropertiesPanel";
import { FillPropertiesPanel } from "./components/FillPropertiesPanel";
import { TextPropertiesPanel } from "./components/TextPropertiesPanel";
import { RootUIState } from "./actions";
import { Scene } from "../../../src/Core/models";
import { Stage } from "../../../src/Views/stage";

export class App {
  scene: Scene;
  stage: Stage;
  sidebar: Sidebar;
  layoutPropertiesPanel: LayoutPropertiesPanel;
  strokePropertiesPanel: StrokePropertiesPanel;
  fillPropertiesPanel: FillPropertiesPanel;
  textPropertiesPanel: TextPropertiesPanel;
  shapesPanel: ShapesPanel;
  toolbar: Toolbar;
  constructor() {
    this.scene = new Scene();
    this.stage = this._setupStage();
    this.sidebar = this._setupSidebar();
    this.shapesPanel = new ShapesPanel(this, "#shapespanel_accordian");
    this.toolbar = new Toolbar(this, "#toolbar_div");

    this._setupSplitBar();
    this._setupMenus();
    this._layoutElements();
    var self = this;
    $(window).resize(function () {
      self._layoutElements();
    });
  }

  get eventMachine() {
    return this.stage.eventMachine;
  }

  _setupStage(): Stage {
    this.stage = new Stage("stage_div", this.scene);
    this.stage.isEditable = true;
    this.stage.showBackground = true;

    // Add a zoom handler!!
    // this.zoomHandler = new Sistine.Views.Handlers.StageViewPortHandler(this.stage);
    this.eventMachine.registerState(new RootUIState(this), true);
    return this.stage;
  }

  _setupSplitBar() {
    var self = this;
    ($("#splitbar") as any).draggable({
      axis: "x",
      drag: function (event: any) {
        self._layoutElements();
      },
    });
  }

  _setupSidebar(): Sidebar {
    this.sidebar = new Sidebar(this, "#sidebar_panel_div");
    this.layoutPropertiesPanel = new LayoutPropertiesPanel(this, "#SBPanel_LayoutProperties");
    this.strokePropertiesPanel = new StrokePropertiesPanel(this, "#SBPanel_StrokeProperties");
    this.fillPropertiesPanel = new FillPropertiesPanel(this, "#SBPanel_FillProperties");
    this.textPropertiesPanel = new TextPropertiesPanel(this, "#SBPanel_TextProperties");
    return this.sidebar;
  }

  /**
   * Sets up the canvas initially and ensures it dynamically adjusts to the size of the screen.
   */
  _layoutElements(e?: any, ui?: any) {
    var stage_div = $("#stage_div");
    var splitbar = $("#splitbar") as any;
    var shapespanel_div = $("#shapespanel_div");

    // setup toolpanel width
    shapespanel_div.width(splitbar.position().left);

    // setup stage_div width
    stage_div.css("left", splitbar.position().left + splitbar.width());
    if (this.stage) {
      this.stage.layout();
    }
    if (this.sidebar) {
      this.sidebar.layout();
    }
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
      },
    );
    $(".menu li ul").each(function () {
      ($(this) as any).menu();
    });
  }
}
