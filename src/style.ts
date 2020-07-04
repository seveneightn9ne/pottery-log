import { StyleSheet } from 'react-native';

type Mode = 'light' | 'dark';

const ORANGE = '#ff5722';
const LIGHT_ORANGE = '#FFCCBC';
const GREEN = '#4caf50';
/*const GRAY = 'rgba(0,0,0,.54)';*/
const LIGHT_GRAY = 'rgba(0,0,0,.10)';
const DARK_GRAY = 'rgba(0,0,0,0.8)';
const LIGHT_GREEN = '#C8E6C9';
const GREEN_200 = '#c6f68d';
const DARK_GREEN = '#388e3c';

const backgroundColor = (m: Mode) =>
  ({
    light: '#fff',
    dark: '#121212',
  }[m]);

const elevatedBackgroundColor = (m: Mode) =>
  ({
    light: '#fff',
    dark: '#272727',
  }[m]);

const headerColor = (m: Mode) =>
  ({
    light: GREEN,
    dark: '#222222',
  }[m]);

const headerTextColor = (m: Mode) =>
  ({
    light: '#fff',
    dark: '#e1e1e1',
  }[m]);

// 60% opacity
const gray60 = (m: Mode) =>
  ({
    light: 'rgba(0,0,0,0.6)',
    dark: 'rgba(255,255,255,0.6)',
  }[m]);

// 20%
const gray20 = (m: Mode) =>
  ({
    light: 'rgba(0,0,0,0.2)',
    dark: 'rgba(255,255,255,0.4)',
  }[m]);

// 90 %
const gray90 = (m: Mode) =>
  ({
    light: 'rgba(0,0,0,0.9)',
    dark: 'rgba(255,255,255,0.9)',
  }[m]);

const gray10 = (m: Mode) =>
  ({
    light: 'rgba(0,0,0,0.1)',
    dark: 'rgba(255,255,255,0.1)',
  }[m]);
const placeholderBackgroundColor = (m: Mode) =>
  ({
    light: LIGHT_GREEN,
    dark: gray10(m),
  }[m]);

const listSeparatorColor = (m: Mode) =>
  ({
    light: LIGHT_GRAY,
    dark: DARK_GRAY,
  }[m]);

const linkColor = (m: Mode) =>
  ({
    light: '#0000FF',
    dark: '#4f9cff',
  }[m]);

const secondaryButtonTextColor = (m: Mode) =>
  ({
    light: DARK_GREEN,
    dark: GREEN_200,
  }[m]);

export const radioColor = secondaryButtonTextColor;
export const statusBarColor = headerColor;

