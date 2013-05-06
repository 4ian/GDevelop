/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef PLATFORM_H
#define PLATFORM_H
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/PlatformExtension.h"

/**
 * \brief Game Develop Javascript Platform
 *
 * Platform designed to be used to create 2D games based on Javascript.
 */
class GD_API JsPlatform : public gd::Platform
{
public:

    virtual std::string GetName() const { return "Game Develop JS platform"; }
    virtual std::string GetFullName() const { return "Javascript platform"; }

    /**
     * Returns a gd::LayoutEditorPreviewer object which export the layout being edited and
     * then launch the preview in an external browser
     */
    virtual boost::shared_ptr<gd::LayoutEditorPreviewer> GetLayoutPreviewer(gd::LayoutEditorCanvas & editor) const;

    /**
     * Get access to the JsPlatform instance. ( JsPlatform is a singleton ).
     */
    static JsPlatform & Get();

    /**
     * \brief Destroy the singleton.
     *
     * \note You do not need usually to call this method.
     **/
    static void DestroySingleton();

private:
    JsPlatform();
    virtual ~JsPlatform() {};

    static JsPlatform * singleton;
};

#endif // PLATFORM_H
