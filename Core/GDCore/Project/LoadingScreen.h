/*
 * GDevelop Core
 * Copyright 2008-2018 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#ifndef GDCORE_LOADINGSCREEN_H
#define GDCORE_LOADINGSCREEN_H
#include "GDCore/String.h"
namespace gd {
class SerializerElement;
}

namespace gd {

/**
 * \brief Describe the content and set up of the loading screen
 *
 * \see gd::LoadingScreen
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API LoadingScreen {
public:
    LoadingScreen(){};
    virtual ~LoadingScreen(){};

    /**
    * \brief Set if the GDevelop splash should be shown while loading assets.
    */
    void ShowGDevelopSplash(bool show) { showGDevelopSplash = show; };

    /**
    * \brief Return true if the GDevelop splash should be shown while loading assets.
    */
    bool IsGDevelopSplashShown() const { return showGDevelopSplash; };

    /** \name Saving and loading
    */
    ///@{
    /**
    * \brief Serialize objects groups container.
    */
    void SerializeTo(SerializerElement& element) const;

    /**
    * \brief Unserialize the objects groups container.
    */
    void UnserializeFrom(const SerializerElement& element);
    ///@}

private:
    bool showGDevelopSplash;
};
}

#endif // GDCORE_LOADINGSCREEN_H
