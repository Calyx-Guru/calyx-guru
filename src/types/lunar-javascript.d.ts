// Type declarations for lunar-javascript
// Place this file at: src/types/lunar-javascript.d.ts (or any path in your tsconfig includes)

type ElementName = "water" | "fire" | "metal" | "earth" | "wood";

declare module "lunar-javascript" {
  // ─── Shared sub-types ────────────────────────────────────────────────────────

  /** A named/indexed object returned by getShuJiu, getFu, etc. */
  interface NameAndIndex {
    getName(): string;
    setName(name: string): void;
    getIndex(): number;
    setIndex(index: number): void;
    toString(): string;
    toFullString(): string;
  }

  /** A jie-qi entry returned by getNextJie / getCurrentJieQi etc. */
  interface JieQiInfo {
    getName(): string;
    getSolar(): SolarDate;
    setName(name: string): void;
    setSolar(solar: SolarDate): void;
    isJie(): boolean;
    isQi(): boolean;
    toString(): string;
  }

  // ─── Solar (阳历) ─────────────────────────────────────────────────────────────

  interface SolarDate {
    // Getters
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getMinute(): number;
    getSecond(): number;
    getWeek(): number; // 0=Sun … 6=Sat
    getWeekInChinese(): string;
    getSolarWeek(start: number): SolarWeek;
    isLeapYear(): boolean;

    // Festivals
    getFestivals(): string[];
    getOtherFestivals(): string[];

    // Star sign
    getXingzuo(): string;
    getXingZuo(): string;

    // Formatting
    toYmd(): string;
    toYmdHms(): string;
    toString(): string;
    toFullString(): string;

    // Navigation
    nextYear(years: number): SolarDate;
    nextMonth(months: number): SolarDate;
    nextDay(days: number): SolarDate;
    nextWorkday(days: number): SolarDate;
    next(days: number, onlyWorkday?: boolean): SolarDate;
    nextHour(hours: number): SolarDate;

    // Comparisons
    subtract(solar: SolarDate): number;
    subtractMinute(solar: SolarDate): number;
    isAfter(solar: SolarDate): boolean;
    isBefore(solar: SolarDate): boolean;

    // Salary / holiday
    getSalaryRate(): number; // 1=workday, 2=weekend/holiday, 3=statutory

    // Conversion
    getLunar(): LunarDate;
    getJulianDay(): number;
  }

  interface SolarStatic {
    /** Julian day number for J2000.0 epoch */
    readonly J2000: number;
    fromYmd(y: number, m: number, d: number): SolarDate;
    fromYmdHms(
      y: number,
      m: number,
      d: number,
      hour: number,
      minute: number,
      second: number,
    ): SolarDate;
    fromDate(date: Date): SolarDate;
    fromJulianDay(julianDay: number): SolarDate;
    /** Returns all Solar dates matching the given BaZi pillars */
    fromBaZi(
      yearGanZhi: string,
      monthGanZhi: string,
      dayGanZhi: string,
      timeGanZhi: string,
      sect?: number,
      baseYear?: number,
    ): SolarDate[];
  }

  // ─── Lunar (阴历) ─────────────────────────────────────────────────────────────

  interface LunarDate {
    // Basic fields
    getYear(): number;
    getMonth(): number; // negative = intercalary month
    getDay(): number;
    getHour(): number;
    getMinute(): number;
    getSecond(): number;

    // GanZhi indexes
    getTimeGanIndex(): number;
    getTimeZhiIndex(): number;
    getDayGanIndex(): number;
    getDayGanIndexExact(): number;
    getDayGanIndexExact2(): number;
    getDayZhiIndex(): number;
    getDayZhiIndexExact(): number;
    getDayZhiIndexExact2(): number;
    getMonthGanIndex(): number;
    getMonthGanIndexExact(): number;
    getMonthZhiIndex(): number;
    getMonthZhiIndexExact(): number;
    getYearGanIndex(): number;
    getYearGanIndexByLiChun(): number;
    getYearGanIndexExact(): number;
    getYearZhiIndex(): number;
    getYearZhiIndexByLiChun(): number;
    getYearZhiIndexExact(): number;

