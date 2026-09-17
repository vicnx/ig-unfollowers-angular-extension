export interface ScanningFilter {
  showNonFollowers: boolean;
  showFollowers: boolean;
  showVerified: boolean;
  showPrivate: boolean;
  showWithOutProfilePicture: boolean;
}

export type ScanningTab = 'non_whitelisted' | 'whitelisted';

export interface UnfollowFilter {
  showSucceeded: boolean;
  showFailed: boolean;
}
