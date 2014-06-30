/**

Game Develop - Light Extension
Copyright (c) 2008-2014 Florian Rival (Florian.Rival@gmail.com)

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

#ifndef LightObject_H
#define LightObject_H

#include "GDCpp/Object.h"
#include "GDCpp/RuntimeObject.h"
#include <boost/weak_ptr.hpp>
#include <boost/shared_ptr.hpp>
#include <SFML/Graphics/Color.hpp>
#include <SFML/System/Clock.hpp>
#include "Light.h"
namespace sf
{
    class Sprite;
    class Texture;
    class Shader;
    class RenderTexture;
}
namespace gd { class ImageManager; }
class RuntimeScene;
namespace gd { class Object; }
namespace gd { class Layout; }
namespace gd { class ImageManager; }
namespace gd { class InitialInstance; }
class RuntimeSceneLightObstacleDatas;
class Light_Manager;
#if defined(GD_IDE_ONLY)
class wxBitmap;
namespace gd { class Project; }
class wxWindow;
namespace gd { class MainFrameWrapper; }
namespace gd {class ResourcesMergingHelper;}
#endif

/** \brief Light Object used for storage and the IDE
 */
class GD_EXTENSION_API LightObject : public gd::Object
{
public :

    LightObject(std::string name_);
    virtual ~LightObject() {};
    virtual gd::Object * Clone() const { return new LightObject(*this);}

    #if defined(GD_IDE_ONLY)
    virtual void DrawInitialInstance(gd::InitialInstance & instance, sf::RenderTarget & renderTarget, gd::Project & project, gd::Layout & layout);
    virtual sf::Vector2f GetInitialInstanceDefaultSize(gd::InitialInstance & instance, gd::Project & project, gd::Layout & layout) const;
    virtual bool GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail) const;
    virtual void EditObject( wxWindow* parent, gd::Project & game_, gd::MainFrameWrapper & mainFrameWrapper_ );
    static void LoadEdittimeIcon();
    #endif

    float GetIntensity() const { return light.GetIntensity(); };
    float GetRadius() const { return light.GetRadius(); };
    int GetQuality() const { return light.GetQuality(); };
    sf::Color GetColor() const { return light.GetColor(); };

    void SetIntensity(float intensity) { light.SetIntensity(intensity); };
    void SetRadius(float radius) { light.SetRadius(radius); };
    void SetQuality(int quality) { light.SetQuality(quality); };
    void SetColor(const sf::Color & color) { light.SetColor(color); };

    bool IsGlobalLight() const { return globalLight; };
    void SetGlobalLight(bool global) { globalLight = global; };
    sf::Color GetGlobalColor() const { return globalLightColor; };
    void SetGlobalColor(const sf::Color & color) { globalLightColor = color; };

private:
    Light light; ///< Light object used to store the parameters. This object is *never* rendered.

    bool globalLight;
    sf::Color globalLightColor;

    virtual void DoUnserializeFrom(gd::Project & project, const gd::SerializerElement & element);
    #if defined(GD_IDE_ONLY)
    virtual void DoSerializeTo(gd::SerializerElement & element) const;

    static sf::Texture edittimeIconImage;
    static sf::Sprite edittimeIcon;
    #endif
};

/** \brief Light object used by the game engine.
 */
class GD_EXTENSION_API RuntimeLightObject : public RuntimeObject
{
public :

    RuntimeLightObject(RuntimeScene & scene, const gd::Object & object);
    virtual ~RuntimeLightObject() {};
    virtual RuntimeObject * Clone() const { return new RuntimeLightObject(*this);}

    virtual bool Draw(sf::RenderTarget & renderTarget);

    virtual void OnPositionChanged();

    virtual float GetWidth() const { return 32; };
    virtual float GetHeight() const { return 32; };

    virtual bool SetAngle(float newAngle) { angle = newAngle; return true;};
    virtual float GetAngle() const {return angle;};

    float GetIntensity() const { return light.GetIntensity(); };
    float GetRadius() const { return light.GetRadius(); };
    int GetQuality() const { return light.GetQuality(); };
    sf::Color GetColor() const { return light.GetColor(); };

    void SetIntensity(float intensity) { light.SetIntensity(intensity); };
    void SetRadius(float radius) { light.SetRadius(radius); };
    void SetQuality(int quality) { light.SetQuality(quality); };
    void SetColor(const sf::Color & color) { light.SetColor(color); };

    bool IsGlobalLight() const { return globalLight; };
    void SetGlobalLight(bool global) { globalLight = global; UpdateGlobalLightMembers(); };
    sf::Color GetGlobalColor() const { return globalLightColor; };
    void SetGlobalColor(const sf::Color & color) { globalLightColor = color; };

    /**
     * Only used internally by GD events generated code
     */
    void SetGlobalColor(const std::string & color);

    /**
     * Only used internally by GD events generated code
     */
    void SetColor(const std::string & color);

    #if defined(GD_IDE_ONLY)
    virtual void GetPropertyForDebugger (unsigned int propertyNb, std::string & name, std::string & value) const;
    virtual bool ChangeProperty(unsigned int propertyNb, std::string newValue);
    virtual unsigned int GetNumberOfProperties() const;
    #endif

    static std::map<const gd::Layout*, boost::weak_ptr<Light_Manager> > lightManagersList;

private:
    void UpdateGlobalLightMembers();

    float angle;

    sf::Clock updateClock;

    boost::shared_ptr<Light_Manager>  manager; ///< Keep a link to the light manager of the scene.
    Light light; ///< Light object used to render light

    bool globalLight;
    boost::shared_ptr<sf::RenderTexture> globalLightImage;
    sf::Color globalLightColor;
};

void DestroyLightObject(gd::Object * object);
gd::Object * CreateLightObject(std::string name);

void DestroyRuntimeLightObject(RuntimeObject * object);
RuntimeObject * CreateRuntimeLightObject(RuntimeScene & scene, const gd::Object & object);

#endif // LightObject_H