    // GanZhi strings
    getGan(): string;
    getZhi(): string;
    getYearGan(): string;
    getYearGanByLiChun(): string;
    getYearGanExact(): string;
    getYearZhi(): string;
    getYearZhiByLiChun(): string;
    getYearZhiExact(): string;
    getYearInGanZhi(): string;
    getYearInGanZhiByLiChun(): string;
    getYearInGanZhiExact(): string;

    getMonthGan(): string;
    getMonthGanExact(): string;
    getMonthZhi(): string;
    getMonthZhiExact(): string;
    getMonthInGanZhi(): string;
    getMonthInGanZhiExact(): string;

    getDayGan(): string;
    getDayGanExact(): string;
    getDayGanExact2(): string;
    getDayZhi(): string;
    getDayZhiExact(): string;
    getDayZhiExact2(): string;
    getDayInGanZhi(): string;
    getDayInGanZhiExact(): string;
    getDayInGanZhiExact2(): string;

    getTimeGan(): string;
    getTimeZhi(): string;
    getTimeInGanZhi(): string;

    // Shengxiao (zodiac)
    getShengxiao(): string;
    getYearShengXiao(): string;
    getYearShengXiaoByLiChun(): string;
    getYearShengXiaoExact(): string;
    getMonthShengXiao(): string;
    getMonthShengXiaoExact(): string;
    getDayShengXiao(): string;
    getTimeShengXiao(): string;

    // Chinese numerals
    getYearInChinese(): string;
    getMonthInChinese(): string;
    getDayInChinese(): string;

    // PengZu
    getPengZuGan(): string;
    getPengZuZhi(): string;

    // Position methods (day)
    getPositionXi(): string;
    getPositionXiDesc(): string;
    getPositionYangGui(): string;
    getPositionYangGuiDesc(): string;
    getPositionYinGui(): string;
    getPositionYinGuiDesc(): string;
    getPositionFu(sect?: number): string;
    getPositionFuDesc(sect?: number): string;
    getPositionCai(): string;
    getPositionCaiDesc(): string;

    getDayPositionXi(): string;
    getDayPositionXiDesc(): string;
    getDayPositionYangGui(): string;
    getDayPositionYangGuiDesc(): string;
    getDayPositionYinGui(): string;
    getDayPositionYinGuiDesc(): string;
    getDayPositionFu(sect?: number): string;
    getDayPositionFuDesc(sect?: number): string;
    getDayPositionCai(): string;
    getDayPositionCaiDesc(): string;

    // Position methods (time)
    getTimePositionXi(): string;
    getTimePositionXiDesc(): string;
    getTimePositionYangGui(): string;
    getTimePositionYangGuiDesc(): string;
    getTimePositionYinGui(): string;
    getTimePositionYinGuiDesc(): string;
    getTimePositionFu(sect?: number): string;
    getTimePositionFuDesc(sect?: number): string;
    getTimePositionCai(): string;
    getTimePositionCaiDesc(): string;

    // TaiSui positions
    getDayPositionTaiSui(sect?: number): string;
    getDayPositionTaiSuiDesc(sect?: number): string;
    getMonthPositionTaiSui(sect?: number): string;
    getMonthPositionTaiSuiDesc(sect?: number): string;
    getYearPositionTaiSui(sect?: number): string;
    getYearPositionTaiSuiDesc(sect?: number): string;

    // Chong / Sha
    getChong(): string;
    getChongGan(): string;
    getChongGanTie(): string;
    getChongShengXiao(): string;
    getChongDesc(): string;
    getSha(): string;

    getDayChong(): string;
    getDayChongGan(): string;
    getDayChongGanTie(): string;
    getDayChongShengXiao(): string;
    getDayChongDesc(): string;
    getDaySha(): string;

