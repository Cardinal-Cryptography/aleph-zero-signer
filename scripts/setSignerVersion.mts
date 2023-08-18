import { readFile, writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import assert from 'node:assert';

const VERSION_PARAM_NAME = 'version'
const EXTENSION_PACKAGE_JSON_PATH = './packages/extension/package.json';

const { values: { [VERSION_PARAM_NAME]: version = '' }} = parseArgs({
  options: {
    [VERSION_PARAM_NAME]: {
      type: 'string',
    }
  }
})

assert(/^\d+\.\d+\.\d+(-alpha\.\d+)?$/.test(version), `The "${VERSION_PARAM_NAME}" argument: "${version}" does not match the "x.x.x" (optionally "x.x.x-alpha.x") format.`)

const currentPackageJsonContent = await readFile(EXTENSION_PACKAGE_JSON_PATH, 'utf8')

const newPackageJsonContent = {
  ...JSON.parse(currentPackageJsonContent),
  version: version,
};

await writeFile(EXTENSION_PACKAGE_JSON_PATH, JSON.stringify(newPackageJsonContent, undefined, 2))

console.log(`Version changed to ${newPackageJsonContent.version}`)
