/**
 *  Game Develop JS Platform
 *  2013 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * A soundManager manages the sound channels of a scene.
 *
 * @class soundManager
 */
gdjs.soundManager = function()
{
    /**
     * A wrapper around an Audio object.
     * @private
     */
    sound = function(soundFile) {
        var that = {};
        var my = {};
        
        that.audio = new Audio(soundFile || "");
        my.volume = 100;
        
        that.setVolume = function(volume, globalVolume) {
            my.volume = volume;
            that.updateVolume(globalVolume);
        }
        
        that.updateVolume = function(globalVolume) {
            that.audio.volume = my.volume/100*globalVolume/100;
        }
        
        that.getVolume = function() {
            return my.volume;
        }
        
        that.hasEnded = function() {
            return !that.audio.loop && that.audio.currentTime == that.audio.duration;
        }
    
        return that;
    }

    var that = {};
    var my = {};
    
    my.sounds = [];
    my.musics = [];
    my.freeSounds = []; //Sounds without an assigned channel.
    my.freeMusics = []; //Musics without an assigned channel.
    my.globalVolume = 100;
    
    my.getRecyledResource = function(arr) {
    
        //Try to recycle an old sound.
        for(var i = 0, len = arr.length;i<len;++i) {
            if (arr[i] != null && arr[i].hasEnded() ) {
                return arr[i];
            }
        }
        
        theSound = sound();
        arr.push(theSound);
        return theSound;
    }
    
    that.playSound = function(soundFile, loop, volume, pitch) {
        var theSound = my.getRecyledResource(my.freeSounds);
        
        theSound.audio.src = soundFile;
        theSound.audio.loop = loop;
        theSound.setVolume(volume, my.globalVolume);
        theSound.audio.play();
    }
    
    that.playSoundOnChannel = function(soundFile, channel, loop, volume, pitch) {
        if ( my.sounds[channel] == null ) {
            my.sounds[channel] = sound();
        }
        
        var theSound = my.sounds[channel];
        
        theSound.audio.src = soundFile;
        theSound.audio.loop = loop;
        theSound.setVolume(volume, my.globalVolume);
        theSound.audio.play();
    }
    
    that.stopSoundOnChannel = function(channel) {
        var theSound = my.sounds[channel];
        if ( theSound != null ) theSound.stop();
    }
    
    that.pauseSoundOnChannel = function(channel) {
        var theSound = my.sounds[channel];
        if ( theSound != null ) theSound.pause();
    }
    
    that.continueSoundOnChannel = function(channel) {
        var theSound = my.sounds[channel];
        if ( theSound != null ) theSound.play();
    }
    
    that.playMusic = function(soundFile, loop, volume, pitch) {
        var theMusic = getRecyledResource(my.freeMusics);
        
        theMusic.audio.src = soundFile;
        theMusic.audio.loop = loop;
        theMusic.setVolume(volume, my.globalVolume);
        theMusic.audio.play();
    }
    
    that.playMusicOnChannel = function(soundFile, channel, loop, volume, pitch) {
        if ( my.musics[channel] == null ) {
            my.musics[channel] = sound();
        }
        
        var theMusic = my.musics[channel];
        
        theMusic.audio.src = soundFile;
        theMusic.audio.loop = loop;
        theMusic.setVolume(volume, my.globalVolume);
        theMusic.audio.play();
    }
    
    that.stopMusicOnChannel = function(channel) {
        var theMusic = my.musics[channel];
        if ( theMusic != null ) theMusic.stop();
    }
    
    that.pauseMusicOnChannel = function(channel) {
        var theMusic = my.musics[channel];
        if ( theMusic != null ) theMusic.pause();
    }
    
    that.continueMusicOnChannel = function(channel) {
        var theMusic = my.musics[channel];
        if ( theMusic != null ) theMusic.play();
    }
    
    that.setGlobalVolume = function(volume) {
        my.globalVolume = volume;
        
        //Update the volumes of sounds.
        for(var i = 0, len = my.freeSounds.length;i<len;++i) {
            if ( my.freeSounds[i] != null ) {
                my.freeSounds[i].updateVolume(my.globalVolume);
            }
        }
        for(var i = 0, len = my.freeMusics.length;i<len;++i) {
            if ( my.freeMusics[i] != null ) {
                my.freeMusics[i].updateVolume(my.globalVolume);
            }
        }
        for(var i = 0, len = my.sounds.length;i<len;++i) {
            if ( my.sounds[i] != null ) {
                my.sounds[i].updateVolume(my.globalVolume);
            }
        }
        for(var i = 0, len = my.musics.length;i<len;++i) {
            if ( my.musics[i] != null ) {
                my.musics[i].updateVolume(my.globalVolume);
            }
        }
    }
    
    that.getGlobalVolume = function() {
        return my.globalVolume;
    }
    
    
    return that;
}
    

/**
 * Module used by events to interact with the soundManager.
 * @module gdjs.soundTools
 * @private
 */
gdjs.soundTools = gdjs.soundTools || {};

gdjs.soundTools.playSound = function(runtimeScene, soundFile, loop, volume, pitch) {
    runtimeScene.getSoundManager().playSound(soundFile, loop, volume, pitch);
}

gdjs.soundTools.playSoundOnChannel = function(runtimeScene, soundFile, channel, loop, volume, pitch) {
    runtimeScene.getSoundManager().playSoundOnChannel(soundFile, channel, loop, volume, pitch);
}

gdjs.soundTools.stopSoundOnChannel = function(runtimeScene, soundFile, channel, loop, volume, pitch) {
    runtimeScene.getSoundManager().stopSoundOnChannel(channel);
}

gdjs.soundTools.pauseSoundOnChannel = function(runtimeScene, soundFile, channel, loop, volume, pitch) {
    runtimeScene.getSoundManager().pauseSoundOnChannel(channel);
}

gdjs.soundTools.continueSoundOnChannel = function(runtimeScene, soundFile, channel, loop, volume, pitch) {
    runtimeScene.getSoundManager().continueSoundOnChannel(channel);
}

gdjs.soundTools.playMusic = function(runtimeScene, soundFile, loop, volume, pitch) {
    runtimeScene.getSoundManager().playMusic(soundFile, loop, volume, pitch);
}

gdjs.soundTools.playMusicOnChannel = function(runtimeScene, soundFile, channel, loop, volume, pitch) {
    runtimeScene.getSoundManager().playMusicOnChannel(soundFile, channel, loop, volume, pitch);
}

gdjs.soundTools.stopMusicOnChannel = function(runtimeScene, soundFile, channel, loop, volume, pitch) {
    runtimeScene.getSoundManager().stopMusicOnChannel(channel);
}

gdjs.soundTools.pauseMusicOnChannel = function(runtimeScene, soundFile, channel, loop, volume, pitch) {
    runtimeScene.getSoundManager().pauseMusicOnChannel(channel);
}

gdjs.soundTools.continueMusicOnChannel = function(runtimeScene, soundFile, channel, loop, volume, pitch) {
    runtimeScene.getSoundManager().continueMusicOnChannel(channel);
}

gdjs.soundTools.getGlobalVolume = function(runtimeScene) {
    runtimeScene.getSoundManager().getGlobalVolume();
}

gdjs.soundTools.setGlobalVolume = function(runtimeScene, globalVolume) {
    runtimeScene.getSoundManager().setGlobalVolume(globalVolume);
}