/**

GDevelop - Tile Map Extension
Copyright (c) 2014-2016 Victor Levasseur (victorlevasseur52@gmail.com)
This project is released under the MIT License.
*/

#include "TileSet.h"
#include "GDCore/Tools/Localization.h"

#include <algorithm>
#include <iostream>
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/file.h>
#include <wx/filefn.h>
#include <wx/filename.h>
#include <wx/image.h>
#endif
#include <GDCore/CommonTools.h>

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
wxBitmap TileSet::m_invalidBitmap = wxBitmap();
#endif

bool TileHitbox::operator==(const TileHitbox &other) const
{
    if(hitbox.vertices.size() == other.hitbox.vertices.size())
    {
        for(unsigned int i = 0; i < hitbox.vertices.size(); ++i)
        {
            if( fabs( hitbox.vertices[i].x - other.hitbox.vertices[i].x ) > 0.01f ||
                fabs( hitbox.vertices[i].y - other.hitbox.vertices[i].y ) > 0.01f )
                return false;
        }
        return true;
    }
    else
        return false;
}

bool TileHitbox::operator!=(const TileHitbox &other) const
{
    return !(operator==(other));
}

TileHitbox TileHitbox::Rectangle(sf::Vector2f tileSize)
{
    TileHitbox hitbox;
    hitbox.hitbox = Polygon2d::CreateRectangle(tileSize.x, tileSize.y);
    hitbox.hitbox.Move(tileSize.x/2.f, tileSize.y/2.f);

    return hitbox;
}

TileHitbox TileHitbox::Triangle(sf::Vector2f tileSize, TriangleOrientation orientation)
{
    TileHitbox hitbox;

    if(orientation != TileHitbox::BottomRight)
        hitbox.hitbox.vertices.push_back(sf::Vector2f(0,0));

    if(orientation != TileHitbox::BottomLeft)
        hitbox.hitbox.vertices.push_back(sf::Vector2f(tileSize.x,0));

    if(orientation != TileHitbox::TopLeft)
        hitbox.hitbox.vertices.push_back(tileSize);

    if(orientation != TileHitbox::TopRight)
        hitbox.hitbox.vertices.push_back(sf::Vector2f(0,tileSize.y));

    return hitbox;
}

void TileHitbox::SerializeTo(gd::SerializerElement &element) const
{
    //Serialize the polygon
    gd::String polygonStr;
    for(std::vector<sf::Vector2f>::const_iterator vertexIt = hitbox.vertices.begin(); vertexIt != hitbox.vertices.end(); vertexIt++)
    {
        if(vertexIt != hitbox.vertices.begin())
            polygonStr += "|";

        polygonStr += gd::String::From(vertexIt->x) + ";" + gd::String::From(vertexIt->y);
    }
    element.SetAttribute("polygon", polygonStr);
}

void TileHitbox::UnserializeFrom(const gd::SerializerElement &element, sf::Vector2f defaultTileSize)
{
    hitbox.vertices.clear();

    gd::String defaultPolygonStr = "0;0|"
                                    + gd::String::From(defaultTileSize.x) + ";0|"
                                    + gd::String::From(defaultTileSize.x) + ";" + gd::String::From(defaultTileSize.y) + "|"
                                    + "0;" + gd::String::From(defaultTileSize.y);
    gd::String polygonStr = element.GetStringAttribute("polygon", defaultPolygonStr);

    std::vector<gd::String> vertices = polygonStr.Split(U'|');
    for(std::vector<gd::String>::iterator vertexIt = vertices.begin(); vertexIt != vertices.end(); vertexIt++)
    {
        hitbox.vertices.push_back(sf::Vector2f(vertexIt->Split(U';')[0].To<float>(),
                                               vertexIt->Split(U';')[1].To<float>()
                                              ));
    }
}

TileSet::TileSet() : textureName(), tileSize(24, 24), tileSpacing(0, 0), m_tilesetTexture()
{

}

TileSet::~TileSet()
{

}

void TileSet::LoadResources(RuntimeGame &game)
{
    m_tilesetTexture = game.GetImageManager()->GetSFMLTexture(textureName);
}

