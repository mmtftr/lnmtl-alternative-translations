import {
    seperateIntoNChunks,
    sleepPromise,
    seperateChunksIntoPars,
} from "./util"

export async function translateUsingTranslator(rawPars, provider, interval) {
    let chunks = seperateIntoNChunks(provider.chunkLen, rawPars)
    let translatedChunks = []
    for (const chunk of chunks) {
        translatedChunks.push(provider.translateText(chunk))
        await sleepPromise(interval)
    }
    return seperateChunksIntoPars(await Promise.all(translatedChunks))
}
