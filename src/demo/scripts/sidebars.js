
function setupSidebar() {
    var sidebar_buttons = $(".sidebar_button");
    sidebar_buttons.each(function(index, sbbutton) {
        var $sbbutton = $(sbbutton);

        var buttonId = sbbutton.id.replace(/SB_/, "");
        var iconId = "tb_icon_" + buttonId;
        var buttonImage = $("<img src = '" + "./src/demo/icons/" + buttonId + ".png' />");
        $sbbutton.button({
            iconPosition: "top"
        }).append(buttonImage);
        Sistine.Utils.DOM.fillChildComponent(buttonImage);
        $sbbutton.click(eval("on" + buttonId));
    });
}

function onLineProperties() {
}

function onFillProperties() {
}

function onLayoutProperties() {
}

