# Pottery Log
Log your pottery.

## Development

```
yarn # install node dependencies
yarn start # the expo dev server
```

## PATCH FOR FETCH

This is needed until probably Expo SDK 33, but we should check that the fix is included when upgrading.

in `node_modules/react-native/Libraries/vendor/core/whatwg-fetch.js`
apply this patch: https://github.com/facebook/react-native/pull/22063/files

Make sure to apply the patch before publishing.

## How to update the iOS App Store app

1. increment the `expo.version` and `expo.ios.buildNumber` in `app.json`
2. `./expo-cli build:ios`

  - If you get errors related to duplicate certificates, go delete all [iOS Certificates](https://developer.apple.com/account/ios/certificate/) and [iOS Provisioning Profiles](https://developer.apple.com/account/ios/profile/) and try again, maybe with `-c`

3. Download the build `ipa` file
4. Launch `Xcode`
5. Go to XCode -> Open Developer Tool -> Application Loader
6. Press the big button
7. Select your `ipa` file
8. Click through until it tells you you're done
9. TODO - do we need to do anything to publish it?