# Development

## Test the extension

1. Run `npm install`, then `npm run watch`
2. Click on one of the TypeScript files
3. Press F5, then select `VSCODE Extension development`

## Publish a new version

Bump the version in `package.json` and merge to `main`. The version must be higher than the one
on the [Marketplace](https://marketplace.visualstudio.com/manage/publishers/jonathan-oralart).

[`publish.yml`](.github/workflows/publish.yml) then publishes it to the Marketplace and
[Open VSX](https://open-vsx.org/extension/jonathan-oralart/json-table-view) and creates a GitHub
release with the `.vsix` attached. It needs no token: it uses a trusted publishing policy on each
registry, which is tied to this repository and that workflow file name. On the Marketplace that is
the Trusted Publishing tab, and on Open VSX it is Settings > Trusted Publishers.

To publish by hand instead, run `npx @vscode/vsce@4 package`, then on the Marketplace manage page
open the `...` menu next to the extension, choose Update, and upload the `.vsix`.

## Install in Cursor

Cursor installs from Open VSX, not the VS Code Marketplace. Search for
"JSON Table View" in its extensions panel.

To install a specific version, download the `.vsix` from the
[releases](https://github.com/jonathan-oralart/json-table-view-linq-pad-style/releases) and run:

```bash
/Applications/Cursor.app/Contents/Resources/app/bin/cursor --install-extension json-table-view-<version>.vsix
```

## Open VSX setup

This is needed once. Open VSX only accepts a trusted publisher for an extension that already
exists in a namespace you own, so the first version goes up by hand.

1. Create an [Eclipse account](https://accounts.eclipse.org/user/register) with the same GitHub username.
2. Log in to [open-vsx.org](https://open-vsx.org) with GitHub, then in Settings > Profile log in with
   Eclipse and sign the Publisher Agreement.
3. Generate a token in [Settings > Access Tokens](https://open-vsx.org/user-settings/tokens), run
   `npx ovsx create-namespace jonathan-oralart -p <token>`, then delete the token.
4. [Claim the namespace](https://github.com/EclipseFdn/open-vsx.org/issues/new?template=claim-namespace-ownership.yml)
   with Option 1 and wait for approval. Open VSX holds an extension that is also on the Marketplace until you own its namespace.
5. Upload the `.vsix` from the [latest release](https://github.com/jonathan-oralart/json-table-view-linq-pad-style/releases/latest)
   with Publish > Publish Extension on open-vsx.org.
6. In [Settings > Trusted Publishers](https://open-vsx.org/user-settings/trusted-publishers), add
   this repository with the workflow file `publish.yml`.
