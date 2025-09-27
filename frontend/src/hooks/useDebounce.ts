import { useEffect, useState } from "react"

export const useDebounce=(value:string,delay:number)=>{
    const [debounceValue,setDebounceValue] = useState(value)

    useEffect(()=>{
        const timeoutRef = setTimeout(() => {
            setDebounceValue(value)
        }, delay);

        return ()=>{
            clearTimeout(timeoutRef)
        }
    },[value,delay])

    return debounceValue
}