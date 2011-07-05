#ifndef OBJECTTOOLS_H
#define OBJECTTOOLS_H

#include <string>
#include <vector>
class RuntimeScene;
class Object;

/**
 * Only used internally by GD events generated code.
 */
bool GD_API HitBoxesCollision( std::string, std::string , std::vector<Object*> & objects1, std::vector<Object*> & objects2, bool conditionInverted );

/**
 * Only used internally by GD events generated code.
 */
double GD_API PickedObjectsCount( std::string , std::vector<Object*> & pickedObjects );

/**
 * Only used internally by GD events generated code.
 */
float GD_API DistanceBetweenObjects( std::string, std::string, std::vector<Object*> & objects1, std::vector<Object*> & objects2, float length, std::string relationalOperator, bool conditionInverted);

/**
 * Only used internally by GD events generated code.
 */
bool GD_API MovesToward( std::string, std::string , std::vector<Object*> & objects1, std::vector<Object*> & list2, float tolerance, bool conditionInverted );

/**
 * Only used internally by GD events generated code.
 */
void GD_API AddForceTowardObject( std::string , std::string , float length, float clearing, std::vector<Object*> & objects1, std::vector<Object*> & list2 );

/**
 * Only used internally by GD events generated code.
 */
void GD_API AddForceToMoveAround( std::string , std::string , float velocity, float length, float clearing, std::vector<Object*> & objects1, std::vector<Object*> & list2 );

/**
 * Only used internally by GD events generated code.
 */
void GD_API PutAround( std::string , std::string , float length, float angleInDegrees, std::vector<Object*> & objects1, std::vector<Object*> & list2 );

/**
 * Only used internally by GD events generated code.
 */
void GD_API SeparateObjectsWithoutForces( std::string , std::string , std::vector<Object*> & objects1, std::vector<Object*> & objects2 );

/**
 * Only used internally by GD events generated code.
 */
void GD_API SeparateObjectsWithForces( std::string , std::string , std::vector<Object*> & objects1, std::vector<Object*> & objects2 );
#endif // OBJECTTOOLS_H
