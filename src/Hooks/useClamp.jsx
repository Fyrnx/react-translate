import { useState } from "react";

export default function useClamp({ value, min = null, max = null, prefer = "min" }) {
    let applyMin = false, applyMax = false;
    if (max != null && value > max) applyMax = true;
    if (min != null && value < min) applyMin = true;

    if (applyMin && applyMax) return (prefer == "max") ? max : min;
    else if (applyMin) return min
    else if (applyMax) return max
    else return value
}

export function useClampedValue({min,max},initialValue) {
    const [state,setState] = useState(initialValue)

    let setClampedState = value => {
        if(typeof value == "function") setState(curr => {
            let result = value(curr)
            return useClamp({min,max,value: result})
        })

        else setState(useClamp({min,max,value}))
    }

    return [state,setClampedState]
}
