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
 *  Une liste de variable.
 *  Utile pour les objets, les scènes, le jeu...
 */

#ifndef LISTVARIABLE_H
#define LISTVARIABLE_H

#include <vector>
#include <string>
#include "GDL/Variable.h"
using namespace std;

class GD_API ListVariable
{
    public:
        ListVariable();
        virtual ~ListVariable();

        vector < Variable > variables;

        inline int FindVariable(string nom) const
        {
            for (unsigned int i = 0;i<variables.size();++i)
            {
                if (variables.at(i).GetName() == nom )
                    return i;
            }

            return -1;
        }

    protected:
    private:
};

#endif // LISTVARIABLE_H
