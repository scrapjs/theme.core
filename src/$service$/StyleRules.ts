// @ts-ignore
import { setStyleRule } from "/externals/lib/dom.js";

//
export type StyleTuple = [selector: string, sheet: object];
export const updateThemeBase = (originColor: string|null = null, $cssIsDark: boolean|null = null)=>{
    if (originColor != null && localStorage.getItem("--tm-origin") != originColor) localStorage.setItem("--tm-origin", originColor);
    if ($cssIsDark != null && (!!localStorage.getItem("--tm-scheme") != $cssIsDark)) localStorage.setItem("--tm-scheme", $cssIsDark as unknown as string);

    //
    setStyleRule(":host, :root, :scope, :where(*)", {
        "--tm-origin": localStorage.getItem("--tm-origin") || "oklch(90% 0.04 75)",
        "--tm-scheme": (localStorage.getItem("--tm-scheme") ? 1 : 0) || 0
    });
}

//
requestIdleCallback(()=>updateThemeBase(), {timeout: 100});
addEventListener("storage", (event) => {
    if (event.key == "--tm-origin" || event.key == "--tm-scheme") {
        updateThemeBase();
    }
});
