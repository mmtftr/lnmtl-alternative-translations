import { devLog } from "./util"

export default class UIManager {
    async constructUI(settingsManager) {
        for (const provider in settingsManager.settings) {
            this.addButton(settingsManager.settings[provider])
        }
        devLog("uimanager initialized")
    }
    constructor(settingsManager) {
        this.constructUI(settingsManager)
    }
    addTL(pars, providerSettings) {
        const translated = $(".translated")
        pars.forEach((par, index) => {
            translated
                .eq(index)
                .after(
                    `<div class='${providerSettings.className}' tab-index=0><sentence data-index=${index}>${par}</sentence></div>`
                )
        })
        const div = $(`.${providerSettings.className}`)
        div.hide()
    }
    addButton(providerSettings) {
        $(".js-toggle-original").after(
            `<button class="btn btn-disabled text-muted js-toggle-${providerSettings.className}">Loading ${providerSettings.shortname}...</button>`
        )
    }
    /**
     * After translation is complete, enables the button of the translation.
     * @param {ProviderSettings} providerSettings
     */
    enableButton(providerSettings) {
        const div = $(`.${providerSettings.className}`)
        const button = $(`.js-toggle-${providerSettings.className}`)
        button
            .click(function () {
                div.animate({
                    height: "toggle",
                    opacity: "toggle",
                })
                $(this).toggleClass("btn-primary").toggleClass("btn-default")
            })
            .text(providerSettings.shortname)
            .addClass("btn-default")
            .removeClass("btn-disabled")
            .removeClass("text-muted")

        if (providerSettings.autoSwitchOn) {
            div.animate({
                height: "toggle",
                opacity: "toggle",
            })
            button.toggleClass("btn-primary").toggleClass("btn-default")
        }
    }

    createUI(mtlpars, gtpars, settings) {
        /*
        div.attr("data-title", function () {
            return mtlpars[$(this).children().first().data("index")];
        }).popover({
            animation: true,
            container: ".chapter-body",
            placement: "top",
            trigger: "click",
        });
        */

        if (autoSwitchLNMTL) {
            $(".translated").animate({
                height: "toggle",
                opacity: "toggle",
            })
            $(".js-toggle-translated")
                .toggleClass("btn-primary")
                .toggleClass("btn-default")
        }
    }
}