    getTimeChong(): string;
    getTimeChongGan(): string;
    getTimeChongGanTie(): string;
    getTimeChongShengXiao(): string;
    getTimeChongDesc(): string;
    getTimeSha(): string;

    // NaYin
    getYearNaYin(): string;
    getMonthNaYin(): string;
    getDayNaYin(): string;
    getTimeNaYin(): string;

    // Season / JieQi
    getSeason(): string;
    getJie(): string;
    getQi(): string;
    getJieQi(): string;
    getJieQiTable(): Record<string, SolarDate>;
    getJieQiList(): string[];

    getNextJie(wholeDay?: boolean): JieQiInfo | null;
    getPrevJie(wholeDay?: boolean): JieQiInfo | null;
    getNextQi(wholeDay?: boolean): JieQiInfo | null;
    getPrevQi(wholeDay?: boolean): JieQiInfo | null;
    getNextJieQi(wholeDay?: boolean): JieQiInfo | null;
    getPrevJieQi(wholeDay?: boolean): JieQiInfo | null;
    getCurrentJieQi(): JieQiInfo | null;
    getCurrentJie(): JieQiInfo | null;
    getCurrentQi(): JieQiInfo | null;

    // Week
    getWeek(): number;
    getWeekInChinese(): string;

    // Xiu / Zheng / Animal
    getXiu(): string;
    getXiuLuck(): string;
    getXiuSong(): string;
    getZheng(): string;
    getAnimal(): string;
    getGong(): string;
    getShou(): string;

    // Festivals
    getFestivals(): string[];
    getOtherFestivals(): string[];

    // BaZi (EightChar)
    getBaZi(): string[];
    getBaZiWuXing(): string[];
    getBaZiNaYin(): string[];
    getBaZiShiShenGan(): string[];
    getBaZiShiShenZhi(): string[];
    getBaZiShiShenYearZhi(): string[];
    getBaZiShiShenMonthZhi(): string[];
    getBaZiShiShenDayZhi(): string[];
    getBaZiShiShenTimeZhi(): string[];
    getEightChar(): EightChar;

    // ZhiXing / TianShen
    getZhiXing(): string;
    getDayTianShen(): string;
    getTimeTianShen(): string;
    getDayTianShenType(): string;
    getTimeTianShenType(): string;
    getDayTianShenLuck(): string;
    getTimeTianShenLuck(): string;

    // Tai position
    getDayPositionTai(): string;
    getMonthPositionTai(): string;

    // Yi / Ji
    getDayYi(sect?: number): string[];
    getDayJi(sect?: number): string[];
    getDayJiShen(): string[];
    getDayXiongSha(): string[];
    getTimeYi(): string[];
    getTimeJi(): string[];

    // YueXiang
    getYueXiang(): string;

    // NineStar
    getYearNineStar(sect?: number): NineStar;
    getMonthNineStar(sect?: number): NineStar;
    getDayNineStar(): NineStar;
    getTimeNineStar(): NineStar;

    // ShuJiu / Fu
    getShuJiu(): NameAndIndex | null;
    getFu(): NameAndIndex | null;

    // LiuYao / WuHou / Hou / DayLu
    getLiuYao(): string;
    getWuHou(): string;
    getHou(): string;
    getDayLu(): string;

    // Xun / XunKong
    getYearXun(): string;
    getMonthXun(): string;
    getDayXun(): string;
    getTimeXun(): string;
    getYearXunByLiChun(): string;
    getYearXunExact(): string;
    getMonthXunExact(): string;
    getDayXunExact(): string;
    getDayXunExact2(): string;

    getYearXunKong(): string;
    getMonthXunKong(): string;
    getDayXunKong(): string;
    getTimeXunKong(): string;
    getYearXunKongByLiChun(): string;
    getYearXunKongExact(): string;
    getMonthXunKongExact(): string;
    getDayXunKongExact(): string;
    getDayXunKongExact2(): string;

