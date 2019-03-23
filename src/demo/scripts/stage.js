
var DefaultBundle = Sistine.Registry.DefaultBundle;
shapeDefaults = {
    'strokeStyle': "black",
    'lineWidth': 2,
};

var Point = Sistine.Geom.Models.Point;

function addSampleShapes() {
    /*
    var grd1 = new Sistine.Core.Styles.LinearGradient(0, 0, 1, 1)
                          .addStop(0, "black")
                          .addStop(1, "white");
    addShape("Triangle", {
        p0: new Point(140, 150),
        p1: new Point(80, 280),
        p2: new Point(280, 280),
        "lineWidth": 2,
        "fillStyle": grd1
    });

    var grd2 = new Sistine.Core.Styles.RadialGradient(0.5, 0.5, 0.2, 0.5, 0.5, 0.5)
                                 .addStop(0, "red")
                                 .addStop(1, "blue");
    addShape("Circle", {
        center: new Point(200, 200),
        radius: 100,
        "lineWidth": 2, "fillStyle": grd2
    });
    addShape("Square", {
        p0: new Point(350, 50),
        size: 200,
        fillStyle: 'red'
    });
    addShape("Polygon", { "x": 350, "y": 175, "width": 200, "height": 200, "fillStyle": 'blue' });
    */

    var path = new Sistine.Core.Models.Path();
    path.moveTo(100, 100);
    path.lineTo(100, 200);
    path.lineTo(300, 300);
    path.lineWidth = 10;
    theApp.scene.add(path);
}

function addShape(objid, configs) {
    configs = configs || {};
    var finalConfigs = {
        ...shapeDefaults,
        ...configs
    }
    var newShape = DefaultBundle[objid].newShape(finalConfigs);
    theApp.scene.add(newShape);
    return newShape;
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
    ctx = theApp.stage.getPane("main").context;
    x = theApp.scene._layers[0]._children[0];
    x.rotate(30);
    // scaling when drawing is using the "wrong" offset.  For some reason x and y are fine but still looks "jilted"

    drawSample(100, 50);
}
