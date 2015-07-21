#include <wx/config.h>
#include <wx/textfile.h>
#include "GDCore/Tools/Log.h"
#include <wx/datetime.h>
#include "LogFileManager.h"
#include "GDCore/CommonTools.h"

LogFileManager *LogFileManager::_singleton = NULL;

void LogFileManager::WriteToLogFile(const gd::String & log)
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
        wxDateTime time = wxDateTime::Now();
        file.AddLine("["+gd::String::From(time.GetMonth()+1)+"/"+gd::String::From(time.GetDay())+"/"+gd::String::From(time.GetYear())+", "+gd::String::From(time.GetHour())+":"+gd::String::From(time.GetMinute())+":"+gd::String::From(time.GetSecond())+"] "+log);
        file.Write();
    }
}

void LogFileManager::InitalizeFromConfig()
{
    //Read configuration
    wxConfig::Get()->Read("/Log/Activated", &logActivated, false);
    wxString wxLogFile;
    wxConfig::Get()->Read("/Log/File", &wxLogFile, "");
    logFile = wxLogFile;

    //Clear log
    if ( logActivated && !logFile.empty() )
    {
        wxLogNull noLogPlease; //We take care of handling errors

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
