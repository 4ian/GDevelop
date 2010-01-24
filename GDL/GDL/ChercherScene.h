#ifndef CHERCHERSCENE_H_INCLUDED
#define CHERCHERSCENE_H_INCLUDED

#include <string>
#include "GDL/Scene.h"

int GD_API ChercherScene( vector < Scene > vecteur, string chaine );
bool GD_API SceneExist( vector < Scene > vecteur, string chaine, int exclude );


#endif // CHERCHERSCENE_H_INCLUDED
