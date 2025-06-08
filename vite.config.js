import rollupOptions, {plugins, NAME} from "./rollup/rollup.config";
import {resolve} from "node:path";

//
import cssnano from "cssnano";
import deduplicate from "postcss-discard-duplicates";
import postcssPresetEnv from 'postcss-preset-env';
import autoprefixer from "autoprefixer";

//
export const __dirname = resolve(import.meta.dirname, "./");
export default {
    plugins,
    server: {
        port: 5173,
        open: false,
        origin: "http://localhost:5173",
        fs: {
            allow: ['..', resolve(__dirname, '../') ]
        },
    },
    resolve: {
        alias: {
            "@node_modules": resolve("./node_modules"),
            'u2re/': resolve(__dirname, '/externals/modules/'),
            'u2re-src/': resolve(__dirname, '../'),
            "u2re/cdnImport": resolve(__dirname, '../cdnImport.mjs'),
            "u2re/dom": resolve(__dirname, "../dom.ts/src/index.ts"),
            "u2re/lure": resolve(__dirname, "../BLU.E/src/index.ts"),
            "u2re/object": resolve(__dirname, "../object.ts/src/index.ts"),
            "u2re/uniform": resolve(__dirname, "../uniform.ts/src/index.ts"),
            "u2re/theme": resolve(__dirname, "../theme.core/src/index.ts"),
        },
    },
    build: {
        chunkSizeWarningLimit: 1600,
        assetsInlineLimit: 1024 * 1024,
        minify: "terser",
        sourcemap: 'hidden',
        target: "esnext",
        name: NAME,
        lib: {
            formats: ["es"],
            entry: resolve(__dirname, './src/main/index.ts'),
            name: NAME,
            fileName: NAME,
        },
        rollupOptions
    },
    optimizeDeps: {
        include: [
            "./node_modules/**/*.mjs",
            "./node_modules/**/*.js",
            "./node_modules/**/*.ts",
            "./src/**/*.mjs",
            "./src/**/*.js",
            "./src/**/*.ts",
            "./src/*.mjs",
            "./src/*.js",
            "./src/*.ts",
            "./test/*.mjs",
            "./test/*.js",
            "./test/*.ts"
        ],
        entries: [resolve(__dirname, './src/index.ts'),],
        force: true
    },
    css: {
        postcss: {
            plugins: [autoprefixer(), deduplicate(), cssnano({
                preset: ['advanced', {
                    calc: false,
                    layer: false,
                    scope: false,
                    discardComments: {
                        removeAll: true
                    }
                }],
            }), postcssPresetEnv({ stage: 0 })],
        },
    },
};
