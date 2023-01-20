class RokMailParser {
    offset: number = 0
    result: Object = {}

    constructor() {

    }


    parse(buffer: Buffer) {
        this.offset = 0
        this.result = {}
        // header
        this.parseHeader(buffer)
    }

    parseHeader(buffer: Buffer)
}