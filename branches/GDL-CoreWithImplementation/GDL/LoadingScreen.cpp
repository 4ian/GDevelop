#include "GDL/LoadingScreen.h"
#include <string>
#include <vector>

using namespace std;

LoadingScreen::LoadingScreen() :
afficher(false),
border(true),
smooth(true),
width(170),
height(50),
texte(true),
texteChargement("Chargement"),
texteXPos(0),
texteYPos(5),
pourcent(false),
pourcentXPos(0),
pourcentYPos(0),
image(false),
imageFichier("")
{
    //ctor
}

LoadingScreen::~LoadingScreen()
{
    //dtor
}

