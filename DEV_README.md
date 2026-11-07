# Development

## Test the extension

1. Run `npm install`, then `npm run watch`
2. Click on one of the TypeScript files
3. Press F5, then select `VSCODE Extension development`

## Publish a new version

Bump the version in `package.json` and merge to `main`. The version must be higher than the one
on the [Marketplace](https://marketplace.visualstudio.com/manage/publishers/jonathan-oralart).

[`publish.yml`](.github/workflows/publish.yml) then publishes it and creates a GitHub release with
the `.vsix` attached. It needs no token: it uses the trusted publishing policy on the Marketplace's
Trusted Publishing tab, which is tied to this repository and that workflow file name.

To publish by hand instead, run `npx @vscode/vsce@4 package`, then on the Marketplace manage page
open the `...` menu next to the extension, choose Update, and upload the `.vsix`.

## Install in Cursor

Cursor installs from Open VSX, not the VS Code Marketplace, and this extension is
not published there. Download the `.vsix` from the
[latest release](https://github.com/jonathan-oralart/json-table-view-linq-pad-style/releases/latest)
and install it:

```bash
/Applications/Cursor.app/Contents/Resources/app/bin/cursor --install-extension json-table-view-<version>.vsix
```

Publishing to Open VSX would need an Eclipse account, the signed publisher agreement
on open-vsx.org, and an access token, then
`npx ovsx create-namespace jonathan-oralart -p <token>` once and
`npx ovsx publish <file>.vsix -p <token>`.
