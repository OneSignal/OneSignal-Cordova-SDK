# Setup

Link the root package e.g. `bun link`
First install the packages e.g. `bun i`

You may need to relink package incase the root has new changes.
So just run `bun link` again.

## Android

For Android, make sure to use Java 17 as other versions may be incompatible. E.g.

```
brew install openjdk@17
```

Make sure Android SDK tools are properly installed. Check if adb is present.

```
adb --version
```

Then run `ionic capacitor run android` and select the device to run on. This should open the emulator either standalone or in the Android Studio window.

## iOS

For iOS, you can run `ionic capacitor run ios`.

If you are using xcode, run `ionic capacitor sync ios`.

## Testing

**IMPORTANT**: For Android, the example app may open up but not be recognized as being in the foreground. So swipe up in the emulator then reopen the app.
Then should see some dialogs appear which you close out.
