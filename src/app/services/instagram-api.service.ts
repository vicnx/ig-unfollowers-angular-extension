import { Injectable } from '@angular/core';
import { FriendshipsPage, RawFriendshipUser, UserNode } from '../models/user.model';
import {
  DEFAULT_USERS_PER_SEARCH_CYCLE,
  INSTAGRAM_HOSTNAME,
  INSTAGRAM_WEB_APP_ID,
  WITHOUT_PROFILE_PICTURE_URL_IDS,
} from '../constants/instagram.constants';

@Injectable({
  providedIn: 'root',
})
export class InstagramApiService {
  private messageRequestId = 0;
  private pendingRequests = new Map<number, { resolve: (val: any) => void; reject: (err: any) => void }>();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'IU_API_RESPONSE') {
          const handler = this.pendingRequests.get(event.data.requestId);
          if (handler) {
            this.pendingRequests.delete(event.data.requestId);
            if (event.data.success) {
              handler.resolve(event.data.data);
            } else {
              handler.reject(new Error(event.data.error || 'Error en la petición a Instagram'));
            }
          }
        }
      });
    }
  }

  isLocalPreview(): boolean {
    if (typeof location === 'undefined') return false;
    return (
      location.hostname === 'localhost' ||
      location.hostname === '127.0.0.1' ||
      location.hostname === '::1' ||
      location.protocol === 'file:'
    );
  }

  getCookie(name: string): string | null {
    if (typeof document === 'undefined' || !document.cookie) return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()!.split(';').shift()!;
    }
    return null;
  }

  async getSessionInfo(): Promise<{ viewerId: string | null; csrfToken: string | null }> {
    // Check direct cookies first
    let viewerId = this.getCookie('ds_user_id');
    let csrfToken = this.getCookie('csrftoken');

    if (viewerId && csrfToken) {
      return { viewerId, csrfToken };
    }

    // If inside iframe, ask parent content script
    if (typeof window !== 'undefined' && window.parent !== window) {
      try {
        const response = await this.sendParentRequest('IU_GET_SESSION', {});
        return {
          viewerId: response?.viewerId || null,
          csrfToken: response?.csrfToken || null,
        };
      } catch (e) {
        console.warn('Could not retrieve cookies from parent window:', e);
      }
    }

    return { viewerId: null, csrfToken: null };
  }

  async fetchFriendshipsPage(
    kind: 'following' | 'followers',
    maxId?: string,
    count: number = DEFAULT_USERS_PER_SEARCH_CYCLE,
  ): Promise<FriendshipsPage> {
    if (this.isLocalPreview()) {
      return this.getMockFriendshipsPage(kind, maxId);
    }

    // In extension iframe: Delegate to Content Script for same-origin execution
    if (typeof window !== 'undefined' && window.parent !== window) {
      try {
        return await this.sendParentRequest('IU_FETCH_FRIENDSHIPS', {
          kind,
          maxId,
          count,
        });
      } catch (err) {
        console.warn('Parent delegation failed, attempting direct fetch:', err);
      }
    }

    // Fallback: Direct fetch
    const session = await this.getSessionInfo();
    const viewerId = session.viewerId;
    if (!viewerId) {
      throw new Error('No se detectó la sesión de Instagram. Asegúrate de haber iniciado sesión en instagram.com.');
    }

    let url = `https://${INSTAGRAM_HOSTNAME}/api/v1/friendships/${viewerId}/${kind}/?count=${count}`;
    if (maxId) {
      url += `&max_id=${encodeURIComponent(maxId)}`;
    }

    const response = await fetch(url, {
      credentials: 'same-origin',
      headers: {
        'X-IG-App-ID': INSTAGRAM_WEB_APP_ID,
      },
    });

    if (!response.ok) {
      throw new Error(`Instagram respondió con código HTTP ${response.status} al consultar ${kind}`);
    }

    return response.json();
  }

  async unfollowUser(userId: string): Promise<boolean> {
    if (this.isLocalPreview()) {
      await this.sleep(400);
      return true;
    }

    if (typeof window !== 'undefined' && window.parent !== window) {
      try {
        const result = await this.sendParentRequest('IU_UNFOLLOW_USER', { userId });
        return result.success;
      } catch (err) {
        console.warn('Parent delegation failed for unfollow, trying direct:', err);
      }
    }

    const session = await this.getSessionInfo();
    if (!session.csrfToken) {
      throw new Error('No se encontró el token de seguridad (csrftoken).');
    }

    const url = `https://${INSTAGRAM_HOSTNAME}/web/friendships/${userId}/unfollow/`;
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'x-csrftoken': session.csrfToken,
      },
    });

    return response.ok;
  }

  private sendParentRequest(action: string, payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestId = ++this.messageRequestId;
      this.pendingRequests.set(requestId, { resolve, reject });

      window.parent.postMessage(
        {
          type: 'IU_API_REQUEST',
          action,
          requestId,
          payload,
        },
        '*',
      );

      // Timeout safety (25s)
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error(`Timeout esperando respuesta de Instagram (${action})`));
        }
      }, 25000);
    });
  }

  rawFriendshipUserToUserNode(raw: RawFriendshipUser, followsViewer: boolean): UserNode {
    // Normalizar la URL de foto de perfil contemplando variantes del payload de Instagram
    let picUrl = raw.profile_pic_url || (raw as any).profile_pic_url_hd || (raw as any).hd_profile_pic_url_info?.url || '';
    if (picUrl && typeof picUrl === 'string') {
      picUrl = picUrl.replace(/\\\//g, '/');
    }

    return {
      id: String(raw.pk_id ?? raw.pk),
      username: raw.username,
      full_name: raw.full_name || '',
      profile_pic_url: picUrl,
      is_private: raw.is_private ?? false,
      is_verified: raw.is_verified ?? false,
      followed_by_viewer: true,
      requested_by_viewer: false,
      follows_viewer: followsViewer,
    };
  }

  isWithoutProfilePicture(user: UserNode): boolean {
    if (!user.profile_pic_url || user.profile_pic_url.trim() === '') return true;
    return WITHOUT_PROFILE_PICTURE_URL_IDS.some((id) => user.profile_pic_url.includes(id));
  }

  sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Mock data for preview / local development mode
  private getMockFriendshipsPage(kind: 'following' | 'followers', maxId?: string): FriendshipsPage {
    const mockUsers: RawFriendshipUser[] = [
      { pk: '101', username: 'alex.design', full_name: 'Alex Rivera', profile_pic_url: 'https://api.dicebear.com/9.x/initials/svg?seed=alex', is_verified: true, is_private: false },
      { pk: '102', username: 'studio_minimal', full_name: 'Studio Minimal', profile_pic_url: 'https://api.dicebear.com/9.x/initials/svg?seed=studio', is_verified: false, is_private: true },
      { pk: '103', username: 'lucia_gomez', full_name: 'Lucía Gómez', profile_pic_url: 'https://api.dicebear.com/9.x/initials/svg?seed=lucia', is_verified: false, is_private: false },
      { pk: '104', username: 'marco_photo', full_name: 'Marco Santos', profile_pic_url: 'https://api.dicebear.com/9.x/initials/svg?seed=marco', is_verified: true, is_private: false },
      { pk: '105', username: 'craft_coffee', full_name: 'Craft Coffee Lab', profile_pic_url: 'https://api.dicebear.com/9.x/initials/svg?seed=coffee', is_verified: false, is_private: true },
      { pk: '106', username: 'sofia.vlog', full_name: 'Sofía Valdés', profile_pic_url: 'https://api.dicebear.com/9.x/initials/svg?seed=sofia', is_verified: false, is_private: false },
      { pk: '107', username: 'tech_insider', full_name: 'Tech Insider', profile_pic_url: 'https://api.dicebear.com/9.x/initials/svg?seed=tech', is_verified: true, is_private: false },
      { pk: '108', username: 'nicolas_dev', full_name: 'Nicolás Morales', profile_pic_url: 'https://api.dicebear.com/9.x/initials/svg?seed=nico', is_verified: false, is_private: false },
      { pk: '109', username: 'urban_vibes', full_name: 'Urban Architecture', profile_pic_url: 'https://api.dicebear.com/9.x/initials/svg?seed=urban', is_verified: false, is_private: true },
      { pk: '110', username: 'diana_music', full_name: 'Diana Melodías', profile_pic_url: 'https://api.dicebear.com/9.x/initials/svg?seed=diana', is_verified: false, is_private: false },
    ];

    if (kind === 'followers') {
      // Return a subset (e.g., only accounts 101, 103, 106, 110 follow us back)
      return {
        users: mockUsers.filter((u) => ['101', '103', '106', '110'].includes(String(u.pk))),
        has_more: false,
      };
    }

    return {
      users: mockUsers,
      has_more: false,
    };
  }
}
