type LogValue = any;
type DataCollection = { [key: string]: LogValue };

export class BattleLogParser {
  offset: number = 0;
  buffer: Buffer;
  view: DataView;
  data: DataCollection = {};
  decoder = new TextDecoder("utf8");

  constructor(buffer: Buffer) {
    this.buffer = buffer;
    this.view = new DataView(buffer.buffer, this.offset);
  }

  parseHeader() {
    const start = this.consumeUint8();
    const value = this.consumeFloat64();
    return value;
  }

  consumeUint8() {
    const result = this.view.getUint8(this.offset);
    this.offset += 1;
    return result;
  }

  consumeFloat64() {
    const result = this.view.getFloat64(this.offset);
    this.offset += 8;
    return result;
  }

  consumeString() {
    const length = this.view.getUint32(this.offset, true);
    this.offset += 4;
    const result = this.decoder.decode(
      this.buffer.subarray(this.offset, this.offset + length)
    );
    this.offset += length;
    return result;
  }

  parseCollection() {
    const data: DataCollection = {};
    while (this.offset < this.buffer.length) {
      const kt = this.consumeUint8();
      let key,
        value = null;
      if (kt == 0xff) {
        return data;
      }
      if (kt == 0x03) {
        key = this.consumeFloat64().toString();
      } else if (kt == 0x04) {
        key = this.consumeString();
      } else {
        throw new Error(`Unexpected key type ${kt} at offset ${this.offset}`);
      }
      const vt = this.consumeUint8();
      if (vt == 0x01) {
        value = this.consumeUint8();
      } else if (vt == 0x03) {
        value = this.consumeFloat64();
      } else if (vt == 0x04) {
        value = this.consumeString();
      } else if (vt == 0x05) {
        value = this.parseCollection();
      } else {
        throw new Error(`Unexpected value type ${vt} at offset ${this.offset}`);
      }
      data[key] = value;
    }
    return data;
  }

  parse() {
    this.offset = 0;
    this.data["header"] = this.parseHeader();
    this.consumeUint8(); // 05 of starting collection
    this.data["data"] = this.parseCollection();

    return this.data;
  }
}
