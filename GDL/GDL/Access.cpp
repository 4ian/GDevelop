/**
 *  Game Develop
 *      Player
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *  Access.cpp
 *
 *  Evaluation des expressions
 *  avec accès aux données des
 *  objets et valeurs spéciales.
 */

#include "GDL/Access.h"
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
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/Access.h"
#include "GDL/GDExpression.h"
#include "GDL/ExpressionInstruction.h"
#include "GDL/gpl.h"
#include "GDL/profile.h"
#include <ctime>
#include "GDL/eFreeFunctions.h"
#include "GDL/eObjectFunctions.h"
#include "GDL/ExtensionsManager.h"

Evaluateur::Evaluateur(const Game & pGame, const RuntimeScene & pScene) :
game(pGame),
scene(pScene),
objectsConcerned(NULL)
{
}

Evaluateur::~Evaluateur()
{
}

/**
 * Expression function needed for adding a constant text to the expression
 * ( For example, in 5*VAL(TempsFrame[])+1, 5* and +1 are constants. )
 */
string ExpConstantText( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction)
{
    return exprInstruction.parameters[0].GetPlainString();
}

/**
 * Expression function needed for calling objects expressions functions
 */
double ExpObjectFunction( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction)
{
    //We need an object to pass to the function
    ObjSPtr object = boost::shared_ptr<Object>();
    ObjList list = objectsConcerned->Pick( exprInstruction.parameters[0].GetPlainString() );

    if ( !list.empty() )
    {
        object = list[0]; //On prend le premier objet de la liste par défaut

        //Si l'objet principal de la  est dedans, on le prend
        ObjList::iterator iter = find(list.begin(), list.end(), obj1);
        if ( iter != list.end() )
            object = *iter;
        else
        {
            //Si l'objet secondaire de la  est dedans, on le prend
            iter = find(list.begin(), list.end(), obj2);
            if ( iter != list.end() )
                object = *iter;
        }
    }

    //Verify that we have a valid object
    if ( object != boost::shared_ptr<Object>() )
        return (object.get()->*exprInstruction.objectFunction)(scene, objectsConcerned, obj1, obj2, exprInstruction);
    else
        return 0;
}

/**
 * Add to the expression a call to the constant function.
 */
void Evaluateur::AddConstantFunctionCall(GDExpression & expr, string & plainExpression, size_t endPos)
{
    /*ExpressionInstruction instruction;

    instruction.parameters.push_back(GDExpression(plainExpression.substr(0, endPos)));
    instruction.function = &ExpConstantText;

    expr.exprSteps.push_back(instruction);*/

    //Finally, get ride of the object expression
    if ( endPos < plainExpression.length() )
        plainExpression = plainExpression.substr(endPos, plainExpression.length());
    else
        plainExpression = "";
}

