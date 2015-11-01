/**

Sound Object Extension
Copyright (c) 2011-2012 Thomas Flecy
This project is released under the MIT License.
*/

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/wx.h> //Must be placed first, otherwise we get errors relative to "cannot convert 'const TCHAR*'..." in wx/msw/winundef.h
#endif
#include <SFML/Graphics.hpp>
#include "GDCore/Tools/Localization.h"
#include "GDCpp/Project/Object.h"
#include "GDCpp/ImageManager.h"
#include "GDCpp/Serialization/SerializerElement.h"
#include "GDCpp/Project/InitialInstance.h"
#include "GDCpp/CommonTools.h"

#include "SoundObject.h"
#include "SoundWrapperBase.h"

#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/AbstractFileSystem.h"
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/IDE/Dialogs/PropertyDescriptor.h"
#include "SoundObjectEditor.h"
#endif

#if defined(GD_IDE_ONLY)
sf::Texture SoundObject::soundIcon;
sf::Sprite SoundObject::soundSprite;
#endif

using namespace std;

SoundObject::SoundObject(gd::String name_) :
    Object(name_),
    type("Sound"),
    zPos(0),
    volume(100),
    attenuation(1),
    minDist(1),
    loop(true),
    pitch(1)
{
}

RuntimeSoundObject::RuntimeSoundObject(RuntimeScene & scene_, const gd::Object & object) :
    RuntimeObject(scene_, object),
    m_sound(NULL)
{
    const SoundObject & soundObject = static_cast<const SoundObject&>(object);

    SetSoundType(soundObject.GetSoundType());
    SetSoundFileName(soundObject.GetSoundFileName());
    SetVolume(soundObject.GetVolume());
    SetAttenuation(soundObject.GetAttenuation());
    SetLooping(soundObject.IsLooping());
    SetMinDistance(soundObject.GetMinDistance());
    SetPitch(soundObject.GetPitch());
    SetZPos(soundObject.GetZPos());

    ReloadSound(scene_);
    Stop();
}

RuntimeSoundObject& RuntimeSoundObject::operator=(const RuntimeSoundObject &other)
{
    if ( &other != this )
        Init(other);

    return *this;
}

RuntimeSoundObject::RuntimeSoundObject(const RuntimeSoundObject &other) :
    RuntimeObject(other),
    m_sound(NULL)
{
    Init(other);
}

void RuntimeSoundObject::Init(const RuntimeSoundObject &other)
{
    SetSoundType(other.m_type);
    SetSoundFileName(other.GetSoundFileName());

    SetVolume(other.GetVolume());
    SetAttenuation(other.GetAttenuation());
    SetLooping(other.IsLooping());
    SetMinDistance(other.GetMinDistance());
    SetPitch(other.GetPitch());

    SetZPos(other.GetZPos());

    Stop();
}

RuntimeSoundObject::~RuntimeSoundObject()
{
    Stop();
    if (m_sound != NULL) delete m_sound;
}

void SoundObject::DoUnserializeFrom(gd::Project & project, const gd::SerializerElement & element)
{
    SetSoundType(element.GetChild("type", 0, "Type").GetValue().GetString());
    SetSoundFileName(element.GetChild("filename", 0, "Filename").GetValue().GetString());
    SetPitch(element.GetChild("volume", 0, "Volume").GetValue().GetDouble());
    SetPitch(element.GetChild("pitch", 0, "Pitch").GetValue().GetDouble());
    SetMinDistance(element.GetChild("minDistance", 0, "MinDistance").GetValue().GetDouble());
    SetAttenuation(element.GetChild("attenuation", 0, "Attenuation").GetValue().GetDouble());
    SetLooping(element.GetChild("loop", 0, "Loop").GetValue().GetBool());
    SetZPos(element.GetChild("zPos", 0, "ZPos").GetValue().GetDouble());
}


void SoundObject::SetSoundFileName(const gd::String & soundfilename)
{
    fileName = soundfilename;
    #if defined(GD_IDE_ONLY)
    fileName = gd::AbstractFileSystem::NormalizeSeparator(fileName);
    #endif
};

#if defined(GD_IDE_ONLY)
void SoundObject::DoSerializeTo(gd::SerializerElement & element) const
{
    element.AddChild("type").SetValue(type);
    element.AddChild("filename").SetValue(fileName);
    element.AddChild("loop").SetValue(IsLooping());
    element.AddChild("volume").SetValue(GetVolume());
    element.AddChild("pitch").SetValue(GetPitch());
    element.AddChild("attenuation").SetValue(GetAttenuation());
    element.AddChild("minDistance").SetValue(GetMinDistance());
    element.AddChild("zPos").SetValue(GetZPos());
}
#endif

#if defined(GD_IDE_ONLY)
void SoundObject::DrawInitialInstance(gd::InitialInstance & instance, sf::RenderTarget & renderTarget, gd::Project & project, gd::Layout & layout)
{
    soundSprite.setPosition(instance.GetX(), instance.GetY());
    renderTarget.draw(soundSprite);
}

void SoundObject::LoadEdittimeIcon()
{
    soundIcon.loadFromFile("CppPlatform/Extensions/soundicon32.png");
    soundSprite.setTexture(soundIcon);
}

std::map<gd::String, gd::PropertyDescriptor> SoundObject::GetInitialInstanceProperties(const gd::InitialInstance & position, gd::Project & game, gd::Layout & scene)
{
    std::map<gd::String, gd::PropertyDescriptor> properties;
    properties[_("Z")] = position.floatInfos.find("z") != position.floatInfos.end() ?
                                   gd::String::From(position.floatInfos.find("z")->second) :
                                   "0";

    return properties;
}

