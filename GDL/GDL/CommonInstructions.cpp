/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/CommonInstructions.h"
#include <SFML/Graphics.hpp>

double GD_API Random(unsigned int max)
{
    return sf::Randomizer::Random(0, max);
}

bool GD_API RelationTest(double rhs, float lhs, std::string relationalOperator)
{
    if (    ( relationalOperator.empty() && rhs == lhs ) ||
            ( relationalOperator == "=" && rhs == lhs ) ||
            ( relationalOperator == "<" && rhs < lhs ) ||
            ( relationalOperator == ">" && rhs > lhs ) ||
            ( relationalOperator == "<=" && rhs <= lhs ) ||
            ( relationalOperator == ">=" && rhs >= lhs ) ||
            ( relationalOperator == "!=" && rhs != lhs )
       )
    {
        return true;
    }

    return false;
}

bool GD_API LogicalNegation(bool param)
{
    return !param;
}
