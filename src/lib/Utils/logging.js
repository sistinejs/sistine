
export const LOG_CONTEXT = true;
export const LOG_LINES = [];

export function debug() {
    if (LOG_CONTEXT) {
        console.log.apply(null, arguments);
        var line = "";
        for (var i = 0;i < arguments.length;i++) {
            line += arguments[i];
        }
        LOG_LINES.push(line);
    }
}

