// import './scss/styles.scss'

// import Sistine class
// import * as lib from "./lib/index";

// export default UserList class
// I used `defaultExport` to state that variable name doesn't matter
// export default lib.Sistine;

// import Sistine class
import Core from "./Core/index";
import Text from "./Text/index";
import Geom from "./Geom/index";
import SVG from "./SVG/index";
import Views from "./Views/index";
import Utils from "./Utils/index";
import Bundles from "./Bundles/index";
import Builtins from "./Builtins/index";

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
