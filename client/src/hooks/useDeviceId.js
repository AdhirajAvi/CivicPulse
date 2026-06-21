import { useMemo } from 'react';
import { getDeviceId } from '../lib/deviceId';

export function useDeviceId() {
  return useMemo(() => getDeviceId(), []);
}
