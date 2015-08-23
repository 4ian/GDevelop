/**

Sound Object Extension
Copyright (c) 2011-2012 Thomas Flecy
This project is released under the MIT License.
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

    SoundObject(gd::String name_);
    virtual ~SoundObject() {};
    virtual gd::Object * Clone() const { return new SoundObject(*this);}

    #if defined(GD_IDE_ONLY)
    virtual void DrawInitialInstance(gd::InitialInstance & instance, sf::RenderTarget & renderTarget, gd::Project & project, gd::Layout & layout);
    virtual void ExposeResources(gd::ArbitraryResourceWorker & worker);
    virtual bool GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail) const;
    static void LoadEdittimeIcon();

    virtual void EditObject( wxWindow* parent, gd::Project & game_, gd::MainFrameWrapper & mainFrameWrapper_ );
    virtual std::map<gd::String, gd::PropertyDescriptor> GetInitialInstanceProperties(const gd::InitialInstance & position, gd::Project & game, gd::Layout & scene);
    virtual bool UpdateInitialInstanceProperty(gd::InitialInstance & position, const gd::String & name, const gd::String & value, gd::Project & game, gd::Layout & scene);
    #endif

    float GetZPos() const { return zPos; };
    void SetZPos(float zpos_) { zPos = zpos_; };

    void SetSoundFileName(const gd::String & soundfilename);
    const gd::String & GetSoundFileName() const { return fileName; };

    void SetSoundType(const gd::String & type_) {type = type_;};
    const gd::String & GetSoundType() const { return type; };

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
    gd::String fileName;
    gd::String type;
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
    virtual void GetPropertyForDebugger (std::size_t propertyNb, gd::String & name, gd::String & value) const;
    virtual bool ChangeProperty(std::size_t propertyNb, gd::String newValue);
    virtual std::size_t GetNumberOfProperties() const;
    #endif

    virtual void OnPositionChanged();

    void SetSoundType(const gd::String & type_);
    const gd::String & GetSoundType() const;

    void SetSoundFileName(const gd::String & soundfilename);
    const gd::String & GetSoundFileName() const { return fileName; };

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
    gd::String fileName;

    gd::String m_type;
    SoundWrapperBase *m_sound;

    void Init(const RuntimeSoundObject &other);
};

gd::Object * CreateSoundObject(gd::String name);
RuntimeObject * CreateRuntimeSoundObject(RuntimeScene & scene, const gd::Object & object);

#endif // SoundObject_H

