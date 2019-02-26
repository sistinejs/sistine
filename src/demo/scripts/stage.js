
var DefaultBundle = Sistine.registry.DefaultBundle;
iconStages = { };
shapeDefaults = {
    'strokeStyle': "black",
    'lineWidth': 2,
};
theScene = null;
theStage = null;
zoomHandler = null;

function setupStage() {
    theScene = new Sistine.core.Scene();
    theStage = new Sistine.stage.Stage("stage_div", theScene);
    theStage.isEditable = true;
    theStage.showBackground = true;
    // Add a zoom handler!!
    zoomHandler = new Sistine.handlers.StageViewPortHandler(theStage);
    addSampleShapes();
}

function addShape(objid, configs) {
    configs = configs || {};
    var finalConfigs = {
        ...shapeDefaults,
        ...configs
    }
    var newShape = DefaultBundle[objid].newShape(finalConfigs);
    theScene.add(newShape);
    return newShape;
}

function addSampleShapes() {
    addShape("Triangle", {"x": 80, "y": 150, "width": 200, "height": 200, "lineWidth": 2});
    addShape("Circle", { "x": 200, "y": 50, "width": 100, "height": 100, "lineWidth": 2 });
    addShape("Square", { "x": 350, "y": 50, "width": 200, "height": 100, "fillStyle": 'red' });
    addShape("Polygon", { "x": 350, "y": 175, "width": 200, "height": 200, "fillStyle": 'blue' });
}

x = null;
ctx = null;
function drawSample(x, y, w, h, angle, clear) { if (clear)
        ctx.clearRect(0, 0, 2000, 2000);
    ctx.save();
    ctx.lineWidth = 2.0;
    cx = x + w / 2;
    cy = y + h / 2;
    ctx.translate(cx, cy);
    var theta = Math.PI * angle / 180;
    ctx.rotate(theta);
    ctx.translate(-cx, -cy);
    costheta = Math.cos(theta) / 2;
    sintheta = Math.sin(theta);
    ctx.strokeRect(x, y, w, h);

    // Draw Center
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "green";
    ctx.fill();
    ctx.restore();
}

function test() {
    ctx = theStage.getPane("main").context;
    x = theScene._layers[0]._children[0];
    x.rotate(30);
    // scaling when drawing is using the "wrong" offset.  For some reason x and y are fine but still looks "jilted"

    drawSample(100, 50);
}
