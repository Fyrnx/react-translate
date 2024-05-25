/**
 * translate text by google translate
 * @param {object} object 
 * @param {string} object.text the prompt
 * @param {string} object.from from language
 * @param {string} object.to to language
 * @returns {Promise<{text: string, lang: string}>} return the text and the (from) language (if from is sited the from language to auto it will return the text language)
 */

export default async function translate({text,from = 'auto',to = 'en'}) {
    if(text === undefined) return console.error('no text provided');

    let fun = async ({evaluate}) => {
        return await evaluate(async ({wait}) => {
            let outputs = await wait(`.QcsUad.BDJ8fb.sMVRZe.wneUed .ryNqvb`)
            let lang = document.querySelector("[jsname=ZdXDJ]").getAttribute('lang')
            return {text: outputs.map(x => x.innerHTML).join(''),lang}
        })
    }

    let res = fetch(`http://localhost:2400/https://translate.google.com.eg`,{ 
        method: "POST",
        body: JSON.stringify({
            querys: {
                sl: from,
                tl: to,
                text
            },
            script: fun.toString()
        })
    }).then(x => x.json())

    return res
}