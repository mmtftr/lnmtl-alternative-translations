import { devLog, isElementInViewport, throttle } from "./util";
export default class ProgressManager {
    static handleProgress(currentPath) {
        try {
            let novel;
            devLog("checking progress");
            if ((novel = JSON.parse(GM_getValue(currentPath[1])))) {
                $(".panel-body")
                    .eq(0)
                    .append(
                        `<dl> <dt>Continue where you left off</dt><a href="${novel.chapterLink}" class="btn btn-success">Chapter ${novel.chapterNumber}</a> </dl>`
                    );
            }
        } catch (exception) {
            devLog(exception + " no progress found");
        }
    }
    constructor() {
        this.novelName = /lnmtl.com\/novel\/(.*)$/.exec(
            $(".dashhead-subtitle a").attr("href")
        )[1];
        this.chapterLink = window.location.href;
        this.chapterNumber = window.location.pathname.split("-").slice(-1)[0];
        this.sentenceIndex = this.getStoredProgress().sentenceIndex;
        this.storedSentenceIndex = this.sentenceIndex; // Keep this so priority manager can restore progress with temporary translator

        // Reset the sentenceIndex if we're in a different chapter
        if (this.chapterLink !== this.getStoredProgress().chapterLink) {
            this.storedSentenceIndex = 0;
            this.sentenceIndex = 0;
        }

        // Mark sentences with their indexes for progress tracking
        $("sentence.translated").each(function (i) {
            $(this).data("index", i);
        });
        $("sentence.original").each(function (i) {
            $(this).data("index", i);
        });
    }
    restoreProgress() {
        devLog("restore progress");
        if (!this.storedSentenceIndex) return;
        const scrollTo = $(
            "sentence:visible[data-index=" + this.storedSentenceIndex + "]"
        ).get(0);
        scrollTo.scrollIntoView({ behavior: "smooth" });
    }
    //#region State Managers
    getStoredProgress() {
        try {
            return JSON.parse(GM_getValue(this.novelName));
        } catch (e) {
            return {};
        }
    }
    setCurrentProgress() {
        GM_setValue(
            this.novelName,
            JSON.stringify({
                chapterLink: this.chapterLink,
                chapterNumber: this.chapterNumber,
                sentenceIndex: this.sentenceIndex,
            })
        );
    }
    //#endregion
    //#region Track with Events
    trackSentenceProgress() {
        $(document).on("scroll", throttle(this.trackProgress.bind(this), 200));
    }
    trackProgress() {
        const oldIndex = this.sentenceIndex;
        for (let sentence of $("sentence:visible").get()) {
            if (isElementInViewport(sentence)) {
                this.sentenceIndex = $(sentence).data("index");
                break;
            }
        }
        if (this.sentenceIndex !== oldIndex) {
            this.setCurrentProgress();
            devLog("tracked " + this.sentenceIndex);
        }
    }
    //#endregion
}
