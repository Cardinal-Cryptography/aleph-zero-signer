import { parseArgs } from 'node:util'
import assert from 'node:assert';
import replace from 'replace-in-file'

const VERSION_PARAM_NAME = 'version'

const { values: { [VERSION_PARAM_NAME]: version = '' }} = parseArgs({
  options: {
    version: {
      type: 'string',
    }
  }
})

assert(/\d\.\d\.\d/.test(version), `The "${VERSION_PARAM_NAME}" argument: "${version}" does not match the "x.x.x" format.`)

const replacementResult = await replace.replaceInFile({
  files: 'packages/extension/build/**',
  from: /{{signer-version}}/g,
  to: version,
  countMatches: true,
})

const replacements = replacementResult.filter(({ hasChanged }) => hasChanged).map(({ hasChanged, ...rest }) => rest)

console.log(JSON.stringify(replacements, undefined, 2))
