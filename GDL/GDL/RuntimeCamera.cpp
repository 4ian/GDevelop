#include "RuntimeCamera.h"

RuntimeCamera::RuntimeCamera(const Camera & camera, const sf::View & defaultView)
{
    associatedCamera = camera;

    sfmlView = defaultView;
    if ( !associatedCamera.defaultViewport )
        sfmlView.SetViewport(associatedCamera.viewport);    //Define a custom viewport from viewport datas
    else
        associatedCamera.viewport = sf::FloatRect(0,0,1,1); //Default viewport : Make sure viewport datas are correct

    if ( !associatedCamera.defaultSize )
        sfmlView.SetSize(associatedCamera.size);        //Define a custom size from size datas
    else
        associatedCamera.size = defaultView.GetSize();  //Default size : Make sure size datas are correct
}

RuntimeCamera::~RuntimeCamera()
{
    //dtor
}
