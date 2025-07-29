/**
 * Service Worker for Scotty Mason's Revenge
 * Enables offline gameplay and caching
 */

const CACHE_NAME = 'scotty-masons-revenge-v1.0.0';
const CACHE_FILES = [
    '/',
    '/index.html',
    '/css/main.css',
    '/css/ui.css',
    '/js/main.js',
    '/js/core/GameEngine.js',
    '/js/core/ResourceManager.js',
    '/js/core/AudioManager.js',
    '/js/core/InputManager.js',
    '/js/core/Renderer.js',
    '/js/systems/UnitManager.js',
    '/js/systems/BuildingManager.js',
    '/js/systems/FactionManager.js',
    '/js/systems/CampaignManager.js',
    '/js/game/GameObject.js',
    '/js/game/Unit.js',
    '/js/game/Building.js',
    '/js/ui/UIManager.js',
    '/js/utils/Utils.js',
    '/userguide.md',
    '/README_WEB.md'
];

/**
 * Install event - cache all files
 */
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Service Worker: Caching files...');
                return cache.addAll(CACHE_FILES);
            })
            .then(() => {
                console.log('✅ Service Worker: Installation complete');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Service Worker: Installation failed', error);
            })
    );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
    console.log('🔄 Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker: Activation complete');
                return self.clients.claim();
            })
    );
});

/**
 * Fetch event - serve cached files or fetch from network
 */
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip non-HTTP requests
    if (!event.request.url.startsWith('http')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Return cached version if available
                if (cachedResponse) {
                    console.log('📁 Service Worker: Serving from cache:', event.request.url);
                    return cachedResponse;
                }
                
                // Otherwise fetch from network
                console.log('🌐 Service Worker: Fetching from network:', event.request.url);
                return fetch(event.request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response before caching
                        const responseClone = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseClone);
                            });
                        
                        return response;
                    })
                    .catch((error) => {
                        console.error('❌ Service Worker: Network fetch failed', error);
                        
                        // Return offline page or cached fallback if available
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                        
                        throw error;
                    });
            })
    );
});

/**
 * Message event - handle commands from main thread
 */
self.addEventListener('message', (event) => {
    console.log('📨 Service Worker: Received message:', event.data);
    
    switch (event.data.command) {
        case 'skipWaiting':
            self.skipWaiting();
            break;
            
        case 'clearCache':
            caches.delete(CACHE_NAME)
                .then(() => {
                    console.log('🗑️ Service Worker: Cache cleared');
                    event.ports[0].postMessage({ success: true });
                })
                .catch((error) => {
                    console.error('❌ Service Worker: Failed to clear cache', error);
                    event.ports[0].postMessage({ success: false, error: error.message });
                });
            break;
            
        case 'getCacheSize':
            getCacheSize()
                .then((size) => {
                    event.ports[0].postMessage({ size: size });
                })
                .catch((error) => {
                    event.ports[0].postMessage({ error: error.message });
                });
            break;
            
        default:
            console.warn('🤷 Service Worker: Unknown command:', event.data.command);
    }
});

/**
 * Get cache size for diagnostics
 */
async function getCacheSize() {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    
    let totalSize = 0;
    
    for (const key of keys) {
        const response = await cache.match(key);
        if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
        }
    }
    
    return {
        files: keys.length,
        totalBytes: totalSize,
        totalMB: Math.round(totalSize / (1024 * 1024) * 100) / 100
    };
}

/**
 * Background sync for save games (future feature)
 */
self.addEventListener('sync', (event) => {
    console.log('🔄 Service Worker: Background sync:', event.tag);
    
    if (event.tag === 'save-game') {
        event.waitUntil(
            // Sync save games to cloud storage (if implemented)
            syncSaveGames()
        );
    }
});

/**
 * Push notifications (future feature)
 */
self.addEventListener('push', (event) => {
    console.log('📢 Service Worker: Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New game update available!',
        icon: '/assets/icon-192.png',
        badge: '/assets/badge-72.png',
        tag: 'game-notification',
        actions: [
            {
                action: 'play',
                title: 'Play Now',
                icon: '/assets/play-icon.png'
            },
            {
                action: 'dismiss',
                title: 'Later',
                icon: '/assets/dismiss-icon.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Scotty Mason\'s Revenge', options)
    );
});

/**
 * Notification click handler
 */
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Service Worker: Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'play') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

/**
 * Placeholder for save game sync (future implementation)
 */
async function syncSaveGames() {
    console.log('💾 Service Worker: Syncing save games...');
    // Implementation would sync with cloud storage
    return Promise.resolve();
}

console.log('🎮 Service Worker: Scotty Mason\'s Revenge loaded');
console.log('📦 Service Worker: Cache name:', CACHE_NAME);
console.log('📁 Service Worker: Files to cache:', CACHE_FILES.length);