import "babel-polyfill"
import SettingsManager from "./settings"
import { translateUsingTranslator } from "./translate"
import { getRawParagraphs, devLog, sleepPromise } from "./util"
import UGMTLManager from "./ugmtl-manager"
import UIManager from "./ui"
import ProgressManager from "./progress"

async function main() {
    const currentPath = window.location.pathname.split("/").slice(1)
    if (currentPath[0] !== "chapter") {
        if (currentPath[0] === "novel") {
            ProgressManager.handleProgress(currentPath)
        }
        return
    }
    let ugmtl, settingsManager, uiManager, progressManager
    try {
        ugmtl = new UGMTLManager(200)
        settingsManager = new SettingsManager()
        uiManager = new UIManager(settingsManager)
        progressManager = new ProgressManager()
    } catch (e) {
        devLog("init failed")
        return devLog(e)
    }

    devLog("managers initialized")
    await ugmtl.rawsReplacedPromise
    const pars = getRawParagraphs()

    devLog("waited for raws")
    let enabledTranslators = []
    for (const provider in settingsManager.settings) {
        const providerSettings = settingsManager.settings[provider]
        if (!providerSettings.enabled) {
            continue
        }

        let translatePromise = translateUsingTranslator(
            pars,
            providerSettings.provider,
            providerSettings.waitTime
        )
            .then((translatedPars) => {
                devLog(translatedPars)
                uiManager.addTL(translatedPars, providerSettings)
                uiManager.enableButton(providerSettings)
                uiManager.annotateTerms(providerSettings)
            })
            .catch((e) => uiManager.errorButton(providerSettings)) // An error propagating here means that translation failed at least 3 times for a chunk

        if (providerSettings.autoSwitchOn)
            enabledTranslators.push(translatePromise)
        await sleepPromise(200)
    }
    if (settingsManager.lib.autoSwitchLNMTL) {
        await Promise.race(enabledTranslators)
        uiManager.hideLNMTL()
    }
}

main()
