/**
 * Game Develop
 *    Editor
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *
 *
 *  Header de MemTrace.cpp
 */

#ifndef MEMTRACE_H
#define MEMTRACE_H

#include <string>
#include <vector>

using namespace std;

class MemTrace
{
    public:
        MemTrace();
        virtual ~MemTrace();

        void AddObj(string pNom, long pAdresse);
        void DelObj(long pAdresse);
        void Rapport();

    protected:
    private:
        vector < string > nom;
        vector < long > adresse;
};


#endif // MEMTRACE_H
