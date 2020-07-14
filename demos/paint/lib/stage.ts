import Core from "../../../src/Core";
import { loadFromURL } from "../../../src/SVG/loader";
import BasicShapes from "../../../src/Bundles/index";
import BuiltinShapes from "../../../src/Builtins/index";
import { Point, Bounds } from "../../../src/Geom/models";
import { LinearGradient, RadialGradient } from "../../../src/Core/styles";
import { App } from "./App";

declare var theApp: App;

export const shapeDefaults = {
  strokeStyle: "black",
  lineWidth: 2,
};

function getTestSvgUrl(base: string): string {
  return "/src/demos/svgcmp/samples/" + base;
  // return "https://dev.w3.org/SVG/tools/svgweb/samples/svg-files/" + base;
}

export function addSampleShapes() {
  // addSampleShapes1();
  addSampleShapes2();
}

function addSampleShapes1() {
  var grd1 = new LinearGradient(0, 0, 1, 1).addStop(0, "black").addStop(1, "white");
  addShape(BasicShapes, "Triangle", {
    p0: new Point(140, 150),
    p1: new Point(80, 280),
    p2: new Point(280, 280),
    lineWidth: 2,
    fillStyle: grd1,
  });

  var grd2 = new RadialGradient(0.5, 0.5, 0.2, 0.5, 0.5, 0.5).addStop(0, "red").addStop(1, "blue");
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

  var path = addShape(Core, "Path");
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
  loadFromURL(
    getTestSvgUrl("acid.svg"),
    {
      bounds: new Bounds(0, 0, 300, 300),
    },
    function (shape) {
      theApp.scene.add(shape!);
    },
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
