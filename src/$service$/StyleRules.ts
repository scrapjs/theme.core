export type StyleTuple = [selector: string, sheet: object];

//
const styleElement = document.createElement("style");
document.querySelector("head")?.appendChild?.(styleElement);

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
    if ($baseColor != null) localStorage.setItem("--theme-base-color", $baseColor);
    if ($cssIsDark != null) localStorage.setItem("--theme-wallpaper-is-dark", $cssIsDark as unknown as string);

    //
    setStyleRule(":host, :root, :scope, :where(*)", {
        "--theme-base-color"       : localStorage.getItem("--theme-base-color") || "oklch(50% 0.25 20)",
        "--theme-wallpaper-is-dark": localStorage.getItem("--theme-wallpaper-is-dark") || 0
    });
}

//
updateThemeBase();
