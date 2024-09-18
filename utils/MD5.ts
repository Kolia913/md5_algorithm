enum MD5Buffer {
  A = 0x67452301,
  B = 0xefcdab89,
  C = 0x98badcfe,
  D = 0x10325476,
}

export class MD5 {
  private static _text: string | null = null;
  private static _buffers: { [key in MD5Buffer]: number } = {
    [MD5Buffer.A]: MD5Buffer.A,
    [MD5Buffer.B]: MD5Buffer.B,
    [MD5Buffer.C]: MD5Buffer.C,
    [MD5Buffer.D]: MD5Buffer.D,
  };

  public static hash(input: string): string {
    this._text = input;

    const preprocessedBitArray = this.appendOriginalMessageLengthOnBits(
      this.convertToBitArrayAndApplyPadding()
    );
    this.initBuffers();
    this.processInChunks(preprocessedBitArray);
    return this.produceFinalHash();
  }

  // Step 1: Convert the string to a bit array and apply padding
  private static convertToBitArrayAndApplyPadding(): Buffer {
    const utf8Buffer = Buffer.from(this._text!, "utf-8");

    // Pad the message: append '1' bit and then '0' bits until it matches 448 mod 512
    let bitArray = Buffer.concat([utf8Buffer, Buffer.from([0x80])]);

    while ((bitArray.length * 8) % 512 !== 448) {
      bitArray = Buffer.concat([bitArray, Buffer.from([0x00])]);
    }

    return bitArray;
  }

  // Step 2: Append original message length (in bits) to the bit array
  private static appendOriginalMessageLengthOnBits(
    step1Result: Buffer
  ): Buffer {
    const bitLength = BigInt(this._text!.length * 8); // Use BigInt for correct length handling
    const lengthBuffer = Buffer.alloc(8);

    lengthBuffer.writeUInt32LE(Number(bitLength & 0xffffffffn), 0); // Lower 32 bits
    lengthBuffer.writeUInt32LE(Number(bitLength >> 32n), 4); // Higher 32 bits

    return Buffer.concat([step1Result, lengthBuffer]);
  }

  // Step 3: Initialize the MD5 buffers (A, B, C, D)
  private static initBuffers(): void {
    this._buffers[MD5Buffer.A] = MD5Buffer.A;
    this._buffers[MD5Buffer.B] = MD5Buffer.B;
    this._buffers[MD5Buffer.C] = MD5Buffer.C;
    this._buffers[MD5Buffer.D] = MD5Buffer.D;
  }

  // Step 4: Process the message in 512-bit chunks
  private static processInChunks(step2Result: Buffer): void {
    const F = (x: number, y: number, z: number) => (x & y) | (~x & z);
    const G = (x: number, y: number, z: number) => (x & z) | (y & ~z);
    const H = (x: number, y: number, z: number) => x ^ y ^ z;
    const I = (x: number, y: number, z: number) => y ^ (x | ~z);

    const rotateLeft = (x: number, n: number) => (x << n) | (x >>> (32 - n));
    const modularAdd = (a: number, b: number) => (a + b) >>> 0;

    // Calculate T table using the sine function
    const T = Array.from({ length: 64 }, (_, i) =>
      Math.floor(Math.abs(Math.sin(i + 1)) * Math.pow(2, 32))
    );

    const N = step2Result.length / 64;

    // Process the 512-bit blocks (each block is 64 bytes)
    for (let chunkIndex = 0; chunkIndex < N; chunkIndex++) {
      const chunk = step2Result.subarray(
        chunkIndex * 64,
        (chunkIndex + 1) * 64
      );

      const X = new Array(16);
      for (let i = 0; i < 16; i++) {
        X[i] = chunk.readUInt32LE(i * 4);
      }

      let A = this._buffers[MD5Buffer.A];
      let B = this._buffers[MD5Buffer.B];
      let C = this._buffers[MD5Buffer.C];
      let D = this._buffers[MD5Buffer.D];

      for (let i = 0; i < 64; i++) {
        let temp: number;
        let k: number;
        let s: number;

        if (i < 16) {
          k = i;
          s = [7, 12, 17, 22][i % 4];
          temp = F(B, C, D);
        } else if (i < 32) {
          k = (5 * i + 1) % 16;
          s = [5, 9, 14, 20][i % 4];
          temp = G(B, C, D);
        } else if (i < 48) {
          k = (3 * i + 5) % 16;
          s = [4, 11, 16, 23][i % 4];
          temp = H(B, C, D);
        } else {
          k = (7 * i) % 16;
          s = [6, 10, 15, 21][i % 4];
          temp = I(B, C, D);
        }

        temp = modularAdd(temp, X[k]);
        temp = modularAdd(temp, T[i]);
        temp = modularAdd(temp, A);
        temp = rotateLeft(temp, s);
        temp = modularAdd(temp, B);

        // Rotate registers
        A = D;
        D = C;
        C = B;
        B = temp;
      }

      // Update buffer values
      this._buffers[MD5Buffer.A] = modularAdd(this._buffers[MD5Buffer.A], A);
      this._buffers[MD5Buffer.B] = modularAdd(this._buffers[MD5Buffer.B], B);
      this._buffers[MD5Buffer.C] = modularAdd(this._buffers[MD5Buffer.C], C);
      this._buffers[MD5Buffer.D] = modularAdd(this._buffers[MD5Buffer.D], D);
    }
  }

  // Step 5: Produce the final hash as a hex string
  private static produceFinalHash(): string {
    const A = this.toLittleEndianHex(this._buffers[MD5Buffer.A]);
    const B = this.toLittleEndianHex(this._buffers[MD5Buffer.B]);
    const C = this.toLittleEndianHex(this._buffers[MD5Buffer.C]);
    const D = this.toLittleEndianHex(this._buffers[MD5Buffer.D]);

    return A + B + C + D;
  }

  private static toLittleEndianHex(value: number): string {
    const buffer = Buffer.alloc(4);
    buffer.writeUInt32LE(value, 0);
    return buffer.toString("hex");
  }
}
