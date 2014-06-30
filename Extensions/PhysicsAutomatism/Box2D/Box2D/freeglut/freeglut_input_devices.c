/*
 * freeglut_input_devices.c
 *
 * Handles miscellaneous input devices via direct serial-port access.
 * Proper X11 XInput device support is not yet supported.
 * Also lacks Mac support.
 *
 * Written by Joe Krahn <krahn@niehs.nih.gov> 2005
 *
 * Copyright (c) 2005 Stephen J. Baker. All Rights Reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
 * PAWEL W. OLSZTA OR STEPHEN J. BAKER BE LIABLE FOR ANY CLAIM, DAMAGES OR
 * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

#ifdef HAVE_CONFIG_H
#    include "config.h"
#endif

#include <GL/freeglut.h>
#include "freeglut_internal.h"

#if TARGET_HOST_POSIX_X11
#if HAVE_ERRNO
#include <errno.h>
#endif
#include <sys/ioctl.h>
#include <sys/time.h>
#include <time.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <termios.h>
#include <fcntl.h>
#include <sys/types.h>

typedef struct {
   int fd;
   struct termios termio, termio_save;
} SERIALPORT;

#elif TARGET_HOST_MS_WINDOWS
#include <sys/types.h>
#include <winbase.h>
typedef struct {
   HANDLE fh;
   COMMTIMEOUTS timeouts_save;
   DCB dcb_save;
} SERIALPORT;

#endif

/********************* Dialbox definitions ***********************/

#define DIAL_NUM_VALUATORS 8

/* dial parser state machine states */
#define DIAL_NEW                (-1)
#define DIAL_WHICH_DEVICE       0
#define DIAL_VALUE_HIGH         1
#define DIAL_VALUE_LOW          2

/* dial/button box commands */
#define DIAL_INITIALIZE                 0x20
#define DIAL_SET_LEDS                   0x75
#define DIAL_SET_TEXT                   0x61
#define DIAL_SET_AUTO_DIALS             0x50
#define DIAL_SET_AUTO_DELTA_DIALS       0x51
#define DIAL_SET_FILTER                 0x53
#define DIAL_SET_BUTTONS_MOM_TYPE       0x71
#define DIAL_SET_AUTO_MOM_BUTTONS       0x73
#define DIAL_SET_ALL_LEDS               0x4b
#define DIAL_CLEAR_ALL_LEDS             0x4c

/* dial/button box replies and events */
#define DIAL_INITIALIZED        0x20
#define DIAL_BASE               0x30
#define DIAL_DELTA_BASE         0x40
#define DIAL_PRESS_BASE         0xc0
#define DIAL_RELEASE_BASE       0xe0

/* macros to determine reply type */
#define IS_DIAL_EVENT(ch)       (((ch)>=DIAL_BASE)&&((ch)<DIAL_BASE+DIAL_NUM_VALUATORS))
#define IS_KEY_PRESS(ch)        (((ch)>=DIAL_PRESS_BASE)&&((ch)<DIAL_PRESS_BASE+DIAL_NUM_BUTTONS))
#define IS_KEY_RELEASE(ch)      (((ch)>=DIAL_RELEASE_BASE)&&((ch)<DIAL_RELEASE_BASE+DIAL_NUM_BUTTONS))
#define IS_INIT_EVENT(ch)       ((ch)==DIAL_INITIALIZED)

/*****************************************************************/

static SERIALPORT *serial_open ( const char *device );
static void serial_close ( SERIALPORT *port );
static int serial_getchar ( SERIALPORT *port );
static int serial_putchar ( SERIALPORT *port, unsigned char ch );
static void serial_flush ( SERIALPORT *port );

static void send_dial_event(int dial, int value);
static void poll_dials(int id);

/* local variables */
static SERIALPORT *dialbox_port=NULL;

/*****************************************************************/

/*
 * Implementation for glutDeviceGet(GLUT_HAS_DIAL_AND_BUTTON_BOX)
 */
int fgInputDeviceDetect( void )
{
    fgInitialiseInputDevices ();

    if ( !dialbox_port )
        return 0;

    if ( !fgState.InputDevsInitialised )
        return 0;

    return 1;
}

/*
 * Try initializing the input device(s)
 */
