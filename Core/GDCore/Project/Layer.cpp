/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "GDCore/Project/Layer.h"
#include "GDCore/IDE/Dialogs/EditLayerDialog.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/CommonTools.h"

namespace gd
{

Camera Layer::badCamera;

Layer::Layer() :
isVisible(true)
{
}

/**
 * Change cameras count, automatically adding/removing them.
 */
void Layer::SetCameraCount(std::size_t n)
{
    while ( cameras.size() < n)
        cameras.push_back(Camera());

    while ( cameras.size() > n)
        cameras.erase(cameras.begin()+cameras.size()-1);
}

#if defined(GD_IDE_ONLY)
void Layer::SerializeTo(SerializerElement & element) const
{
    element.SetAttribute("name", GetName());
    element.SetAttribute("visibility", GetVisibility());

    SerializerElement & camerasElement = element.AddChild("cameras");
    camerasElement.ConsiderAsArrayOf("camera");
    for (std::size_t c = 0;c<GetCameraCount();++c)
    {
        SerializerElement & cameraElement = camerasElement.AddChild("camera");
        cameraElement.SetAttribute("defaultSize", GetCamera(c).UseDefaultSize());
        cameraElement.SetAttribute("width", GetCamera(c).GetWidth());
        cameraElement.SetAttribute("height", GetCamera(c).GetHeight());

        cameraElement.SetAttribute("defaultViewport", GetCamera(c).UseDefaultViewport());
        cameraElement.SetAttribute("viewportLeft", GetCamera(c).GetViewportX1());
        cameraElement.SetAttribute("viewportTop", GetCamera(c).GetViewportY1());
        cameraElement.SetAttribute("viewportRight", GetCamera(c).GetViewportX2());
        cameraElement.SetAttribute("viewportBottom", GetCamera(c).GetViewportY2());
    }

}
#endif

/**
 * \brief Unserialize the layer.
 */
void Layer::UnserializeFrom(const SerializerElement & element)
{
    SetName(element.GetStringAttribute("name", "", "Name"));
    SetVisibility(element.GetBoolAttribute("visibility", true, "Visibility"));

    //Compatibility with GD <= 3.3
    if (element.HasChild("Camera"))
    {
        for (std::size_t i = 0; i < element.GetChildrenCount("Camera"); ++i)
        {
            const SerializerElement & cameraElement = element.GetChild("Camera", i);
            SetCameraCount(GetCameraCount()+1);
            Camera & camera = GetCamera(GetCameraCount()-1);

            camera.SetUseDefaultSize(cameraElement.GetBoolAttribute("DefaultSize", true));
            camera.SetSize(cameraElement.GetDoubleAttribute("Width"), cameraElement.GetDoubleAttribute("Height"));

            camera.SetUseDefaultViewport(cameraElement.GetBoolAttribute("DefaultViewport", true));
            camera.SetViewport(cameraElement.GetDoubleAttribute("ViewportLeft"),
                cameraElement.GetDoubleAttribute("ViewportTop"),
                cameraElement.GetDoubleAttribute("ViewportRight"),
                cameraElement.GetDoubleAttribute("ViewportBottom")
                ); // (sf::Rect used Right and Bottom instead of Width and Height before)
        }
    }
    //End of compatibility code
    else
    {
        SerializerElement & camerasElement = element.GetChild("cameras");
        camerasElement.ConsiderAsArrayOf("camera");
        for (std::size_t i = 0; i < camerasElement.GetChildrenCount(); ++i)
        {
            const SerializerElement & cameraElement = camerasElement.GetChild(i);

            SetCameraCount(GetCameraCount()+1);
            Camera & camera = GetCamera(GetCameraCount()-1);

            camera.SetUseDefaultSize(cameraElement.GetBoolAttribute("defaultSize", true));
            camera.SetSize(cameraElement.GetDoubleAttribute("width"), cameraElement.GetDoubleAttribute("height"));

            camera.SetUseDefaultViewport(cameraElement.GetBoolAttribute("defaultViewport", true));
            camera.SetViewport(cameraElement.GetDoubleAttribute("viewportLeft"),
                cameraElement.GetDoubleAttribute("viewportTop"),
                cameraElement.GetDoubleAttribute("viewportRight"),
                cameraElement.GetDoubleAttribute("viewportBottom")); // (sf::Rect used Right and Bottom instead of Width and Height before)
        }
    }
}

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
/**
 * Display a window to edit the layer
 */
void Layer::EditLayer()
{
    EditLayerDialog dialog(NULL, *this);
    dialog.ShowModal();
}
#endif

Camera::Camera() :
    defaultSize(true),
    defaultViewport(true),
    x1(0),
    y1(0),
    x2(1),
    y2(1),
    width(0),
    height(0)
{
}

}
