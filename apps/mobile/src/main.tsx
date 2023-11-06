import { AppRegistry } from 'react-native';
import App from './app/App';

AppRegistry.registerComponent('Mobile', () => App);

if (window.document) {

  AppRegistry.runApplication('Mobile', { 
    rootTag: document.getElementById('root'),
  });
}