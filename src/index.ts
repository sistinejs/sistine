// import './scss/styles.scss'

// import Sistine class
// import * as lib from "./lib/index";

// export default UserList class
// I used `defaultExport` to state that variable name doesn't matter
// export default lib.Sistine;

// import Sistine class
import * as Core from "./Core/index";
import * as Text from "./Text/index";
import * as Geom from "./Geom/index";
import * as SVG from "./SVG/index";
import * as Views from "./Views/index";
import * as Utils from "./Utils/index";
import * as Bundles from "./Bundles/index";
import * as Builtins from "./Builtins/index";

export default {
  Builtins: Builtins,
  Core: Core,
  Text: Text,
  SVG: SVG,
  Views: Views,
  Utils: Utils,
  Geom: Geom,
  Bundles: Bundles,
};
