import "./style.css";

let generalStyle = { background: "var(--interactive-color)","WebkitBackgroundClip": 'text',"WebkitTextFillColor": "#0000" }

export default function Icon({useGeneralStyle = false,style = {},name,type = 'solid',path,version = 1,...props} = {}) {

    if(path) return (<img style={{...style,...(useGeneralStyle ? generalStyle : {})}} src={path} />)
    return (<i {...props} style={{...style,...(useGeneralStyle ? generalStyle : {})}} className={`fontawesome-icon ${version ? `ver-${version}` : ""} fa-${name.toLowerCase().replace(/ /g,'-')} fa-${type} ${props.className ?? ""}`.replace(/ $/g,'')}></i>)
}

export function IconMask({path,background,style = {},...props}) {
    let generatedStyle = {}
    if(background) generatedStyle['background'] = background
    if(path) generatedStyle['mask'] = `url("${path}")`

    return (<span {...props} className={`svg-element`} style={{...style,...generatedStyle}}></span>)
}

export function IconButton({children,shadow,noBackground = true,className,...props}) {
    return <button {...props} className={`${noBackground ? "no-background" : ""} svg-button ${className ?? ""}`}>
        {children}
        {
            shadow && <span className="shadow">
                {children}
            </span>
        }
    </button>
}