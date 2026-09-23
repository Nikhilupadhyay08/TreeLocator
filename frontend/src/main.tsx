import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { startOfflineQueueSync } from "./api/offline-queue";

createRoot(document.getElementById("root")!).render(<App />);

startOfflineQueueSync();

if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch((error) => {
			console.error("Failed to register service worker:", error);
		});
	});
}
