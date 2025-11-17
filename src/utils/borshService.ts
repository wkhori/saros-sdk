import { createHash } from 'crypto';
import { Layout } from 'buffer-layout';

/**
 * Service for Borsh serialization and deserialization operations
 * Used for Anchor program instruction encoding/decoding
 */
export class BorshService {
  /**
   * Serialize data with Anchor's method discriminator prefix
   * @param method - The method name (e.g., 'swap', 'initialize')
   * @param layout - The buffer-layout Layout for the data structure
   * @param data - The data object to serialize
   * @param maxSpan - Maximum size of the serialized buffer
   * @returns Buffer containing the discriminator and encoded data
   */
  static anchorSerialize<T>(
    method: string,
    layout: Layout<T>,
    data: T,
    maxSpan: number
  ): Buffer {
    // Generate 8-byte discriminator from method name
    const prefix = createHash('sha256').update(`global:${method}`).digest();
    const truncatedPrefix = prefix.subarray(0, 8);

    // Encode the data
    const buffer = Buffer.alloc(maxSpan);
    const span = layout.encode(data, buffer);

    // Combine discriminator and encoded data
    return Buffer.from([...truncatedPrefix, ...buffer.subarray(0, span)]);
  }

  /**
   * Deserialize data with Anchor's method discriminator prefix
   * Skips the first 8 bytes (discriminator) and decodes the rest
   * @param layout - The buffer-layout Layout for the data structure
   * @param data - The buffer containing discriminator + encoded data
   * @returns Decoded data object
   */
  static anchorDeserialize<T>(layout: Layout<T>, data: Buffer): T {
    return layout.decode(data.subarray(8));
  }

  /**
   * Deserialize data without any prefix
   * @param layout - The buffer-layout Layout for the data structure
   * @param data - The buffer containing encoded data
   * @returns Decoded data object
   */
  static deserialize<T>(layout: Layout<T>, data: Buffer): T {
    return layout.decode(data);
  }

  /**
   * Serialize data without any prefix
   * @param layout - The buffer-layout Layout for the data structure
   * @param data - The data object to serialize
   * @param maxSpan - Maximum size of the serialized buffer
   * @returns Buffer containing only the encoded data
   */
  static serialize<T>(layout: Layout<T>, data: T, maxSpan: number): Buffer {
    const buffer = Buffer.alloc(maxSpan);
    const span = layout.encode(data, buffer);
    return buffer.subarray(0, span);
  }
}
