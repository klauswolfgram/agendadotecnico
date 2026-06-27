const SPLASH_ID = 'app-splash';
const LEAVING_CLASS = 'app-splash--leaving';
const TRANSITION_MS = 180;

export const setAppSplashVersion = (version: string, doc: Document = document) => {
  const versionElement = doc.querySelector('[data-app-version]');

  if (versionElement) {
    versionElement.textContent = `v${version}`;
  }
};

export const hideAppSplash = (doc: Document = document) => {
  const splash = doc.getElementById(SPLASH_ID);

  if (!splash) return;

  splash.classList.add(LEAVING_CLASS);
  window.setTimeout(() => splash.remove(), TRANSITION_MS);
};
