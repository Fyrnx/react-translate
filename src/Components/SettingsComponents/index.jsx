import React, { useEffect, useRef, useState } from "react"
import useEventListener from 'Hooks/useEventListener.jsx'
import useOnMove from 'Hooks/useOnMove.jsx';
import useClamp, {useClampedValue} from 'Hooks/useClamp.jsx';
import Icon,{IconButton} from 'Components/Icon/index.jsx';
import { createPortal } from "react-dom";
import useHotkeys, {hotkeyMap} from "Hooks/useHotkeys.jsx"
import "./style.scss"

export function Checkbox({checked,setChecked,title}) {
    return <span className="flex gap-3">
        <div className={`checkbox ${checked ? "checked" : ""}`} onClick={_ => setChecked(curr => !curr)}>
            <input type="checkbox" className="hiddenElement" onChange={e => setChecked(e.target.checked)} />
        </div>
        {title && <span onClick={_ => setChecked(curr => !curr)}>{title}</span>}
    </span>
}

export function Switch({checked,setChecked,title}) {
    return <span className="flex gap-3">
        <div className={`switch ${checked ? "checked" : ""}`} onClick={_ => setChecked(curr => !curr)}>
            <input type="checkbox" className="hiddenElement" onChange={e => setChecked(e.target.checked)} />
        </div>
        {title && <span onClick={_ => setChecked(curr => !curr)}>{title}</span>}
    </span>
}

export function RadioList({children,index,setIndex}) {
    return <div className={`radio-list`}>
        {children.map((ele,i) => {
            return <div key={i} className={`radio-item ${index == i? "checked" : ""}`}  onClick={_ => setIndex(i)} >
                <span className={`radio-button  ${index == i? "checked" : ""}`}/>
                {ele}
            </div>
        })}
    </div>
}
export function SelectList({children,index,setIndex}) {
    return <div className={`radio-select-list`}>
        {children.map((ele,i) => {
            return <div key={i} className={`radio-select-item ${index == i? "checked" : ""}`} onClick={_ => setIndex(i)}>
                {ele}
            </div>
        })}
    </div>
}

export function Button({children,type = 'transparent',clickEffect = true,outline = false,eleRef: elRef,...props}) {
    const [position, setPosition] = useState({left: 0, top: 0})
    let btnRef = useRef(null)
    const onCLick = (e) => {
        props?.onClick?.(e)
        if(!clickEffect || !btnRef?.current) return
        
        setPosition({left: e.nativeEvent.offsetX, top: e.nativeEvent.offsetY})
        btnRef.current.classList.remove('click-effect-active')
        setTimeout(_ => {
            btnRef.current.classList.add('click-effect-active')
        }, 0)
    }

    return <button ref={el => {
        if(el) btnRef = {current: el};
        elRef = {current: el}
        }}
        onClick={onCLick}
        className={`btn-${type} ${outline ? "outline" : ''} ${props.className ? props.className : ''}`.replace(/ +$/,'')}
        {...props}
        >
        <span className="click-effect-span" style={position}></span>
        {children}
    </button>
}

export function NumberInput() {} // TODO

export function StylePreview({style}) {
    return <div className="style-preview" style={{background: `linear-gradient(90deg,${style.background},${style.secondary})`}}>
        <span style={{color: style.text}}>{style.title}</span>
        <span className="line" style={{background: `linear-gradient(90deg,${style.primary.start},${style.primary.end})`}}></span>
    </div>
}
    
function HSLToHex(h,s,l,a = 1) {
    h = Math.trunc(h * 360)
    s = Math.trunc(s * 100) / 100
    l = Math.trunc(l * 100) / 100

    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c/2,
        r = 0,
        g = 0, 
        b = 0; 
  
    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

    // Having obtained RGB, convert channels to hex
    r = Math.round((r + m) * 255).toString(16).padStart(2,'0');
    g = Math.round((g + m) * 255).toString(16).padStart(2,'0');
    b = Math.round((b + m) * 255).toString(16).padStart(2,'0');
    a = Math.round(a * 255).toString(16).padStart(2,'0');

    return r + g + b + (a == 'ff' ? "" : a)
}