void fgInitialiseInputDevices ( void )
{
    if( !fgState.InputDevsInitialised )
    {
      /* will return true for VC8 (VC2005) and higher */
#if TARGET_HOST_MS_WINDOWS && ( _MSC_VER >= 1400 ) && HAVE_ERRNO
        char *dial_device=NULL;
        size_t sLen;
        errno_t err = _dupenv_s( &dial_device, &sLen, "GLUT_DIALS_SERIAL" );
        if (err)
            fgError("Error getting GLUT_DIALS_SERIAL environment variable");
#else
        const char *dial_device=NULL;
        dial_device = getenv ( "GLUT_DIALS_SERIAL" );
#endif
#if TARGET_HOST_MS_WINDOWS
        if (!dial_device){
            static char devname[256];
            DWORD size=sizeof(devname);
            DWORD type = REG_SZ;
            HKEY key;
            if (RegOpenKeyA(HKEY_LOCAL_MACHINE,"SOFTWARE\\FreeGLUT",&key)==ERROR_SUCCESS) {
                if (RegQueryValueExA(key,"DialboxSerialPort",NULL,&type,(LPBYTE)devname,&size)==ERROR_SUCCESS){
                    dial_device=devname;
                }
                RegCloseKey(key);
            }
        }
#endif
        if ( !dial_device ) return;
        if ( !( dialbox_port = serial_open ( dial_device ) ) ) return;
      /* will return true for VC8 (VC2005) and higher */
#if TARGET_HOST_MS_WINDOWS && ( _MSC_VER >= 1400 ) && HAVE_ERRNO
        free ( dial_device );  dial_device = NULL;  /* dupenv_s allocates a string that we must free */
#endif
        serial_putchar(dialbox_port,DIAL_INITIALIZE);
        glutTimerFunc ( 10, poll_dials, 0 );
        fgState.InputDevsInitialised = GL_TRUE;
    }
}

/*
 *
 */
void fgInputDeviceClose( void )
{
    if ( fgState.InputDevsInitialised )
    {
        serial_close ( dialbox_port );
        dialbox_port = NULL;
        fgState.InputDevsInitialised = GL_FALSE;
    }
}

/********************************************************************/

/* Check all windows for dialbox callbacks */
static void fghcbEnumDialCallbacks ( SFG_Window *window, SFG_Enumerator *enumerator )
{
    /* Built-in to INVOKE_WCB():  if window->Callbacks[CB_Dials] */
    INVOKE_WCB ( *window,Dials, ( ((int*)enumerator->data)[0], ((int*)enumerator->data)[1]) );
    fgEnumSubWindows ( window, fghcbEnumDialCallbacks, enumerator );
}

static void send_dial_event ( int num, int value )
{
    SFG_Enumerator enumerator;
    int data[2];
    data[0] = num;
    data[1] = value;
    enumerator.found = GL_FALSE;
    enumerator.data  =  data;
    fgEnumWindows ( fghcbEnumDialCallbacks, &enumerator );
}

/********************************************************************/
static void poll_dials ( int id )
{
    int data;
    static int dial_state = DIAL_NEW;
    static int dial_which;
    static int dial_value;
    static int dials[8] = { 0, 0, 0, 0, 0, 0, 0, 0 };

    if ( !dialbox_port ) return;

    while ( (data=serial_getchar(dialbox_port)) != EOF )
    {
        if ( ( dial_state > DIAL_WHICH_DEVICE ) || IS_DIAL_EVENT ( data ) )
        {
            switch ( dial_state )
            {
            case DIAL_WHICH_DEVICE:
                dial_which = data - DIAL_BASE;
                dial_state++;
                break;
            case DIAL_VALUE_HIGH:
                dial_value = ( data << 8 );
                dial_state++;
                break;
            case DIAL_VALUE_LOW:
                dial_value |= data;
                if ( dial_value & 0x8000 ) dial_value -= 0x10000;
                dials[dial_which] = dial_value;
                send_dial_event ( dial_which + 1, dial_value * 360 / 256 );
                dial_state = DIAL_WHICH_DEVICE;
                break;
            default:
                /* error: Impossible state value! */
                break;
            }
        }
        else if ( data == DIAL_INITIALIZED )
        {
            fgState.InputDevsInitialised = GL_TRUE;
            dial_state = DIAL_WHICH_DEVICE;
            serial_putchar(dialbox_port,DIAL_SET_AUTO_DIALS);
            serial_putchar(dialbox_port,0xff);
            serial_putchar(dialbox_port,0xff);
        }
        else  /* Unknown data; try flushing. */
            serial_flush(dialbox_port);
    }

    glutTimerFunc ( 2, poll_dials, 0 );
}


