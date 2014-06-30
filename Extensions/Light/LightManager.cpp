#include <iostream>
#include "LightManager.h"

Light_Manager::Light_Manager() :
    commonBlurEffectLoaded(false)
{
    std::cout << "Creating Light Manager";
}
Light_Manager::~Light_Manager()
{
    std::cout << "Destroying Light Manager";
}



