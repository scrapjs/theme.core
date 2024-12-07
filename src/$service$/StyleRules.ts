export type StyleTuple = [selector: string, sheet: object];

//
const styleElement = document.createElement("style");
document.querySelector("head")?.appendChild?.(styleElement);
styleElement.dataset.owner = "theme";

//
export const setStyleRule = (selector: string, sheet: object) => {
    const styleRules = styleElement.sheet;
    let ruleId = Array.from(styleRules?.cssRules || []).findIndex((rule) => (rule instanceof CSSStyleRule ? (selector == rule?.selectorText) : false));
    if (ruleId <= -1) {ruleId = styleRules?.insertRule(`${selector} {}`) as number;}

    //
    const rule = styleElement?.sheet?.cssRules[ruleId];
    Object.entries(sheet).forEach(([propName, propValue]) => {
        if (rule instanceof CSSStyleRule) {
            const exists = rule?.style?.getPropertyValue(propName);
            if (!exists || exists != propValue) {
                rule?.style?.setProperty?.(propName, (propValue || "") as string, "");
            }
        }
    });
};

//
export const setStyleRules = (classes: StyleTuple[]) => {
    return classes?.map?.((args) => setStyleRule(...args));
};

//
export const updateThemeBase = ($baseColor: string|null = null, $cssIsDark: boolean|null = null)=>{
    if ($baseColor != null && localStorage.getItem("--theme-base-color") != $baseColor) localStorage.setItem("--theme-base-color", $baseColor);
    if ($cssIsDark != null && (!!localStorage.getItem("--theme-wallpaper-is-dark") != $cssIsDark)) localStorage.setItem("--theme-wallpaper-is-dark", $cssIsDark as unknown as string);

    //
    setStyleRule(":host, :root, :scope, :where(*)", {
        "--theme-base-color"       : localStorage.getItem("--theme-base-color") || "oklch(0.46 0.14 310)",
        "--theme-wallpaper-is-dark": localStorage.getItem("--theme-wallpaper-is-dark") || 0
    });
}

//
addEventListener("storage", (event) => {
    if (event.key == "--theme-base-color" || event.key == "--theme-wallpaper-is-dark") {
        updateThemeBase();
    }
});

//
updateThemeBase();
