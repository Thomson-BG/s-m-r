/**
 * Audio Manager for Scotty Mason's Revenge
 * Handles music, sound effects, and audio controls
 */

class AudioManager {
    constructor() {
        this.isInitialized = false;
        this.masterVolume = 0.7;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.8;
        this.voiceVolume = 0.9;
        
        // Audio context
        this.audioContext = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.voiceGain = null;
        
        // Audio sources
        this.currentMusic = null;
        this.musicBuffer = null;
        this.soundBuffers = new Map();
        
        // Playing sounds
        this.playingSounds = new Set();
        this.musicSource = null;
        
        // Event system
        this.eventListeners = {};
        
        console.log('🔊 AudioManager initialized');
    }
    
    async initialize() {
        try {
            // Create audio context (user interaction required)
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create gain nodes
            this.masterGain = this.audioContext.createGain();
            this.musicGain = this.audioContext.createGain();
            this.sfxGain = this.audioContext.createGain();
            this.voiceGain = this.audioContext.createGain();
            
            // Connect gain nodes
            this.musicGain.connect(this.masterGain);
            this.sfxGain.connect(this.masterGain);
            this.voiceGain.connect(this.masterGain);
            this.masterGain.connect(this.audioContext.destination);
            
            // Set initial volumes
            this.updateVolumes();
            
            // Load audio assets
            await this.loadAudioAssets();
            
            this.isInitialized = true;
            console.log('✅ AudioManager ready');
            
        } catch (error) {
            console.warn('⚠️ AudioManager initialization failed:', error);
            // Continue without audio
        }
    }
    
    /**
     * Load audio assets
     */
    async loadAudioAssets() {
        // Generate procedural audio since we don't have audio files
        this.generateMenuMusic();
        this.generateGameMusic();
        this.generateSoundEffects();
        
        console.log('🎵 Audio assets loaded');
    }
    
    /**
     * Generate menu music procedurally
     */
    generateMenuMusic() {
        const duration = 30; // 30 seconds
        const sampleRate = 44100;
        const length = duration * sampleRate;
        
        const buffer = this.audioContext.createBuffer(2, length, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = buffer.getChannelData(channel);
            
            for (let i = 0; i < length; i++) {
                const time = i / sampleRate;
                
                // Create a dark, atmospheric theme
                const bass = Math.sin(2 * Math.PI * 55 * time) * 0.3;
                const melody = Math.sin(2 * Math.PI * 220 * time + Math.sin(time * 2)) * 0.2;
                const harmony = Math.sin(2 * Math.PI * 330 * time + Math.sin(time * 1.5)) * 0.15;
                const atmosphere = (Math.random() - 0.5) * 0.05;
                
                // Apply envelope
                const envelope = Math.max(0, 1 - Math.abs(Math.sin(time * 0.1)));
                
                channelData[i] = (bass + melody + harmony + atmosphere) * envelope * 0.5;
            }
        }
        
        this.soundBuffers.set('menuMusic', buffer);
    }
    
    /**
     * Generate game music procedurally
     */
    generateGameMusic() {
        const duration = 60; // 60 seconds
        const sampleRate = 44100;
        const length = duration * sampleRate;
        
        const buffer = this.audioContext.createBuffer(2, length, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = buffer.getChannelData(channel);
            
            for (let i = 0; i < length; i++) {
                const time = i / sampleRate;
                
                // Create an epic battle theme
                const bass = Math.sin(2 * Math.PI * 110 * time) * 0.4;
                const lead = Math.sin(2 * Math.PI * 440 * time + Math.sin(time * 3)) * 0.3;
                const percussion = (i % Math.floor(sampleRate * 0.5) < 100) ? 0.5 : 0;
                const strings = Math.sin(2 * Math.PI * 660 * time + Math.sin(time * 2)) * 0.2;
                
                // Apply dynamic envelope
                const envelope = 0.8 + Math.sin(time * 0.2) * 0.2;
                
                channelData[i] = (bass + lead + percussion + strings) * envelope * 0.4;
            }
        }
        
        this.soundBuffers.set('gameMusic', buffer);
    }
    
