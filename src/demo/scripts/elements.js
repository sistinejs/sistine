

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
    $( "#toolbar_accordian" ).accordion({
        collapsible:true,
        beforeActivate: function(event, ui) {
             // The accordion believes a panel is being opened
            if (ui.newHeader[0]) {
                var currHeader  = ui.newHeader;
                var currContent = currHeader.next('.ui-accordion-content');
             // The accordion believes a panel is being closed
            } else {
                var currHeader  = ui.oldHeader;
                var currContent = currHeader.next('.ui-accordion-content');
            }
             // Since we've changed the default behavior, this detects the actual status
            var isPanelSelected = currHeader.attr('aria-selected') == 'true';

             // Toggle the panel's header
            currHeader.toggleClass('ui-corner-all',isPanelSelected).toggleClass('accordion-header-active ui-state-active ui-corner-top',!isPanelSelected).attr('aria-selected',((!isPanelSelected).toString()));

            // Toggle the panel's icon
            currHeader.children('.ui-icon').toggleClass('ui-icon-triangle-1-e',isPanelSelected).toggleClass('ui-icon-triangle-1-s',!isPanelSelected);

             // Toggle the panel's content
            currContent.toggleClass('accordion-content-active',!isPanelSelected)    
            if (isPanelSelected) { currContent.slideUp(); }  else { currContent.slideDown(); }

            return false; // Cancels the default action
        }
    });
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
