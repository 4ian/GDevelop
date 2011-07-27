#ifndef OBJECTTOOLS_H
#define OBJECTTOOLS_H

#include <string>
#include <vector>
#include <map>
class RuntimeScene;
class Object;

/**
 * Only used internally by GD events generated code.
 */
bool GD_API HitBoxesCollision( std::string, std::string , std::map <std::string, std::vector<Object*> *> objectsLists1, std::map <std::string, std::vector<Object*> *> objectsLists2, bool conditionInverted );

/**
 * Only used internally by GD events generated code.
 */
double GD_API PickedObjectsCount( std::string , std::map <std::string, std::vector<Object*> *> objectsLists );

/**
 * Only used internally by GD events generated code.
 */
float GD_API DistanceBetweenObjects( std::string, std::string, std::map <std::string, std::vector<Object*> *> objectsLists1, std::map <std::string, std::vector<Object*> *> objectsLists2, float length, std::string relationalOperator, bool conditionInverted);

/**
 * Only used internally by GD events generated code.
 */
bool GD_API MovesToward( std::string, std::string , std::map <std::string, std::vector<Object*> *> objectsLists1, std::map <std::string, std::vector<Object*> *> objectsLists2, float tolerance, bool conditionInverted );

#endif // OBJECTTOOLS_H
