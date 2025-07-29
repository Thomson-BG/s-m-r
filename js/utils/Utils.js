/**
 * Utility functions for Scotty Mason's Revenge
 */

/**
 * Math utilities
 */
const MathUtils = {
    /**
     * Clamp value between min and max
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    
    /**
     * Linear interpolation
     */
    lerp(a, b, t) {
        return a + (b - a) * t;
    },
    
    /**
     * Distance between two points
     */
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    /**
     * Angle between two points
     */
    angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },
    
    /**
     * Normalize angle to 0-2π range
     */
    normalizeAngle(angle) {
        while (angle < 0) angle += Math.PI * 2;
        while (angle >= Math.PI * 2) angle -= Math.PI * 2;
        return angle;
    },
    
    /**
     * Random integer between min and max (inclusive)
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * Random float between min and max
     */
    randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    /**
     * Check if point is inside rectangle
     */
    pointInRect(px, py, rx, ry, rw, rh) {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    },
    
    /**
     * Check if two rectangles overlap
     */
    rectsOverlap(r1x, r1y, r1w, r1h, r2x, r2y, r2w, r2h) {
        return !(r1x + r1w < r2x || r2x + r2w < r1x || r1y + r1h < r2y || r2y + r2h < r1y);
    }
};

/**
 * Color utilities
 */
const ColorUtils = {
    /**
     * Convert hex to RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },
    
    /**
     * Convert RGB to hex
     */
    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },
    
    /**
     * Interpolate between two colors
     */
    lerpColor(color1, color2, t) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);
        
        if (!c1 || !c2) return color1;
        
        const r = Math.round(MathUtils.lerp(c1.r, c2.r, t));
        const g = Math.round(MathUtils.lerp(c1.g, c2.g, t));
        const b = Math.round(MathUtils.lerp(c1.b, c2.b, t));
        
        return this.rgbToHex(r, g, b);
    },
    
    /**
     * Darken color by percentage
     */
    darken(color, percent) {
        const rgb = this.hexToRgb(color);
        if (!rgb) return color;
        
        const factor = 1 - (percent / 100);
        return this.rgbToHex(
            Math.round(rgb.r * factor),
            Math.round(rgb.g * factor),
            Math.round(rgb.b * factor)
        );
    },
    
    /**
     * Lighten color by percentage
     */
    lighten(color, percent) {
        const rgb = this.hexToRgb(color);
        if (!rgb) return color;
        
        const factor = percent / 100;
        return this.rgbToHex(
            Math.round(rgb.r + (255 - rgb.r) * factor),
            Math.round(rgb.g + (255 - rgb.g) * factor),
            Math.round(rgb.b + (255 - rgb.b) * factor)
        );
    }
};

/**
 * String utilities
 */
const StringUtils = {
    /**
     * Capitalize first letter
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    
    /**
     * Convert camelCase to Title Case
     */
    camelToTitle(str) {
        return str.replace(/([A-Z])/g, ' $1').replace(/^./, (match) => match.toUpperCase());
    },
    
    /**
     * Convert snake_case to Title Case
     */
    snakeToTitle(str) {
        return str.split('_').map(word => this.capitalize(word)).join(' ');
    },
    
    /**
     * Format number with thousands separators
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    
    /**
     * Format time in MM:SS format
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    },
    
    /**
     * Generate random ID
     */
    generateId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
};

/**
 * Array utilities
 */
const ArrayUtils = {
    /**
     * Shuffle array in place
     */
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },
    
    /**
     * Get random element from array
     */
    randomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    },
    
    /**
     * Remove element from array
     */
    remove(array, element) {
        const index = array.indexOf(element);
        if (index > -1) {
            array.splice(index, 1);
        }
        return array;
    },
    
    /**
     * Group array elements by key
     */
    groupBy(array, keyFn) {
        return array.reduce((groups, item) => {
            const key = keyFn(item);
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
            return groups;
        }, {});
    },
    
    /**
     * Find element with maximum value
     */
    maxBy(array, valueFn) {
        if (array.length === 0) return null;
        
        return array.reduce((max, item) => {
            return valueFn(item) > valueFn(max) ? item : max;
        });
    },
    
    /**
     * Find element with minimum value
     */
    minBy(array, valueFn) {
        if (array.length === 0) return null;
        
        return array.reduce((min, item) => {
            return valueFn(item) < valueFn(min) ? item : min;
        });
    }
};

/**
 * DOM utilities
 */
