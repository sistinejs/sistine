
const TouchModes = Sistine.Views.Handlers.TouchModes;
const TouchMode = Sistine.Views.Handlers.TouchMode;

function setupMenus() {
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

function setupToolbar() {
    $("#zoom_option").selectmenu({ width : 100 });
    var toolbar_buttons = $(".toolbar_button");
    toolbar_buttons.each(function(index, tbbutton) {
        var $tbbutton = $(tbbutton);
        var label = $tbbutton.text();
        $tbbutton.empty()
        $tbbutton.attr("title", label);

        var buttonId = tbbutton.id.replace(/TB_/, "");
        var iconId = "tb_icon_" + buttonId;
        var buttonImage = $("<img src = '" + "./src/demo/icons/" + buttonId + ".png' />");
        $tbbutton.button({
            iconPosition: "top"
        }).append(buttonImage);
        Sistine.Utils.DOM.fillChildComponent(buttonImage);
        $tbbutton.click(eval("on" + buttonId));
    });
}

function onGroupShapes() {
    theStage.selection.group();
}

function onUngroupShapes() {
    theStage.selection.ungroup();
}

function onBringToFront() {
    theStage.selection.bringToFront();
}

function onSendToBack() {
    theStage.selection.sendToBack();
}

function onBringForward() {
    theStage.selection.bringForward();
}

function onSendBackward() {
    theStage.selection.sendBackward();
}

function onZoomIn() {
    theStage.setTouchContext(TouchModes.ZOOM_IN);
}

function onZoomOut() {
    theStage.setTouchContext(TouchModes.ZOOM_OUT);
}

function onUndo() {
}

function onRedo() {
}

function onCut() {
    theStage.selection.copyToClipboard(true);
}

function onCopy() {
    theStage.selection.copyToClipboard();
}

function onPaste() {
    theStage.selection.pasteFromClipboard();
}

function onPointer() {
    theStage.setTouchContext();
}

function onHandTool() {
    theStage.setTouchContext(TouchModes.HAND_TOOL);
}

function onLineTool() {
}

function onLineWidth() {
}

function onShare() {
}

function onTextColor() {
}

function onLineColor() {
}

function onFillColor() {
}

