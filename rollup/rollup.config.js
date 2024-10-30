

import {resolve} from "node:path";
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { compression } from 'vite-plugin-compression2';
import optimizer from 'vite-plugin-optimizer';
import createExternal from "vite-plugin-external";

//
export const NAME = "theme";
export const __dirname = resolve(import.meta.dirname, "../");
export const terserOptions = {
    ecma: 2020,
    keep_classnames: false,
    keep_fnames: false,
    module: true,
    toplevel: true,
    mangle: {
        eval: true,
        keep_classnames: false,
        keep_fnames: false,
        module: true,
        toplevel: true,
        properties: {
            builtins: true,
            keep_quoted: "strict",
            undeclared: true,
            only_annotated: true,
            reserved: ["register", "resolve", "reject", "undefined"]
        }
    },
    compress: {
        ecma: 2020,
        keep_classnames: false,
        keep_fnames: false,
        keep_infinity: false,
        reduce_vars: true,
        reduce_funcs: true,
        pure_funcs: [],
        arguments: true,
        expression: true,
        inline: 3,
        module: true,
        passes: 3,
        side_effects: true,
        pure_getters: true,
        typeofs: true,
        toplevel: true,
        unsafe: true,
        unsafe_Function: true,
        unsafe_comps: true,
        unsafe_arrows: true,
        unsafe_math: true,
        unsafe_symbols: true,
        unsafe_undefined: true,
        unsafe_methods: true,
        unsafe_regexp: true,
        unsafe_proto: true,
        warnings: true,
        unused: true,
        booleans_as_integers: true,
        hoist_funs: true,
        hoist_vars: true,
        properties: true,
        // don't use in debug mode
        drop_console: true
    },
    format: {
        braces: false,
        comments: false,
        ecma: 2020,
        //indent_level: 0,
        semicolons: true,
        shebang: true,
        inline_script: true,
        quote_style: 0,
        wrap_iife: true,
        ascii_only: true,
    }
};

//
export const TSConfig = {
    "compilerOptions": {
        "target": "ESNext",
        "module": "ESNext",
        "lib": ["ESNext", "DOM", "WebWorker"],
        "esModuleInterop": true,
        "strict": true,
        "forceConsistentCasingInFileNames": true,
        "allowJs": true,
        "allowArbitraryExtensions": true,
        "allowSyntheticDefaultImports": true,
        "allowUmdGlobalAccess": true,
        "allowUnreachableCode": true,
        "allowUnusedLabels": true,
        "noImplicitAny": false,
        "declaration": true,
        "noImplicitThis": false,
        "inlineSources": true,
        "inlineSourceMap": true,
        "sourceMap": false,
        "outDir": "./dist/",
        "declarationDir": "./dist/"+NAME+".d.ts/",
        //"allowImportingTsExtensions": true,
        //"emitDeclarationOnly": true,
        "typeRoots": ["plugins/global.d.ts"]
    }
};

//
export const plugins = [
    typescript(TSConfig),
    terser(terserOptions),
    optimizer({}),
    compression(),
    createExternal({
        interop: 'auto',
        externals: {externals: "externals", dist: "dist"},
        externalizeDeps: [
            "externals", "/externals", "./externals",
            "dist", "/dist", "./dist"
        ]
    }),
];

//
export const rollupOptions = {
    plugins,
    treeshake: 'smallest',
    external: [
        "externals", "/externals", "./externals",
        "dist", "/dist", "./dist"
    ],
    input: "./src/index.ts",
    output: {
        minifyInternalExports: true,
        compact: true,
        globals: {},
		format: 'es',
		name: NAME,
        dir: './dist',
        sourcemap: 'hidden',
        exports: "auto",
        esModuleInterop: true,
        experimentalMinChunkSize: 500_500,
        inlineDynamicImports: true,
	}
};

export default rollupOptions;
