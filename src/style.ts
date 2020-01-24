import { StyleSheet } from 'react-native';

type Mode = 'light' | 'dark';

const ORANGE = '#ff5722';
const LIGHT_ORANGE = '#FFCCBC';
const GREEN = '#4caf50';
const GRAY = 'rgba(0,0,0,.54)';
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

const lightTextColor = (m: Mode) =>
  ({
    light: '#00000099',
    dark: '#999999',
  }[m]);

const grayTextColor = (m: Mode) =>
  ({
    light: GRAY,
    dark: '#999999',
  }[m]);

const placeholderBackgroundColor = (m: Mode) =>
  ({
    light: LIGHT_GREEN,
    dark: 'rgba(0,51,0,0.5)',
  }[m]);

const listSeparatorColor = (m: Mode) =>
  ({
    light: LIGHT_GRAY,
    dark: DARK_GRAY,
  }[m]);

const base = (mode: Mode) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: backgroundColor(mode),
      justifyContent: 'flex-start',
      position: 'relative',
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
      color: lightTextColor(mode),
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
      color: grayTextColor(mode),
      fontSize: 14,
      fontWeight: '400',
    },
    collapse: {
      fontFamily: 'material-icons',
      fontSize: 20,
      fontWeight: '400',
      color: grayTextColor(mode),
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
    /* Start Here on Dark Mode */
    imagePicker: {
      borderStyle: 'dashed',
      borderWidth: 4,
      borderColor: '#CCC',
      alignItems: 'center',
      flexDirection: 'column',
      backgroundColor: 'white',
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
      color: '#CCC',
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
      color: '#000000de',
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
      borderColor: '#ffffff',
    },
    mainNoteText: {
      fontSize: 14,
      color: '#00000099',
      alignSelf: 'center',
    },
    noteEdit: {
      fontFamily: 'material-icons',
      fontSize: 16,
      color: '#000000de',
      padding: 16,
      marginRight: 4,
      alignSelf: 'center',
    },
    chipOuter: {
      height: 32,
      marginTop: 8,
      borderRadius: 16,
      backgroundColor: '#ebebeb',
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
      color: '#1e1e1e',
      // paddingTop: 8, paddingBottom: 8,
    },
    chipText: {
      color: '#1e1e1e',
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
    },
    statusDetailNote: {
      fontSize: 14,
      color: '#00000099',
    },
    statusDetailDate: {
      // backgroundColor: '#00000022',
      // borderRadius: 12,
      color: '#00000099',
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
      color: '#000000de',
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
    potDescInput: {
      minHeight: 40,
      paddingHorizontal: 15,
      fontSize: 16,
      backgroundColor: '#eee',
    },
    noteBlankText: {
      fontSize: 16,
      color: '#666',
      fontStyle: 'italic',
    },
    settingsText: {
      fontSize: 16,
      textAlign: 'center',
      padding: 20,
    },
    modal: {
      width: 300,
      padding: 24,
      backgroundColor: 'white',
      borderRadius: 4,
    },
    modalHeader: {
      fontSize: 20,
      color: '#000000de',
      fontWeight: '400',
      marginBottom: 20,
    },
    modalInput: {
      fontSize: 16,
      marginBottom: 20,
      color: '#00000099',
    },
    button3: {
      backgroundColor: 'white',
      elevation: 0,
      color: DARK_GREEN,
      fontSize: 14,
    },
    disabledButton: {
      color: GRAY,
    },
    modalButton: {
      alignSelf: 'flex-end',
      marginLeft: 16,
    },
    bgGreen: {
      // backgroundColor: LIGHT_GREEN,
    },
    bottomBar: {
      backgroundColor: '#ffffff',
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
      color: '#0000FF',
    },
  });

export default base('dark');
