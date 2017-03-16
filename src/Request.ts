import * as http from 'http';
import * as url from 'url';

export class Request {
    incomingMessage: http.IncomingMessage;
    readonly getParams: { [index: string]: string } = null;
    readonly postData: string;
    readonly postParams: { [index: string]: any } = null;
    readonly files;
    readonly url: string;
    readonly pathname: string;
    readonly headers;

    constructor(incomingMessage: http.IncomingMessage, postData?: string) {
        this.incomingMessage = incomingMessage;
        this.url = incomingMessage.url;
        let urlParts = url.parse(incomingMessage.url, true);
        this.getParams = urlParts.query;
        this.pathname = urlParts.pathname;
        this.postData = postData;
        this.headers = incomingMessage.headers;
    }

    get(index?: string, defaultValue?: any) {
        if (!index) {
            return this.getParams;
        }
        return this.getParams[index] || defaultValue;
    }
}