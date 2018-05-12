import { StyleSheet } from 'react-native';

const ORANGE = "#ff5722";
const LIME = "#cddc39";
const GREEN = "#4caf50";
const BLACK = "rgba(0,0,0,.87)";
const GRAY = "rgba(0,0,0,.54)";
const LIGHT_GRAY = "rgba(0,0,0,.10)";
const LIGHT_GREEN = "#C8E6C9";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    position: 'relative',
    //paddingTop: 20,
  },
  newPotButton: {
    backgroundColor: ORANGE,
    elevation: 5,
    position: 'absolute',
    //top: 60, left: 16,
    bottom: 16, right: 16,
    alignItems: 'center',
    justifyContent: 'center',
    //width:48,height:48,
    //borderRadius: 24,
    //width:36,height:36,
    //borderRadius: 18,
    width: 56, height: 56,
    borderRadius: 28,
  },
  newPotButtonText: {
    fontFamily: 'material-icons',
    fontSize: 24,
    color: "#fff",
  },
  size50: {
  	width: 50,
  	height: 50,
  },
  header: {
      //flex: 1,
      //position: 'relative',
    backgroundColor: GREEN,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 4,
    paddingTop: 20,
    //marginBottom: 16,
    //position: 'relative',
    //zIndex: 1,
    //height: 56+20,
  },
  h1: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "400",
    padding: 16,
  },
  search: {
    fontFamily: 'material-icons',
    fontSize: 24,
    padding: 16,
    marginTop: 4,
    color: "#fff",
    //backgroundColor: "#000",
  },
  searchBox: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "400",
    padding: 16,
    flex: 1,
  },
  searchBack: {
    fontFamily: 'material-icons',
    fontSize: 24,
    //padding: 20,
    paddingLeft: 16,
    paddingTop: 22,
    color: "#fff",
    //backgroundColor: "#000",
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
      justifyContent: 'space-between',//todo do i need ths
  },
  lh: { // list header
    //fontWeight: 'bold',
    padding: 16,//+48+12+10, // Not sure where the 10 comes from
    //paddingBottom: 8,
    justifyContent: 'space-between',
    flexDirection: 'row',
    //paddingRight: 16,
  },
  lhText: {
    color: GRAY,
    fontSize: 14,
    fontWeight: "400",
  },
  collapse: {
    fontFamily: 'material-icons',
    fontSize: 20,
    fontWeight: "400",
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
        margin: 4,
  	borderColor: "#CCC",
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
    marginLeft: 0
  },
  imagePickerText: {
    fontFamily: 'material-icons',
      fontSize: 72,
      color: "#CCC",
  },
    imagePickerFullText: {
    },
    imagePickerSmallText: {
    },

    imageBar: {
	flexDirection: 'row',
	//alignContent: 'space-between',
	justifyContent: 'space-between',
	backgroundColor: '#000',
    elevation: 4,
    //marginTop: 20,
    	//height: 56,
    	position: 'absolute',
    	top: 20,
    	left: 0,
    },
  potDescInput: {
    minHeight: 40,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#eee',
  },
  ssLeft: {
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderRightWidth: 0,
    padding: 5,
  },
  ssMiddle: {
    borderWidth: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    padding: 5,
  },
  ssRight: {
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    borderWidth: 1,
    borderLeftWidth: 0,
    padding: 5,
  },
  bisqued: {
    backgroundColor: '#edc495',
    borderColor: '#ce995c',
  },
  trimmed: {
    backgroundColor: '#95beed',
    borderColor: '#4e90db',
  },
  thrown: {
    backgroundColor: '#9f95ed',
    borderColor: '#6252d8',
  },
  glazed: {
    backgroundColor: '#ed95e4',
    borderColor: '#d145c3',
  },
  pickedup: {
    backgroundColor: '#a1ed95',
    borderColor: '#4ecc3b',
  },
  notstarted: {
    backgroundColor: '#ed9595',
    borderColor: '#e03535',
  },
  status: {
    borderRadius: 5,
    borderWidth: 1,
    padding: 1,
    paddingLeft: 3,
    paddingRight: 3,
  },
  statusT: {
    color: '#666',
  },
  note: {
    //padding: 10,
  },
  noteBlankText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  settingsText: {
  	fontSize: 16,
    textAlign: 'center',
  }
});
