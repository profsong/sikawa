import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

export function usePwaUpdate(canApply: boolean, autoApply: boolean, saving: RefObject<boolean>) {
  const [online, setOnline] = useState(navigator.onLine);
  const [visible, setVisible] = useState(document.visibilityState === 'visible');
  const [offlineReady, setOfflineReady] = useState(false);
  const [update, setUpdate] = useState<ServiceWorker | 'activated'>();
  const applyRequested = useRef(false);
  const reloading = useRef(false);

  useEffect(() => {
    const workers = import.meta.env.PROD ? navigator.serviceWorker : undefined;
    let registration: ServiceWorkerRegistration | undefined;
    let observed: ServiceWorker | null | undefined;
    const script = new URL(`${import.meta.env.BASE_URL}sw.js`, window.location.href);
    let activeWorker = workers?.controller?.scriptURL === script.href ? workers.controller : undefined;
    let checking = false;
    let disposed = false;

    function synchronize() {
      if (disposed || !registration) return;
      const { active, installing, waiting } = registration;
      const candidate = installing ?? waiting ?? active;
      if (observed !== candidate) {
        observed?.removeEventListener('statechange', synchronize);
        observed = candidate;
        observed?.addEventListener('statechange', synchronize);
      }

      if (active?.state === 'activated') {
        if (activeWorker && activeWorker !== active) setUpdate('activated');
        activeWorker = active;
        setOfflineReady(true);
      }
      setUpdate((current) => (current === 'activated' ? current : waiting ?? undefined));
    }

    async function checkForUpdate() {
      const connected = navigator.onLine;
      const foreground = document.visibilityState === 'visible';
      setOnline(connected);
      setVisible(foreground);
      if (!workers || !connected || !foreground || checking) return;
      synchronize();
      checking = true;
      try {
        if (!registration) {
          const current = await workers.register(script, {
            scope: import.meta.env.BASE_URL,
            updateViaCache: 'none',
          });
          if (disposed) return;
          registration = current;
          registration.addEventListener('updatefound', synchronize);
          synchronize();
        }
        if (!registration.installing && !registration.waiting) await registration.update();
      } catch {
        // A connection can appear online before it can reach the server. Retry on the next wake.
      } finally {
        checking = false;
        synchronize();
      }
    }

    window.addEventListener('online', checkForUpdate);
    window.addEventListener('offline', checkForUpdate);
    window.addEventListener('pageshow', checkForUpdate);
    window.addEventListener('focus', checkForUpdate);
    document.addEventListener('visibilitychange', checkForUpdate);
    workers?.addEventListener('controllerchange', synchronize);
    void checkForUpdate();

    return () => {
      disposed = true;
      observed?.removeEventListener('statechange', synchronize);
      registration?.removeEventListener('updatefound', synchronize);
      workers?.removeEventListener('controllerchange', synchronize);
      window.removeEventListener('online', checkForUpdate);
      window.removeEventListener('offline', checkForUpdate);
      window.removeEventListener('pageshow', checkForUpdate);
      window.removeEventListener('focus', checkForUpdate);
      document.removeEventListener('visibilitychange', checkForUpdate);
    };
  }, []);

  const applyUpdate = useCallback(() => {
    if (!canApply || saving.current || !online || !visible || reloading.current) return;
    if (update === 'activated') {
      reloading.current = true;
      window.location.reload();
    } else if (update?.state === 'installed') {
      update.postMessage({ type: 'SKIP_WAITING' });
      applyRequested.current = true;
    }
  }, [canApply, online, saving, update, visible]);

  useEffect(() => {
    if (autoApply || applyRequested.current) applyUpdate();
  }, [applyUpdate, autoApply]);

  return { online, offlineReady, updateReady: update !== undefined, applyUpdate };
}
