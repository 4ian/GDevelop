// flow-typed signature: 4850a295b0a6cab60f9421a95997888f
// flow-typed version: 5b150db5b6/raven-js_v3.17.x/flow_>=v0.38.x

type LogLevel = "critical" | "error" | "warning" | "info" | "debug";

type AutoBreadcrumbOptions = {
  xhr?: boolean,
  console?: boolean,
  dom?: boolean,
  location?: boolean
};

type RavenInstrumentationOptions = {
  tryCatch?: boolean
};

type Breadcrumb = {
  message?: string,
  category?: string,
  level?: LogLevel,
  data?: any,
  type?: BreadcrumbType
};

type BreadcrumbType = "navigation" | "http";

type RavenOptions = {
  /** The log level associated with this event. Default: error */
  level?: LogLevel,

  /** The name of the logger used by Sentry. Default: javascript */
  logger?: string,

  /** The environment of the application you are monitoring with Sentry */
  environment?: string,

  /** The release version of the application you are monitoring with Sentry */
  release?: string,

  /** The name of the server or device that the client is running on */
  serverName?: string,

  /** List of messages to be filtered out before being sent to Sentry. */
  ignoreErrors?: (RegExp | string)[],

  /** Similar to ignoreErrors, but will ignore errors from whole urls patching a regex pattern. */
  ignoreUrls?: (RegExp | string)[],

  /** The inverse of ignoreUrls. Only report errors from whole urls matching a regex pattern. */
  whitelistUrls?: (RegExp | string)[],

  /** An array of regex patterns to indicate which urls are a part of your app. */
  includePaths?: (RegExp | string)[],

  /** Additional data to be tagged onto the error. */
  tags?: {
    [id: string]: string
  },

  /** set to true to get the stack trace of your message */
  stacktrace?: boolean,

  extra?: any,

  /** In some cases you may see issues where Sentry groups multiple events together when they should be separate entities. In other cases, Sentry simply doesn’t group events together because they’re so sporadic that they never look the same. */
  fingerprint?: string[],

  /** A function which allows mutation of the data payload right before being sent to Sentry */
  dataCallback?: (data: any) => any,

  /** A callback function that allows you to apply your own filters to determine if the message should be sent to Sentry. */
  shouldSendCallback?: (data: any) => boolean,

  /** By default, Raven does not truncate messages. If you need to truncate characters for whatever reason, you may set this to limit the length. */
  maxMessageLength?: number,

  /** By default, Raven will truncate URLs as they appear in breadcrumbs and other meta interfaces to 250 characters in order to minimize bytes over the wire. This does *not* affect URLs in stack traces. */
  maxUrlLength?: number,

  /** Override the default HTTP data transport handler. */
  transport?: (options: RavenTransportOptions) => void,

  /** Allow use of private/secretKey. */
  allowSecretKey?: boolean,

  /** Enables/disables instrumentation of globals. */
  instrument?: boolean | RavenInstrumentationOptions,

  /** Enables/disables automatic collection of breadcrumbs. */
  autoBreadcrumbs?: boolean | AutoBreadcrumbOptions
};

type RavenTransportOptions = {
  url: string,
  data: any,
  auth: {
    sentry_version: string,
    sentry_client: string,
    sentry_key: string
  },
  onSuccess: () => void,
  onFailure: () => void
};

declare module "raven-js" {
  declare type RavenPlugin = {
    (raven: Raven, ...args: any[]): Raven
  };

  declare class Raven {
    /** Raven.js version. */
    VERSION: string,

    Plugins: { [id: string]: RavenPlugin },

    /*
     * Allow Raven to be configured as soon as it is loaded
     * It uses a global RavenConfig = {dsn: '...', config: {}}
     */
    afterLoad(): void,

    /*
     * Allow multiple versions of Raven to be installed.
     * Strip Raven from the global context and returns the instance.
     */
    noConflict(): this,

    /** Configure Raven with a DSN and extra options */
    config(dsn: string, options?: RavenOptions): this,

    /*
     * Installs a global window.onerror error handler
     * to capture and report uncaught exceptions.
     * At this point, install() is required to be called due
     * to the way TraceKit is set up.
     */
    install(): this,

    /** Adds a plugin to Raven */
    addPlugin(plugin: RavenPlugin, ...pluginArgs: any[]): this,

    /*
     * Wrap code within a context so Raven can capture errors
     * reliably across domains that is executed immediately.
     */
    context(func: Function, ...args: any[]): void,
    context(options: RavenOptions, func: Function, ...args: any[]): void,

    /** Wrap code within a context and returns back a new function to be executed */
    wrap(func: Function): Function,
    wrap(options: RavenOptions, func: Function): Function,
    wrap<T: Function>(func: T): T,
    wrap<T: Function>(options: RavenOptions, func: T): T,

    /** Uninstalls the global error handler. */
    uninstall(): this,

    /** Manually capture an exception and send it over to Sentry */
    captureException(ex: Error, options?: RavenOptions): this,

    /** Manually send a message to Sentry */
    captureMessage(msg: string, options?: RavenOptions): this,

    /** Log a breadcrumb */
    captureBreadcrumb(crumb: Breadcrumb): this,

    /**
     * Clear the user context, removing the user data that would be sent to Sentry.
     */
    setUserContext(): this,

    /** Set a user to be sent along with the payload. */
    setUserContext(user: {
      id?: string,
      username?: string,
      email?: string
    }): this,

    /** Merge extra attributes to be sent along with the payload. */
    setExtraContext(context: Object): this,

    /** Merge tags to be sent along with the payload. */
    setTagsContext(tags: Object): this,

    /** Clear all of the context. */
    clearContext(): this,

    /** Get a copy of the current context. This cannot be mutated.*/
    getContext(): Object,

    /** Override the default HTTP data transport handler. */
    setTransport(
      transportFunction: (options: RavenTransportOptions) => void
    ): this,

    /** Set environment of application */
    setEnvironment(environment: string): this,

    /** Set release version of application */
    setRelease(release: string): this,

    /** Get the latest raw exception that was captured by Raven.*/
    lastException(): Error,

    /** An event id is a globally unique id for the event that was just sent. This event id can be used to find the exact event from within Sentry. */
    lastEventId(): string,

    /** If you need to conditionally check if raven needs to be initialized or not, you can use the isSetup function. It will return true if Raven is already initialized. */
    isSetup(): boolean,

    /** Specify a function that allows mutation of the data payload right before being sent to Sentry. */
    setDataCallback(data: any, orig?: any): this,

    /** Specify a callback function that allows you to mutate or filter breadcrumbs when they are captured. */
    setBreadcrumbCallback(data: any, orig?: any): this,

    /** Specify a callback function that allows you to apply your own filters to determine if the message should be sent to Sentry. */
    setShouldSendCallback(data: any, orig?: any): this,

    /** Show Sentry user feedback dialog */
    showReportDialog(options?: { 
      eventId?: string, 
      dsn?: string, 
      user?: { 
        name?: string, 
        email?: string 
      } 
    }): void,

    /** Configure Raven DSN */
    setDSN(dsn: string): void
  }

  declare export default Raven
}
