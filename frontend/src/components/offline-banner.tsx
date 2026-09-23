import { useEffect, useState } from "react";
import { getOfflineQueueCount, flushOfflineQueue, subscribeOfflineQueue } from "@/api/offline-queue";
import { Button } from "@/components/ui/button";

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [queueCount, setQueueCount] = useState(getOfflineQueueCount());
  const [canInstall, setCanInstall] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeOfflineQueue(() => {
      setQueueCount(getOfflineQueueCount());
      setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    });

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    const handleInstalled = () => {
      setInstallPrompt(null);
      setCanInstall(false);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && queueCount === 0 && !canInstall) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl rounded-2xl border border-border bg-background/95 backdrop-blur px-4 py-3 shadow-2xl shadow-black/10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {!isOnline ? "Offline mode active" : queueCount > 0 ? "Sync waiting" : "Install TreeTrack India"}
          </p>
          <p className="text-xs text-muted-foreground">
            {!isOnline
              ? "You can keep filling forms offline. They will sync automatically when the connection returns."
              : queueCount > 0
                ? `${queueCount} action${queueCount === 1 ? "" : "s"} queued and will sync when the connection is restored.`
                : "Install the app on your device for field-friendly offline access."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {queueCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                void flushOfflineQueue();
              }}
            >
              Sync now
            </Button>
          )}
          {canInstall && installPrompt && (
            <Button
              size="sm"
              onClick={async () => {
                await installPrompt.prompt();
                setCanInstall(false);
                setInstallPrompt(null);
              }}
            >
              Install app
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void> | void;
};
