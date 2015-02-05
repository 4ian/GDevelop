/**

GDevelop - Tile Map Extension
Copyright (c) 2014-2015 Victor Levasseur (victorlevasseur52@gmail.com)
This project is released under the MIT License.
*/

#include "TileSet.h"

#include <algorithm>
#include <iostream>
#ifdef GD_IDE_ONLY
#include <wx/file.h>
#include <wx/filefn.h>
#include <wx/filename.h>
#endif
#include <GDCore/CommonTools.h>

#ifdef GD_IDE_ONLY
wxBitmap TileSet::m_invalidBitmap = wxBitmap();
#endif

TileHitbox TileHitbox::Rectangle(sf::Vector2f tileSize)
{
    TileHitbox hitbox;
    hitbox.collidable = true;
    hitbox.hitbox = Polygon2d::CreateRectangle(tileSize.x, tileSize.y);
    hitbox.hitbox.Move(tileSize.x/2.f, tileSize.y/2.f);

    return hitbox;
}

TileHitbox TileHitbox::Triangle(sf::Vector2f tileSize, TriangleOrientation orientation)
{
    TileHitbox hitbox;
    hitbox.collidable = true;

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
    element.SetAttribute("collidable", collidable);

    //Serialize the polygon
    std::string polygonStr;
    for(std::vector<sf::Vector2f>::const_iterator vertexIt = hitbox.vertices.begin(); vertexIt != hitbox.vertices.end(); vertexIt++)
    {
        if(vertexIt != hitbox.vertices.begin())
            polygonStr += "|";

        polygonStr += gd::ToString(vertexIt->x) + ";" + gd::ToString(vertexIt->y);
    }
    element.SetAttribute("polygon", polygonStr);
}

void TileHitbox::UnserializeFrom(const gd::SerializerElement &element, sf::Vector2f defaultTileSize)
{
    collidable = element.GetBoolAttribute("collidable", true);

    hitbox.vertices.clear();

    std::string defaultPolygonStr = "0;0|"
                                    + gd::ToString(defaultTileSize.x) + ";0|"
                                    + gd::ToString(defaultTileSize.x) + ";" + gd::ToString(defaultTileSize.y) + "|"
                                    + "0;" + gd::ToString(defaultTileSize.y);
    std::string polygonStr = element.GetStringAttribute("polygon", defaultPolygonStr);

    std::vector<std::string> vertices = gd::SplitString<std::string>(polygonStr, '|');
    for(std::vector<std::string>::iterator vertexIt = vertices.begin(); vertexIt != vertices.end(); vertexIt++)
    {
        hitbox.vertices.push_back(sf::Vector2f(gd::ToFloat(gd::SplitString<std::string>(*vertexIt, ';')[0]),
                                               gd::ToFloat(gd::SplitString<std::string>(*vertexIt, ';')[1])
                                              ));
    }
}

TileSet::TileSet() : textureName(), tileSize(24, 24), tileSpacing(0, 0), m_tilesetTexture(), m_dirty(true)
{

}

TileSet::~TileSet()
{

}

void TileSet::LoadResources(RuntimeGame &game)
{
    m_dirty = true;
    m_tilesetTexture = game.GetImageManager()->GetSFMLTexture(textureName);
}

void TileSet::LoadResources(gd::Project &game)
{
    m_dirty = true;

    if(game.GetResourcesManager().HasResource(textureName))
    {
        gd::ImageResource & image = dynamic_cast<gd::ImageResource&>(game.GetResourcesManager().GetResource(textureName));
        //Load the resource into a wxBitmap (IDE only) and also get its SFMLTextureWrapper
#ifdef GD_IDE_ONLY
        //Force to change the working directory to make it work
        wxString oldWorkingDir = wxGetCwd();
        std::cout << "Old WD : " << oldWorkingDir << std::endl;
        wxSetWorkingDirectory(wxFileName::FileName(game.GetProjectFile()).GetPath());
#endif
        m_tilesetTexture = game.GetImageManager()->GetSFMLTexture(textureName);
#ifdef GD_IDE_ONLY
        wxSetWorkingDirectory(oldWorkingDir);
        if ( wxFileExists(image.GetAbsoluteFile(game)) )
        {
            std::cout << "Loading for tileset : " << image.GetAbsoluteFile(game) << std::endl;
            wxBitmap bmp( image.GetAbsoluteFile(game), wxBITMAP_TYPE_ANY);
            m_tilesetBitmap = bmp;
        }
#endif
    }
    else
    {
        m_tilesetTexture = boost::shared_ptr<SFMLTextureWrapper>();
    }
}

