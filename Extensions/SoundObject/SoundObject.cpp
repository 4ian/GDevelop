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
#include "GDL/Object.h"

#include "GDL/ImageManager.h"
#include "GDL/tinyxml/tinyxml.h"
#include "GDL/Position.h"
#include "GDL/CommonTools.h"

#include "SoundObject.h"
#include "SoundWrapperBase.h"
#include "SoundInitialPositionPanel.h"

#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "SoundObjectEditor.h"
#endif

#if defined(GD_IDE_ONLY)
sf::Texture SoundObject::soundIcon;
sf::Sprite SoundObject::soundSprite;
#endif

SoundObject::SoundObject(std::string name_) :
Object(name_), m_type("Sound"), m_sound(0)
{
    SetSoundType(m_type);
    SetPitch(1);
}

SoundObject::~SoundObject()
{
    Stop();
    if (m_sound != NULL) delete m_sound;
    m_sound = 0;
}

void SoundObject::Init(const SoundObject &other)
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

SoundObject::SoundObject(const SoundObject &other) : Object(other), m_sound(0)
{
    Init(other);
}

SoundObject& SoundObject::operator=(const SoundObject &other)
{
    Init(other);
    return *this;
}

void SoundObject::LoadFromXml(const TiXmlElement * elem)
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
void SoundObject::SaveToXml(TiXmlElement * elem)
{
    TiXmlElement * type = new TiXmlElement( "Type" );
    elem->LinkEndChild( type );
    type->SetAttribute("value", m_type.c_str());

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

bool SoundObject::LoadRuntimeResources(const RuntimeScene & scene, const ImageManager & imageMgr )
{
    return ReloadSound(scene);
}

bool SoundObject::Draw( sf::RenderTarget& renderTarget )
{
    return true;
}

bool SoundObject::InitializeFromInitialPosition(const InitialPosition & position)
{
    if ( position.floatInfos.find("z") != position.floatInfos.end() )
        SetZPos(position.floatInfos.find("z")->second);

    return true;
}

#if defined(GD_IDE_ONLY)
/**
 * Render object at edittime
 */
bool SoundObject::DrawEdittime( sf::RenderTarget& renderTarget )
{
    soundSprite.SetPosition(GetX(), GetY());
    renderTarget.Draw(soundSprite);

    if(!IsStopped())
        Stop();

    return true;
}

void SoundObject::LoadEdittimeIcon()
{
    soundIcon.LoadFromFile("Extensions/soundicon32.png");
    soundSprite.SetTexture(soundIcon);
}

wxPanel * SoundObject::CreateInitialPositionPanel( wxWindow* parent, const Game & game_, const Scene & scene_, const InitialPosition & position )
{
    SoundInitialPositionPanel * panel = new SoundInitialPositionPanel(parent);

    if ( position.floatInfos.find("z") != position.floatInfos.end())
        panel->zPositionTextCtrl->ChangeValue(ToString( position.floatInfos.find("z")->second));

    return panel;
}

void SoundObject::UpdateInitialPositionFromPanel(wxPanel * panel, InitialPosition & position)
{
    SoundInitialPositionPanel * soundPanel = dynamic_cast<SoundInitialPositionPanel*>(panel);
    if (soundPanel == NULL) return;

    position.floatInfos["z"] = ToFloat(ToString(soundPanel->zPositionTextCtrl->GetValue()));
}

void SoundObject::ExposeResources(gd::ArbitraryResourceWorker & worker)
{
    worker.ExposeResource(fileName);
}

bool SoundObject::GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail)
{
    thumbnail = wxBitmap("Extensions/soundicon24.png", wxBITMAP_TYPE_ANY);
    return true;
}

void SoundObject::EditObject( wxWindow* parent, Game & game, gd::MainFrameWrapper & mainFrameWrapper )
{
    SoundObjectEditor dialog(parent, game, *this);
    dialog.ShowModal();
}

void SoundObject::GetPropertyForDebugger(unsigned int propertyNb, string & name, string & value) const
{
    if      ( propertyNb == 0 ) {name = _("Sound level");                    value = ToString(GetVolume());}
    else if ( propertyNb == 1 ) {name = _("Minimal distance");         value = ToString(GetMinDistance());}
    else if ( propertyNb == 2 ) {name = _("Attenuation");               value = ToString(GetAttenuation());}
    else if ( propertyNb == 3 ) {name = _("Loop");                 value = IsLooping() ? _("Yes") : _("No");}
    else if ( propertyNb == 4 ) {name = _("Z Position");                          value = ToString(GetZPos());}
}

