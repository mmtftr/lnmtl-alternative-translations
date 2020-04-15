import { devLog } from "../util"
import ProviderSettings from "./default"
class NiuTranslate {
    chunkLen = 2000
    async translateText(text) {
        let translateResult = await this.translateNiuWithGM(text)

        return translateResult["tgt_text"].replace(/\n\s\n/g, "\n\n")
    }
    translateNiuWithGM(text) {
        return new Promise((res, rej) => {
            GM_xmlhttpRequest({
                method: "GET",
                url:
                    "http://test.niutrans.vip/NiuTransServer/testtrans?from=zh&to=en&src_text=" +
                    encodeURIComponent(text),
                headers: {
                    "Accept-Encoding": "gzip, deflate",
                    "User-Agent": window.useragent,
                },
                onload: function (result) {
                    try {
                        res(JSON.parse(result.response))
                    } catch (error) {
                        devLog(error)
                        rej(error)
                    }
                },
            })
        })
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
