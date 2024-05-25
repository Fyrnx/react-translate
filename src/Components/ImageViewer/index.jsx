import { useEffect, useRef, useState } from "react"
import useEventListener from "Hooks/useEventListener.jsx"
import useDisableScrolling from "Hooks/useDisableScrolling.jsx"
import clamp, {useClampedValue} from "Hooks/useClamp.jsx"
import Icon from "Components/Icon/index.jsx"

import "./style.css"
import { createPortal } from "react-dom"

const scrollAmount = 100

function useMiddleScroll(callback, delay = 10) {
    const [mousePressed, setMousePressed] = useState({state: "notPressed",event: null})
    const [scrollInterval, setScrollInterval] = useState(null)
    
    function addInterval(distance,event) {
        setScrollInterval(curr => {
            if(curr) clearInterval(curr)
            return setInterval(_ => callback(distance,event), delay)
        })
    }

    function MouseMove(event) {
        if(mousePressed.state != 'pressed') return
        const
            {pageX: savedX, pageY: savedY} = mousePressed.event,
            {pageX:x, pageY:y} = event,
            dx = x - savedX,
            dy = y - savedY

        addInterval({dx,dy},event)
    }

    function MouseDown(event) {
        if(event.button != 1) return

        event.preventDefault()
        setMousePressed({state: "once",event})
        clearInterval(scrollInterval)
    }

    useEventListener('mouseup', _ => setMousePressed(curr => {if(mousePressed.state == 'once') return {...curr, state: "pressed"}}), mousePressed.state == 'once')
    useEventListener('mousemove', MouseMove, mousePressed.state == 'pressed')
    useEventListener('mousedown', _ => {
        setMousePressed({state: "notPressed",event: null})
        clearInterval(scrollInterval)
    }, mousePressed.state == 'pressed')


    return [MouseDown,mousePressed]
}

function useZoom({min,max,zoomingDurationSec = 1}) {
    const [zoomLevel,setZoomLevel] = useState(1)
    const [zooming,setZooming] = useState(false)

    function set(amount) {
        setZoomLevel(curr => {
            if(amount == undefined) return curr
            const value = typeof amount == "function" ? amount(curr) : amount
            return clamp({min,max,value})
        });

        clearTimeout(zooming)
        const timeout = setTimeout(_ => setZooming(null), zoomingDurationSec * 1000)
        setZooming(timeout)
    }

    return [zoomLevel, set, zooming]
}

function AnchorPoint({event = {pageX: 0, pageY: 0}} = {}) {
    return createPortal(
        <div style={{left: event.pageX, top: event.pageY}} className="anchor-point">
            <span></span>
        </div>,
        document.querySelector("#translate-popup-root")
    );
}

function MouseFollower({event = {pageX: 0, pageY: 0}} = {}) {
    const ref = useRef()

    useEventListener('mousemove',({pageX,pageY}) => {
        if(!ref.current) return
        ref.current.animate({left: `${pageX}px`,top: `${pageY}px`},{duration: 10,fill: "forwards"})
    },ref.current)

    return createPortal(
        <div ref={ref} style={{left: event.pageX, top: event.pageY}} className="mouse-follower">
            <span style={{left: "50%",top: "0%",translate: "-50%",rotate: "0deg"}}></span>
            <span style={{right: "0%",bottom: "50%",translate: "0 50%",rotate: "90deg"}}></span>
            <span style={{left: "50%",bottom: "0%",translate: "-50% 0",rotate: "180deg"}}></span>
            <span style={{left: "0%",bottom: "50%",translate: "0 50%",rotate: "270deg"}}></span>
        </div>,
        document.querySelector("#translate-popup-root")
    );
}

function Controls({scale,setScale,image,callback,close}) {
    return (<div className="image-controls" style={{display: "flex"}}>
        <button className="zoom-count" onClick={_ => setScale(1)}>{Math.trunc(scale * 100)}%</button>
        <a className="download-button" href={image} download={true} ><Icon name="arrow down" /></a>
        {callback && <button className="translate-button" onClick={_ => callback(image)}><Icon name="subtitles" /></button>}
        <button className="translate-button" onClick={_ => close()}><Icon name="xmark" className='fa-lg' /></button>
    </div>)
}

