#ifndef COMPILATIONCHECKER_H
#define COMPILATIONCHECKER_H

/**
 * Class used to ensure that the main executable is using a correct version of gdl.[dll/so].
 */
class CompilationChecker
{
    public:
        static bool EnsureCorrectGDLVersion();
};

#endif // COMPILATIONCHECKER_H
