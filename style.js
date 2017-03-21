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
  	paddingRight: 15,
  },
  listItemImg: {
  	width: 50,
  	height: 50,
  	marginRight: 10,
  },
  h1: {
  	fontSize: 36,
  	fontWeight: 'bold',
  	padding: 10,
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
  	//textAlign: 'center',
  },
});
