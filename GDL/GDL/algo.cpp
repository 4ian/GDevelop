/**
 *  Game Develop
 *      Player
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *  Algo.cpp
 *
 *  Contient divers algorithmes
 */

#include "GDL/algo.h"
#include "GDL/Log.h"
#include "GDL/Object.h"
#include <iostream>
#include <sstream>
#include <string>
#include <vector>
#include <cmath>
#include "GDL/Chercher.h"
#include <stdio.h>
#include <SFML/System.hpp>

//Découpage en fonction d'un séparateur
int Spliter(string Tableau[] , string chaine, char separateur, int longueur)
{
    EcrireLog(" Algo", "Appel de Spliter avec "+chaine);

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


    EcrireLog(" Algo", "Appel de Spliter FIN");

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
        Tableau->push_back( atoi(mot.c_str()));
        i++;
    }


    //EcrireLog(" Algo", "Appel de Spliter Vector FIN");

    return i;

}

std::string ToString( int i )
{
    std::ostringstream ss;
    ss << i;
    return ss.str();
}