void Evaluateur::AddObjectFunctionCall(GDExpression & expr, string & plainExpression, const RuntimeScene & scene)
{
    if ( plainExpression.find( "OBJ(" ) > 0 ) AddConstantFunctionCall(expr, plainExpression, plainExpression.find( "OBJ(" ));
    if ( plainExpression == "" ) return;

    //Isolate the object expression
    string objectExpressionOnly = plainExpression.substr(0, plainExpression.find( ")")+1);

    if ( objectExpressionOnly.empty() )
    {
        cout << "Malformed expression : An Object Expression ( OBJ ) is malformed.";
        plainExpression = ""; return;
    }

    //Get the object name
    string objectName = objectExpressionOnly.substr(4, plainExpression.find( "[")-4); //4 -> OBJ(

    if ( objectName.empty() )
    {
        cout << "Malformed expression : An Object Expression does not have an valid object name.";
        plainExpression = ""; return;
    }

    //Split parameters
    vector < GDExpression > parameters;
    while (objectExpressionOnly.find( "[" ) != std::string::npos )
    {
        if ( objectExpressionOnly.find( "]" ) == std::string::npos )
        {
            cout << "Malformed expression : An Object Expression has a parameter not terminated.";
            plainExpression = ""; return;
        }

        string parameterString = objectExpressionOnly.substr( objectExpressionOnly.find( "[" )+1, objectExpressionOnly.find( "]" ) - (objectExpressionOnly.find( "[" )+1) );

        GDExpression parameter(parameterString);
        PreprocessExpression(parameter, scene);

        parameters.push_back(parameter);

        objectExpressionOnly = objectExpressionOnly.substr(objectExpressionOnly.find( "]" )+1, objectExpressionOnly.length());
    }

    if ( !parameters.empty() && objectName != "")
    {
        ExpressionInstruction instruction;
        gdp::ExtensionsManager * extensionsManager = gdp::ExtensionsManager::getInstance();

        //Check objet typeId ofr extensions expressions
        unsigned int objectTypeId = GetTypeIdOfObject(*scene.game, scene, objectName);

        //Special workaround, need to be removed, or transfered to a "value function"
        if ( parameters[0].GetPlainString() == "count")
        {
            instruction.function = (&ExpGetObjectCount);

            //Get the parameter to transmit to the instruction
            parameters.erase(parameters.begin()); //Erase the function name
            parameters.insert(parameters.begin(), GDExpression(objectName)); //Add the object name
            instruction.parameters = (parameters);
        }
        //Search first in extensions
        else if ( extensionsManager->HasObjectExpression(objectTypeId, parameters[0].GetPlainString()) )
        {
            instruction.function = &ExpObjectFunction;
            instruction.objectFunction = extensionsManager->GetObjectExpressionFunctionPtr(objectTypeId, parameters[0].GetPlainString());

            //Get the parameter to transmit to the instruction
            parameters.erase(parameters.begin()); //Erase the function name
            parameters.insert(parameters.begin(), GDExpression(objectName)); //Add the object name
            instruction.parameters = (parameters);
        }
        else //Not corresponding to a function name, assume it is a variable
        {
            instruction.function = &ExpObjectFunction;
            instruction.objectFunction = (&Object::ExpGetObjectVariableValue);

            parameters.insert(parameters.begin(), GDExpression(objectName)); //Add the object name
            instruction.parameters = (parameters);
        }

        expr.AddMathExprFunction(instruction);
    }

    //Finally, get ride of the object expression
    if ( plainExpression.find(")")+1 < plainExpression.length() )
        plainExpression = plainExpression.substr(plainExpression.find(")")+1, plainExpression.length());
    else
        plainExpression = "";
}

void Evaluateur::AddFunctionCall(GDExpression & expr, string & plainExpression, const RuntimeScene & scene)
{
    if ( plainExpression.find( "VAL(" ) > 0 ) AddConstantFunctionCall(expr, plainExpression, plainExpression.find( "VAL(" ));
    if ( plainExpression == "" ) return;

    //Isolate the object expression
    string valueExpressionOnly = plainExpression.substr(0, plainExpression.find( ")")+1);

    if ( valueExpressionOnly.empty() )
    {
        cout << "Malformed expression : A Value Expression ( VAL ) is malformed.";
        plainExpression = ""; return;
    }

    //Get the function name
    string functionName = valueExpressionOnly.substr(4, plainExpression.find("[")-4); //4 -> VAL(

    if ( functionName.empty() )
    {
        cout << "Malformed expression : A Value Expression does not have a function name.";
        plainExpression = ""; return;
    }

    //Split parameters
    vector < GDExpression > parameters;
    while (valueExpressionOnly.find( "[" ) != std::string::npos )
    {
        if ( valueExpressionOnly.find( "]" ) == std::string::npos )
        {
            cout << "Malformed expression : A Value Expression has a parameter not terminated.";
            plainExpression = ""; return;
        }

        string parameterString = valueExpressionOnly.substr( valueExpressionOnly.find( "[" )+1, valueExpressionOnly.find( "]" ) - (valueExpressionOnly.find( "[" )+1) );
        GDExpression parameter(parameterString);
        PreprocessExpression(parameter, scene);

        parameters.push_back(parameter);

        valueExpressionOnly = valueExpressionOnly.substr(valueExpressionOnly.find( "]" )+1, valueExpressionOnly.length());
    }

    ExpressionInstruction instruction;

    //Search first in extensions
    gdp::ExtensionsManager * extensionsManager = gdp::ExtensionsManager::getInstance();
    if ( extensionsManager->HasExpression(functionName) )
    {
        instruction.function = (extensionsManager->GetExpressionFunctionPtr(functionName));
        instruction.parameters = (parameters);
    }
    else if ( GetExpBuiltinTable().find(functionName) != GetExpBuiltinTable().end() )
    {
        instruction.function = (GetExpBuiltinTable().find(functionName)->second);
        instruction.parameters = (parameters);
    }
    else //Not corresponding to a function name, assume it is a variable
    {
        vector < GDExpression > functionParameters;
        functionParameters.push_back(GDExpression(functionName));

        instruction.function = (&ExpGetVariableValue);
        instruction.parameters = (functionParameters);
    }

    expr.AddMathExprFunction(instruction);

    //Finally, get ride of the object expression
    if ( plainExpression.find(")")+1 < plainExpression.length() )
        plainExpression = plainExpression.substr(plainExpression.find(")")+1, plainExpression.length());
    else
        plainExpression = "";
}

