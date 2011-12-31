/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if !defined(GD_NO_DYNAMIC_EXTENSIONS)
#if defined(GD_IDE_ONLY)

#ifndef SOURCEFILE_H
#define SOURCEFILE_H
#include <ctime>
#include <string>
#include <boost/shared_ptr.hpp>
class TiXmlElement;

namespace GDpriv
{

/**
 * \brief Internal class representing a "physical" source file.
 *
 * SourceFile represents a "physical" source file that must be compiled
 * so as to be used by the game as a dynamic extension.
 */
class GD_API SourceFile
{
public:
    SourceFile();
    virtual ~SourceFile();

    /**
     * Get the latest time of the build
     */
    time_t GetLastBuildTimeStamp() const { return lastBuildTimeStamp; };

    /**
     * Change the latest time of the build of the file
     */
    void SetLastBuildTimeStamp(time_t newTimeStamp) { lastBuildTimeStamp = newTimeStamp; };

    /**
     * Get the filename
     */
    std::string GetFileName() const { return filename; };

    /**
     * Change the filename
     */
    void SetFileName(std::string filename_) { filename = filename_; };

    /**
     * Load from XML element
     */
    void LoadFromXml(const TiXmlElement * elem);

    /**
     * Save to XML element
     */
    void SaveToXml(TiXmlElement * elem);

    enum sourceFileLanguage
    {
        CPlusPlus
    };

private:

    std::string filename; ///< Filename
    time_t lastBuildTimeStamp; ///< Time of the last build
    sourceFileLanguage language; ///< Source file language
};

//"Tool" Functions

/**
 * Functor testing Source Files name
 */
struct ExternalSourceFileHasName : public std::binary_function<boost::shared_ptr<SourceFile>, std::string, bool> {
    bool operator()(const boost::shared_ptr<SourceFile> & externalEvents, std::string name) const { return externalEvents->GetFileName() == name; }
};

}

#endif // SOURCEFILE_H

#endif
#endif
