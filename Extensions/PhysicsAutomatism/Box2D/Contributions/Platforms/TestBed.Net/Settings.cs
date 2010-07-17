using System;
using System.Collections.Generic;
using System.Text;

namespace TestBed.Net
{
    public class Settings
    {
        public float Hz = 60;
        public int  IterationCount = 10;
        public bool DrawStats = false;
        public bool DrawContacts = false;
        public bool DrawImpulses = false;
        public bool DrawAABBs = false;
        public bool DrawPairs = false;
        public bool WarmStarting = true;
        public bool PositionCorrection = true;
        public bool Pause = false;
    }
}
