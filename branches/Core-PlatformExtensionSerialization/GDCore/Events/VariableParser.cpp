/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
#include <string>
#include <vector>
#include "GDCore/Events/VariableParser.h"
namespace gd { class Layout; }
namespace gd { class Project; }
namespace gd { class Platform; }
#include <wx/intl.h>

namespace gd
{

VariableParser::~VariableParser()
{
}

bool VariableParser::Parse(VariableParserCallbacks & callbacks_) 
{ 
	callbacks = &callbacks_;
    rootVariableParsed = false;
	firstErrorStr.clear(); 
	firstErrorPos = 0; 
	currentPosition = 0;
	currentTokenType = TS_INVALID;
	currentToken.clear();
	S(); 

	return firstErrorStr == ""; 
}

void VariableParser::ReadToken()
{
	currentTokenType = TS_INVALID;
	currentToken.clear();
	while ( currentPosition < expression.length() ) {

		if ( expression[currentPosition] == '[' ||
			expression[currentPosition] == ']' ||
			expression[currentPosition] == '.' ) 
		{
			if ( currentTokenType == TS_VARNAME )
				return; //We've parsed a variable name.
		}

		if ( expression[currentPosition] == '[' ) {
			currentTokenType = TS_OPENING_BRACKET;
			currentToken.clear();
			currentPosition++;
			return;
		}
		else if ( expression[currentPosition] == ']' ) {
			currentTokenType = TS_CLOSING_BRACKET;
			currentToken.clear();
			currentPosition++;
			return;
		}
		else if ( expression[currentPosition] == '.' ) {
			currentTokenType = TS_PERIOD;
			currentToken.clear();
			currentPosition++;
			return;
		}

		currentTokenType = TS_VARNAME; //We're parsing a variable name.
		currentToken += expression[currentPosition];
		currentPosition++;
	}
	
	//Can be reached if we are at the end of the expression. In this case,
	//currentTokenType will be either TS_VARNAME or TS_INVALID.
}

void VariableParser::S()
{
	ReadToken();
	if (currentTokenType != TS_VARNAME)
	{
	    firstErrorStr = _("Expecting a variable name.");
	    firstErrorPos = currentPosition;
	    return;
	}

	if (!rootVariableParsed)
	{
		rootVariableParsed = true;
		if ( callbacks ) callbacks->OnRootVariable(currentToken);
	}
	else
		if ( callbacks ) callbacks->OnChildVariable(currentToken);

	X();
}

void VariableParser::X()
{
	ReadToken();
	if (currentTokenType == TS_INVALID)
	    return; //Ended parsing.
	else if (currentTokenType == TS_PERIOD)
	    S();
	else if (currentTokenType == TS_OPENING_BRACKET)
	{
		std::string strExpr = SkipStringExpression();

		ReadToken();
		if (currentTokenType != TS_CLOSING_BRACKET)
		{
		    firstErrorStr = _("Expecting ]");
		    firstErrorPos = currentPosition;
		    return;
		}
		if ( callbacks ) callbacks->OnChildSubscript(strExpr);
		X();
	}

}

std::string VariableParser::SkipStringExpression()
{
	std::string stringExpression;
	bool insideStringLiteral = false;
	bool lastCharacterWasBackslash = false;
	unsigned int nestedBracket = 0;
	while ( currentPosition < expression.length() ) {
		if ( expression[currentPosition] == '\"' ) {
			if ( !insideStringLiteral )
				insideStringLiteral = true;
			else if ( !lastCharacterWasBackslash )
				insideStringLiteral = false;
		}
		else if ( expression[currentPosition] == '[' && !insideStringLiteral ) {
			nestedBracket++;
		}
		else if ( expression[currentPosition] == ']' && !insideStringLiteral ) {
			if ( nestedBracket == 0 ) return stringExpression; //Found the end of the string litteral.
			nestedBracket--;
		}

		lastCharacterWasBackslash = expression[currentPosition] == '\\';
		stringExpression += expression[currentPosition];
		currentPosition++;
	}

	//End of the expression reached ( So expression is invalid by the way )
	return stringExpression;
}

}