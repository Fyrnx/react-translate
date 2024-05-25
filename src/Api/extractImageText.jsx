/**
 * return all the text in the image
 * @param {File} file the image file
 * @returns {Promise<string>}
 */

export default async function extractImageText(file) {
    async function fun({evaluate,getFile,page}) {
        let [file] = getFile({convert: "file"})

        await evaluate(async ({wait,sleep}) => {
            (await wait('[jsname=O39Ylc]'))[0].click();
            (await wait('[data-action=eHVvOc]'))[0].click();
        })

        let input = await page.waitForSelector('input')
        await input.uploadFile(file.fileInfo.path)
        await page.waitForNavigation()

        return await evaluate(async ({wait,sleep}) => {
            (await wait('[jsname="JIbuQc"]'))[1].click();
            let noTextPromise = wait('.U5xcwf',([ele]) => ele?.innerText == "Can't find text" ? {error: 'no text'} : false)
            let selectAllPromise = wait('.VfPpkd-LgbsSe-OWXEXe-k8QpJ', eles => eles.length > 1)
            return await Promise.race([noTextPromise,selectAllPromise]).then(res => {
                if(res?.error) return ''
                res[1].click()
                return wait('[jsname="r4nke"]',([ele]) => ele.innerText)
            })
        })

    }

    let data = new FormData
    data.append('file',file)
    data.append('querys',JSON.stringify({p: ""}))
    data.append('scripts',[fun.toString()])

    return fetch(`http://localhost:2400/https://lens.google.com/search`,{ 
        method: "POST",
        body: data
    }).then(x => x.json())
}