/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef DOSSIER_H
#define DOSSIER_H

#include <string>
#include <vector>

using namespace std;

class GD_API Dossier
{
    public:
        Dossier();
        virtual ~Dossier();

        string nom;
        vector < string > contenu;
        static void ReplaceNomImage(vector < Dossier > * dossiers, string ancien, string nouveau);
        static void RemoveImage(vector < Dossier > * dossiers, string image, int ID = -1);
        static void Add(vector < Dossier > * dossiers, string nom, int ID);

    protected:
    private:
};


#endif // DOSSIER_H