/******** OS Specific Serial I/O routines *******/
#if TARGET_HOST_POSIX_X11 /* ==> Linux/BSD/UNIX POSIX serial I/O */
static SERIALPORT *serial_open ( const char *device )
{
    int fd;
    struct termios termio;
    SERIALPORT *port;

    fd = open(device, O_RDWR | O_NONBLOCK );
    if (fd <0) {
        perror(device);
        return NULL;
    }

    port = malloc(sizeof(SERIALPORT));
    memset(port, 0, sizeof(SERIALPORT));
    port->fd = fd;

    /* save current port settings */
    tcgetattr(fd,&port->termio_save);

    memset(&termio, 0, sizeof(termio));
    termio.c_cflag = CS8 | CREAD | HUPCL ;
    termio.c_iflag = IGNPAR | IGNBRK ;
    termio.c_cc[VTIME]    = 0;   /* inter-character timer */
    termio.c_cc[VMIN]     = 1;   /* block read until 1 chars received, when blocking I/O */

    cfsetispeed(&termio, B9600);
    cfsetospeed(&termio, B9600);
    tcsetattr(fd,TCSANOW,&termio);

    serial_flush(port);
    return port;
}

static void serial_close(SERIALPORT *port)
{
    if (port)
    {
        /* restore old port settings */
        tcsetattr(port->fd,TCSANOW,&port->termio_save);
        close(port->fd);
        free(port);
    }
}

static int serial_getchar(SERIALPORT *port)
{
    unsigned char ch;
    if (!port) return EOF;
    if (read(port->fd,&ch,1)) return ch;
    return EOF;
}

static int serial_putchar(SERIALPORT *port, unsigned char ch){
    if (!port) return 0;
    return write(port->fd,&ch,1);
}

static void serial_flush ( SERIALPORT *port )
{
    tcflush ( port->fd, TCIOFLUSH );
}

#elif TARGET_HOST_MS_WINDOWS

static SERIALPORT *serial_open(const char *device){
    HANDLE fh;
    DCB dcb={sizeof(DCB)};
    COMMTIMEOUTS timeouts;
    SERIALPORT *port;

    fh = CreateFile(device,GENERIC_READ|GENERIC_WRITE,0,NULL,
      OPEN_EXISTING,FILE_ATTRIBUTE_NORMAL,NULL);
    if (!fh) return NULL;

    port = malloc(sizeof(SERIALPORT));
    ZeroMemory(port, sizeof(SERIALPORT));
    port->fh = fh;

    /* save current port settings */
    GetCommState(fh,&port->dcb_save);
    GetCommTimeouts(fh,&port->timeouts_save);

    dcb.DCBlength=sizeof(DCB);
    BuildCommDCB("96,n,8,1",&dcb);
    SetCommState(fh,&dcb);

    ZeroMemory(&timeouts,sizeof(timeouts));
    timeouts.ReadTotalTimeoutConstant=1;
    timeouts.WriteTotalTimeoutConstant=1;
    SetCommTimeouts(fh,&timeouts);

    serial_flush(port);

    return port;
}

static void serial_close(SERIALPORT *port){
    if (port){
        /* restore old port settings */
        SetCommState(port->fh,&port->dcb_save);
        SetCommTimeouts(port->fh,&port->timeouts_save);
        CloseHandle(port->fh);
        free(port);
    }
}

static int serial_getchar(SERIALPORT *port){
    DWORD n;
    unsigned char ch;
    if (!port) return EOF;
    if (!ReadFile(port->fh,&ch,1,&n,NULL)) return EOF;
    if (n==1) return ch;
    return EOF;
}

static int serial_putchar(SERIALPORT *port, unsigned char ch){
    DWORD n;
    if (!port) return 0;
    return WriteFile(port->fh,&ch,1,&n,NULL);
}

static void serial_flush ( SERIALPORT *port )
{
    FlushFileBuffers(port->fh);
}

#endif
