// @ts-ignore
import { formatCss, formatHex, oklch, parse } from "culori";
import { electronAPI } from "./Config.js";

// @ts-ignore
import { fixedClientZoom } from "/externals/core/agate.js";

//
const tacp = (color: string)=>{
    const p = parse?.(color);
    return (p?.alpha == null || p?.alpha > 0.1);
};

//
const setIdleInterval = (cb, timeout = 1000, ...args)=>{
    requestIdleCallback(async ()=>{
        if (!cb || typeof cb != "function") return;
        while (true) {
            await Promise.try(cb, ...args);
            await new Promise((r)=>setTimeout(r, timeout));
            await new Promise((r)=>requestIdleCallback(r));
        }
    }, {timeout: 1000});
}

//
export const pickBgColor = (x, y, holder: HTMLElement | null = null)=>{
    // exclude any non-reasonable
    const opaque = Array.from(document.elementsFromPoint(x, y))?.filter?.((el: any)=>(
        ((el instanceof HTMLElement) && el != holder) &&
         el?.matches?.("[data-scheme]:not([data-hidden])") &&
        (el?.dataset?.alpha != null ? parseFloat(el?.dataset?.alpha) > 0.01 : true) &&
        (el?.style?.getPropertyValue("display") != "none")
    ))
    .map((element) => {
        const computed = getComputedStyle?.(element);
        return {
            element,
            zIndex: parseInt(computed?.zIndex || "0", 10) || 0,
            color: (computed?.backgroundColor || "transparent")
        }})
    .sort((a, b) => Math.sign(b.zIndex - a.zIndex))
    .filter(({ color })=>(color != "transparent" && tacp(color)));

    //
    if (opaque?.[0]?.element instanceof HTMLElement) {
        const color: string = formatCss(opaque?.[0]?.color) || "transparent"; //|| baseColor;
        if (holder?.style?.getPropertyValue?.("--tm-adapt") != color) {
            holder?.style?.setProperty?.("--tm-adapt", color, "");
        }
        return color;
    }

    //
    return "transparent";
};

//
export const makeContrast = (color)=>{
    const cl = oklch(color);
    cl.l = Math.sign(0.5 - cl.l);
    cl.c *= 0.1;
    return formatCss(cl);
}

//
export const pickFromCenter = (holder)=>{
    // not able to using some mechanics
    const box = holder?.getBoundingClientRect();//getBoundingOrientBox(holder);
    if (box) {
        const Z = 0.5 * (fixedClientZoom?.() || 1);
        const xy: [number, number] = [(box.left + box.right) * Z, (box.top + box.bottom) * Z];
        return pickBgColor(...xy, holder);
    }
}

//
export const dynamicNativeFrame = (root = document.documentElement)=>{
    const media = root?.querySelector?.('meta[data-theme-color]');
    const color = pickBgColor(window.innerWidth - 64, 30);
    if ((media || window?.[electronAPI]) && root == document.documentElement) {
        media?.setAttribute?.("content", color);
        window?.[electronAPI]?.setThemeColor?.(formatHex(color), formatHex(makeContrast(color)));
    }
}

//
export const dynamicBgColors = (root = document.documentElement) => {
    root.querySelectorAll("[data-scheme=\"dynamic-transparent\"], [data-scheme=\"dynamic\"]").forEach((target)=>{
        if (target) { pickFromCenter(target); }
    });
};

//
export const dynamicTheme = (ROOT = document.documentElement)=>{
    //
    window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", ({}) => { dynamicBgColors(ROOT); });

    //
    ROOT.addEventListener("u2-appear", ()=>{
        requestIdleCallback(()=>{
            dynamicNativeFrame(ROOT);
            dynamicBgColors(ROOT);
        });
    });

    //
    ROOT.addEventListener("u2-hidden", ()=>{
        requestIdleCallback(()=>{
            dynamicNativeFrame(ROOT);
            dynamicBgColors(ROOT);
        });
    });

    //
    ROOT.addEventListener("u2-theme-change", ()=>{
        dynamicNativeFrame(ROOT);
        dynamicBgColors(ROOT);
    });

    //
    setIdleInterval(()=>{
        dynamicNativeFrame(ROOT);
        dynamicBgColors(ROOT);
    }, 2000);
}

//
export default dynamicTheme;
