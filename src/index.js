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
    let translators = []
    for (const provider in settingsManager.settings) {
        const providerSettings = settingsManager.settings[provider]
        if (!providerSettings.enabled) {
            continue
        }
        translators.push(
            translateUsingTranslator(pars, providerSettings.provider, 300).then(
                (translatedPars) => {
                    uiManager.addTL(translatedPars, providerSettings)
                    uiManager.enableButton(providerSettings)
                    uiManager.annotateTerms(providerSettings)
                }
            )
        )
        await sleepPromise(700)
    }
    if (settingsManager.lib.autoSwitchLNMTL) {
        await Promise.all(translators)
        uiManager.hideLNMTL()
    }
}

main()
