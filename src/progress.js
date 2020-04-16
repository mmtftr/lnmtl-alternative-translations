import { devLog } from "./util"

export default class ProgressManager {
    static handleProgress(currentPath) {
        try {
            let novel
            devLog("checking progress")
            if ((novel = JSON.parse(GM_getValue(currentPath[1])))) {
                $(".panel-body").append(
                    `<dl> <dt>Continue where you left off</dt><a href="${novel.chapterLink}" class="btn btn-success">Chapter ${novel.chapterNumber}</a> </dl>`
                )
            }
        } catch (exception) {
            devLog(exception + " no progress found")
        }
    }
    constructor(currentPath) {
        let novelName = /lnmtl.com\/novel\/(.*)$/.exec(
            $(".dashhead-subtitle a").attr("href")
        )[1]
        GM_setValue(
            novelName,
            JSON.stringify({
                chapterLink: window.location.href,
                chapterNumber: window.location.pathname
                    .split("-")
                    .slice(-1)
                    .join(""),
            })
        )
    }
}
