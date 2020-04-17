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
                    "https://test.niutrans.vip/NiuTransServer/testtrans?from=auto&to=en&src_text=" +
                    encodeURIComponent(text),
                headers: {
                    "Accept-Encoding": "gzip, deflate",
                    Accept: "application/json, text/plain, */*",
                    DNT: 1,
                    "User-Agent": window.useragent,
                    Connection: "keep-alive",
                    Origin: "niutrans.vip",
                    Host: "test.niutrans.vip",
                    Origin: "https://niutrans.vip",
                    Referer: "https://niutrans.vip/trans",
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "same-site",
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
        this.defaultWaitTime = 5000
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
