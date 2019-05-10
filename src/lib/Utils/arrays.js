
// export `concat` function which joins strings by space
export function insert(array, value, index) {
    index = index || array.length;
    if (index < 0)
        index = array.length;
    array.splice(index, 0, value);
    return array;
}

