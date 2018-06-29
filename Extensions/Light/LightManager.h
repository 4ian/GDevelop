#ifndef LIGHTMANAGERH
#define LIGHTMANAGERH
#include <SFML/Graphics.hpp>
#include <vector>
class Wall;

class Light_Manager {
 public:
  std::vector<Wall*> walls;  ///< Objects with light obstacle behavior have to
                             ///< insert their into this vector

  bool commonBlurEffectLoaded;
  sf::Shader commonBlurEffect;

  Light_Manager();
  ~Light_Manager();
};
#endif
