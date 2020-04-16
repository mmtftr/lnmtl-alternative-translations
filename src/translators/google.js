import ProviderSettings from "./default"
class GoogleTranslate {
    chunkLen = 5000
    translateText(text) {
        return new Promise((res, rej) =>
            $.ajax(
                "https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-CN&tl=en&dt=t",
                {
                    method: "POST",
                    data: {
                        q: text,
                    },
                    dataType: "json",
                }
            )
                .done((t) => {
                    let paragraph = ""
                    for (let i = 0; i < t[0].length; i++) {
                        paragraph += t[0][i][0]
                    }
                    return res(paragraph)
                })
                .fail((err) => {
                    rej(
                        new Error(
                            "An error occurred while fetching the translations: " +
                                err
                        )
                    )
                })
        )
    }
}
export default class GoogleSettings extends ProviderSettings {
    constructor() {
        super()
        this.shortname = "GT"
        this.className = "gt"
        this.name = "Google Translate"
        this.defaultColor = "lightblue"
        this.defaultWaitTime = 500
        this.provider = new GoogleTranslate()
        this.themes = {
            Default:
                ".gt { color:white; font-size: 2.3rem; margin-bottom:42px; font-family: Roboto }",
            LNMTL_EN: "",
            LNMTL_ZN: ".gt {font-size: 150%;}",
            Custom: "customStyleSheet",
        }
    }
}
