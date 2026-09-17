import { Timings } from '../models/timings.model';

export const INSTAGRAM_HOSTNAME = 'www.instagram.com';
export const UNFOLLOWERS_PER_PAGE = 50;
export const INSTAGRAM_WEB_APP_ID = '936619743392459';

export const FOLLOWING_PAGE_SAFETY_LIMIT = 60;
export const FOLLOWERS_PAGE_SAFETY_LIMIT = 250;

export const DEFAULT_TIME_BETWEEN_SEARCH_CYCLES = 1000;
export const DEFAULT_TIME_TO_WAIT_AFTER_FIVE_SEARCH_CYCLES = 10000;
export const DEFAULT_TIME_BETWEEN_UNFOLLOWS = 4000;
export const DEFAULT_TIME_TO_WAIT_AFTER_FIVE_UNFOLLOWS = 300000; // 5 mins
export const DEFAULT_USERS_PER_SEARCH_CYCLE = 50;

export const DEFAULT_TIMINGS: Timings = {
  timeBetweenSearchCycles: DEFAULT_TIME_BETWEEN_SEARCH_CYCLES,
  timeToWaitAfterFiveSearchCycles: DEFAULT_TIME_TO_WAIT_AFTER_FIVE_SEARCH_CYCLES,
  timeBetweenUnfollows: DEFAULT_TIME_BETWEEN_UNFOLLOWS,
  timeToWaitAfterFiveUnfollows: DEFAULT_TIME_TO_WAIT_AFTER_FIVE_UNFOLLOWS,
  usersPerSearchCycle: DEFAULT_USERS_PER_SEARCH_CYCLE,
};

export const WITHOUT_PROFILE_PICTURE_URL_IDS = [
  '44884218_345707102882519_2446069589734326272_n',
  '464760996_1254146839119862_3605321457742435801_n',
];

export const STORAGE_KEYS = {
  WHITELIST: 'iu_whitelisted_results',
  TIMINGS: 'iu_timings',
  LAST_SCAN: 'iu_last_scan',
  THEME: 'iu_theme',
  WELCOME_SEEN: 'iu_welcome_seen',
};
