import { App } from '../App';
import { CommonHandlerStorage } from '../CommonHandlerStorage';

let app = new App();
app.get(/\/public\/.*/, CommonHandlerStorage.resource('C:/Users/what/Documents/WebProjects/node-router/', true))
    .error(async (err): Promise<boolean> => {
        console.log(err);
        return true;
    }).listen(3000);