/**

Game Develop - Light Extension
Copyright (c) 2008-2012 Florian Rival (Florian.Rival@gmail.com)

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

#include "GDL/Object.h"
#include "LightManager.h"
#include <boost/weak_ptr.hpp>
#include <boost/shared_ptr.hpp>
#include <SFML/Graphics/Color.hpp>
#include <SFML/System/Clock.hpp>
namespace sf
{
    class Sprite;
    class Texture;
    class Shader;
    class RenderTexture;
}
class ImageManager;
class RuntimeScene;
class Object;
class Scene;
class ImageManager;
class InitialPosition;
class RuntimeSceneLightObstacleDatas;
#if defined(GD_IDE_ONLY)
class wxBitmap;
class Game;
class wxWindow;
namespace gd { class MainFrameWrapper; }
namespace gd {class ResourcesMergingHelper;}
#endif

/**
 * Light Object
 */
class GD_EXTENSION_API LightObject : public Object
{
public :

    LightObject(std::string name_);
    virtual ~LightObject() {};
    virtual Object * Clone() const { return new LightObject(*this);}

    virtual bool LoadResources(const RuntimeScene & scene, const ImageManager & imageMgr);
    virtual bool LoadRuntimeResources(const RuntimeScene & scene, const ImageManager & imageMgr );
    virtual bool InitializeFromInitialPosition(const InitialPosition & position);

    virtual bool Draw(sf::RenderTarget & renderTarget);

    #if defined(GD_IDE_ONLY)
    virtual bool DrawEdittime(sf::RenderTarget & renderTarget);
    virtual void ExposeResources(gd::ArbitraryResourceWorker & worker);
    virtual bool GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail);

    virtual void EditObject( wxWindow* parent, Game & game_, gd::MainFrameWrapper & mainFrameWrapper_ );
    virtual wxPanel * CreateInitialPositionPanel( wxWindow* parent, const Game & game_, const Scene & scene_, const InitialPosition & position );
    virtual void UpdateInitialPositionFromPanel(wxPanel * panel, InitialPosition & position);

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

    virtual float GetWidth() const;
    virtual float GetHeight() const;
    virtual void SetWidth(float ) {};
    virtual void SetHeight(float ) {};

    virtual float GetDrawableX() const;
    virtual float GetDrawableY() const;

    virtual float GetCenterX() const;
    virtual float GetCenterY() const;

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

    virtual std::vector<RotatedRectangle> GetHitBoxes() const;

    static std::map<const Scene*, boost::weak_ptr<Light_Manager> > lightManagersList;

private:

    void UpdateGlobalLightMembers();

    float angle;

    sf::Clock updateClock;

    boost::shared_ptr<Light_Manager>  manager; ///< Keep a link to the light manager of the scene.
    Light light; ///< Light object used to render light

    bool globalLight;
    boost::shared_ptr<sf::RenderTexture> globalLightImage;
    sf::Color globalLightColor;

    static sf::Shader commonBlurEffect;
    static bool commonBlurEffectLoaded;

    #if defined(GD_IDE_ONLY)
    static sf::Texture edittimeIconImage;
    static sf::Sprite edittimeIcon;
    #endif
};

void DestroyLightObject(Object * object);
Object * CreateLightObject(std::string name);

#endif // LightObject_H
