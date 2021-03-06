
import { Int } from "../Core/types"

// export `concat` function which joins strings by space
export function insert<T>(array : Array<T>, value : T, index : Int = -1) : Array<T>{
    index = index || array.length;
    if (index < 0)
        index = array.length;
    array.splice(index, 0, value);
    return array;
}

