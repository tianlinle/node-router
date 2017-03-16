import { Request } from './Request';
import * as http from 'http';
import * as fs from 'async-file';

export class CommonHandlerStorage {
    static resource(parentDir: string, next: boolean, err?: (request: Request, res: http.ServerResponse, parentDir: string, filename: string) => void) {
        return async (request: Request, res: http.ServerResponse): Promise<boolean> => {
            let pathname = request.pathname;
            if (pathname[0] == '/') {
                pathname = pathname.substr(1);
            }
            let filename = parentDir + pathname;
            let stats = await fs.stat(filename);
            let readStream = fs.createReadStream(filename);
            readStream.pipe(res);
            return next;
        };
    }

    static notFound(next: boolean) {
        return async (response: Response, res: http.ServerResponse): Promise<any> => {
            res.writeHead(404, { 'Content-Type': 'text/html;charset=utf8' });
            res.end('<h1><center>Not Found</center></h1>');
            return next;
        };
    }
}