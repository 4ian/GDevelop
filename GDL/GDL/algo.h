/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef ALGO_H_INCLUDED
#define ALGO_H_INCLUDED

#include <sstream>
#include <string>
#include <iostream>
#include "GDL/Object.h"
#include <vector>
#include <stdio.h>

using namespace std;

//Propre à Windows
bool FileExists(const char* pszfl);

int Spliter(string Tableau[] , string chaine, char separateur, int longueur = -1);
int SpliterV(vector <string> *Tableau , string chaine, char separateur);
int SpliterVInt(vector <int> *Tableau , string chaine, char separateur);

template <typename T>
vector <T> SpliterStringToVector( string str, char separator )
{
    istringstream iss( str );
    string token;
    vector <T> array;

    unsigned int i = 0;
    while ( std::getline( iss, token, separator ) )
    {
        array.push_back( T(token) );
        ++i;
    }

    return array;
}

std::string ToString(int i);


struct StringEmpty
{
   bool operator ()(const string a) const
   {
      return (a=="");
   }
};

#endif // ALGO_H_INCLUDED
