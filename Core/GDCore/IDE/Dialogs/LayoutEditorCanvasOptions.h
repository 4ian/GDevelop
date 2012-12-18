/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef SCENECANVASSETTINGS_H
#define SCENECANVASSETTINGS_H
#include <string>
class TiXmlElement;

namespace gd
{

/**
 * \brief Tool class used to store settings of a SceneCanvas.
 *
 * \see Scene
 */
class GD_CORE_API LayoutEditorCanvasOptions
{
public:
    LayoutEditorCanvasOptions();
    virtual ~LayoutEditorCanvasOptions() {};

    void LoadFromXml(const TiXmlElement * element);
    void SaveToXml(TiXmlElement * element) const;

    bool grid; ///< True if grid activated in editor
    bool snap; ///< True if snap to grid activated in editor
    int gridWidth; ///< Grid width in editor
    int gridHeight; ///< Grid height in editor
    int gridR; ///< Grid red color in editor
    int gridG; ///< Grid green color in editor
    int gridB; ///< Grid blue color in editor
    float zoomFactor; ///< Stores the zoom factor
    bool windowMask; ///< True if window mask displayed in editor
    std::string associatedLayout; ///< Only used for external layout: Contains the name of the layout used ( for loading objects ) when editing the external layout.
};

}

#endif // SCENECANVASSETTINGS_H
