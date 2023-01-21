# Format of the ROK Mail file

The format of the file seems to be a TLV-style encoding. Most of the time, a key is followed by a value, but that doesn't seem to be the case 100% of the time, or there are some parts I have yet to figure out.

The overall format looks like this:

- HEADER - uint64 still to be figured out
- [TOKEN] - a sequence of tokens with a meaning decoded by the game

## Tokens

A token has the following shape:

TOKEN_TYPE - uint8 denoting the token's type. This can be one of the following:
    - 0x01 - a uint8 value
    - 0x03 - a uint64 value (endianess TBD)
    - 0x04 - a string value - this is encoded as a uint32le length, followed by a utf-8 encoded string of that length
    - 0x05 - an array start token