const DOMUtils = {
    /**
     * Create element with attributes and content
     */
    createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else {
                element.setAttribute(key, value);
            }
        });
        
        if (content) {
            element.innerHTML = content;
        }
        
        return element;
    },
    
    /**
     * Remove all child elements
     */
    clearChildren(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    },
    
    /**
     * Get element position relative to page
     */
    getElementPosition(element) {
        const rect = element.getBoundingClientRect();
        return {
            x: rect.left + window.scrollX,
            y: rect.top + window.scrollY,
            width: rect.width,
            height: rect.height
        };
    },
    
    /**
     * Check if element is visible in viewport
     */
    isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= window.innerHeight &&
            rect.right <= window.innerWidth
        );
    }
};

/**
 * Storage utilities
 */
const StorageUtils = {
    /**
     * Save data to localStorage with error handling
     */
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            return false;
        }
    },
    
    /**
     * Load data from localStorage with error handling
     */
    load(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return defaultValue;
        }
    },
    
    /**
     * Remove item from localStorage
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Failed to remove from localStorage:', error);
            return false;
        }
    },
    
    /**
     * Clear all localStorage data
     */
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
            return false;
        }
    },
    
    /**
     * Get localStorage usage info
     */
    getUsage() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return {
            used: total,
            remaining: 5242880 - total, // 5MB typical limit
            percentage: (total / 5242880) * 100
        };
    }
};

/**
 * Performance utilities
 */
const PerformanceUtils = {
    /**
     * Simple performance timer
     */
    timer() {
        const start = performance.now();
        return {
            end() {
                return performance.now() - start;
            }
        };
    },
    
    /**
     * Debounce function calls
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Throttle function calls
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    /**
     * Request animation frame with fallback
     */
    requestFrame(callback) {
        if (window.requestAnimationFrame) {
            return window.requestAnimationFrame(callback);
        } else {
            return setTimeout(callback, 16);
        }
    },
    
    /**
     * Cancel animation frame with fallback
     */
    cancelFrame(id) {
        if (window.cancelAnimationFrame) {
            window.cancelAnimationFrame(id);
        } else {
            clearTimeout(id);
        }
    }
};

/**
 * Audio utilities
 */
const AudioUtils = {
    /**
     * Generate tone data
     */
    generateTone(frequency, duration, sampleRate = 44100) {
        const samples = duration * sampleRate;
        const buffer = new Float32Array(samples);
        
        for (let i = 0; i < samples; i++) {
            const time = i / sampleRate;
            buffer[i] = Math.sin(2 * Math.PI * frequency * time);
        }
        
        return buffer;
    },
    
    /**
     * Generate noise data
     */
    generateNoise(duration, sampleRate = 44100) {
        const samples = duration * sampleRate;
        const buffer = new Float32Array(samples);
        
        for (let i = 0; i < samples; i++) {
            buffer[i] = (Math.random() - 0.5) * 2;
        }
        
        return buffer;
    },
    
    /**
     * Apply envelope to audio buffer
     */
    applyEnvelope(buffer, attack, decay, sustain, release) {
        const length = buffer.length;
        const attackSamples = Math.floor(length * attack);
        const decaySamples = Math.floor(length * decay);
        const releaseSamples = Math.floor(length * release);
        const sustainSamples = length - attackSamples - decaySamples - releaseSamples;
        
        for (let i = 0; i < length; i++) {
            let envelope = 1;
            
            if (i < attackSamples) {
                // Attack phase
                envelope = i / attackSamples;
            } else if (i < attackSamples + decaySamples) {
                // Decay phase
                const decayProgress = (i - attackSamples) / decaySamples;
                envelope = 1 - decayProgress * (1 - sustain);
            } else if (i < attackSamples + decaySamples + sustainSamples) {
                // Sustain phase
                envelope = sustain;
            } else {
                // Release phase
                const releaseProgress = (i - attackSamples - decaySamples - sustainSamples) / releaseSamples;
                envelope = sustain * (1 - releaseProgress);
            }
            
            buffer[i] *= envelope;
        }
        
        return buffer;
    }
};

// Export utilities
if (typeof window !== 'undefined') {
    window.Utils = {
        Math: MathUtils,
        Color: ColorUtils,
        String: StringUtils,
        Array: ArrayUtils,
        DOM: DOMUtils,
        Storage: StorageUtils,
        Performance: PerformanceUtils,
        Audio: AudioUtils
    };
}

console.log('🔧 Utility functions loaded');