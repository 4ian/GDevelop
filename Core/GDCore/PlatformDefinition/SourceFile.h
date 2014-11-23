/*
 * GDevelop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#ifndef SOURCEFILE_H
#define SOURCEFILE_H
#include <ctime>
#include <string>
#include <boost/shared_ptr.hpp>
#include <boost/weak_ptr.hpp>
namespace gd { class SerializerElement; }
class BaseEvent;

namespace gd
{

/**
 * \brief Represents a "physical" source file.
 *
 * Source file can be compiled (or just integrated to the exported project)
 * by platforms. Most of the time, special events are provided to use functions
 * created in such files.
 */
class GD_CORE_API SourceFile
{
public:
    SourceFile();
    virtual ~SourceFile();

    /**
     * \brief Get the filename
     */
    std::string GetFileName() const { return filename; };

    /**
     * \brief Change the filename
     */
    void SetFileName(std::string filename_) { filename = filename_; };

    /**
     * \brief Serialize the source file.
     */
    void SerializeTo(SerializerElement & element) const;

    /**
     * \brief Unserialize the source file.
     */
    void UnserializeFrom(const SerializerElement & element);

    /**
     * \brief Set if the file is hidden from the user point of view and is only managed by GDevelop
     */
    void SetGDManaged(bool gdManaged_) { gdManaged = gdManaged_; };

    /**
     * \brief Return true if the file is hidden from the user point of view and is only managed by GDevelop
     */
    bool IsGDManaged() const { return gdManaged; };

    /**
     * \brief Change the language of the source file
     */
    void SetLanguage(std::string lang) { language = lang; }

    /**
     * \brief Get the language of the source file
     */
    const std::string & GetLanguage() const { return language; }

private:

    std::string filename; ///< Filename
    time_t lastBuildTimeStamp; ///< Time of the last build
    bool gdManaged; ///< True if the source file is hidden from the user point of view and is managed only by GDevelop.
    std::string language; ///< String identifying the language of this source file (typically "C++ or "Javascript").
    boost::weak_ptr<BaseEvent> associatedGdEvent; ///< When a source file is GD-managed, it is usually created for a specific event. This member is not saved: It is the event responsibility to call SetAssociatedEvent.
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
