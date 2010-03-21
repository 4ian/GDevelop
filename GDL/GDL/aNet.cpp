#include <vector>
#include "GDL/RuntimeScene.h"
#include "GDL/Access.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/md5.h"



////////////////////////////////////////////////////////////
/// Envoyer des données ( score, niveau... ) à une page php
/// qui receptionnera ces données.
/// Pour éviter l'envoi de données piratées ( hausse de scores... )
/// une somme MD5 sera appliquée à chaque données, auquelle on
/// aura rajouté le mot de passe définie par le créateur du jeu.
/// La page php devra connaitre aussi ce mot de passe, et l'ajoutera
/// à la donnée puis fera la somme md5 du tout. Si les sommes se
/// correspondent, alors les données seront acceptées.
///
/// Type : EnvoiDataNet
/// Paramètre 1 : Adresse de la page php
/// Paramètre 2 : Mot de passe de sécurité
/// Paramètre 3 : Donnée 1 ( texte )
/// Paramètre 4 : Donnée 2 ( texte )
/// Paramètre 5 : Donnée 3 ( texte )
/// Paramètre 6 : Donnée 4 ( texte )
/// Paramètre 7 : Donnée 5 ( texte )
/// Paramètre 8 : Donnée 6 ( texte )
////////////////////////////////////////////////////////////
bool ActEnvoiDataNet( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    string data1 = eval.EvalTxt(action.GetParameter(2)); //On récupère les données
    string data2 = eval.EvalTxt(action.GetParameter(3));
    string data3 = eval.EvalTxt(action.GetParameter(4));
    string data4 = eval.EvalTxt(action.GetParameter(5));
    string data5 = eval.EvalTxt(action.GetParameter(6));
    string data6 = eval.EvalTxt(action.GetParameter(7));

    string data1md5 = md5(data1+action.GetParameter(1).GetPlainString()); //On leur ajoute le mot de passe
    string data2md5 = md5(data2+action.GetParameter(1).GetPlainString()); //Et on effectue la somme de contrôle
    string data3md5 = md5(data3+action.GetParameter(1).GetPlainString());
    string data4md5 = md5(data4+action.GetParameter(1).GetPlainString());
    string data5md5 = md5(data5+action.GetParameter(1).GetPlainString());
    string data6md5 = md5(data6+action.GetParameter(1).GetPlainString());

#ifdef WINDOWS
    //Création de l'adresse internet à lancer
    string appel = "start \"\" \""+eval.EvalTxt(action.GetParameter(0))+
                    "?data1="+data1+"&check1="+data1md5+
                    "&data2="+data2+"&check2="+data2md5+
                    "&data3="+data3+"&check3="+data3md5+
                    "&data4="+data4+"&check4="+data4md5+
                    "&data5="+data5+"&check5="+data5md5+
                    "&data6="+data6+"&check6="+data6md5+"\"";

    system(appel.c_str());
#endif
#ifdef LINUX
    //Nécessite le paquet xdg-utils
    string appel = "xdg-open \""+eval.EvalTxt(action.GetParameter(0))+
                    "?data1="+data1+"&check1="+data1md5+
                    "&data2="+data2+"&check2="+data2md5+
                    "&data3="+data3+"&check3="+data3md5+
                    "&data4="+data4+"&check4="+data4md5+
                    "&data5="+data5+"&check5="+data5md5+
                    "&data6="+data6+"&check6="+data6md5+"\"";

    system(appel.c_str());
#endif

    return true;
}

#undef PARAM
