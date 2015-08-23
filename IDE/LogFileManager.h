/*
 * GDevelop IDE
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */

#ifndef LOGFILEMANAGER_H
#define LOGFILEMANAGER_H

/**
 * \brief Offer a simple way to write to a log file.
 *
 * \note The log file is only used for logging some specific tasks and is not exhaustive. Developers should refer to the console output.
 */
class LogFileManager
{
public:

    /**
     * Write the string into the log file if the log file is activated.
     */
    void WriteToLogFile(const gd::String & log);

    /**
     * Check if the log file is activated and get the log filename from wxConfigBase. Clear the log file if needed.
     */
    void InitalizeFromConfig();

    /**
     * Return true if the log file is activated
     */
    bool IsLogActivated() { return logActivated; }

    static LogFileManager *Get()
    {
        if ( NULL == _singleton )
        {
            _singleton = new LogFileManager;
        }

        return ( static_cast<LogFileManager*>( _singleton ) );
    }

    static void DestroySingleton()
    {
        if ( NULL != _singleton )
        {
            delete _singleton;
            _singleton = NULL;
        }
    }

private:

    gd::String logFile;
    bool logActivated;

    LogFileManager() {};
    virtual ~LogFileManager() {};

    static LogFileManager *_singleton;
};

#endif // LOGFILEMANAGER_H

