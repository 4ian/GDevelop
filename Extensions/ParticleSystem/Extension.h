/**

GDevelop - Particle System Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef EXTENSION_H_INCLUDED
#define EXTENSION_H_INCLUDED
namespace gd { class ObjectMetadata; }

/**
 * \brief This class declares information about the extension.
 */
class Extension : public ExtensionBase
{
public:
    Extension();
    virtual ~Extension() {};

private:
    void ExtensionSubDeclaration1(gd::ObjectMetadata & objInfos);
    void ExtensionSubDeclaration2(gd::ObjectMetadata & objInfos);
    void ExtensionSubDeclaration3(gd::ObjectMetadata & objInfos);
};

#endif // EXTENSION_H_INCLUDED