void TileSet::Generate()
{
    m_dirty = true;

    if (!m_tilesetTexture)
        return;

    std::cout << "Generating texture coords..." << std::endl;

    //Calculates the number of rows and columns in the tileset
    int columns(0), rows(0);
    if (tileSize.x == 0 || tileSize.y == 0)
        return;
    columns = (m_tilesetTexture->texture.getSize().x + tileSpacing.x) / (tileSize.x + tileSpacing.x);
    rows = (m_tilesetTexture->texture.getSize().y + tileSpacing.y) / (tileSize.y + tileSpacing.y);

    //Generate the TextureCoords and the sub-bitmaps (only in IDE)
    m_coords.clear();
#ifdef GD_IDE_ONLY
    m_bitmaps.clear();
#endif
    for(int row = 0; row < rows; row++)
    {
        for(int col = 0; col < columns; col++)
        {
            //TileTextureCoords
            TileTextureCoords tileCoords;
            tileCoords.topLeft = sf::Vector2f(col * (tileSize.x + tileSpacing.x),
                                              row * (tileSize.y + tileSpacing.y));
            tileCoords.topRight = sf::Vector2f(col * (tileSize.x + tileSpacing.x) + tileSize.x,
                                               row * (tileSize.y + tileSpacing.y));
            tileCoords.bottomRight = sf::Vector2f(col * (tileSize.x + tileSpacing.x) + tileSize.x,
                                                  row * (tileSize.y + tileSpacing.y) + tileSize.y);
            tileCoords.bottomLeft = sf::Vector2f(col * (tileSize.x + tileSpacing.x),
                                                 row * (tileSize.y + tileSpacing.y) + tileSize.y);
            m_coords.push_back(tileCoords);

#ifdef GD_IDE_ONLY
            //sub-wxBitmap
            wxBitmap subbitmap;
            subbitmap = m_tilesetBitmap.GetSubBitmap(wxRect(col * (tileSize.x + tileSpacing.x),
                                                            row * (tileSize.y + tileSpacing.y),
                                                            tileSize.x,
                                                            tileSize.y));
            m_bitmaps.push_back(subbitmap);
#endif
        }
    }

    //Puts the default hitbox for new tiles (if there are more tiles than before)
    if (GetTilesCount() > m_hitboxes.size())
        m_hitboxes.insert(m_hitboxes.end(), (GetTilesCount()-m_hitboxes.size()), TileHitbox::Rectangle(tileSize));

    std::cout << "OK" << std::endl;
    m_dirty = false;
}

void TileSet::ResetHitboxes()
{
    m_hitboxes.clear();
    if (m_dirty)
        return;

    m_hitboxes.assign(GetTilesCount(), TileHitbox::Rectangle(tileSize));
}

int TileSet::GetTileIDFromPosition(sf::Vector2f position)
{
    int columns = GetColumnsCount();
    int rows = GetRowsCount();

    int tileColumn = position.x / tileSize.x;
    int tileRow = position.y / tileSize.y;

    return (tileColumn * columns + tileRow);
}

int TileSet::GetTileIDFromCell(int col, int row)
{
    int columns = GetColumnsCount();
    int rows = GetRowsCount();

    return (row * columns + col);
}

#ifdef GD_IDE_ONLY

const wxBitmap& TileSet::GetWxBitmap() const
{
    return m_tilesetBitmap;
}

const wxBitmap& TileSet::GetTileBitmap(int id) const
{
    return (id < m_bitmaps.size() ? m_bitmaps.at(id) : m_invalidBitmap);
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
    return m_coords.at(id);
}

sf::Vector2u TileSet::GetSize() const
{
    if(!m_tilesetTexture)
        return sf::Vector2u(0, 0);

    return m_tilesetTexture->texture.getSize();
}

TileHitbox& TileSet::GetTileHitbox(int id)
{
    return m_hitboxes[id];
}

const TileHitbox& TileSet::GetTileHitbox(int id) const
{
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
    element.SetAttribute("textureName", textureName);
    element.SetAttribute("tileSizeX", tileSize.x);
    element.SetAttribute("tileSizeY", tileSize.y);
    element.SetAttribute("tileSpacingX", tileSpacing.x);
    element.SetAttribute("tileSpacingY", tileSpacing.y);

    gd::SerializerElement &tilesElem = element.AddChild("hitboxes");

    //Save polygons
    for(std::vector<TileHitbox>::const_iterator it = m_hitboxes.begin(); it != m_hitboxes.end(); it++)
    {
        gd::SerializerElement &hitboxElem = tilesElem.AddChild("tileHitbox");
        it->SerializeTo(hitboxElem);
    }
}
#endif

void TileSet::UnserializeFrom(const gd::SerializerElement &element)
{
    ResetHitboxes();

    textureName = element.GetStringAttribute("textureName", "");
    tileSize.x = element.GetIntAttribute("tileSizeX", 32);
    tileSize.y = element.GetIntAttribute("tileSizeY", 32);
    tileSpacing.x = element.GetIntAttribute("tileSpacingX", 0);
    tileSpacing.y = element.GetIntAttribute("tileSpacingY", 0);

    if (element.HasChild("hitboxes"))
    {
        gd::SerializerElement &tilesElem = element.GetChild("hitboxes");
        tilesElem.ConsiderAsArrayOf("tileHitbox");
        for(int i = 0; i < tilesElem.GetChildrenCount("tileHitbox"); i++)
        {
            TileHitbox newHitbox;
            newHitbox.UnserializeFrom(tilesElem.GetChild(i), tileSize);
            m_hitboxes.push_back(newHitbox);
        }
    }

    m_dirty = true;
}