    // Navigation
    next(days: number): LunarDate;

    // Conversion
    getSolar(): SolarDate;
    getTime(): LunarTime;
    getTimes(): LunarTime[];
    getFoto(): Foto;
    getTao(): Tao;

    // String output
    toString(): string;
    toFullString(): string;
  }

  interface LunarStatic {
    fromYmd(y: number, m: number, d: number): LunarDate;
    fromYmdHms(
      y: number,
      m: number,
      d: number,
      hour: number,
      minute: number,
      second: number,
    ): LunarDate;
    fromSolar(solar: SolarDate): LunarDate;
    fromDate(date: Date): LunarDate;
  }

  // ─── SolarWeek ───────────────────────────────────────────────────────────────

  interface SolarWeekDate {
    getYear(): number;
    getMonth(): number;
    getIndex(): number;
    getStart(): number;
    toString(): string;
    toFullString(): string;
    next(weeks: number): SolarWeekDate;
    getFirstDay(): SolarDate;
    getDays(): SolarDate[];
    getFirstDayOfLine(): SolarDate;
  }

  interface SolarWeek {
    fromYmd(y: number, m: number, d: number, start: number): SolarWeekDate;
    fromDate(date: Date, start: number): SolarWeekDate;
  }

  // ─── SolarMonth ──────────────────────────────────────────────────────────────

  interface SolarMonthDate {
    getYear(): number;
    getMonth(): number;
    toString(): string;
    toFullString(): string;
    next(months: number): SolarMonthDate;
    getDays(): SolarDate[];
    getWeeks(start: number): SolarWeekDate[];
  }

  interface SolarMonth {
    fromYm(y: number, m: number): SolarMonthDate;
  }

  // ─── SolarSeason ─────────────────────────────────────────────────────────────

  interface SolarSeasonDate {
    getYear(): number;
    getSeason(): number;
    toString(): string;
    toFullString(): string;
    next(seasons: number): SolarSeasonDate;
    getMonths(): SolarMonthDate[];
  }

  interface SolarSeason {
    fromYm(y: number, m: number): SolarSeasonDate;
  }

  // ─── SolarHalfYear ───────────────────────────────────────────────────────────

  interface SolarHalfYearDate {
    getYear(): number;
    getSeason(): number;
    toString(): string;
    toFullString(): string;
    next(halfYears: number): SolarHalfYearDate;
    getMonths(): SolarMonthDate[];
  }

  interface SolarHalfYear {
    fromYm(y: number, m: number): SolarHalfYearDate;
  }

  // ─── SolarYear ───────────────────────────────────────────────────────────────

  interface SolarYearDate {
    getYear(): number;
    toString(): string;
    toFullString(): string;
    next(years: number): SolarYearDate;
    getMonths(): SolarMonthDate[];
  }

  interface SolarYear {
    fromYear(y: number): SolarYearDate;
  }

  // ─── LunarMonth ──────────────────────────────────────────────────────────────

  interface LunarMonthDate {
    getYear(): number;
    getMonth(): number;
    isLeap(): boolean;
    getDayCount(): number;
    getFirstJulianDay(): number;
    toString(): string;
    toFullString(): string;
    next(months: number): LunarMonthDate;
  }

  interface LunarMonth {
    fromYm(y: number, m: number): LunarMonthDate | null;
  }

  // ─── LunarYear ───────────────────────────────────────────────────────────────

  interface LunarYearDate {
    getYear(): number;
    getLeapMonth(): number;
    getDayCount(): number;
    getMonths(): LunarMonthDate[];
    getMonth(lunarMonth: number): LunarMonthDate | null;
    getJieQiJulianDays(): number[];
    toString(): string;
    toFullString(): string;
    next(years: number): LunarYearDate;
  }

  interface LunarYear {
    fromYear(y: number): LunarYearDate;
  }

