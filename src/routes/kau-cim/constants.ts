import { LOVE_ACTIONS, LOVE_CONCLUDES, LOVE_VERDICTS } from "@/assets/images/stories/love";
import * as KAUCIM from "@/assets/videos/kau-cim";
import { KAUCIM_CONCERNS } from "@/types/UserState";

export const VIDEOS = {
  opening: {
    bad: KAUCIM.BAD,
    good: KAUCIM.GOOD,
    normal: KAUCIM.NORMAL,
  },
};

export const ILLUSTRATIONS: { [key in KAUCIM_CONCERNS]?: { verdict: ImageModule[][]; action: ImageModule[][]; conclude: ImageModule[][] } } = {
  love: {
    verdict: LOVE_VERDICTS,
    action: LOVE_ACTIONS,
    conclude: LOVE_CONCLUDES,
  }
}
