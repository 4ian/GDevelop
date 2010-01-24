#ifndef SORTBYSURFACE_H_INCLUDED
#define SORTBYSURFACE_H_INCLUDED

#include "GDL/Objet.h"

////////////////////////////////////////////////////////////
/// Tri par surface
///
/// Définition du foncteur pour trier les objets suivant leurs surface.
////////////////////////////////////////////////////////////
struct SortBySurface
{
   bool operator ()(const Objetc& a1, const Object& a2) const
   {
      return (a1.GetWidth() * a1.GetHeight()) < (a2.GetWidth() * a2.GetHeight());
   }
};

#endif // SORTBYSURFACE_H_INCLUDED
