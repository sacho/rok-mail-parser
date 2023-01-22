# ROKMailParser

## Installation

Requires a new-ish Node installation
`npm install` should do the rest.

## ROK Mail Format

The format of the file seems to be a TLV-style encoding.

Each mail file starts with an `0xFF` character, followed by a 8-byte header(currently unknown meaning)
This is followed by a collection of key-value pairs.
The format uses 4 data types:

- 0x01 - Byte of data, presumably used for 0/1 flags
- 0x03 - Numerical data, encoded as Float64
- 0x04 - String data, encoded as `[LENGTH][VALUE]`, where length is a Uint32 and value is utf-8 encoded text
- 0x05 - A collection of keys and values

Keys can only be numbers or strings, and values can be any of the data types.

TBC