function HexToHSL(hex) {
    let result = hex.replace('#','').match(new RegExp(`.{${hex.replace('#','').length > 4 ? 2 : 1}}`,'g'))
  
    if (!result) {
      throw new Error("Could not parse Hex Color");
    }
  
    const rHex = parseInt(result[0], 16);
    const gHex = parseInt(result[1], 16);
    const bHex = parseInt(result[2], 16);
    const aHex = parseInt(result[3], 16);
  
    const r = rHex != null ? rHex / (hex.replace('#','').length > 4 ? 255 : 15) : 1;
    const g = gHex != null ? gHex / (hex.replace('#','').length > 4 ? 255 : 15) : 1;
    const b = bHex != null ? bHex / (hex.replace('#','').length > 4 ? 255 : 15) : 1;
    const a = aHex != null ? aHex / (hex.replace('#','').length > 4 ? 255 : 15) : 1;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
  
    let h = (max + min) / 2;
    let s = h;
    let l = h;
  
    if (max === min) {
      // Achromatic
      return { h: 0, s: 0, l: l * 100, a };
    }
  
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  
    s = s * 100;
    s = Math.round(s);
    l = l * 100;
    l = Math.round(l);
    h = Math.round(360 * h);
  
    return { h: h / 360, s: s / 100, l: l / 100, a };
}

export function ColorRange({style, gradient, pointerColor = "#0000", value, setValue}) {
    const [focus,setFocus] = useState(false)
    const   [input,setInput] = useState({width: 0,height: 0,left: 0,top: 0,ele: null})
    const pointerRef = useRef()
    let left = !input.ele ? 0 : value * input.width

    const Event = (e,optionalFocus = false) => {
        const {pageX, buttons} = e?.nativeEvent ?? e
        if(buttons != 1 || !input.ele?.classList.contains('focused') && !optionalFocus) return
        setValue((pageX - input.left) / input.width)
    }

    useEventListener('mousemove', Event, input.ele && focus)
    useEventListener('selectstart', e => e.preventDefault(), input.ele && focus)
    useEventListener('mouseup', _ => setFocus(false), input.ele)

    return <div
        ref={(ele) => {
            if(ele && !input.ele) setInput({...ele.getBoundingClientRect().toJSON(),ele})
        }}
        onMouseDown={e => {
            setFocus(true);
            Event(e,true)
        }}
        className={`input-color-range ${ focus ? "focused" : "" }`}
        style={{backgroundImage: gradient && `linear-gradient(90deg,${gradient.toString()})`,...style}}
    >
        <div ref={pointerRef} className="pointer" style={{pointerEvents: "none", left, background: pointerColor}}></div>
    </div>
}

function ColorCanvas({color, update}) {
    const [parent,setParent] = useState({width: 0,height: 0,left: 0,top: 0,ele: null})
    const pointerRef = useRef()
    const [position,setPosition] = useState({})
    const [focus,setFocus] = useState(false)

    useEffect(_ => {
        if(!color) return
        setPosition(hslToPosition(color));
    },[parent?.ele,color])

    function hslToPosition({s,l}) {
        if(!parent.ele) return
        l = l * 100
        let x = s * parent.width
        let ml = 100 - x / parent.width * 50
        let y = (l - ml) * parent.height / ml * -1
        
        return {left: x, top: y}
    }
    
    function PositionToHsl({left,top}) {
        if(!parent.ele) return
        let ml = 100 - left / parent.width * 50
        return {h: color.h * 360, s: left / parent.width * 100, l:ml - top / parent.height * ml}
    }

    function updatePosition(left,top) {
        left = useClamp({min: 0, value: left || 0, max: parent.width}),
        top = useClamp({min: 0, value: top || 0, max: parent.height})
        setPosition({left,top})

        let {s,l} = PositionToHsl({left, top})
        update(s / 100, l / 100)
    }

    function onMouseDown({pageX: left,pageY: top}) {
        if(!parent.ele) return
        setFocus(true)

        left -= parent.left + scrollX
        top -= parent.top + scrollY

        updatePosition(left,top)
    }

    function onMouseMove({pageX: left,pageY: top}) {
        if(!parent.ele) return
        left -= parent.left + scrollX
        top -= parent.top + scrollY

        updatePosition(left,top)
    }

    useEventListener('mousemove',onMouseMove,focus && parent?.ele)
    useEventListener('mouseup',_ => setFocus(false),focus && parent?.ele)

    return (
        <div
            ref={(ele) => {
                if(ele && !parent.ele) setParent({...ele.getBoundingClientRect().toJSON(),ele})
            }}
            className="color-canvas"
            draggable={false}
            onDragStart={e => e.preventDefault()}
        >
            <div className="canvas" onMouseDown={onMouseDown} style={{background: `linear-gradient(rgba(0,0,0,0),#000),linear-gradient(90deg,#fff,hsl(${color.h * 360},100%,50%))`}} />
            <div ref={pointerRef} className="pointer" style={{pointerEvents: "none",background: `hsl(${color.h * 360},${color.s * 100}%,${color.l * 100}%)`,...( position?.left == null ? {opacity: 0} : position)}} />
        </div>
    )
}

