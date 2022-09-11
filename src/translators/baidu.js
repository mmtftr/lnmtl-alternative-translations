import { devLog, sign } from "../util";
import ProviderSettings from "./default";

class BaiduTranslate {
    chunkLen = 2000;
    baiduReceiveTokens() {
        return new Promise((resolve) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: "https://fanyi.baidu.com/",
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36",
                },
                onload: function (result) {
                    try {
                        const windowToken = result.responseText.match(
                            /window\.gtk = '(.*?)'/
                        )[1];
                        const commonToken =
                            result.responseText.match(/token: '(.*?)',/)[1];

                        resolve([windowToken, commonToken]);
                    } catch (exception) {
                        devLog(exception);
                    }
                },
            });
        });
    }
    async translateText(text) {
        await this.tokensReceived; // Waits for the tokens
        const formData = {
            from: "zh",
            to: "en",
            query: text,
            transtype: "realtime",
            simple_means_flag: 3,
            sign: sign(text, this.tokens[0]),
            token: this.tokens[1],
            domain: "common",
        };

        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "POST",
                url: "https://fanyi.baidu.com/v2transapi",
                data: $.param(formData),
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded; charset=UTF-8",
                    Accept: "application/json",
                    Referer: "https://fanyi.baidu.com",
                    "Accept-Encoding": "gzip, deflate",
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36",
                },
                onload: function (result) {
                    try {
                        const jsonObj = JSON.parse(result.responseText);
                        resolve(
                            jsonObj.trans_result.data
                                .map((p) => p.dst)
                                .join("\n\n")
                        );
                    } catch (error) {
                        reject(error);
                        devLog(error);
                    }
                },
            });
        });
    }
    constructor() {
        this.tokensReceived = this.baiduReceiveTokens().then(
            (tokens) => (this.tokens = tokens)
        );
    }
}
export default class BaiduSettings extends ProviderSettings {
    constructor() {
        super();
        devLog("baidu");
        this.shortname = "BD";
        this.className = "bd";
        this.name = "Baidu Translate";
        this.defaultColor = "orange";
        this.defaultWaitTime = 1000;
        this.provider = new BaiduTranslate();
        devLog("initiate baidu");
        this.themes = {
            Default:
                ".bd { color:white; font-size: 2.3rem; margin-bottom:42px; font-family: Roboto }",
            LNMTL_EN: "",
            LNMTL_ZN: ".bd {font-size: 150%;}",
            Custom: "customStyleSheet",
        };
    }
}
