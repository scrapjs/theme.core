import { qualityMode } from "./Config.js";
import { dynamicNativeFrame, dynamicBgColors } from "./DynamicEngine";
import { updateThemeBase } from "./StyleRules";

// @ts-ignore
import { argbFromRgb, Hct, hexFromArgb, QuantizerCelebi } from "@material/material-color-utilities";

// @ts-ignore
import { interpolate, oklch, parse, formatCss } from "culori";

//
export const sourceColorFromImage = async (bitmap): Promise<any> => {

    // Convert Image data to Pixel Array
    const Q = qualityMode["fast"];

    //
    if (!(bitmap.naturalWidth ?? bitmap.width) || !(bitmap.naturalHeight ?? bitmap.height)) {
        return [0, 0];
    }

    //
    const canvas = new OffscreenCanvas(
        (bitmap.naturalWidth ?? bitmap.width) / Q.divisor,
        (bitmap.naturalHeight ?? bitmap.height) / Q.divisor
    );

    //
    const context = canvas.getContext('2d', {
        alpha: false,
        opaque: true,
        colorSpace: "srgb",
        desynchronized: true
    });

    //
    if (!context) {
        throw new Error('Could not get canvas context');
    }

    //
    const rect: [x: number, y: number, w: number, h: number] = [0, 0, canvas.width as number, canvas.height as number];
    context.save();
    context.fillStyle = "black";
    context.clearRect(...rect);
    context.fillRect(...rect);
    context.filter = Q.filter;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, ...rect);
    context.restore();

    //
    const imageBytes = context?.getImageData?.(...rect, {colorSpace: "srgb"}).data;
    if (!imageBytes) {return [0, 0];};

    // Convert Image data to Pixel Array
    const pixels: any[] = [];
    for (let i = 0; i < imageBytes.length; i += 4) {
        const r = imageBytes[i];
        const g = imageBytes[i + 1];
        const b = imageBytes[i + 2];
        const a = imageBytes[i + 3];
        if (a < 255) {continue;}
        const argb = argbFromRgb?.(r, g, b);
        if (argb) pixels.push(argb);
    }

    //
    const result = await QuantizerCelebi.quantize(pixels, Q.sampling);
    const colors: [number, number][] = Array.from(result.entries());

    //
    const mostChroma = colors.toSorted((a, b) => {
        const hct_a = Hct.fromInt(a[0] as number);
        const hct_b = Hct.fromInt(b[0] as number);
        return Math.sign(hct_b.chroma - hct_a.chroma);
    });
    const mostCount  = mostChroma.toSorted((a: [number, number], b: [number, number]) => { return Math.sign(b[1] - a[1]); });

    //
    return [mostChroma[0], mostCount[0]];
};

//
export const colorScheme = async (blob) => {
    const image = await createImageBitmap(blob);
    const [[chroma, cr_cnt], [common, cm_cnt]] = await sourceColorFromImage(image);

    //
    const chromaOkLch: any = oklch(parse(hexFromArgb(chroma)));
    const commonOkLch: any = oklch(parse(hexFromArgb(common)));

    //
    const baseColorI = interpolate([commonOkLch, chromaOkLch], "oklch", {
        // spline instead of linear interpolation:
    })(Math.min(Math.max(cr_cnt / cm_cnt, 0) / (commonOkLch.c || 0.01), 0.8)); baseColorI.h ||= 0;

    //
    updateThemeBase(formatCss(baseColorI), !!(Math.sign(0.6 - baseColorI.l) * 0.5 + 0.5));
    dynamicNativeFrame();
    dynamicBgColors();
};
