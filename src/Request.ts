import * as http from 'http';
import * as url from 'url';
import * as querystring from 'querystring';

export class Request {
    incomingMessage: http.IncomingMessage;
    readonly getParams: { [index: string]: string } = null;
    readonly body;
    readonly postData: string;
    readonly postParams: { [index: string]: any } = null;
    readonly requestParams: { [index: string]: any } = null;
    readonly files;
    readonly url: string;
    readonly pathname: string;
    readonly headers: { [index: string]: string };

    constructor(incomingMessage: http.IncomingMessage, body) {
        this.incomingMessage = incomingMessage;
        this.url = incomingMessage.url;
        let urlParts = url.parse(incomingMessage.url, true);
        this.getParams = urlParts.query;
        this.pathname = urlParts.pathname;
        this.body = body;
        this.postData = decodeURI(this.body);
        this.postParams = querystring.parse(this.postData);
        this.requestParams = Object.assign(this.getParams, this.postParams);
        this.headers = incomingMessage.headers;
    }

    get(index?: string, defaultValue?: any) {
        if (!index) {
            return this.getParams;
        }
        return this.getParams[index] || defaultValue;
    }
}