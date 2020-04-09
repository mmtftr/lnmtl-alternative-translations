import GoogleTranslate from "./translators/google"
import { devLog } from "./util"
class ProviderSettings {
    constructor(enabled) {
        this.enabled = enabled
    }
    get stylesheet() {
        return (
            this.themes[this.selectedTheme] +
            `.${this.className} {border-left: 3px solid ${this.borderColor}; padding-left:10px;}`
        )
    }
}
class GoogleSettings extends ProviderSettings {
    constructor(enabled) {
        super(enabled)
        this.shortname = "GT"
        this.className = "gt"
        this.name = "Google Translate"
        this.defaultColor = "lightblue"
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

export default class SettingsManager {
    get stylesheet() {
        let stylesheet = ""
        for (const provider in this.settings) {
            stylesheet += this.settings[provider].stylesheet
        }
        console.log(stylesheet)
        return stylesheet
    }
    disclaimerChangesApplyAfterReload() {
        if (disclaimerShown) return
        let disclaimer = $(`<div class="alert alert-warning" role="alert">
                            <span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
                            <span class="sr-only">Note:</span>
                            Please refresh for settings to apply.
                            </div>`)
        $("#custom-stylesheet").after(disclaimer)
        disclaimerShown = true
    }
    async addSettings() {
        this.addLibSettings()
        for (const provider in this.settings) {
            this.addProviderSettings(this.settings[provider])
        }
        this.addStyling()
    }
    addStyling() {
        $('<style type="text/css"/>').text(this.stylesheet).appendTo("head")
    }
    constructor(providers) {
        this.settings = { google: new GoogleSettings() }
        for (const provider in this.settings) {
            this.restoreProviderSettings(this.settings[provider])
        }
        this.addSettings()
        devLog("settings initialized")
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
    }
    addLibSettings() {
        // let checked2 = autoSwitchLNMTL ? "checked" : ""
        // let optionAutoswitchLNMTL = $(
        //   '<sub><input id="autoSwitchLNMTL" type="checkbox" ' +
        //     checked +
        //     '></sub> <label for="autoSwitchLNMTL">Automatically hide English LNMTL Translation after loading</label>'
        // ).on("change", function () {
        //   autoSwitchOn = $("#autoSwitchLNMTL")[0].checked
        //   GM_SuperValue.set("autoSwitchLNMTL", autoSwitchOn)
        //   disclaimerChangesApplyAfterReload()
        // })
    }

    addProviderSettings(providerSettings) {
        const _this = this
        let title = $(`<h3> ${providerSettings.name} Settings </h3>`)
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
}