export function ColorPickerDialog({color = "#f00",onChange, onClosed, position = {left: 0, top: 0}}) {
    const [hue,setHue] = useClampedValue({min: 0, max: 1},0)
    const [saturation ,setSaturation] = useClampedValue({min: 0, max: 1},1)
    const [lightness,setLightness] = useClampedValue({min: 0, max: 1},.5)
    const [Alpha,setAlpha] = useClampedValue({min: 0, max: 1},1)
    const [inputValue,setInputValue] = useState(HSLToHex(hue * 360,saturation,lightness,Alpha))
    let colorFull = `hsl(${hue * 360},${saturation * 100}%,${lightness * 100}%,${Alpha})`
    let colorNoAlpha = `hsl(${hue * 360},${saturation * 100}%,${lightness * 100}%)`
    let colorOnlyHue = `hsl(${hue * 360},100%,50%)`
    
    useEffect(_ => {
        update(HexToHSL(color),true,false)
    },[])

    function update({h,s,l,a} = {},updateInput = true,send = true) {
        if(isNaN(a)) a = null
        else a = useClamp({min:0,max:1,value:a})
        h = useClamp({min:0,max:1,value:h})
        s = useClamp({min:0,max:1,value:s})
        l = useClamp({min:0,max:1,value:l})

        
        if(h != null) setHue(h)
        if(s != null) setSaturation(s)
        if(l != null) setLightness(l)
        if(a != null) setAlpha(a)
        
        if(updateInput) setInputValue(HSLToHex(h ?? hue,s ?? saturation,l ?? lightness,a ?? Alpha))
        if(send) onChange({h: h ?? hue, s: s ?? saturation, l: l ?? lightness, a: a ?? Alpha, hex: '#' + HSLToHex(h ?? hue,s ?? saturation,l ?? lightness,a ?? Alpha)})
    }

    return createPortal(
    <div className="color-picker-dialog bg-secondary" style={{left: position.left,top: position.top}}>
        <ColorCanvas color={{h: hue, s: saturation, l: lightness}} update={(s,l) => update({s,l})} />
        <div className="footer">
            <div className="color-sliders">
                <div className="color-display" style={{background: colorFull}}></div>
                <div className="sliders">
                    <ColorRange value={hue} setValue={h => update({h})} pointerColor={colorOnlyHue} classList="hue" gradient={Array.from({length: 18}).map((_,i) => `hsl(${360 / 18 * i},100%,50%)`)} />
                    <ColorRange value={Alpha} setValue={a => update({a})} pointerColor={colorFull} classList="alpha" gradient={["transparent",colorNoAlpha]} />
                </div>
            </div>
            <div className="flex justify-between gap-2">
                <input type="text" className="hex bg-active" value={inputValue} style={{textAlign:"center"}} onChange={({target}) => {
                    setInputValue(target.value)
                    if([3,4,6,8].some(x => x == target.value.match(/[0-9a-f]+/g).join('').length)) {
                        let color = HexToHSL(target.value)
                        if(isNaN(color.a)) color.a = 1

                        update(color,false)
                    }
                }}/>
                <Button type='active' style={{flexShrink: 0}} clickEffect={false} onClick={_ => 
                    onClosed?.({h: hue, s: saturation, l: lightness, a: Alpha, hex: '#' + HSLToHex(hue,saturation,lightness,Alpha)})
                }><Icon name="xmark"/></Button>
            </div>
        </div>
    </div>,
    document.querySelector("#translate-popup-root")
    )
}

