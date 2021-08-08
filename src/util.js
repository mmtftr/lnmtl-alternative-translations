export function getRawParagraphs() {
    return $(".original").text().trim().split("\n")
}

export function getMTLParagraphs() {
    return $(".translated").text().trim().split("\n")
}

export function devLog(...message) {
    if (process.env.NODE_ENV === "production") {
        return
    }
    console.log(...message)
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
        url: "https://docs.google.com/forms/u/0/d/e/1FAIpQLSf9_pdqwA36TaHjxxCKeT8iv-eLhXIx1DO2bxD7V7tKG3UXXw/formResponse",
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

// https://stackoverflow.com/a/42630560/6519578
export function isNumber(evt) {
    evt = evt ? evt : window.event
    var charCode = evt.which ? evt.which : evt.keyCode
    if ((charCode > 31 && charCode < 48) || charCode > 57) {
        return false
    }
    return true
}
export function sign(r, gtk = 0) {
    var i = null
    var o = r.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g)
    if (null === o) {
        var t = r.length
        t > 30 &&
            (r =
                "" +
                r.substr(0, 10) +
                r.substr(Math.floor(t / 2) - 5, 10) +
                r.substr(-10, 10))
    } else {
        for (
            var e = r.split(/[\uD800-\uDBFF][\uDC00-\uDFFF]/),
                C = 0,
                h = e.length,
                f = [];
            h > C;
            C++
        )
            "" !== e[C] && f.push.apply(f, a(e[C].split(""))),
                C !== h - 1 && f.push(o[C])
        var g = f.length
        g > 30 &&
            (r =
                f.slice(0, 10).join("") +
                f.slice(Math.floor(g / 2) - 5, Math.floor(g / 2) + 5).join("") +
                f.slice(-10).join(""))
    }
    var u = void 0,
        l =
            "" +
            String.fromCharCode(103) +
            String.fromCharCode(116) +
            String.fromCharCode(107)
    u = null !== i ? i : (i = gtk || "") || ""
    for (
        var d = u.split("."),
            m = Number(d[0]) || 0,
            s = Number(d[1]) || 0,
            S = [],
            c = 0,
            v = 0;
        v < r.length;
        v++
    ) {
        var A = r.charCodeAt(v)
        128 > A
            ? (S[c++] = A)
            : (2048 > A
                  ? (S[c++] = (A >> 6) | 192)
                  : (55296 === (64512 & A) &&
                    v + 1 < r.length &&
                    56320 === (64512 & r.charCodeAt(v + 1))
                        ? ((A =
                              65536 +
                              ((1023 & A) << 10) +
                              (1023 & r.charCodeAt(++v))),
                          (S[c++] = (A >> 18) | 240),
                          (S[c++] = ((A >> 12) & 63) | 128))
                        : (S[c++] = (A >> 12) | 224),
                    (S[c++] = ((A >> 6) & 63) | 128)),
              (S[c++] = (63 & A) | 128))
    }
    for (
        var p = m,
            F =
                "" +
                String.fromCharCode(43) +
                String.fromCharCode(45) +
                String.fromCharCode(97) +
                ("" +
                    String.fromCharCode(94) +
                    String.fromCharCode(43) +
                    String.fromCharCode(54)),
            D =
                "" +
                String.fromCharCode(43) +
                String.fromCharCode(45) +
                String.fromCharCode(51) +
                ("" +
                    String.fromCharCode(94) +
                    String.fromCharCode(43) +
                    String.fromCharCode(98)) +
                ("" +
                    String.fromCharCode(43) +
                    String.fromCharCode(45) +
                    String.fromCharCode(102)),
            b = 0;
        b < S.length;
        b++
    )
        (p += S[b]), (p = n(p, F))
    return (
        (p = n(p, D)),
        (p ^= s),
        0 > p && (p = (2147483647 & p) + 2147483648),
        (p %= 1e6),
        p.toString() + "." + (p ^ m)
    )
}
function n(a, o) {
    var s = 0
    for (; s < o.length - 2; s = s + 3) {
        var d = o.charAt(s + 2)
        d = d >= "a" ? d.charCodeAt(0) - 87 : Number(d)
        d = "+" === o.charAt(s + 1) ? a >>> d : a << d
        a = "+" === o.charAt(s) ? (a + d) & 4294967295 : a ^ d
    }
    return a
}
function a(r) {
    if (Array.isArray(r)) {
        for (var o = 0, t = Array(r.length); o < r.length; o++) t[o] = r[o]
        return t
    }
    return Array.from(r)
}

// https://stackoverflow.com/a/7557433/6519578
export function isElementInViewport(el) {
    // Special bonus for those using jQuery
    if (typeof jQuery === "function" && el instanceof jQuery) {
        el = el[0]
    }

    var rect = el.getBoundingClientRect()

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <=
            (window.innerHeight ||
                document.documentElement
                    .clientHeight) /* or $(window).height() */ &&
        rect.right <=
            (window.innerWidth ||
                document.documentElement.clientWidth) /* or $(window).width() */
    )
}
export function throttle(func, wait, options) {
    var context, args, result
    var timeout = null
    var previous = 0
    if (!options) options = {}
    var later = function () {
        previous = options.leading === false ? 0 : Date.now()
        timeout = null
        result = func.apply(context, args)
        if (!timeout) context = args = null
    }
    return function () {
        var now = Date.now()
        if (!previous && options.leading === false) previous = now
        var remaining = wait - (now - previous)
        context = this
        args = arguments
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout)
                timeout = null
            }
            previous = now
            result = func.apply(context, args)
            if (!timeout) context = args = null
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining)
        }
        return result
    }
}

export function defer() {
    const returnObj = {}
    returnObj.promise = new Promise((res, rej) => {
        returnObj.resolve = res
        returnObj.reject = rej
    })
    return returnObj
}
