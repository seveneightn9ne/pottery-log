import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    paddingTop: 20,
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
  h1: {
  	fontSize: 36,
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
  	borderColor: 'gray',
  	alignItems: 'center',
  	flexDirection: 'column',
  	//textAlign: 'center',
  },
});
