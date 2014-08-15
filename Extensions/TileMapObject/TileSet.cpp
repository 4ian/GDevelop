#include "TileSet.h"

#include <iostream>
#ifdef GD_IDE_ONLY
#include <wx/file.h>
#include <wx/filefn.h> 
#include <wx/filename.h>
#endif

TileSet::TileSet() : textureName(), tileSize(24, 24), tileSpacing(0, 0), m_tilesetTexture()
{

}

TileSet::TileSet(const TileSet &other)
{
    textureName = other.textureName;
    tileSize = other.tileSize;
    tileSpacing = other.tileSpacing;
}

TileSet::~TileSet()
{

}

void TileSet::LoadResources(gd::Project &game)
{
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
    if(!m_tilesetTexture)
        return;

    std::cout << "Generating texture coords..." << std::endl;

    //Calculates the number of rows and columns in the tileset
    int columns(0), rows(0);
    if(tileSize.x == 0 || tileSize.y == 0)
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
            tileCoords.topRight = sf::Vector2f(col * (tileSize.x + tileSpacing.x),
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

    std::cout << "OK" << std::endl;
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
    return m_bitmaps.at(id);
}

#endif

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

int TileSet::GetColumnsCount() const
{
    return (m_tilesetTexture->texture.getSize().x + tileSpacing.x) / (tileSize.x + tileSpacing.x);
}

int TileSet::GetRowsCount() const
{
    return (m_tilesetTexture->texture.getSize().y + tileSpacing.y) / (tileSize.y + tileSpacing.y);
}