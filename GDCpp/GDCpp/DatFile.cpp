#include "GDCpp/DatFile.h"
#include <iostream>
#include <stdio.h>
#include <string.h>
#include <fstream>
DatFile::DatFile (void)
{
    m_buffer = NULL;
}

DatFile::~DatFile (void)
{
    if (m_buffer!=NULL)
        delete (m_buffer);
}
bool DatFile::Create (std::vector<gd::String> files, gd::String directory, gd::String destination)
{
    //An file entry in order to push it in the object's std::vector
    sFileEntry entry;
    //An input file stream to read each file included
    std::ifstream file;
    //An output file stream to write our DAT file
    std::ofstream datfile;
    //The buffer used to read/write the DAT file
    char buffer[1];

    //DATHeader
    //We start by filling it with 0
    memset (&m_header, 0, sizeof(m_header));
    //Then we copy the ID
    memcpy (m_header.uniqueID, "EXEGD", 5); //EXEcutable GDevelop
    //Then the version
    memcpy (m_header.version, "0.1", 3);
    //Then the number of files to include
    m_header.nb_files = files.size();

    //Next, we open each file in orderto create the File Entries Table
    for (std::size_t i = 0; i<files.size(); i++)
    {
        gd::String fileToOpen = directory + "/" + files[i];
        file.open (fileToOpen.ToLocale().c_str(), std::ifstream::in | std::ifstream::binary);
        if (file.is_open())
        {
            //Filling the FileEntry with 0
            memset (&entry, 0, sizeof(sFileEntry) );
            //We keep the file name
            memcpy (entry.name, files[i].c_str(), strlen ( files[i].c_str() ) );
            //We calculate its size
            file.seekg (0, std::ios::end);
            entry.size = file.tellg();
            //Since we don't know exactly its final position in the DAT file, let's use 0
            entry.offset = 0;
            //We finished with this file
            file.close();

            //Finally, we add this File Entry in our std::vector
            m_entries.push_back(entry);
        }
        else
        {
            //Simple error track
            std::cout<<"File "<<files[i]<<" raise an error."<<std::endl;
            return (false);
        }
    }

    //Now, we know everything about our files, we can update offsets
    long actual_offset = 0;
    actual_offset += sizeof(sDATHeader);
    actual_offset += m_header.nb_files * sizeof(sFileEntry);
    for (std::size_t i=0;i<m_entries.size();i++)
    {
        m_entries[i].offset = actual_offset;
        actual_offset += m_entries[i].size;
    }

    //And finally, we are writing the DAT file
    datfile.open (destination.ToLocale().c_str(), std::ofstream::out | std::ofstream::binary);

    //First, we write the header
    datfile.write ((char*)&m_header, sizeof(sDATHeader) );

    //Then, the File Entries Table
    for (std::size_t i=0;i<m_entries.size();i++)
    {
        datfile.write ((char*)&m_entries[i], sizeof(sFileEntry) );
    }

    //Finally, we write each file
    for (std::size_t i = 0; i<m_entries.size(); i++)
    {
        gd::String fileToOpen = directory + "/" + files[i];
        file.open (fileToOpen.ToLocale().c_str(), std::ifstream::in | std::ifstream::binary);
        if (file.is_open())
        {
            file.seekg (0, std::ios::beg);
            while (file.read (buffer, 1))
            {
                datfile.write (buffer, 1);
            }
            file.close();
        }
        file.clear();
    }
    //And it's finished
    datfile.close();
    return (true);
}

/**
* Load the DatFile from a file. Return true on success
*/
bool DatFile::Read (gd::String source)
{
    bool success = false;

    //The input file stream from which we want informations
    std::ifstream datfile;
    //A file entry in order to push it in the object's std::vector
    sFileEntry entry;

    //Filling the header with 0
    memset (&m_header, 0, sizeof(m_header));
    //We open the DAT file to read it
    datfile.open (source.ToLocale(), std::ifstream::in | std::ifstream::binary);
    if (datfile.is_open())
    {
        //Getting to the Header position
        datfile.seekg (0, std::ios::beg);
        //Reading the DAT Header
        datfile.read ((char*)&m_header, sizeof(sDATHeader));
        //Next we are reading each file entry
        for (std::size_t i=0;i<m_header.nb_files;i++)
        {
            //Reading a File Entry
            datfile.read ((char*)&entry, sizeof(sFileEntry));
            //Pushing it in our std::vector
            m_entries.push_back(entry);
        }
        //Since all seems ok, we keep the DAT file name
        m_datfile = source;
        success = true;
    }
    //Closing the DAT file
    datfile.close();
    return success;
}

////////////////////////////////////////////////////////////
/// Check if the DatFile contains a file
////////////////////////////////////////////////////////////
bool DatFile::ContainsFile(const gd::String & filename)
{
    if ( m_header.nb_files != m_entries.size() )
        return false;

    for (std::size_t i=0; i<m_header.nb_files;i++)
    {
        if (gd::String(m_entries[i].name) == filename)
            return true;
    }

    return false;
}

char* DatFile::GetFile (gd::String filename)
{
    //The input file stream from which we want information
    std::ifstream datfile;

    //Cleaning properly an ancient file loaded
    if (m_buffer != NULL)
    {
        delete (m_buffer);
        m_buffer = NULL;
    }

    //First, we have to find the file needed
    for (std::size_t i=0; i<m_header.nb_files;i++)
    {
        //If we found it
        if(gd::String(m_entries[i].name) == filename)
        {
            //We are allocating memory to the buffer
            m_buffer = new char[(m_entries[i].size)];
            //Simple error catch
            if (m_buffer==NULL)
            {
                cout << "Unable to allocate a buffer of length " << (m_entries[i].size) << " when loading " << filename << endl;
                return (NULL);
            }

            //Opening the DAT file ot read the file datas needed
            datfile.open (m_datfile.ToLocale().c_str(), std::ifstream::in | std::ifstream::binary);
            if (datfile.is_open())
            {
                //Going to the right position
                datfile.seekg (m_entries[i].offset, std::ios::beg);
                //Reading
                datfile.read (m_buffer, m_entries[i].size);
                //We can close the DAT file
                datfile.close();
                //Returning the buffer
                cout << "Successfully loaded " << filename << endl;
                return (m_buffer);
            }
            cout << "Unable to open file " << m_datfile << " when loading " << filename << endl;
        }
    }
    //Finally, there is no such file in our DAT file
    return (NULL);
}

long int DatFile::GetFileSize (gd::String filename)
{
    //First, we have to find the file needed
    for (std::size_t i=0; i<m_header.nb_files;i++)
    {
        //If we found it
        if (gd::String(m_entries[i].name) == filename)
        {
            //Returning the size of the file found
            return (m_entries[i].size);
        }
    }
    return (0);
}