export function ColorPicker({color,setColor,style}) {
    const [opened,setOpened] = useState(false)
    const [position, setPosition] = useState()
    const wrapperRef = useRef()
    
    useEventListener('mousedown',(e) => {
        let {target} = e
        if(
            opened &&
            wrapperRef?.current &&
            !(
                wrapperRef?.current?.contains(target) ||
                [...document.querySelectorAll('.color-picker-dialog')]?.some(dialog => dialog.contains(target))
            )
            ) setOpened(false)
    },opened)

    useEffect(_ => {
        setTimeout(_ => {
            let position = wrapperRef?.current?.getBoundingClientRect().toJSON()
            if(position?.top != undefined) position.top += 50
            setPosition(position)
        },400)
    },[wrapperRef?.current])
    
    return <>
        <div ref={wrapperRef} className="color-picker" style={{background:color,...style}} onClick={_ => setOpened(curr => !curr)} ></div>
        {opened && <ColorPickerDialog position={position} color={color} onChange={color => setColor(color.hex)} onClosed={_ => setOpened(false)} />}
    </>
}

export function GradientPicker({gradient = {},setGradient = _ => _}) {
    const setStart = color => setGradient({start: color,end: gradient.end})
    const setEnd = color => setGradient({start: gradient.start,end: color})

    return <div className="gradient-picker" style={{background: `linear-gradient(90deg,${gradient.start} 2em,${gradient.end} calc(100% - 2em)`}}>
        <ColorPicker color={gradient.start} style={{opacity: 1}} setColor={setStart}/>
        <ColorPicker color={gradient.end} style={{opacity: 1}} setColor={setEnd}/> 
    </div>
}

export function KeyCombinationInput({title,onChange,defaultKeys = []}) {
    const [active, setActive] = useState(false)
    const [keys, setKeys] = useState(defaultKeys)
    const [FrozenDefaultKeys] = useState(defaultKeys)
    const [position, setPosition] = useState()
    const wrapperRef = useRef()

    useEffect(_ => {
        defaultKeys = defaultKeys.map(x => {if(!x.id) x.id = crypto.randomUUID()})
    },[])
    
    useEffect(_ => {
        setTimeout(_ => {
            let position = wrapperRef?.current?.getBoundingClientRect().toJSON()
            if(position?.top != undefined) position.top = `calc(${position.top}px + 3em)`
            setPosition(position)
        },400)
    },[wrapperRef])

    return <>
        <div
        ref={wrapperRef}
        className="key-combination-display bg-secondary flex center padding-2 gap-2 br"
        onClick={_ => {setActive(curr => !curr)}}
        >
            {keys?.map(({ctrl,shift,alt,key,id},index) => {
                return <React.Fragment key={id ?? index}>
                    <div className="key-combination-wrapper flex center gap-2">
                        {ctrl && <span className="bg-active">ctrl</span>}
                        {shift && <span className="bg-active">shift</span>}
                        {alt && <span className="bg-active">alt</span>}
                        {key && <span className="bg-active">{key}</span>}
                    </div>
                    {index != keys.length -1 &&  <div className="divider bg-active br"></div>}
                </React.Fragment>
            })}
            {keys?.length == 0 && <div>
                <Icon name="plus" />
            </div>}
        </div>
        {active && <KeyCombinationInputDialog title={title} onChange={keys => {
            setActive(false)

            if(!keys) return
            setKeys(keys)
            onChange(keys)
        }} defaultKeys={FrozenDefaultKeys} currentKeys={keys} position={position}  />}
    </>
} // TODO HELP ME

