import { createContext, useContext, useState } from "react"
import {Switch, ColorPicker, GradientPicker, RadioList, StylePreview, Button, KeyCombinationInput} from "Components/SettingsComponents/index.jsx"
// import useExtensionState from "Hooks/useExtensionState.jsx"
const settingContext = createContext({})
import "./index.scss"

/**
 * return option used in <Section /> element
 * @param {object} obj 
 * @param {React.JSX.Element} obj.children the option elements
 * @param {string} obj.title the option title
 * @param {'normal'|'list'} obj.type determines the type of the option
 */

function Option({children,title,oneLine = true}) {
    return <div className={`option ${oneLine ? "one-line" : ""}`}>
        {title && <div className="option-head flex">{title}</div>}
        <div className="option-body">
            {children}
        </div>
    </div>
}

function Group({children,title,dir = 'column'}) {
    return <div className="group flex dir-column gap-3 padding-3">
        {title && <div className="group-head flex">{title}</div>}
        <div className={`group-body flex wrap gap-3 dir-${dir} ${!title ? "no-padding" : ""}`}>
            {children}
        </div>
    </div>
}

function Section({children,title,dir = 'column'}) {

    children = Array.isArray(children) ? [...children] : [children]
    let groups = []
    let elements = []
    children.forEach(x => {
        x.type == Group ? groups.push(x) : elements.push(x)
    })

    return <div className={`section`}>
        {title && <div className="section-head flex">{title}</div>}
        {elements.length > 0 && <Group dir={dir}>
            {elements}
        </Group> }
        {groups}
    </div>
}

function Preferences() {
    const {preferences,setSettings} = useContext(settingContext)
    const {behavior, viewer, browserAction} = preferences

    const setRadio = (name, value) => {
        setSettings(
            {preferences: {...preferences,[name]: value}}
        )
    }

    return <>
    
        <Section title="image capturing">
            <Group title="after capturing">
                <Option oneLine={false}>
                    <RadioList index={behavior} setIndex={value => setRadio('behavior',value)}>
                        <span>extract text</span>
                        <span>view image</span>
                        <span>download image</span>
                    </RadioList>
                </Option>
            </Group>
            <Group>
                <Option title="viewer place" oneLine={false} >
                    <RadioList index={viewer} setIndex={value => setRadio('viewer',value)}>
                        <span>blow</span>
                        <span>side</span>
                        <span>popup</span>
                    </RadioList>
                </Option>
            </Group>
        </Section>

        <Section title="browser action">
            <Option title="addon button" oneLine={false} >
                <RadioList index={browserAction} setIndex={value => setRadio('browserAction',value)}>
                    <span>toggle translator</span>
                    <span>open options</span>
                    <span>open options as popup</span>
                </RadioList>
            </Option>
        </Section>

    </>

}

function Theme() {
    const {theme,setSettings} = useContext(settingContext)
    const {colors,styles,selectedStyle,divideLineType,blurShadow} = theme
    
    const setColor = (name,value) => {
        setSettings(
            {theme: {...theme,colors: {...colors,[name]: value}}}
        )
    }

    return <>
        <Section title='Styles' dir="row">
            {styles?.map((style,index) => {
                return <Button key={index} onClick={_ => setSettings(
                    {theme: {...theme, selectedStyle: index}}
                )}>
                    <StylePreview style={styles[index]} />
                </Button>
            })}

            <Button onClick={_ => setSettings(
                    {theme: {...theme, selectedStyle: 'custom'}}
                )}>
                    <StylePreview style={{...colors,title: "custom"}} />
            </Button>
        </Section>

        <Section title="Advance" className="flex gap-3">
            <Option title="background">
                <ColorPicker color={colors.background} setColor={value => setColor('background',value)}/>
            </Option>
            <Option title="primary">
                <GradientPicker gradient={colors.primary} setGradient={value => setColor('primary',value)}/>
            </Option>
            <Option title="active">
                <ColorPicker color={colors.active} setColor={value => setColor('active',value)}/>
            </Option>
            <Option title="secondary">
                <ColorPicker color={colors.secondary} setColor={value => setColor('secondary',value)}/>
            </Option>
            <Option title="text">
                <ColorPicker color={colors.text} setColor={value => setColor('text',value)}/>
            </Option>
            <Group>
                <Option title="divide line">
                    <RadioList index={divideLineType.type} setIndex={i => {
                        setSettings(
                            {theme: {...theme, divideLineType: {...divideLineType,type: i}}}
                        )
                    }} >
                        <span>none</span>
                        <span>text</span>
                        <span>primary</span>
                        <span><GradientPicker gradient={divideLineType.custom} setGradient={value => {
                            setSettings(
                                {theme: {...theme,divideLineType: {...divideLineType,custom: value}}}
                            )
                        }} /></span>
                    </RadioList>
                </Option>
            </Group>
            <Group>
                <Option title="blur shadow">
                    <Switch checked={blurShadow} setChecked={checked => {
                        setSettings({
                            theme: {...theme, blurShadow:  typeof checked != 'function' ? checked : !blurShadow}
                        })
                    }} />
                </Option>
            </Group>
        </Section>

    </>
}

