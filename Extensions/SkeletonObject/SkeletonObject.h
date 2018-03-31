
/**
GDevelop - Skeleton Object Extension
Copyright (c) 2017-2018 Franco Maciel (francomaciel10@gmail.com)
This project is released under the MIT License.
*/

#ifndef SKELETONOBJECT_H
#define SKELETONOBJECT_H

#include "GDCpp/Runtime/Project/Object.h"
#include "GDCpp/Runtime/String.h"
namespace gd { class InitialInstance; }
namespace gd { class Project; }
namespace sf { class Texture; }
namespace sf { class Sprite; }
class wxBitmap;

class GD_EXTENSION_API SkeletonObject : public gd::Object
{
public:
    SkeletonObject(gd::String name_);
    virtual ~SkeletonObject() {};
    virtual std::unique_ptr<gd::Object> Clone() const { return gd::make_unique<SkeletonObject>(*this); }

    #if defined(GD_IDE_ONLY)
    static void LoadEdittimeIcon();

    #if !defined(GD_NO_WX_GUI)
    bool GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail) const override;
    #endif

    void DrawInitialInstance(gd::InitialInstance & instance, sf::RenderTarget & renderTarget, gd::Project & project, gd::Layout & layout) override;
    sf::Vector2f GetInitialInstanceOrigin(gd::InitialInstance & instance, gd::Project & project, gd::Layout & layout) const override;
    
    #if !defined(GD_NO_WX_GUI)
    void UpdateSize(gd::Project & project);
    #endif

    std::map<gd::String, gd::PropertyDescriptor> GetProperties(gd::Project & project) const override;
    bool UpdateProperty(const gd::String & name, const gd::String & value, gd::Project & project) override;
    #endif

private:
    void DoUnserializeFrom(gd::Project & project, const gd::SerializerElement & element) override;
    #if defined(GD_IDE_ONLY)
    void DoSerializeTo(gd::SerializerElement & element) const override;
    #endif

    gd::String skeletalDataFilename;
    gd::String rootArmatureName;
    gd::String textureDataFilename;
    gd::String textureName;
    gd::String apiName;
    bool debugPolygons;
    
    #if defined(GD_IDE_ONLY)
    static sf::Texture edittimeIconImage;
    static sf::Sprite edittimeIcon;
    sf::Vector2f originalSize;
    sf::Vector2f originOffset;
    bool sizeDirty;
    #endif
};

gd::Object * CreateSkeletonObject(gd::String name);

#endif // SKELETONOBJECT_H
