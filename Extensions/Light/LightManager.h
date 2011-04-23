


#ifndef LIGHTMANAGERH
#define LIGHTMANAGERH

#include "Directional_light.h"

class Light_Manager
{
    public :
     // Les tableaux de murs, lumières statiques et dynamiques
    std::vector <Wall*> walls;

    Light_Manager();
    ~Light_Manager();

    private:
};
#endif

