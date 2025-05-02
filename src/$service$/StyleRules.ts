// @ts-ignore /* @vite-ignore */
import {importCdn} from "/externals/modules/cdnImport.mjs";
export {importCdn};

//
export type StyleTuple = [selector: string, sheet: object];
export const updateThemeBase = async (originColor: string|null = null, $cssIsDark: boolean|null = null)=>{
    if (originColor != null && localStorage.getItem("--tm-origin") != originColor) localStorage.setItem("--tm-origin", originColor);
    if ($cssIsDark != null && (!!localStorage.getItem("--tm-scheme") != $cssIsDark)) localStorage.setItem("--tm-scheme", $cssIsDark as unknown as string);

    // @ts-ignore
    const { setStyleRule } = await Promise.try(importCdn, ["/externals/lib/dom.js"]);
    setStyleRule(":host, :root, :scope, :where(*)", {
        "--tm-origin": localStorage.getItem("--tm-origin") || "oklch(0.2 0.01 180%)",
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