    /**
     * Generate sound effects
     */
    generateSoundEffects() {
        // Button click
        this.generateSound('buttonClick', 0.1, (time) => {
            return Math.sin(2 * Math.PI * 800 * time) * Math.exp(-time * 20);
        });
        
        // Unit selection
        this.generateSound('unitSelect', 0.2, (time) => {
            return Math.sin(2 * Math.PI * 600 * time) * Math.exp(-time * 10) * 0.5;
        });
        
        // Building placement
        this.generateSound('buildingPlace', 0.5, (time) => {
            const beep = Math.sin(2 * Math.PI * 1000 * time) * Math.exp(-time * 5);
            const bass = Math.sin(2 * Math.PI * 200 * time) * Math.exp(-time * 3);
            return (beep + bass) * 0.5;
        });
        
        // Weapon fire
        this.generateSound('weaponFire', 0.3, (time) => {
            const noise = (Math.random() - 0.5) * Math.exp(-time * 10);
            const pop = Math.sin(2 * Math.PI * 400 * time) * Math.exp(-time * 15);
            return (noise + pop) * 0.7;
        });
        
        // Explosion
        this.generateSound('explosion', 1.0, (time) => {
            const noise = (Math.random() - 0.5) * Math.exp(-time * 2);
            const rumble = Math.sin(2 * Math.PI * 60 * time) * Math.exp(-time * 1);
            const crack = Math.sin(2 * Math.PI * 2000 * time) * Math.exp(-time * 10);
            return (noise + rumble + crack) * 0.8;
        });
        
        // Construction complete
        this.generateSound('constructionComplete', 0.8, (time) => {
            const freq = 440 + Math.sin(time * 20) * 100;
            return Math.sin(2 * Math.PI * freq * time) * Math.exp(-time * 2) * 0.6;
        });
        
        // Low power warning
        this.generateSound('lowPower', 0.5, (time) => {
            const freq = 200 + Math.sin(time * 10) * 50;
            return Math.sin(2 * Math.PI * freq * time) * (1 - Math.exp(-time * 5)) * 0.4;
        });
        
        // Victory fanfare
        this.generateSound('victory', 3.0, (time) => {
            const melody = Math.sin(2 * Math.PI * (440 + Math.sin(time * 2) * 100) * time);
            const harmony = Math.sin(2 * Math.PI * (550 + Math.sin(time * 1.5) * 80) * time);
            const envelope = Math.min(1, time * 2) * Math.max(0, 1 - (time - 2) * 2);
            return (melody + harmony) * envelope * 0.5;
        });
        
        console.log('🎵 Sound effects generated');
    }
    
    /**
     * Generate a sound effect
     */
    generateSound(name, duration, waveFunction) {
        const sampleRate = 44100;
        const length = duration * sampleRate;
        const buffer = this.audioContext.createBuffer(1, length, sampleRate);
        const channelData = buffer.getChannelData(0);
        
        for (let i = 0; i < length; i++) {
            const time = i / sampleRate;
            channelData[i] = waveFunction(time);
        }
        
        this.soundBuffers.set(name, buffer);
    }
    
    /**
     * Play music
     */
    playMusic(musicName, loop = true) {
        if (!this.isInitialized) return;
        
        // Stop current music
        this.stopMusic();
        
        const buffer = this.soundBuffers.get(musicName);
        if (!buffer) {
            console.warn(`Music not found: ${musicName}`);
            return;
        }
        
        try {
            this.musicSource = this.audioContext.createBufferSource();
            this.musicSource.buffer = buffer;
            this.musicSource.loop = loop;
            this.musicSource.connect(this.musicGain);
            
            this.musicSource.start();
            this.currentMusic = musicName;
            
            console.log(`🎵 Playing music: ${musicName}`);
            
        } catch (error) {
            console.error('Error playing music:', error);
        }
    }
    
    /**
     * Stop music
     */
    stopMusic() {
        if (this.musicSource) {
            try {
                this.musicSource.stop();
            } catch (error) {
                // Ignore errors when stopping
            }
            this.musicSource = null;
            this.currentMusic = null;
        }
    }
    
    /**
     * Play sound effect
     */
    playSound(soundName, volume = 1.0) {
        if (!this.isInitialized) return null;
        
        const buffer = this.soundBuffers.get(soundName);
        if (!buffer) {
            console.warn(`Sound not found: ${soundName}`);
            return null;
        }
        
        try {
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = buffer;
            gainNode.gain.value = volume;
            
            source.connect(gainNode);
            gainNode.connect(this.sfxGain);
            
            source.start();
            this.playingSounds.add(source);
            
            // Clean up when sound ends
            source.onended = () => {
                this.playingSounds.delete(source);
            };
            
            return source;
            
        } catch (error) {
            console.error('Error playing sound:', error);
            return null;
        }
    }
    
