/**

Game Develop - Primitive Drawing Extension
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

#ifndef DRAWEROBJECT_H
#define DRAWEROBJECT_H

#include "GDL/Object.h"
#include <vector>
#include <SFML/Graphics/Shape.hpp>
namespace sf
{
    class Sprite;
    class Texture;
}
class ImageManager;
class RuntimeScene;
class Object;
class ImageManager;
class InitialPosition;
#if defined(GD_IDE_ONLY)
class wxBitmap;
class Game;
class wxWindow;
class MainEditorCommand;
#endif

/**
 * Drawer object can draw primitive shapes
 */
class GD_EXTENSION_API DrawerObject : public Object
{
public :

    DrawerObject(std::string name_);
    virtual ~DrawerObject() {};
    virtual Object * Clone() { return new DrawerObject(*this); }

    virtual bool LoadResources(const RuntimeScene & scene, const ImageManager & imageMgr );
    virtual bool InitializeFromInitialPosition(const InitialPosition & position);

    virtual bool Draw(sf::RenderTarget & renderTarget);

    #if defined(GD_IDE_ONLY)
    virtual bool DrawEdittime(sf::RenderTarget & renderTarget);
    virtual bool GenerateThumbnail(const Game & game, wxBitmap & thumbnail);

    virtual void EditObject( wxWindow* parent, Game & game_, MainEditorCommand & mainEditorCommand_ );
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

    virtual void OnPositionChanged() {};

    virtual float GetWidth() const;
    virtual float GetHeight() const;

    virtual float GetDrawableX() const;
    virtual float GetDrawableY() const;

    virtual float GetCenterX() const;
    virtual float GetCenterY() const;

    virtual bool SetAngle(float newAngle) {return false;};
    virtual float GetAngle() const {return 0;};

    virtual void SetWidth(float ) {};
    virtual void SetHeight(float ) {};

    void DrawRectangle( float x, float y, float x2, float y2 );
    void DrawLine( float x, float y, float x2, float y2, float thickness );
    void DrawCircle( float x, float y, float radius );

    inline void SetOutlineSize(float size) { outlineSize = size; };
    inline float GetOutlineSize() const { return outlineSize; };

    void SetOutlineOpacity(float val);
    inline float GetOutlineOpacity() const {return outlineOpacity;};

    void SetOutlineColor(unsigned int r,unsigned int v,unsigned int b);
    inline unsigned int GetOutlineColorR() const { return outlineColorR; };
    inline unsigned int GetOutlineColorG() const { return outlineColorG; };
    inline unsigned int GetOutlineColorB() const { return outlineColorB; };
    /** Used by GD events generated code : Prefer using original SetOutlineColor
     */
    void SetOutlineColor( const std::string & color );

    void SetFillOpacity(float val);
    inline float GetFillOpacity() const {return fillOpacity;};

    void SetFillColor(unsigned int r,unsigned int v,unsigned int b);
    inline unsigned int GetFillColorR() const { return fillColorR; };
    inline unsigned int GetFillColorG() const { return fillColorG; };
    inline unsigned int GetFillColorB() const { return fillColorB; };

    /** Used by GD events generated code : Prefer using original SetFillColor
     */
    void SetFillColor( const std::string & color );

    inline void SetCoordinatesAbsolute() { absoluteCoordinates = true; }
    inline void SetCoordinatesRelative() { absoluteCoordinates = false; }
    inline bool AreCoordinatesAbsolute() { return absoluteCoordinates; }

private:

    std::vector < sf::Shape > shapesToDraw;

    //Fill color
    unsigned int fillColorR;
    unsigned int fillColorG;
    unsigned int fillColorB;
    float fillOpacity;

    //Outline
    int outlineSize;
    unsigned int outlineColorR;
    unsigned int outlineColorG;
    unsigned int outlineColorB;
    float outlineOpacity;

    bool absoluteCoordinates;

    #if defined(GD_IDE_ONLY)
    static sf::Texture edittimeIconImage;
    static sf::Sprite edittimeIcon;
    #endif
};

void DestroyDrawerObject(Object * object);
Object * CreateDrawerObject(std::string name);

#endif // DRAWEROBJECT_H
