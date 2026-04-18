import * as LOVE from "@/assets/images/stories/love";
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
};
