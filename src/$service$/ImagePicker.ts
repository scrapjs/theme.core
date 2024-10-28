import { switchTheme } from "./DynamicEngine";
import { updateThemeBase } from "./StyleRules";

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
    const baseColorI = interpolate([commonOkLch, chromaOkLch], "oklch", {
        // spline instead of linear interpolation:
    })(0.8); baseColorI.h ||= 0;

    //
    updateThemeBase(formatCss(baseColorI), !!(Math.sign(0.65 - commonOkLch.l) * 0.5 + 0.5));
    switchTheme(window.matchMedia("(prefers-color-scheme: dark)").matches);
};
