import * as CAREER from "@/assets/images/stories/career";
import * as FAMILY from "@/assets/images/stories/family";
import * as HEALTH from "@/assets/images/stories/health";
import * as LOVE from "@/assets/images/stories/love";
import * as WEALTH from "@/assets/images/stories/wealth";
import * as KAUCIM from "@/assets/videos/kau-cim";

import { KAUCIM_CONCERNS } from "@/types/UserState";

interface Illustration {
  omen: ImageModule[][];
  action: ImageModule[][];
  conclude: ImageModule[][];
}

export const VIDEOS = {
  opening: {
    bad: KAUCIM.BAD,
    good: KAUCIM.GOOD,
    normal: KAUCIM.NORMAL,
  },
};

export const ILLUSTRATIONS: Partial<
  Record<Lowercase<keyof typeof KAUCIM_CONCERNS>, Illustration>
> = {
  love: {
    omen: LOVE.OMENS,
    action: LOVE.ACTIONS,
    conclude: LOVE.CONCLUDES,
  },
  career: {
    omen: CAREER.OMENS,
    action: CAREER.ACTIONS,
    conclude: CAREER.CONCLUDES,
  },
  wealth: {
    omen: WEALTH.OMENS,
    action: WEALTH.ACTIONS,
    conclude: WEALTH.CONCLUDES,
  },
  family: {
    omen: FAMILY.OMENS,
    action: FAMILY.ACTIONS,
    conclude: FAMILY.CONCLUDES,
  },
  health: {
    omen: HEALTH.OMENS,
    action: HEALTH.ACTIONS,
    conclude: HEALTH.CONCLUDES,
  }
};
