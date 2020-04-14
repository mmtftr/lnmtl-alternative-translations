import "babel-polyfill"
import SettingsManager from "./settings"
import { translateUsingTranslator } from "./translate"
import { getRawParagraphs, devLog, sleepPromise } from "./util"
import UGMTLManager from "./ugmtl-manager"
import UIManager from "./ui"

async function main() {
    let ugmtl, settingsManager, uiManager
    try {
        ugmtl = new UGMTLManager(200)
        settingsManager = new SettingsManager()
        uiManager = new UIManager(settingsManager)
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
            300
        )
            .then((translatedPars) => {
                devLog(translatedPars)
                uiManager.addTL(translatedPars, providerSettings)
                uiManager.enableButton(providerSettings)
                uiManager.annotateTerms(providerSettings)
            })
            .catch(() => retryAfterFail(providerSettings, pars, uiManager, 0))

        if (providerSettings.autoSwitchOn)
            enabledTranslators.push(translatePromise)
    }
    if (settingsManager.lib.autoSwitchLNMTL) {
        await Promise.race(enabledTranslators)
        uiManager.hideLNMTL()
    }
}

function retryAfterFail(providerSettings, pars, uiManager, counter) {
    if (counter > 3) {
        return Promise.reject(
            new Error(
                `Failed to translate with provider ${providerSettings.name} after trying for ${counter} many times. 
                Please contact the developer if you think this shouldn't have happened`
            )
        )
    }
    return translateUsingTranslator(pars, providerSettings.provider, 300)
        .then((translatedPars) => {
            devLog(translatedPars)
            uiManager.addTL(translatedPars, providerSettings)
            uiManager.enableButton(providerSettings)
            uiManager.annotateTerms(providerSettings)
        })
        .catch(() =>
            retryAfterFail(providerSettings, pars, uiManager, ++counter)
        )
}
main()
