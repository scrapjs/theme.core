//
export const getZoom = ()=>{
    const zoomSupport = "currentCSSZoom" in document.documentElement;
    // @ts-ignore
    if (zoomSupport) { return ((document.documentElement.currentCSSZoom as number) || 1); }
    return parseFloat(document.documentElement.style.getPropertyValue("--scaling")) || 1;
}

//
let zoomValue = getZoom() || 1;
document.documentElement.addEventListener("scaling", ()=>{ zoomValue = getZoom() || 1; });
document.documentElement.addEventListener("resize", ()=>{ zoomValue = getZoom() || 1; });
if (!document.documentElement.classList.contains("__exp-use-zoom")) {
    document.documentElement.classList.add("__exp-use-zoom");
}
addEventListener("resize", ()=>{ zoomValue = getZoom() || 1; });

//
export const zoomOf = () => { return zoomValue || 1; };
export const changeZoom = (scale = 1) => {
    document.documentElement.style.setProperty("--scaling", scale as unknown as string);
    document.documentElement.dispatchEvent(new CustomEvent("scaling", {
        detail: {zoom: scale},
        bubbles: true,
        cancelable: true
    }));
    return scale;
}

//
export const fixedClientZoom = ()=>{
    return (document.documentElement?.currentCSSZoom != null ? 1 : zoomOf());
}

//
export const unfixedClientZoom = ()=>{
    return (document.documentElement?.currentCSSZoom == null ? 1 : zoomOf());
}
