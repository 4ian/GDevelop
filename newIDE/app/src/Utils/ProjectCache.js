// @flow

import { serializeToJSON } from './Serializer';

const CLOUD_PROJECT_AUTOSAVE_CACHE_KEY = 'gdevelop-cloud-project-autosave';

type ProjectCacheKey = {| userId: string, cloudProjectId: string |};

class ProjectCache {
  cachePromise: Promise<Cache> | null;

  static isAvailable() {
    return typeof window !== 'undefined' && 'caches' in window;
  }

  static async burst() {
    if (!ProjectCache.isAvailable()) return;
    await caches.delete(CLOUD_PROJECT_AUTOSAVE_CACHE_KEY);
  }

  static _stringifyCacheKey(cacheKey: ProjectCacheKey): string {
    return `${cacheKey.userId}/${cacheKey.cloudProjectId}`;
  }

  async _getCachedResponse(cacheKey: ProjectCacheKey) {
    if (!this.cachePromise)
      this.cachePromise = caches.open(CLOUD_PROJECT_AUTOSAVE_CACHE_KEY);
    const cache = await this.cachePromise;
    const key = ProjectCache._stringifyCacheKey(cacheKey);
    const cachedResponse = await cache.match(key);
    return cachedResponse;
  }

  async get(cacheKey: ProjectCacheKey): Promise<string | null> {
    const cachedResponse = await this._getCachedResponse(cacheKey);
    if (!cachedResponse) return null;
    const cachedResponseBody = await cachedResponse.text();
    const cachedSerializedProject = JSON.parse(cachedResponseBody).project;
    return cachedSerializedProject;
  }

  async getCreationDate(cacheKey: ProjectCacheKey): Promise<number | null> {
    const cachedResponse = await this._getCachedResponse(cacheKey);
    if (!cachedResponse) return null;
    const cachedResponseBody = await cachedResponse.text();
    const cacheCreationDate = JSON.parse(cachedResponseBody).createdAt;
    return cacheCreationDate;
  }

  async put(cacheKey: ProjectCacheKey, project: gdProject): Promise<void> {
    if (!this.cachePromise)
      this.cachePromise = caches.open(CLOUD_PROJECT_AUTOSAVE_CACHE_KEY);
    const cache = await this.cachePromise;
    const key = ProjectCache._stringifyCacheKey(cacheKey);

    cache.put(
      key,
      new Response(
        JSON.stringify({
          project: serializeToJSON(project),
          createdAt: Date.now(),
        })
      )
    );
  }
}

export default ProjectCache;