    /**
     * Play positional sound (with distance/panning)
     */
    playPositionalSound(soundName, x, y, listenerX, listenerY, maxDistance = 500) {
        if (!this.isInitialized) return null;
        
        const distance = Math.sqrt((x - listenerX) ** 2 + (y - listenerY) ** 2);
        const volume = Math.max(0, 1 - distance / maxDistance);
        
        if (volume <= 0) return null;
        
        const source = this.playSound(soundName, volume);
        
        if (source && this.audioContext.createPanner) {
            try {
                const panner = this.audioContext.createPanner();
                panner.setPosition(x / 100, 0, y / 100); // Scale position
                panner.setOrientation(0, 0, -1);
                
                // Reconnect with panner
                source.disconnect();
                source.connect(panner);
                panner.connect(this.sfxGain);
                
            } catch (error) {
                console.warn('Positional audio not supported:', error);
            }
        }
        
        return source;
    }
    
    /**
     * Set master volume
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
        this.emit('volumeChanged', 'master', this.masterVolume);
    }
    
    /**
     * Set music volume
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
        this.emit('volumeChanged', 'music', this.musicVolume);
    }
    
    /**
     * Set SFX volume
     */
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
        this.emit('volumeChanged', 'sfx', this.sfxVolume);
    }
    
    /**
     * Set voice volume
     */
    setVoiceVolume(volume) {
        this.voiceVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
        this.emit('volumeChanged', 'voice', this.voiceVolume);
    }
    
    /**
     * Update all volume levels
     */
    updateVolumes() {
        if (!this.isInitialized) return;
        
        this.masterGain.gain.value = this.masterVolume;
        this.musicGain.gain.value = this.musicVolume;
        this.sfxGain.gain.value = this.sfxVolume;
        this.voiceGain.gain.value = this.voiceVolume;
    }
    
    /**
     * Mute all audio
     */
    mute() {
        this.setMasterVolume(0);
    }
    
    /**
     * Unmute audio
     */
    unmute() {
        this.setMasterVolume(0.7);
    }
    
    /**
     * Resume audio context (needed after user interaction)
     */
    async resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                console.log('🔊 Audio context resumed');
            } catch (error) {
                console.error('Failed to resume audio context:', error);
            }
        }
    }
    
    /**
     * Update audio system
     */
    update(deltaTime) {
        // Clean up finished sounds
        for (const source of this.playingSounds) {
            if (source.playbackState === source.FINISHED_STATE) {
                this.playingSounds.delete(source);
            }
        }
    }
    
    /**
     * Get volume settings
     */
    getVolumeSettings() {
        return {
            master: this.masterVolume,
            music: this.musicVolume,
            sfx: this.sfxVolume,
            voice: this.voiceVolume
        };
    }
    
    /**
     * Load volume settings
     */
    loadVolumeSettings(settings) {
        if (settings.master !== undefined) this.setMasterVolume(settings.master);
        if (settings.music !== undefined) this.setMusicVolume(settings.music);
        if (settings.sfx !== undefined) this.setSfxVolume(settings.sfx);
        if (settings.voice !== undefined) this.setVoiceVolume(settings.voice);
    }
    
    /**
     * Event system methods
     */
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }
    
    off(event, callback) {
        if (!this.eventListeners[event]) return;
        const index = this.eventListeners[event].indexOf(callback);
        if (index > -1) {
            this.eventListeners[event].splice(index, 1);
        }
    }
    
    emit(event, ...args) {
        if (!this.eventListeners[event]) return;
        this.eventListeners[event].forEach(callback => {
            try {
                callback(...args);
            } catch (error) {
                console.error(`Error in AudioManager event listener for ${event}:`, error);
            }
        });
    }
    
    /**
     * Cleanup
     */
    destroy() {
        this.stopMusic();
        
        for (const source of this.playingSounds) {
            try {
                source.stop();
            } catch (error) {
                // Ignore cleanup errors
            }
        }
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        console.log('🔊 AudioManager destroyed');
    }
}