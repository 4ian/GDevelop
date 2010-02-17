#include "RuntimeCamera.h"

RuntimeCamera::RuntimeCamera(const Camera & camera, const sf::View & defaultView)
{
    associatedCamera = camera;

    sfmlView = defaultView;
    if ( !associatedCamera.defaultViewport )
        sfmlView.SetViewport(associatedCamera.viewport);

    if ( !associatedCamera.defaultSize )
        sfmlView.SetSize(associatedCamera.size);
}

RuntimeCamera::~RuntimeCamera()
{
    //dtor
}
