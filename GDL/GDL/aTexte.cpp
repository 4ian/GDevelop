
#include <vector>
#include <string>
#include <SFML/System.hpp>
#include "GDL/Object.h"
#include <cmath>
#include "GDL/aTexte.h"
#include "GDL/Event.h"
#include <iostream>
#include <sstream>
#include "GDL/Chercher.h"
#include "GDL/algo.h"
#include "GDL/Force.h"
#include <iostream>
#include "GDL/Access.h"
#include "GDL/RuntimeScene.h"



////////////////////////////////////////////////////////////
/// Ecrit du texte
///
/// Type : EcrireTexte
/// Paramètre 1 : Texte
/// Paramètre 2 : X
/// Paramètre 3 : Y
/// Paramètre 4 : Couleur
/// Paramètre 5 : Taille
/// Paramètre 6 : Police
/// Paramètre 7 : Calque
////////////////////////////////////////////////////////////
bool ActEcrireTexte( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    Text texte;
    texte.text.SetString(eval.EvalTxt(action.GetParameter(0) ) );
    texte.text.SetPosition(eval.EvalExp(action.GetParameter(1) ), eval.EvalExp(action.GetParameter(2) ));

    vector < GDExpression > colors = SpliterStringToVector <GDExpression> (action.GetParameter(3).GetPlainString(), ';');

    if ( colors.size() > 2 )
    {
        texte.text.SetColor(sf::Color(
                                static_cast<int>(eval.EvalExp( colors[0] )),
                                static_cast<int>(eval.EvalExp( colors[1] )),
                                static_cast<int>(eval.EvalExp( colors[2] )) ));
    }

    texte.text.SetCharacterSize(eval.EvalExp(action.GetParameter(4) ));

    texte.fontName = action.GetParameter(5).GetPlainString();

    //Compatibilité Game Develop 1.0.4529
    if ( action.GetParameters().size() >= 7 )
        texte.layer = action.GetParameter(6).GetPlainString();

    scene->textes.push_back(texte);

    return true;
}

#undef PARAM
