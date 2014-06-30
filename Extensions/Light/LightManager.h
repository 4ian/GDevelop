#ifndef LIGHTMANAGERH
#define LIGHTMANAGERH
#include <vector>
#include <SFML/Graphics.hpp>
class Wall;

class Light_Manager
{
public :
    std::vector <Wall*> walls; ///< Objects with light obstacle automatism have to insert their into this vector

    bool commonBlurEffectLoaded;
    sf::Shader commonBlurEffect;

    Light_Manager();
    ~Light_Manager();
};
#endif


