import * as fs from 'fs';
import * as stream from 'stream';
import * as http from 'http';

export class Async {
    static pipe(source: stream.Readable, destiny: stream.Writable, option?) {
        return new Promise((resolve, reject) => {
            source.on('end', resolve);
            source.on('error', (err) => {
                reject(err);
            });
            destiny.on('finish', resolve);
            source.on('error', (err) => {
                reject(err);
            });
            source.pipe(destiny, option);
        });
    }

    static waitPostData(request: http.IncomingMessage): Promise<string> {
        return new Promise((resolve, reject) => {
            let data: string = '';
            request.on('data', (trunk) => {
                data += trunk;
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