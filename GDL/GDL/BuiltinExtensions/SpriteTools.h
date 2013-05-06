#ifndef SPRITETOOLS_H
#define SPRITETOOLS_H

#include <string>
#include <map>
#include <vector>
class RuntimeScene;
class RuntimeObject;

bool GD_API SpriteTurnedToward( const std::string &, const std::string &, std::map <std::string, std::vector<RuntimeObject*> *> objectsLists1, std::map <std::string, std::vector<RuntimeObject*> *> objectsLists2, float tolerance, bool conditionInverted );
bool GD_API SpriteCollision( const std::string &, const std::string &, std::map <std::string, std::vector<RuntimeObject*> *> objectsLists1, std::map <std::string, std::vector<RuntimeObject*> *> objectsLists2, bool conditionInverted );

#endif // SPRITETOOLS_H

