import { useCallback, useEffect, useState } from 'react';
import { getIssues } from '../lib/api';
import { useSocket } from './useSocket';

export function useIssues(filters) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setIssues(await getIssues(filters));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters.category, filters.status, filters.sort]);

  useEffect(() => {
    load();
  }, [load]);

  useSocket({
    'issue:new': (issue) => {
      setIssues((current) => [issue, ...current.filter((item) => item.id !== issue.id)]);
    },
    'issue:upvoted': ({ id, upvoteCount }) => {
      setIssues((current) => current.map((item) => (item.id === id ? { ...item, upvoteCount } : item)));
    },
    'issue:statusChanged': ({ id, status }) => {
      setIssues((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
    }
  });

  return { issues, setIssues, loading, error, reload: load };
}
