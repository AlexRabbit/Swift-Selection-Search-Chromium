/* Service worker entry: iconv-lite expects `window`; MV3 workers only have `self`. */
var window = globalThis;
var global = globalThis;
importScripts(
	"libs/browser-polyfill.min.js",
	"libs/iconv-lite.js",
	"search-variable-modifications.js",
	"swift-selection-search.js"
);
