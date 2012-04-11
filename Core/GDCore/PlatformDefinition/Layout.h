/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_LAYOUT_H
#define GDCORE_LAYOUT_H
#include <string>

namespace gd
{

/**
 * \brief Base class used to represent a layout ( also called a scene ) of a Platform.
 */
class GD_CORE_API Layout
{
public:
    Layout();
    virtual ~Layout();

    /**
     * Must change the name of the layout with the name passed as parameter.
     */
    virtual void SetName(const std::string & name) =0;

    /**
     * Must return the name of the layout.
     */
    virtual const std::string & GetName() const =0;

    /**
     * Set the background color
     */
    virtual void SetBackgroundColor(unsigned int r, unsigned int g, unsigned int b) =0;

    /**
     * Get the background color red component
     */
    virtual unsigned int GetBackgroundColorRed() const =0;

    /**
     * Get the background color green component
     */
    virtual unsigned int GetBackgroundColorGreen() const =0;

    /**
     * Get the background color blue component
     */
    virtual unsigned int GetBackgroundColorBlue() const =0;

    virtual const std::string & GetWindowDefaultTitle() const =0;
    virtual void SetWindowDefaultTitle(const std::string & title_) =0;

private:
};

}

#endif // GDCORE_LAYOUT_H
