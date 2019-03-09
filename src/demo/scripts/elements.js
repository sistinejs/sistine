

function setupElements() {
    setupSplitBar();
    setupAccordian();
    layoutElements();
    setupSidebar();
    setupToolbar();
    setupMenus();
    $( window ).resize(function() { layoutElements(); });
}

function setupSplitBar() {
    $("#splitbar").draggable({
        axis: "x",
        drag: layoutElements
    });
}

function setupAccordian() {
    theShapesPanel = new ShapesPanel("#toolbar_accordian");
}

function setupSidebar() {
    theSidebar = new Sidebar("#sidebar_panel_div");
    theSidebar.layoutPropertiesPanel = new LayoutPropertiesPanel("#SBPanel_LayoutProperties");
    theSidebar.strokePropertiesPanel = new StrokePropertiesPanel("#SBPanel_StrokeProperties");
    theSidebar.fillPropertiesPanel = new FillPropertiesPanel("#SBPanel_FillProperties");
    theSidebar.textPropertiesPanel = new TextPropertiesPanel("#SBPanel_TextProperties");
}

/**
 * Sets up the canvas initially and ensures it dynamically adjusts to the size of the screen.
 */
function layoutElements(e, ui) {
    var stage_div = $("#stage_div");
    var splitbar = $("#splitbar");
    var toolpanel_div = $("#toolpanel_div");

    // setup toolpanel width
    toolpanel_div.width(splitbar.position().left);

    // setup stage_div width
    stage_div.css("left", splitbar.position().left + splitbar.width());
    if (theStage) { theStage.layout(); }
    if (theSidebar) { theSidebar.layout(); }
}