  // ─── LunarTime ───────────────────────────────────────────────────────────────

  interface LunarTimeDate {
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getMinute(): number;
    getSecond(): number;
    getGanIndex(): number;
    getZhiIndex(): number;
    getGan(): string;
    getZhi(): string;
    getInGanZhi(): string;
    getShengXiao(): string;
    getPositionXi(): string;
    getPositionXiDesc(): string;
    getPositionYangGui(): string;
    getPositionYangGuiDesc(): string;
    getPositionYinGui(): string;
    getPositionYinGuiDesc(): string;
    getPositionFu(sect?: number): string;
    getPositionFuDesc(sect?: number): string;
    getPositionCai(): string;
    getPositionCaiDesc(): string;
    getNineStar(): NineStar;
    getXun(): string;
    getXunKong(): string;
    toString(): string;
    toFullString(): string;
  }

  interface LunarTime {
    fromYmdHms(
      y: number,
      m: number,
      d: number,
      hour: number,
      minute: number,
      second: number,
    ): LunarTimeDate;
  }

  // ─── NineStar ────────────────────────────────────────────────────────────────

  interface NineStarInfo {
    getIndex(): number;
    getNumber(): string;
    getColor(): string;
    getName(): string;
    getLuck(): string;
    getWuXing(): string;
    getYinYang(): string;
    getPosition(): string;
    getPositionDesc(): string;
    getBaShen(): string;
    toString(): string;
    toFullString(): string;
  }

  interface NineStar {
    fromIndex(index: number): NineStarInfo;
  }

  // ─── EightChar (八字) ─────────────────────────────────────────────────────────

  interface EightChar {
    getYear(): string;
    getMonth(): string;
    getDay(): string;
    getTime(): string;
    getYearWuXing(): string;
    getMonthWuXing(): string;
    getDayWuXing(): string;
    getTimeWuXing(): string;
    getYearNaYin(): string;
    getMonthNaYin(): string;
    getDayNaYin(): string;
    getTimeNaYin(): string;
    getYearShiShenGan(): string;
    getMonthShiShenGan(): string;
    getDayShiShenGan(): string;
    getTimeShiShenGan(): string;
    getYearShiShenZhi(): string[];
    getMonthShiShenZhi(): string[];
    getDayShiShenZhi(): string[];
    getTimeShiShenZhi(): string[];
    getYearDiShi(): string;
    getMonthDiShi(): string;
    getDayDiShi(): string;
    getTimeDiShi(): string;
    getSect(): number;
    getGong(): string;
    getMingGong(): string;
    getTaiYuan(): string;
    getMingBao(): string;
    getYun(maleFlag: number): Yun;
    getLunar(): LunarDate;
    toString(): string;
    toFullString(): string;
    fromLunar(lunar: LunarDate): EightChar;
    fromSolar(solar: SolarDate, sect?: number): EightChar;
  }

  // ─── Yun (大运) ───────────────────────────────────────────────────────────────

  interface DaYun {
    getIndex(): number;
    getStartYear(): number;
    getEndYear(): number;
    getStartAge(): number;
    getEndAge(): number;
    getStartSolar(): SolarDate;
    getEndSolar(): SolarDate;
    getGanIndex(): number;
    getZhiIndex(): number;
    getGan(): string;
    getZhi(): string;
    getInGanZhi(): string;
    getNineStar(): NineStarInfo;
    getLiuNian(): LiuNian[];
    toString(): string;
    toFullString(): string;
  }

  interface LiuNian {
    getIndex(): number;
    getYear(): number;
    getAge(): number;
    getGanIndex(): number;
    getZhiIndex(): number;
    getGan(): string;
    getZhi(): string;
    getInGanZhi(): string;
    getNineStar(): NineStarInfo;
    getLiuYue(): LiuYue[];
    toString(): string;
    toFullString(): string;
  }

