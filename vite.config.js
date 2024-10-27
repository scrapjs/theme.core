import rollupOptions, {plugins, NAME} from "./rollup/rollup.config";
import {resolve} from "node:path";

//
export const __dirname = resolve(import.meta.dirname, "./");
export default {
    plugins,
    server: {
        port: 5173,
        open: false,
        origin: "http://localhost:5173",
    },
    resolve: {
        alias: {
            "@node_modules": resolve("./node_modules"),
            "@culori": resolve("./node_modules/culori"),
            "@material": resolve("./node_modules/@material")
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
    }
};
