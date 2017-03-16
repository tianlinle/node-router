import * as fs from 'fs';
import * as stream from 'stream';

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
}