const base = (mode: Mode) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: backgroundColor(mode),
      justifyContent: 'flex-start',
      position: 'relative',
      color: gray90(mode),
      // paddingTop: 20,
    },
    imagePage: {
      justifyContent: 'center',
      backgroundColor: '#000',
    },
    newPotWrapper: {
      position: 'absolute',
      bottom: 16,
      right: 16,
      width: 56,
      height: 56,
    },
    newPotButton: {
      backgroundColor: ORANGE,
      alignItems: 'center',
      justifyContent: 'center',
      width: 56,
      height: 56,
      borderRadius: 28,
    },
    newPotButtonText: {
      fontFamily: 'material-icons',
      fontSize: 24,
      color: '#fff',
    },
    size50: {
      width: 50,
      height: 50,
    },
    header: {
      // flex: 1,
      // position: 'relative',
      backgroundColor: headerColor(mode),
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 20,
      // marginBottom: 16,
      // position: 'relative'
      // zIndex: 1,
      height: 56 + 20,
    },
    h1: {
      color: headerTextColor(mode),
      fontSize: 20,
      fontWeight: '400',
      padding: 16,
      paddingBottom: 0,
    },
    search: {
      fontFamily: 'material-icons',
      fontSize: 24,
      padding: 16,
      paddingBottom: 0,
      marginTop: 2,
      color: headerTextColor(mode),
      // backgroundColor: "#000",
    },
    searchBox: {
      color: headerTextColor(mode),
      fontSize: 20,
      fontWeight: '400',
      padding: 16,
      flex: 1,
    },
    searchBack: {
      fontFamily: 'material-icons',
      fontSize: 24,
      // padding: 20,
      paddingLeft: 16,
      paddingTop: 16,
      color: headerTextColor(mode),
    },
    listMessage: {
      alignSelf: 'center',
      color: gray60(mode),
      textAlign: 'center',
      paddingTop: 72,
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
      padding: 10,
    },
    sectionList: {
      /*flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',*/
      paddingTop: 16,
      justifyContent: 'space-between', // todo do i need ths
    },
    lh: {
      // list header
      // fontWeight: 'bold',
      padding: 16, // +48+12+10, // Not sure where the 10 comes from
      // paddingBottom: 8,
      justifyContent: 'space-between',
      flexDirection: 'row',
      // paddingRight: 16,
    },
    lhText: {
      color: gray60(mode),
      fontSize: 14,
      fontWeight: '400',
    },
    collapse: {
      fontFamily: 'material-icons',
      fontSize: 20,
      fontWeight: '400',
      color: gray60(mode),
    },
    listItem: {
      marginBottom: 4,
      marginLeft: 4,
      alignItems: 'baseline',
    },
    liImagePlaceholder: {
      backgroundColor: placeholderBackgroundColor(mode),
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 56,
    },
    listItemBar: {
      backgroundColor: 'rgba(0,0,0,0.5)',
      position: 'absolute',
      bottom: 0,
      left: 0,
      flex: 1,
    },
    lititle: {
      fontSize: 16,
      padding: 12,
      paddingTop: 8,
      paddingBottom: 0,
      color: '#fff',
      fontWeight: '400',
    },
    lisubtitle: {
      fontSize: 13,
      color: '#cccccc',
      padding: 12,
      paddingTop: 0,
      paddingBottom: 8,
      justifyContent: 'flex-start',
    },
    old: {
      position: 'absolute',
      top: 12,
      right: 8,
      color: '#fff',
      fontFamily: 'material-icons',
      fontSize: 16,
    },
    separator: {
      height: 1,
      backgroundColor: listSeparatorColor(mode),
    },
    imagePicker: {
      borderStyle: 'dashed',
      borderWidth: 4,
      borderColor: gray20(mode),
      alignItems: 'center',
      flexDirection: 'column',
      backgroundColor: backgroundColor(mode),
      // The borderRadius thing is a react-native bug with the dashed border
      borderRadius: 1,
      justifyContent: 'center',
    },
    imagePickerFull: {},
    imagePickerSmall: {
      marginLeft: 0,
    },
    imagePickerText: {
      fontFamily: 'material-icons',
      fontSize: 72,
      color: gray20(mode),
    },
    imagePickerFullText: {},
    imagePickerSmallText: {},

    imageBar: {
      flexDirection: 'row',
      // alignContent: 'space-between',
      justifyContent: 'space-between',
      backgroundColor: '#000',
      position: 'absolute',
      top: 20,
      left: 0,
    },
    statusSwitcher: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      // backgroundColor: '#fff',
      paddingRight: 16,
      height: 28 * 2 - 8,
    },
    addMainNote: {
      color: gray90(mode),
      fontFamily: 'material-icons',
      fontSize: 24,
      marginLeft: 16,
      marginTop: 8,
    },
    statusArrows: {
      position: 'absolute',
      top: 4,
      left: 8,
      borderRadius: 14,
      backgroundColor: ORANGE,
      height: 2 * 28,
    },
    statusArrow: {},
    statusArrowText: {
      // borderRadius: 14,
      fontSize: 28,
      // color: "#000000de",
      color: '#fff',
      fontFamily: 'material-icons',
    },
    mainStatus: {
      fontSize: 20,
      fontWeight: '400',
      // paddingTop: 12,
      paddingLeft: 16 + 28 + 8,
      marginTop: 8,
      // paddingBottom: 1,
      flex: 1,
      color: gray90(mode),
    },
    mainNote: {
      padding: 4,
      marginLeft: 16,
      paddingLeft: 24,
      marginTop: -12,
      borderLeftWidth: 12,
      borderColor: ORANGE,
      zIndex: -1,
    },
    mainNoteNoBar: {
      borderColor: backgroundColor(mode),
    },
    mainNoteText: {
      fontSize: 14,
      color: gray60(mode),
      alignSelf: 'center',
    },
    noteEdit: {
      fontFamily: 'material-icons',
      fontSize: 16,
      color: gray90(mode),
      padding: 16,
      marginRight: 4,
      alignSelf: 'center',
    },
    chipOuter: {
      height: 32,
      marginTop: 8,
      borderRadius: 16,
      backgroundColor: gray10(mode),
    },
    chipInner: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    chipArrow: {
      padding: 8,
    },
    chipArrowText: {
      fontFamily: 'material-icons',
      fontSize: 16,
      fontWeight: '400',
      color: gray90(mode),
      // paddingTop: 8, paddingBottom: 8,
    },
    chipText: {
      color: gray90(mode),
      fontSize: 14,
    },
    statusDetail: {
      // 	backgroundColor: '#00000010',
      // backgroundColor: LIGHT_GREEN,
    },
    detailPadding: {
      // backgroundColor: '#00000010',
      // backgroundColor: LIGHT_GREEN,
      height: 16,
    },
    statusDetailInner: {
      padding: 16,
      paddingBottom: 0,
      flex: 1,
    },
    status: {
      fontWeight: '400',
      fontSize: 16,
      alignSelf: 'baseline',
      color: gray90(mode),
    },
    statusDetailNote: {
      fontSize: 14,
      color: gray60(mode),
    },
    statusDetailDate: {
      // backgroundColor: '#00000022',
      // borderRadius: 12,
      color: gray60(mode),
      fontSize: 16,
      paddingLeft: 2,
      // paddingBottom: 1,
      // padding: 1,
      // paddingLeft: 4, paddingRight: 4,
      // marginLeft: 8,
      fontWeight: '300',
      // alignSelf: 'baseline',
    },
    editDetail: {
      fontSize: 16,
      color: gray90(mode),
      padding: 16,
      marginRight: 4,
      alignSelf: 'center',
    },
    timeline: {
      backgroundColor: ORANGE,
      zIndex: -1,
      marginLeft: 16,
      paddingTop: 22,
    },
    timelineInner: {
      backgroundColor: LIGHT_ORANGE,
      height: 8,
      width: 8,
      borderRadius: 4,
      margin: 2,
    },
    timelineFirst: {
      /*marginTop: 20,
        paddingTop: 0,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,*/
    },
    timelineLast: {
      borderBottomLeftRadius: 6,
      borderBottomRightRadius: 6,
    },
    timelineLastOnly: {
      height: 34,
    },
    timelineOnly: {
      // height: 12,
      height: 34,
    },
    settingsText: {
      fontSize: 16,
      color: gray90(mode),
      paddingBottom: 20,
      lineHeight: 24,
    },
    settingsItem: {
      borderColor: gray10(mode),
      borderBottomWidth: 1,
      padding: 16,
    },
    settingsItemTitle: {
      color: gray90(mode),
      fontSize: 18,
      lineHeight: 28,
    },
    settingsItemDescription: {
      color: gray60(mode),
      fontSize: 14,
      lineHeight: 20,
    },
    modalBackground: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalTouchable: {
      width: 300,
    },
    modal: {
      width: 300,
      padding: 24,
      backgroundColor: elevatedBackgroundColor(mode),
      borderRadius: 4,
    },
    modalHeader: {
      fontSize: 20,
      color: gray60(mode),
      fontWeight: '400',
      marginBottom: 20,
    },
    modalInput: {
      fontSize: 16,
      marginBottom: 20,
      color: gray90(mode),
    },
    modalButtonBox: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    button3: {
      backgroundColor: backgroundColor(mode),
      elevation: 0,
      color: secondaryButtonTextColor(mode),
      fontSize: 14,
      fontVariant: ['small-caps'],
      fontWeight: 'bold',
    },
    disabledButton: {
      color: gray60(mode),
    },
    modalButton: {
      alignSelf: 'flex-end',
      marginLeft: 16,
      backgroundColor: elevatedBackgroundColor(mode),
      textTransform: 'uppercase',
    },
    bottomBar: {
      backgroundColor: backgroundColor(mode),
      flexDirection: 'row',
      justifyContent: 'flex-end',
      padding: 4,
      paddingRight: 8,
      paddingBottom: 12,
    },
    bbb: {
      // bottom bar button
      padding: 8,
      marginLeft: 8,
    },
    anchor: {
      textDecorationLine: 'underline',
      color: linkColor(mode),
    },
  });

const darkStyle = base('dark');
const lightStyle = base('light');

export function setStyle(mode: 'light' | 'dark') {
  if (exp.currentStyle === mode) {
    return;
  }
  exp.currentStyle = mode;
  exp.s = mode === 'light' ? lightStyle : darkStyle;
}

const exp = {
  s: lightStyle,
  // Note: default to light
  currentStyle: 'light',
};

export default exp;
