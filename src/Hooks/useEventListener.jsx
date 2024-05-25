import { useEffect, useState } from "react";

const Functions = []

export default function useEventListener(type,callback,active,options = {}) {
  const [index,setIndex] = useState()
  const element = options.elementRef ? options.elementRef.current : document.documentElement
  const fn = Functions?.[index]

  useEffect(_ => { 
    Functions.push(null)
    setIndex(Functions.length - 1)

    return _ => element.removeEventListener(type, fn, options)
  },[])

  if(!element) return

  element.removeEventListener(type, fn, options)
  if(active && index != null) { 
    element.addEventListener(type, callback, options)
    Functions[index] = callback
  }
}

// TODO: implement once functionality