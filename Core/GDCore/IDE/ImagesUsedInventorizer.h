/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY)
#ifndef IMAGESUSEDINVENTORIZER_H
#define IMAGESUSEDINVENTORIZER_H

#include <string>
#include <vector>
#include <set>
#include "GDCore/IDE/ArbitraryResourceWorker.h"

namespace gd {

/**
 * \brief Class used to track all images used in a game.
 *
 * Usage example:
\code
	gd::ImagesUsedInventorizer inventorizer;
	project.ExposeResources(inventorizer);

	//Get a set with the name of all images in the project:
    std::set<std::string> & usedImages = inventorizer.GetAllUsedImages();
\endcode
 *
 * \ingroup IDE
 */
class ImagesUsedInventorizer : public gd::ArbitraryResourceWorker
{
public:

    ImagesUsedInventorizer() : gd::ArbitraryResourceWorker() {};
    virtual ~ImagesUsedInventorizer() {};

    std::set<std::string> & GetAllUsedImages() { return allUsedImages; };

    virtual void ExposeFile(std::string & resource) {};
    virtual void ExposeImage(std::string & imageName) {allUsedImages.insert(imageName);};
    virtual void ExposeShader(std::string & shaderName) {};

protected:
    std::set<std::string> allUsedImages;
};

}

#endif // IMAGESUSEDINVENTORIZER_H
#endif
