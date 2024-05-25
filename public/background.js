function capture(rect = {}) {
    return browser.tabs.captureVisibleTab(
        null, // optional integer
        {rect} // optional extensionTypes.ImageDetails
      )
}

async function getTabsId(...exclude) {
    return (await browser.tabs.query({})).map(x => x.id).filter(id => !exclude.some(x => x == id))
}

function sendMessage(message,...ids) {
    ids.forEach(id => {
        browser.tabs.sendMessage(id, message)
    })
}

browser.runtime.onMessage.addListener(async (message,sender,sendResponse) => {
    if(message.type == "capture") sendResponse(capture(message.rect))
    if(message.type == "setLocalStorage") {
        delete message.type
        browser.storage.local.set(message)
        sendMessage({type: 'localStateChange', ...message},...(await getTabsId(sender.tab.id)))
    }
})

async function main() {
    // console.log(await capture({x: 0, y: 0, width: 200, height: 200}))
    const browserActionListener = event => {
        browser.tabs.create({url: browser.runtime.getURL("settings.html")})
    }

    browser.browserAction.onClicked.addListener(browserActionListener)
}

main()