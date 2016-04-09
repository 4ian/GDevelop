/**

GDevelop - Tile Map Extension
Copyright (c) 2014-2016 Victor Levasseur (victorlevasseur52@gmail.com)
This project is released under the MIT License.
*/

#include <math.h>
#include <iostream>

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/bitmap.h> //Must be placed first, otherwise we get errors relative to "cannot convert 'const TCHAR*'..." in wx/msw/winundef.h
#include <wx/log.h>
#include <wx/panel.h>
#endif
#include "TileMapObject.h"
#include <SFML/Graphics.hpp>
#include "GDCore/Tools/Localization.h"
#include "GDCpp/Runtime/Project/Object.h"
#include "GDCpp/Runtime/Project/Project.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/RuntimeGame.h"
#include "GDCpp/Runtime/ImageManager.h"
#include "GDCpp/Runtime/FontManager.h"
#include "GDCpp/Runtime/Project/InitialInstance.h"
#include "GDCpp/Runtime/Polygon2d.h"
#include "GDCpp/Runtime/PolygonCollision.h"
#include "GDCpp/Extensions/Builtin/ObjectTools.h"
#include "GDCpp/Runtime/Serialization/SerializerElement.h"
#include "GDCpp/Runtime/CommonTools.h"

#include "TileMap.h"
#include "TileSet.h"
#include "TileMapTools.h"

#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "IDE/Dialogs/TileMapObjectEditor.h"
#endif

using namespace std;

/**
 * TileMapObject
 */

TileMapObject::TileMapObject(gd::String name_) :
    Object(name_),
    tileSet(),
    tileMap(),
    vertexArray(sf::Quads)
{
}

void TileMapObject::DoUnserializeFrom(gd::Project & project, const gd::SerializerElement & element)
{
    if(element.HasChild("tileSet"))
    {
        tileSet.Get().UnserializeFrom(element.GetChild("tileSet"));
    }
    if(element.HasChild("tileMap"))
    {
        tileMap.Get().UnserializeFrom(element.GetChild("tileMap"));
    }
}

float TileMapObject::GetWidth() const
{
    if(tileSet.Get().IsDirty() || tileMap.Get().GetColumnsCount() == 0 || tileMap.Get().GetRowsCount() == 0)
        return 200.f;
    else
        return tileMap.Get().GetColumnsCount() * tileSet.Get().tileSize.x;
}

float TileMapObject::GetHeight() const
{
    if(tileSet.Get().IsDirty() || tileMap.Get().GetColumnsCount() == 0 || tileMap.Get().GetRowsCount() == 0)
        return 150.f;
    else
        return tileMap.Get().GetRowsCount() * tileSet.Get().tileSize.y;
}

#if defined(GD_IDE_ONLY)
void TileMapObject::DoSerializeTo(gd::SerializerElement & element) const
{
    tileSet.Get().SerializeTo(element.AddChild("tileSet"));
    tileMap.Get().SerializeTo(element.AddChild("tileMap"));
}

void TileMapObject::LoadResources(gd::Project & project, gd::Layout & layout)
{
    tileSet.Get().LoadResources(project);
    vertexArray = TileMapExtension::GenerateVertexArray(tileSet.Get(), tileMap.Get());
}

sf::Vector2f TileMapObject::GetInitialInstanceDefaultSize(gd::InitialInstance & instance, gd::Project & project, gd::Layout & layout) const
{
    if(tileSet.Get().IsDirty() || tileMap.Get().GetColumnsCount() == 0 || tileMap.Get().GetRowsCount() == 0)
        return sf::Vector2f(200.f, 150.f);
    else
        return sf::Vector2f(tileMap.Get().GetColumnsCount() * tileSet.Get().tileSize.x, tileMap.Get().GetRowsCount() * tileSet.Get().tileSize.y);
}

/**
 * Render object at edittime
 */
void TileMapObject::DrawInitialInstance(gd::InitialInstance & instance, sf::RenderTarget & renderTarget, gd::Project & project, gd::Layout & layout)
{
    if(tileSet.Get().IsDirty())
        return;

    //Get the current view
    sf::View currentView = renderTarget.getView();
    sf::Vector2f centerPos = currentView.getCenter();

    //Construct the transform
    sf::Transform transform;
    transform.translate(instance.GetX() + centerPos.x - floor(centerPos.x),
                        instance.GetY() + centerPos.y - floor(centerPos.y));

    //Unsmooth the texture
    bool wasSmooth = tileSet.Get().GetTexture().isSmooth();
    tileSet.Get().GetTexture().setSmooth(false);

    //Draw the tilemap
    renderTarget.draw(vertexArray, sf::RenderStates(sf::BlendAlpha, transform, &tileSet.Get().GetTexture(), NULL));

    tileSet.Get().GetTexture().setSmooth(wasSmooth);
}

void TileMapObject::ExposeResources(gd::ArbitraryResourceWorker & worker)
{
    worker.ExposeImage(tileSet.Get().textureName);
}

bool TileMapObject::GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail) const
{
#if !defined(GD_NO_WX_GUI)
    thumbnail = wxBitmap("CppPlatform/Extensions/TileMapIcon24.png", wxBITMAP_TYPE_ANY);
#endif

    return true;
}

void TileMapObject::EditObject( wxWindow* parent, gd::Project & game, gd::MainFrameWrapper & mainFrameWrapper )
{
#if !defined(GD_NO_WX_GUI)
    TileMapObjectEditor dialog(parent, game, *this, mainFrameWrapper);
    dialog.ShowModal();
#endif
}
#endif
