#if !defined(EMSCRIPTEN)
#ifndef OBJECTTOOLS_H
#define OBJECTTOOLS_H

#include <string>
#include <vector>
#include <map>
class RuntimeScene;
class RuntimeObject;
typedef bool (*TwoObjectsListsTestFunc)(RuntimeObject*, RuntimeObject*, float extraParameter);

/**
 * \brief Do a test on two tables of objects so as to remove the objects for which the test is false.
 *
 * \note If conditionInverted == true, only the objects of the first table are filtered.
 * \param objectsLists1 The first object lists
 * \param objectsLists2 The second object lists
 * \param conditionInverted true if the test must be inverted
 * \param functor The function to be called
 * \param extraParameter An extra parameter send to the functor
 */
bool GD_API TwoObjectListsTest(std::map <std::string, std::vector<RuntimeObject*> *> objectsLists1,
                               std::map <std::string, std::vector<RuntimeObject*> *> objectsLists2,
                               bool conditionInverted,
                               TwoObjectsListsTestFunc functor, float extraParameter );

/**
 * Only used internally by GD events generated code.
 */
bool GD_API ObjectsTurnedToward( std::map <std::string, std::vector<RuntimeObject*> *> objectsLists1, std::map <std::string, std::vector<RuntimeObject*> *> objectsLists2, float tolerance, bool conditionInverted );

/**
 * Only used internally by GD events generated code.
 */
bool GD_API HitBoxesCollision( std::map <std::string, std::vector<RuntimeObject*> *> objectsLists1, std::map <std::string, std::vector<RuntimeObject*> *> objectsLists2, bool conditionInverted );

/**
 * Only used internally by GD events generated code.
 */
double GD_API PickedObjectsCount( std::map <std::string, std::vector<RuntimeObject*> *> objectsLists );

/**
 * Only used internally by GD events generated code.
 */
float GD_API DistanceBetweenObjects(std::map <std::string, std::vector<RuntimeObject*> *> objectsLists1, std::map <std::string, std::vector<RuntimeObject*> *> objectsLists2, float length, bool conditionInverted);

/**
 * Only used internally by GD events generated code.
 */
bool GD_API MovesToward( std::map <std::string, std::vector<RuntimeObject*> *> objectsLists1, std::map <std::string, std::vector<RuntimeObject*> *> objectsLists2, float tolerance, bool conditionInverted );

#endif // OBJECTTOOLS_H
#endif