import { App } from '../App';
import { StaticFileHandler } from '../StaticFileHandler';

let app = new App();
app
    .get(/\/public\/.*/, StaticFileHandler.handler('C:/Users/what/Documents/www/node-router/', true))
    .post(/^.*$/, async (request, res): Promise<boolean> => {
        res.end(request.postData);
        return true;
    })
    .error(async (err): Promise<boolean> => {
        console.log(err);
        return true;
    })
    .listen(3000);