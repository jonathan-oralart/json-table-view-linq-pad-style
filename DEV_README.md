# Development

## Test the extension

1. Run `npm install`, then `npm run watch`
2. Click on one of the TypeScript files
3. Press F5, then select `VSCODE Extension development`

## Publish a new version

Always publish from a clean, pushed checkout, so what ships is what is in git.

1. Update the version in `package.json`. It must be higher than the version on the
   [Marketplace](https://marketplace.visualstudio.com/manage/publishers/jonathan-oralart).
2. Build the package: `npx @vscode/vsce package`
3. Publish it, either way:
   - Upload: on the Marketplace manage page, open the `...` menu next to the
     extension, choose Update, and upload the `.vsix`. No token needed.
   - CLI: `npx @vscode/vsce publish` (needs a PAT)

To create or update the PAT:

1. Go to https://dev.azure.com/jonathan0753/_usersSettings/tokens
2. Change the access scope to "All accessible organizations"

## Install in Cursor

Cursor installs from Open VSX, not the VS Code Marketplace, and this extension is
not published there. Install the packaged file instead:

```bash
/Applications/Cursor.app/Contents/Resources/app/bin/cursor --install-extension json-table-view-<version>.vsix
```

Publishing to Open VSX would need an Eclipse account, the signed publisher agreement
on open-vsx.org, and an access token, then
`npx ovsx create-namespace jonathan-oralart -p <token>` once and
`npx ovsx publish <file>.vsix -p <token>`.
