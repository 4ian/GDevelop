/**

GDevelop - Tile Map Extension
Copyright (c) 2014-2016 Victor Levasseur (victorlevasseur52@gmail.com)
This project is released under the MIT License.
*/

#ifndef RUNTIMETILEMAPOBJECT_H
#define RUNTIMETILEMAPOBJECT_H

#include <string>

#include "GDCpp/Runtime/Project/Object.h"
#include "GDCpp/Runtime/RuntimeObject.h"
#include "GDCpp/Runtime/Polygon2d.h"
#include <memory>
#include <SFML/Graphics/VertexArray.hpp>

#include "TileMapProxies.h"

class SFMLTextureWrapper;
class RuntimeScene;
class TileMapObject;
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

    RuntimeTileMapObject(RuntimeScene & scene, const TileMapObject & tileMapObject);
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
    virtual void GetPropertyForDebugger (std::size_t propertyNb, gd::String & name, gd::String & value) const;
    virtual bool ChangeProperty(std::size_t propertyNb, gd::String newValue);
    virtual std::size_t GetNumberOfProperties() const;
    #endif

    virtual std::vector<Polygon2d> GetHitBoxes() const;

    float GetTileWidth() const;
    float GetTileHeight() const;

    float GetMapWidth() const;
    float GetMapHeight() const;

    void SetMapSize(int width, int height);

    float GetTile(int layer, int column, int row);
    void SetTile(int layer, int column, int row, int tileId);

    float GetColumnAt(float x);
    float GetRowAt(float y);

    gd::String SaveAsString() const;
    void LoadFromString(const gd::String &str);

    void ChangeTexture(const gd::String &textureName, RuntimeScene &scene);

    TileSetProxy tileSet;
    TileMapProxy tileMap;

private:

    sf::VertexArray vertexArray;
    std::vector<Polygon2d> hitboxes;

    bool needGeneration;

    std::shared_ptr<SFMLTextureWrapper> texture;

    float oldX;
    float oldY;
};

bool GD_EXTENSION_API SingleTileCollision(std::map<gd::String, std::vector<RuntimeObject*>*> tileMapList,
                         int layer,
                         int column,
                         int row,
                         std::map<gd::String, std::vector<RuntimeObject*>*> objectLists,
                         bool conditionInverted);

#endif
