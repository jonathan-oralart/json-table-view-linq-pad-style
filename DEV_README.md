To update the PAT token
1. go here: https://dev.azure.com/jonathan0753/_usersSettings/tokens
2. Change the access scope to "All accessible organizations"

To publish a new version of the extension
1. Update the version in the package.json file
2. Run `vsce publish`

To test the extension
1. Run `npm run watch`
2. click on one of the typescript files
3. press F5 then select `VSCODE Extension development`