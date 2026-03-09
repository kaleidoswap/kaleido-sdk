#!/usr/bin/env node
/**
 * generate_typescript_types.mjs
 *
 * Generates TypeScript types from OpenAPI specs using the programmatic
 * openapi-typescript API, so we can apply a custom transform that maps
 * fields declared with `format: int64` to TypeScript's `bigint` type
 * instead of the default (and unsafe) `number`.
 *
 * Background: JavaScript `number` is a 64-bit IEEE 754 float, which can only
 * safely represent integers up to 2^53-1 (~9 quadrillion). RGB asset amounts
 * and prices are u64/i64 values whose max (2^64-1 / 2^63-1) far exceeds that
 * limit, so silent precision loss would occur without this transform.
 *
 * Usage (called by package.json "generate:types" script):
 *   node scripts/generate_typescript_types.mjs
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import ts from 'typescript';
import openapiTS, { astToString } from 'openapi-typescript';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Script lives at typescript-sdk/scripts/ — go up two levels to reach the repo root
const TS_SDK_DIR = path.resolve(__dirname, '..');
const ROOT_DIR = path.resolve(TS_SDK_DIR, '..');
const SPECS_DIR = path.join(ROOT_DIR, 'specs');
const OUTPUT_DIR = path.join(TS_SDK_DIR, 'src', 'generated');

// ---------------------------------------------------------------------------
// Transform: map `format: int64` → bigint
// ---------------------------------------------------------------------------

/**
 * openapi-typescript `transform` hook.
 * Called once per schema object encountered during AST generation.
 * Returning a TypeScript AST node overrides the default type for that schema.
 *
 * @param {import("openapi-typescript").SchemaObject} schemaObject
 * @returns {ts.TypeNode | undefined}
 */
function transformInt64ToBigint(schemaObject) {
    if (schemaObject.format === 'int64') {
        return ts.factory.createKeywordTypeNode(ts.SyntaxKind.BigIntKeyword);
    }
    // undefined → fall through to openapi-typescript's default handling
}

// ---------------------------------------------------------------------------
// File banner
// ---------------------------------------------------------------------------

const FILE_BANNER = `/**
 * AUTO-GENERATED FILE — DO NOT EDIT MANUALLY.
 *
 * Re-generate with:
 *   pnpm generate:types
 *   (or: node scripts/generate_typescript_types.mjs)
 *
 * Fields annotated with \`Format: int64\` in the OpenAPI spec are typed as
 * \`bigint\` (not \`number\`) to preserve full u64/i64 precision. JavaScript's
 * \`number\` type can only safely represent integers up to 2^53-1, whereas
 * RGB asset amounts and prices can reach 2^64-1.
 */

`;

// ---------------------------------------------------------------------------
// Generation targets
// ---------------------------------------------------------------------------

const TARGETS = [
    {
        label: 'kaleidoswap.json → api-types.ts',
        input: path.join(SPECS_DIR, 'kaleidoswap.json'),
        output: path.join(OUTPUT_DIR, 'api-types.ts'),
    },
    {
        label: 'rgb-lightning-node.yaml → node-types.ts',
        input: path.join(SPECS_DIR, 'rgb-lightning-node.yaml'),
        output: path.join(OUTPUT_DIR, 'node-types.ts'),
    },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Load a spec file as a URL (required by openapi-typescript programmatic API).
 * @param {string} filePath
 * @returns {URL}
 */
function specUrl(filePath) {
    return new URL(`file://${filePath}`);
}

/**
 * Attempt to format the generated source with prettier if available.
 * Silently skips formatting if prettier is not installed.
 *
 * @param {string} source
 * @param {string} filepath - used by prettier to infer parser
 * @returns {Promise<string>}
 */
async function tryPrettierFormat(source, filepath) {
    try {
        const prettier = await import('prettier');
        const config = await prettier.default.resolveConfig(filepath);
        return prettier.default.format(source, {
            parser: 'typescript',
            ...config,
        });
    } catch {
        // prettier not available or failed — return source as-is
        return source;
    }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
    console.log('🔧 Generating TypeScript types from OpenAPI specs...');
    console.log('   (fields with format: int64 will be typed as bigint)\n');

    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    for (const { label, input, output } of TARGETS) {
        console.log(`  → Generating from ${label}...`);

        let ast;
        try {
            ast = await openapiTS(specUrl(input), {
                transform: transformInt64ToBigint,
                // Emit `export type` instead of `export interface` for consistency
                exportType: true,
            });
        } catch (err) {
            console.error(`\n❌ Failed to parse spec: ${input}`);
            console.error(err.message ?? err);
            process.exit(1);
        }

        const rawSource = FILE_BANNER + astToString(ast);
        const formattedSource = await tryPrettierFormat(rawSource, output);

        await fs.writeFile(output, formattedSource, 'utf-8');
        console.log(`     ✔ Written to ${path.relative(ROOT_DIR, output)}`);
    }

    console.log('\n✅ TypeScript types generated successfully.');
    console.log('   Remember: use BigInt literals (e.g. 1000n) when working with int64 fields.\n');
}

main().catch((err) => {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
});
