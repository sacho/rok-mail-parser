type MailRecord = any;

class MailCatalog {
    public mails: { [key: string]: MailRecord };
    constructor(public directory: string) {
        this.mails = this.loadCatalog(this.directory);
    }

    private loadCatalog(directory: string) {
        return [];
    }
}
