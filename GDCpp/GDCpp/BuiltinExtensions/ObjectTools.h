#ifndef OBJECTTOOLS_H
#define OBJECTTOOLS_H

#include <string>
#include <vector>
#include <map>
class RuntimeScene;
class RuntimeObject;

/**
 * Base class used to add extra parameters to the test function inside TwoObjectListsTest.
 */
struct GD_API ListsTestFuncExtraParameter
{
	ListsTestFuncExtraParameter(){};
	virtual ~ListsTestFuncExtraParameter(){};
};

/**
 * Used by MovesToward and ObjectsTurnedToward function to bring a extra parameter to the test function.
 */
struct MovesTowardExtraParameter : public ListsTestFuncExtraParameter
{
	MovesTowardExtraParameter(float tolerance_) : ListsTestFuncExtraParameter(), tolerance(tolerance_) {};

	float tolerance;
};

/**
 * Used by DistanceBetweenObjects to get the length
 */
struct DistanceExtraParameter : public ListsTestFuncExtraParameter
{
	DistanceExtraParameter(float squaredLength_) : ListsTestFuncExtraParameter(), squaredLength(squaredLength_) {};

	float squaredLength;
};

typedef bool (*TwoObjectsListsTestFunc)(RuntimeObject*, RuntimeObject*, const ListsTestFuncExtraParameter &extraParameter);

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
                               TwoObjectsListsTestFunc functor, const ListsTestFuncExtraParameter &extraParameter );

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