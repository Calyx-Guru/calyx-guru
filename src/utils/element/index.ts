import { Solar } from "lunar-javascript";

export const CHINESE_ELEMENT_TO_KEY: Record<string, ElementName> = {
  木: "wood",
  火: "fire",
  土: "earth",
  金: "metal",
  水: "water",
};

export function getElementByBirthDate(date: Date) {
  const eightChar = Solar.fromDate(date).getLunar().getEightChar();
  const yearNaYin = eightChar.getYearNaYin();
  const naYinElementChar = yearNaYin.charAt(yearNaYin.length - 1);
  const fromNaYin = CHINESE_ELEMENT_TO_KEY[naYinElementChar];

  if (fromNaYin) {
    return fromNaYin;
  }

  const dayWuXing = eightChar.getDayWuXing();

  return CHINESE_ELEMENT_TO_KEY[dayWuXing.charAt(0)] ?? "earth";
}
