declare module 'buffer-layout' {
  export interface Layout<T = any> {
    encode(src: T, buffer: Buffer, offset?: number): number;
    decode(buffer: Buffer, offset?: number): T;
    getSpan(buffer?: Buffer, offset?: number): number;
  }

  export function struct<T>(
    fields: Layout[],
    property?: string,
    decodePrefixes?: boolean
  ): Layout<T>;

  export function u8(property?: string): Layout<number>;
  export function u16(property?: string): Layout<number>;
  export function u32(property?: string): Layout<number>;
  export function u64(property?: string): Layout<bigint>;
  export function blob(length: number, property?: string): Layout<Buffer>;
  export function seq<T>(
    elementLayout: Layout<T>,
    count: number | Layout<number>,
    property?: string
  ): Layout<T[]>;
}
