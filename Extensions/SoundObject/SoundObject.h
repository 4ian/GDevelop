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

#include "GDL/Object.h"
#include <SFML/Audio/Sound.hpp>
#include <SFML/Audio/Music.hpp>
#include <SFML/Audio/SoundBuffer.hpp>
class ImageManager;
class RuntimeScene;
class Object;
class ImageManager;
class InitialPosition;
class SoundWrapperBase;
#if defined(GD_IDE_ONLY)
namespace sf
{
    class Texture;
    class Sprite;
};
class wxBitmap;
class Game;
class wxWindow;
namespace gd { class MainFrameWrapper; }
namespace gd { class ArbitraryResourceWorker; }
#endif

class GD_EXTENSION_API SoundObject : public Object
{
public :

    enum SoundType
    {
        Sound,
        Music
    };

    SoundObject(std::string name_);
    virtual ~SoundObject();

    void Init(const SoundObject &other);
    SoundObject(const SoundObject &other);
    SoundObject& operator=(const SoundObject &other);

    virtual Object * Clone() const { return new SoundObject(*this);}

    virtual bool LoadRuntimeResources(const RuntimeScene & scene, const ImageManager & imageMgr );
    virtual bool InitializeFromInitialPosition(const InitialPosition & position);

    virtual bool Draw(sf::RenderTarget & renderTarget);

    #if defined(GD_IDE_ONLY)
    virtual bool DrawEdittime(sf::RenderTarget & renderTarget);
    virtual void ExposeResources(gd::ArbitraryResourceWorker & worker);
    virtual bool GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail);
    static void LoadEdittimeIcon();

    virtual wxPanel * CreateInitialPositionPanel( wxWindow* parent, const Game & game_, const Scene & scene_, const InitialPosition & position );
    virtual void UpdateInitialPositionFromPanel(wxPanel * panel, InitialPosition & position);

    virtual void EditObject( wxWindow* parent, Game & game_, gd::MainFrameWrapper & mainFrameWrapper_ );

    virtual void GetPropertyForDebugger (unsigned int propertyNb, std::string & name, std::string & value) const;
    virtual bool ChangeProperty(unsigned int propertyNb, std::string newValue);
    virtual unsigned int GetNumberOfProperties() const;
    #endif

    virtual void LoadFromXml(const TiXmlElement * elemScene);
    #if defined(GD_IDE_ONLY)
    virtual void SaveToXml(TiXmlElement * elemScene);
    #endif

    virtual void UpdateTime(float timeElapsed);

    virtual void OnPositionChanged();

    float GetZPos() const;
    void SetZPos(float zpos);

    virtual float GetWidth() const;
    virtual float GetHeight() const;
    virtual void SetWidth(float ) {};
    virtual void SetHeight(float ) {};

    virtual float GetDrawableX() const;
    virtual float GetDrawableY() const;

    virtual float GetCenterX() const;
    virtual float GetCenterY() const;

    void SetSoundFileName(const std::string & soundfilename);
    std::string GetSoundFileName() const;

    void SetSoundType(const std::string &type);
    std::string GetSoundType() const;
    bool ReloadSound(const RuntimeScene &scene);

    bool IsPlaying() const;
    bool IsPaused() const;
    bool IsStopped() const;

    void Play();
    void Pause();
    void Stop();

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

    #if defined(GD_IDE_ONLY)
    static sf::Texture soundIcon;
    static sf::Sprite soundSprite;
    #endif
};

void DestroySoundObject(Object * object);
Object * CreateSoundObject(std::string name);

#endif // SoundObject_H
