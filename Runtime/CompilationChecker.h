#ifndef COMPILATIONCHECKER_H
#define COMPILATIONCHECKER_H

/**
 * Class used to ensure that the main executable is using a correct version of GDCpp.[dll/so].
 */
class CompilationChecker
{
    public:
        static bool EnsureCorrectGDVersion();
};

#endif // COMPILATIONCHECKER_H
