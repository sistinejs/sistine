// export `concat` function which joins strings by space
export function concat(...strings){
    return strings.join(' ');
}

/**
 * Converts a hyphenated string into camelcase.
 */
export function toCamelCase(hyphenated) {
    return hyphenated;
}

/**
 * JavaScript Get URL Parameter
 *
 * @param String prop The specific URL parameter you want to retreive the value for
 * @return String|Object If prop is provided a string value is returned, otherwise an object of all properties is returned
 */
export function getUrlParams( prop ) {
    var params = {};
    var search = decodeURIComponent( window.location.href.slice( window.location.href.indexOf( '?' ) + 1 ) );
    var definitions = search.split( '&' );

    definitions.forEach( function( val, key ) {
        var parts = val.split( '=', 2 );
        params[ parts[ 0 ] ] = parts[ 1 ];
    } );

    return ( prop && prop in params ) ? params[ prop ] : params;
}
