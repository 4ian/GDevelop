/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */


#include <string>
#include <sstream>
#include <iostream>
#include <vector>
#include "GDL/CommonTools.h"
#include "GDL/Image.h"

std::string ReplaceSpacesByTildes(std::string text)
{
    size_t foundPos=text.find(" ");
    while(foundPos != string::npos)
    {
        if(foundPos != string::npos) text.replace(foundPos,1,"~");
        foundPos=text.find(" ", foundPos+1);
    }

    return text;
}

int GD_API FindImage( const vector < Image > & list, const string & chaine )
{
    for ( unsigned int i = 0;i < list.size();i++ )
    {
        if ( list[i].nom == chaine )
            return i;
    }
    return -1;
}

//Découpage en fonction d'un séparateur
int Spliter(string Tableau[] , string chaine, char separateur, int longueur)
{
    istringstream iss( chaine );
    string mot;
    int i = 0;
    while ( std::getline( iss, mot, separateur ) )
    {
        //A t on une sécurité ( longueur ? )
        if (longueur!=-1)
        {
            if (i<longueur)
            {
                Tableau[i] = mot;
            }
        }
        else
        {
            Tableau[i] = mot;
        }
        i++;
    }


    return i;
}

int SpliterV(vector <string> *Tableau , string chaine, char separateur)
{
    //EcrireLog(" Algo", "Appel de Spliter Vector avec "+chaine);

    istringstream iss( chaine );
    string mot;
    int i = 0;
    while ( std::getline( iss, mot, separateur ) )
    {
        Tableau->push_back( mot);
        i++;
    }


    //EcrireLog(" Algo", "Appel de Spliter Vector FIN");

    return i;

}

int SpliterVInt(vector <int> *Tableau , string chaine, char separateur)
{
    //EcrireLog(" Algo", "Appel de Spliter Vector avec "+chaine);

    istringstream iss( chaine );
    string mot;
    int i = 0;
    while ( std::getline( iss, mot, separateur ) )
    {
        Tableau->push_back( ToInt(mot));
        i++;
    }


    //EcrireLog(" Algo", "Appel de Spliter Vector FIN");

    return i;

}
