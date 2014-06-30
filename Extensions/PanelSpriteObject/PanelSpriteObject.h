/**

Game Develop - Panel Sprite Extension
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
#include "GDCpp/Object.h"
#include "GDCpp/RuntimeObject.h"
#include <boost/shared_ptr.hpp>
class SFMLTextureWrapper;
namespace gd { class ImageManager; }
class RuntimeScene;
namespace gd { class Object; }
namespace gd { class ImageManager; }
namespace gd { class InitialInstance; }
#if defined(GD_IDE_ONLY)
class wxBitmap;
namespace gd { class Project; }
class wxWindow;
namespace gd { class MainFrameWrapper; }
#endif

/**
 * PanelSprite Object
 */
class GD_EXTENSION_API PanelSpriteObject : public gd::Object
{
public :

    PanelSpriteObject(std::string name_);
    virtual ~PanelSpriteObject();
    virtual gd::Object * Clone() const { return new PanelSpriteObject(*this);}

    #if defined(GD_IDE_ONLY)
    virtual void LoadResources(gd::Project & project, gd::Layout & layout);
    virtual void DrawInitialInstance(gd::InitialInstance & instance, sf::RenderTarget & renderTarget, gd::Project & project, gd::Layout & layout);
    virtual sf::Vector2f GetInitialInstanceDefaultSize(gd::InitialInstance & instance, gd::Project & project, gd::Layout & layout) const;
    virtual bool GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail) const;
    virtual void ExposeResources(gd::ArbitraryResourceWorker & worker);
    virtual void EditObject( wxWindow* parent, gd::Project & game_, gd::MainFrameWrapper & mainFrameWrapper_ );
    #endif

    float GetWidth() const { return width; };
    float GetHeight() const { return height; };

    void SetWidth(float newWidth) { width = newWidth >= (leftMargin + rightMargin) ? newWidth : (leftMargin + rightMargin); };
    void SetHeight(float newHeight) { height = newHeight >= (topMargin + bottomMargin) ? newHeight : (topMargin + bottomMargin); };

    float GetLeftMargin() const { return leftMargin; };
    void SetLeftMargin(float newMargin) { leftMargin = newMargin; };

    float GetTopMargin() const { return topMargin; };
    void SetTopMargin(float newMargin) { topMargin = newMargin; };

    float GetRightMargin() const { return rightMargin; };
    void SetRightMargin(float newMargin) { rightMargin = newMargin; };

    float GetBottomMargin() const { return bottomMargin; };
    void SetBottomMargin(float newMargin) { bottomMargin = newMargin; };

    bool IsSmooth() const { return smooth; };
    void SetSmooth(bool enable) { smooth = enable; };

    std::string textureName;

private:

    virtual void DoUnserializeFrom(gd::Project & project, const gd::SerializerElement & element);
    #if defined(GD_IDE_ONLY)
    virtual void DoSerializeTo(gd::SerializerElement & element) const;
    #endif

    float width;
    float height;

    float leftMargin;
    float topMargin;
    float rightMargin;
    float bottomMargin;

    bool smooth;

    boost::shared_ptr<SFMLTextureWrapper> texture;
};

class GD_EXTENSION_API RuntimePanelSpriteObject : public RuntimeObject
{
public :

    RuntimePanelSpriteObject(RuntimeScene & scene, const gd::Object & object);
    virtual ~RuntimePanelSpriteObject() {};
    virtual RuntimeObject * Clone() const { return new RuntimePanelSpriteObject(*this);}

    virtual bool Draw(sf::RenderTarget & renderTarget);

    virtual float GetWidth() const { return width; };
    virtual float GetHeight() const { return height; };

    virtual inline void SetWidth(float newWidth) { width = newWidth >= (leftMargin + rightMargin) ? newWidth : (leftMargin + rightMargin); };
    virtual inline void SetHeight(float newHeight) { height = newHeight >= (topMargin + bottomMargin) ? newHeight : (topMargin + bottomMargin); };

    virtual bool SetAngle(float newAngle) { angle = newAngle; return true; };
    virtual float GetAngle() const {return angle;};

    float GetLeftMargin() const { return leftMargin; };
    void SetLeftMargin(float newMargin) { leftMargin = newMargin; };

    float GetTopMargin() const { return topMargin; };
    void SetTopMargin(float newMargin) { topMargin = newMargin; };

    float GetRightMargin() const { return rightMargin; };
    void SetRightMargin(float newMargin) { rightMargin = newMargin; };

    float GetBottomMargin() const { return bottomMargin; };
    void SetBottomMargin(float newMargin) { bottomMargin = newMargin; };

    void ChangeAndReloadImage(const std::string &texture, const RuntimeScene &scene);

    std::string textureName;

    #if defined(GD_IDE_ONLY)
    virtual void GetPropertyForDebugger (unsigned int propertyNb, std::string & name, std::string & value) const;
    virtual bool ChangeProperty(unsigned int propertyNb, std::string newValue);
    virtual unsigned int GetNumberOfProperties() const;
    #endif

private:

    float width;
    float height;

    float leftMargin;
    float topMargin;
    float rightMargin;
    float bottomMargin;

    float angle;
    bool smooth;

    boost::shared_ptr<SFMLTextureWrapper> texture;
};

void DestroyRuntimePanelSpriteObject(RuntimeObject * object);
RuntimeObject * CreateRuntimePanelSpriteObject(RuntimeScene & scene, const gd::Object & object);

void DestroyPanelSpriteObject(gd::Object * object);
gd::Object * CreatePanelSpriteObject(std::string name);

#endif // TILEDSPRITEOBJECT_H

