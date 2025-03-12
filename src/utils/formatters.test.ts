import { describe, test, expect } from "@jest/globals";
import {
  formatDate,
  formatCurrency,
  formatAddress,
  formatRatingAsStars,
  truncateText,
} from "./formatters";

describe("Formatter Utilities", () => {
  describe("formatDate", () => {
    test("formats date correctly with default locale", () => {
      const date = new Date("2023-05-15T12:00:00Z");
      expect(formatDate(date)).toBe("May 15, 2023");
    });

    test("formats date correctly with custom locale", () => {
      const date = new Date("2023-05-15T12:00:00Z");
      expect(formatDate(date, "es-ES")).toMatch(/15 de mayo de 2023/);
    });
  });

  describe("formatCurrency", () => {
    test("formats currency correctly with default values", () => {
      expect(formatCurrency(1234.56)).toMatch(/DOP\s*1,234\.56/);
    });

    test("formats currency correctly with custom currency code", () => {
      expect(formatCurrency(1234.56, "USD")).toMatch(/\$\s*1,234\.56/);
    });

    test("formats currency correctly with custom locale", () => {
      expect(formatCurrency(1234.56, "EUR", "de-DE")).toMatch(/1\.234,56\s*€/);
    });

    test("handles zero and negative values", () => {
      expect(formatCurrency(0)).toMatch(/DOP\s*0\.00/);
      expect(formatCurrency(-1234.56)).toMatch(/-\s*DOP\s*1,234\.56/);
    });
  });

  describe("formatAddress", () => {
    test("formats complete address correctly", () => {
      const address = {
        street: "Calle Principal",
        number: "123",
        city: "Santo Domingo",
        state: "Distrito Nacional",
        country: "Dominican Republic",
        postalCode: "10001",
      };
      expect(formatAddress(address)).toBe(
        "Calle Principal 123, Santo Domingo, Distrito Nacional, Dominican Republic, 10001"
      );
    });

    test("formats partial address correctly", () => {
      const address = {
        street: "Calle Principal",
        city: "Santo Domingo",
        country: "Dominican Republic",
      };
      expect(formatAddress(address)).toBe(
        "Calle Principal, Santo Domingo, Dominican Republic"
      );
    });

    test("handles empty address", () => {
      expect(formatAddress({})).toBe("");
    });
  });

  describe("formatRatingAsStars", () => {
    test("formats integer ratings correctly", () => {
      expect(formatRatingAsStars(5)).toBe("★★★★★");
      expect(formatRatingAsStars(3)).toBe("★★★☆☆");
      expect(formatRatingAsStars(0)).toBe("☆☆☆☆☆");
    });

    test("formats half-star ratings correctly", () => {
      expect(formatRatingAsStars(4.5)).toBe("★★★★½");
      expect(formatRatingAsStars(3.7)).toBe("★★★½☆");
      expect(formatRatingAsStars(2.2)).toBe("★★☆☆☆");
    });
  });

  describe("truncateText", () => {
    test("does not truncate text shorter than maxLength", () => {
      expect(truncateText("Hello", 10)).toBe("Hello");
    });

    test("truncates text longer than maxLength", () => {
      expect(truncateText("Hello, world!", 5)).toBe("Hello...");
    });

    test("handles edge cases", () => {
      expect(truncateText("", 10)).toBe("");
      expect(truncateText("Hello", 5)).toBe("Hello");
    });
  });
});
