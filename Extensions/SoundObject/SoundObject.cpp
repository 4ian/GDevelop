/**

Sound Object Extension
Copyright (c) 2011-2012 Thomas Flecy
This project is released under the MIT License.
*/

#if defined(GD_IDE_ONLY)
#include <wx/wx.h> //Must be placed first, otherwise we get errors relative to "cannot convert 'const TCHAR*'..." in wx/msw/winundef.h
#endif
#include <SFML/Graphics.hpp>
#include "GDCore/Tools/Localization.h"
#include "GDCpp/Object.h"

#include "GDCpp/ImageManager.h"
#include "GDCpp/Serialization/SerializerElement.h"
#include "GDCpp/Position.h"
#include "GDCpp/CommonTools.h"

#include "SoundObject.h"
#include "SoundWrapperBase.h"

#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/AbstractFileSystem.h"
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/IDE/Dialogs/PropertyDescriptor.h"
#include "SoundObjectEditor.h"
#endif

#if defined(GD_IDE_ONLY)
sf::Texture SoundObject::soundIcon;
sf::Sprite SoundObject::soundSprite;
#endif

using namespace std;

SoundObject::SoundObject(std::string name_) :
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


void SoundObject::SetSoundFileName(const std::string & soundfilename)
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

std::map<std::string, gd::PropertyDescriptor> SoundObject::GetInitialInstanceProperties(const gd::InitialInstance & position, gd::Project & game, gd::Layout & scene)
{
    std::map<std::string, gd::PropertyDescriptor> properties;
    properties[GD_T("Z")] = position.floatInfos.find("z") != position.floatInfos.end() ?
                                   ToString(position.floatInfos.find("z")->second) :
                                   "0";

    return properties;
}

bool SoundObject::UpdateInitialInstanceProperty(gd::InitialInstance & position, const std::string & name, const std::string & value, gd::Project & game, gd::Layout & scene)
{
    if ( name == GD_T("Z") ) position.floatInfos["z"] = ToFloat(value);

    return true;
}

void SoundObject::ExposeResources(gd::ArbitraryResourceWorker & worker)
{
    worker.ExposeFile(fileName);
}

bool SoundObject::GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail) const
{
    thumbnail = wxBitmap("CppPlatform/Extensions/soundicon24.png", wxBITMAP_TYPE_ANY);
    return true;
}

void SoundObject::EditObject( wxWindow* parent, gd::Project & game, gd::MainFrameWrapper & mainFrameWrapper )
{
    SoundObjectEditor dialog(parent, game, *this);
    dialog.ShowModal();
}

void RuntimeSoundObject::GetPropertyForDebugger(unsigned int propertyNb, string & name, string & value) const
{
    if      ( propertyNb == 0 ) {name = GD_T("Sound level");                    value = ToString(GetVolume());}
    else if ( propertyNb == 1 ) {name = GD_T("Minimal distance");         value = ToString(GetMinDistance());}
    else if ( propertyNb == 2 ) {name = GD_T("Attenuation");               value = ToString(GetAttenuation());}
    else if ( propertyNb == 3 ) {name = GD_T("Loop");                 value = IsLooping() ? GD_T("Yes") : GD_T("No");}
    else if ( propertyNb == 4 ) {name = GD_T("Z Position");                          value = ToString(GetZPos());}
}

bool RuntimeSoundObject::ChangeProperty(unsigned int propertyNb, string newValue)
{
    if(propertyNb == 0) {SetVolume(ToFloat(newValue));}
    else if (propertyNb == 1) {SetMinDistance(ToFloat(newValue));}
    else if (propertyNb == 2) {SetAttenuation(ToFloat(newValue));}
    else if (propertyNb == 3) {SetLooping(!(newValue == GD_T("No")));}
    else if (propertyNb == 4) {SetZPos(ToFloat(newValue));}
    return true;
}

unsigned int RuntimeSoundObject::GetNumberOfProperties() const
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

void RuntimeSoundObject::SetSoundFileName(const std::string & soundfilename)
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

void RuntimeSoundObject::SetSoundType(const std::string &type)
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

const std::string & RuntimeSoundObject::GetSoundType() const
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

gd::Object * CreateSoundObject(std::string name)
{
    return new SoundObject(name);
}
