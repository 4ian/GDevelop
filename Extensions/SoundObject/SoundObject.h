/**

Sound Object Extension
Copyright (c) 2011-2012 Thomas Flecy

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/
#ifndef SoundObject_H
#define SoundObject_H

#include "GDCpp/Object.h"
#include "GDCpp/RuntimeObject.h"
#include <SFML/Audio/Sound.hpp>
#include <SFML/Audio/Music.hpp>
#include <SFML/Audio/SoundBuffer.hpp>
class RuntimeScene;
namespace gd { class ImageManager; }
namespace gd { class InitialInstance; }
class SoundWrapperBase;
#if defined(GD_IDE_ONLY)
namespace sf
{
    class Texture;
    class Sprite;
};
class wxBitmap;
class wxWindow;
namespace gd { class Project; }
namespace gd { class MainFrameWrapper; }
namespace gd { class ArbitraryResourceWorker; }
namespace gd { class PropertyDescriptor; }
#endif

enum SoundObjectType
{
    Sound,
    Music
};

class GD_EXTENSION_API SoundObject : public gd::Object
{
public :

    SoundObject(std::string name_);
    virtual ~SoundObject() {};
    virtual gd::Object * Clone() const { return new SoundObject(*this);}

    #if defined(GD_IDE_ONLY)
    virtual void DrawInitialInstance(gd::InitialInstance & instance, sf::RenderTarget & renderTarget, gd::Project & project, gd::Layout & layout);
    virtual void ExposeResources(gd::ArbitraryResourceWorker & worker);
    virtual bool GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail) const;
    static void LoadEdittimeIcon();

    virtual void EditObject( wxWindow* parent, gd::Project & game_, gd::MainFrameWrapper & mainFrameWrapper_ );
    virtual std::map<std::string, gd::PropertyDescriptor> GetInitialInstanceProperties(const gd::InitialInstance & position, gd::Project & game, gd::Layout & scene);
    virtual bool UpdateInitialInstanceProperty(gd::InitialInstance & position, const std::string & name, const std::string & value, gd::Project & game, gd::Layout & scene);
    #endif

    float GetZPos() const { return zPos; };
    void SetZPos(float zpos_) { zPos = zpos_; };

    void SetSoundFileName(const std::string & soundfilename) { fileName = soundfilename; };
    const std::string & GetSoundFileName() const { return fileName; };

    void SetSoundType(const std::string & type_) {type = type_;};
    const std::string & GetSoundType() const { return type; };

    void SetVolume(float volume_) { volume = volume_; };
    float GetVolume() const { return volume; };

    void SetAttenuation(float attenuation_) { attenuation = attenuation_; };
    float GetAttenuation() const { return attenuation; };

    void SetMinDistance(float minDist_) { minDist = minDist_; };
    float GetMinDistance() const { return minDist; };

    void SetLooping(bool enable) { loop = enable;  };
    bool IsLooping() const { return loop; };

    void SetPitch(float pitch_) { pitch = pitch_; };
    float GetPitch() const { return pitch; };

private:
    std::string fileName;
    std::string type;
    float zPos;
    float volume;
    float attenuation;
    float minDist;
    bool loop;
    float pitch;

    #if defined(GD_IDE_ONLY)
    static sf::Texture soundIcon;
    static sf::Sprite soundSprite;
    #endif

    virtual void DoUnserializeFrom(gd::Project & project, const gd::SerializerElement & element);
    #if defined(GD_IDE_ONLY)
    virtual void DoSerializeTo(gd::SerializerElement & element) const;
    #endif
};

class GD_EXTENSION_API RuntimeSoundObject : public RuntimeObject
{
public :

    RuntimeSoundObject(RuntimeScene & scene, const gd::Object & object);
    RuntimeSoundObject(const RuntimeSoundObject & other);
    RuntimeSoundObject & operator=(const RuntimeSoundObject & other);
    virtual ~RuntimeSoundObject();
    virtual RuntimeSoundObject * Clone() const { return new RuntimeSoundObject(*this);}

    virtual bool ExtraInitializationFromInitialInstance(const gd::InitialInstance & position);

    #if defined(GD_IDE_ONLY)
    virtual void GetPropertyForDebugger (unsigned int propertyNb, std::string & name, std::string & value) const;
    virtual bool ChangeProperty(unsigned int propertyNb, std::string newValue);
    virtual unsigned int GetNumberOfProperties() const;
    #endif

    virtual void OnPositionChanged();

    void SetSoundType(const std::string & type_);
    const std::string & GetSoundType() const;

    void SetSoundFileName(const std::string & soundfilename);
    const std::string & GetSoundFileName() const { return fileName; };

    bool ReloadSound(const RuntimeScene &scene);

    bool IsPlaying() const;
    bool IsPaused() const;
    bool IsStopped() const;

    void Play();
    void Pause();
    void Stop();

    float GetZPos() const;
    void SetZPos(float zpos);

    void SetVolume(float volume);
    float GetVolume() const;

    void SetAttenuation(float attenuation);
    float GetAttenuation() const;

    void SetMinDistance(float minDist);
    float GetMinDistance() const;

    void SetLooping(bool is);
    bool IsLooping() const;

    void SetPitch(float pitch);
    float GetPitch() const;

private:
    std::string fileName;

    std::string m_type;
    SoundWrapperBase *m_sound;

    void Init(const RuntimeSoundObject &other);
};

void DestroySoundObject(gd::Object * object);
gd::Object * CreateSoundObject(std::string name);

void DestroyRuntimeSoundObject(RuntimeObject * object);
RuntimeObject * CreateRuntimeSoundObject(RuntimeScene & scene, const gd::Object & object);


#endif // SoundObject_H

