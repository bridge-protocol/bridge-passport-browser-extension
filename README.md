<p align="center">
  <img
    src="https://storage.googleapis.com/bridge-assets/Bridge_Logo_Black.png"
    width="125px;">
</p>
<h3 align="center">Bridge Passport Browser Extension</h3>

<img src="https://github.com/bridge-protocol/bridge-passport-browser-extension/blob/master/images/bridge_passport.jpg" width="100%;">

# Summary
The Bridge Passport Browser Extension enables end users to easily create and manage their Bridge Passport on the Bridge Protocol Network.

# User Guide and Feature Documentation
[Bridge Passport Browser Extension v2.0 User Guide and Feature Overview - Google Docs.pdf](https://github.com/bridge-protocol/bridge-passport-browser-extension/blob/master/docs/Bridge%20Passport%20Browser%20Extension%20v2.0%20User%20Guide%20and%20Feature%20Overview%20-%20Google%20Docs.pdf)


# Installation
- "npm i && npx webpack" (you can also use "npm run watch:dev")

# Browser Installation
### Chrome and Chromium Based Browsers (Opera, Brave, etc)
- Go to tools menu -> More Tools -> Extensions
- Enable Developer Mode (toggle switch upper right)
- Load Unpacked Extension
- Select /dist folder
  
### Firefox
- Tools menu -> Add-ons
- Select the gear icon -> Debug addons
- Load Temporary Add-on
- Select /dist manifest.json

# Additional Notes for Developers
Due to Google Chrome Web Store publishing policies, any site that interacts with the Bridge Passport Extension needs to be explicitly listed in the manifest under content_scripts -> matches.  While testing, you will need to add your local or published site URL to the list for the page to be able to interact with the extension for requesting auth and claims, requesting payments, etc.

`
"content_scripts": [
    {
      "matches": [
        "https://bridgeprotocol.azurewebsites.net/*",
        "http://localhost/*"
      ]
...
`
