(() => {
  'use strict';
  const button = document.getElementById('pwaInstall');
  if (!button) return;
  const standalone = window.matchMedia('(display-mode: standalone)');
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let deferredPrompt = null;
  let installed = false;
  let requesting = false;
  const isInstalled = () => installed || standalone.matches || navigator.standalone === true;
  const refresh = () => {
    button.hidden = isInstalled() || requesting || (!deferredPrompt && !isIOS);
  };
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    if (isInstalled()) return;
    deferredPrompt = event;
    refresh();
  });
  window.addEventListener('appinstalled', () => {
    installed = true;
    deferredPrompt = null;
    refresh();
  });
  if (standalone.addEventListener) standalone.addEventListener('change', refresh);
  else if (standalone.addListener) standalone.addListener(refresh);
  window.addEventListener('pageshow', refresh);
  button.addEventListener('click', async () => {
    if (isInstalled() || requesting) return;
    if (!deferredPrompt) {
      if (isIOS) window.alert('Para instalar o Catira.com no iPhone ou iPad: abra no Safari, toque em Compartilhar e escolha “Adicionar à Tela de Início”.');
      return;
    }
    const prompt = deferredPrompt;
    deferredPrompt = null;
    requesting = true;
    refresh();
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice && choice.outcome === 'accepted') installed = true;
    } catch {
      // The browser may revoke an installation prompt. Wait for a fresh event.
    } finally {
      requesting = false;
      refresh();
    }
  });
  refresh();
  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('/pwa-sw.js').catch(() => {
      // Installation is optional; marketplace remains available.
    });
  }
})();