void TileSet::LoadResources(gd::Project &game)
{
    try
    {
        gd::ImageResource & image = dynamic_cast<gd::ImageResource&>(game.GetResourcesManager().GetResource(textureName));
        //Load the resource into a wxBitmap (IDE only) and also get its SFMLTextureWrapper
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
        //Force to change the working directory to make it work
        wxString oldWorkingDir = wxGetCwd();
        wxSetWorkingDirectory(wxFileName::FileName(game.GetProjectFile()).GetPath());
#endif

        m_tilesetTexture = game.GetImageManager()->GetSFMLTexture(textureName);

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
        wxSetWorkingDirectory(oldWorkingDir);
        if ( wxFileExists(image.GetAbsoluteFile(game)) )
        {
            m_tilesetBitmap.LoadFile(image.GetAbsoluteFile(game), wxBITMAP_TYPE_ANY);
        }
#endif

        //Readjust the m_collidable std::vector according to the number of tiles
        m_collidable.resize(GetTilesCount(), true);
    }
    catch(...)
    {
        m_tilesetTexture = std::shared_ptr<SFMLTextureWrapper>();
    }
}

void TileSet::ResetHitboxes()
{
    m_collidable.clear();
    m_hitboxes.clear();

    if (IsDirty())
        return;

    m_collidable.assign(GetTilesCount(), true);
}

int TileSet::GetTileIDFromPosition(sf::Vector2f position) const
{
    int columns = GetColumnsCount();
    int rows = GetRowsCount();

    int tileColumn = position.x / tileSize.x;
    int tileRow = position.y / tileSize.y;

    return (tileColumn * columns + tileRow);
}

int TileSet::GetTileIDFromCell(int col, int row) const
{
    int columns = GetColumnsCount();
    int rows = GetRowsCount();

    return (row * columns + col);
}

sf::Vector2u TileSet::GetTileCellFromID(int id) const
{
    int columns = GetColumnsCount();
    int rows = GetRowsCount();
    return sf::Vector2u(id - (id / columns) * columns, id / columns);
}

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
const wxBitmap& TileSet::GetWxBitmap() const
{
    return m_tilesetBitmap;
}
#endif

sf::Texture& TileSet::GetTexture()
{
    return m_tilesetTexture->texture;
}

const sf::Texture& TileSet::GetTexture() const
{
    return m_tilesetTexture->texture;
}

TileTextureCoords TileSet::GetTileTextureCoords(int id) const
{
    //Calculate the tile coords
    sf::Vector2u cell = GetTileCellFromID(id);

    TileTextureCoords tileCoords;
    tileCoords.topLeft = sf::Vector2f(cell.x * (tileSize.x + tileSpacing.x),
                                      cell.y * (tileSize.y + tileSpacing.y));
    tileCoords.topRight = sf::Vector2f(cell.x * (tileSize.x + tileSpacing.x) + tileSize.x,
                                       cell.y * (tileSize.y + tileSpacing.y));
    tileCoords.bottomRight = sf::Vector2f(cell.x * (tileSize.x + tileSpacing.x) + tileSize.x,
                                          cell.y * (tileSize.y + tileSpacing.y) + tileSize.y);
    tileCoords.bottomLeft = sf::Vector2f(cell.x * (tileSize.x + tileSpacing.x),
                                         cell.y * (tileSize.y + tileSpacing.y) + tileSize.y);
    return tileCoords;
}

sf::Vector2u TileSet::GetSize() const
{
    if(!m_tilesetTexture)
        return sf::Vector2u(0, 0);

    return m_tilesetTexture->texture.getSize();
}

bool TileSet::IsTileCollidable(int id) const
{
    return m_collidable[id];
}

void TileSet::SetTileCollidable(int id, bool collidable)
{
    m_collidable[id] = collidable;
}

#if defined(GD_IDE_ONLY)
void TileSet::StripUselessHitboxes()
{
    auto it = m_hitboxes.begin();
    while(it != m_hitboxes.end())
    {
        if( (it->second) == TileHitbox::Rectangle(tileSize) ) //This is an useless hitbox, remove it.
            it = m_hitboxes.erase(it);
        else
            ++it;
    }
}
#endif

