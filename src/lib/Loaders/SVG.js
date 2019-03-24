
/**
 * Utilities to load shapes from a URL or an input stream.
 */
export function loadFromURL(url, callback) {
    url = url.trim();
    $.get(url, function(data) {
         // var svgDoc = $.parseXML(data);
        parseDocument(data.rootElement, callback);
    });
}

export function loadFromString(input) {
}

export function parseDocument(root, callback) {
    if (root.tagName != "svg") {
        callback(null);
        return ;
    }

    callback(root);
}

