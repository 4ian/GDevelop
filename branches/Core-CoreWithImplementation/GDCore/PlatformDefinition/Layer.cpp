/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#include "GDCore/PlatformDefinition/Layer.h"
#include "GDCore/IDE/Dialogs/EditLayerDialog.h"
#include "GDCore/TinyXml/tinyxml.h"
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
void Layer::SetCameraCount(unsigned int n)
{
    while ( cameras.size() < n)
        cameras.push_back(Camera());

    while ( cameras.size() > n)
        cameras.erase(cameras.begin()+cameras.size()-1);
}

#if defined(GD_IDE_ONLY)
void Layer::SaveToXml(TiXmlElement * element) const
{
    element->SetAttribute("Name", GetName().c_str());
    if ( GetVisibility() )
        element->SetAttribute("Visibility", "true");
    else
        element->SetAttribute("Visibility", "false");

    for (unsigned int c = 0;c<GetCameraCount();++c)
    {
        TiXmlElement * camera = new TiXmlElement( "Camera" );
        element->LinkEndChild( camera );

        camera->SetAttribute("DefaultSize", GetCamera(c).UseDefaultSize() ? "true" : "false");

        camera->SetDoubleAttribute("Width", GetCamera(c).GetWidth());
        camera->SetDoubleAttribute("Height", GetCamera(c).GetHeight());

        camera->SetAttribute("DefaultViewport", GetCamera(c).UseDefaultViewport() ? "true" : "false");

        camera->SetDoubleAttribute("ViewportLeft", GetCamera(c).GetViewportX1());
        camera->SetDoubleAttribute("ViewportTop", GetCamera(c).GetViewportY1());
        camera->SetDoubleAttribute("ViewportRight", GetCamera(c).GetViewportX2());
        camera->SetDoubleAttribute("ViewportBottom", GetCamera(c).GetViewportY2());
    }
}
#endif

void Layer::LoadFromXml(const TiXmlElement * element)
{
    if ( element->Attribute( "Name" ) != NULL ) SetName(element->Attribute( "Name" ));
    SetVisibility( !(!element->Attribute( "Visibility" ) || std::string(element->Attribute( "Visibility" )) == "false") );

    const TiXmlElement * elemCamera = element->FirstChildElement("Camera");
    if ( !elemCamera ) SetCameraCount(1);

    while (elemCamera)
    {
        SetCameraCount(GetCameraCount()+1);

        if ( elemCamera->Attribute("DefaultSize") && elemCamera->Attribute("Width") && elemCamera->Attribute("Height") )
        {
            std::string defaultSize = elemCamera->Attribute("DefaultSize");
            GetCamera(GetCameraCount()-1).SetUseDefaultSize(!(defaultSize == "false"));
            GetCamera(GetCameraCount()-1).SetSize(ToFloat(elemCamera->Attribute("Width")), ToFloat(elemCamera->Attribute("Height")));
        }

        if ( elemCamera->Attribute("DefaultViewport") && elemCamera->Attribute("ViewportLeft") && elemCamera->Attribute("ViewportTop") &&
             elemCamera->Attribute("ViewportRight") && elemCamera->Attribute("ViewportBottom") )
        {
            std::string defaultViewport = elemCamera->Attribute("DefaultViewport");
            GetCamera(GetCameraCount()-1).SetUseDefaultViewport(!(defaultViewport == "false"));
            GetCamera(GetCameraCount()-1).SetViewport(ToFloat(elemCamera->Attribute("ViewportLeft")),
                                                                  ToFloat(elemCamera->Attribute("ViewportTop")),
                                                                  ToFloat(elemCamera->Attribute("ViewportRight")),
                                                                  ToFloat(elemCamera->Attribute("ViewportBottom"))
                                                                  ); // (sf::Rect used Right and Bottom instead of Width and Height before. )
        }

        elemCamera = elemCamera->NextSiblingElement();
    }
}



#if defined(GD_IDE_ONLY)
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
