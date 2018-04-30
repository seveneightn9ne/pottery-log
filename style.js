import { StyleSheet } from 'react-native';

const ORANGE = "#ff5722";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    //paddingTop: 20,
  },
  listItem: {
  	backgroundColor: '#eee',
  	//padding: 10,
  	flexDirection: 'row',
  	alignItems: 'center',
  	height: 50,
  	borderBottomWidth: 1,
  	borderColor: '#ccc',
  },
  newPotButton: {
  	fontWeight: 'bold',
  	fontSize: 48,
  	color: 'green',
  	//height: 50,
  	//width: 50,
  	//borderWidth: 1,
  	paddingRight: 10,
  	paddingLeft: 10
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
    //paddingLeft: 72,
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
  h2: {
  	fontSize: 24,
  	fontWeight: 'bold',
  	padding: 10,
  },
  lh: {
    fontWeight: 'bold',
    fontSize: 16,
    paddingTop: 5,
    paddingLeft: 10,
    paddingBottom: 0,
  },
  lititle: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  lisubtitle: {
    fontSize: 12,
    color: '#666666',
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