function Keybinds() {
    const {keybinds,setSettings} = useContext(settingContext)

    let groups = Object.entries(keybinds).map(([keybind,options]) => {
        return  <Group key={keybind} title={keybind}>
            {Object.entries(options).map(([option,value]) => {
                return <Option key={option} title={option}>
                    <KeyCombinationInput title={option} onChange={value => {
                        setSettings({
                            keybinds: {
                                ...keybinds,
                                [keybind]: {
                                ...options,
                                [option]: value
                            }}
                        })
                    }} defaultKeys={value} />
                </Option>
            })}
        </Group>
    })

    return <>
        <Section title="main keybinds">
            {groups}
        </Section>
    </>
}



export default function Settings() {
    const [settings, setSettings] = useState({
        preferences: {
            behavior: 0,
            viewer: 0,
            browserAction: 0
        },
        theme: {
            selectedStyle: 0,
            styles: [
                {
                    title: "Cyper",
                    background: '#00000088',
                    active: '#050510',
                    secondary: "#0F0F1A",
                    text: '#fff',
                    primary: {start: '#7F00FF', end: "#053CFF"}
                },
                {
                    title: "Cyper",
                    background: '#00000088',
                    active: '#050510',
                    secondary: "#0F0F1A",
                    text: '#fff',
                    primary: {start: '#7F00FF', end: "#053CFF"}
                },
                {
                    title: "Cyper",
                    background: '#00000088',
                    active: '#050510',
                    secondary: "#0F0F1A",
                    text: '#fff',
                    primary: {start: '#7F00FF', end: "#053CFF"}
                }
            ],
            colors: {
                background: '#00000088',
                active: '#050510',
                secondary: "#0F0F1A",
                text: '#fff',
                primary: {start: '#7F00FF', end: "#053CFF"}
            },
            divideLineType: {
                type: 0,
                custom: {start: '#000', end: '#000'}
            },
            blurShadow: false
        },
        keybinds: {
            "translate popup": {
                "toggle": [],
                "toggle footer": []
            },
            "movement": {
                "move": [],
                "move to home": []
            },
            "image capturing": {
                "capture image": []
            },
            "translate": {
                "swap languages": [],
                "auto detect": []
            },
            "sizing": {
                "default size": []
            }
        }
    })

    const [activeTab, setActiveTab] = useState('keybinds')

    return (<div className="settings-wrapper flex gap-3 padding-3" style={{paddingRight: 0}}>
    <settingContext.Provider value={{...settings,setSettings: (object) => setSettings(curr => ({...curr,...object}))}}>
        <div className="side-nav flex dir-column bg-secondary">
            {
                Object.keys(settings).map((key) => {
                    return <button key={key} onClick={_ => setActiveTab(key)} style={{padding: `var(--padding-3)`}} className={`flex center ` + (activeTab == key ? `bg-primary` : "no-background")}>{key}</button>
                })
            }
        </div>
        <div className="content" style={{background: "#0001"}}>
            {activeTab == 'preferences' && <Preferences /> }
            {activeTab == 'theme' && <Theme /> }
            {activeTab == 'keybinds' && <Keybinds /> }
        </div>
    </settingContext.Provider>
    </div>)
}