void Evaluateur::AddGlobalFunctionCall(GDExpression & expr, string & plainExpression, const RuntimeScene & scene)
{
    if ( plainExpression.find( "GBL(" ) > 0 ) AddConstantFunctionCall(expr, plainExpression, plainExpression.find( "GBL(" ));
    if ( plainExpression == "" ) return;

    //Isolate the object expression
    string valueExpressionOnly = plainExpression.substr(0, plainExpression.find( ")")+1);

    if ( valueExpressionOnly.empty() )
    {
        cout << "Malformed expression : A Global Expression ( GBL ) is malformed.";
        plainExpression = ""; return;
    }

    //Get the function name
    string functionName = valueExpressionOnly.substr(4, plainExpression.find("[")-4);//4 -> GBL(

    if ( functionName.empty() )
    {
        cout << "Malformed expression : A Global Expression does not have a function name.";
        plainExpression = ""; return;
    }

    //Split parameters
    vector < GDExpression > parameters;
    while (valueExpressionOnly.find( "[" ) != std::string::npos )
    {
        if ( valueExpressionOnly.find( "]" ) == std::string::npos )
        {
            cout << "Malformed expression : A Global Expression has a parameter not terminated.";
            plainExpression = ""; return;
        }

        string parameterString = valueExpressionOnly.substr( valueExpressionOnly.find( "[" )+1, valueExpressionOnly.find( "]" ) - (valueExpressionOnly.find( "[" )+1) );

        GDExpression parameter(parameterString);
        PreprocessExpression(parameter, scene);

        parameters.push_back(parameter);

        valueExpressionOnly = valueExpressionOnly.substr(valueExpressionOnly.find( "]" )+1, valueExpressionOnly.length());
    }

    ExpressionInstruction instruction;

    //No functions in global, so not corresponding to a function name, assume it is a variable
    {
        vector < GDExpression > functionParameters;
        functionParameters.push_back(GDExpression(functionName));

        instruction.function = (&ExpGetGlobalVariableValue);
        instruction.parameters = (functionParameters);
    }

    expr.AddMathExprFunction(instruction);

    //Finally, get ride of the object expression
    if ( plainExpression.find(")")+1 < plainExpression.length() )
    {
        plainExpression = plainExpression.substr(plainExpression.find(")")+1, plainExpression.length());
    }
    else
        plainExpression = "";
}

void Evaluateur::PreprocessExpression(GDExpression & expr, const RuntimeScene & scene)
{
    string expression = expr.GetPlainString();
    string mathPlainExpression = expr.GetPlainString();

    {
        size_t objectExpressionStart = expression.find( "OBJ(" );
        size_t valExpressionStart = expression.find( "VAL(" );
        size_t gblExpressionStart = expression.find( "GBL(" );
        while ( objectExpressionStart != string::npos ||
                valExpressionStart != string::npos ||
                gblExpressionStart != string::npos )
        {
            //There is an object expression first.
            if ( objectExpressionStart != string::npos &&
                 objectExpressionStart < valExpressionStart &&
                 objectExpressionStart < gblExpressionStart)
            {
                AddObjectFunctionCall(expr, expression, scene);
            }
            //There is an value expression first.
            else if ( valExpressionStart != string::npos &&
                      valExpressionStart < objectExpressionStart &&
                      valExpressionStart < gblExpressionStart)
            {
                AddFunctionCall(expr, expression, scene);
            }
            //There is an global expression first.
            else if ( gblExpressionStart != string::npos &&
                      gblExpressionStart < objectExpressionStart &&
                      gblExpressionStart < valExpressionStart)
            {
                AddGlobalFunctionCall(expr, expression, scene);
            }

            objectExpressionStart = expression.find( "OBJ(" );
            valExpressionStart = expression.find( "VAL(" );
            gblExpressionStart = expression.find( "GBL(" );
        }

        if ( expression.length() > 0 ) AddConstantFunctionCall(expr, expression, expression.length());
    }

    {
        unsigned int xNb = 0;
        size_t objectExpressionStart = mathPlainExpression.find( "OBJ(" );
        size_t valExpressionStart = mathPlainExpression.find( "VAL(" );
        size_t gblExpressionStart = mathPlainExpression.find( "GBL(" );
        while ( objectExpressionStart != string::npos ||
                valExpressionStart != string::npos ||
                gblExpressionStart != string::npos )
        {
            //There is an object expression first.
            if ( objectExpressionStart != string::npos &&
                 objectExpressionStart < valExpressionStart &&
                 objectExpressionStart < gblExpressionStart)
            {
                mathPlainExpression.replace(objectExpressionStart,
                                            mathPlainExpression.find(")", objectExpressionStart)-objectExpressionStart+1,
                                            "x"+ToString(xNb));
            }
            //There is an value expression first.
            else if ( valExpressionStart != string::npos &&
                      valExpressionStart < objectExpressionStart &&
                      valExpressionStart < gblExpressionStart)
            {
                mathPlainExpression.replace(valExpressionStart,
                                            mathPlainExpression.find(")", valExpressionStart)-valExpressionStart+1,
                                            "x"+ToString(xNb));
            }
            //There is an global expression first.
            else if ( gblExpressionStart != string::npos &&
                      gblExpressionStart < objectExpressionStart &&
                      gblExpressionStart < valExpressionStart)
            {
                mathPlainExpression.replace(gblExpressionStart,
                                            mathPlainExpression.find(")", gblExpressionStart)-gblExpressionStart+1,
                                            "x"+ToString(xNb));
            }

            objectExpressionStart = mathPlainExpression.find( "OBJ(" );
            valExpressionStart = mathPlainExpression.find( "VAL(" );
            gblExpressionStart = mathPlainExpression.find( "GBL(" );
            xNb++;
        }

        string parameters;
        for (unsigned int i = 0;i<=xNb;++i)
            parameters += "x"+ToString(i)+",";

        if ( -1 != expr.ParseMathExpression(mathPlainExpression, parameters))
        {
            expr.ParseMathExpression("0", "");
        }
    }

    expr.SetPreprocessed();
}

