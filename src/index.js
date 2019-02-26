// import `.scss` files
import './scss/styles.scss';

// import Sistine class
import * as core from './lib/core';
import * as panes from './lib/panes';
import * as stage from './lib/stage';
import * as styles from './lib/styles';
import * as handlers from './lib/handlers';
import * as events from './lib/events';
import { Registry } from './lib/registry';
import * as stringutils from './utils/string';
import * as domutils from './utils/dom';

const Sistine = {
    'core': core,
    'panes': panes,
    'stage': stage,
    'styles': styles,
    'handlers': handlers,
    'events': events,
    'registry': Registry,
    'utils': {
        'string': stringutils,
        'dom': domutils
    }
}

// export default UserList class
// I used `defaultExport` to state that variable name doesn't matter
export default Sistine;
