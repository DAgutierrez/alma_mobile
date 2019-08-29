import * as Font from 'expo-font';
import React from 'react';
import { 
  StatusBar, 
  StyleSheet
} from 'react-native';


import { AppRegistry } from 'react-native';

import _ from 'lodash';

import HomeComponent from './components/Home/HomeComponent';


export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      isLoaded: false
    };
  }

  async componentWillMount() {

    Font.loadAsync({
      Roboto: require('native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf')
    });

    StatusBar.setHidden(true);
    this.setState({ isLoaded: true });
  }



  render() {
    if(this.state.isLoaded) {
    return (
      <HomeComponent/>
    )
  } else {
    return null;
  }

}

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa'
  },
  textinput: {
    flex: 1
  }
  
 
});

AppRegistry.registerComponent('App', () => App);
