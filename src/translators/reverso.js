import { devLog } from "../util"

export default class ReversoTranslate {
    chunkLen = 2400
    async translateText(text) {
        let request = await fetch(
            "https://async5.reverso.net/WebReferences/WSAJAXInterface.asmx/TranslateCorrWS",
            {
                method: "POST",
                mode: "cors", // no-cors, *cors, same-origin
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    searchText: text,
                    direction: "chi-eng-5",
                    maxTranslationChars: 2400,
                    usecorr: true,
                }),
            }
        )
        let translateResult = await request.json()
        devLog(translateResult)
        if (translateResult.d.result) {
            return translateResult.d.result
        }
        const pars = JSON.parse(translateResult.d.translation)

        return pars.reduce((acc, curr) => acc + curr.paragraph, "")
    }
}
