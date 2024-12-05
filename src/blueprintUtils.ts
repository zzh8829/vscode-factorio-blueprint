import * as pako from "pako";

export interface BlueprintEntity {
  name: string;
  [key: string]: any;
}

interface Blueprint {
  blueprint: {
    entities: BlueprintEntity[];
    [key: string]: any;
  };
}

// Declare the global functions for TypeScript
declare global {
  function atob(data: string): string;
  function btoa(data: string): string;
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function transformBlueprint(input: string): string {
  try {
    // Remove the version number (first character)
    const _version = input.charAt(0);
    const base64Data = input.slice(1);

    // Decode base64 to bytes
    const compressed = base64ToUint8Array(base64Data);

    // Decompress using zlib
    const decompressed = pako.inflate(compressed, { to: "string" });

    // Parse JSON
    const blueprint = JSON.parse(decompressed) as Blueprint;

    // Pretty print the JSON
    return JSON.stringify(blueprint, null, 2);
  } catch (error) {
    throw new Error(`Failed to transform blueprint: ${error}`);
  }
}

export function reverseTransform(input: string): string {
  try {
    // Parse the JSON
    const blueprint = JSON.parse(input) as Blueprint;

    // Convert back to JSON string
    const jsonString = JSON.stringify(blueprint);

    // Compress using zlib
    const compressed = pako.deflate(jsonString);

    // Convert to base64
    const base64 = uint8ArrayToBase64(compressed);

    // Add version number back
    return "0" + base64;
  } catch (error) {
    throw new Error(`Failed to reverse transform blueprint: ${error}`);
  }
} 