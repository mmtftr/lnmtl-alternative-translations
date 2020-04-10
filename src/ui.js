import { devLog, sleepPromise } from "./util"

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
                    `<div class='${providerSettings.className} translateLib' tab-index=0><sentence data-index=${index}>${par}</sentence></div>`
                )
        })
        const div = $(`.${providerSettings.className}`)
        div.hide()
    }
    addButton(providerSettings) {
        if (!providerSettings.enabled) {
            return
        }
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
    hideLNMTL() {
        $(".translated").animate({
            height: "toggle",
            opacity: "toggle",
        })
        $(".js-toggle-translated")
            .toggleClass("btn-primary")
            .toggleClass("btn-default")
    }
    createTermPopovers(par) {
        let termedPar = par
        const _this = this
        if (!this.translatedTerms) {
            this.translatedTerms = this.makeUniq(
                $(".translated t")
                    .get()
                    .sort((b, a) => a.innerHTML.length - b.innerHTML.length)
            )
        }
        this.translatedTerms.forEach(function (term) {
            const content = _this.escapeRegExp(
                $(term).text().replace(new RegExp("\u00AD", "g"), "")
            )
            // devLog(content)
            /**
             * All of this logic is to make sure a term isn't put inside a term.
             * So that only normal text is modified and not html
             */
            let deconstruct = termedPar.split(/[<>]/)
            // devLog(deconstruct)
            let replacedDeconstruct = deconstruct[0].replace(
                new RegExp(`\\b${content}\\b`, "g"),
                term.outerHTML
            )
            // devLog(replacedDeconstruct)
            for (let i = 1; i + 2 < deconstruct.length; i += 4) {
                replacedDeconstruct =
                    replacedDeconstruct +
                    "<" +
                    deconstruct[i] +
                    ">" +
                    deconstruct[i + 1] +
                    "<" +
                    deconstruct[i + 2] +
                    ">" +
                    deconstruct[i + 3].replace(
                        new RegExp(`\\b${content}\\b`, "g"),
                        term.outerHTML
                    )
            }
            termedPar = replacedDeconstruct
        })
        return termedPar
    }
    makeUniq(arrayOfNodes) {
        let newArr = []
        for (const node of arrayOfNodes) {
            if (
                newArr.findIndex(
                    (other) => other.innerHTML == node.innerHTML
                ) === -1
            ) {
                newArr.push(node)
            }
        }
        return newArr
    }
    escapeRegExp(text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
    }
    async annotateTerms(providerSettings) {
        let sentences = $(`.${providerSettings.className} sentence`)
        for (let i = 0; i < sentences.length; i++) {
            const sentence = sentences.eq(i)
            sentence.html(this.createTermPopovers(sentence.html()))
            sentence.find("t").popover({
                animation: true,
                container: ".chapter-body",
                placement: "top",
                trigger: "click",
            })
            await sleepPromise(100)
        }
    }
}
