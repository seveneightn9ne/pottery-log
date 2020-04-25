import { Appearance, ColorSchemeName } from 'react-native-appearance';

let defaultScheme = defaultColorScheme(Appearance.getColorScheme());

function defaultColorScheme(colorScheme: ColorSchemeName): 'light' | 'dark' {
    // Note: default to light
    return colorScheme === 'no-preference' ? 'light' : colorScheme;
}

Appearance.addChangeListener(({ colorScheme }: {colorScheme: ColorSchemeName}) => {
    defaultScheme = defaultColorScheme(colorScheme);
});

export function getDerivedDarkMode(setting: boolean | undefined): 'dark' | 'light' {
    if (setting === undefined) {
        return defaultScheme;
    }
    return setting ? 'dark' : 'light';
}

export function getSystemPreference(): ColorSchemeName {
    return Appearance.getColorScheme();
}
