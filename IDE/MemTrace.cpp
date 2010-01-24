/**
 * Game Develop
 *    Editor
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *
 *
 *  Suivi des allocations/destructions des classes propres à Game Develop
 */

#include "MemTrace.h"
#include <stdio.h>
#include <stdlib.h>


MemTrace::MemTrace()
{
    //ctor
}

MemTrace::~MemTrace()
{
    //dtor
}

void MemTrace::AddObj(string pNom, long pAdresse)
{
    nom.push_back(pNom);
    adresse.push_back(pAdresse);
}

void MemTrace::DelObj(long pAdresse)
{
    for( unsigned int i = 0;i < adresse.size();i++)
    {
        if ( adresse.at(i) == pAdresse )
        {
            adresse.erase( adresse.begin() + i );
            nom.erase( nom.begin() + i );
        }
    }
}

void MemTrace::Rapport()
{
    printf("\nRapport de Memory Tracer-----------------------------------\n");
    for( unsigned int i = 0;i < adresse.size();i++)
    {
        printf("\nUn \"%s\" non lib\202r\202 ( adresse : %d)", nom.at(i).c_str(), adresse.at(i));
    }
    printf("\n-----------------------------------------------------------\n");
    system("pause");
}
