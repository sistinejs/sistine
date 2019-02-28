
// import Sistine class
import * as core from './Core/index';
import * as views from './Views/index';
import { Registry } from './registry';
import * as utils from './Utils/index';

const Sistine = {
    'Core': core,
    'Views': views,
    'Utils': utils,
    'Registry': Registry,
}

// export default UserList class
// I used `defaultExport` to state that variable name doesn't matter
export default Sistine;
