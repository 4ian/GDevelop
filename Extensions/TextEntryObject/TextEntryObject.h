/**

Game Develop - TextEntry Object Extension
Copyright (c) 2011-2012 Florian Rival (Florian.Rival@gmail.com)

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

#ifndef TEXTENTRYOBJECT_H
#define TEXTENTRYOBJECT_H

#include "GDL/Object.h"
class ImageManager;
class RuntimeScene;
class Object;
class ImageManager;
class InitialPosition;
#if defined(GD_IDE_ONLY)
namespace sf
{
    class Texture;
    class Sprite;
};
class wxBitmap;
class Game;
class wxWindow;
namespace gd { class MainFrameWrapper; }
namespace gd {class ResourcesMergingHelper;}
#endif

/**
 * \brief Simple object which stores user keyboard input.
 */
class GD_EXTENSION_API TextEntryObject : public Object
{
public :

    TextEntryObject(std::string name_);
    virtual ~TextEntryObject() {};
    virtual Object * Clone() const { return new TextEntryObject(*this); }

    virtual bool LoadRuntimeResources(const RuntimeScene & scene, const ImageManager & imageMgr );
    virtual bool InitializeFromInitialPosition(const InitialPosition & position);

    virtual bool Draw(sf::RenderTarget & renderTarget);

    virtual void UpdateTime(float);

    #if defined(GD_IDE_ONLY)
    virtual bool DrawEdittime(sf::RenderTarget & renderTarget);
    virtual bool GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail);
    static void LoadEdittimeIcon();

    virtual void EditObject( wxWindow* parent, Game & game_, gd::MainFrameWrapper & mainFrameWrapper_ );
    virtual wxPanel * CreateInitialPositionPanel( wxWindow* parent, const Game & game_, const Scene & scene_, const InitialPosition & position );
    virtual void UpdateInitialPositionFromPanel(wxPanel * panel, InitialPosition & position);

    virtual void GetPropertyForDebugger (unsigned int propertyNb, std::string & name, std::string & value) const;
    virtual bool ChangeProperty(unsigned int propertyNb, std::string newValue);
    virtual unsigned int GetNumberOfProperties() const;
    #endif

    virtual float GetWidth() const;
    virtual float GetHeight() const;

    virtual float GetDrawableX() const;
    virtual float GetDrawableY() const;

    virtual float GetCenterX() const;
    virtual float GetCenterY() const;

    inline void SetString(std::string str) { text = str; };
    const std::string & GetString() const;

    void Activate( bool activate = true ) { activated = activate; };
    bool IsActivated() const { return activated; };

private:

    std::string text;
    const RuntimeScene * scene; ///< Pointer to the scene. Initialized during LoadRuntimeResources call.
    bool activated;

    #if defined(GD_IDE_ONLY)
    static sf::Texture edittimeIconImage;
    static sf::Sprite edittimeIcon;
    #endif
};

void DestroyTextEntryObject(Object * object);
Object * CreateTextEntryObject(std::string name);

#endif // TEXTENTRYOBJECT_H
