#include "GDL/Dossier.h"
#include <string>
#include <vector>
#include <iostream>

using namespace std;

struct est_egal
{
    bool operator()( std::string &a ) const
    {
        if ( a == compare )
        {
            return true;
        }

        return false;
    }

    string compare;
};

Dossier::Dossier() :
nom("Dossier sans nom")
{
}

Dossier::~Dossier()
{
    //dtor
}


void Dossier::ReplaceNomImage( vector < Dossier > * dossiers, string ancien, string nouveau )
{
    for ( unsigned int i = 0;i < dossiers->size() ;i++ )
    {
        for ( unsigned int j = 0;j < dossiers->at( i ).contenu.size() ;j++ )
        {
            if ( dossiers->at( i ).contenu.at( j ) == ancien )
                dossiers->at( i ).contenu.at( j ) = nouveau;
        }
    }
}

void Dossier::RemoveImage( vector < Dossier > * dossiers, string image, int ID )
{
    if ( ID == -1 )
    {
        for ( unsigned int i = 0;i < dossiers->size() ;i++ )
        {
            for ( unsigned int j = 0;j < dossiers->at( i ).contenu.size() ;j++ )
            {
                if ( dossiers->at( i ).contenu.at( j ) == image )
                {
                    dossiers->at( i ).contenu.erase( dossiers->at( i ).contenu.begin() + j );
                }
            }
        }
    }
    else
    {
        if ( ID < 0 || static_cast<unsigned>(ID) >= dossiers->size() )
            return;

        for ( unsigned int j = 0;j < dossiers->at( ID ).contenu.size() ;j++ )
        {
            if ( dossiers->at( ID ).contenu.at( j ) == image )
            {
                dossiers->at( ID ).contenu.erase( dossiers->at( ID ).contenu.begin() + j );
            }
        }

    }
}

void Dossier::Add( vector < Dossier > * dossiers, string nom, int ID )
{
    if ( ID > -1 && static_cast<unsigned>(ID) < dossiers->size() )
    {
        dossiers->at( ID ).contenu.push_back( nom );
    }
}
