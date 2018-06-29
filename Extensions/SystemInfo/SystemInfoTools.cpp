/**

GDevelop - SystemInfo Extension
Copyright (c) 2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

namespace SystemInfo {

bool GD_EXTENSION_API IsMobile() {
#if defined(ANDROID)
  return true;
#else
  return false;
#endif
}

}  // namespace SystemInfo
