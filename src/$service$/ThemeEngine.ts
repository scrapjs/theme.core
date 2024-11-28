//
export const observeAttributeBySelector = (element, selector, attribute, cb) => {
    const attributeList = new Set<string>((attribute.split(",") || [attribute]).map((s) => s.trim()));
    const observer = new MutationObserver((mutationList, observer) => {
        for (const mutation of mutationList) {
            if (mutation.type == "childList") {
                const addedNodes = Array.from(mutation.addedNodes) || [];
                const removedNodes = Array.from(mutation.removedNodes) || [];

                //
                addedNodes.push(...Array.from(mutation.addedNodes || []).flatMap((el)=>{
                    return Array.from((el as HTMLElement)?.querySelectorAll?.(selector) || []) as Element[];
                }));

                //
                removedNodes.push(...Array.from(mutation.removedNodes || []).flatMap((el)=>{
                    return Array.from((el as HTMLElement)?.querySelectorAll?.(selector) || []) as Element[];
                }));

                //
                [...Array.from((new Set(addedNodes)).values())].filter((el) => (<HTMLElement>el)?.matches?.(selector)).forEach((target)=>{
                    attributeList.forEach((attribute)=>{
                        cb({ target, type: "attributes", attributeName: attribute, oldValue: (target as HTMLElement)?.getAttribute?.(attribute) }, observer);
                    });
                });
            } else
            if ((mutation.target as HTMLElement)?.matches?.(selector) && (mutation.attributeName && attributeList.has(mutation.attributeName))) {
                cb(mutation, observer);
            }
        }
    });

    //
    observer.observe(element, {
        attributeOldValue: true,
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: [...attributeList],
        characterData: true
    });

    //
    Array.from(element.querySelectorAll(selector)).forEach((target)=>{
        attributeList.forEach((attribute)=>{
            cb({ target, type: "attributes", attributeName: attribute, oldValue: (target as HTMLElement)?.getAttribute?.(attribute) }, observer);
        });
    });

    //
    return observer;
};

//
export const makeAttrSupport = (selector, attr, type = "number", def = "0", rootElement = document.documentElement)=>{
    if (!CSS.supports("opacity", `attr(${attr} ${type}, 1)`)) {
        observeAttributeBySelector(rootElement, selector, attr, (mutation)=>{
            mutation?.target?.style?.setProperty?.(`--${attr}-attr`, mutation.target.getAttribute(attr) ?? def, "");
        });
    }
}

// @ts-ignore
import styles from "../$scss$/_ColorTheme.scss?inline&compress";

//
const OWNER = "theme";

//
const setStyleURL = (base: [any, any], url: string)=>{
    //
    if (base[1] == "innerHTML") {
        base[0][base[1]] = `@import url("${url}");`;
    } else {
        base[0][base[1]] = url;
    }
}

//
const hash = async (string: string) => {
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(string));
    return "sha256-" + btoa(String.fromCharCode.apply(null, new Uint8Array(hashBuffer) as unknown as number[]));
}

//
const loadStyleSheet = async (inline: string, base?: [any, any], integrity?: string|Promise<string>)=>{
    const url = URL.canParse(inline) ? inline : URL.createObjectURL(new Blob([inline], {type: "text/css"}));
    if (base?.[0] && (!URL.canParse(inline) || integrity) && base?.[0] instanceof HTMLLinkElement) {
        const I: any = (integrity ?? hash(inline));
        if (typeof I?.then == "function") {
            I?.then?.((H)=>base?.[0]?.setAttribute?.("integrity", H));
        } else {
            base?.[0]?.setAttribute?.("integrity", I as string);
        }
    }
    if (base) setStyleURL(base, url);
}

//
const preInit = URL.createObjectURL(new Blob([styles], {type: "text/css"}));
const integrity = hash(styles);

//
export const styleCode = {preInit, integrity, styles};

//
const loadBlobStyle = (inline: string, integrity?: string|Promise<string>)=>{
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.type = "text/css";
    style.crossOrigin = "same-origin";
    style.dataset.owner = OWNER;
    loadStyleSheet(inline, [style, "href"], integrity);
    document.head.appendChild(style);
    return style;
}

//
const loadInlineStyle = (inline: string, rootElement: HTMLElement|null = document.head, $integrity = integrity)=>{
    const PLACE = (rootElement?.querySelector?.("head") ?? rootElement) as HTMLElement;
    if (PLACE instanceof HTMLHeadElement) { return loadBlobStyle(inline); }

    //
    const style = document.createElement("style");
    style.dataset.owner = OWNER;
    loadStyleSheet(inline, [style, "innerHTML"], $integrity);
    PLACE?.appendChild?.(style);
    return style;
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
