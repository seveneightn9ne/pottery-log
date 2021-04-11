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
 - select `archive` option
 - If you get errors related to duplicate certificates, go delete all [iOS Certificates](https://developer.apple.com/account/ios/certificate/) and [iOS Provisioning Profiles](https://developer.apple.com/account/ios/profile/) and try again, maybe with `-c`

3. Download the build `ipa` file
4. Launch `Transporter`
5. Drag & drop your `ipa` file
6. Hit `Deliver`
7. Ignore any email from Apple about Missing Push Notification Entitlement
8. Wait for the "completed processing" email
9. From [App Store Connect](https://appstoreconnect.apple.com/), go to My Apps -> Pottery Log -> +Version or Platform
10. Set App Version to the value in `expo.ios.buildNumber` e.g. `1.0.5`
11. Fill in the description, Add the new build, Answer "No" to encryption question, Save, Submit for review

## How to update the Google Play Store app

1. increment `expo.version` and `expo.android.versionCode`
2. `./expo-cli build:android`
3. choose the `apk` option
3. Download the built `apk` file
4. Go to [Play Developer Console > Release Management > App Releases > Production](https://play.google.com/apps/publish/?account=7386843897399770359#ManageReleaseTrackPlace:p=com.jesskenney.pottery_log&appid=4975800948334149640&releaseTrackId=4699032239426232860)
> Note: If you want to release to just yourself for testing, use the Internal Testing release track instead of Production.
5. Create Release > Upload the file
6. Scroll to the bottom, update the text for what's new
7. Confirm > Verify any warnings > Start Rollout to Production

## Switching to Android App Bundle + Google Play App Signing

there is an expo tool, `opt-in-google-play-signing`, but it failed to install a npm package and so I couldn't use it.
