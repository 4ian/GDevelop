


#ifndef LIGHTMANAGERH
#define LIGHTMANAGERH

#include "Directional_light.h"

class Light_Manager
{
    public :
    std::vector <Wall*> walls; ///< Objects with light obstacle automatism have to insert their into this vector

    Light_Manager();
    ~Light_Manager();

    private:
};
#endif


