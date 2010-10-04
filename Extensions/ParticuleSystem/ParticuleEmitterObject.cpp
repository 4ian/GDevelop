/**

Game Develop - Particule System Extension
Copyright (c) 2010 Florian Rival (Florian.Rival@gmail.com)

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

#include <SFML/Graphics.hpp>
#include "GDL/Object.h"

#include "GDL/ImageManager.h"
#include "GDL/tinyxml.h"
#include "GDL/FontManager.h"
#include "GDL/Position.h"
#include "ParticuleEmitterObject.h"

#ifdef GDE
#include <wx/wx.h>
#include "GDL/CommonTools.h"
#include "GDL/ResourcesMergingHelper.h"
#include "GDL/MainEditorCommand.h"
#include "ParticuleEmitterObjectEditor.h"
#endif

ParticuleEmitterObject::ParticuleEmitterObject(std::string name_) :
Object(name_),
baseParticleSystemID(SPK::NO_ID),
text("Text"),
opacity( 255 ),
colorR( 255 ),
colorG( 255 ),
colorB( 255 ),
angle(0)
{
    smoke.LoadFromFile("D:/Florian/Programmation/GameDevelop/Extensions/ParticuleSystem/SPARK/demos/bin/res/grass.bmp");
    sprite.SetImage(smoke);
}

void ParticuleEmitterObject::LoadFromXml(const TiXmlElement * object)
{
    if ( object->FirstChildElement( "String" ) == NULL ||
         object->FirstChildElement( "String" )->Attribute("value") == NULL )
    {
        cout << "Les informations concernant le texte d'un objet Text manquent.";
    }
    else
    {
        SetString(object->FirstChildElement("String")->Attribute("value"));
    }

    if ( object->FirstChildElement( "Font" ) == NULL ||
         object->FirstChildElement( "Font" )->Attribute("value") == NULL )
    {
        cout << "Les informations concernant la police d'un objet Text manquent.";
    }
    else
    {
        SetFont(object->FirstChildElement("Font")->Attribute("value"));
    }

    if ( object->FirstChildElement( "CharacterSize" ) == NULL ||
         object->FirstChildElement( "CharacterSize" )->Attribute("value") == NULL )
    {
        cout << "Les informations concernant la taille du texte d'un objet Text manquent.";
    }
    else
    {
        float size = 20;
        object->FirstChildElement("CharacterSize")->QueryFloatAttribute("value", &size);

        SetCharacterSize(size);
    }

    if ( object->FirstChildElement( "Color" ) == NULL ||
         object->FirstChildElement( "Color" )->Attribute("r") == NULL ||
         object->FirstChildElement( "Color" )->Attribute("g") == NULL ||
         object->FirstChildElement( "Color" )->Attribute("b") == NULL )
    {
        cout << "Les informations concernant la couleur du texte d'un objet Text manquent.";
    }
    else
    {
        int r = 255;
        int g = 255;
        int b = 255;
        object->FirstChildElement("Color")->QueryIntAttribute("r", &r);
        object->FirstChildElement("Color")->QueryIntAttribute("g", &g);
        object->FirstChildElement("Color")->QueryIntAttribute("b", &b);

        SetColor(r,g,b);
    }
}

#if defined(GDE)
void ParticuleEmitterObject::SaveToXml(TiXmlElement * object)
{
    TiXmlElement * str = new TiXmlElement( "String" );
    object->LinkEndChild( str );
    str->SetAttribute("value", GetString().c_str());

    TiXmlElement * font = new TiXmlElement( "Font" );
    object->LinkEndChild( font );
    font->SetAttribute("value", GetFont().c_str());

    TiXmlElement * characterSize = new TiXmlElement( "CharacterSize" );
    object->LinkEndChild( characterSize );
    characterSize->SetAttribute("value", GetCharacterSize());

    TiXmlElement * color = new TiXmlElement( "Color" );
    object->LinkEndChild( color );
    color->SetAttribute("r", GetColorR());
    color->SetAttribute("g", GetColorG());
    color->SetAttribute("b", GetColorB());
}
#endif

bool ParticuleEmitterObject::LoadRuntimeResources(const ImageManager & imageMgr )
{
    cout << "called";
    float universeHeight = 800;

	// Creates the model
	SPK::Model* smokeModel = SPK::Model::create(
		SPK::FLAG_SIZE | SPK::FLAG_ALPHA | SPK::FLAG_TEXTURE_INDEX | SPK::FLAG_ANGLE,
		SPK::FLAG_SIZE | SPK::FLAG_ALPHA,
		SPK::FLAG_SIZE | SPK::FLAG_TEXTURE_INDEX | SPK::FLAG_ANGLE);
	smokeModel->setParam(SPK::PARAM_SIZE,5.0f,10.0f,100.0f,200.0f);
	smokeModel->setParam(SPK::PARAM_ALPHA,1.0f,0.0f);
	smokeModel->setParam(SPK::PARAM_TEXTURE_INDEX,0.0f,0.0f);
	smokeModel->setParam(SPK::PARAM_ANGLE,0.0f,3.14 * 2.0f);
	smokeModel->setLifeTime(120.0f,155.0f);

	// Creates the renderer
	SPK::SFML::SFMLPointRenderer* smokeRenderer = SPK::SFML::SFMLPointRenderer::create();
	smokeRenderer->setBlendMode(sf::Blend::Alpha);
	//smokeRenderer->setDrawable(&sprite);
	//smokeRenderer->setAtlasDimensions(2,2);
	//smokeRenderer->setScale(0.875f,0.875f); // optim
	//smokeRenderer->setGroundCulling(true);

	// Creates the zones
	SPK::Point* leftTire = SPK::Point::create(SPK::Vector3D(0.0f,0.0f));
	SPK::Point* rightTire = SPK::Point::create(SPK::Vector3D(-50.0f,-30.0f));

	// Creates the emitters
	SPK::SphericEmitter* leftSmokeEmitter = SPK::SphericEmitter::create(SPK::Vector3D(0.0f,0.0f,1.0f),0.0f,1.1f * 3.14);
	leftSmokeEmitter->setZone(leftTire);
	leftSmokeEmitter->setName("left wheel emitter");

	SPK::SphericEmitter* rightSmokeEmitter = SPK::SphericEmitter::create(SPK::Vector3D(0.0f,0.0f,1.0f),0.0f,1.1f * 3.14);
	rightSmokeEmitter->setZone(rightTire);
	rightSmokeEmitter->setName("right wheel emitter");

	// Creates the Group
	SPK::Group* smokeGroup = SPK::Group::create(smokeModel,500);
	smokeGroup->setGravity(SPK::Vector3D(0.0f,0.0f,2.0f));
	smokeGroup->setRenderer(smokeRenderer);
	smokeGroup->addEmitter(leftSmokeEmitter);
	smokeGroup->addEmitter(rightSmokeEmitter);
	smokeGroup->enableSorting(true);

	// Creates the System
	SPK::SFML::SFMLSystem* system = SPK::SFML::SFMLSystem::create(true);
	system->addGroup(smokeGroup);

	// Defines which objects will be shared by all systems
	smokeModel->setShared(true);
	smokeRenderer->setShared(true);

	// Creates the base and gets the ID
	baseParticleSystemID = system->getID();

	particleSystem = SPK_Copy(SPK::SFML::SFMLSystem,baseParticleSystemID);
	particleSystem->SetPosition(100,100);
	cout << particleSystem->getNbParticles();

    return true;
}

/**
 * Update animation and direction from the inital position
 */
