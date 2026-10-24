import { build } from "esbuild";

await build({
    entryPoints: ["workers/index.ts"], // the file your "workers" script runs
    outfile: "dist/worker.mjs",
    bundle: true,
    platform: "node",
    target: "node24",
    format: "esm",
    external: ["pg-native", "msgpackr-extract"],
    // Lets bundled CommonJS packages use require() inside an ES module
    banner: {
        js: [
            "import { createRequire as __createRequire } from 'module';",
            "import { fileURLToPath as __fileURLToPath } from 'url';",
            "import { dirname as __pathDirname } from 'path';",
            "const require = __createRequire(import.meta.url);",
            "const __filename = __fileURLToPath(import.meta.url);",
            "const __dirname = __pathDirname(__filename);",
        ].join("\n"),
    },
    // Optional native add-on that pg tries to load; skip it
    external: ["pg-native"],
});