bool SoundObject::UpdateInitialInstanceProperty(gd::InitialInstance & position, const gd::String & name, const gd::String & value, gd::Project & game, gd::Layout & scene)
{
    if ( name == _("Z") ) position.floatInfos["z"] = value.To<float>();

    return true;
}

void SoundObject::ExposeResources(gd::ArbitraryResourceWorker & worker)
{
    worker.ExposeFile(fileName);
}

bool SoundObject::GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail) const
{
#if !defined(GD_NO_WX_GUI)
    thumbnail = wxBitmap("CppPlatform/Extensions/soundicon24.png", wxBITMAP_TYPE_ANY);
#endif

    return true;
}

void SoundObject::EditObject( wxWindow* parent, gd::Project & game, gd::MainFrameWrapper & mainFrameWrapper )
{
#if !defined(GD_NO_WX_GUI)
    SoundObjectEditor dialog(parent, game, *this);
    dialog.ShowModal();
#endif
}

void RuntimeSoundObject::GetPropertyForDebugger(std::size_t propertyNb, gd::String & name, gd::String & value) const
{
    if      ( propertyNb == 0 ) {name = _("Sound level");                    value = gd::String::From(GetVolume());}
    else if ( propertyNb == 1 ) {name = _("Minimal distance");         value = gd::String::From(GetMinDistance());}
    else if ( propertyNb == 2 ) {name = _("Attenuation");               value = gd::String::From(GetAttenuation());}
    else if ( propertyNb == 3 ) {name = _("Loop");                 value = IsLooping() ? _("Yes") : _("No");}
    else if ( propertyNb == 4 ) {name = _("Z Position");                          value = gd::String::From(GetZPos());}
}

bool RuntimeSoundObject::ChangeProperty(std::size_t propertyNb, gd::String newValue)
{
    if(propertyNb == 0) {SetVolume(newValue.To<float>());}
    else if (propertyNb == 1) {SetMinDistance(newValue.To<float>());}
    else if (propertyNb == 2) {SetAttenuation(newValue.To<float>());}
    else if (propertyNb == 3) {SetLooping(!(newValue == _("No")));}
    else if (propertyNb == 4) {SetZPos(newValue.To<float>());}
    return true;
}

std::size_t RuntimeSoundObject::GetNumberOfProperties() const
{
    return 5;
}
#endif

bool RuntimeSoundObject::ExtraInitializationFromInitialInstance(const gd::InitialInstance & instance)
{
    SetZPos(instance.floatInfos.find("z") != instance.floatInfos.end() ? instance.floatInfos.find("z")->second : 0);

    return true;
}

void RuntimeSoundObject::OnPositionChanged()
{
    m_sound->SetPosition(sf::Vector3f(GetX(), GetY(), GetZPos()));
}

void RuntimeSoundObject::SetSoundFileName(const gd::String & soundfilename)
{
    fileName = soundfilename;
    if(m_sound)
        m_sound->SetFileName(fileName);
}

float RuntimeSoundObject::GetZPos() const
{
    return m_sound->GetPosition().z;
}

void RuntimeSoundObject::SetZPos(float zpos)
{
    if (m_sound)
        m_sound->SetPosition(sf::Vector3f(m_sound->GetPosition().x, m_sound->GetPosition().y, zpos));
}

void RuntimeSoundObject::SetSoundType(const gd::String &type)
{
    if(type == "Music")
    {
        if(m_sound)
            delete m_sound;

        m_sound = new MusicWrapper();
        m_type = type;
    }
    else
    {
        if(m_sound)
            delete m_sound;

        m_sound = new SoundWrapper();
        m_type = type;
    }
}

const gd::String & RuntimeSoundObject::GetSoundType() const
{
    return m_type;
}

bool RuntimeSoundObject::ReloadSound(const RuntimeScene &scene)
{
    return m_sound->LoadFromFile(m_sound->GetFileName(), scene);
}

void RuntimeSoundObject::Play()
{
    m_sound->Play();
}

void RuntimeSoundObject::Pause()
{
    m_sound->Pause();
}

void RuntimeSoundObject::Stop()
{
    m_sound->Stop();
}

bool RuntimeSoundObject::IsPlaying() const
{
    return m_sound->IsPlaying();
}

bool RuntimeSoundObject::IsPaused() const
{
    return m_sound->IsPausing();
}

bool RuntimeSoundObject::IsStopped() const
{
    return m_sound->IsStopped();
}

void RuntimeSoundObject::SetVolume(float volume)
{
    m_sound->SetVolume(volume);
}

float RuntimeSoundObject::GetVolume() const
{
    return m_sound->GetVolume();
}

void RuntimeSoundObject::SetAttenuation(float attenuation)
{
    m_sound->SetAttenuation(attenuation);
}

float RuntimeSoundObject::GetAttenuation() const
{
    return m_sound->GetAttenuation();
}

void RuntimeSoundObject::SetMinDistance(float minDist)
{
    m_sound->SetMinDistance(minDist);
}

float RuntimeSoundObject::GetMinDistance() const
{
    return m_sound->GetMinDistance();
}

void RuntimeSoundObject::SetLooping(bool is)
{
    m_sound->SetLooping(is);
}

bool RuntimeSoundObject::IsLooping() const
{
    return m_sound->IsLooping();
}

void RuntimeSoundObject::SetPitch(float pitch)
{
    m_sound->SetPitch(pitch);
}

float RuntimeSoundObject::GetPitch() const
{
    return m_sound->GetPitch();
}

RuntimeObject * CreateRuntimeSoundObject(RuntimeScene & scene, const gd::Object & object)
{
    return new RuntimeSoundObject(scene, object);
}

gd::Object * CreateSoundObject(gd::String name)
{
    return new SoundObject(name);
}
