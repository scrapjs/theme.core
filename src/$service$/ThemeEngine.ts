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
import styles from "../$scss$/_ColorTheme.scss?inline";

//
const loadInlineStyle = (inline: string, rootElement = document.head)=>{
    const style = document.createElement("style");
    style.dataset.owner = "theme";
    //style.innerHTML = inline;
    style.innerHTML = `@import url("${URL.createObjectURL(new Blob([inline], {type: "text/css"}))}");`;

    //
    (rootElement.querySelector("head") ?? rootElement).appendChild(style);
}

//
export const initialize = (rootElement = document.documentElement)=>{
    makeAttrSupport("*[data-highlight-hover]", "data-highlight-hover", "number", "0", rootElement);
    makeAttrSupport("*[data-highlight]", "data-highlight", "number", "0", rootElement);
    makeAttrSupport("*[data-chroma]", "data-chroma", "number", "0", rootElement);
    makeAttrSupport("*[data-alpha]", "data-alpha", "number", "0", rootElement)
    loadInlineStyle(styles, rootElement);
};

//
export default initialize;
