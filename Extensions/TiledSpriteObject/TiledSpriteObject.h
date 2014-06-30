/**

Game Develop - Tiled Sprite Extension
Copyright (c) 2012 Victor Levasseur (victorlevasseur01@orange.fr)
Copyright (c) 2013-2014 Florian Rival (Florian.Rival@gmail.com)

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

#ifndef TILEDSPRITEOBJECT_H
#define TILEDSPRITEOBJECT_H
#include "GDCpp/Object.h"
#include "GDCpp/RuntimeObject.h"
#include <boost/shared_ptr.hpp>
class SFMLTextureWrapper;
class RuntimeScene;
namespace gd { class ImageManager; }
namespace gd { class InitialInstance; }
#if defined(GD_IDE_ONLY)
namespace gd { class Project; }
namespace gd { class MainFrameWrapper; }
class wxBitmap;
class wxWindow;
#endif

/**
 * TiledSprite Object
 */
class GD_EXTENSION_API TiledSpriteObject : public gd::Object
{
public :

    TiledSpriteObject(std::string name_);
    virtual ~TiledSpriteObject() {};
    virtual gd::Object * Clone() const { return new TiledSpriteObject(*this);}

    #if defined(GD_IDE_ONLY)
    virtual bool GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail) const;
    virtual void ExposeResources(gd::ArbitraryResourceWorker & worker);

    virtual void EditObject( wxWindow* parent, gd::Project & game_, gd::MainFrameWrapper & mainFrameWrapper_ );
    virtual void LoadResources(gd::Project & project, gd::Layout & layout);
    virtual void DrawInitialInstance(gd::InitialInstance & instance, sf::RenderTarget & renderTarget, gd::Project & project, gd::Layout & layout);
    virtual sf::Vector2f GetInitialInstanceDefaultSize(gd::InitialInstance & instance, gd::Project & project, gd::Layout & layout) const;
    #endif

    virtual float GetWidth() const { return width; };
    virtual float GetHeight() const { return height; };

    virtual void SetWidth(float newWidth) { width = newWidth; };
    virtual void SetHeight(float newHeight) { height = newHeight; };

    void SetTexture(const std::string & newTextureName) { textureName = newTextureName; };
    const std::string & GetTexture() const { return textureName; };

    std::string textureName;

private:

    virtual void DoUnserializeFrom(gd::Project & project, const gd::SerializerElement & element);
    #if defined(GD_IDE_ONLY)
    virtual void DoSerializeTo(gd::SerializerElement & element) const;
    #endif

    float width;
    float height;
    bool smooth;

    boost::shared_ptr<SFMLTextureWrapper> texture;
};

class GD_EXTENSION_API RuntimeTiledSpriteObject : public RuntimeObject
{
public :

    RuntimeTiledSpriteObject(RuntimeScene & scene, const gd::Object & object);
    virtual ~RuntimeTiledSpriteObject() {};
    virtual RuntimeObject * Clone() const { return new RuntimeTiledSpriteObject(*this);}

    virtual bool Draw(sf::RenderTarget & renderTarget);

    virtual float GetWidth() const { return width; };
    virtual float GetHeight() const { return height; };

    virtual float GetAngle() const {return angle;};
    virtual bool SetAngle(float ang) {angle = ang; return true;};

    virtual void SetWidth(float newWidth) { width = newWidth; };
    virtual void SetHeight(float newHeight) { height = newHeight; };

    void SetXOffset(float xOffset_) { xOffset = xOffset_; };
    float GetXOffset() const { return xOffset; };
    void SetYOffset(float yOffset_) { yOffset = yOffset_; };
    float GetYOffset() const { return yOffset; };

    void ChangeAndReloadImage(const std::string &texture, const RuntimeScene &scene);

    #if defined(GD_IDE_ONLY)
    virtual void GetPropertyForDebugger (unsigned int propertyNb, std::string & name, std::string & value) const;
    virtual bool ChangeProperty(unsigned int propertyNb, std::string newValue);
    virtual unsigned int GetNumberOfProperties() const;
    #endif

    std::string textureName;

private:

    float width;
    float height;
    float angle;
    bool smooth;
    float xOffset;
    float yOffset;

    boost::shared_ptr<SFMLTextureWrapper> texture;
};

void DestroyTiledSpriteObject(gd::Object * object);
gd::Object * CreateTiledSpriteObject(std::string name);

void DestroyRuntimeTiledSpriteObject(RuntimeObject * object);
RuntimeObject * CreateRuntimeTiledSpriteObject(RuntimeScene & scene, const gd::Object & object);
#endif // TILEDSPRITEOBJECT_H