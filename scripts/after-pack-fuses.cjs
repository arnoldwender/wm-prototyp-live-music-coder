// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
/**
 * electron-builder afterPack hook: burn Electron security fuses before code
 * signing so the packaged binary cannot be abused as a signed Node REPL
 * (`ELECTRON_RUN_AS_NODE`), inspected via `--inspect`, or pointed at unpacked
 * code outside `app.asar`.
 */

const path = require('node:path')
const { flipFuses, FuseVersion, FuseV1Options } = require('@electron/fuses')

exports.default = async function afterPack(context) {
  const { appOutDir, electronPlatformName, packager } = context
  const productFilename = packager.appInfo.productFilename

  let electronBinaryPath
  if (electronPlatformName === 'darwin') {
    electronBinaryPath = path.join(
      appOutDir,
      `${productFilename}.app`,
      'Contents',
      'MacOS',
      productFilename,
    )
  } else if (electronPlatformName === 'win32') {
    electronBinaryPath = path.join(appOutDir, `${productFilename}.exe`)
  } else {
    electronBinaryPath = path.join(
      appOutDir,
      packager.executableName || productFilename.toLowerCase().replace(/\s+/g, '-'),
    )
  }

  await flipFuses(electronBinaryPath, {
    version: FuseVersion.V1,
    resetAdHocDarwinSignature: electronPlatformName === 'darwin',
    [FuseV1Options.RunAsNode]: false,
    [FuseV1Options.EnableCookieEncryption]: true,
    [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
    [FuseV1Options.EnableNodeCliInspectArguments]: false,
    [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
    [FuseV1Options.OnlyLoadAppFromAsar]: true,
  })
}
