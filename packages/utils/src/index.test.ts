import { describe, it, expect } from "vitest";
import {
   getCountryFlag,
   formatMatchTime,
   formatMatchDate,
   getMatchStatusLabel,
   calculateMatchPredictionPoints,
} from "./index";

describe("@wc26/utils", () => {
  describe("getCountryFlag", () => {
    it("should return correct flag emoji for FIFA 3-letter codes", () => {
      expect(getCountryFlag("USA")).toBe("🇺🇸");
      expect(getCountryFlag("ARG")).toBe("🇦🇷");
      expect(getCountryFlag("BRA")).toBe("🇧🇷");
      expect(getCountryFlag("FRA")).toBe("🇫🇷");
    });

    it("should return correct flag emoji for 2-letter ISO codes", () => {
      expect(getCountryFlag("US")).toBe("🇺🇸");
      expect(getCountryFlag("ES")).toBe("🇪🇸");
      expect(getCountryFlag("MX")).toBe("🇲🇽");
    });

    it("should return fallback flag emoji for invalid codes", () => {
      expect(getCountryFlag("INVALID")).toBe("🏳️");
      expect(getCountryFlag("X")).toBe("🏳️");
    });
  });

  describe("formatMatchTime", () => {
    it("should format ISO string into HH:MM local time", () => {
      const matchTime = "2026-06-11T18:00:00Z";
      // Expect it to match the format of XX:XX (e.g. 18:00 or local offset)
      expect(formatMatchTime(matchTime)).toMatch(/^\d{2}:\d{2}$/);
    });

    it("should return default fallback time on invalid date", () => {
      expect(formatMatchTime("invalid-date-string")).toBe("00:00");
    });
  });

  describe("formatMatchDate", () => {
    it("should format ISO string into weekday, month and day", () => {
      const matchDate = "2026-06-11T18:00:00Z";
      // e.g. "Thu, Jun 11" or similar
      const result = formatMatchDate(matchDate);
      expect(result).toContain("Jun");
      expect(result).toContain("11");
    });

    it("should return empty string on invalid date", () => {
      expect(formatMatchDate("invalid-date-string")).toBe("");
    });
  });

  describe("getMatchStatusLabel", () => {
    it("should format match status labels correctly", () => {
      expect(getMatchStatusLabel("live", 45)).toBe("Live 45'");
      expect(getMatchStatusLabel("live")).toBe("Live 0'");
      expect(getMatchStatusLabel("completed")).toBe("FT");
      expect(getMatchStatusLabel("upcoming")).toBe("Upcoming");
    });
  });

  describe("calculateMatchPredictionPoints", () => {
    it("should return 3 points for exact score match", () => {
      expect(calculateMatchPredictionPoints(2, 1, 2, 1)).toBe(3);
      expect(calculateMatchPredictionPoints(0, 0, 0, 0)).toBe(3);
    });

    it("should return 1 point for correct outcome with different score", () => {
      // Home win guessed but score different
      expect(calculateMatchPredictionPoints(3, 1, 2, 0)).toBe(1);
      // Away win guessed but score different
      expect(calculateMatchPredictionPoints(0, 2, 1, 3)).toBe(1);
      // Draw guessed but score different
      expect(calculateMatchPredictionPoints(1, 1, 2, 2)).toBe(1);
    });

    it("should return 0 points for incorrect outcome", () => {
      // Gained draw, actual home win
      expect(calculateMatchPredictionPoints(1, 1, 2, 1)).toBe(0);
      // Gained home win, actual away win
      expect(calculateMatchPredictionPoints(2, 0, 0, 1)).toBe(0);
    });
  });
});
