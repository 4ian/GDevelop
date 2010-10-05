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

SPK::SPK_ID BaseSparkSystemID = SPK::NO_ID;

// creates and register the base system
SPK::SPK_ID createParticleSystemBase(sf::Image* texture)
{
	// Creates the model
	SPK::Model* sparkModel = SPK::Model::create(SPK::FLAG_RED | SPK::FLAG_GREEN | SPK::FLAG_BLUE | SPK::FLAG_ALPHA,
		SPK::FLAG_ALPHA,
		SPK::FLAG_GREEN | SPK::FLAG_BLUE);
	sparkModel->setParam(SPK::PARAM_RED,1.0f);
	sparkModel->setParam(SPK::PARAM_BLUE,0.0f,0.2f);
	sparkModel->setParam(SPK::PARAM_GREEN,0.2f,1.0f);
	sparkModel->setParam(SPK::PARAM_ALPHA,0.8f,0.0f);
	sparkModel->setLifeTime(0.2f,0.6f);

	// Creates the renderer
	SPK::SFML::SFMLLineRenderer* sparkRenderer = SPK::SFML::SFMLLineRenderer::create(0.1f,1.0f);
	sparkRenderer->setBlendMode(sf::Blend::Add);
	sparkRenderer->setGroundCulling(true);

	// Creates the zone
	SPK::Sphere* sparkSource = SPK::Sphere::create(SPK::Vector3D(0.0f,0.0f,10.0f),5.0f);

	// Creates the emitter
	SPK::SphericEmitter* sparkEmitter = SPK::SphericEmitter::create(SPK::Vector3D(0.0f,0.0f,1.0f),3.14159f / 4.0f,3.0f * 3.14159f / 4.0f);
	sparkEmitter->setForce(50.0f,150.0f);
	sparkEmitter->setZone(sparkSource);
	sparkEmitter->setTank(25);
	sparkEmitter->setFlow(-1);

	// Creates the Group
	SPK::Group* sparkGroup = SPK::Group::create(sparkModel,25);
	sparkGroup->setRenderer(sparkRenderer);
	sparkGroup->addEmitter(sparkEmitter);
	sparkGroup->setGravity(SPK::Vector3D(0.0f,0.0f,-200.0f));
	sparkGroup->setFriction(2.0f);

	// Creates the System
	SPK::SFML::SFMLSystem* sparkSystem = SPK::SFML::SFMLSystem::create();
	sparkSystem->addGroup(sparkGroup);

	// Defines which objects will be shared by all systems
	sparkModel->setShared(true);
	sparkRenderer->setShared(true);

	// Creates the base and gets the ID
	return sparkSystem->getID();
}

// creates a particle system from the base system
SPK::SFML::SFMLSystem* createParticleSystem(const sf::Vector2f& pos)
{
	SPK::SFML::SFMLSystem* sparkSystem = SPK_Copy(SPK::SFML::SFMLSystem,BaseSparkSystemID);
	sparkSystem->SetPosition(pos);

	return sparkSystem;
}

// destroy a particle system
void destroyParticleSystem(SPK::SFML::SFMLSystem*& system)
{
	SPK_Destroy(system);
	system = NULL;
}

bool ParticuleEmitterObject::LoadRuntimeResources(const ImageManager & imageMgr )
{
    cout << "called";

	// Loads particle texture
	if (!textureParticle.LoadFromFile("D:/Florian/Programmation/GameDevelop/Extensions/ParticuleSystem/SPARK/demos/bin/res/flare.png"))
		cout << "loading error2";

	// random seed
	SPK::randomSeed = static_cast<unsigned int>(time(NULL));

	// Sets the update step
	SPK::System::setClampStep(true,0.1f);			// clamp the step to 100 ms
	SPK::System::useAdaptiveStep(0.001f,0.01f);		// use an adaptive step from 1ms to 10ms (1000fps to 100fps)

	SPK::SFML::SFMLRenderer::setZFactor(1.0f);
	SPK::SFML::setCameraPosition(SPK::SFML::CAMERA_CENTER,SPK::SFML::CAMERA_BOTTOM,static_cast<float>(1440),0.0f);
	BaseSparkSystemID = createParticleSystemBase(&textureParticle);

    particleSystem = createParticleSystem(sf::Vector2f(GetX(), GetY()));

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

    window.Draw(*particleSystem);

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
    if ( particleSystem )
        particleSystem->SetPosition(GetX(), GetY());
}

/**
 * Get the real X position of the sprite
 */
float ParticuleEmitterObject::GetDrawableX() const
{
    return GetX();
}

/**
 * Get the real Y position of the text
 */
float ParticuleEmitterObject::GetDrawableY() const
{
    return GetY();
}

/**
 * Width is the width of the current sprite.
 */
float ParticuleEmitterObject::GetWidth() const
{
    return 0;
}

/**
 * Height is the height of the current sprite.
 */
float ParticuleEmitterObject::GetHeight() const
{
    return 0;
}

/**
 * X center is computed with text rectangle
 */
float ParticuleEmitterObject::GetCenterX() const
{
    return 0;
}

/**
 * Y center is computed with text rectangle
 */
float ParticuleEmitterObject::GetCenterY() const
{
    return 0;
}

/**
 * Nothing to do when updating time
 */
void ParticuleEmitterObject::UpdateTime(float deltaTime)
{
	particleSystem->update (deltaTime);
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

