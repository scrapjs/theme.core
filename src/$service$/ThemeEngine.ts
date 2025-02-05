// @ts-ignore
import { observeAttributeBySelector, hash, loadInlineStyle } from "/externals/lib/dom.js";

// @ts-ignore
import styles from "../$scss$/Main.scss?inline&compress";
const preInit = URL.createObjectURL(new Blob([styles], {type: "text/css"}));
const integrity = hash(styles);

//
export const makeAttrSupport = (selector, attr, type = "number", def = "0", rootElement = document.documentElement)=>{
    if (!CSS.supports("opacity", `attr(${attr} type(<${type}>), 1)`)) {
        observeAttributeBySelector(rootElement, selector, attr, (mutation)=>{
            const newValue = mutation.target.getAttribute(attr) ?? def;
            const oldValue = mutation?.target?.style?.getPropertyValue?.(`--${attr}-attr`);
            if (oldValue != newValue) { mutation?.target?.style?.setProperty?.(`--${attr}-attr`, newValue, ""); };
        });
    }
}

//
export const initialize = (rootElement = document.documentElement, injectCSS = true)=>{
    makeAttrSupport("*[data-highlight-hover]", "data-highlight-hover", "number", "0", rootElement);
    makeAttrSupport("*[data-highlight]", "data-highlight", "number", "0", rootElement);
    makeAttrSupport("*[data-chroma]", "data-chroma", "number", "0", rootElement);
    makeAttrSupport("*[data-alpha]", "data-alpha", "number", "0", rootElement)
    return loadInlineStyle(preInit, injectCSS ? rootElement : null, integrity);
};

//
export default initialize;
