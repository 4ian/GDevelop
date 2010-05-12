#include "GDL/GDExpression.h"
#include "GDL/ExpressionInstruction.h"
#include "GDL/gpl.h"


GDExpression::GDExpression(std::string plainString_) : plainString(plainString_), oIDcomputed(false), isPreprocessed(false)
{
    if (plainString == "=" ) compOperator = Equal;
    else if (plainString == "<" ) compOperator = Inferior;
    else if (plainString == ">" ) compOperator = Superior;
    else if (plainString == "<=" ) compOperator = InferiorOrEqual;
    else if (plainString == ">=" ) compOperator = SuperiorOrEqual;
    else if (plainString == "!=" ) compOperator = Different;
    else compOperator = Undefined;

    if (plainString == "=" ) modOperator = Set;
    else if (plainString == "+" ) modOperator = Add;
    else if (plainString == "-" ) modOperator = Substract;
    else if (plainString == "*" ) modOperator = Multiply;
    else if (plainString == "/" ) modOperator = Divide;
    else modOperator = UndefinedModification;

}

GDExpression::~GDExpression()
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
    ObjList list = objectsConcerned->Pick( exprInstruction.parameters[0].GetAsObjectIdentifier() );

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
        parameter.PreprocessExpressions(scene);

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
        parameter.PreprocessExpressions(scene);

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
        parameter.PreprocessExpressions(scene);

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

GDExpression::PreprocessExpressions(const RuntimeScene & scene)
{
    PreprocessMathExpression(scene);
    PreprocessTextExpression(scene);
}

GDExpression::PreprocessMathExpression(const Runtime & scene)
{
    string expression = GetPlainString();
    string mathPlainExpression = GetPlainString();
    mathExpressionFunctions.clear();

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

        string parametersStr;
        for (unsigned int i = 0;i<=xNb;++i)
            parametersStr += "x"+ToString(i)+",";

        if ( -1 != mathExpression.Parse(mathPlainExpression, parametersStr))
        {
            mathExpression.Parse("0", "");
        }
    }

    isMathExpressionPreprocessed = true;
}

GDExpression::PreprocessTextExpression(const Runtime & scene)
{
}
