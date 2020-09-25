import {
    seperateIntoNChunks,
    sleepPromise,
    seperateChunksIntoPars,
} from "./util"
import { NiuTranslate, niutransGetQuery } from "./translators/niutrans"

async function retryTranslating(provider, chunk, count = 0) {
    if (count > 3) {
        throw new Error("Can't translate this chunk after 3 tries.")
    }
    try {
        if (provider instanceof NiuTranslate) {
            provider.query = await niutransGetQuery()
            GM_SuperValue.set("niutransquery", provider.query)
        }
        return await provider.translateText(chunk)
    } catch (e) {
        await sleepPromise(5000) // Wait for 5 seconds before trying.
        return retryTranslating(provider, chunk, count + 1)
    }
}

export async function translateUsingTranslator(rawPars, provider, waitTime) {
    let chunks = seperateIntoNChunks(provider.chunkLen, rawPars)
    if (provider instanceof NiuTranslate) {
        if (!provider.query) {
            provider.query =
                GM_SuperValue.get("niutransquery") || (await niutransGetQuery())
            GM_SuperValue.set("niutransquery", provider.query)
        }
    }
    let translatedChunksPromises = []
    for (const chunk of chunks) {
        translatedChunksPromises.push(
            provider
                .translateText(chunk)
                .catch(() => retryTranslating(provider, chunk))
        )
        await sleepPromise(waitTime)
    }
    return seperateChunksIntoPars(await Promise.all(translatedChunksPromises))
}