  interface LiuYue {
    getIndex(): number;
    getMonthInChinese(): string;
    getGanIndex(): number;
    getZhiIndex(): number;
    getGan(): string;
    getZhi(): string;
    getInGanZhi(): string;
    getNineStar(): NineStarInfo;
    toString(): string;
    toFullString(): string;
  }

  interface Yun {
    getMaleFlag(): number;
    getStartYear(): number;
    getStartMonth(): number;
    getStartDay(): number;
    getStartAge(): number;
    getStartSolar(): SolarDate;
    getDaYun(): DaYun[];
  }

  // ─── Foto (佛历) ──────────────────────────────────────────────────────────────

  interface FotoDate {
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    toString(): string;
    toFullString(): string;
    getFestivals(): string[];
    next(days: number): FotoDate;
    getLunar(): LunarDate;
    fromLunar(lunar: LunarDate): FotoDate;
    fromYmd(y: number, m: number, d: number): FotoDate;
  }

  interface Foto {
    fromLunar(lunar: LunarDate): FotoDate;
    fromYmd(y: number, m: number, d: number): FotoDate;
  }

  // ─── Tao (道历) ───────────────────────────────────────────────────────────────

  interface TaoDate {
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    toString(): string;
    toFullString(): string;
    getFestivals(): string[];
    next(days: number): TaoDate;
    getLunar(): LunarDate;
  }

  interface Tao {
    fromLunar(lunar: LunarDate): TaoDate;
    fromYmd(y: number, m: number, d: number): TaoDate;
  }

  // ─── HolidayUtil ─────────────────────────────────────────────────────────────

  interface Holiday {
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    isWork(): boolean;
    getName(): string;
    getTarget(): string;
    toString(): string;
  }

  interface HolidayUtil {
    getHoliday(year: number, month: number, day: number): Holiday | null;
    getHolidays(year: number): Holiday[];
    getHolidaysByYm(year: number, month: number): Holiday[];
  }

  // ─── SolarUtil ───────────────────────────────────────────────────────────────

  interface SolarUtil {
    readonly WEEK: string[];
    readonly XINGZUO: string[];
    readonly FESTIVAL: Record<string, string>;
    readonly WEEK_FESTIVAL: Record<string, string>;
    readonly OTHER_FESTIVAL: Record<string, string[]>;
    isLeapYear(year: number): boolean;
    getDaysOfMonth(year: number, month: number): number;
    getDaysOfYear(year: number): number;
    getDaysBetween(
      y1: number,
      m1: number,
      d1: number,
      y2: number,
      m2: number,
      d2: number,
    ): number;
    getWeeksOfMonth(year: number, month: number, start: number): number;
  }

  // ─── LunarUtil ───────────────────────────────────────────────────────────────