export default function ImageViewer({ image, speed = 1, width = 1000,height = 1000, padding = 10, callback, style = {} }) {
    const containerRef = useRef()
    const [startPoint, setStartPoint] = useState(null)
    const [position, setPosition] = useState({left: 0,top: 0})
    const [scale,setScale,zooming] = useZoom({min: .1, max: null})
    const [size,setSize] = useState({width: null,height: null})
    const [MiddleScroll,middleScrollState] = useMiddleScroll(({dx,dy}) => {
        moveBy({
            x: -dx,
            y: -dy
        })
    })
    
    const saveImageNaturalSize = (img) => {
        if(!img || size.width != null) return
        
        setSize({
            width: img.naturalWidth,
            height:  img.naturalHeight
        })

        setPosition({
            left: (width - img.naturalWidth) /2,
            top: (height - img.naturalHeight) /2
        })
    }
    
    // (scale = scale) means it will use the default scale unless you add new one 
    const clampX = (value, currentScale = scale) => {
        const currentImgWidth = size?.width * currentScale

        let obj = {
            value,
            min: Math.min(width - currentImgWidth - padding, padding),
            max: Math.max(width - currentImgWidth - padding, padding)
        }
        
        return clamp(obj)
    }
    
    // (scale = scale) means it will use the default scale unless you add new one 
    const clampY = (value, currentScale = scale) => {
        const currentImgHeight = size?.height * currentScale
        
        let obj = {
            value,
            min: Math.min(height - currentImgHeight - padding, padding),
            max: Math.max(height - currentImgHeight - padding, padding)
        }
    
        return clamp(obj)
    }

    const moveBy = ({x = 0,y = 0,currentScale = scale} = {}) => {
        // if(size.width * (currentScale = scale ?? 1) < width) x *= -1
        // if(size.height * (currentScale = scale ?? 1) < height) y *= -1

        setPosition(curr => {
            return {
                left: clampX(curr.left + x,currentScale = scale),
                top: clampY(curr.top + y,currentScale = scale)
            }
        })
    }

    const moveTo = ({x = 0,y = 0,currentScale = scale} = {}) => {
        setPosition({
            left: clampX(x,currentScale),
            top: clampY(y,currentScale)
        })
    }

    const dx = (newScale) => {
        let left = width/2 - position.left
        left *= (newScale / scale)

        return width /2 - left
    }

    const dy = (newScale) => {
        let top = height/2 - position.top
        top *= (newScale / scale)

        return height /2 - top
    }

    const MouseDown = ({ pageX, pageY, button }) => {
        if(button == 1) return
        setStartPoint({ x: pageX, y: pageY })
    }

    const MouseMove = ({ pageX, pageY, shiftKey }) => {
        if (!startPoint) return
        
        const
            dx = (pageX - startPoint.x) * (shiftKey ? 1 : speed / scale),
            dy = (pageY - startPoint.y) * (shiftKey ? 1 : speed / scale)

        moveBy({x: dx, y: dy})
    }

    const Zoom = ({wheelDelta}) => {
        const dir = wheelDelta > 0 ? 1 : -1
        let newScale = (scale + dir /10)
        if(typeof newScale == "number") newScale = +newScale.toFixed(2)
        if(newScale == 0) return
        setScale(newScale)
        moveTo({
            x: dx(newScale),
            y: dy(newScale),
            scale: newScale
        })
    }

    const Wheel = (event) => {
        event.preventDefault()
        if(event.ctrlKey) return Zoom(event)
        if(startPoint) return

        const
            {wheelDelta, shiftKey} = event,
            dir = wheelDelta > 0 ? 1 : -1,
            amount = scrollAmount * dir

        if(shiftKey) moveBy({x: amount})
        else moveBy({y: amount})
    }

    useEventListener('mouseup', _ => setStartPoint(null), startPoint)
    useEventListener('wheel', Wheel, true, {passive: false, elementRef: containerRef})
    useEventListener('mousedown', event => {MouseDown(event);MiddleScroll(event)}, true, {elementRef: containerRef})

    return (
        <div ref={containerRef} className="image-viewer" style={{...style,...{width,height}}} onMouseMove={MouseMove} >
            <img ref={saveImageNaturalSize} style={{...position,width: size.width * scale,height: size.height * scale,opacity: size.width ? 1 : 0}} src={image}/>
            {middleScrollState.state == "pressed" && <AnchorPoint event={middleScrollState.event} />}
            {middleScrollState.state == "pressed" && <MouseFollower event={middleScrollState.event} />}
            <Controls scale={scale} setScale={setScale} image={image} callback={callback} close={callback} />
        </div>
    )
}