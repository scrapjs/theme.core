// set default or saved colors
import { setStyleRule } from "./$service$/StyleRules.ts";
setStyleRule(":host, :root, :scope, :where(*)", {
    "--theme-base-color": localStorage.getItem("--theme-base-color") || "oklch(50% 0.3 0)",
    "--theme-wallpaper-is-dark": parseInt(localStorage.getItem("--theme-wallpaper-is-dark") || "0") || 0,
});

//
export * from "./$service$/ThemeEngine";
export * from "./$service$/AttributeStyle";

//
import run from "./$service$/ThemeEngine";
export default run;
