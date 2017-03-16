import { App } from '../App';
import { CommonHandlerStorage } from '../CommonHandlerStorage';

let app = new App();
app.get(/\/public\/.*/, CommonHandlerStorage.resource('C:/Users/what/Documents/www/node-router/', true)).listen(3000);