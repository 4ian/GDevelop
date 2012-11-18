/**

Game Develop - Tiled Sprite Extension
Copyright (c) 2012 Victor Levasseur (victorlevasseur01@orange.fr)

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
#include "GDL/Object.h"
#include <boost/shared_ptr.hpp>
class SFMLTextureWrapper;
class ImageManager;
class RuntimeScene;
class Object;
class ImageManager;
class InitialPosition;
#if defined(GD_IDE_ONLY)
class wxBitmap;
class Game;
class wxWindow;
namespace gd { class MainFrameWrapper; }
#endif

/**
 * TiledSprite Object
 */
class GD_EXTENSION_API TiledSpriteObject : public Object
{
public :

    TiledSpriteObject(std::string name_);
    virtual ~TiledSpriteObject();
    virtual Object * Clone() const { return new TiledSpriteObject(*this);}

    virtual bool LoadResources(const RuntimeScene & scene, const ImageManager & imageMgr );
    virtual bool InitializeFromInitialPosition(const InitialPosition & position);

    virtual bool Draw(sf::RenderTarget & renderTarget);

    #if defined(GD_IDE_ONLY)
    virtual bool DrawEdittime(sf::RenderTarget & renderTarget);
    virtual bool GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail);
    virtual void ExposeResources(gd::ArbitraryResourceWorker & worker);

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

    virtual void OnPositionChanged() {};

    virtual float GetDrawableX() const;
    virtual float GetDrawableY() const;

    virtual float GetCenterX() const;
    virtual float GetCenterY() const;

    virtual float GetWidth() const;
    virtual float GetHeight() const;

    virtual float GetAngle() const {return angle;};
    virtual bool SetAngle(float ang) {angle = ang; return true;};

    virtual inline void SetWidth(float newWidth) { width = newWidth; };
    virtual inline void SetHeight(float newHeight) { height = newHeight; };

    virtual std::vector<Polygon2d> GetHitBoxes() const;

    std::string textureName;

private:

    float width;
    float height;
    float angle;
    bool smooth;

    boost::shared_ptr<SFMLTextureWrapper> texture;
};

void DestroyTiledSpriteObject(Object * object);
Object * CreateTiledSpriteObject(std::string name);

#endif // TILEDSPRITEOBJECT_H

