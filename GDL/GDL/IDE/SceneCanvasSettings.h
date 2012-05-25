/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef SCENECANVASSETTINGS_H
#define SCENECANVASSETTINGS_H
class TiXmlElement;

/**
 * \brief Tool class used to store settings of a SceneCanvas.
 *
 * \see Scene
 */
class SceneCanvasSettings
{
public:
    SceneCanvasSettings();
    virtual ~SceneCanvasSettings() {};

    void LoadFromXml(const TiXmlElement * element);
    void SaveToXml(TiXmlElement * element) const;

    bool grid; ///< True if grid activated in editor
    bool snap; ///< True if snap to grid activated in editor
    int gridWidth; ///< Grid width in editor
    int gridHeight; ///< Grid height in editor
    int gridR; ///< Grid red color in editor
    int gridG; ///< Grid green color in editor
    int gridB; ///< Grid blue color in editor
    bool windowMask; ///< True if window mask displayed in editor
};

#endif // SCENECANVASSETTINGS_H
