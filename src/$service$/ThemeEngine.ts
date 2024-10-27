// @ts-ignore
import {formatCss, formatHex, interpolate, oklch, parse } from "@culori/bundled/culori.mjs";
import { fixedClientZoom } from "../$core$/Zoom";

//
const electronAPI = "electronBridge";

//
export const pickBgColor = (x, y, holder: HTMLElement | null = null)=>{
    const source = Array.from(document.elementsFromPoint(x, y));
    const opaque = source.sort((na, nb)=>{
        const zIndexA = parseInt(getComputedStyle(na as HTMLElement, "").zIndex || "0") || 0;
        const zIndexB = parseInt(getComputedStyle(nb as HTMLElement, "").zIndex || "0") || 0;
        return Math.sign(zIndexB - zIndexA);
    }).filter((node)=>{
        if (!(node instanceof HTMLElement)) return false;
        const computed = getComputedStyle(node as HTMLElement, "");
        const value  = computed.backgroundColor || "transparent";
        const parsed = parse(value);
        return ((parsed.alpha == null || parsed.alpha > 0.1) && value != "transparent") && node != holder;
    });

    //
    if (opaque[0] && opaque[0] instanceof HTMLElement) {
        const color = getComputedStyle(opaque[0] as HTMLElement, "")?.backgroundColor || "transparent"; //|| baseColor;
        if (holder && holder.style.getPropertyValue("--theme-dynamic-color") != color) {
            holder.style.setProperty("--theme-dynamic-color", color, "");
        }
        return color;
    }
    return "transparent";
};

//
const makeContrast = (color)=>{
    const cl = oklch(color);
    cl.l = Math.sign(0.5 - cl.l);
    cl.c *= 0.1;
    return formatCss(cl);
}

//
export const pickFromCenter = (holder)=>{
    const box = holder?.getBoundingClientRect?.(); //* zoomOf()
    if (box) {
        const xy: [number, number] = [(box.left + box.right) / 2 * fixedClientZoom(), (box.top + box.bottom) / 2 * fixedClientZoom()];
        pickBgColor(...xy, holder);
    }
}

//
export const switchTheme = (isDark = false) => {
    const media = document?.head?.querySelector?.('meta[data-theme-color]');
    const color = pickBgColor(window.innerWidth - 64, 30);

    //
    if (media) { media.setAttribute("content", color); }

    //
    if (window?.[electronAPI]) {
        window?.[electronAPI]?.setThemeColor?.(formatHex(color), formatHex(makeContrast(color)));
    }

    //
    document.querySelectorAll("[data-scheme=\"dynamic-transparent\"], [data-scheme=\"dynamic\"]").forEach((target)=>{
        if (target) {
            pickFromCenter(target);
        }
    });
};

// @ts-ignore
import styles from "../$scss$/_ColorTheme.scss?inline";

//
const loadInlineStyle = (inline: string)=>{
    const style = document.createElement("style");
    //style.innerHTML = inline;
    style.innerHTML = `@import url("${URL.createObjectURL(new Blob([inline], {type: "text/css"}))}");`;
    document.head.appendChild(style);
}

//
const loadBlobStyle = (inline: string)=>{
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.type = "text/css";
    style.href = URL.createObjectURL(new Blob([inline], {type: "text/css"}));
    document.head.appendChild(style);
    return style;
}

//
const initialize = ()=>{
    loadBlobStyle(styles);

    //
    window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", ({matches}) => { switchTheme(matches); });

    //
    setInterval(()=>{
        switchTheme(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }, 500);

    //
    document.addEventListener("u2-theme-change", ()=>{
        switchTheme(window.matchMedia("(prefers-color-scheme: dark)").matches);
    });
}

//
export default initialize;
