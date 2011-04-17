#include <vector>
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/md5.h"
#include <SFML/Network.hpp>
#include <fstream>


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
bool ActEnvoiDataNet( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    string data1 = action.GetParameter(2).GetAsTextExpressionResult(scene, objectsConcerned); //On récupère les données
    string data2 = action.GetParameter(3).GetAsTextExpressionResult(scene, objectsConcerned);
    string data3 = action.GetParameter(4).GetAsTextExpressionResult(scene, objectsConcerned);
    string data4 = action.GetParameter(5).GetAsTextExpressionResult(scene, objectsConcerned);
    string data5 = action.GetParameter(6).GetAsTextExpressionResult(scene, objectsConcerned);
    string data6 = action.GetParameter(7).GetAsTextExpressionResult(scene, objectsConcerned);

    string data1md5 = md5(data1+action.GetParameter(1).GetPlainString()); //On leur ajoute le mot de passe
    string data2md5 = md5(data2+action.GetParameter(1).GetPlainString()); //Et on effectue la somme de contrôle
    string data3md5 = md5(data3+action.GetParameter(1).GetPlainString());
    string data4md5 = md5(data4+action.GetParameter(1).GetPlainString());
    string data5md5 = md5(data5+action.GetParameter(1).GetPlainString());
    string data6md5 = md5(data6+action.GetParameter(1).GetPlainString());

#ifdef WINDOWS
    //Création de l'adresse internet à lancer
    string call = "start \"\" \""+action.GetParameter(0).GetAsTextExpressionResult(scene, objectsConcerned)+
                   "?data1="+data1+"&check1="+data1md5+
                   "&data2="+data2+"&check2="+data2md5+
                   "&data3="+data3+"&check3="+data3md5+
                   "&data4="+data4+"&check4="+data4md5+
                   "&data5="+data5+"&check5="+data5md5+
                   "&data6="+data6+"&check6="+data6md5+"\"";

    system(call.c_str());
#elif defined(LINUX)
    //Nécessite le paquet xdg-utils
    string call = "xdg-open \""+action.GetParameter(0).GetAsTextExpressionResult(scene, objectsConcerned)+
                   "?data1="+data1+"&check1="+data1md5+
                   "&data2="+data2+"&check2="+data2md5+
                   "&data3="+data3+"&check3="+data3md5+
                   "&data4="+data4+"&check4="+data4md5+
                   "&data5="+data5+"&check5="+data5md5+
                   "&data6="+data6+"&check6="+data6md5+"\"";

    system(call.c_str());
#elif defined(MAC)
    //Nécessite le paquet xdg-utils
    string call = "open \""+action.GetParameter(0).GetAsTextExpressionResult(scene, objectsConcerned)+
                   "?data1="+data1+"&check1="+data1md5+
                   "&data2="+data2+"&check2="+data2md5+
                   "&data3="+data3+"&check3="+data3md5+
                   "&data4="+data4+"&check4="+data4md5+
                   "&data5="+data5+"&check5="+data5md5+
                   "&data6="+data6+"&check6="+data6md5+"\"";

    system(call.c_str());
#endif

    return true;
}

bool ActDownloadFile( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    // Create Http
    sf::Http Http;
    Http.SetHost(action.GetParameter(0).GetAsTextExpressionResult(scene, objectsConcerned));

    // Create request
    sf::Http::Request Request;
    Request.SetMethod(sf::Http::Request::Get);
    Request.SetUri(action.GetParameter(1).GetAsTextExpressionResult(scene, objectsConcerned));

    // Send request & Get response
    sf::Http::Response datas = Http.SendRequest(Request);

    string ofilename = action.GetParameter(2).GetAsTextExpressionResult(scene, objectsConcerned);
    ofstream ofile(ofilename.c_str(), ios_base::binary);
    if ( ofile.is_open() )
    {
        ofile.write(datas.GetBody().c_str(),datas.GetBody().size());
        ofile.close();

        return true;
    }

    cout << "Downloading file : Unable to open output file " << ofilename;
    return false;
}
