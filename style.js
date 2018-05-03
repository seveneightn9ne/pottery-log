import { StyleSheet } from 'react-native';

const ORANGE = "#ff5722";
const LIME = "#cddc39";
const BLACK = "rgba(0,0,0,.87)";
const GRAY = "rgba(0,0,0,.54)";
const LIGHT_GRAY = "rgba(0,0,0,.10)";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    //paddingTop: 20,
  },
  newPotButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: LIME,
    marginLeft: 16,
    marginTop: -24,
    elevation: 6,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: ORANGE,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 4,
    paddingTop: 20,
  },
  h1: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "400",
    padding: 20,
    paddingLeft: 72,
  },
  search: {
    fontFamily: 'material-icons',
    fontSize: 24,
    padding: 20,
    paddingRight: 16,
    paddingTop: 22,
    color: "#fff",
    //backgroundColor: "#000",
  },
  searchBox: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "400",
    padding: 20,
    flex: 1,
  },
  searchBack: {
    fontFamily: 'material-icons',
    fontSize: 24,
    padding: 20,
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
  lh: { // list header
    //fontWeight: 'bold',
    fontSize: 14,
    fontWeight: "400",
    //paddingTop: 5,
    paddingLeft: 72,
    color: GRAY,
    paddingBottom: 8,
  },
  listItem: {
    paddingLeft: 16,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  liImage: {
    width:48,height:48,
    borderRadius: 24,
  },
  liImagePlaceholder: {
    backgroundColor: 'rgba(0,0,0,.55)',
    width:36,height:36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,

  },
  liImagePlaceholderText: {
    fontFamily: 'material-icons',
    fontSize: 22,
    color: "#fff",
  },
  lititle: {
    fontSize: 13,
    color: BLACK,
  },
  lisubtitle: {
    fontSize: 13,
    color: GRAY,
  },
  separator: {
    height: 1,
    backgroundColor: LIGHT_GRAY,
    marginBottom: 16,
    marginLeft: 72,
    marginTop: 8,
  },
  eraseLastSeparator: {
    backgroundColor: LIME,
    marginTop: -10,
    height: 5,
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
  	borderWidth: 1,
  	borderColor: 'black',
  	alignItems: 'center',
  	flexDirection: 'column',
    backgroundColor: 'white',
    // The borderRadius thing is a react-native bug with the dashed border
    borderRadius: 0.5,
  	//textAlign: 'center',
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
