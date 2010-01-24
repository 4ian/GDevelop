/**
 * Game Develop
 *    Player
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *
 *
 *  Report d'erreur
 */

#ifndef ERRORREPORT_H
#define ERRORREPORT_H

#include <string>
#include <vector>

using namespace std;

class GD_API ErrorReport
{
    public:
        ErrorReport();
        virtual ~ErrorReport();

        void Add(string pMess, string pImage, string pObjet, int pEvent, int pNiveau);

        vector < string > messages;
        vector < string > image;
        vector < string > objet;
        vector < int > event;
        vector < int > niveau;

    protected:
    private:



};

#endif // ERRORREPORT_H
