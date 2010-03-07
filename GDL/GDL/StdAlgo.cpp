/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */


#include <string>
#include <sstream>
#include <iostream>
#include <vector>
#include "GDL/StdAlgo.h"
#include "GDL/Image.h"

std::string GD_API st( int i )
{
    std::ostringstream ss;
    ss << i;
    return ss.str();
}

std::string GD_API stFromFloat( float i )
{
    std::ostringstream ss;
    ss << i;
    return ss.str();
}

int GD_API ChercherNomImage( vector < Image > vecteur, string chaine )
{
    if ( !vecteur.empty() )
    {
        for ( unsigned int i = 0;i < vecteur.size();i++ )
        {
            if ( vecteur.at( i ).nom == chaine )
            {
                return i;
            }
        }
    }
    return -1;
}


