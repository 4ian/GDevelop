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
 * A container for and only for Game Develop variables. Used by objects, games and scenes.
 */
class GD_API ListVariable
{
    public:
        ListVariable() {};
        virtual ~ListVariable() {};

        /**
         * Get the text of a variable
         */
        inline string GetVariableText(string varName) const
        {
            vector < Variable >::const_iterator end = variables.end();
            for (vector < Variable >::const_iterator i = variables.begin();i != end;++i)
            {
            	if ( i->GetName() == varName)
                    return i->Gettexte();
            }

            return "";
        }

        /**
         * Get the value of a variable
         */
        inline double GetVariableValue(const string & varName) const
        {
            vector < Variable >::const_iterator end = variables.end();
            for (vector < Variable >::const_iterator i = variables.begin();i != end;++i)
            {
            	if ( i->GetName() == varName)
                    return i->Getvalue();
            }

            return 0;
        }

        /**
         * Return a reference to the variable with the name indicated.
         * Add the variable if it doesn't exist.
         */
        inline Variable & ObtainVariable(const string & varName)
        {
            vector < Variable >::const_iterator end = variables.end();
            for (vector < Variable >::iterator i = variables.begin();i != end;++i)
            {
            	if ( i->GetName() == varName)
                    return *i;
            }

            variables.push_back(Variable(varName));
            return variables.back();
        }

        /**
         * Check for existance of a variable
         */
        inline bool HasVariable(const string & varName) const
        {
            vector < Variable >::const_iterator end = variables.end();
            for (vector < Variable >::const_iterator i = variables.begin();i != end;++i)
            {
            	if ( i->GetName() == varName)
                    return true;
            }

            return false;
        }

        /**
         * Clear all variables of the list
         */
        inline void Clear()
        {
            variables.clear();
        }

        /**
         * Remove a variable
         */
        inline void RemoveVariable(const string & varName)
        {
            vector < Variable >::const_iterator end = variables.end();
            for (vector < Variable >::iterator i = variables.begin();i != end;++i)
            {
            	if ( i->GetName() == varName)
            	{
                    variables.erase(i);
                    return;
            	}
            }

            return;
        }

        /**
         * Return the internal vector containing the variables.
         */
        inline const vector<Variable> & GetVariablesVector() const
        {
            return variables;
        }

        /**
         * Return the internal vector containing the variables.
         */
        inline vector<Variable> & GetVariablesVector()
        {
            return variables;
        }

    private:
        vector < Variable > variables;
};

#endif // LISTVARIABLE_H
