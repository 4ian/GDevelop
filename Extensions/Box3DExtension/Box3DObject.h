/**

Game Develop - Box 3D Extension
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

#ifndef BOX3DOBJECT_H
#define BOX3DOBJECT_H

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
class MainEditorCommand;
#endif

/**
 * Text Object
 */
class GD_EXTENSION_API Box3DObject : public Object
{
public :

    Box3DObject(std::string name_);
    virtual ~Box3DObject();
    virtual Object * Clone() { return new Box3DObject(*this);}

    virtual bool LoadResources(const RuntimeScene & scene, const ImageManager & imageMgr );
    virtual bool InitializeFromInitialPosition(const InitialPosition & position);

    virtual bool Draw(sf::RenderTarget & renderTarget);

    #if defined(GD_IDE_ONLY)
    virtual bool DrawEdittime(sf::RenderTarget & renderTarget);
    virtual bool GenerateThumbnail(const Game & game, wxBitmap & thumbnail);
    virtual void ExposeResources(gd::ArbitraryResourceWorker & worker);

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

    virtual void OnPositionChanged() {};

    virtual float GetDrawableX() const;
    virtual float GetDrawableY() const;

    virtual float GetCenterX() const;
    virtual float GetCenterY() const;

    inline void SetZPosition(float newZ) {zPosition = newZ;};
    inline float GetZPosition() const {return zPosition;};

    virtual inline bool SetAngle(float newAngle) { yaw = newAngle; return true;};
    virtual inline float GetAngle() const {return yaw;};
    float GetPitch() const { return pitch; }
    void SetPitch(float pitch_) { pitch = pitch_; }
    float GetRoll() const { return roll; }
    void SetRoll(float roll_) { roll = roll_; }

    virtual float GetWidth() const;
    virtual float GetHeight() const;

    virtual inline void SetWidth(float newWidth) {width = newWidth;};
    virtual inline void SetHeight(float newHeight) {height = newHeight;};

    float GetDepth() const { return depth; }
    void SetDepth(float depth_) { depth = depth_; }

    virtual std::vector<RotatedRectangle> GetHitBoxes() const;

    std::string frontTextureName;
    std::string topTextureName;
    std::string bottomTextureName;
    std::string leftTextureName;
    std::string rightTextureName;
    std::string backTextureName;

private:

    float width;
    float height;
    float depth;
    float zPosition;
    float yaw;
    float pitch;
    float roll;

    boost::shared_ptr<SFMLTextureWrapper> frontTexture;
    boost::shared_ptr<SFMLTextureWrapper> topTexture;
    boost::shared_ptr<SFMLTextureWrapper> bottomTexture;
    boost::shared_ptr<SFMLTextureWrapper> leftTexture;
    boost::shared_ptr<SFMLTextureWrapper> rightTexture;
    boost::shared_ptr<SFMLTextureWrapper> backTexture;
};

void DestroyBox3DObject(Object * object);
Object * CreateBox3DObject(std::string name);

#endif // BOX3DOBJECT_H
