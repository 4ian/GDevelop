#include "RuntimeLayer.h"

RuntimeCamera RuntimeLayer::badCamera;

RuntimeLayer::RuntimeLayer(const Layer & layer, const sf::View & defaultView)
{
    associatedLayer = layer;

    //Create runtime cameras
    for (unsigned int i = 0;i<layer.GetCamerasNumber();++i)
    	cameras.push_back(RuntimeCamera(layer.GetCamera(i), defaultView));
}

RuntimeLayer::~RuntimeLayer()
{
    //dtor
}
