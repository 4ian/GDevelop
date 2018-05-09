/**

GDevelop - Particle System Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef EXTENSION_H_INCLUDED
#define EXTENSION_H_INCLUDED
namespace gd {
class ObjectMetadata;
}
namespace gd {
class PlatformExtension;
}

void DeclareParticleSystemExtension(gd::PlatformExtension& extension);

/**
 * \brief This class declares information about the extension.
 */
class ParticleSystemCppExtension : public ExtensionBase {
 public:
  ParticleSystemCppExtension();
  virtual ~ParticleSystemCppExtension(){};
};

#endif  // EXTENSION_H_INCLUDED
