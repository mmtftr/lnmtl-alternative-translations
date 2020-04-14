import { devLog } from "../util"
import ProviderSettings from "./default"
class NiuTranslate {
    chunkLen = 3200
    async translateText(text) {
        let request = await fetch(
            "https://test.niutrans.vip/NiuTransServer/testtrans?from=zh&to=en&src_text=" +
                encodeURIComponent(text.trim())
        )
        let translateResult = await request.json()

        devLog(translateResult)
        return translateResult["tgt_text"].replace(/\n\s\n/g, "\n\n")
    }
}
export default class NiuTranslateSettings extends ProviderSettings {
    constructor() {
        super()
        this.shortname = "NT"
        this.className = "nt"
        this.name = "Niutrans Translate"
        this.defaultColor = "lightpink"
        this.provider = new NiuTranslate()
        this.themes = {
            Default:
                ".nt { color:white; font-size: 2.3rem; margin-bottom:42px; font-family: Roboto }",
            LNMTL_EN: "",
            LNMTL_ZN: ".nt {font-size: 150%;}",
            Custom: "customStyleSheet",
        }
    }
}
