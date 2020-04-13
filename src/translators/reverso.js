import { devLog } from "../util"
import ProviderSettings from "./default"
class ReversoTranslate {
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
export default class ReversoSettings extends ProviderSettings {
    constructor() {
        super()
        this.shortname = "RV"
        this.className = "rv"
        this.name = "Reverso Translate"
        this.defaultColor = "lightcoral"
        this.provider = new ReversoTranslate()
        this.themes = {
            Default:
                ".rv { color:white; font-size: 2.3rem; margin-bottom:42px; font-family: Roboto }",
            LNMTL_EN: "",
            LNMTL_ZN: ".rv {font-size: 150%;}",
            Custom: "customStyleSheet",
        }
    }
}
