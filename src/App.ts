import * as http from 'http';
import { Request } from './Request';
import * as fs from 'fs';
import { MimeType } from './MimeType';
import { Async } from './Async';
import * as querystring from 'querystring';

type Handler = (request: Request, res: http.ServerResponse) => Promise<boolean>;
type ErrorHandler = (err: Error, req?: http.IncomingMessage, res?: http.ServerResponse, request?: Request) => Promise<boolean>;
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
            let request: Request = null;
            try {
                let body = await this.waitPostData(req);
                let request = new Request(req, body);
                if (req.method == 'POST') {
                    for (let rule of this.postRules) {
                        if (rule.pathname.test(req.url)) {
                            if (!await rule.handler(request, res)) {
                                break;
                            }
                        }
                    }
                } else {
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
                    if (!await handler(e, req, res, request)) {
                        break;
                    }
                }
            }
            if (!res.finished) {
                res.end();
            }
            console.log(req.url, res.statusCode);
        }).listen(this.port);
    }

    waitPostData(request: http.IncomingMessage): Promise<string> {
        return new Promise((resolve, reject) => {
            let data = '';
            request.on('data', (chunk) => {
                data += chunk;
                console.log('chunk:' + chunk);
            });
            request.on('end', () => {
                resolve(data);
            })
            request.on('error', (err) => {
                reject(err);
            })
        });
    }
}