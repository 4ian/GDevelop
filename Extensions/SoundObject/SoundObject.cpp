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

#if defined(GD_IDE_ONLY)
#include <wx/wx.h> //Must be placed first, otherwise we get errors relative to "cannot convert 'const TCHAR*'..." in wx/msw/winundef.h
#endif
#include <SFML/Graphics.hpp>
#include "GDCpp/Object.h"

#include "GDCpp/ImageManager.h"
#include "GDCpp/tinyxml/tinyxml.h"
#include "GDCpp/Position.h"
#include "GDCpp/CommonTools.h"

#include "SoundObject.h"
#include "SoundWrapperBase.h"

#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
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

void SoundObject::DoLoadFromXml(gd::Project & project, const TiXmlElement * elem)
{
    float zpos = 0;
    std::string type = "Sound";

    if ( elem->FirstChildElement( "Type" ) == NULL ||
         elem->FirstChildElement( "Type" )->Attribute("value") == NULL )
    {
        cout << "Les informations concernant le type d'un objet son manquent.";
    }
    else
    {
        if(std::string(elem->FirstChildElement( "Type" )->Attribute("value")) != "")
        {
            type = elem->FirstChildElement( "Type" )->Attribute("value");
        }
        SetSoundType(type);
    }

    if ( elem->FirstChildElement( "Filename" ) == NULL ||
         elem->FirstChildElement( "Filename" )->Attribute("value") == NULL )
    {
        cout << "Les informations concernant le nom du fichier d'un objet son manquent.";
    }
    else
    {
        SetSoundFileName(elem->FirstChildElement("Filename")->Attribute("value"));
    }

    if ( elem->FirstChildElement( "Volume" ) == NULL ||
         elem->FirstChildElement( "Volume" )->Attribute("value") == NULL )
    {
        cout << "Les informations concernant le volume d'un objet son manquent.";
    }
    else
    {
        float volume = 50;
        elem->FirstChildElement("Volume")->QueryFloatAttribute("value", &volume);
        SetVolume(volume);
    }

    if ( elem->FirstChildElement( "Pitch" ) == NULL ||
         elem->FirstChildElement( "Pitch" )->Attribute("value") == NULL )
    {
        cout << "Les informations concernant le pitch d'un objet son manquent.";
    }
    else
    {
        float pitch = 1;
        elem->FirstChildElement("Pitch")->QueryFloatAttribute("value", &pitch);
        SetPitch(pitch);
    }

    if ( elem->FirstChildElement( "MinDistance" ) == NULL ||
         elem->FirstChildElement( "MinDistance" )->Attribute("value") == NULL )
    {
        cout << "Les informations concernant la distance minimale d'un son manquent.";
    }
    else
    {
        float mindistance = 1;
        elem->FirstChildElement("MinDistance")->QueryFloatAttribute("value", &mindistance);
        SetMinDistance(mindistance);
    }

    if ( elem->FirstChildElement( "Attenuation" ) == NULL ||
         elem->FirstChildElement( "Attenuation" )->Attribute("value") == NULL )
    {
        cout << "Les informations concernant l'attenuation d'un son manquent.";
    }
    else
    {
        float attenuation = 1;
        elem->FirstChildElement("Attenuation")->QueryFloatAttribute("value", &attenuation);
        SetAttenuation(attenuation);
    }

    if ( elem->FirstChildElement( "Loop" ) == NULL ||
         elem->FirstChildElement( "Loop" )->Attribute("value") == NULL )
    {
        cout << "Les informations concernant la répétition d'un objet son manquent.";
    }
    else
    {
        float loop = 0;
        elem->FirstChildElement("Loop")->QueryFloatAttribute("value", &loop);

        if(loop == 0)
            SetLooping(false);
        else
            SetLooping(true);
    }

    if ( elem->FirstChildElement( "ZPos" ) == NULL ||
         elem->FirstChildElement( "ZPos" )->Attribute("value") == NULL )
    {
        cout << "Les informations concernant la position en z d'un objet son manquent.";
    }
    else
    {
        elem->FirstChildElement("ZPos")->QueryFloatAttribute("value", &zpos);
    }

    SetZPos(zpos);
}

