# Pottery Log

Log your pottery.

## Development

```
yarn # install node dependencies
yarn start # the expo dev server
```

## How to update the iOS App Store app

[App Store link](https://apps.apple.com/us/app/pottery-log/id1457629627)

1. increment the `expo.version` and `expo.ios.buildNumber` in `app.json`
2. `./expo-cli build:ios`

- If you get errors related to duplicate certificates, go delete all [iOS Certificates](https://developer.apple.com/account/ios/certificate/) and [iOS Provisioning Profiles](https://developer.apple.com/account/ios/profile/) and try again, maybe with `-c`

3. Download the build `ipa` file
4. Launch `Xcode`
5. Go to XCode -> Open Developer Tool -> Application Loader
6. Press the big button
7. Select your `ipa` file
8. Click through until it tells you you're done
9. Ignore any email from Apple about Missing Push Notification Entitlement
10. Wait for the "completed processing" email
11. Go to My Apps -> Pottery Log -> +Version or Platform
12. Set App Version to the value in `expo.ios.buildNumber` e.g. `1.0.5`
13. Fill in the description, Add the new build, Save, Submit for review
14. Answer "No" to encryption question
15. Answer "Yes" to IDFA question - check the two "Attribute" boxes ([details](https://docs.expo.io/versions/latest/distribution/app-stores/#ios-specific-guidelines)}
