import { devLog } from "../util"
import ProviderSettings from "./default"
class NiuTranslate {
    chunkLen = 2000
    async translateText(text) {
        let translateResult = await this.translateNiuWithGM(text)

        return translateResult["tgt_text"].replace(/\n\s\n/g, "\n\n")
    }
    translateNiuWithGM(text) {
        // return new Promise((res, rej) => {
        //     GM_xmlhttpRequest({
        //         method: "GET",
        //         url:
        //             "https://test.niutrans.vip/NiuTransServer/testtrans?from=cht&to=en&src_text=" +
        //             encodeURIComponent(text),
        //         headers: {
        //             "Accept-Encoding": "gzip, deflate",
        //             Accept: "application/json, text/plain, */*",
        //             DNT: 1,
        //             "User-Agent": window.useragent,
        //             Connection: "keep-alive",
        //             Origin: "niutrans.vip",
        //             Host: "test.niutrans.vip",
        //             Origin: "https://niutrans.vip",
        //             Referer: "https://niutrans.vip/Trans",
        //             "Sec-Fetch-Dest": "empty",
        //             "Sec-Fetch-Mode": "cors",
        //             "Sec-Fetch-Site": "same-site",
        //         },
        //         onload: function (result) {
        //             try {
        //                 res(JSON.parse(result.response))
        //             } catch (error) {
        //                 devLog(error)
        //                 rej(error)
        //             }
        //         },
        //     })
        // })
        return fetch(
            "https://test.niutrans.com/NiuTransServer/testtrans?from=cht&to=en&src_text=" +
                encodeURIComponent(text) +
                "&source=text",
            {
                headers: {
                    accept: "application/json, text/plain, */*",
                    "accept-language":
                        "en-US,en;q=0.9,tr-TR;q=0.8,tr;q=0.7,zh-TW;q=0.6,zh;q=0.5",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-site",
                },
                referrer: "https://niutrans.com/Trans",
                referrerPolicy: "no-referrer-when-downgrade",
                body: null,
                method: "GET",
                mode: "cors",
                credentials: "omit",
            }
        ).then((data) => data.json())
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
