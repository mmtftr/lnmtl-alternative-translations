import "babel-polyfill"
import SettingsManager from "./settings"
import { translateUsingTranslator } from "./translate"
import { getRawParagraphs, devLog } from "./util"
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
    for (const provider in settingsManager.settings) {
        const providerSettings = settingsManager.settings[provider]
        let translatedPars = await translateUsingTranslator(
            pars,
            providerSettings.provider,
            300
        )
        uiManager.addTL(translatedPars, providerSettings)
        uiManager.enableButton(providerSettings)
    }
}

main()
