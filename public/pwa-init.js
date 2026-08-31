(function () {
  "use strict";

  let installPrompt;
  const installButton = document.querySelector("[data-install-app]");
  const installMessage = document.querySelector("[data-install-message]");
  const isAppleMobile = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;

  if (isAppleMobile && !isStandalone && installMessage) {
    installMessage.textContent = "On iPhone or iPad, tap Share, then Add to Home Screen.";
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("/service-worker.js").catch((error) => {
      console.warn("NumeRead offline support could not be enabled.", error);
    }));
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    if (installButton) installButton.hidden = false;
  });

  installButton?.addEventListener("click", async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      installButton.hidden = true;
      if (installMessage) installMessage.textContent = "NumeRead has been added to your device.";
    }
    installPrompt = undefined;
  });

  window.addEventListener("appinstalled", () => {
    if (installButton) installButton.hidden = true;
    if (installMessage) installMessage.textContent = "NumeRead is installed and ready to open from your home screen.";
  });
}());
