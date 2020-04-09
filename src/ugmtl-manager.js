import { devLog } from "./util"

export default class UGMTLManager {
  set rawsReplaced(newVal) {
    this._rawsReplaced = newVal
    if (newVal) this._resolve()
  }
  get rawsReplaced() {
    return this._rawsReplaced
  }

  /**
   * @param {Number} waitTime
   */
  constructor(waitTime) {
    /**
     * Private class variable that
     * tracks raws replaced status
     */
    this._rawsReplaced = false
    /**
     * Class variable that tracks if version of UGMTL >= 1.6.8
     */
    this.UGMTLUpdated = false

    this.rawsReplacedPromise = new Promise((res) => (this._resolve = res))
    this.observeRaws()

    setTimeout(this.rawsReplace.bind(this), waitTime)
  }

  isUGMTLReplacingRaws() {
    if ($("#replaceInOriginal")[0] && $("#replaceInOriginal")[0].checked) {
      return true
    }
    return false
  }

  UGMTLUpdatedWarning() {
    devLog(this.UGMTLUpdated, this.isUGMTLReplacingRaws())
    if (!this.UGMTLUpdated && this.isUGMTLReplacingRaws()) {
      let disclaimer = $(`<div class="alert alert-danger" role="alert">
                                <span class="glyphicon glyphicon-exclamation-sign"></span>
                                <span class="sr-only">Danger:</span>
                                Please update UGMTL to 1.6.8+ for proper integration between the two extensions.
                                This userscript might not work on some novels when UGMTL's lower versions are installed, please proceed with caution.
                                </div>`)
      $(
        "#chapter-display-options-modal > div > div > div.modal-body > h3:nth-child(10)"
      ).after(disclaimer)
    }
  }

  // rawsReplaced becomes true when the last raw has its terms replaced
  observerCallback(mutationList) {
    mutationList.forEach((mutation) => {
      switch (mutation.type) {
        case "attributes":
          if (mutation.attributeName == "data-title") {
            setTimeout(() => {
              this.rawsReplaced = true
            }, 50)
          }
          break
      }
    })
  }

  observeRaws() {
    const observerOptions = {
      childList: false,
      attributes: true,
    }

    /** Observes last element in translated sentences for UGMTL integration
     *  @deprecated This method has many shortcomings and would fail in many edge-cases.
     *  Update UGMTL for proper raw replacement detection
     * */
    const observer = new MutationObserver(this.observerCallback)

    if ($(".original t").get(-1) != undefined) {
      observer.observe($(".original t").get(-1), observerOptions) // Observe last element in translated texts
    }

    observeDocument() // Listen for UGMTL's document event

    if (
      window.sessionStorage.getItem("userjs_UGMTLComplete") &&
      window.sessionStorage.getItem("userjs_UGMTLComplete") >
        window.performance.timing.fetchStart
    ) {
      this.rawsReplaced = true
      this.UGMTLUpdated = true
    }
  }
  /**
   * Listens for event declared on document by UGMTL 1.6.8^
   * Reliable to detect raw replacement
   */
  observeDocument() {
    document.addEventListener(
      "userjs_UGMTLComplete",
      function () {
        devLog("userjs_UGMTLComplete")
        this.rawsReplaced = true
        this.UGMTLUpdated = true
      },
      false
    )
  }

  /**
   * Replaces raws when UGMTL is not installed
   */
  rawsReplace() {
    if (this.isUGMTLReplacingRaws()) return
    $(".original t").each(function () {
      let mytext = $(this).text()
      $(this).text(
        $(this)
          .attr("data-title")
          .replace(/\(\w+\)/g, "")
      )
      $(this).attr("data-title", mytext)
    })
    // add whitespace between two english words
    $(".original")
      .find("t")
      .filter(function (index) {
        var prev = $(this).get(0).previousSibling
        return prev ? $(this).get(0).previousSibling.nodeName == "T" : false
      })
      .each(function () {
        $(this).text(" " + $(this).text())
      })
    this._resolve()
  }
}
