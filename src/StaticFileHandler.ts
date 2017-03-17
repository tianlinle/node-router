import * as http from 'http';
import { Request } from './Request';
import * as fs from 'fs';
import * as stream from 'stream';
import { MimeType } from './MimeType';
import * as path from 'path';

export class StaticFileHandler {
    static handler(parentDir: string, next: boolean) {
        return async (request: Request, res: http.ServerResponse): Promise<boolean> => {
            if (request.pathname.indexOf('/..') != -1) {
                throw 'unsafe pathname: ' + request.pathname;
            }
            let pathname = request.pathname;
            if (pathname[0] == '/') {
                pathname = pathname.substr(1);
            }
            let filename = parentDir + pathname;
            let stats: fs.Stats;
            try {
                stats = await this.stat(filename);
            } catch (error) {
                res.writeHead(404);
                return next;
            }
            if (!stats.isFile()) {
                res.writeHead(404);
            } else {
                if (request.headers['range']) {
                    let [p0, p1] = request.headers['range'].split(/bytes=([0-9]*)-([0-9]*)/);
                    let start = isNaN(parseInt(p0)) ? 0 : parseInt(p0);
                    let end = isNaN(parseInt(p1)) ? stats.size - 1 : parseInt(p1);
                    if (start >= stats.size || end >= stats.size || start >= end) {
                        res.writeHead(416, { 'Content-Range': 'bytes */' + stats.size });
                    } else {
                        res.writeHead(206, {
                            'Content-Range': 'bytes ' + start + '-' + end + '/' + stats.size,
                            'Content-Length': end - start + 1,
                            'Accept-Ranges': 'bytes',
                            'Cache-Control': 'no-cache',
                        });
                        await this.pipe(fs.createReadStream(filename, { start: start, end: end }), res);
                    }
                } else {
                    res.writeHead(200, {
                        "Content-Type": MimeType.getMimeTypeOfFile(filename),
                        "Content-Length": stats.size
                    });
                    await this.pipe(fs.createReadStream(filename), res);
                }
            }
            return next;
        }
    }

    static stat(filename: string): Promise<fs.Stats> {
        return new Promise<fs.Stats>((resolve, reject) => {
            fs.stat(filename, (err, stats) => {
                if (err) {
                    reject(err);
                }
                resolve(stats);
            });
        });
    }

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