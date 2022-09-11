import "babel-polyfill";
import { GM_SuperValue } from "../vendor/gm_supervalue";
import SettingsManager from "./settings";
import { translateUsingTranslator } from "./translate";
import { getRawParagraphs, devLog, sleepPromise } from "./util";
import UGMTLManager from "./ugmtl-manager";
import UIManager from "./ui";
import ProgressManager from "./progress";
import smoothscroll from "smoothscroll-polyfill";

// Add polyfill for smooth scrolling into elements, not available in some browsers.
smoothscroll.polyfill();

async function main() {
    const currentPath = window.location.pathname.split("/").slice(1);
    if (currentPath[0] !== "chapter") {
        if (currentPath[0] === "novel") {
            ProgressManager.handleProgress(currentPath);
        }
        return;
    }
    let ugmtl, settingsManager, uiManager, progressManager;
    try {
        ugmtl = new UGMTLManager(200);
        settingsManager = new SettingsManager();
        progressManager = new ProgressManager();
        uiManager = new UIManager(settingsManager, progressManager);
    } catch (e) {
        devLog("init failed");
        return devLog(e);
    }

    devLog("managers initialized");

    await ugmtl.rawsReplacedPromise;
    uiManager.setButtonsText("Loading {providerName}...");

    devLog("waited for raws");
    const pars = getRawParagraphs();

    if (process.env.NODE_ENV !== "production") {
        unsafeWindow.tlSet = GM_SuperValue.set.bind(GM_SuperValue);
        unsafeWindow.tlGet = GM_SuperValue.get.bind(GM_SuperValue);
    }
    let enabledTranslators = [];
    let tempProviders = [];
    for (const provider in settingsManager.settings) {
        const providerSettings = settingsManager.settings[provider];
        if (!providerSettings.enabled) {
            continue;
        }

        let translatePromise = translateUsingTranslator(
            pars,
            providerSettings.provider,
            providerSettings.waitTime
        )
            .then((translatedPars) => {
                devLog(translatedPars);
                uiManager.addTL(translatedPars, providerSettings);
                uiManager.annotateTerms(providerSettings);
                uiManager.enableButton(providerSettings);
            })
            .catch((e) => uiManager.errorButton(providerSettings)); // An error propagating here means that translation failed at least 3 times for a chunk

        if (providerSettings.autoSwitchOn || providerSettings.temporary)
            enabledTranslators.push(translatePromise);
        if (providerSettings.temporary) tempProviders.push(providerSettings);
        await sleepPromise(200);
    }
    if (settingsManager.lib.autoSwitchLNMTL) {
        await Promise.race(enabledTranslators);
        await uiManager.hideLNMTL();
        // console.log("lnmtl hidden")
    }
    await Promise.all(enabledTranslators);
    for (const provider of tempProviders) {
        uiManager.hideProvider(provider);
    }

    // console.log("restore progress")
    progressManager.restoreProgress();
    progressManager.trackSentenceProgress();

    // clean up if wanted
    if (settingsManager.lib.putBackRaws) ugmtl.rawsReplace(true);
}

main();
