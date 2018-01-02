
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

    #if !defined(GD_NO_WX_GUI)
    void DrawInitialInstance(gd::InitialInstance & instance, sf::RenderTarget & renderTarget, gd::Project & project, gd::Layout & layout) override;
    bool GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail) const override;
    static void LoadEdittimeIcon();
    #endif

    std::map<gd::String, gd::PropertyDescriptor> GetProperties(gd::Project & project) const override;
    bool UpdateProperty(const gd::String & name, const gd::String & value, gd::Project & project) override;

private:
    void DoUnserializeFrom(gd::Project & project, const gd::SerializerElement & element) override;
    void DoSerializeTo(gd::SerializerElement & element) const override;

    gd::String filename;

    #if !defined(GD_NO_WX_GUI)
    static sf::Texture edittimeIconImage;
    static sf::Sprite edittimeIcon;
    #endif
};

gd::Object * CreateSkeletonObject(gd::String name);

#endif // SKELETONOBJECT_H
