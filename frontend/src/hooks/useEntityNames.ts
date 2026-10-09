import { useEffect, useMemo, useState } from 'react';
import { gateway } from '../api/gateway';

export type EntityType = 'student' | 'teacher' | 'class' | 'subject';
type Entity = { _id: string; firstName?: string; lastName?: string; name?: string; section?: string; authUserId?: string; userId?: string | null };

const cache = new Map<EntityType, Map<string, string>>();
const endpoints: Record<EntityType, string> = { student: '/students', teacher: '/teachers', class: '/classes', subject: '/subjects' };

function displayName(type: EntityType, entity: Entity): string {
  if (type === 'class') return (entity.name ?? 'Unknown') + ' - ' + (entity.section ?? 'Unknown');
  return [entity.firstName, entity.lastName].filter(Boolean).join(' ') || entity.name || 'Unknown';
}

export function useEntityNames(idsByType: Partial<Record<EntityType, string[]>>, token: string) {
  const [loading, setLoading] = useState<Set<EntityType>>(new Set());
  const requested = useMemo(() => (Object.entries(idsByType) as [EntityType, string[]][]).flatMap(([type, ids]) => [...new Set(ids)].map((id) => type + ':' + id)).sort().join('|'), [idsByType]);

  useEffect(() => {
    const missing = (Object.entries(idsByType) as [EntityType, string[]][]).filter(([type, ids]) => ids.some((id) => !cache.get(type)?.has(id)));
    if (!missing.length) return;
    setLoading(new Set(missing.map(([type]) => type)));
    void Promise.all(missing.map(async ([type]) => {
      const entities = await gateway<Entity[]>(endpoints[type], {}, token);
      const names = cache.get(type) ?? new Map<string, string>();
      entities.forEach((entity) => {
        const name = displayName(type, entity);
        names.set(entity._id, name);
        if (type === 'teacher' && entity.authUserId) names.set(entity.authUserId, name);
        if (type === 'teacher' && entity.userId) names.set(entity.userId, name);
      });
      cache.set(type, names);
    })).finally(() => setLoading(new Set()));
  }, [requested, token]);

  function resolve(type: EntityType, id?: string) {
    if (!id) return '—';
    return cache.get(type)?.get(id) ?? (loading.has(type) ? id : 'Unknown');
  }

  return { resolve };
}
