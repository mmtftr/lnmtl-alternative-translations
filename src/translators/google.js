// // Just to reduce the warnings in the editor
// let $ = jQuery

// Constants
// const errorModal = `<div class="modal fade" tabindex="-1" id="error-modal" role="dialog" style="display: block; padding-right: 16px;"> <div class="modal-dialog modal-lg" role="document"> <div class="modal-content">  <div class="modal-body"> <div>  <div class="well well-lg v-cloak--hidden"> <p class="lead">An error has occurred with the Google Translate for LNMTL Userscript. Your error reporting status: </p> <p>Loading</p> </div>  </div>      <button class="btn btn-primary" type="button" data-dismiss="modal">Close</button></div> </div> </div> </div>`

// const themes = {
//     Default:
//         ".gt { color:white; font-size: 2.3rem; margin-bottom:42px; font-family: Roboto }",
//     LNMTL_EN: "",
//     LNMTL_ZN: ".gt {font-size: 150%;}",
//     Custom: "customStyleSheet",
// }

// // Variables for tracking application status

// state.testing = false
// var disclaimerShown = false

// // User options
// let customStyleSheet = GM_SuperValue.get("customStyleSheet", "")
// let autoSwitchOn = GM_SuperValue.get("autoSwitchOn", false)
// let selectedTheme = GM_SuperValue.get("selectedTheme", "Default")
// let autoSwitchLNMTL = GM_SuperValue.get("autoSwitchLNMTL", false)
/* TODO in 0.7
let advancedSettings = GM_SuperValue.get('advancedSettings', false);
let waitForUGMTL = GM_SuperValue.get('waitForUGMTL', 50);
let waitInBetweenReq = GM_SuperValue.get('waitInBetweenReq', 350);
*/

// Main functionality

/* Reconsider using the inherent google translate api instead of googleapis.com API. (Requires CORS-bypass/GM_xmlHttpRequest)
let onload = function (res) {console.log(res)};
let request = {method:"GET", url:"https://translate.google.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=hello%20my%20name%20is%20whatever", onload:onload};
GM_xmlhttpRequest(request);
*/

export default class GoogleTranslate {
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
