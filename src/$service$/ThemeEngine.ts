
// @ts-ignore
import styles from "../$scss$/Main.scss?inline&compress";
const preInit = URL.createObjectURL(new Blob([styles], {type: "text/css"}));

// @ts-ignore /* @vite-ignore */
import {importCdn} from "/externals/modules/cdnImport.mjs";
export {importCdn};

//
export const makeAttrSupport = async (selector, attr, type = "number", def = "0", rootElement = document.documentElement)=>{
    // @ts-ignore
    const { observeAttributeBySelector } = await Promise.try(importCdn, ["/externals/modules/dom.js"]);
    if (!CSS.supports("opacity", `attr(${attr} type(<${type}>), 1)`)) {
        observeAttributeBySelector(rootElement, selector, attr, (mutation)=>{
            const newValue = mutation.target.getAttribute(attr) ?? def;
            const oldValue = mutation?.target?.style?.getPropertyValue?.(`--${attr}-attr`);
            if (oldValue != newValue) { mutation?.target?.style?.setProperty?.(`--${attr}-attr`, newValue, ""); };
        });
    }
}

//
export const initialize = async (rootElement = document.documentElement, injectCSS = true)=>{
    // @ts-ignore
    const { loadInlineStyle, hash } = await Promise.try(importCdn, ["/externals/lib/dom.js"]);
    makeAttrSupport("*[data-highlight-hover]", "data-highlight-hover", "number", "0", rootElement);
    makeAttrSupport("*[data-highlight]", "data-highlight", "number", "0", rootElement);
    makeAttrSupport("*[data-chroma]", "data-chroma", "number", "0", rootElement);
    makeAttrSupport("*[data-alpha]", "data-alpha", "number", "0", rootElement)
    return loadInlineStyle(preInit, injectCSS ? rootElement : null, hash(styles));
};

//
export default initialize;