  interface LunarUtil {
    readonly GAN: string[];
    readonly ZHI: string[];
    readonly SHENGXIAO: string[];
    readonly NUMBER: string[];
    readonly MONTH: string[];
    readonly DAY: string[];
    readonly SEASON: string[];
    readonly JIE_QI: string[];
    readonly JIE_QI_IN_USE: string[];
    readonly WEEK: string[];
    readonly XINGZUO: string[];
    readonly NAYIN: Record<string, string>;
    readonly SHA: Record<string, string>;
    readonly POSITION_XI: string[];
    readonly POSITION_YANG_GUI: string[];
    readonly POSITION_YIN_GUI: string[];
    readonly POSITION_FU: string[];
    readonly POSITION_FU_2: string[];
    readonly POSITION_CAI: string[];
    readonly POSITION_TAI_SUI_YEAR: string[];
    readonly POSITION_GAN: string[];
    readonly POSITION_DESC: Record<string, string>;
    readonly CHONG: string[];
    readonly CHONG_GAN: string[];
    readonly CHONG_GAN_TIE: string[];
    readonly PENGZU_GAN: string[];
    readonly PENGZU_ZHI: string[];
    readonly LIU_YAO: string[];
    readonly HOU: string[];
    readonly WU_HOU: string[];
    readonly TIAN_SHEN: string[];
    readonly TIAN_SHEN_TYPE: Record<string, string>;
    readonly TIAN_SHEN_TYPE_LUCK: Record<string, string>;
    readonly ZHI_TIAN_SHEN_OFFSET: Record<string, number>;
    readonly ZHI_XING: string[];
    readonly XIU: Record<string, string>;
    readonly XIU_LUCK: Record<string, string>;
    readonly XIU_SONG: Record<string, string>;
    readonly ZHENG: Record<string, string>;
    readonly ANIMAL: Record<string, string>;
    readonly GONG: Record<string, string>;
    readonly SHOU: Record<string, string>;
    readonly FESTIVAL: Record<string, string>;
    readonly OTHER_FESTIVAL: Record<string, string[]>;
    readonly YUE_XIANG: string[];
    readonly LU: Record<string, string>;
    readonly POSITION_TAI_DAY: string[];
    readonly POSITION_TAI_MONTH: string[];
    readonly BASE_MONTH_ZHI_INDEX: number;
    getJiaZiIndex(ganZhi: string): number;
    getXun(ganZhi: string): string;
    getXunKong(ganZhi: string): string;
    getDayYi(monthGanZhi: string, dayGanZhi: string): string[];
    getDayJi(monthGanZhi: string, dayGanZhi: string): string[];
    getDayJiShen(monthZhiIndex: number, dayGanZhi: string): string[];
    getDayXiongSha(monthZhiIndex: number, dayGanZhi: string): string[];
    getTimeYi(dayGanZhi: string, timeGanZhi: string): string[];
    getTimeJi(dayGanZhi: string, timeGanZhi: string): string[];
    getTimeZhiIndex(hm: string): number;
    index(target: string, arr: string[], defaultValue?: number): number;
    find(
      target: string,
      arr: { index: number; name: string }[],
    ): { index: number; name: string } | null;
  }

  // ─── FotoUtil / TaoUtil ──────────────────────────────────────────────────────

  interface FotoUtil {
    readonly FESTIVAL: Record<string, string>;
    readonly OTHER_FESTIVAL: Record<string, string[]>;
  }

  interface TaoUtil {
    readonly FESTIVAL: Record<string, string>;
    readonly OTHER_FESTIVAL: Record<string, string[]>;
  }

  // ─── NineStarUtil ────────────────────────────────────────────────────────────

  interface NineStarUtil {
    readonly NUMBER: string[];
    readonly COLOR: string[];
    readonly WU_XING: string[];
    readonly POSITION: string[];
    readonly LUCK: string[];
    readonly YIN_YANG: string[];
    readonly BA_SHEN: string[];
    readonly NAME: string[];
  }

  // ─── I18n ─────────────────────────────────────────────────────────────────────

  interface I18n {
    getLanguage(): string;
    setLanguage(lang: string): void;
    getMessage(key: string): string;
  }

  // ─── Exports ─────────────────────────────────────────────────────────────────

  export const Solar: SolarStatic;
  export const Lunar: LunarStatic;
  export const Foto: Foto;
  export const Tao: Tao;
  export const NineStar: NineStar;
  export const EightChar: EightChar;
  export const SolarWeek: SolarWeek;
  export const SolarMonth: SolarMonth;
  export const SolarSeason: SolarSeason;
  export const SolarHalfYear: SolarHalfYear;
  export const SolarYear: SolarYear;
  export const LunarMonth: LunarMonth;
  export const LunarYear: LunarYear;
  export const LunarTime: LunarTime;
  export const HolidayUtil: HolidayUtil;
  export const SolarUtil: SolarUtil;
  export const LunarUtil: LunarUtil;
  export const FotoUtil: FotoUtil;
  export const TaoUtil: TaoUtil;
  export const NineStarUtil: NineStarUtil;
  export const I18n: I18n;
}
