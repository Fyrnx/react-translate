import { useEffect, useState } from "react"

export const defaultState = {}

function useDelayedCallback() {
    const [timeoutFn,setTimeoutFn] = useState()

    function update(callback,delay) {
        clearTimeout(timeoutFn)
        setTimeoutFn(setTimeout(callback,delay))
    }

    return update
}


export default function useExtensionState(property,defaultValue,delay = 1000) {
    const [state,setState] = useState(defaultValue)
    const sendMessage = useDelayedCallback()

    const set = (value) => {
        if(typeof value == 'function') value = value(state)
        setState(value)
        sendMessage(_ => browser.runtime.sendMessage({'type':'setLocalStorage',[property]: value}),delay)
    }
    const get = browser.storage.local.get
    const getProperty = _ => browser.storage.local.get().then(x => x[property])


    useEffect(_ => {
        get().then(obj => {
            if(!obj) return
            if(!Reflect.has(obj,property)) {
                set(defaultValue != undefined ? defaultValue : defaultState[property])
                setState(defaultValue != undefined ? defaultValue : defaultState[property])
                return
            }
            
            setState(obj[property])
        })
    },[])

    browser.runtime.onMessage.addListener((message) => {
        if(message.type != 'localStateChange') return
        if(message[property] == undefined) return
        setState(message[property])
    })


    return [state,set,getProperty]
}