
// @ts-ignore
import {argbFromRgb, Hct, hexFromArgb, QuantizerCelebi} from "@material/material-color-utilities/index.js";

//
const qualityMode = {
    "fast": {
        divisor: 4,
        filter: "blur(4px)",
        sampling: 128
    }
};

//
export const sourceColorFromImage = async (bitmap) => {

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
        desynchronized: true,
        willReadFrequently: true
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
    //const area = image.dataset['area'];
    //if (area && /^\d+(\s*,\s*\d+){3}$/.test(area)) {
    //rect = area.split(/\s*,\s*/).map((s) => {
    // tslint:disable-next-line:ban
    //return parseInt(s, 10);
    //});
    //}

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
    const mostCount = colors.toSorted((a: [number, number], b: [number, number]) => {
        return Math.sign(b[1] - a[1]);
    });

    // status bar have no chroma requirements
    //document.head.querySelector("meta[name='theme-color']:not([media])")?.setAttribute?.("content", hexFromArgb(mostCount[0][0]));
    document.body.style.setProperty("--mx-common-bg-color", hexFromArgb(mostCount[0][0]));

    //
    const mostChroma = mostCount.toSorted((a, b) => {
        const hct_a = Hct.fromInt(a[0] as number);
        const hct_b = Hct.fromInt(b[0] as number);
        return Math.sign(hct_b.chroma - hct_a.chroma);
    });

    //
    document.body.style.setProperty("--mx-common-bg-chroma-color", hexFromArgb(mostChroma[0][0]));
    return [mostChroma[0][0], mostCount[0][0]];
};

//
export const applyTheme = (theme, options) => {
    const target = options?.target || document.body;
    const media = matchMedia('(prefers-color-scheme: dark)');

    //
    const listener = (media) => {
        const _ = media.matches ? 'dark' : 'light';
        reflectSchemeProperties(target, theme.schemes[_], _);
    };

    //
    media.addEventListener('change', listener);
    listener(media);

    //
    setSchemeProperties(target, theme.schemes.dark, '-dark');
    setSchemeProperties(target, theme.schemes.light, '-light');

    //
    if (options?.paletteTones) {
        const tones = options?.paletteTones ?? [];
        for (const [key, palette] of Object.entries(theme.palettes)) {
            const paletteKey = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
            for (const tone of tones) {
                const token = `--md-ref-palette-${paletteKey}-${paletteKey}${tone}`;
                const color = hexFromArgb((palette as any).tone(tone));
                target.style.setProperty(token, color);
            }
        }
    }
};

//
export const setSchemeProperties = (target, scheme, suffix = '') => {
    for (const [key, value] of Object.entries(scheme.toJSON())) {
        const token = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        const color = hexFromArgb(value as number);
        target.style.setProperty(`--md-sys-color-${token}${suffix}`, color);
    }
};

//
export const reflectSchemeProperties = (target, scheme, suffix) => {
    for (const [key, _] of Object.entries(scheme.toJSON())) {
        const token = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        target.style.setProperty(`--md-sys-color-${token}`, `var(--md-sys-color-${token}-${suffix})`);
    }
};

export { hexFromArgb };