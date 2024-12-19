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
export const updateThemeBase = (originColor: string|null = null, $cssIsDark: boolean|null = null)=>{
    if (originColor != null && localStorage.getItem("--tm-origin") != originColor) localStorage.setItem("--tm-origin", originColor);
    if ($cssIsDark != null && (!!localStorage.getItem("--tm-scheme") != $cssIsDark)) localStorage.setItem("--tm-scheme", $cssIsDark as unknown as string);

    //
    setStyleRule(":host, :root, :scope, :where(*)", {
        "--tm-origin": localStorage.getItem("--tm-origin") || "oklch(0.46 0.14 310)",
        "--tm-scheme": (localStorage.getItem("--tm-scheme") ? 1 : 0) || 0
    });
}

//
addEventListener("storage", (event) => {
    if (event.key == "--tm-origin" || event.key == "--tm-scheme") {
        updateThemeBase();
    }
});

//
updateThemeBase();
