import { useState } from "react";
import useEventListener from "Hooks/useEventListener.jsx";
import useHotkeys from "Hooks/useHotkeys.jsx";
import clamp from "Hooks/useClamp.jsx";

export default function useOnMove({initialState = {x: 0,y: 0},distance = 40,hotkey,size,margin = 0,parent = document.documentElement} = {}) {
    let [position, setPosition] = useState(initialState)
    let [startPoint, setStartPoint] = useState(null)
    let [distanceMoved, setDistanceMoved] = useState(false)
    let [hotkeyEnabled, setHotkeyEnabled] = useState(false)

    if(hotkey) useHotkeys({
        active: true,
        hotkeys: {
            [hotkey]:  _ => setHotkeyEnabled(true)
        },
        hotkeysReleased: {
            [hotkey]:  _ => setHotkeyEnabled(false)
        },
    })

    function clampX(value) {
        return clamp({min: margin + parent.offsetLeft, value, max: (parent.clientWidth + parent.offsetLeft) - size.width - margin})
    }
    function clampY(value) {
        return clamp({min: margin + parent.offsetTop, value, max: (parent.clientHeight + parent.offsetTop) - size.height - margin})
    }

    function onMouseDown(event) {
        if(hotkey && !hotkeyEnabled) return
        setStartPoint({x: event.pageX, y: event.pageY,position});
    }
    
    function onMouseMove(event) {
        if (!startPoint) return;

        
        let {pageX, pageY} = event
        let dx = pageX - startPoint?.x ?? 0 
        let dy = pageY - startPoint?.y ?? 0
        let dz = Math.sqrt(dx * dx + dy * dy)
        
        if(dz > distance) setDistanceMoved(true)
        if(!distanceMoved) return
        
        setPosition({
            x: clampX((startPoint.position?.x ?? 0) + dx),
            y: clampY((startPoint.position?.y ?? 0) + dy)
        })
    }

    function onMouseUp() {
        setStartPoint(null)
        setDistanceMoved(false)
        setHotkeyEnabled(false)
    }

    useEventListener("mousemove",onMouseMove, startPoint);
    useEventListener("mouseup",onMouseUp, startPoint);
    return {position, onMouseDown, distanceMoved, hotkeyEnabled, setPosition};
}