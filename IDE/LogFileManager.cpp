#include <wx/config.h>
#include <wx/textfile.h>
#include <wx/log.h>
#include "LogFileManager.h"
#include "GDL/CommonTools.h"

LogFileManager *LogFileManager::_singleton = NULL;

void LogFileManager::WriteToLogFile(const std::string & log)
{
    wxLogNull noLogPlease; //We take care of handling errors

    if ( logActivated && !logFile.empty() )
    {
        wxTextFile file(logFile);
        if ( file.Exists() )
        {
            if ( !file.Open() ) return; //Failed to open already existing log file
        }
        else
        {
            if ( !file.Create() ) return; //Failed to create log file
        }
        file.AddLine(log);
        file.Write();
    }
}

void LogFileManager::InitalizeFromConfig()
{
    //Read configuration
    wxConfig::Get()->Read("/Log/Activated", &logActivated, false);
    wxString wxLogFile;
    wxConfig::Get()->Read("/Log/File", &wxLogFile, "");
    logFile = ToString(wxLogFile);

    //Clear log
    if ( logActivated && !logFile.empty() )
    {
        wxTextFile file(logFile);
        if ( file.Exists() )
        {
            if ( !file.Open() ) return; //Failed to open already existing log file

            file.Clear();
            file.Write();
        }
        else
        {
            if ( !file.Create() ) return; //Failed to create log file
        }
    }
}
