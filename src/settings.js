import { devLog, isNumber } from "./util"
import GoogleSettings from "./translators/google"
import ReversoSettings from "./translators/reverso"
import NiuTranslateSettings from "./translators/niutrans"
import BaiduSettings from "./translators/baidu"

export default class SettingsManager {
    disclaimerChangesApplyAfterReload() {
        if (this.disclaimerShown) return
        let disclaimer = $(`<div class="alert alert-warning" role="alert">
                            <span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
                            <span class="sr-only">Note:</span>
                            Please refresh for settings to apply.
                            </div>`)
        $(".nav-tabs").before(disclaimer)
        this.disclaimerShown = true
    }
    constructor() {
        this.settings = {
            google: new GoogleSettings(),
            reverso: new ReversoSettings(),
            niu: new NiuTranslateSettings(),
            baidu: new BaiduSettings(),
        }
        this.restoreSettings()
        this.addSettings().catch((e) => devLog(e, "addsettings"))
        devLog("settings initialized")
    }
    //#region styling
    addStyling() {
        devLog("style-add")
        for (const style of this.stylesheet)
            $('<style type="text/css"/>').text(style).appendTo("head")
    }
    get stylesheet() {
        let stylesheet = ""
        stylesheet += `
        .lnmtl {
            border-left: 3px solid black!important;
        }
        #restoreProgress {
            position: fixed;
            bottom: 1rem;
            left:1rem;
        }
        `
        const stylesheets = []
        for (const provider in this.settings) {
            if (this.settings[provider].selectedTheme === "Custom")
                stylesheets.push(this.settings[provider].customStyleSheet)
            stylesheet += this.settings[provider].stylesheet
        }
        // console.log(stylesheet)

        devLog(stylesheets)
        devLog(stylesheet)
        return [stylesheet].concat(stylesheets)
    }
    //#endregion
    //#region restoreSettings
    restoreSettings() {
        this.restoreLibSettings()
        for (const provider in this.settings) {
            this.restoreProviderSettings(this.settings[provider])
        }
    }
    restoreLibSettings() {
        const autoSwitchLNMTL = GM_SuperValue.get("autoSwitchLNMTL", false)
        const putBackRaws = GM_SuperValue.get("putBackRaws", false)
        const showModalOnClick = GM_SuperValue.get("showModalOnClick", true)
        this.lib = { autoSwitchLNMTL, putBackRaws, showModalOnClick }
        devLog("restored autoSwitchLNMTL", autoSwitchLNMTL)
    }
    restoreProviderSettings(providerSettings) {
        providerSettings.autoSwitchOn = GM_SuperValue.get(
            `${providerSettings.className}-autoSwitchOn`,
            false
        )
        providerSettings.customStyleSheet = GM_SuperValue.get(
            `${providerSettings.className}-customStyleSheet`,
            ""
        )
        providerSettings.selectedTheme = GM_SuperValue.get(
            `${providerSettings.className}-selectedTheme`,
            "Default"
        )
        providerSettings.borderColor = GM_SuperValue.get(
            `${providerSettings.className}-borderColor`,
            providerSettings.defaultColor
        )
        providerSettings.enabled = GM_SuperValue.get(
            `${providerSettings.className}-enabled`,
            false
        )
        providerSettings.waitTime = GM_SuperValue.get(
            `${providerSettings.className}-waitTime`,
            providerSettings.defaultWaitTime || 1000
        )
        providerSettings.temporary = GM_SuperValue.get(
            `${providerSettings.className}-temporary`,
            false
        )
    }
    //#endregion
    //#region addSettings
    async addSettings() {
        this.addLibSettings()
        for (const provider in this.settings) {
            this.addProviderSettings(this.settings[provider])
        }
        this.addStyling()
    }
    addLibSettings() {
        const autoSwitchChecked = this.lib.autoSwitchLNMTL ? "checked" : ""
        const putBackRaws = this.lib.putBackRaws ? "checked" : ""
        const showModalOnClick = this.lib.showModalOnClick ? "checked" : ""
        devLog(this.lib.autoSwitchLNMTL, "LNMTL AUTO SWITCH")

        const libsettingshtml = `
            <h3>TranslateLib Settings</h3>
            <sub><input id="autoSwitchLNMTL" type="checkbox" ${autoSwitchChecked}></sub> <label for="autoSwitchLNMTL">Automatically hide English LNMTL Translation after loading</label><br>
            <sub><input id="putBackRaws" type="checkbox" ${putBackRaws}></sub> <label for="putBackRaws">Restore the original state of the raws by putting back the Chinese.</label><br>
            <sub><input id="showModalOnClick" type="checkbox" ${showModalOnClick}></sub> <label for="showModalOnClick">Show a translations modal when you click on a translation.</label>
            <p>Enabled translators:</p>
            <div class="btn-group btn-group-lg btn-group-justified" role="group" id="enabledTranslators">
            ${Object.keys(this.settings)
                .map(
                    (provider) =>
                        `<div class="btn-group" role="group"><button type="button" id="${
                            this.settings[provider].className
                        }-enabled" class="btn ${
                            this.settings[provider].enabled ? "btn-success" : ""
                        } btn-default">${
                            this.settings[provider].shortname
                        }</div></button>`
                )
                .join("")}
            </div>
        `
        const navTabs = `<ul class="nav nav-tabs nav-justified" role="tablist">
                            <li role="presentation" class="active"><a href="#tllib-settings" role="tab" data-toggle="tab">TLLib</a></li>
                            ${Object.keys(this.settings)
                                .map(
                                    (provider) =>
                                        `<li role="presentation"><a href="#${this.settings[provider].className}-settings" role="tab" data-toggle="tab">${this.settings[provider].shortname}</li></button>`
                                )
                                .join("")}
                        </ul>`
        const tabPanes = `<div class="tab-content">
                                <div role="tabpanel" class="tab-pane active" id="tllib-settings"></div>
                                ${Object.keys(this.settings)
                                    .map(
                                        (provider) =>
                                            `<div role="tabpanel" class="tab-pane" id="${this.settings[provider].className}-settings"></div>`
                                    )
                                    .join("")}
                        </div>`

        $("#chapter-display-options-modal .modal-body")
            .append(navTabs)
            .append(tabPanes)

        $("#tllib-settings").append(libsettingshtml)

        const _this = this
        $("#autoSwitchLNMTL").on("change", function () {
            const autoSwitchLNMTL = $(this).get(0).checked
            GM_SuperValue.set("autoSwitchLNMTL", autoSwitchLNMTL ? true : false)
            devLog("set autoSwitchLNMTL to", autoSwitchLNMTL)
            _this.disclaimerChangesApplyAfterReload()
        })
        $("#putBackRaws").on("change", function () {
            const putBackRaws = $(this).get(0).checked
            GM_SuperValue.set("putBackRaws", putBackRaws ? true : false)
            devLog("set putBackRaws to", putBackRaws)
            _this.disclaimerChangesApplyAfterReload()
        })
        $("#showModalOnClick").on("change", function () {
            const showModalOnClick = $(this).get(0).checked
            GM_SuperValue.set(
                "showModalOnClick",
                showModalOnClick ? true : false
            )
            devLog("set showModalOnClick to", showModalOnClick)
            _this.lib.showModalOnClick = showModalOnClick
        })
        for (let provider in this.settings) {
            $(`#${this.settings[provider].className}-enabled`).on(
                "click",
                function () {
                    const enabled = !$(this).hasClass("btn-success")
                    $(this).toggleClass("btn-success")
                    GM_SuperValue.set(
                        `${_this.settings[provider].className}-enabled`,
                        enabled
                    )
                    _this.disclaimerChangesApplyAfterReload()
                }
            )
        }
    }
    addProviderSettings(providerSettings) {
        const _this = this
        const title = $(
            `<h3 id="${providerSettings.className}-title"> ${providerSettings.name} Settings </h3>`
        )
        const checked = providerSettings.autoSwitchOn ? " checked" : ""
        const optionAutoswitch = $(
            `<sub><input id="${providerSettings.className}-autoSwitchOn" type="checkbox"${checked}></sub> <label for="${providerSettings.className}-autoSwitchOn">Automatically show ${providerSettings.name} after loading</label>`
        ).on("change", function () {
            const autoSwitchOn = $(
                `#${providerSettings.className}-autoSwitchOn`
            )[0].checked
            GM_SuperValue.set(
                `${providerSettings.className}-autoSwitchOn`,
                autoSwitchOn
            )
            _this.disclaimerChangesApplyAfterReload()
        })
        const optionTemp = $(
            `<sub><input id="${providerSettings.className}-temporary" type="checkbox"${checked}></sub> <label for="${providerSettings.className}-temporary">Temporarily show ${providerSettings.name} before turning off when all providers are loaded.</label>`
        ).on("change", function () {
            const temporary = $(`#${providerSettings.className}-temporary`)[0]
                .checked
            GM_SuperValue.set(
                `${providerSettings.className}-temporary`,
                temporary
            )
            _this.disclaimerChangesApplyAfterReload()
        })
        const row = $('<div class="row"/>')
        const label1 = $('<label class="control-label">Theme:</label>')
        const br = $("<br>")
        const label2 = $(
            '<label class="control-label">Custom Stylesheet(choose the theme Custom to use):</label>'
        )
        const col = $('<div class="col-xs-12"></div>')
        const textarea = $(
            `<textarea placeholder=".${providerSettings.className} { color:white; font-size: 2.3rem; margin-bottom:42px; font-family: Roboto }" class="form-control" id="${providerSettings.className}-custom-stylesheet" rows="2" input type="text" name="${providerSettings.className}-custom-stylesheet" wrap="soft">`
        )
            .val(providerSettings.customStyleSheet)
            .attr("disabled", providerSettings.selectedTheme != "Custom")
            .on("change paste keyup", function () {
                const customStyleSheet = $(this).val()
                GM_SuperValue.set(
                    `${providerSettings.className}-customStyleSheet`,
                    customStyleSheet
                )
                _this.disclaimerChangesApplyAfterReload()
            })
        const themes = Object.keys(providerSettings.themes)
        const themeElements = themes
            .map((theme) => `<option>${theme}</option>`)
            .join()
        const selectTheme = $(
            `<select class="form-control" id="${providerSettings.className}-selectTheme">${themeElements}</select>`
        )
        selectTheme
            .find("option:contains(" + providerSettings.selectedTheme + ")")
            .attr("selected", true)
        selectTheme.on("change", function () {
            const selectedTheme = $(this).find("option:selected").text()
            GM_SuperValue.set(
                `${providerSettings.className}-selectedTheme`,
                selectedTheme
            )
            _this.disclaimerChangesApplyAfterReload()
            textarea.attr("disabled", selectedTheme != "Custom")
        })

        const waitTime = $(`<div class="input-group">  
        <span class="input-group-addon" >Wait between request(ms):</span>                     
        <input type="number" class="form-control" id="${providerSettings.className}-waitTime" min="0" data-bind="value:replyNumber" value="${providerSettings.waitTime}" />
    </div>`)
        waitTime
            .on("keypress", (event) => isNumber(event))
            .on("paste", () => false)
            .on("change", function () {
                const newWait = Number(
                    $(`#${providerSettings.className}-waitTime`).eq(0).val()
                )
                if (newWait > 0) {
                    GM_SuperValue.set(
                        `${providerSettings.className}-waitTime`,
                        newWait
                    )
                    devLog(newWait)
                }
                _this.disclaimerChangesApplyAfterReload()
            })

        col.append(label1)
            .append(selectTheme)
            .append(br)
            .append(label2)
            .append(textarea)
            .append(waitTime)
        row.append(col)
        $(`#${providerSettings.className}-settings`)
            .append(title)
            .append(optionAutoswitch)
            .append("<br>")
            .append(optionTemp)
            .append("<br>")
            .append(row)
    }
    //#endregion
}
