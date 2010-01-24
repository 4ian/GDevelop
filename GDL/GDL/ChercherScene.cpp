#include <string>
#include "GDL/Scene.h"
#include <vector>

int GD_API ChercherScene( vector < Scene > vecteur, string chaine )
{
    if ( !vecteur.empty() )
    {
        //On vérifie le nom de chaque scène
        for ( unsigned int j = 0;j < vecteur.size();j++ )
        {
            if ( vecteur.at( j ).name == chaine )
            {
                return j;
            }
        }
    }

    return -1;
}

bool GD_API SceneExist( vector < Scene > vecteur, string chaine, int exclude )
{
    if ( !vecteur.empty() )
    {
        //On vérifie le nom de chaque scène
        for ( unsigned int i = 0;i < vecteur.size();i++ )
        {
            if ( vecteur.at( i ).name == chaine && i != exclude )
            {
                return true;
            }
        }
    }

    return false;
}
