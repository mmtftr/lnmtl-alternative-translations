import {
    seperateIntoNChunks,
    sleepPromise,
    seperateChunksIntoPars,
} from "./util"

async function retryTranslating(provider, chunk, count = 0) {
    if (count > 3) {
        throw new Error("Can't translate this chunk after 3 tries.")
    }
    try {
        return await provider.translateText(chunk)
    } catch (e) {
        await sleepPromise(5000) // Wait for 5 seconds before trying.
        return retryTranslating(provider, chunk, count + 1)
    }
}

export async function translateUsingTranslator(rawPars, provider, interval) {
    let chunks = seperateIntoNChunks(provider.chunkLen, rawPars)
    let translatedChunksPromises = []
    for (const chunk of chunks) {
        translatedChunksPromises.push(
            provider
                .translateText(chunk)
                .catch(() => retryTranslating(provider, chunk))
        )
        await sleepPromise(provider.waitTime || interval)
    }
    return seperateChunksIntoPars(await Promise.all(translatedChunksPromises))
}
