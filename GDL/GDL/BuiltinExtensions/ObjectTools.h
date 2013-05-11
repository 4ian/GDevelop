#ifndef OBJECTTOOLS_H
#define OBJECTTOOLS_H

#include <string>
#include <vector>
#include <map>
class RuntimeScene;
class RuntimeObject;

/**
 * Only used internally by GD events generated code.
 */
bool GD_API HitBoxesCollision( const std::string & firstObjName, const std::string & secondObjName, std::map <std::string, std::vector<RuntimeObject*> *> objectsLists1, std::map <std::string, std::vector<RuntimeObject*> *> objectsLists2, bool conditionInverted );

/**
 * Only used internally by GD events generated code.
 */
double GD_API PickedObjectsCount( const std::string &, std::map <std::string, std::vector<RuntimeObject*> *> objectsLists );

/**
 * Only used internally by GD events generated code.
 */
float GD_API DistanceBetweenObjects( const std::string & firstObjName, const std::string & secondObjName, std::map <std::string, std::vector<RuntimeObject*> *> objectsLists1, std::map <std::string, std::vector<RuntimeObject*> *> objectsLists2, std::string relationalOperator, float length, bool conditionInverted);

/**
 * Only used internally by GD events generated code.
 */
bool GD_API MovesToward( const std::string & firstObjName, const std::string & secondObjName, std::map <std::string, std::vector<RuntimeObject*> *> objectsLists1, std::map <std::string, std::vector<RuntimeObject*> *> objectsLists2, float tolerance, bool conditionInverted );

#endif // OBJECTTOOLS_H

