const banner = (addition) => `// ==UserScript==
// @name         Translation Library
// @namespace    lnmtltl
// @version      0.5.8
// @description  Includes Niutrans, Baido, Google Translate and more!
// @author       mmtf
// @match        https://lnmtl.com/**
// @match        https://tt.lnmtl.com/**
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @connect      niutrans.vip
// @connect      niutrans.com
// @connect      baidu.com
${addition || ""}
// @license      MIT
// ==/UserScript==
`;
const productionMeta = `
// @downloadURL https://openuserjs.org/install/mmtf/Translation_Library.user.js
// @updateURL https://openuserjs.org/meta/mmtf/Translation_Library.meta.js`;

module.exports = (grunt) => {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        browserify: {
            production: {
                src: "src/**/*.js",
                dest: "./dist/translatelib.user.js",
                options: {
                    banner: banner(productionMeta),
                    cacheFile: "./cache/prod.json",
                    browserifyOptions: {
                        debug: false,
                    },
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
                        ["envify", { NODE_ENV: "production" }],
                    ],
                    plugin: [["minifyify", { map: false }]],
                },
            },
            development: {
                src: "src/**/*.js",
                dest: "./dist/translatelib.dev.js",
                options: {
                    banner: banner(),
                    cacheFile: "./cache/dev.json",
                    browserifyOptions: {
                        debug: true,
                    },
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
                        ["envify", { NODE_ENV: "development" }],
                    ],
                },
            },
        },
        watch: {
            options: {
                atBegin: true,
            },
            files: "src/**/*.js",
            tasks: ["browserify:development"],
        },
    });

    grunt.loadNpmTasks("grunt-browserify");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.registerTask("default", ["browserify"]);
};
