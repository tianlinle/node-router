import * as http from 'http';
import { Request } from './Request';
import * as fs from 'fs';
import { MimeType } from './MimeType';

type Handler = (request: Request, res: http.ServerResponse) => Promise<boolean>;
type ErrorHandler = (err: Error, request: Request, res: http.ServerResponse) => Promise<boolean>;
type Rule = { pathname: RegExp, handler?: Handler };

export class App {
    getRules: Rule[] = [];
    postRules: Rule[] = [];
    staticRules: Rule[] = [];
    errorHandlers: ErrorHandler[] = [];
    port: number;

    get(pathname: RegExp, handler: Handler) {
        this.getRules.push({ pathname: pathname, handler: handler });
        return this;
    }

    post(pathname: RegExp, handler: Handler) {
        this.postRules.push({ pathname: pathname, handler: handler });
        return this;
    }

    error(handler: ErrorHandler) {
        this.errorHandlers.push(handler);
        return this;
    }

    request(pathname: RegExp, handler: Handler) {
        return this.get(pathname, handler).post(pathname, handler);
    }

    async listen(port = 3000) {
        this.port = port;
        http.createServer(async (req, res) => {
            let request = null;
            try {
                if (req.method == 'POST') {
                    let postData = '';
                    req.on('data', (chunk) => {
                        postData += chunk;
                    });
                    request = new Request(req, postData);
                    req.on('end', async () => {
                        for (let rule of this.postRules) {
                            if (rule.pathname.test(req.url)) {
                                if (!await rule.handler(request, res)) {
                                    break;
                                }
                            }
                        }
                    });
                } else {
                    request = new Request(req);
                    for (let rule of this.getRules) {
                        if (rule.pathname.test(req.url)) {
                            if (!await rule.handler(request, res)) {
                                break;
                            }
                        }
                    }
                }
            } catch (e) {
                for (let handler of this.errorHandlers) {
                    if (!await handler(e, request, res)) {
                        break;
                    }
                }
            }
            if (!res.finished) {
                res.end();
            }
        }).listen(this.port);
    }
}