bool SoundObject::ChangeProperty(unsigned int propertyNb, string newValue)
{
    if(propertyNb == 0) {SetVolume(ToFloat(newValue));}
    else if (propertyNb == 1) {SetMinDistance(ToFloat(newValue));}
    else if (propertyNb == 2) {SetAttenuation(ToFloat(newValue));}
    else if (propertyNb == 3) {SetLooping(!(newValue == _("No")));}
    else if (propertyNb == 4) {SetZPos(ToFloat(newValue));}
    return true;
}

unsigned int SoundObject::GetNumberOfProperties() const
{
    return 5;
}
#endif

void SoundObject::OnPositionChanged()
{
    m_sound->SetPosition(sf::Vector3f(GetX(), GetY(), GetZPos()));
}

float SoundObject::GetDrawableX() const
{
    return GetX();
}

float SoundObject::GetDrawableY() const
{
    return GetY();
}

float SoundObject::GetWidth() const
{
    return 32;
}

float SoundObject::GetHeight() const
{
    return 32;
}

float SoundObject::GetCenterX() const
{
    return 16;
}

float SoundObject::GetCenterY() const
{
    return 16;
}

void SoundObject::UpdateTime(float)
{
}

void SoundObject::SetSoundFileName(const std::string & soundfilename)
{
    fileName = soundfilename;
    if(m_sound)
        m_sound->SetFileName(fileName);
}

std::string SoundObject::GetSoundFileName() const
{
    return fileName;
}

float SoundObject::GetZPos() const
{
    return m_sound->GetPosition().z;
}

void SoundObject::SetZPos(float zpos)
{
    m_sound->SetPosition(sf::Vector3f(m_sound->GetPosition().x, m_sound->GetPosition().y, zpos));
}

void DestroySoundObject(Object * object)
{
    delete object;
}

void SoundObject::SetSoundType(const std::string &type)
{
    if(type == "Sound")
    {
        if(m_sound)
            delete m_sound;

        m_sound = new SoundWrapper();
        m_type = type;
    }
    else if(type == "Music")
    {
        if(m_sound)
            delete m_sound;

        m_sound = new MusicWrapper();
        m_type = type;
    }
}

std::string SoundObject::GetSoundType() const
{
    return m_type;
}

bool SoundObject::ReloadSound(const RuntimeScene &scene)
{
    return m_sound->LoadFromFile(m_sound->GetFileName(), scene);
}

void SoundObject::Play()
{
    m_sound->Play();
}

void SoundObject::Pause()
{
    m_sound->Pause();
}

void SoundObject::Stop()
{
    m_sound->Stop();
}

bool SoundObject::IsPlaying() const
{
    return m_sound->IsPlaying();
}

bool SoundObject::IsPaused() const
{
    return m_sound->IsPausing();
}

bool SoundObject::IsStopped() const
{
    return m_sound->IsStopped();
}

void SoundObject::SetVolume(float volume)
{
    m_sound->SetVolume(volume);
}

float SoundObject::GetVolume() const
{
    return m_sound->GetVolume();
}

void SoundObject::SetAttenuation(float attenuation)
{
    m_sound->SetAttenuation(attenuation);
}

float SoundObject::GetAttenuation() const
{
    return m_sound->GetAttenuation();
}

void SoundObject::SetMinDistance(float minDist)
{
    m_sound->SetMinDistance(minDist);
}

float SoundObject::GetMinDistance() const
{
    return m_sound->GetMinDistance();
}

void SoundObject::SetLooping(bool is)
{
    m_sound->SetLooping(is);
}

bool SoundObject::IsLooping() const
{
    return m_sound->IsLooping();
}

void SoundObject::SetPitch(float pitch)
{
    m_sound->SetPitch(pitch);
}

float SoundObject::GetPitch() const
{
    return m_sound->GetPitch();
}

Object * CreateSoundObject(std::string name)
{
    return new SoundObject(name);
}

