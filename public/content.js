const improtScript = async path => import(browser.runtime.getURL(path)) 

const root = document.createElement('div')
root.id = "translate-popup-root"

document.body.appendChild(root)


improtScript("./assets/index.js")