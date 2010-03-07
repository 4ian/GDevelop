/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef LISTVARIABLE_H
#define LISTVARIABLE_H

#include <vector>
#include <string>
#include "GDL/Variable.h"
using namespace std;

/**
 * A list of Game Develop variables. Used by objects, games and scenes.
 */
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
