import { switchTheme } from "../$service$/ThemeEngine";
import { setStyleRule } from "../$service$/StyleRules";

//
let baseColorI: any = {};
let baseColor: string = localStorage.getItem("--theme-base-color") || "oklch(50% 0.3 0)";
let cssIsDark = parseInt(localStorage.getItem("--theme-wallpaper-is-dark") || "0") || 0;

//
export const updateStyleRule = ($baseColor: string|null = null, $cssIsDark: boolean|null = null)=>{
    localStorage.setItem("--theme-base-color", baseColor = $baseColor ?? baseColor);
    localStorage.setItem("--theme-wallpaper-is-dark", ($cssIsDark ?? cssIsDark) as unknown as string);

    //
    setStyleRule(":host, :root, :scope, :where(*)", {
        "--theme-base-color": baseColor,
        "--theme-wallpaper-is-dark": cssIsDark,
    });
}

//
export const colorScheme = async (blob) => {
    // @ts-ignore
    const {sourceColorFromImage, hexFromArgb, formatCss, interpolate, oklch, parse} = await import("../$deps$/CModule");

    //
    const image = await createImageBitmap(blob);
    const [chroma, common] = await sourceColorFromImage(image);

    //
    const chromaOkLch: any = oklch(parse(hexFromArgb(chroma)));
    const commonOkLch: any = oklch(parse(hexFromArgb(common)));

    //
    cssIsDark  = Math.sign(0.65 - commonOkLch.l) * 0.5 + 0.5;
    baseColorI = interpolate([commonOkLch, chromaOkLch], "oklch", {
        // spline instead of linear interpolation:
    })(0.8);

    //
    baseColorI.h ||= 0;
    baseColor = formatCss(baseColorI);

    //
    updateStyleRule();
    switchTheme(window.matchMedia("(prefers-color-scheme: dark)").matches);
};

//
updateStyleRule();
