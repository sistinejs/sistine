import Sistine from "../../src";
// import * as Sistine from "Sistine";

console.log("Sistine: ", Sistine);

describe("Counter Tests", () => {
  test("shoule create Counter", () => {
    var counter = new Sistine.Core.Base.Counter();
    expect(true).toBe(true);
    // var c = new Counter();
  });
});
