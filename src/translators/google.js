// Just to reduce the warnings in the editor
let $ = jQuery;

// Constants
const errorModal = `<div class="modal fade" tabindex="-1" id="error-modal" role="dialog" style="display: block; padding-right: 16px;"> <div class="modal-dialog modal-lg" role="document"> <div class="modal-content">  <div class="modal-body"> <div>  <div class="well well-lg v-cloak--hidden"> <p class="lead">An error has occurred with the Google Translate for LNMTL Userscript. Your error reporting status: </p> <p>Loading</p> </div>  </div>      <button class="btn btn-primary" type="button" data-dismiss="modal">Close</button></div> </div> </div> </div>`;

const themes = {
    Default:
        ".gt { color:white; font-size: 2.3rem; margin-bottom:42px; font-family: Roboto }",
    LNMTL_EN: "",
    LNMTL_ZN: ".gt {font-size: 150%;}",
    Custom: "customStyleSheet",
};

// Variables for tracking application status

state.testing = false;
var disclaimerShown = false;

// User options
let customStyleSheet = GM_SuperValue.get("customStyleSheet", "");
let autoSwitchOn = GM_SuperValue.get("autoSwitchOn", false);
let selectedTheme = GM_SuperValue.get("selectedTheme", "Default");
let autoSwitchLNMTL = GM_SuperValue.get("autoSwitchLNMTL", false);
/* TODO in 0.7
let advancedSettings = GM_SuperValue.get('advancedSettings', false);
let waitForUGMTL = GM_SuperValue.get('waitForUGMTL', 50);
let waitInBetweenReq = GM_SuperValue.get('waitInBetweenReq', 350);
*/

// Main functionality

function main() {
    addGTSettings();
    state.waited = true;
    rawsReplacedPromise().then(() => {
        $(".js-toggle-gt").text("Loading...");
        UGMTLUpdatedWarning();
        let chunks = seperateInto5KChunks(getRawParagraphs());
        let translatedChunks = [];
        let translatePromises = [];
        chunks.forEach((chunk, id) => {
            setTimeout(
                () =>
                    translatePromises.push(
                        translateText(chunk).then((tchunk) => {
                            translatedChunks[id] = tchunk;
                        })
                    ),
                350 * id
            );
        });
        setTimeout(
            () =>
                Promise.all(translatePromises).then(() =>
                    createUI(
                        getMTLParagraphs(),
                        seperateChunksIntoPars(translatedChunks)
                    )
                ),
            350 * chunks.length
        );
    });
}

function addGTSettings() {
    let title = $("<h3> Google Translate Settings </h3>");
    let checked = autoSwitchOn ? "checked" : "";
    let optionAutoswitch = $(
        '<sub><input id="autoSwitchOn" type="checkbox" ' +
            checked +
            '></sub> <label for="autoSwitchOn">Automatically show the Google Translation after loading</label>'
    ).on("change", function () {
        autoSwitchOn = $("#autoSwitchOn")[0].checked;
        GM_SuperValue.set("autoSwitchOn", autoSwitchOn);
        disclaimerChangesApplyAfterReload();
    });

    let checked2 = autoSwitchLNMTL ? "checked" : "";
    let optionAutoswitchLNMTL = $(
        '<sub><input id="autoSwitchLNMTL" type="checkbox" ' +
            checked +
            '></sub> <label for="autoSwitchLNMTL">Automatically hide English LNMTL Translation after loading</label>'
    ).on("change", function () {
        autoSwitchOn = $("#autoSwitchLNMTL")[0].checked;
        GM_SuperValue.set("autoSwitchLNMTL", autoSwitchOn);
        disclaimerChangesApplyAfterReload();
    });

    let row = $('<div class="row"/>');
    let label1 = $('<label class="control-label">Theme:</label>');
    let br = $("<br>");
    let label2 = $(
        '<label class="control-label">Custom Stylesheet(choose the theme Custom to use):</label>'
    );
    let col = $('<div class="col-xs-12"></div>');
    let textarea = $(
        '<textarea placeholder=".gt { color:white; font-size: 2.3rem; margin-bottom:42px; font-family: Roboto }" class="form-control" id="custom-stylesheet" rows="2" input type="text" name="custom-stylesheet" wrap="soft">'
    )
        .val(customStyleSheet)
        .attr("disabled", selectedTheme != "Custom")
        .on("change paste keyup", function () {
            customStyleSheet = $(this).val();
            GM_SuperValue.set("customStyleSheet", customStyleSheet);
            disclaimerChangesApplyAfterReload();
        });

    let selectTheme = $(`<select class="form-control" id="selectTheme">
<option>Default</option>
<option>LNMTL_EN</option>
<option>LNMTL_ZN</option>
<option>Custom</option>
</select>`);
    selectTheme
        .find("option:contains(" + selectedTheme + ")")
        .attr("selected", true);
    selectTheme.on("change", function () {
        selectedTheme = $(this).find("option:selected").text();
        GM_SuperValue.set("selectedTheme", selectedTheme);
        disclaimerChangesApplyAfterReload();
        textarea.attr("disabled", selectedTheme != "Custom");
    });

    col.append(label1)
        .append(selectTheme)
        .append(br)
        .append(label2)
        .append(textarea);
    row.append(col);
    $("#chapter-display-options-modal .modal-body")
        .append(title)
        .append(optionAutoswitch)
        .append("<br>")
        .append(optionAutoswitchLNMTL)
        .append(row);
}