bool ParticuleEmitterObject::InitializeFromInitialPosition(const InitialPosition & position)
{
    return true;
}

/**
 * Render object at runtime
 */
bool ParticuleEmitterObject::Draw( sf::RenderWindow& window )
{
    //Don't draw anything if hidden
    if ( hidden ) return true;

    window.RestoreGLStates();

    cout << "drawn";
	cout << particleSystem->getNbParticles();
	particleSystem->SetPosition(GetX(), GetY());
    window.Draw(*particleSystem);

    //TODO : Probleme : Rien ne s'affiche et les objets affichés après ne s'affichent pas non plus.

    window.SaveGLStates();

    return true;
}

#ifdef GDE
/**
 * Render object at edittime
 */
bool ParticuleEmitterObject::DrawEdittime(sf::RenderWindow& renderWindow)
{

    return true;
}

void ParticuleEmitterObject::PrepareResourcesForMerging(ResourcesMergingHelper & resourcesMergingHelper)
{
    fontName = resourcesMergingHelper.GetNewFilename(fontName);
}

bool ParticuleEmitterObject::GenerateThumbnail(const Game & game, wxBitmap & thumbnail)
{
    thumbnail = wxBitmap("Extensions/texticon.png", wxBITMAP_TYPE_ANY);

    return true;
}

void ParticuleEmitterObject::EditObject( wxWindow* parent, Game & game, MainEditorCommand & mainEditorCommand )
{
    ParticuleEmitterObjectEditor dialog(parent, game, *this, mainEditorCommand);
    dialog.ShowModal();
}

wxPanel * ParticuleEmitterObject::CreateInitialPositionPanel( wxWindow* parent, const Game & game_, const Scene & scene_, const InitialPosition & position )
{
    return NULL;
}

void ParticuleEmitterObject::UpdateInitialPositionFromPanel(wxPanel * panel, InitialPosition & position)
{
}

