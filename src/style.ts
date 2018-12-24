import { StyleSheet } from 'react-native';

const ORANGE = '#ff5722';
const LIGHT_ORANGE = '#FFCCBC';
const GREEN = '#4caf50';
const GRAY = 'rgba(0,0,0,.54)';
const LIGHT_GRAY = 'rgba(0,0,0,.10)';
const LIGHT_GREEN = '#C8E6C9';
const DARK_GREEN = '#388e3c';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'flex-start',
        position: 'relative',
        // paddingTop: 20,
    },
    newPotButton: {
        backgroundColor: ORANGE,
        elevation: 5,
        position: 'absolute',
        bottom: 16, right: 16,
        alignItems: 'center',
        justifyContent: 'center',
        width: 56, height: 56,
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
        backgroundColor: GREEN,
        flexDirection: 'row',
        justifyContent: 'space-between',
        elevation: 4,
        paddingTop: 20,
        // marginBottom: 16,
        // position: 'relative'
        // zIndex: 1,
        height: 56 + 20,
    },
    h1: {
        color: '#fff',
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
        color: '#fff',
        // backgroundColor: "#000",
    },
    searchBox: {
        color: '#fff',
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
        color: '#fff',
        // backgroundColor: "#000",
    },
    listMessage: {
        alignSelf: 'center',
        color: '#00000099',
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
    lh: { // list header
        // fontWeight: 'bold',
        padding: 16, // +48+12+10, // Not sure where the 10 comes from
        // paddingBottom: 8,
        justifyContent: 'space-between',
        flexDirection: 'row',
        // paddingRight: 16,
    },
    lhText: {
        color: GRAY,
        fontSize: 14,
        fontWeight: '400',
    },
    collapse: {
        fontFamily: 'material-icons',
        fontSize: 20,
        fontWeight: '400',
        color: GRAY,
    },
    listItem: {
        marginBottom: 4,
        marginLeft: 4,
        alignItems: 'baseline',
    },
    liImagePlaceholder: {
        backgroundColor: LIGHT_GREEN,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 56,

    },
    listItemBar: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        position: 'absolute',
        bottom: 0, left: 0,
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
        color: '#fff',
        padding: 12,
        paddingTop: 0,
        paddingBottom: 8,
        justifyContent: 'flex-start',
    },
    old: {
        position: 'absolute',
        top: 12, right: 8,
        color: '#fff',
        fontFamily: 'material-icons',
        fontSize: 16,
    },
    separator: {
        height: 1,
        backgroundColor: LIGHT_GRAY,
    },
    back: {
        fontSize: 36,
        fontWeight: 'bold',
        padding: 10,
        color: 'blue',
        backgroundColor: '#fff',
    },
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
    imagePickerFull: {

    },
    imagePickerSmall: {
        marginLeft: 0,
    },
    imagePickerText: {
        fontFamily: 'material-icons',
        fontSize: 72,
        color: '#CCC',
    },
    imagePickerFullText: {
    },
    imagePickerSmallText: {
    },

    imageBar: {
        flexDirection: 'row',
        // alignContent: 'space-between',
        justifyContent: 'space-between',
        backgroundColor: '#000',
        elevation: 4,
        position: 'absolute',
        top: 20,
        left: 0,
    },
    statusSwitcher: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        backgroundColor: '#fff',
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
        top: 4, left: 8,
        borderRadius: 14,
        backgroundColor: ORANGE,
        elevation: 4,
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
        padding: 16, paddingBottom: 0,
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
        marginLeft: 16,
        paddingTop: 22,
    },
    timelineInner: {
        backgroundColor: LIGHT_ORANGE,
        height: 8, width: 8,
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
    noteModal: {
        width: 280,
        padding: 24,
        backgroundColor: 'white',
        borderRadius: 8,
        elevation: 24,
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
    modalButton: {
        alignSelf: 'flex-end',
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
    },
    bottomBarWithContent: {
        elevation: 8,
    },
    bbb: { // bottom bar button
        padding: 8,
        marginLeft: 8,
    },
    anchor: {
        textDecorationLine: 'underline',
        color: '#0000FF',
    },
});