TileHitbox& TileSet::GetTileHitboxRef(int id)
{
    if(m_hitboxes.count(id) == 0)
        m_hitboxes[id] = TileHitbox::Rectangle(tileSize);
    return m_hitboxes[id];
}

TileHitbox TileSet::GetTileHitbox(int id) const
{
    if(m_hitboxes.count(id) == 0)
        return TileHitbox::Rectangle(tileSize);
    else
        return m_hitboxes.at(id);
}

int TileSet::GetColumnsCount() const
{
    return (m_tilesetTexture->texture.getSize().x + tileSpacing.x) / (tileSize.x + tileSpacing.x);
}

int TileSet::GetRowsCount() const
{
    return (m_tilesetTexture->texture.getSize().y + tileSpacing.y) / (tileSize.y + tileSpacing.y);
}

#if defined(GD_IDE_ONLY)
void TileSet::SerializeTo(gd::SerializerElement &element) const
{
    element.SetAttribute("version", 2);
    element.SetAttribute("textureName", textureName);
    element.SetAttribute("tileSizeX", tileSize.x);
    element.SetAttribute("tileSizeY", tileSize.y);
    element.SetAttribute("tileSpacingX", tileSpacing.x);
    element.SetAttribute("tileSpacingY", tileSpacing.y);

    //Save if it is collidable or not
    gd::SerializerElement &collidableElem = element.AddChild("collidable");
    for(auto it = m_collidable.begin(); it != m_collidable.end(); ++it)
    {
        gd::SerializerElement &tileElem = collidableElem.AddChild("tile");
        tileElem.SetAttribute("collidable", *it);
    }

    //Save polygons hitboxes
    gd::SerializerElement &tilesElem = element.AddChild("hitboxes");
    for(auto it = m_hitboxes.begin(); it != m_hitboxes.end(); ++it)
    {
        gd::SerializerElement &hitboxElem = tilesElem.AddChild("tileHitbox");
        hitboxElem.SetAttribute("tileId", it->first);
        it->second.SerializeTo(hitboxElem);
    }
}
#endif

void TileSet::UnserializeFrom(const gd::SerializerElement &element)
{
    int serializationVersion = element.GetIntAttribute("version", 1);

    textureName = element.GetStringAttribute("textureName", "");
    tileSize.x = element.GetIntAttribute("tileSizeX", 32);
    tileSize.y = element.GetIntAttribute("tileSizeY", 32);
    tileSpacing.x = element.GetIntAttribute("tileSpacingX", 0);
    tileSpacing.y = element.GetIntAttribute("tileSpacingY", 0);

    ResetHitboxes();
    m_collidable.clear();

    if(serializationVersion == 1)
    {
        if(element.HasChild("hitboxes"))
        {
            gd::SerializerElement &tilesElem = element.GetChild("hitboxes");
            tilesElem.ConsiderAsArrayOf("tileHitbox");
            for(int i = 0; i < tilesElem.GetChildrenCount("tileHitbox"); i++)
            {
                m_collidable.push_back(tilesElem.GetChild(i).GetBoolAttribute("collidable", true));
                TileHitbox newHitbox;
                newHitbox.UnserializeFrom(tilesElem.GetChild(i), tileSize);
                if(newHitbox != TileHitbox::Rectangle(tileSize))
                    m_hitboxes[i] = newHitbox;
            }
        }
    }
    else if(serializationVersion == 2)
    {
        gd::SerializerElement &collidableElem = element.GetChild("collidable");
        collidableElem.ConsiderAsArrayOf("tile");
        for(int i = 0; i < collidableElem.GetChildrenCount("tile"); i++)
        {
            m_collidable.push_back(collidableElem.GetChild(i).GetBoolAttribute("collidable", true));
        }

        gd::SerializerElement &hitboxesElem = element.GetChild("hitboxes");
        hitboxesElem.ConsiderAsArrayOf("tileHitbox");
        for(int i = 0; i < hitboxesElem.GetChildrenCount("tileHitbox"); i++)
        {
            m_hitboxes[hitboxesElem.GetChild(i).GetIntAttribute("tileId", -1)].UnserializeFrom(hitboxesElem.GetChild(i), tileSize);
        }
    }
}
