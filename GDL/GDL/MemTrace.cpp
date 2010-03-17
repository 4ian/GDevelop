#include "GDL/MemTrace.h"
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
    printf("\nRapport de mémoire");
    printf("\n------------------");
    for( unsigned int i = 0;i < adresse.size();i++)
    {
        printf("\nUn \"%s\" non libéré ( adresse : %d)", nom.at(i).c_str(), adresse.at(i));
    }
    printf("\n------------------\n");
}