function createUI(mtlpars, gtpars) {
    gtpars.forEach((par, index) => {
        $(".translated")
            .eq(index)
            .after(
                "<div class='gt' tab-index=0><sentence data-index=" +
                    index +
                    ">" +
                    par +
                    "</sentence></div>"
            );
    });
    let div = $(".gt");
    let styleSheetToUse =
        selectedTheme == "Custom" ? customStyleSheet : themes[selectedTheme];
    $('<style type="text/css"/>').text(styleSheetToUse).appendTo("head");
    div.attr("data-title", function () {
        return mtlpars[$(this).children().first().data("index")];
    }).popover({
        animation: true,
        container: ".chapter-body",
        placement: "top",
        trigger: "click",
    });
    div.hide();
    $(".js-toggle-gt")
        .click(function () {
            div.animate({
                height: "toggle",
                opacity: "toggle",
            });
            $(this).toggleClass("btn-primary").toggleClass("btn-default");
        })
        .text("GT")
        .addClass("btn-default")
        .removeClass("btn-disabled");
    if (autoSwitchOn) {
        div.animate({
            height: "toggle",
            opacity: "toggle",
        });
        $(".js-toggle-gt")
            .toggleClass("btn-primary")
            .toggleClass("btn-default");
    }
    if (autoSwitchLNMTL) {
        $(".translated").animate({
            height: "toggle",
            opacity: "toggle",
        });
        $(".js-toggle-translated")
            .toggleClass("btn-primary")
            .toggleClass("btn-default");
    }
}

// Utilities

function disclaimerChangesApplyAfterReload() {
    if (disclaimerShown) return;
    let disclaimer = $(`<div class="alert alert-warning" role="alert">
<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
<span class="sr-only">Note:</span>
Changes apply after reloading the page.
</div>`);
    $("#custom-stylesheet").after(disclaimer);
    disclaimerShown = true;
}

function getRawParagraphs() {
    return $(".original").text().trim().split("\n");
}

function getMTLParagraphs() {
    return $(".translated").text().trim().split("\n");
}

function isUGMTLReplacingRaws() {
    if ($("#replaceInOriginal")[0] && $("#replaceInOriginal")[0].checked) {
        return true;
    }
    return false;
}

function observerCallback(mutationList, observer) {
    mutationList.forEach((mutation) => {
        switch (mutation.type) {
            case "attributes":
                if (mutation.attributeName == "data-title") {
                    setTimeout(function () {
                        state.rawsReplaced = true;
                    }, 50);
                }
                break;
        }
    });
}

function rawsObserver() {
    var observerOptions = {
        childList: false,
        attributes: true,
    };

    var observer = new MutationObserver(observerCallback);
    if ($(".original t").get(-1) != undefined) {
        observer.observe($(".original t").get(-1), observerOptions);
    }
    observeDocument();
    if (
        window.sessionStorage.getItem("userjs_UGMTLComplete") &&
        window.sessionStorage.getItem("userjs_UGMTLComplete") >
            window.performance.timing.fetchStart
    ) {
        state.rawsReplaced = true;
        state.UGMTLUpdated = true;
    }
}

function observeDocument() {
    document.addEventListener(
        "userjs_UGMTLComplete",
        function () {
            devLog("userjs_UGMTLComplete");
            state.rawsReplaced = true;
            state.UGMTLUpdated = true;
        },
        false
    );
}

function rawsReplacedPromise() {
    if (isUGMTLReplacingRaws()) {
        if (state.rawsReplaced) {
            return Promise.resolve(true);
        } else {
            return new Promise(function (res) {
                state.resolve = res;
            });
        }
    } else {
        return new Promise((res) => {
            rawsReplace();
            res();
        });
    }
}

function translateText(text) {
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
                let paragraph = "";
                for (let i = 0; i < t[0].length; i++) {
                    paragraph += t[0][i][0];
                }
                return res(paragraph);
            })
            .fail((err) => {
                state.errorCode = 1;
                console.log(
                    "An error occurred while fetching the translations:" + err
                );
                console.error(err);
                reportError(err);
            })
    );
}

