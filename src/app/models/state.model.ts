import { UserNode } from './user.model';

export type AppStatus = 'initial' | 'scanning' | 'unfollowing' | 'completed';

export interface UnfollowLogEntry {
  user: UserNode;
  unfollowedSuccessfully: boolean;
  timestamp: number;
  errorMessage?: string;
}
