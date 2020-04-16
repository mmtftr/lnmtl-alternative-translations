export function getRawParagraphs() {
    return $(".original").text().trim().split("\n")
}

export function getMTLParagraphs() {
    return $(".translated").text().trim().split("\n")
}

export function devLog(message) {
    if (process.env.NODE_ENV === "production") {
        return
    }
    console.log(message)
}

export function reportError(error, appState) {
    if ($("#error-modal").get(0)) {
        return postForm(error)
    }
    $(".js-toggle-gt").text("ERROR").addClass("btn-danger")
    let errmodal = $(errorModal)
    $("body").append(errmodal)
    errmodal.modal().modal("hide")
    $(".js-toggle-gt").on("click", errmodal.modal.bind(errmodal, "toggle"))
    postForm(error, appState).always(() => {
        errmodal.find("p").eq(1).text("Your error has been reported")
    })
}

export function postForm(error, appState) {
    return $.ajax({
        url:
            "https://docs.google.com/forms/u/0/d/e/1FAIpQLSf9_pdqwA36TaHjxxCKeT8iv-eLhXIx1DO2bxD7V7tKG3UXXw/formResponse",
        data: {
            "entry.1958338513": isUGMTLReplacingRaws()
                ? "true"
                : appState.waited
                ? "false"
                : "not waited",
            "entry.743789703": appState.UGMTLUpdated ? "true" : "false",
            "entry.879260605": appState.rawsReplaced ? "true" : "false",
            "entry.1237602720": appState.errorCode,
            "entry.765414833": error.name + "\n" + error.message,
        },
        type: "POST",
        dataType: "xml",
    })
}

export function sleepPromise(n) {
    return new Promise((res) => setTimeout(res, n))
}

export function seperateChunksIntoPars(chunks) {
    let pars = []
    chunks.forEach((chunk) =>
        chunk.split("\n\n").forEach((par) => pars.push(par))
    )
    return pars
}

export function seperateIntoNChunks(N, paragraphs) {
    let chunks = []
    let currentchunk = paragraphs[0]
    for (let i = 1; i < paragraphs.length; i++) {
        if ((currentchunk + paragraphs[i]).length >= N) {
            chunks.push(currentchunk)
            currentchunk = paragraphs[i]
        } else {
            currentchunk = currentchunk + "\n\n" + paragraphs[i]
        }
    }
    if (paragraphs.length != 0) {
        chunks.push(currentchunk)
    }
    return chunks
}
