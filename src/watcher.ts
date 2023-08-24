import * as fs from "node:fs/promises";
import * as path from "node:path";
import { Observable } from "rxjs";

export class MailWatcher {
    private watcher: any;
    constructor(public directory: string) {}
    public watch(): Observable<string> {
        this.watcher = fs.watch(this.directory);
        return new Observable((observer) => {
            (async () => {
                try {
                    for await (const event of this.watcher) {
                        console.log(event);
                        const fpath = path.join(this.directory, event.filename);
                        observer.next(fpath);
                    }
                } catch (err: any) {
                    if (err.name === "AbortError") {
                        observer.complete();
                    }
                    observer.error();
                }
            })();
        });
    }
}