////////////////////////////////////////////////////////////
/// Analyse une expression et renvoie au final un nombre
////////////////////////////////////////////////////////////
double Evaluateur::EvalExp(GDExpression & expression, ObjSPtr obj1, ObjSPtr obj2) const
{
    BT_PROFILE("EvalExp");

    if ( !expression.IsPreprocessed() ) PreprocessExpression(expression, scene);

    if ( objectsConcerned == NULL )
    {
        cout << "objectsConcerned == NULL";
    }

    vector < double > vals;

    for (unsigned int i = 0;i<expression.GetMathExprFunctions().size();++i)
        vals.push_back((expression.GetMathExprFunctions()[i].function)(&scene, objectsConcerned, obj1, obj2, expression.GetMathExprFunctions()[i]));

    return expression.EvalMathExpression(&vals[0]);
}


////////////////////////////////////////////////////////////
/// Analyse un texte, remplace les CAL"" et les TXT""
////////////////////////////////////////////////////////////
string Evaluateur::EvalTxt( GDExpression & gdExpression, ObjSPtr obj1, ObjSPtr obj2 ) const
{
    string expression = gdExpression.GetPlainString();

    while ( expression.find( "CAL\"" ) < expression.length() )
    {
        //1) Retrouver un objet
        int departObj = expression.find( "CAL\"" );
        int longObjet = expression.find( "\"", departObj + 4 ) + 1 - departObj;

        int departNom = departObj + 4;

        string nomObjet = expression.substr( departNom, expression.length() );
        nomObjet = nomObjet.substr( 0, nomObjet.find( "\"" ) );

        GDExpression expr(nomObjet);
        double valeur = EvalExp( expr, obj1, obj2 );
        std::ostringstream ss;
        ss << valeur;

        //Suppression de l'exposant
        if ( ss.str().find("e") != string::npos )
        {
            ss.precision(-1);
            ss.str("");
            ss << fixed << valeur;

            while( ss.str()[ss.str().length()-1] == '0')
                ss.str(ss.str().substr(0, ss.str().length()-1));

            if ( ss.str()[ss.str().length()-1] == '.' )
                ss.str(ss.str().substr(0, ss.str().length()-1));
        }

        expression.replace( departObj, longObjet, ss.str() );
    }
    while ( expression.find( "TXT\"" ) < expression.length() )
    {
        //1) Retrouver un objet
        int departObj = expression.find( "TXT\"" );
        int longObjet = expression.find( "\"", departObj + 4 ) + 1 - departObj;

        int departNom = departObj + 4;

        string nomObjet = expression.substr( departNom, expression.length() );
        nomObjet = nomObjet.substr( 0, nomObjet.find( "\"" ) );
        GDExpression subExpr(nomObjet);

        expression.replace( departObj, longObjet, EvalExpTxt( subExpr ) );
    }

    return expression;

}