const MAX_KEY_COMBINATION_LENGTH = 3

export function KeyCombinationInputDialog({title, onChange, currentKeys, defaultKeys = [],position = {top: 0,left: 0}}) {
    const [keys, setKeys] = useState(currentKeys)
    const [capturingId,setCapturingId] = useState(null)

    useEffect(_ => {
        defaultKeys = defaultKeys.map(x => {if(!x.id) x.id = crypto.randomUUID()})
    },[])

    useEventListener('keydown',(event) => {
        let {key,shiftKey,altKey,ctrlKey} = event
        event.preventDefault()
        event.stopPropagation()

        if(['alt','shift','control','meta'].some(x => x == key.toLowerCase())) return
        if(key == "Tab") key = "tab ↹"
        if(key == "CapsLock") key = "CapsLock ⇪"
        else key = hotkeyMap[key.toLowerCase()] ?? key

        setKeys(curr => {
            let arr = [...curr]
            let objIndex = arr.findIndex(x => x.id == capturingId)
            arr[objIndex] = {...arr[objIndex],key,shift: shiftKey,alt: altKey,ctrl: ctrlKey}
            return arr
        });
    },capturingId != null)
    useEventListener('mousedown',({target}) => {
        let dialog = document.querySelector('.key-combination-dialog')
        if(!dialog || target == dialog || !dialog.contains(target)) changeCapturingId(null)
    },capturingId != null)
    // FIXME when pressing shift with a key the symbol it returns is the shifted key like (`) -> (~) best if we ignore this transform and may make the numPad numbers deferent from the normal ones 

    function changeCapturingId(newId = null) {
        setKeys(curr => curr.filter(x => x.key || x.id == newId))
        setCapturingId(newId)
    }

    return createPortal(
    <div className="key-combination-dialog bg-secondary flex justify-between dir-column padding-4 gap-4" style={{position:"absolute",left: position.left,top: position.top}}>
        <div className="flex dir-column gap-4">
            <div className="header bg-active flex center">{title}</div>
            {keys.map(({key,ctrl,shift,alt,id},index,arr) => {
                let inCaptureMode = capturingId && capturingId == id

                return <div key={id ?? index} className={`flex justify-between align-center`}>
                    <div
                    style={inCaptureMode ? {left: "50%", translate: "-50%"} : {}}
                    onClick={_ => setCapturingId(id)}
                    className="key-combination-wrapper flex center gap-2"
                    >
                        {ctrl && <span className="bg-active">ctrl</span>}
                        {shift && <span className="bg-active">shift</span>}
                        {alt && <span className="bg-active">alt</span>}
                        <span className="bg-active">{key}</span>
                    </div>
                    <div>
                        <IconButton
                        className={"delete-Btn"}
                        style={inCaptureMode ? {opacity: 0,pointerEvents: 'none'} : {}}
                        onClick={_ => {
                            setKeys(arr.filter((_,i) => i != index))
                        }}
                        >
                            <Icon name="trash" version={2} type="regular" />
                        </IconButton>
                    </div>
                </div>
            })}
            {keys.length < MAX_KEY_COMBINATION_LENGTH && <IconButton 
                onClick={_ => { 
                    const id = crypto.randomUUID()
                    setKeys(curr => {
                        return [...curr,{id}]
                    })
                    changeCapturingId(id)
                }}
            ><Icon name="plus" /></IconButton>}
        </div>
        <div className="controls flex justify-between">
            <Button type='active' onClick={_ => setKeys(defaultKeys)} >restart</Button>
            <div className="flex gap-4">
                <Button type='primary' onClick={_ => onChange(keys.filter(x => x.key))} >save</Button>
                <Button type='active' onClick={_ => onChange()} ><Icon name="xmark" /></Button>
            </div>
        </div>
    </div>,
    document.querySelector("#translate-popup-root")
    )
} // TODO HELP ME

/* FIXME:
ColorPickerDialog and KeyCombinationInputDialog need improvement
- not going out of the window 
- grab the the button position every time the dialog in being opened
*/