/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY)
#ifndef IMAGESUSEDINVENTORIZER_H
#define IMAGESUSEDINVENTORIZER_H

#include "GDCore/String.h"
#include <vector>
#include <set>
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"

namespace gd {

/**
 * \brief Class used to track all images used in a game.
 *
 * Usage example:
\code
	gd::ImagesUsedInventorizer inventorizer;
	project.ExposeResources(inventorizer);

	//Get a set with the name of all images in the project:
    std::set<gd::String> & usedImages = inventorizer.GetAllUsedImages();
\endcode
 *
 * \ingroup IDE
 */
class ImagesUsedInventorizer : public gd::ArbitraryResourceWorker
{
public:

    ImagesUsedInventorizer() : gd::ArbitraryResourceWorker() {};
    virtual ~ImagesUsedInventorizer() {};

    std::set<gd::String> & GetAllUsedImages() { return allUsedImages; };

    virtual void ExposeFile(gd::String & resource) { /*Don't care, we just list images*/ };
    virtual void ExposeImage(gd::String & imageName) {allUsedImages.insert(imageName);};

protected:
    std::set<gd::String> allUsedImages;
};

}

#endif // IMAGESUSEDINVENTORIZER_H
#endif
