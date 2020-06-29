import { Sistine } from "../../../lib/index";
import { App } from "./App";

declare var theApp: App;
var BasicShapes = Sistine.Bundles.BasicShapes;
var BuiltinShapes = Sistine.Builtins;

export const shapeDefaults = {
  strokeStyle: "black",
  lineWidth: 2,
};

var Point = Sistine.Geom.Models.Point;
var Bounds = Sistine.Geom.Models.Bounds;

function getTestSvgUrl(base: string): string {
  return "/src/demos/svgcmp/samples/" + base;
  // return "https://dev.w3.org/SVG/tools/svgweb/samples/svg-files/" + base;
}

export function addSampleShapes() {
  // addSampleShapes1();
  addSampleShapes2();
}

function addSampleShapes1() {
  var grd1 = new Sistine.Core.Styles.LinearGradient(0, 0, 1, 1)
    .addStop(0, "black")
    .addStop(1, "white");
  addShape(BasicShapes, "Triangle", {
    p0: new Point(140, 150),
    p1: new Point(80, 280),
    p2: new Point(280, 280),
    lineWidth: 2,
    fillStyle: grd1,
  });

  var grd2 = new Sistine.Core.Styles.RadialGradient(
    0.5,
    0.5,
    0.2,
    0.5,
    0.5,
    0.5
  )
    .addStop(0, "red")
    .addStop(1, "blue");
  addShape(BuiltinShapes, "Circle", {
    center: new Point(200, 200),
    radius: 100,
    lineWidth: 2,
    fillStyle: grd2,
  });
  addShape(BasicShapes, "Square", {
    p0: new Point(350, 50),
    size: 200,
    fillStyle: "red",
  });
  addShape(BasicShapes, "Polygon", {
    x: 350,
    y: 175,
    width: 200,
    height: 200,
    fillStyle: "blue",
  });

  var path = addShape(Sistine.Core, "Path");
  path.moveTo(100, 100);
  path.lineTo(100, 200);
  path.quadraticCurveTo(300, 400, 325, 475);
  path.bezierCurveTo(300, 400, 325, 475, 500, 390);
  path.lineWidth = 10;

  addShape(BuiltinShapes, "QuadCurve", {
    p0: new Point(100, 300),
    p1: new Point(200, 200),
    p2: new Point(300, 300),
  });
  addShape(BuiltinShapes, "CubicCurve", {
    p0: new Point(400, 300),
    p1: new Point(500, 200),
    p2: new Point(600, 300),
    p3: new Point(700, 200),
  });
}

function addSampleShapes2() {
  Sistine.SVG.Loader.loadFromURL(
    getTestSvgUrl("acid.svg"),
    {
      bounds: new Bounds(0, 0, 300, 300),
    },
    function (shape) {
      theApp.scene.add(shape);
    }
  );
}

function addShape(Bundle: any, objid: string, configs?: any) {
  configs = configs || {};
  var finalConfigs = {
    ...shapeDefaults,
    ...configs,
  };
  var newShape = new Bundle[objid](finalConfigs);
  theApp.scene.add(newShape);
  return newShape;
}
