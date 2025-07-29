# 🚀 Deployment Guide - Scotty Mason's Revenge

This guide explains how to deploy the web-based version of Scotty Mason's Revenge to various hosting platforms.

## 📋 Prerequisites

- All game files (HTML, CSS, JS, assets)
- A web server or hosting service
- Basic understanding of web deployment

## 🏠 Local Development

### Method 1: Python HTTP Server
```bash
# Navigate to game directory
cd scotty-masons-revenge

# Start server (Python 3)
python3 -m http.server 8000

# Or use the provided script
./start-server.sh
```

### Method 2: Node.js HTTP Server
```bash
# Install http-server globally
npm install -g http-server

# Start server
http-server -p 8000

# With CORS enabled
http-server -p 8000 --cors
```

### Method 3: PHP Built-in Server
```bash
php -S localhost:8000
```

## 🌐 Web Hosting Platforms

### GitHub Pages (Free)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy web game"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to repository Settings
   - Scroll to "Pages" section
   - Select source: "Deploy from branch"
   - Choose branch: `main`
   - Choose folder: `/ (root)`

3. **Access your game**:
   - URL: `https://yourusername.github.io/repository-name`

### Netlify (Free Tier Available)

1. **Drag & Drop Deployment**:
   - Visit [netlify.com](https://netlify.com)
   - Drag your game folder to the deploy area
   - Get instant live URL

2. **Git Integration**:
   - Connect your GitHub repository
   - Automatic deployments on push
   - Custom domain support

3. **Configuration** (optional `netlify.toml`):
   ```toml
   [build]
     publish = "."
   
   [[headers]]
     for = "/*"
     [headers.values]
       X-Frame-Options = "DENY"
       X-XSS-Protection = "1; mode=block"
   ```

### Vercel (Free Tier Available)

1. **CLI Deployment**:
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Git Integration**:
   - Import project from GitHub
   - Automatic deployments
   - Edge network distribution

### Firebase Hosting (Free Tier Available)

1. **Setup**:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   ```

2. **Configuration** (`firebase.json`):
   ```json
   {
     "hosting": {
       "public": ".",
       "ignore": [
         "firebase.json",
         "**/.*",
         "**/node_modules/**"
       ],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

3. **Deploy**:
   ```bash
   firebase deploy
   ```

### Surge.sh (Free)

1. **Install and deploy**:
   ```bash
   npm install -g surge
   surge
   ```

2. **Custom domain**:
   ```bash
   surge --domain your-game-name.surge.sh
   ```

## 🔧 Server Configuration

### Apache (.htaccess)
```apache
# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>

# Security headers
Header always set X-Frame-Options DENY
Header always set X-Content-Type-Options nosniff
Header always set X-XSS-Protection "1; mode=block"
```

### Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/game;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    # Cache static assets
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Fallback to index.html for SPA
    try_files $uri $uri/ /index.html;
}
```

## 📱 PWA Configuration

### Web App Manifest (manifest.json)
```json
{
  "name": "Scotty Mason's Revenge",
  "short_name": "SMR",
  "description": "Real-Time Strategy Game",
  "start_url": "/",
  "display": "fullscreen",
  "orientation": "landscape",
  "theme_color": "#ff0000",
  "background_color": "#000000",
  "icons": [
    {
      "src": "assets/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "assets/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker Registration
Already included in `js/main.js`:
```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

## 🔍 SEO Optimization

### Meta Tags (add to index.html)
```html
<meta name="description" content="Scotty Mason's Revenge - Real-Time Strategy Game inspired by Command & Conquer">
<meta name="keywords" content="RTS, strategy game, command and conquer, real-time strategy">
<meta name="author" content="Thomson Innovations">

<!-- Open Graph -->
<meta property="og:title" content="Scotty Mason's Revenge">
<meta property="og:description" content="Real-Time Strategy Game">
<meta property="og:type" content="website">
<meta property="og:url" content="https://your-domain.com">
<meta property="og:image" content="https://your-domain.com/assets/cover-art.png">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Scotty Mason's Revenge">
<meta name="twitter:description" content="Real-Time Strategy Game">
<meta name="twitter:image" content="https://your-domain.com/assets/cover-art.png">
```

## 🚀 Performance Optimization

### Pre-deployment Checklist
- [ ] Minify CSS and JavaScript files
- [ ] Optimize images (PNG/JPEG compression)
- [ ] Enable gzip compression
- [ ] Set appropriate cache headers
- [ ] Test on multiple browsers
- [ ] Verify mobile responsiveness
- [ ] Check loading times
- [ ] Test offline functionality

### Build Script (optional)
```bash
#!/bin/bash
echo "🏗️ Building Scotty Mason's Revenge..."

# Create build directory
mkdir -p build

# Copy files
cp index.html build/
cp -r css build/
cp -r js build/
cp -r assets build/
cp userguide.md build/
cp sw.js build/

# Minify CSS (if you have a minifier)
# cssmin css/main.css > build/css/main.min.css

# Minify JS (if you have a minifier)
# jsmin js/main.js > build/js/main.min.js

echo "✅ Build complete! Files ready in 'build' directory"
```

## 🔧 Troubleshooting

### Common Issues

**CORS Errors**:
- Serve from HTTP server, not file:// protocol
- Enable CORS headers on server
- Use `--cors` flag with http-server

**Service Worker Issues**:
- Must be served over HTTPS (or localhost)
- Clear browser cache when updating
- Check console for registration errors

**Mobile Issues**:
- Test viewport meta tag
- Verify touch controls work
- Check performance on slower devices

**Caching Problems**:
- Update service worker cache version
- Clear browser cache during development
- Use hard refresh (Ctrl+F5)

## 📊 Analytics (Optional)

### Google Analytics
```html
<!-- Add to index.html head -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Simple Analytics
```html
<script async defer src="https://scripts.simpleanalyticscdn.com/latest.js"></script>
<noscript><img src="https://queue.simpleanalyticscdn.com/noscript.gif" alt="" referrerpolicy="no-referrer-when-downgrade" /></noscript>
```

## 🎯 Domain Setup

### Custom Domain
1. Purchase domain from registrar
2. Point DNS to hosting provider
3. Configure SSL certificate
4. Update any hardcoded URLs

### Subdomain Setup
```
game.yourdomain.com -> hosting provider
```

## 📈 Monitoring

### Uptime Monitoring
- UptimeRobot (free tier)
- Pingdom
- StatusCake

### Error Tracking
- Sentry (free tier)
- LogRocket
- Bugsnag

### Performance Monitoring
- Google PageSpeed Insights
- GTmetrix
- WebPageTest

## 🔐 Security

### HTTPS
- Always use HTTPS in production
- Free certificates from Let's Encrypt
- Automatic HTTPS with Netlify/Vercel

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
```

## 📝 Post-Deployment

### Testing Checklist
- [ ] Game loads correctly
- [ ] All features work
- [ ] Save/load functions
- [ ] Audio plays properly
- [ ] Mobile compatibility
- [ ] Cross-browser testing
- [ ] Performance metrics
- [ ] SEO verification

### Launch Preparation
- [ ] Create social media accounts
- [ ] Prepare press materials
- [ ] Set up analytics
- [ ] Monitor for issues
- [ ] Gather user feedback

---

**Your game is now ready for the world! 🎮🌍**

For support with deployment, check the hosting provider's documentation or contact their support team.