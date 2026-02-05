// Service Worker Laser Fit - Version optimisée pour PWA Builder
const CACHE_NAME = "laserfit-v11";

// Liste complète des assets - tous les fichiers existent
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./qrcode.min.js",
  "./icon_192.png",
  "./icon_512.png",
  "./animations/step-up.gif",
  "./animations/pompes.gif",
  "./animations/saut-corde.gif",
  "./animations/jumping-jack.gif",
  "./animations/sauts-lateraux.gif",
  "./animations/fentes-laterales.gif",
  "./animations/fentes-avant.gif",
  "./animations/montees-genoux.gif",
  "./animations/mountain-climber.gif",
  "./animations/planche-militaire.gif",
  "./animations/squats.gif",
  "./animations/burpees.gif",
  "./animations/aller-retours.gif"
];

// INSTALL - Mise en cache avec gestion d'erreurs robuste
self.addEventListener("install", (event) => {
  console.log('[SW v9] 🔧 Installation...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW v9] 📦 Ouverture du cache:', CACHE_NAME);
        
        // Stratégie robuste : mise en cache individuelle avec gestion d'erreurs
        return Promise.all(
          ASSETS.map((url) => {
            return cache.add(url).catch((error) => {
              console.warn('[SW v9] ⚠️ Échec mise en cache de:', url, error);
              // Continue même si un fichier échoue
              return Promise.resolve();
            });
          })
        );
      })
      .then(() => {
        console.log('[SW v9] ✅ Installation terminée');
        return self.skipWaiting(); // Active immédiatement
      })
      .catch((error) => {
        console.error('[SW v9] ❌ Erreur installation:', error);
        throw error;
      })
  );
});

// ACTIVATE - Nettoyage des anciens caches
self.addEventListener("activate", (event) => {
  console.log('[SW v9] 🔄 Activation...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW v9] 🗑️ Suppression ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW v9] ✅ Activation terminée');
        return self.clients.claim(); // Prend contrôle immédiatement
      })
      .catch((error) => {
        console.error('[SW v9] ❌ Erreur activation:', error);
      })
  );
});

// FETCH - Stratégie Cache First avec fallback réseau
self.addEventListener("fetch", (event) => {
  // Ignorer les requêtes non-GET et les requêtes externes
  if (event.request.method !== 'GET' || 
      !event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Trouvé en cache - servir immédiatement
          return cachedResponse;
        }
        
        // Pas en cache - fetch depuis le réseau
        return fetch(event.request)
          .then((networkResponse) => {
            // Vérifier que la réponse est valide
            if (!networkResponse || 
                networkResponse.status !== 200 || 
                networkResponse.type === 'error') {
              return networkResponse;
            }
            
            // Cloner la réponse (on peut la lire qu'une seule fois)
            const responseToCache = networkResponse.clone();
            
            // Mettre en cache pour les prochaines fois
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              })
              .catch((error) => {
                console.warn('[SW v9] ⚠️ Échec mise en cache dynamique:', error);
              });
            
            return networkResponse;
          })
          .catch((error) => {
            console.error('[SW v9] ❌ Erreur fetch:', event.request.url, error);
            
            // Fallback : retourner une réponse par défaut si nécessaire
            // (pour l'instant, propager l'erreur)
            throw error;
          });
      })
  );
});

// MESSAGE - Permet de forcer la mise à jour du SW
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW v9] ⚡ Activation forcée');
    self.skipWaiting();
  }
});

console.log('[SW v9] 🚀 Service Worker chargé');
