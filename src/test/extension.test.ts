import { BlueprintEntity } from "../blueprintUtils";
import {
  base64ToUint8Array,
  reverseTransform,
  transformBlueprint,
  uint8ArrayToBase64,
} from "../blueprintUtils";

// Mock the global atob and btoa functions since they're not available in Node.js
global.atob = (str: string) => Buffer.from(str, "base64").toString("binary");
global.btoa = (str: string) => Buffer.from(str, "binary").toString("base64");

describe("Factorio Blueprint Extension", () => {
  const sampleBlueprint =
    "0eNqdkt1uwyAMhd/F12Rq87cl0p5kqirCvNYSAUZItyri3WeyLUt7MakVN2BzPh+DJ+j0iM6TCdBOQMqaAdqXCQY6GKlTzMgeoYWUCdKETNm+IyOD9RAFkHnFT2i3cScATaBA+A2YD+e9GfsOPV8Q/4EEODuw1ppUkXnZ4+ahEnBmYcE7LsSy4K3ed3iUJ2INXxxQJc1wuefiv64EvJEO6K+jP1bIW5M5LQOyg/dRanbMYWN9z72nmr2TfnbYwvMcGNNDZdsoFly+6sw59HcB8xWwWIBDQNR38YoVr7zs94DSZx9HJt/ILFfM6rppJTt9q8lqBawXIGr+STZKKlPk1UjhRmwdd7ximkgK2HP2b8YFnHga5jmr6rwpm6Yqm/ypLjcxfgGPcAJl";

  describe("Base64 Conversion", () => {
    test("Base64 to Uint8Array conversion", () => {
      const result = base64ToUint8Array(sampleBlueprint.slice(1));
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);
    });

    test("Uint8Array to Base64 conversion", () => {
      const bytes = base64ToUint8Array(sampleBlueprint.slice(1));
      const result = uint8ArrayToBase64(bytes);
      expect(result).toBe(sampleBlueprint.slice(1));
    });
  });

  describe("Blueprint Transformation", () => {
    test("Blueprint to JSON transformation matches expected structure", () => {
      const result = transformBlueprint(sampleBlueprint);
      const parsed = JSON.parse(result);

      // Check top-level structure
      expect(parsed.blueprint).toBeDefined();
      expect(parsed.blueprint.version).toBe(562949954928640);
      expect(parsed.blueprint.item).toBe("blueprint");

      // Check icons
      expect(parsed.blueprint.icons).toEqual([
        {
          signal: {
            name: "constant-combinator",
          },
          index: 1,
        },
      ]);

      // Check entities
      const entity = parsed.blueprint.entities[0];
      expect(entity).toEqual({
        entity_number: 1,
        name: "constant-combinator",
        position: {
          x: -70.5,
          y: 130.5,
        },
        control_behavior: {
          sections: {
            sections: [
              {
                index: 1,
                filters: [
                  {
                    index: 1,
                    name: "iron-plate",
                    quality: "normal",
                    comparator: "=",
                    count: -1,
                  },
                  {
                    index: 2,
                    name: "copper-plate",
                    quality: "normal",
                    comparator: "=",
                    count: -2,
                  },
                  {
                    index: 3,
                    name: "steel-plate",
                    quality: "normal",
                    comparator: "=",
                    count: -3,
                  },
                  {
                    index: 4,
                    name: "iron-gear-wheel",
                    quality: "normal",
                    comparator: "=",
                    count: -4,
                  },
                  {
                    index: 5,
                    name: "copper-cable",
                    quality: "normal",
                    comparator: "=",
                    count: -5,
                  },
                  {
                    index: 6,
                    name: "electronic-circuit",
                    quality: "normal",
                    comparator: "=",
                    count: -6,
                  },
                ],
              },
            ],
          },
        },
      });
    });

    test("Blueprint to JSON transformation", () => {
      const result = transformBlueprint(sampleBlueprint);
      const parsed = JSON.parse(result);

      // Check if the result is valid JSON and has the expected structure
      expect(parsed.blueprint).toBeDefined();
      expect(Array.isArray(parsed.blueprint.entities)).toBe(true);

      // Check specific content based on the sample blueprint
      const entities = parsed.blueprint.entities;
      expect(entities.length).toBeGreaterThan(0);
      expect(entities.some((entity: BlueprintEntity) => entity.name)).toBe(
        true
      );
    });

    test("Roundtrip transformation preserves data", () => {
      // Transform blueprint to JSON
      const jsonResult = transformBlueprint(sampleBlueprint);

      // Transform back to blueprint string
      const blueprintResult = reverseTransform(jsonResult);

      // The final result should be valid and transformable again
      const finalJson = transformBlueprint(blueprintResult);
      const original = JSON.parse(jsonResult);
      const final = JSON.parse(finalJson);

      // Compare the structure and content
      expect(final).toEqual(original);
    });

    test("Handles invalid input", () => {
      expect(() => transformBlueprint("invalid-blueprint")).toThrow();
    });

    test("Handles invalid JSON in reverse transform", () => {
      expect(() => reverseTransform("invalid-json")).toThrow();
    });
  });
});
