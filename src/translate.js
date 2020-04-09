import {
    seperateIntoNChunks,
    sleepPromise,
    seperateChunksIntoPars,
} from "./util"

export async function translateUsingTranslator(rawPars, provider, interval) {
    let chunks = seperateIntoNChunks(5000, rawPars)
    let translatedChunks = []
    for (const chunk of chunks) {
        translatedChunks.push(await provider.translateText(chunk))
        await sleepPromise(interval)
    }
    return seperateChunksIntoPars(translatedChunks)
}
