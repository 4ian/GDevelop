/**

Game Develop - Tile Map Extension
Copyright (c) 2014 Victor Levasseur (victorlevasseur52@gmail.com)

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

#ifndef RUNTIMETILEMAPOBJECT_H
#define RUNTIMETILEMAPOBJECT_H

#include <string>

#include "GDCpp/Object.h"
#include "GDCpp/RuntimeObject.h"
#include <GDCpp/Polygon.h>
#include <boost/shared_ptr.hpp>
#include <SFML/Graphics/VertexArray.hpp>

#include "TileMapProxies.h"

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

class GD_EXTENSION_API RuntimeTileMapObject : public RuntimeObject
{

public :

    RuntimeTileMapObject(RuntimeScene & scene, const gd::Object & object);
    virtual ~RuntimeTileMapObject() {};
    virtual RuntimeObject * Clone() const { return new RuntimeTileMapObject(*this);}

    virtual bool Draw(sf::RenderTarget & renderTarget);

    virtual float GetWidth() const;
    virtual float GetHeight() const;

    virtual float GetAngle() const {return 0;};
    virtual bool SetAngle(float ang) {return false;};

    virtual void SetWidth(float newWidth) {};
    virtual void SetHeight(float newHeight) {};

    virtual void OnPositionChanged();

    #if defined(GD_IDE_ONLY)
    virtual void GetPropertyForDebugger (unsigned int propertyNb, std::string & name, std::string & value) const;
    virtual bool ChangeProperty(unsigned int propertyNb, std::string newValue);
    virtual unsigned int GetNumberOfProperties() const;
    #endif

    virtual std::vector<Polygon2d> GetHitBoxes() const;

    float GetTileWidth() const;
    float GetTileHeight() const;

    float GetMapWidth() const;
    float GetMapHeight() const;

    float GetTile(int layer, int column, int row);
    void SetTile(int layer, int column, int row, int tileId);

    float GetColumnAt(float x);
    float GetRowAt(float y);

    TileSetProxy tileSet;
    TileMapProxy tileMap;

private:

    sf::VertexArray vertexArray;
    std::vector<Polygon2d> hitboxes;

    bool needGeneration;

    boost::shared_ptr<SFMLTextureWrapper> texture;

    float oldX;
    float oldY;
};

bool GD_EXTENSION_API SingleTileCollision(std::map<std::string, std::vector<RuntimeObject*>*> tileMapList,
                         int layer,
                         int column,
                         int row,
                         std::map<std::string, std::vector<RuntimeObject*>*> objectLists,
                         bool conditionInverted);

void DestroyRuntimeTileMapObject(RuntimeObject * object);
RuntimeObject * CreateRuntimeTileMapObject(RuntimeScene & scene, const gd::Object & object);

#endif