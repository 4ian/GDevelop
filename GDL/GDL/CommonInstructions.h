/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef COMMONINSTRUCTIONS_H
#define COMMONINSTRUCTIONS_H
#include <string>

/**
 * Generate a random number between 0 and max
 */
double GD_API Random(int max);

/**
 * \param Right hand side double
 * \param Left hand side double
 * \param Relation operator : =, <, >, <=, >= or !=. Empty string is considered as =.
 * \return rhs relationalOperator lhs
 */
bool GD_API RelationTest(double rhs, float lhs, std::string relationalOperator);

/**
 * Logical negation
 * \return !param
 */
bool GD_API LogicalNegation(bool param);

#endif // COMMONINSTRUCTIONS_H