function seperateInto5KChunks(paragraphs) {
    let chunks = [];
    let currentchunk = "";
    for (let i = 0; i < paragraphs.length; i++) {
        if ((currentchunk + paragraphs[i]).length >= 5000) {
            chunks.push(currentchunk);
            currentchunk = paragraphs[i];
        } else {
            currentchunk = currentchunk + "\n\n" + paragraphs[i];
        }
    }
    if (paragraphs.length != 0) {
        chunks.push(currentchunk);
    }
    return chunks;
}

function seperateChunksIntoPars(chunks) {
    let pars = [];
    chunks.forEach((chunk) =>
        chunk.split("\n\n").forEach((par) => pars.push(par))
    );
    return pars;
}

function rawsReplace() {
    $(".original t").each(function () {
        let mytext = $(this).text();
        $(this).text(
            $(this)
                .attr("data-title")
                .replace(/\(\w+\)/g, "")
        );
        $(this).attr("data-title", mytext);
    });
    // add whitespace between two english words
    $(".original")
        .find("t")
        .filter(function (index) {
            var prev = $(this).get(0).previousSibling;
            return prev
                ? $(this).get(0).previousSibling.nodeName == "T"
                : false;
        })
        .each(function () {
            $(this).text(" " + $(this).text());
        });
}

function UGMTLUpdatedWarning() {
    devLog(state.UGMTLUpdated, isUGMTLReplacingRaws());
    if (!state.UGMTLUpdated && isUGMTLReplacingRaws()) {
        let disclaimer = $(`<div class="alert alert-danger" role="alert">
<span class="glyphicon glyphicon-exclamation-sign"></span>
<span class="sr-only">Warning:</span>
Please update UGMTL to 1.6.8+ for better and stabler integration between the two extensions.
</div>`);
        $(
            "#chapter-display-options-modal > div > div > div.modal-body > h3:nth-child(10)"
        ).after(disclaimer);
    }
}

function devLog(message) {
    return state.testing ? console.log(message) : false;
}

function reportError(error) {
    if ($("#error-modal").get(0)) {
        return postForm(error);
    }
    $(".js-toggle-gt").text("ERROR").addClass("btn-danger");
    let errmodal = $(errorModal);
    $("body").append(errmodal);
    errmodal.modal().modal("hide");
    $(".js-toggle-gt").on("click", errmodal.modal.bind(errmodal, "toggle"));
    postForm(error).always(() => {
        errmodal.find("p").eq(1).text("Your error has been reported");
    });
}

function postForm(error) {
    return $.ajax({
        url:
            "https://docs.google.com/forms/u/0/d/e/1FAIpQLSf9_pdqwA36TaHjxxCKeT8iv-eLhXIx1DO2bxD7V7tKG3UXXw/formResponse",
        data: {
            "entry.1958338513": isUGMTLReplacingRaws()
                ? "true"
                : state.waited
                ? "false"
                : "not waited",
            "entry.743789703": state.UGMTLUpdated ? "true" : "false",
            "entry.879260605": state.rawsReplaced ? "true" : "false",
            "entry.1237602720": state.errorCode,
            "entry.765414833": error.name + "\n" + error.message,
        },
        type: "POST",
        dataType: "xml",
    });
}

(function () {
    try {
        // Add UI indicator for loading
        $(".js-toggle-original").after(
            '<button class="btn btn-disabled js-toggle-gt">Waiting for UGMTL...</button>'
        );
        // Observe the phrases to see if they change
        rawsObserver();

        // Wait for UGMTL and then start the program
        setTimeout(main, 50);
    } catch (error) {
        reportError(error);
    }
})();

/* Reconsider using the inherent google translate api instead of googleapis.com API. (Requires CORS-bypass/GM_xmlHttpRequest)
let onload = function (res) {console.log(res)};
let request = {method:"GET", url:"https://translate.google.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=hello%20my%20name%20is%20whatever", onload:onload};
GM_xmlhttpRequest(request);
*/

export class GoogleTranslate {
    _settings = {};
    state = {};
    constructor() {
        let rawsReplaced = false;
        Object.defineProperty(state, "rawsReplaced", {
            enumerable: true,
            configurable: true,
            set: function (newVal) {
                rawsReplaced = newVal;
                if (this.resolve && newVal) this.resolve();
            },
            get: function () {
                return rawsReplaced;
            },
        });
    }

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
                    let paragraph = "";
                    for (let i = 0; i < t[0].length; i++) {
                        paragraph += t[0][i][0];
                    }
                    return res(paragraph);
                })
                .fail((err) => {
                    this.state.errorCode = 1;
                    console.log(
                        "An error occurred while fetching the translations:" +
                            err
                    );
                    console.error(err);
                    this.reportError(err);
                })
        );
    }
}