void ParticuleEmitterObject::GetPropertyForDebugger(unsigned int propertyNb, string & name, string & value) const
{
    if      ( propertyNb == 0 ) {name = _("Texte");                     value = GetString();}
    else if ( propertyNb == 1 ) {name = _("Police");                    value = GetFont();}
    else if ( propertyNb == 2 ) {name = _("Taille de caractères");      value = ToString(GetCharacterSize());}
    else if ( propertyNb == 3 ) {name = _("Couleur");       value = ToString(GetColorR())+";"+ToString(GetColorG())+";"+ToString(GetColorB());}
    else if ( propertyNb == 4 ) {name = _("Opacité");       value = ToString(GetOpacity());}
}

bool ParticuleEmitterObject::ChangeProperty(unsigned int propertyNb, string newValue)
{
    if      ( propertyNb == 0 ) { SetString(newValue); return true; }
    else if ( propertyNb == 1 ) { SetFont(newValue); }
    else if ( propertyNb == 2 ) { SetCharacterSize(ToInt(newValue)); }
    else if ( propertyNb == 3 )
    {
        string r, gb, g, b;
        {
            size_t separationPos = newValue.find(";");

            if ( separationPos > newValue.length())
                return false;

            r = newValue.substr(0, separationPos);
            gb = newValue.substr(separationPos+1, newValue.length());
        }

        {
            size_t separationPos = gb.find(";");

            if ( separationPos > gb.length())
                return false;

            g = gb.substr(0, separationPos);
            b = gb.substr(separationPos+1, gb.length());
        }

        SetColor(ToInt(r), ToInt(g), ToInt(b));
    }
    else if ( propertyNb == 4 ) { SetOpacity(ToFloat(newValue)); }

    return true;
}

unsigned int ParticuleEmitterObject::GetNumberOfProperties() const
{
    return 5;
}
#endif

void ParticuleEmitterObject::OnPositionChanged()
{
    text.SetX( GetX()+text.GetRect().Width/2 );
    text.SetY( GetY()+text.GetRect().Height/2 );
}

/**
 * Get the real X position of the sprite
 */
float ParticuleEmitterObject::GetDrawableX() const
{
    return text.GetPosition().x-text.GetOrigin().x;
}

/**
 * Get the real Y position of the text
 */
float ParticuleEmitterObject::GetDrawableY() const
{
    return text.GetPosition().y-text.GetOrigin().y;
}

/**
 * Width is the width of the current sprite.
 */
float ParticuleEmitterObject::GetWidth() const
{
    return text.GetRect().Width;
}

/**
 * Height is the height of the current sprite.
 */
float ParticuleEmitterObject::GetHeight() const
{
    return text.GetRect().Height;
}

/**
 * X center is computed with text rectangle
 */
float ParticuleEmitterObject::GetCenterX() const
{
    return text.GetRect().Width/2;
}

/**
 * Y center is computed with text rectangle
 */
float ParticuleEmitterObject::GetCenterY() const
{
    return text.GetRect().Height/2;
}

/**
 * Nothing to do when updating time
 */
void ParticuleEmitterObject::UpdateTime(float deltaTime)
{
	float forceMin = 50 * 0.04f;
	float forceMax = 75 * 0.08f;
	float flow = 55 * 0.20f;

	SPK::Emitter* leftWheelEmitter = dynamic_cast<SPK::Emitter*>(particleSystem->findByName("left wheel emitter"));
	SPK::Emitter* rightWheelEmitter = dynamic_cast<SPK::Emitter*>(particleSystem->findByName("right wheel emitter"));
	leftWheelEmitter->setForce(forceMin,forceMax);
	rightWheelEmitter->setForce(forceMin,forceMax);
	leftWheelEmitter->setFlow(flow);
	rightWheelEmitter->setFlow(flow);

	particleSystem->update(deltaTime);
}

/**
 * Change the color filter of the sprite object
 */
void ParticuleEmitterObject::SetColor( unsigned int r, unsigned int g, unsigned int b )
{
    colorR = r;
    colorG = g;
    colorB = b;
    text.SetColor(sf::Color(colorR, colorG, colorB, opacity));
}

void ParticuleEmitterObject::SetOpacity(float val)
{
    if ( val > 255 )
        val = 255;
    else if ( val < 0 )
        val = 0;

    opacity = val;
    text.SetColor(sf::Color(colorR, colorG, colorB, opacity));
}

void ParticuleEmitterObject::SetFont(string fontName_)
{
    fontName = fontName_;

    FontManager * fontManager = FontManager::getInstance();
    text.SetFont(*fontManager->GetFont(fontName));
    text.SetOrigin(text.GetRect().Width/2, text.GetRect().Height/2);
}

/**
 * Function destroying an extension Object.
 * Game Develop does not delete directly extension object
 * to avoid overloaded new/delete conflicts.
 */
void DestroyParticuleEmitterObject(Object * object)
{
    delete object;
}

/**
 * Function creating an extension Object.
 * Game Develop can not directly create an extension object
 */
Object * CreateParticuleEmitterObject(std::string name)
{
    return new ParticuleEmitterObject(name);
}

