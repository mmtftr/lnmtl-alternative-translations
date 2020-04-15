import { devLog, sleepPromise } from "./util"

export default class UIManager {
    async constructUI() {
        for (const provider in this.settingsManager.settings) {
            this.addButton(this.settingsManager.settings[provider])
        }
        this.addModal()
        devLog("uimanager initialized")
    }
    addModal() {
        $(`
        <div id="translationModal" class="modal fade" role="dialog">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                        <h4 class="modal-title">Other translations</h4>
                    </div>
                    <div class="modal-body">
                        <p>Some text in the modal.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    </div>
                </div>

            </div>
        </div>
        `).appendTo("body")
    }
    constructor(settingsManager) {
        this.settingsManager = settingsManager
        this.constructUI()
        this.supportsLookbehind = this.lookbehindCheck() // We need to know if lookbehind works for better term replacement.
    }
    lookbehindCheck() {
        try {
            let regexp = new RegExp("(?<=plswork)abc", "g") // Some random regexp that uses lookbehind
            return true
        } catch (e) {
            return false
        }
    }
    addTL(pars, providerSettings) {
        const translated = $(".translated")
        pars.forEach((par, index) => {
            const tl = $(
                `<div class='${providerSettings.className} translateLib' tab-index=0><sentence data-index=${index}>${par}</sentence></div>`
            )
            tl.on("click", (e) => {
                if ($(e.target).is("t")) {
                    return
                }
                this.showTranslationModal(index)
            })
            translated.eq(index).after(tl)
        })
        const div = $(`.${providerSettings.className}`)
        div.hide()
    }
    showTranslationModal(index) {
        let translations = []
        translations.push(
            `<div class="lnmtl list-group-item">
            ${$(".translated").eq(index).text()}
            </div>`
        )
        for (let provider in this.settingsManager.settings) {
            try {
                let text = $(
                    `.${this.settingsManager.settings[provider].className}`
                )
                    .eq(index)
                    .text()
                if (text.trim().length === 0) {
                    // Don't add translations that are not loaded yet.
                    continue
                }
                let translationItem = `<div class="${this.settingsManager.settings[provider].className} list-group-item">${text}</div>`

                translations.push(translationItem)
            } catch (e) {
                continue
            }
        }
        devLog(translations)
        $("#translationModal .modal-body").html(
            `<div class="list-group">${translations.join("")}</div>`
        )
        $("#translationModal").modal()
    }
    addButton(providerSettings) {
        if (!providerSettings.enabled) {
            return
        }
        $(".js-toggle-original").after(
            `<button class="btn btn-disabled text-muted js-toggle-${providerSettings.className}">Loading ${providerSettings.shortname}...</button>`
        )
    }
    errorButton(providerSettings) {
        const button = $(`.js-toggle-${providerSettings.className}`)
        button
            .addClass("btn-danger")
            .removeClass("btn-disabled")
            .removeClass("text-muted")
            .text("Failed " + providerSettings.shortname)
    }
    /**
     * After translation is complete, enables the button of the translation.
     * @param {ProviderSettings} providerSettings
     */
    async enableButton(providerSettings) {
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

    createUI() {
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
            const termRegexp = _this.supportsLookbehind
                ? new RegExp(`(?<!\\w)${content}(?!\\w)`, "g")
                : new RegExp(`\\b${content}(?!\\w)`, "g")
            // devLog(deconstruct)
            let replacedDeconstruct = deconstruct[0].replace(
                termRegexp,
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
                    deconstruct[i + 3].replace(termRegexp, term.outerHTML)
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
