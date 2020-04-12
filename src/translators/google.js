export default class GoogleTranslate {
    chunkLen = 5000
    translateText(text) {
        return new Promise((res, rej) =>
            $.ajax(
                "https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-CN&tl=en&dt=t",
                {
                    method: "POST",
                    data: {
                        q: text,
                    },
                    dataType: "json",
                }
            )
                .done((t) => {
                    let paragraph = ""
                    for (let i = 0; i < t[0].length; i++) {
                        paragraph += t[0][i][0]
                    }
                    return res(paragraph)
                })
                .fail((err) => {
                    rej(
                        new Error(
                            "An error occurred while fetching the translations: " +
                                err
                        )
                    )
                })
        )
    }
}
