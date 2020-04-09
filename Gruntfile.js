const banner = `// ==UserScript==
// @name         Translation Library
// @namespace    lnmtltl
// @version      0.1
// @description  Includes Sogou, Baido, Google Translate and more!
// @author       mmtf
// @match        https://lnmtl.com/chapter/*
// @grant        GM_setValue
// @grant        GM_getValue
// @require      https://userscripts-mirror.org/scripts/source/107941.user.js#sha384=Q8t880BurrlGKTdpvYv2+da12PYnvljdiU8aJvakk1uE3QMbzb190ueXNpAUY98p
// @license      MIT
// ==/UserScript==
`
module.exports = (grunt) => {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        browserify: {
            production: {
                src: "src/**/*.js",
                dest: "./dist/translatelib.user.js",
                options: {
                    banner,
                    browserifyOptions: { debug: false },
                    transform: [
                        [
                            "babelify",
                            {
                                presets: ["@babel/preset-env"],
                                plugins: [
                                    "@babel/plugin-proposal-class-properties",
                                ],
                            },
                        ],
                    ],
                    plugin: [["minifyify", { map: false }]],
                },
            },
            development: {
                src: "src/**/*.js",
                dest: "./dist/translatelib.dev.js",
                options: {
                    banner,
                    browserifyOptions: { debug: true },
                    transform: [
                        [
                            "babelify",
                            {
                                presets: ["@babel/preset-env"],
                                plugins: [
                                    "@babel/plugin-proposal-class-properties",
                                ],
                            },
                        ],
                    ],
                    plugin: [["minifyify", { map: true }]],
                },
            },
        },
        watch: {
            files: "src/**/*.js",
            tasks: ["browserify:development"],
        },
    })

    grunt.loadNpmTasks("grunt-browserify")
    grunt.loadNpmTasks("grunt-contrib-watch")

    grunt.registerTask("default", ["browserify"])
}
