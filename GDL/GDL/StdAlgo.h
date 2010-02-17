/**
 * Game Develop
 *    Player
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *
 * Contient des fonctions usuelles
 *
 */

#ifndef STDALGO_H_INCLUDED
#define STDALGO_H_INCLUDED


#include <string>
#include <sstream>
#include <iostream>
#include <vector>
#include "GDL/Image.h"


using namespace std;

std::string GD_API st(int i);
std::string GD_API stFromFloat(float i);
int GD_API ChercherNomImage( vector < Image > vecteur, string chaine );


template<typename T>
int toInt( const T & value )
{
    int i;
    std::istringstream oss(value);
    oss >> i;
    return i;
}

template<typename T>
int toFloat( const T & value )
{
    float f;
    std::istringstream oss(value);
    oss >> f;
    return f;
}

template<typename T>
std::string toString( const T & Value )
{
    // utiliser un flux de sortie pour créer la chaîne
    std::ostringstream oss;
    // écrire la valeur dans le flux
    oss << Value;
    // renvoyer une string
    return oss.str();
}

#endif // STDALGO_H_INCLUDED
