import { hideAppSplash, setAppSplashVersion } from './app-splash';

describe('app splash', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="app-splash">
        <p data-app-version></p>
      </div>
    `;
  });

  it('sets the splash version text', () => {
    setAppSplashVersion('1.0', document);

    expect(document.querySelector('[data-app-version]')?.textContent).toBe('v1.0');
  });

  it('marks the splash as leaving and removes it after the transition', () => {
    vi.useFakeTimers();

    hideAppSplash(document);

    const splash = document.getElementById('app-splash');
    expect(splash?.classList.contains('app-splash--leaving')).toBe(true);

    vi.advanceTimersByTime(180);

    expect(document.getElementById('app-splash')).toBeNull();
    vi.useRealTimers();
  });
});