////////////////////////////////////////////////////////////
/// Analyse une expression textuelle ( TXT"qqchose")
////////////////////////////////////////////////////////////
string Evaluateur::EvalExpTxt( GDExpression & gdExpression, ObjSPtr obj1, ObjSPtr obj2 ) const
{
    string expression = gdExpression.GetPlainString();

    //Initialisation du remplaceur
    string expressionfinale = expression;

    //Remplace les accès aux données des objets par leur valeur
    //Exemple : OBJ(mur[x]) -> 50
    while ( expression.find( "OBJ(" ) < expression.length() )
    {
        string valeur = "0";

        //1) Retrouver un objet
        int departObj = expression.find( "OBJ(" );
        int departNom = departObj + 4;

        string nomObjet = expression.substr( departNom, expression.length() );
        int longObjet = nomObjet.find( ")" );
        string propObjet = expression.substr( departNom, expression.length() );

        nomObjet = nomObjet.substr( 0, nomObjet.find( "[" ) );
        propObjet = propObjet.substr( propObjet.find( "[" ) + 1, propObjet.find( "]" ) - propObjet.find( "[" ) - 1 );

        //On cherche l'objet concerné
        ObjSPtr object = boost::shared_ptr<Object>( );
        ObjList list = objectsConcerned->Pick( nomObjet );

        if ( !list.empty() )
        {
            object = list[0]; //On prend le premier objet de la liste par défaut

            //Si l'objet principal de la condition est dedans, on le prend
            ObjList::iterator iter = find(list.begin(), list.end(), obj1);
            if ( iter != list.end() )
                object = *iter;
            else
            {
                //Si l'objet secondaire de la condition est dedans, on le prend
                iter = find(list.begin(), list.end(), obj2);
                if ( iter != list.end() )
                    object = *iter;
            }
        }

        if ( object == boost::shared_ptr<Object>( ) )
        {
            valeur = "";
        }
        //Propriétés des objets
        else if ( !object->variablesObjet.variables.empty() )
        {
            for ( unsigned int i = 0;i < object->variablesObjet.variables.size();i++ )
            {
                //On parcourt chaque variable et teste le nom
                if ( object->variablesObjet.variables.at( i ).GetName() == propObjet )
                {
                    valeur = object->variablesObjet.variables.at( i ).Gettexte();
                }
            }
        }

        expression.replace( departObj, longObjet + 5, valeur );
    }

    //Remplace les valeurs spéciales ( comme une valeur aléatoire ) par un nombre.
    while ( expression.find( "VAL(" ) < expression.length() )
    {

        string valeur = "";

        //1) Retrouver les valeurs
        int departObj = expression.find( "VAL(" );
        int departNom = departObj + 4;

        string nomObjet = expression.substr( departNom, expression.length() );
        int longObjet = nomObjet.find( ")" );
        string propObjet = expression.substr( departNom, expression.length() );

        nomObjet = nomObjet.substr( 0, nomObjet.find( "[" ) );
        propObjet = propObjet.substr( propObjet.find( "[" ) + 1, propObjet.find( "]" ) - propObjet.find( "[" ) - 1 );

        //Les valeurs spéciales
        if ( !scene.variables.variables.empty() )
        {
            for ( unsigned int i = 0;i < scene.variables.variables.size();i++ )
            {
                //On parcourt chaque variable et teste le nom
                if ( scene.variables.variables.at( i ).GetName() == nomObjet )
                {
                    valeur = scene.variables.variables.at( i ).Gettexte();
                }
            }
        }

        expression.replace( departObj, longObjet + 5, valeur );
    }

    //Remplace les valeurs spéciales ( comme une valeur aléatoire ) par un nombre.
    while ( expression.find( "GBL(" ) < expression.length() )
    {

        string valeur = "";

        //1) Retrouver les valeurs
        int departObj = expression.find( "GBL(" );
        int departNom = departObj + 4;

        string nomObjet = expression.substr( departNom, expression.length() );
        int longObjet = nomObjet.find( ")" );
        string propObjet = expression.substr( departNom, expression.length() );

        nomObjet = nomObjet.substr( 0, nomObjet.find( "[" ) );
        propObjet = propObjet.substr( propObjet.find( "[" ) + 1, propObjet.find( "]" ) - propObjet.find( "[" ) - 1 );

        //Les valeurs spéciales
        if ( !game.variables.variables.empty() )
        {
            for ( unsigned int i = 0;i < game.variables.variables.size();i++ )
            {
                //On parcourt chaque variable et teste le nom
                if ( game.variables.variables.at( i ).GetName() == nomObjet )
                {
                    valeur = game.variables.variables.at( i ).Gettexte();
                }
            }
        }

        expression.replace( departObj, longObjet + 5, valeur );
    }


    return expression;
}
