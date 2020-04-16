import { devLog } from "./util"
import GoogleSettings from "./translators/google"
import ReversoSettings from "./translators/reverso"
import NiuTranslateSettings from "./translators/niutrans"

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
        }
        this.restoreSettings()
        this.addSettings().catch((e) => devLog(e, "addsettings"))
        devLog("settings initialized")
    }
    //#region styling
    addStyling() {
        $('<style type="text/css"/>').text(this.stylesheet).appendTo("head")
    }
    get stylesheet() {
        let stylesheet = ""
        stylesheet += `
        .lnmtl {
            border-left: 3px solid black!important;
        }
        `
        for (const provider in this.settings) {
            stylesheet += this.settings[provider].stylesheet
        }
        console.log(stylesheet)
        return stylesheet
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
        this.lib = { autoSwitchLNMTL: autoSwitchLNMTL }
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
        const checked = this.lib.autoSwitchLNMTL ? "checked" : ""
        devLog(this.lib.autoSwitchLNMTL, "LNMTL AUTO SWITCH")
        const libsettingshtml = `
            <h3>TranslateLib Settings</h3>
            <sub><input id="autoSwitchLNMTL" type="checkbox" ${checked}></sub> <label for="autoSwitchLNMTL">Automatically hide English LNMTL Translation after loading</label>
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
        const optionAutoswitchLNMTL = $(libsettingshtml)

        $("#chapter-display-options-modal .modal-body").append(
            optionAutoswitchLNMTL
        )

        const _this = this
        $("#autoSwitchLNMTL").on("change", function () {
            const autoSwitchLNMTL = $(this).get(0).checked
            GM_SuperValue.set("autoSwitchLNMTL", autoSwitchLNMTL ? true : false)
            devLog("set autoSwitchLNMTL to", autoSwitchLNMTL)
            _this.disclaimerChangesApplyAfterReload()
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
        let title = $(
            `<h3 id="${providerSettings.className}-title"> ${providerSettings.name} Settings </h3>`
        )
        let checked = providerSettings.autoSwitchOn ? " checked" : ""
        let optionAutoswitch = $(
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
        let row = $('<div class="row"/>')
        let label1 = $('<label class="control-label">Theme:</label>')
        let br = $("<br>")
        let label2 = $(
            '<label class="control-label">Custom Stylesheet(choose the theme Custom to use):</label>'
        )
        let col = $('<div class="col-xs-12"></div>')
        let textarea = $(
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
        let selectTheme = $(
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

        col.append(label1)
            .append(selectTheme)
            .append(br)
            .append(label2)
            .append(textarea)
        row.append(col)
        $("#chapter-display-options-modal .modal-body")
            .append(title)
            .append(optionAutoswitch)
            .append("<br>")
            .append(row)
    }
    //#endregion
}
