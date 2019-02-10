// import `.scss` files
import './scss/styles.scss';

// import Sistine class
import * as shapes from './lib/shapes';
import * as stage from './lib/stage';
import * as registry from './lib/registry';
import * as events from './lib/events';
import * as stringutils from './utils/string';
import * as domutils from './utils/dom';

const Sistine = {
    'core': shapes,
    'stage': stage,
    'registry': registry,
    'events': events,
    'utils': {
        'string': stringutils,
        'dom': domutils
    }
}

// export default UserList class
// I used `defaultExport` to state that variable name doesn't matter
export default Sistine;