#if defined(GD_IDE_ONLY)
void SoundObject::DoSaveToXml(TiXmlElement * elem)
{
    TiXmlElement * typeElem = new TiXmlElement( "Type" );
    elem->LinkEndChild( typeElem );
    typeElem->SetAttribute("value", type.c_str());

    TiXmlElement * filename = new TiXmlElement( "Filename" );
    elem->LinkEndChild( filename );
    filename->SetAttribute("value", fileName.c_str());

    TiXmlElement * loop = new TiXmlElement( "Loop" );
    elem->LinkEndChild( loop );
    loop->SetAttribute("value", IsLooping());

    TiXmlElement * vol = new TiXmlElement( "Volume" );
    elem->LinkEndChild( vol );
    vol->SetAttribute("value", ToString(GetVolume()).c_str());

    TiXmlElement * pitch = new TiXmlElement( "Pitch" );
    elem->LinkEndChild( pitch );
    pitch->SetAttribute("value", GetPitch());

    TiXmlElement * att = new TiXmlElement( "Attenuation" );
    elem->LinkEndChild( att );
    att->SetAttribute("value", ToString(GetAttenuation()).c_str());

    TiXmlElement * mind = new TiXmlElement( "MinDistance" );
    elem->LinkEndChild( mind );
    mind->SetAttribute("value", ToString(GetMinDistance()).c_str());

    TiXmlElement * zpos = new TiXmlElement( "ZPos" );
    elem->LinkEndChild( zpos );
    zpos->SetAttribute("value", ToString(GetZPos()).c_str());
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

std::map<std::string, std::string> SoundObject::GetInitialInstanceProperties(const gd::InitialInstance & position, gd::Project & game, gd::Layout & scene)
{
    std::map<std::string, std::string> properties;
    properties[ToString(_("Z"))] = position.floatInfos.find("z") != position.floatInfos.end() ?
                                   ToString(position.floatInfos.find("z")->second) :
                                   "0";

    return properties;
}

bool SoundObject::UpdateInitialInstanceProperty(gd::InitialInstance & position, const std::string & name, const std::string & value, gd::Project & game, gd::Layout & scene)
{
    if ( name == _("Z") ) position.floatInfos["z"] = ToFloat(value);

    return true;
}

void SoundObject::ExposeResources(gd::ArbitraryResourceWorker & worker)
{
    worker.ExposeResource(fileName);
}

bool SoundObject::GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail)
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
    if      ( propertyNb == 0 ) {name = _("Sound level");                    value = ToString(GetVolume());}
    else if ( propertyNb == 1 ) {name = _("Minimal distance");         value = ToString(GetMinDistance());}
    else if ( propertyNb == 2 ) {name = _("Attenuation");               value = ToString(GetAttenuation());}
    else if ( propertyNb == 3 ) {name = _("Loop");                 value = IsLooping() ? _("Yes") : _("No");}
    else if ( propertyNb == 4 ) {name = _("Z Position");                          value = ToString(GetZPos());}
}

bool RuntimeSoundObject::ChangeProperty(unsigned int propertyNb, string newValue)
{
    if(propertyNb == 0) {SetVolume(ToFloat(newValue));}
    else if (propertyNb == 1) {SetMinDistance(ToFloat(newValue));}
    else if (propertyNb == 2) {SetAttenuation(ToFloat(newValue));}
    else if (propertyNb == 3) {SetLooping(!(newValue == _("No")));}
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
    if(type == "Sound")
    {
        if(m_sound)
            delete m_sound;

        m_sound = new SoundWrapper();
        m_type = type;
    }
    else
    {
        if(m_sound)
            delete m_sound;

        m_sound = new MusicWrapper();
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

void DestroyRuntimeSoundObject(RuntimeObject * object)
{
    delete object;
}

RuntimeObject * CreateRuntimeSoundObject(RuntimeScene & scene, const gd::Object & object)
{
    return new RuntimeSoundObject(scene, object);
}

gd::Object * CreateSoundObject(std::string name)
{
    return new SoundObject(name);
}

void DestroySoundObject(gd::Object * object)
{
    delete object;
}

