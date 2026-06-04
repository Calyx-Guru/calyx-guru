// @ts-nocheck
/**
 * GameAnalytics JavaScript SDK — React Native / Expo port (based on SDK 4.4.6).
 * Call `onGameAnalyticsBeforeUnload()` when the app backgrounds or closes.
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Application from 'expo-application';
import { storage } from './storage';

/* CryptoJS subset (HMAC-SHA256 + Base64) — from GA-SDK vendor */
/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
var CryptoJS=CryptoJS||function(h,s){var f={},g=f.lib={},q=function(){},m=g.Base={extend:function(a){q.prototype=this;var c=new q;a&&c.mixIn(a);c.hasOwnProperty("init")||(c.init=function(){c.$super.init.apply(this,arguments)});c.init.prototype=c;c.$super=this;return c},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var c in a)a.hasOwnProperty(c)&&(this[c]=a[c]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.init.prototype.extend(this)}},
r=g.WordArray=m.extend({init:function(a,c){a=this.words=a||[];this.sigBytes=c!=s?c:4*a.length},toString:function(a){return(a||k).stringify(this)},concat:function(a){var c=this.words,d=a.words,b=this.sigBytes;a=a.sigBytes;this.clamp();if(b%4)for(var e=0;e<a;e++)c[b+e>>>2]|=(d[e>>>2]>>>24-8*(e%4)&255)<<24-8*((b+e)%4);else if(65535<d.length)for(e=0;e<a;e+=4)c[b+e>>>2]=d[e>>>2];else c.push.apply(c,d);this.sigBytes+=a;return this},clamp:function(){var a=this.words,c=this.sigBytes;a[c>>>2]&=4294967295<<
32-8*(c%4);a.length=h.ceil(c/4)},clone:function(){var a=m.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var c=[],d=0;d<a;d+=4)c.push(4294967296*h.random()|0);return new r.init(c,a)}}),l=f.enc={},k=l.Hex={stringify:function(a){var c=a.words;a=a.sigBytes;for(var d=[],b=0;b<a;b++){var e=c[b>>>2]>>>24-8*(b%4)&255;d.push((e>>>4).toString(16));d.push((e&15).toString(16))}return d.join("")},parse:function(a){for(var c=a.length,d=[],b=0;b<c;b+=2)d[b>>>3]|=parseInt(a.substr(b,
2),16)<<24-4*(b%8);return new r.init(d,c/2)}},n=l.Latin1={stringify:function(a){var c=a.words;a=a.sigBytes;for(var d=[],b=0;b<a;b++)d.push(String.fromCharCode(c[b>>>2]>>>24-8*(b%4)&255));return d.join("")},parse:function(a){for(var c=a.length,d=[],b=0;b<c;b++)d[b>>>2]|=(a.charCodeAt(b)&255)<<24-8*(b%4);return new r.init(d,c)}},j=l.Utf8={stringify:function(a){try{return decodeURIComponent(escape(n.stringify(a)))}catch(c){throw Error("Malformed UTF-8 data");}},parse:function(a){return n.parse(unescape(encodeURIComponent(a)))}},
u=g.BufferedBlockAlgorithm=m.extend({reset:function(){this._data=new r.init;this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=j.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var c=this._data,d=c.words,b=c.sigBytes,e=this.blockSize,f=b/(4*e),f=a?h.ceil(f):h.max((f|0)-this._minBufferSize,0);a=f*e;b=h.min(4*a,b);if(a){for(var g=0;g<a;g+=e)this._doProcessBlock(d,g);g=d.splice(0,a);c.sigBytes-=b}return new r.init(g,b)},clone:function(){var a=m.clone.call(this);
a._data=this._data.clone();return a},_minBufferSize:0});g.Hasher=u.extend({cfg:m.extend(),init:function(a){this.cfg=this.cfg.extend(a);this.reset()},reset:function(){u.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);return this._doFinalize()},blockSize:16,_createHelper:function(a){return function(c,d){return(new a.init(d)).finalize(c)}},_createHmacHelper:function(a){return function(c,d){return(new t.HMAC.init(a,
d)).finalize(c)}}});var t=f.algo={};return f}(Math);
(function(h){for(var s=CryptoJS,f=s.lib,g=f.WordArray,q=f.Hasher,f=s.algo,m=[],r=[],l=function(a){return 4294967296*(a-(a|0))|0},k=2,n=0;64>n;){var j;a:{j=k;for(var u=h.sqrt(j),t=2;t<=u;t++)if(!(j%t)){j=!1;break a}j=!0}j&&(8>n&&(m[n]=l(h.pow(k,0.5))),r[n]=l(h.pow(k,1/3)),n++);k++}var a=[],f=f.SHA256=q.extend({_doReset:function(){this._hash=new g.init(m.slice(0))},_doProcessBlock:function(c,d){for(var b=this._hash.words,e=b[0],f=b[1],g=b[2],j=b[3],h=b[4],m=b[5],n=b[6],q=b[7],p=0;64>p;p++){if(16>p)a[p]=
c[d+p]|0;else{var k=a[p-15],l=a[p-2];a[p]=((k<<25|k>>>7)^(k<<14|k>>>18)^k>>>3)+a[p-7]+((l<<15|l>>>17)^(l<<13|l>>>19)^l>>>10)+a[p-16]}k=q+((h<<26|h>>>6)^(h<<21|h>>>11)^(h<<7|h>>>25))+(h&m^~h&n)+r[p]+a[p];l=((e<<30|e>>>2)^(e<<19|e>>>13)^(e<<10|e>>>22))+(e&f^e&g^f&g);q=n;n=m;m=h;h=j+k|0;j=g;g=f;f=e;e=k+l|0}b[0]=b[0]+e|0;b[1]=b[1]+f|0;b[2]=b[2]+g|0;b[3]=b[3]+j|0;b[4]=b[4]+h|0;b[5]=b[5]+m|0;b[6]=b[6]+n|0;b[7]=b[7]+q|0},_doFinalize:function(){var a=this._data,d=a.words,b=8*this._nDataBytes,e=8*a.sigBytes;
d[e>>>5]|=128<<24-e%32;d[(e+64>>>9<<4)+14]=h.floor(b/4294967296);d[(e+64>>>9<<4)+15]=b;a.sigBytes=4*d.length;this._process();return this._hash},clone:function(){var a=q.clone.call(this);a._hash=this._hash.clone();return a}});s.SHA256=q._createHelper(f);s.HmacSHA256=q._createHmacHelper(f)})(Math);
(function(){var h=CryptoJS,s=h.enc.Utf8;h.algo.HMAC=h.lib.Base.extend({init:function(f,g){f=this._hasher=new f.init;"string"==typeof g&&(g=s.parse(g));var h=f.blockSize,m=4*h;g.sigBytes>m&&(g=f.finalize(g));g.clamp();for(var r=this._oKey=g.clone(),l=this._iKey=g.clone(),k=r.words,n=l.words,j=0;j<h;j++)k[j]^=1549556828,n[j]^=909522486;r.sigBytes=l.sigBytes=m;this.reset()},reset:function(){var f=this._hasher;f.reset();f.update(this._iKey)},update:function(f){this._hasher.update(f);return this},finalize:function(f){var g=
this._hasher;f=g.finalize(f);g.reset();return g.finalize(this._oKey.clone().concat(f))}})})();

/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(){var h=CryptoJS,j=h.lib.WordArray;h.enc.Base64={stringify:function(b){var e=b.words,f=b.sigBytes,c=this._map;b.clamp();b=[];for(var a=0;a<f;a+=3)for(var d=(e[a>>>2]>>>24-8*(a%4)&255)<<16|(e[a+1>>>2]>>>24-8*((a+1)%4)&255)<<8|e[a+2>>>2]>>>24-8*((a+2)%4)&255,g=0;4>g&&a+0.75*g<f;g++)b.push(c.charAt(d>>>6*(3-g)&63));if(e=c.charAt(64))for(;b.length%4;)b.push(e);return b.join("")},parse:function(b){var e=b.length,f=this._map,c=f.charAt(64);c&&(c=b.indexOf(c),-1!=c&&(e=c));for(var c=[],a=0,d=0;d<
e;d++)if(d%4){var g=f.indexOf(b.charAt(d-1))<<2*(d%4),h=f.indexOf(b.charAt(d))>>>6-2*(d%4);c[a>>>2]|=(g|h)<<24-8*(a%4);a++}return j.create(c,a)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}})();


function gaRandomByte(): number {
  return Math.floor(Math.random() * 256);
}

const gaNavigator = (() => {
  const os = Platform.OS;
  const version =
    Application.nativeApplicationVersion ??
    Constants.expoConfig?.version ??
    '1.0.0';
  const appName =
    Application.applicationName ?? Constants.expoConfig?.name ?? 'app';
  let platform = 'unknown';
  let userAgent = `Expo ReactNative/${os} ${version}`;

  if (os === 'ios') {
    platform = 'iPhone';
    userAgent = `Mozilla/5.0 (iPhone; CPU iPhone OS ${Platform.Version}_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/${version} ${appName}`;
  } else if (os === 'android') {
    platform = 'Linux';
    userAgent = `Mozilla/5.0 (Linux; Android ${Platform.Version}) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/0.0.0.0 Mobile Safari/537.36 ${appName}/${version}`;
  } else if (os === 'web') {
    platform = typeof navigator !== 'undefined' ? navigator.platform : 'web';
    userAgent =
      typeof navigator !== 'undefined'
        ? navigator.userAgent
        : userAgent;
  }

  return {
    platform,
    userAgent,
    appVersion: version,
    appName,
    vendor: 'ReactNative',
    onLine: true,
  };
})();

const gaStorage = (() => {
  const memory = new Map<string, string>();
  let hydratedGameKey: string | null = null;
  const hydratePromises = new Map<string, Promise<void>>();

  const formatKey = (gameKey: string, key: string) => `GA::${gameKey}::${key}`;

  /** SecureStore only allows [a-zA-Z0-9._-]; GA keys use `::` separators. */
  const toPersistedKey = (logicalKey: string) =>
    logicalKey.replace(/::/g, '__').replace(/[^a-zA-Z0-9._-]/g, '_');

  const storeKeys = ['ga_event', 'ga_session', 'ga_progression', 'ga_items'] as const;

  return {
    isAvailable(): boolean {
      return true;
    },
    getItem(key: string): string | null {
      return memory.has(key) ? memory.get(key)! : null;
    },
    setItem(key: string, value: string): void {
      memory.set(key, value);
      void storage.setItem(toPersistedKey(key), value);
    },
    removeItem(key: string): void {
      memory.delete(key);
      void storage.removeItem(toPersistedKey(key));
    },
    async hydrate(gameKey: string): Promise<void> {
      if (hydratedGameKey === gameKey) return;
      const existing = hydratePromises.get(gameKey);
      if (existing) return existing;

      const p = (async () => {
        for (const suffix of storeKeys) {
          const key = formatKey(gameKey, suffix);
          const v = await storage.getItem(toPersistedKey(key));
          if (v != null) memory.set(key, v);
        }
        hydratedGameKey = gameKey;
      })();

      hydratePromises.set(gameKey, p);
      await p;
    },
  };
})();

export function onGameAnalyticsBeforeUnload(): void {
  gameanalytics.state.GAState.instance.isUnloading = true;
  gameanalytics.state.GAState.notifyBeforeUnloadListeners();
  gameanalytics.threading.GAThreading.endSessionAndStopQueue();
  gameanalytics.state.GAState.instance.isUnloading = false;
}

export function setGameAnalyticsUserId(userId: string): void {
  gameanalytics.state.GAState.setUserId(userId);
}

/** True after init HTTP callback has authorized the SDK and started a session. */
export function isGameAnalyticsReady(): boolean {
  const state = gameanalytics.state.GAState;
  return (
    state.isInitialized() && state.isEnabled() && state.sessionIsStarted()
  );
}

namespace gameanalytics {

export enum EGAErrorSeverity {
        Undefined = 0,
        Debug = 1,
        Info = 2,
        Warning = 3,
        Error = 4,
        Critical = 5
    }

    export enum EGAProgressionStatus {
        Undefined = 0,
        Start = 1,
        Complete = 2,
        Fail = 3
    }

    export enum EGAResourceFlowType {
        Undefined = 0,
        Source = 1,
        Sink = 2
    }

    export enum EGAAdAction {
        Undefined = 0,
        Clicked = 1,
        Show = 2,
        FailedShow = 3,
        RewardReceived = 4
    }

    export enum EGAAdError {
        Undefined = 0,
        Unknown = 1,
        Offline = 2,
        NoFill = 3,
        InternalError = 4,
        InvalidRequest = 5,
        UnableToPrecache = 6
    }

    export enum EGAAdType {
        Undefined = 0,
        Video = 1,
        RewardedVideo = 2,
        Playable = 3,
        Interstitial = 4,
        OfferWall = 5,
        Banner = 6
    }

    export module http
    {
        export enum EGAHTTPApiResponse
        {
            // client
            NoResponse,
            BadResponse,
            RequestTimeout, // 408
            JsonEncodeFailed,
            JsonDecodeFailed,
            // server
            InternalServerError,
            BadRequest, // 400
            Unauthorized, // 401
            UnknownResponseCode,
            Ok,
            Created
        }
    }

    export module events
    {
        export enum EGASdkErrorCategory
        {
            Undefined = 0,
            EventValidation = 1,
            Database = 2,
            Init = 3,
            Http = 4,
            Json = 5
        }

        export enum EGASdkErrorArea
        {
            Undefined = 0,
            BusinessEvent = 1,
            ResourceEvent = 2,
            ProgressionEvent = 3,
            DesignEvent = 4,
            ErrorEvent = 5,
            InitHttp = 9,
            EventsHttp = 10,
            ProcessEvents = 11,
            AddEventsToStore = 12,
            AdEvent = 20
        }

        export enum EGASdkErrorAction
        {
            Undefined = 0,
            InvalidCurrency = 1,
            InvalidShortString = 2,
            InvalidEventPartLength = 3,
            InvalidEventPartCharacters = 4,
            InvalidStore = 5,
            InvalidFlowType = 6,
            StringEmptyOrNull = 7,
            NotFoundInAvailableCurrencies = 8,
            InvalidAmount = 9,
            NotFoundInAvailableItemTypes = 10,
            WrongProgressionOrder = 11,
            InvalidEventIdLength = 12,
            InvalidEventIdCharacters = 13,
            InvalidProgressionStatus = 15,
            InvalidSeverity = 16,
            InvalidLongString = 17,
            DatabaseTooLarge = 18,
            DatabaseOpenOrCreate = 19,
            JsonError = 25,
            FailHttpJsonDecode = 29,
            FailHttpJsonEncode = 30,
            InvalidAdAction = 31,
            InvalidAdType = 32,
            InvalidString = 33
        }

        export enum EGASdkErrorParameter
        {
            Undefined = 0,
            Currency = 1,
            CartType = 2,
            ItemType = 3,
            ItemId = 4,
            Store = 5,
            FlowType = 6,
            Amount = 7,
            Progression01 = 8,
            Progression02 = 9,
            Progression03 = 10,
            EventId = 11,
            ProgressionStatus = 12,
            Severity = 13,
            Message = 14,
            AdAction = 15,
            AdType = 16,
            AdSdkName = 17,
            AdPlacement = 18
        }
    }

export module logging
    {
        enum EGALoggerMessageType
        {
            Error = 0,
            Warning = 1,
            Info = 2,
            Debug = 3
        }

        export class GALogger
        {
            // Fields and properties: START

            private static readonly instance:GALogger = new GALogger();
            private infoLogEnabled:boolean;
            private infoLogVerboseEnabled:boolean;
            private static debugEnabled:boolean;
            private static readonly Tag:string = "GameAnalytics";

            // Fields and properties: END

            private constructor()
            {
                GALogger.debugEnabled = true;
            }

            // Methods: START

            public static setInfoLog(value:boolean): void
            {
                GALogger.instance.infoLogEnabled = value;
            }

            public static setVerboseLog(value:boolean): void
            {
                GALogger.instance.infoLogVerboseEnabled = value;
            }

            public static i(format:string): void
            {
                if(!GALogger.instance.infoLogEnabled)
                {
                    return;
                }

                var message:string = "Info/" + GALogger.Tag + ": " + format;
                GALogger.instance.sendNotificationMessage(message, EGALoggerMessageType.Info);
            }

            public static w(format:string): void
            {
                var message:string = "Warning/" + GALogger.Tag + ": " + format;
                GALogger.instance.sendNotificationMessage(message, EGALoggerMessageType.Warning);
            }

            public static e(format:string): void
            {
                var message:string = "Error/" + GALogger.Tag + ": " + format;
                GALogger.instance.sendNotificationMessage(message, EGALoggerMessageType.Error);
            }

            public static ii(format:string): void
            {
                if(!GALogger.instance.infoLogVerboseEnabled)
                {
                    return;
                }

                var message:string = "Verbose/" + GALogger.Tag + ": " + format;
                GALogger.instance.sendNotificationMessage(message, EGALoggerMessageType.Info);
            }

            public static d(format:string): void
            {
                if(!GALogger.debugEnabled)
                {
                    return;
                }

                var message:string = "Debug/" + GALogger.Tag + ": " + format;
                GALogger.instance.sendNotificationMessage(message, EGALoggerMessageType.Debug);
            }

            private sendNotificationMessage(message:string, type:EGALoggerMessageType): void
            {
                switch(type)
                {
                    case EGALoggerMessageType.Error:
                    {
                        console.error(message);
                    }
                    break;

                    case EGALoggerMessageType.Warning:
                    {
                        console.warn(message);
                    }
                    break;

                    case EGALoggerMessageType.Debug:
                    {
                        if(typeof console.debug === "function")
                        {
                            console.debug(message);
                        }
                        else
                        {
                            console.log(message);
                        }
                    }
                    break;

                    case EGALoggerMessageType.Info:
                    {
                        console.log(message);
                    }
                    break;
                }
            }

            // Methods: END
        }
    }

export module utilities
    {
        import GALogger = gameanalytics.logging.GALogger;

        export class GAUtilities
        {
            public static getHmac(key:string, data:string): string
            {
                var encryptedMessage = CryptoJS.HmacSHA256(data, key);
                return CryptoJS.enc.Base64.stringify(encryptedMessage);
            }

            public static stringMatch(s:string, pattern:RegExp): boolean
            {
                if(!s || !pattern)
                {
                    return false;
                }

                return pattern.test(s);
            }

            public static joinStringArray(v:Array<string>, delimiter:string): string
            {
                var result:string = "";

                for (let i = 0, il = v.length; i < il; i++)
                {
                    if (i > 0)
                    {
                        result += delimiter;
                    }
                    result += v[i];
                }
                return result;
            }

            public static stringArrayContainsString(array:Array<string>, search:string): boolean
            {
                if (array.length === 0)
                {
                    return false;
                }

                for(let s in array)
                {
                    if(array[s] === search)
                    {
                        return true;
                    }
                }
                return false;
            }

            private static readonly keyStr:string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

            public static encode64(input:string): string
            {
                input = encodeURI(input);
                var output:string = "";
                var chr1:number, chr2:number, chr3:number = 0;
                var enc1:number, enc2:number, enc3:number, enc4:number = 0;
                var i = 0;

                do
                {
                   chr1 = input.charCodeAt(i++);
                   chr2 = input.charCodeAt(i++);
                   chr3 = input.charCodeAt(i++);

                   enc1 = chr1 >> 2;
                   enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                   enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                   enc4 = chr3 & 63;

                   if (isNaN(chr2))
                   {
                      enc3 = enc4 = 64;
                   }
                   else if (isNaN(chr3))
                   {
                      enc4 = 64;
                   }

                   output = output +
                      GAUtilities.keyStr.charAt(enc1) +
                      GAUtilities.keyStr.charAt(enc2) +
                      GAUtilities.keyStr.charAt(enc3) +
                      GAUtilities.keyStr.charAt(enc4);
                   chr1 = chr2 = chr3 = 0;
                   enc1 = enc2 = enc3 = enc4 = 0;
                }
                while (i < input.length);

                return output;
            }

            public static decode64(input:string): string
            {
                var output:string = "";
                var chr1:number, chr2:number, chr3:number = 0;
                var enc1:number, enc2:number, enc3:number, enc4:number = 0;
                var i = 0;

                // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
                var base64test = /[^A-Za-z0-9\+\/\=]/g;
                if (base64test.exec(input)) {
                   GALogger.w("There were invalid base64 characters in the input text. Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='. Expect errors in decoding.");
                }
                input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

                do
                {
                   enc1 = GAUtilities.keyStr.indexOf(input.charAt(i++));
                   enc2 = GAUtilities.keyStr.indexOf(input.charAt(i++));
                   enc3 = GAUtilities.keyStr.indexOf(input.charAt(i++));
                   enc4 = GAUtilities.keyStr.indexOf(input.charAt(i++));

                   chr1 = (enc1 << 2) | (enc2 >> 4);
                   chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                   chr3 = ((enc3 & 3) << 6) | enc4;

                   output = output + String.fromCharCode(chr1);

                   if (enc3 != 64) {
                      output = output + String.fromCharCode(chr2);
                   }
                   if (enc4 != 64) {
                      output = output + String.fromCharCode(chr3);
                   }

                   chr1 = chr2 = chr3 = 0;
                   enc1 = enc2 = enc3 = enc4 = 0;

                }
                while (i < input.length);

                return decodeURI(output);
            }

            public static timeIntervalSince1970(): number
            {
                var date:Date = new Date();
                return Math.round(date.getTime() / 1000);
            }

            public static createGuid(): string
            {
                return ("10000000-1000-4000-8000-100000000000").replace(/[018]/g, (c) =>
                    (+c ^ (gaRandomByte() & 15) >> (+c / 4)).toString(16),
                );
            }
        }
    }

export module validators
    {
        import GALogger = gameanalytics.logging.GALogger;
        import GAUtilities = gameanalytics.utilities.GAUtilities;
        import EGASdkErrorCategory = gameanalytics.events.EGASdkErrorCategory;
        import EGASdkErrorArea = gameanalytics.events.EGASdkErrorArea;
        import EGASdkErrorAction = gameanalytics.events.EGASdkErrorAction;
        import EGASdkErrorParameter = gameanalytics.events.EGASdkErrorParameter;

        export class ValidationResult
        {
            public category:EGASdkErrorCategory;
            public area:EGASdkErrorArea;
            public action:EGASdkErrorAction;
            public parameter:EGASdkErrorParameter;
            public reason:string;

            public constructor(category:EGASdkErrorCategory, area:EGASdkErrorArea, action:EGASdkErrorAction, parameter:EGASdkErrorParameter, reason:string)
            {
                this.category = category;
                this.area = area;
                this.action = action;
                this.parameter = parameter;
                this.reason = reason;
            }
        }

        export class GAValidator
        {
            public static validateBusinessEvent(currency:string, amount:number, cartType:string, itemType:string, itemId:string): ValidationResult
            {
                // validate currency
                if (!GAValidator.validateCurrency(currency))
                {
                    GALogger.w("Validation fail - business event - currency: Cannot be (null) and need to be A-Z, 3 characters and in the standard at openexchangerates.org. Failed currency: " + currency);
                    return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.BusinessEvent, EGASdkErrorAction.InvalidCurrency, EGASdkErrorParameter.Currency, currency);
                }

                if (amount < 0)
                {
                    GALogger.w("Validation fail - business event - amount. Cannot be less than 0. Failed amount: " + amount);
                    return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.BusinessEvent, EGASdkErrorAction.InvalidAmount, EGASdkErrorParameter.Amount, amount + "");
                }

                // validate cartType
                if (!GAValidator.validateShortString(cartType, true))
                {
                    GALogger.w("Validation fail - business event - cartType. Cannot be above 32 length. String: " + cartType);
                    return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.BusinessEvent, EGASdkErrorAction.InvalidShortString, EGASdkErrorParameter.CartType, cartType);
                }

                // validate itemType length
                if (!GAValidator.validateEventPartLength(itemType, false))
                {
                    GALogger.w("Validation fail - business event - itemType: Cannot be (null), empty or above 64 characters. String: " + itemType);
                    return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.BusinessEvent, EGASdkErrorAction.InvalidEventPartLength, EGASdkErrorParameter.ItemType, itemType);
                }

                // validate itemType chars
                if (!GAValidator.validateEventPartCharacters(itemType))
                {
                    GALogger.w("Validation fail - business event - itemType: Cannot contain other characters than A-z, 0-9, -_., ()!?. String: " + itemType);
                    return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.BusinessEvent, EGASdkErrorAction.InvalidEventPartCharacters, EGASdkErrorParameter.ItemType, itemType);
                }

                // validate itemId
                if (!GAValidator.validateEventPartLength(itemId, false))
                {
                    GALogger.w("Validation fail - business event - itemId. Cannot be (null), empty or above 64 characters. String: " + itemId);
                    return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.BusinessEvent, EGASdkErrorAction.InvalidEventPartLength, EGASdkErrorParameter.ItemId, itemId);
                }

                if (!GAValidator.validateEventPartCharacters(itemId))
                {
                    GALogger.w("Validation fail - business event - itemId: Cannot contain other characters than A-z, 0-9, -_., ()!?. String: " + itemId);
                    return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.BusinessEvent, EGASdkErrorAction.InvalidEventPartCharacters, EGASdkErrorParameter.ItemId, itemId);
                }

                return null;
            }

            public static validateResourceEvent(flowType:EGAResourceFlowType, currency:string, amount:number, itemType:string, itemId:string, availableCurrencies:Array<string>, availableItemTypes:Array<string>): ValidationResult
            {
                if (flowType == EGAResourceFlowType.Undefined)
                {
                    GALogger.w("Validation fail - resource event - flowType: Invalid flow type.");
                    return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.ResourceEvent, EGASdkErrorAction.InvalidFlowType, EGASdkErrorParameter.FlowType, "");
                }
                if (!currency)
                {
                    GALogger.w("Validation fail - resource event - currency: Cannot be (null)");
                    return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.ResourceEvent, EGASdkErrorAction.StringEmptyOrNull, EGASdkErrorParameter.Currency, "");
                }
                if (!GAUtilities.stringArrayContainsString(availableCurrencies, currency))
                {
                    GALogger.w("Validation fail - resource event - currency: Not found in list of pre-defined available resource currencies. String: " + currency);
                    return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.ResourceEvent, EGASdkErrorAction.NotFoundInAvailableCurrencies, EGASdkErrorParameter.Currency, currency);
                }
                if (!(amount > 0))
                {
                    GALogger.w("Validation fail - resource event - amount: Float amount cannot be 0 or negative. Value: " + amount);
                    return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.ResourceEvent, EGASdkErrorAction.InvalidAmount, EGASdkErrorParameter.Amount, amount + "");
                }
                if (!itemType)
                {
                    GALogger.w("Validation fail - resource event - itemType: Cannot be (null)");
                    return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.ResourceEvent, EGASdkErrorAction.StringEmptyOrNull, EGASdkErrorParameter.ItemType, "");
                }
                if (!GAValidator.validateEventPartLength(itemType, false))
                {
                    GALogger.w("Validation fail - resource event - itemType: Cannot be (null), empty or above 64 characters. String: " + itemType);
                    return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.ResourceEvent, EGASdkErrorAction.InvalidEventPartLength, EGASdkErrorParameter.ItemType, itemType);
                }
                if (!GAValidator.validateEventPartCharacters(itemType))
                {
                    GALogger.w("Validation fail - resource event - itemType: Cannot contain other characters than A-z, 0-9, -_., ()!?. String: " + itemType);
                    return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.ResourceEvent, EGASdkErrorAction.InvalidEventPartCharacters, EGASdkErrorParameter.ItemType, itemType);
                }
                if (!GAUtilities.stringArrayContainsString(availableItemTypes, itemType))
                {
                    GALogger.w("Validation fail - resource event - itemType: Not found in list of pre-defined available resource itemTypes. String: " + itemType);
                    return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.ResourceEvent, EGASdkErrorAction.NotFoundInAvailableItemTypes, EGASdkErrorParameter.ItemType, itemType);
                }
                if (!GAValidator.validateEventPartLength(itemId, false))
                {
                    GALogger.w("Validation fail - resource event - itemId: Cannot be (null), empty or above 64 characters. String: " + itemId);
                    return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.ResourceEvent, EGASdkErrorAction.InvalidEventPartLength, EGASdkErrorParameter.ItemId, itemId);
                }
                if (!GAValidator.validateEventPartCharacters(itemId))
                {
                    GALogger.w("Validation fail - resource event - itemId: Cannot contain other characters than A-z, 0-9, -_., ()!?. String: " + itemId);
                    return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.ResourceEvent, EGASdkErrorAction.InvalidEventPartCharacters, EGASdkErrorParameter.ItemId, itemId);
                }
                return null;
            }

            public static validateProgressionEvent(progressionStatus:EGAProgressionStatus, progression01:string, progression02:string, progression03:string): ValidationResult
            {
                if (progressionStatus == EGAProgressionStatus.Undefined)
                {
                    GALogger.w("Validation fail - progression event: Invalid progression status.");
                    return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.ProgressionEvent, EGASdkErrorAction.InvalidProgressionStatus, EGASdkErrorParameter.ProgressionStatus, "");
                }

                // Make sure progressions are defined as either 01, 01+02 or 01+02+03
                if (progression03 && !(progression02 || !progression01))
                {
                    GALogger.w("Validation fail - progression event: 03 found but 01+02 are invalid. Progression must be set as either 01, 01+02 or 01+02+03.");
                    return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.ProgressionEvent, EGASdkErrorAction.WrongProgressionOrder, EGASdkErrorParameter.Undefined, progression01 + ":" + progression02 + ":" + progression03);
                }
                else if (progression02 && !progression01)
                {
                    GALogger.w("Validation fail - progression event: 02 found but not 01. Progression must be set as either 01, 01+02 or 01+02+03");
                    return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.ProgressionEvent, EGASdkErrorAction.WrongProgressionOrder, EGASdkErrorParameter.Undefined, progression01 + ":" + progression02 + ":" + progression03);
                }
                else if (!progression01)
                {
                    GALogger.w("Validation fail - progression event: progression01 not valid. Progressions must be set as either 01, 01+02 or 01+02+03");
                    return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.ProgressionEvent, EGASdkErrorAction.WrongProgressionOrder, EGASdkErrorParameter.Undefined, (progression01 ? progression01 : "") + ":" + (progression02 ? progression02 : "") + ":" + (progression03 ? progression03 : ""));
                }

                // progression01 (required)
                if (!GAValidator.validateEventPartLength(progression01, false))
                {
                    GALogger.w("Validation fail - progression event - progression01: Cannot be (null), empty or above 64 characters. String: " + progression01);
                    return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.ProgressionEvent, EGASdkErrorAction.InvalidEventPartLength, EGASdkErrorParameter.Progression01, progression01);
                }
                if (!GAValidator.validateEventPartCharacters(progression01))
                {
                    GALogger.w("Validation fail - progression event - progression01: Cannot contain other characters than A-z, 0-9, -_., ()!?. String: " + progression01);
                    return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.ProgressionEvent, EGASdkErrorAction.InvalidEventPartCharacters, EGASdkErrorParameter.Progression01, progression01);
                }
                // progression02
                if (progression02)
                {
                    if (!GAValidator.validateEventPartLength(progression02, true))
                    {
                        GALogger.w("Validation fail - progression event - progression02: Cannot be empty or above 64 characters. String: " + progression02);
                        return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.ProgressionEvent, EGASdkErrorAction.InvalidEventPartLength, EGASdkErrorParameter.Progression02, progression02);
                    }
                    if (!GAValidator.validateEventPartCharacters(progression02))
                    {
                        GALogger.w("Validation fail - progression event - progression02: Cannot contain other characters than A-z, 0-9, -_., ()!?. String: " + progression02);
                        return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.ProgressionEvent, EGASdkErrorAction.InvalidEventPartCharacters, EGASdkErrorParameter.Progression02, progression02);
                    }
                }
                // progression03
                if (progression03)
                {
                    if (!GAValidator.validateEventPartLength(progression03, true))
                    {
                        GALogger.w("Validation fail - progression event - progression03: Cannot be empty or above 64 characters. String: " + progression03);
                        return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.ProgressionEvent, EGASdkErrorAction.InvalidEventPartLength, EGASdkErrorParameter.Progression03, progression03);
                    }
                    if (!GAValidator.validateEventPartCharacters(progression03))
                    {
                        GALogger.w("Validation fail - progression event - progression03: Cannot contain other characters than A-z, 0-9, -_., ()!?. String: " + progression03);
                        return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.ProgressionEvent, EGASdkErrorAction.InvalidEventPartCharacters, EGASdkErrorParameter.Progression03, progression03);
                    }
                }
                return null;
            }

            public static validateDesignEvent(eventId:string): ValidationResult
            {
                if (!GAValidator.validateEventIdLength(eventId))
                {
                    GALogger.w("Validation fail - design event - eventId: Cannot be (null) or empty. Only 5 event parts allowed seperated by :. Each part need to be 64 characters or less. String: " + eventId);
                    return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.DesignEvent, EGASdkErrorAction.InvalidEventIdLength, EGASdkErrorParameter.EventId, eventId);
                }
                if (!GAValidator.validateEventIdCharacters(eventId))
                {
                    GALogger.w("Validation fail - design event - eventId: Non valid characters. Only allowed A-z, 0-9, -_., ()!?. String: " + eventId);
                    return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.DesignEvent, EGASdkErrorAction.InvalidEventIdCharacters, EGASdkErrorParameter.EventId, eventId);
                }
                // value: allow 0, negative and nil (not required)
                return null;
            }

            public static validateErrorEvent(severity:EGAErrorSeverity, message:string): ValidationResult
            {
                if (severity == EGAErrorSeverity.Undefined)
                {
                    GALogger.w("Validation fail - error event - severity: Severity was unsupported value.");
                    return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.ErrorEvent, EGASdkErrorAction.InvalidSeverity, EGASdkErrorParameter.Severity, "");
                }
                if (!GAValidator.validateLongString(message, true))
                {
                    GALogger.w("Validation fail - error event - message: Message cannot be above 8192 characters.");
                    return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.ErrorEvent, EGASdkErrorAction.InvalidLongString, EGASdkErrorParameter.Message, message);
                }
                return null;
            }

            public static validateAdEvent(adAction:EGAAdAction, adType:EGAAdType, adSdkName:string, adPlacement:string): ValidationResult
            {
                if (adAction == EGAAdAction.Undefined)
                {
                    GALogger.w("Validation fail - error event - severity: Severity was unsupported value.");
                    return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.AdEvent, EGASdkErrorAction.InvalidAdAction, EGASdkErrorParameter.AdAction, "");
                }
                if (adType == EGAAdType.Undefined)
                {
                    GALogger.w("Validation fail - ad event - adType: Ad type was unsupported value.");
                    return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.AdEvent, EGASdkErrorAction.InvalidAdType, EGASdkErrorParameter.AdType, "");
                }
                if (!GAValidator.validateShortString(adSdkName, false))
                {
                    GALogger.w("Validation fail - ad event - message: Ad SDK name cannot be above 32 characters.");
                    return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.AdEvent, EGASdkErrorAction.InvalidShortString, EGASdkErrorParameter.AdSdkName, adSdkName);
                }
                if (!GAValidator.validateString(adPlacement, false))
                {
                    GALogger.w("Validation fail - ad event - message: Ad placement cannot be above 64 characters.");
                    return new ValidationResult(EGASdkErrorCategory.EventValidation, EGASdkErrorArea.AdEvent, EGASdkErrorAction.InvalidString, EGASdkErrorParameter.AdPlacement, adPlacement);
                }
                return null;
            }

            public static validateSdkErrorEvent(gameKey:string, gameSecret:string, category:EGASdkErrorCategory, area:EGASdkErrorArea, action:EGASdkErrorAction): boolean
            {
                if(!GAValidator.validateKeys(gameKey, gameSecret))
                {
                    return false;
                }

                if (category === EGASdkErrorCategory.Undefined)
                {
                    GALogger.w("Validation fail - sdk error event - type: Category was unsupported value.");
                    return false;
                }
                if (area === EGASdkErrorArea.Undefined)
                {
                    GALogger.w("Validation fail - sdk error event - type: Area was unsupported value.");
                    return false;
                }
                if (action === EGASdkErrorAction.Undefined)
                {
                    GALogger.w("Validation fail - sdk error event - type: Action was unsupported value.");
                    return false;
                }
                return true;
            }

            public static validateKeys(gameKey:string, gameSecret:string): boolean
            {
                if (GAUtilities.stringMatch(gameKey, /^[A-z0-9]{32}$/))
                {
                    if (GAUtilities.stringMatch(gameSecret, /^[A-z0-9]{40}$/))
                    {
                        return true;
                    }
                }
                return false;
            }

            public static validateCurrency(currency:string): boolean
            {
                if (!currency)
                {
                    return false;
                }
                if (!GAUtilities.stringMatch(currency, /^[A-Z]{3}$/))
                {
                    return false;
                }
                return true;
            }

            public static validateEventPartLength(eventPart:string, allowNull:boolean): boolean
            {
                if (allowNull && !eventPart)
                {
                    return true;
                }

                if (!eventPart)
                {
                    return false;
                }

                if (eventPart.length > 64)
                {
                    return false;
                }
                return true;
            }

            public static validateEventPartCharacters(eventPart:string): boolean
            {
                if (!GAUtilities.stringMatch(eventPart, /^[A-Za-z0-9\s\-_\.\(\)\!\?]{1,64}$/))
                {
                    return false;
                }
                return true;
            }

            public static validateEventIdLength(eventId:string): boolean
            {
                if (!eventId)
                {
                    return false;
                }

                if (!GAUtilities.stringMatch(eventId, /^[^:]{1,64}(?::[^:]{1,64}){0,4}$/))
                {
                    return false;
                }
                return true;
            }

            public static validateEventIdCharacters(eventId:string): boolean
            {
                if (!eventId)
                {
                    return false;
                }

                if (!GAUtilities.stringMatch(eventId, /^[A-Za-z0-9\s\-_\.\(\)\!\?]{1,64}(:[A-Za-z0-9\s\-_\.\(\)\!\?]{1,64}){0,4}$/))
                {
                    return false;
                }
                return true;
            }

            public static validateAndCleanInitRequestResponse(initResponse:{[key:string]: any}, configsCreated:boolean): {[key:string]: any}
            {
                // make sure we have a valid dict
                if (initResponse == null)
                {
                    GALogger.w("validateInitRequestResponse failed - no response dictionary.");
                    return null;
                }

                var validatedDict:{[key:string]: any} = {};

                // validate server_ts
                try
                {
                    var serverTsNumber:number = initResponse["server_ts"];
                    if (serverTsNumber > 0)
                    {
                        validatedDict["server_ts"] = serverTsNumber;
                    }
                    else
                    {
                        GALogger.w("validateInitRequestResponse failed - invalid value in 'server_ts' field.");
                        return null;
                    }
                }
                catch (e)
                {
                    GALogger.w("validateInitRequestResponse failed - invalid type in 'server_ts' field. type=" + typeof initResponse["server_ts"] + ", value=" + initResponse["server_ts"] + ", " + e);
                    return null;
                }

                if(configsCreated)
                {
                    // validate configs field
                    try
                    {
                        var configurations:any[] = initResponse["configs"];
                        validatedDict["configs"] = configurations;
                    }
                    catch (e)
                    {
                        GALogger.w("validateInitRequestResponse failed - invalid type in 'configs' field. type=" + typeof initResponse["configs"] + ", value=" + initResponse["configs"] + ", " + e);
                        return null;
                    }

                    try
                    {
                        var configs_hash:string = initResponse["configs_hash"];
                        validatedDict["configs_hash"] = configs_hash;
                    }
                    catch (e)
                    {
                        GALogger.w("validateInitRequestResponse failed - invalid type in 'configs_hash' field. type=" + typeof initResponse["configs_hash"] + ", value=" + initResponse["configs_hash"] + ", " + e);
                        return null;
                    }

                    // validate ab_id field
                    try
                    {
                        var ab_id:string = initResponse["ab_id"];
                        validatedDict["ab_id"] = ab_id;
                    }
                    catch (e)
                    {
                        GALogger.w("validateInitRequestResponse failed - invalid type in 'ab_id' field. type=" + typeof initResponse["ab_id"] + ", value=" + initResponse["ab_id"] + ", " + e);
                        return null;
                    }

                    // validate ab_variant_id field
                    try
                    {
                        var ab_variant_id:string = initResponse["ab_variant_id"];
                        validatedDict["ab_variant_id"] = ab_variant_id;
                    }
                    catch (e)
                    {
                        GALogger.w("validateInitRequestResponse failed - invalid type in 'ab_variant_id' field. type=" + typeof initResponse["ab_variant_id"] + ", value=" + initResponse["ab_variant_id"] + ", " + e);
                        return null;
                    }
                }


                return validatedDict;
            }

            public static validateBuild(build:string): boolean
            {
                if (!GAValidator.validateShortString(build, false))
                {
                    return false;
                }
                return true;
            }

            public static validateSdkWrapperVersion(wrapperVersion:string): boolean
            {
                if (!GAUtilities.stringMatch(wrapperVersion, /^(unity|unreal|gamemaker|cocos2d|construct|defold|godot|flutter) [0-9]{0,5}(\.[0-9]{0,5}){0,2}$/))
                {
                    return false;
                }
                return true;
            }

            public static validateEngineVersion(engineVersion:string): boolean
            {
                if (!engineVersion || !GAUtilities.stringMatch(engineVersion, /^(unity|unreal|gamemaker|cocos2d|construct|defold|godot) [0-9]{0,5}(\.[0-9]{0,5}){0,2}$/))
                {
                    return false;
                }
                return true;
            }

            public static validateUserId(uId:string): boolean
            {
                if (!GAValidator.validateString(uId, false))
                {
                    GALogger.w("Validation fail - user id: id cannot be (null), empty or above 64 characters.");
                    return false;
                }
                return true;
            }

            public static validateShortString(shortString:string, canBeEmpty:boolean): boolean
            {
                // String is allowed to be empty or nil
                if (canBeEmpty && !shortString)
                {
                    return true;
                }

                if (!shortString || shortString.length > 32)
                {
                    return false;
                }
                return true;
            }

            public static validateString(s:string, canBeEmpty:boolean): boolean
            {
                // String is allowed to be empty or nil
                if (canBeEmpty && !s)
                {
                    return true;
                }

                if (!s || s.length > 64)
                {
                    return false;
                }
                return true;
            }

            public static validateLongString(longString:string, canBeEmpty:boolean): boolean
            {
                // String is allowed to be empty
                if (canBeEmpty && !longString)
                {
                    return true;
                }

                if (!longString || longString.length > 8192)
                {
                    return false;
                }
                return true;
            }

            public static validateConnectionType(connectionType:string): boolean
            {
                return GAUtilities.stringMatch(connectionType, /^(wwan|wifi|lan|offline)$/);
            }

            public static validateCustomDimensions(customDimensions:Array<string>): boolean
            {
                return GAValidator.validateArrayOfStrings(20, 32, false, "custom dimensions", customDimensions);
            }

            public static validateResourceCurrencies(resourceCurrencies:Array<string>): boolean
            {
                if (!GAValidator.validateArrayOfStrings(20, 64, false, "resource currencies", resourceCurrencies))
                {
                    return false;
                }

                // validate each string for regex
                for (let i = 0; i < resourceCurrencies.length; ++i)
                {
                    if (!GAUtilities.stringMatch(resourceCurrencies[i], /^[A-Za-z]+$/))
                    {
                        GALogger.w("resource currencies validation failed: a resource currency can only be A-Z, a-z. String was: " + resourceCurrencies[i]);
                        return false;
                    }
                }
                return true;
            }

            public static validateResourceItemTypes(resourceItemTypes:Array<string>): boolean
            {
                if (!GAValidator.validateArrayOfStrings(20, 32, false, "resource item types", resourceItemTypes))
                {
                    return false;
                }

                // validate each resourceItemType for eventpart validation
                for (let i = 0; i < resourceItemTypes.length; ++i)
                {
                    if (!GAValidator.validateEventPartCharacters(resourceItemTypes[i]))
                    {
                        GALogger.w("resource item types validation failed: a resource item type cannot contain other characters than A-z, 0-9, -_., ()!?. String was: " + resourceItemTypes[i]);
                        return false;
                    }
                }
                return true;
            }

            public static validateDimension01(dimension01:string, availableDimensions:Array<string>): boolean
            {
                // allow nil
                if (!dimension01)
                {
                    return true;
                }
                if (!GAUtilities.stringArrayContainsString(availableDimensions, dimension01))
                {
                    return false;
                }
                return true;
            }

            public static validateDimension02(dimension02:string, availableDimensions:Array<string>): boolean
            {
                // allow nil
                if (!dimension02)
                {
                    return true;
                }
                if (!GAUtilities.stringArrayContainsString(availableDimensions, dimension02))
                {
                    return false;
                }
                return true;
            }

            public static validateDimension03(dimension03:string, availableDimensions:Array<string>): boolean
            {
                // allow nil
                if (!dimension03)
                {
                    return true;
                }
                if (!GAUtilities.stringArrayContainsString(availableDimensions, dimension03))
                {
                    return false;
                }
                return true;
            }

            public static validateArrayOfStrings(maxCount:number, maxStringLength:number, allowNoValues:boolean, logTag:string, arrayOfStrings:Array<string>): boolean
            {
                var arrayTag:string = logTag;

                // use arrayTag to annotate warning log
                if (!arrayTag)
                {
                    arrayTag = "Array";
                }

                if(!arrayOfStrings)
                {
                    GALogger.w(arrayTag + " validation failed: array cannot be null. ");
                    return false;
                }

                // check if empty
                if (allowNoValues == false && arrayOfStrings.length == 0)
                {
                    GALogger.w(arrayTag + " validation failed: array cannot be empty. ");
                    return false;
                }

                // check if exceeding max count
                if (maxCount > 0 && arrayOfStrings.length > maxCount)
                {
                    GALogger.w(arrayTag + " validation failed: array cannot exceed " + maxCount + " values. It has " + arrayOfStrings.length + " values.");
                    return false;
                }

                // validate each string
                for (let i = 0; i < arrayOfStrings.length; ++i)
                {
                    var stringLength:number = !arrayOfStrings[i] ? 0 : arrayOfStrings[i].length;
                    // check if empty (not allowed)
                    if (stringLength === 0)
                    {
                        GALogger.w(arrayTag + " validation failed: contained an empty string. Array=" + JSON.stringify(arrayOfStrings));
                        return false;
                    }

                    // check if exceeding max length
                    if (maxStringLength > 0 && stringLength > maxStringLength)
                    {
                        GALogger.w(arrayTag + " validation failed: a string exceeded max allowed length (which is: " + maxStringLength + "). String was: " + arrayOfStrings[i]);
                        return false;
                    }
                }
                return true;
            }

            public static validateClientTs(clientTs:number): boolean
            {
                if (clientTs < (0) || clientTs > (99999999999))
                {
                    return false;
                }
                return true;
            }
        }
    }

export module device
    {
        export class NameValueVersion
        {
            public name:string;
            public value:string;
            public version:string;

            public constructor(name:string, value:string, version:string)
            {
                this.name = name;
                this.value = value;
                this.version = version;
            }
        }

        export class NameVersion
        {
            public name:string;
            public version:string;

            public constructor(name:string, version:string)
            {
                this.name = name;
                this.version = version;
            }
        }

        export class GADevice
        {
            private static readonly sdkWrapperVersion:string = "javascript 4.4.6";
            private static readonly osVersionPair:NameVersion = GADevice.matchItem([
                gaNavigator.platform,
                gaNavigator.userAgent,
                gaNavigator.appVersion,
                gaNavigator.vendor
            ].join(' '), [
                new NameValueVersion("windows_phone", "Windows Phone", "OS"),
                new NameValueVersion("windows", "Win", "NT"),
                new NameValueVersion("ios", "iPhone", "OS"),
                new NameValueVersion("ios", "iPad", "OS"),
                new NameValueVersion("ios", "iPod", "OS"),
                new NameValueVersion("android", "Android", "Android"),
                new NameValueVersion("blackBerry", "BlackBerry", "/"),
                new NameValueVersion("mac_osx", "Mac", "OS X"),
                new NameValueVersion("tizen", "Tizen", "Tizen"),
                new NameValueVersion("linux", "Linux", "rv"),
                new NameValueVersion("kai_os", "KAIOS", "KAIOS")
            ]);

            public static readonly buildPlatform:string = GADevice.runtimePlatformToString();
            public static readonly deviceModel:string = GADevice.getDeviceModel();
            public static readonly deviceManufacturer:string = GADevice.getDeviceManufacturer();
            public static readonly osVersion:string = GADevice.getOSVersionString();
            public static readonly browserVersion:string = GADevice.getBrowserVersionString();

            public static sdkGameEngineVersion:string;
            public static gameEngineVersion:string;
            private static connectionType:string;
            public static touch(): void
            {
            }

            public static getRelevantSdkVersion(): string
            {
                if(GADevice.sdkGameEngineVersion)
                {
                    return GADevice.sdkGameEngineVersion;
                }
                return GADevice.sdkWrapperVersion;
            }

            public static getConnectionType(): string
            {
                return GADevice.connectionType;
            }

            public static updateConnectionType(): void
            {
                if(gaNavigator.onLine)
                {
                    if(GADevice.buildPlatform === "ios" || GADevice.buildPlatform === "android")
                    {
                        GADevice.connectionType = "wwan";
                    }
                    else
                    {
                        GADevice.connectionType = "lan";
                    }
                    // TODO: Detect wifi usage
                }
                else
                {
                    GADevice.connectionType = "offline";
                }
            }

            private static getOSVersionString(): string
            {
                return GADevice.buildPlatform + " " + GADevice.osVersionPair.version;
            }

            private static runtimePlatformToString(): string
            {
                return GADevice.osVersionPair.name;
            }

            private static getBrowserVersionString(): string
            {
                var ua:string = gaNavigator.userAgent;
                var tem:RegExpMatchArray;
                var M:RegExpMatchArray = ua.match(/(opera|chrome|safari|firefox|ubrowser|msie|trident|fbav(?=\/))\/?\s*(\d+)/i) || [];

                if(M.length == 0)
                {
                    if(GADevice.buildPlatform === "ios")
                    {
                        return "webkit_" + GADevice.osVersion;
                    }
                }

                if(/trident/i.test(M[1]))
                {
                    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
                    return 'IE ' + (tem[1] || '');
                }

                if(M[1] === 'Chrome')
                {
                    tem = ua.match(/\b(OPR|Edge|UBrowser)\/(\d+)/);
                    if(tem!= null)
                    {
                        return tem.slice(1).join(' ').replace('OPR', 'Opera').replace('UBrowser', 'UC').toLowerCase();
                    }
                }

                if(M[1] && M[1].toLowerCase() === 'fbav')
                {
                    M[1] = "facebook";

                    if(M[2])
                    {
                        return "facebook " + M[2];
                    }
                }

                var MString:string[] = M[2]? [M[1], M[2]]: [gaNavigator.appName, gaNavigator.appVersion, '-?'];

                if((tem = ua.match(/version\/(\d+)/i)) != null)
                {
                    MString.splice(1, 1, tem[1]);
                }

                return MString.join(' ').toLowerCase();
            }

            private static getDeviceModel():string
            {
                var result:string = "unknown";

                return result;
            }

            private static getDeviceManufacturer():string
            {
                var result:string = "unknown";

                return result;
            }

            private static matchItem(agent:string, data:Array<NameValueVersion>):NameVersion
            {
                var result:NameVersion = new NameVersion("unknown", "0.0.0");

                var i:number = 0;
                var j:number = 0;
                var regex:RegExp;
                var regexv:RegExp;
                var match:boolean;
                var matches:RegExpMatchArray;
                var mathcesResult:string;
                var version:string;

                for (i = 0; i < data.length; i += 1)
                {
                    regex = new RegExp(data[i].value, 'i');
                    match = regex.test(agent);
                    if (match)
                    {
                        regexv = new RegExp(data[i].version + '[- /:;]([\\d._]+)', 'i');
                        matches = agent.match(regexv);
                        version = '';
                        if (matches)
                        {
                            if (matches[1])
                            {
                                mathcesResult = matches[1];
                            }
                        }
                        if (mathcesResult)
                        {
                            var matchesArray:string[] = mathcesResult.split(/[._]+/);
                            for (j = 0; j < Math.min(matchesArray.length, 3); j += 1)
                            {
                                version += matchesArray[j] + (j < Math.min(matchesArray.length, 3) - 1 ? '.' : '');
                            }
                        }
                        else
                        {
                            version = '0.0.0';
                        }

                        result.name = data[i].name;
                        result.version = version;

                        return result;
                    }
                }

                return result;
            }
        }
    }

export module store
    {
        import GALogger = gameanalytics.logging.GALogger;

        export enum EGAStoreArgsOperator
        {
            Equal,
            LessOrEqual,
            NotEqual
        }

        export enum EGAStore
        {
            Events = 0,
            Sessions = 1,
            Progression = 2
        }

        export class GAStore
        {
            private static readonly instance:GAStore = new GAStore();
            private static storageAvailable:boolean;
            private static readonly MaxNumberOfEntries:number = 2000;
            private eventsStore:Array<{[key:string]: any}> = [];
            private sessionsStore:Array<{[key:string]: any}> = [];
            private progressionStore:Array<{[key:string]: any}> = [];
            private storeItems:{[key:string]: any} = {};
            private static readonly StringFormat = (str:string, ...args:string[]) => str.replace(/{(\d+)}/g, (_, index:number) => args[index] || '');
            private static readonly KeyFormat:string = "GA::{0}::{1}";
            private static readonly EventsStoreKey:string = "ga_event";
            private static readonly SessionsStoreKey:string = "ga_session";
            private static readonly ProgressionStoreKey:string = "ga_progression";
            private static readonly ItemsStoreKey:string = "ga_items";

            private constructor()
            {
                try
                {
                    GAStore.storageAvailable = gaStorage.isAvailable();
                }
                catch (e)
                {
                    GAStore.storageAvailable = false;
                }

                GALogger.d("Storage is available?: " + GAStore.storageAvailable);
            }

            public static isStorageAvailable():boolean
            {
                return GAStore.storageAvailable;
            }

            public static isStoreTooLargeForEvents(): boolean
            {
                return GAStore.instance.eventsStore.length + GAStore.instance.sessionsStore.length > GAStore.MaxNumberOfEntries;
            }

            public static select(store:EGAStore, args:Array<[string, EGAStoreArgsOperator, any]> = [], sort:boolean = false, maxCount:number = 0): Array<{[key:string]: any}>
            {
                var currentStore:Array<{[key:string]: any}> = GAStore.getStore(store);

                if(!currentStore)
                {
                    return null;
                }

                var result:Array<{[key:string]: any}> = [];

                for(let i = 0; i < currentStore.length; ++i)
                {
                    var entry:{[key:string]: any} = currentStore[i];

                    var add:boolean = true;
                    for(let j = 0; j < args.length; ++j)
                    {
                        var argsEntry:[string, EGAStoreArgsOperator, any] = args[j];

                        if(entry[argsEntry[0]])
                        {
                            switch(argsEntry[1])
                            {
                                case EGAStoreArgsOperator.Equal:
                                {
                                    add = entry[argsEntry[0]] == argsEntry[2];
                                }
                                break;

                                case EGAStoreArgsOperator.LessOrEqual:
                                {
                                    add = entry[argsEntry[0]] <= argsEntry[2];
                                }
                                break;

                                case EGAStoreArgsOperator.NotEqual:
                                {
                                    add = entry[argsEntry[0]] != argsEntry[2];
                                }
                                break;

                                default:
                                {
                                    add = false;
                                }
                                break;
                            }
                        }
                        else
                        {
                            add = false;
                        }

                        if(!add)
                        {
                            break;
                        }
                    }

                    if(add)
                    {
                        result.push(entry);
                    }
                }

                if(sort)
                {
                    result.sort((a:{[key:string]: any}, b:{[key:string]: any}) => {
                        return (a["client_ts"] as number) - (b["client_ts"] as number)
                    });
                }

                if(maxCount > 0 && result.length > maxCount)
                {
                    result = result.slice(0, maxCount + 1)
                }

                return result;
            }

            public static update(store:EGAStore, setArgs:Array<[string, any]>, whereArgs:Array<[string, EGAStoreArgsOperator, any]> = []): boolean
            {
                var currentStore:Array<{[key:string]: any}> = GAStore.getStore(store);

                if(!currentStore)
                {
                    return false;
                }

                for(let i = 0; i < currentStore.length; ++i)
                {
                    var entry:{[key:string]: any} = currentStore[i];

                    var update:boolean = true;
                    for(let j = 0; j < whereArgs.length; ++j)
                    {
                        var argsEntry:[string, EGAStoreArgsOperator, any] = whereArgs[j];

                        if(entry[argsEntry[0]])
                        {
                            switch(argsEntry[1])
                            {
                                case EGAStoreArgsOperator.Equal:
                                {
                                    update = entry[argsEntry[0]] == argsEntry[2];
                                }
                                break;

                                case EGAStoreArgsOperator.LessOrEqual:
                                {
                                    update = entry[argsEntry[0]] <= argsEntry[2];
                                }
                                break;

                                case EGAStoreArgsOperator.NotEqual:
                                {
                                    update = entry[argsEntry[0]] != argsEntry[2];
                                }
                                break;

                                default:
                                {
                                    update = false;
                                }
                                break;
                            }
                        }
                        else
                        {
                            update = false;
                        }

                        if(!update)
                        {
                            break;
                        }
                    }

                    if(update)
                    {
                        for(let j = 0; j < setArgs.length; ++j)
                        {
                            var setArgsEntry:[string, any] = setArgs[j];
                            entry[setArgsEntry[0]] = setArgsEntry[1];
                        }
                    }
                }

                return true;
            }

            public static delete(store:EGAStore, args:Array<[string, EGAStoreArgsOperator, any]>): void
            {
                var currentStore:Array<{[key:string]: any}> = GAStore.getStore(store);

                if(!currentStore)
                {
                    return;
                }

                for(let i = 0; i < currentStore.length; ++i)
                {
                    var entry:{[key:string]: any} = currentStore[i];

                    var del:boolean = true;
                    for(let j = 0; j < args.length; ++j)
                    {
                        var argsEntry:[string, EGAStoreArgsOperator, any] = args[j];

                        if(entry[argsEntry[0]])
                        {
                            switch(argsEntry[1])
                            {
                                case EGAStoreArgsOperator.Equal:
                                {
                                    del = entry[argsEntry[0]] == argsEntry[2];
                                }
                                break;

                                case EGAStoreArgsOperator.LessOrEqual:
                                {
                                    del = entry[argsEntry[0]] <= argsEntry[2];
                                }
                                break;

                                case EGAStoreArgsOperator.NotEqual:
                                {
                                    del = entry[argsEntry[0]] != argsEntry[2];
                                }
                                break;

                                default:
                                {
                                    del = false;
                                }
                                break;
                            }
                        }
                        else
                        {
                            del = false;
                        }

                        if(!del)
                        {
                            break;
                        }
                    }

                    if(del)
                    {
                        currentStore.splice(i, 1);
                        --i;
                    }
                }
            }

            public static insert(store:EGAStore, newEntry:{[key:string]: any}, replace:boolean = false, replaceKey:string = null): void
            {
                var currentStore:Array<{[key:string]: any}> = GAStore.getStore(store);

                if(!currentStore)
                {
                    return;
                }

                if(replace)
                {
                    if(!replaceKey)
                    {
                        return;
                    }

                    var replaced:boolean = false;

                    for(let i = 0; i < currentStore.length; ++i)
                    {
                        var entry:{[key:string]: any} = currentStore[i];

                        if(entry[replaceKey] == newEntry[replaceKey])
                        {
                            for(let s in newEntry)
                            {
                                entry[s] = newEntry[s];
                            }
                            replaced = true;
                            break;
                        }
                    }

                    if(!replaced)
                    {
                        currentStore.push(newEntry);
                    }
                }
                else
                {
                    currentStore.push(newEntry);
                }
            }

            public static save(gameKey:string): void
            {
                if(!GAStore.isStorageAvailable())
                {
                    GALogger.w("Storage is not available, cannot save.");
                    return;
                }

                gaStorage.setItem(GAStore.StringFormat(GAStore.KeyFormat, gameKey, GAStore.EventsStoreKey), JSON.stringify(GAStore.instance.eventsStore));
                gaStorage.setItem(GAStore.StringFormat(GAStore.KeyFormat, gameKey, GAStore.SessionsStoreKey), JSON.stringify(GAStore.instance.sessionsStore));
                gaStorage.setItem(GAStore.StringFormat(GAStore.KeyFormat, gameKey, GAStore.ProgressionStoreKey), JSON.stringify(GAStore.instance.progressionStore));
                gaStorage.setItem(GAStore.StringFormat(GAStore.KeyFormat, gameKey, GAStore.ItemsStoreKey), JSON.stringify(GAStore.instance.storeItems));
            }

            public static load(gameKey:string): void
            {
                if(!GAStore.isStorageAvailable())
                {
                    GALogger.w("Storage is not available, cannot load.");
                    return;
                }

                try
                {
                    GAStore.instance.eventsStore = JSON.parse(gaStorage.getItem(GAStore.StringFormat(GAStore.KeyFormat, gameKey, GAStore.EventsStoreKey)));

                    if(!GAStore.instance.eventsStore)
                    {
                        GAStore.instance.eventsStore = [];
                    }
                }
                catch(e)
                {
                    GALogger.w("Load failed for 'events' store. Using empty store.");
                    GAStore.instance.eventsStore = [];
                }

                try
                {
                    GAStore.instance.sessionsStore = JSON.parse(gaStorage.getItem(GAStore.StringFormat(GAStore.KeyFormat, gameKey, GAStore.SessionsStoreKey)));

                    if(!GAStore.instance.sessionsStore)
                    {
                        GAStore.instance.sessionsStore = [];
                    }
                }
                catch(e)
                {
                    GALogger.w("Load failed for 'sessions' store. Using empty store.");
                    GAStore.instance.sessionsStore = [];
                }

                try
                {
                    GAStore.instance.progressionStore = JSON.parse(gaStorage.getItem(GAStore.StringFormat(GAStore.KeyFormat, gameKey, GAStore.ProgressionStoreKey)));

                    if(!GAStore.instance.progressionStore)
                    {
                        GAStore.instance.storeItems = {};
                    }
                }
                catch(e)
                {
                    GALogger.w("Load failed for 'progression' store. Using empty store.");
                    GAStore.instance.progressionStore = [];
                }

                try
                {
                    GAStore.instance.storeItems = JSON.parse(gaStorage.getItem(GAStore.StringFormat(GAStore.KeyFormat, gameKey, GAStore.ItemsStoreKey)));

                    if(!GAStore.instance.storeItems)
                    {
                        GAStore.instance.storeItems = {};
                    }
                }
                catch(e)
                {
                    GALogger.w("Load failed for 'items' store. Using empty store.");
                    GAStore.instance.progressionStore = [];
                }
            }

            public static setItem(gameKey:string, key:string, value:string): void
            {
                var keyWithPrefix:string = GAStore.StringFormat(GAStore.KeyFormat, gameKey, key);

                if(!value)
                {
                    if(keyWithPrefix in GAStore.instance.storeItems)
                    {
                        delete GAStore.instance.storeItems[keyWithPrefix];
                    }
                }
                else
                {
                    GAStore.instance.storeItems[keyWithPrefix] = value;
                }
            }

            public static getItem(gameKey:string, key:string): string
            {
                var keyWithPrefix:string = GAStore.StringFormat(GAStore.KeyFormat, gameKey, key);
                if(keyWithPrefix in GAStore.instance.storeItems)
                {
                    return GAStore.instance.storeItems[keyWithPrefix] as string;
                }
                else
                {
                    return null;
                }
            }

            private static getStore(store:EGAStore): Array<{[key:string]: any}>
            {
                switch(store)
                {
                    case EGAStore.Events:
                    {
                        return GAStore.instance.eventsStore;
                    }

                    case EGAStore.Sessions:
                    {
                        return GAStore.instance.sessionsStore;
                    }

                    case EGAStore.Progression:
                    {
                        return GAStore.instance.progressionStore;
                    }

                    default:
                    {
                        GALogger.w("GAStore.getStore(): Cannot find store: " + store);
                        return null;
                    }
                }
            }
        }
    }

export module state
    {
        import GAValidator = gameanalytics.validators.GAValidator;
        import GAUtilities = gameanalytics.utilities.GAUtilities;
        import GALogger = gameanalytics.logging.GALogger;
        import GAStore = gameanalytics.store.GAStore;
        import GADevice = gameanalytics.device.GADevice;
        import EGAStore = gameanalytics.store.EGAStore;
        import EGAStoreArgsOperator = gameanalytics.store.EGAStoreArgsOperator;

        export class GAState
        {
            private static readonly CategorySdkError:string = "sdk_error";
            private static readonly MAX_CUSTOM_FIELDS_COUNT:number = 50;
            private static readonly MAX_CUSTOM_FIELDS_KEY_LENGTH:number = 64;
            private static readonly MAX_CUSTOM_FIELDS_VALUE_STRING_LENGTH:number = 256;

            public static readonly instance:GAState = new GAState();

            private constructor()
            {
                this._isEventSubmissionEnabled = true;
                this.isUnloading = false;
            }

            private userId:string;
            public static setUserId(userId:string): void
            {
                GAState.instance.userId = userId;
                GAState.cacheIdentifier();
            }

            private identifier:string;
            public static getIdentifier(): string
            {
                return GAState.instance.identifier;
            }

            private initialized:boolean;
            public static isInitialized(): boolean
            {
                return GAState.instance.initialized;
            }
            public static setInitialized(value:boolean): void
            {
                GAState.instance.initialized = value;
            }

            public sessionStart:number;
            public static getSessionStart(): number
            {
                return GAState.instance.sessionStart;
            }

            private sessionNum:number;
            public static getSessionNum(): number
            {
                return GAState.instance.sessionNum;
            }

            public isUnloading:boolean;

            private transactionNum:number;
            public static getTransactionNum(): number
            {
                return GAState.instance.transactionNum;
            }

            public sessionId:string;
            public static getSessionId(): string
            {
                return GAState.instance.sessionId;
            }

            private currentCustomDimension01:string;
            public static getCurrentCustomDimension01(): string
            {
                return GAState.instance.currentCustomDimension01;
            }

            private currentCustomDimension02:string;
            public static getCurrentCustomDimension02(): string
            {
                return GAState.instance.currentCustomDimension02;
            }

            private currentCustomDimension03:string;
            public static getCurrentCustomDimension03(): string
            {
                return GAState.instance.currentCustomDimension03;
            }

            private gameKey:string;
            public static getGameKey(): string
            {
                return GAState.instance.gameKey;
            }

            private gameSecret:string;
            public static getGameSecret(): string
            {
                return GAState.instance.gameSecret;
            }

            private availableCustomDimensions01:Array<string> = [];
            public static getAvailableCustomDimensions01(): Array<string>
            {
                return GAState.instance.availableCustomDimensions01;
            }
            public static setAvailableCustomDimensions01(value:Array<string>): void
            {
                // Validate
                if(!GAValidator.validateCustomDimensions(value))
                {
                    return;
                }
                GAState.instance.availableCustomDimensions01 = value;

                // validate current dimension values
                GAState.validateAndFixCurrentDimensions();

                GALogger.i("Set available custom01 dimension values: (" + GAUtilities.joinStringArray(value, ", ") + ")");
            }

            private availableCustomDimensions02:Array<string> = [];
            public static getAvailableCustomDimensions02(): Array<string>
            {
                return GAState.instance.availableCustomDimensions02;
            }
            public static setAvailableCustomDimensions02(value:Array<string>): void
            {
                // Validate
                if(!GAValidator.validateCustomDimensions(value))
                {
                    return;
                }
                GAState.instance.availableCustomDimensions02 = value;

                // validate current dimension values
                GAState.validateAndFixCurrentDimensions();

                GALogger.i("Set available custom02 dimension values: (" + GAUtilities.joinStringArray(value, ", ") + ")");
            }

            private availableCustomDimensions03:Array<string> = [];
            public static getAvailableCustomDimensions03(): Array<string>
            {
                return GAState.instance.availableCustomDimensions03;
            }
            public static setAvailableCustomDimensions03(value:Array<string>): void
            {
                // Validate
                if(!GAValidator.validateCustomDimensions(value))
                {
                    return;
                }
                GAState.instance.availableCustomDimensions03 = value;

                // validate current dimension values
                GAState.validateAndFixCurrentDimensions();

                GALogger.i("Set available custom03 dimension values: (" + GAUtilities.joinStringArray(value, ", ") + ")");
            }

            public currentGlobalCustomEventFields: { [key: string]: any } = {};

            private availableResourceCurrencies:Array<string> = [];
            public static getAvailableResourceCurrencies(): Array<string>
            {
                return GAState.instance.availableResourceCurrencies;
            }
            public static setAvailableResourceCurrencies(value:Array<string>): void
            {
                // Validate
                if(!GAValidator.validateResourceCurrencies(value))
                {
                    return;
                }
                GAState.instance.availableResourceCurrencies = value;

                GALogger.i("Set available resource currencies: (" + GAUtilities.joinStringArray(value, ", ") + ")");
            }

            private availableResourceItemTypes:Array<string> = [];
            public static getAvailableResourceItemTypes(): Array<string>
            {
                return GAState.instance.availableResourceItemTypes;
            }
            public static setAvailableResourceItemTypes(value:Array<string>): void
            {
                // Validate
                if(!GAValidator.validateResourceItemTypes(value))
                {
                    return;
                }
                GAState.instance.availableResourceItemTypes = value;

                GALogger.i("Set available resource item types: (" + GAUtilities.joinStringArray(value, ", ") + ")");
            }

            private build:string;
            public static getBuild(): string
            {
                return GAState.instance.build;
            }
            public static setBuild(value:string): void
            {
                GAState.instance.build = value;
                GALogger.i("Set build version: " + value);
            }

            private useManualSessionHandling:boolean;
            public static getUseManualSessionHandling(): boolean
            {
                return GAState.instance.useManualSessionHandling;
            }

            private _isEventSubmissionEnabled:boolean;
            public static isEventSubmissionEnabled(): boolean
            {
                return GAState.instance._isEventSubmissionEnabled;
            }

            public sdkConfigCached:{[key:string]: any};
            private configurations:{[key:string]: any} = {};
            private remoteConfigsIsReady:boolean;
            private remoteConfigsListeners:Array<{ onRemoteConfigsUpdated:() => void }> = [];
            private beforeUnloadListeners: Array<{ onBeforeUnload: () => void }> = [];
            public initAuthorized:boolean;
            public clientServerTimeOffset:number;
            public configsHash:string;

            public abId:string;
            public static getABTestingId(): string
            {
                return GAState.instance.abId;
            }
            public abVariantId:string;
            public static getABTestingVariantId(): string
            {
                return GAState.instance.abVariantId;
            }

            private defaultUserId:string;
            private setDefaultId(value:string): void
            {
                this.defaultUserId = !value ? "" : value;
                GAState.cacheIdentifier();
            }
            public static getDefaultId(): string
            {
                return GAState.instance.defaultUserId;
            }

            public sdkConfigDefault:{[key:string]: string} = {};

            public sdkConfig:{[key:string]: any} = {};
            public static getSdkConfig(): {[key:string]: any}
            {
                {
                    var first:string;
                    var count:number = 0;
                    for(let json in GAState.instance.sdkConfig)
                    {
                        if(count === 0)
                        {
                            first = json;
                        }
                        ++count;
                    }

                    if(first && count > 0)
                    {
                        return GAState.instance.sdkConfig;
                    }
                }
                {
                    var first:string;
                    var count:number = 0;
                    for(let json in GAState.instance.sdkConfigCached)
                    {
                        if(count === 0)
                        {
                            first = json;
                        }
                        ++count;
                    }

                    if(first && count > 0)
                    {
                        return GAState.instance.sdkConfigCached;
                    }
                }

                return GAState.instance.sdkConfigDefault;
            }

            private progressionTries:{[key:string]: number} = {};
            public static readonly DefaultUserIdKey:string = "default_user_id";
            public static readonly SessionNumKey:string = "session_num";
            public static readonly TransactionNumKey:string = "transaction_num";
            private static readonly Dimension01Key:string = "dimension01";
            private static readonly Dimension02Key:string = "dimension02";
            private static readonly Dimension03Key:string = "dimension03";
            public static readonly SdkConfigCachedKey:string = "sdk_config_cached";
            public static readonly LastUsedIdentifierKey: string = "last_used_identifier";

            public static isEnabled(): boolean
            {
                if (!GAState.instance.initAuthorized)
                {
                    return false;
                }
                else
                {
                    return true;
                }
            }

            public static setCustomDimension01(dimension:string): void
            {
                GAState.instance.currentCustomDimension01 = dimension;
                GAStore.setItem(GAState.getGameKey(), GAState.Dimension01Key, dimension);
                GALogger.i("Set custom01 dimension value: " + dimension);
            }

            public static setCustomDimension02(dimension:string): void
            {
                GAState.instance.currentCustomDimension02 = dimension;
                GAStore.setItem(GAState.getGameKey(), GAState.Dimension02Key, dimension);
                GALogger.i("Set custom02 dimension value: " + dimension);
            }

            public static setCustomDimension03(dimension:string): void
            {
                GAState.instance.currentCustomDimension03 = dimension;
                GAStore.setItem(GAState.getGameKey(), GAState.Dimension03Key, dimension);
                GALogger.i("Set custom03 dimension value: " + dimension);
            }

            public static incrementSessionNum(): void
            {
                var sessionNumInt:number = GAState.getSessionNum() + 1;
                GAState.instance.sessionNum = sessionNumInt;
            }

            public static incrementTransactionNum(): void
            {
                var transactionNumInt:number = GAState.getTransactionNum() + 1;
                GAState.instance.transactionNum = transactionNumInt;
            }

            public static incrementProgressionTries(progression:string): void
            {
                var tries:number = GAState.getProgressionTries(progression) + 1;
                GAState.instance.progressionTries[progression] = tries;

                // Persist
                var values:{[key:string]: any} = {};
                values["progression"] = progression;
                values["tries"] = tries;
                GAStore.insert(EGAStore.Progression, values, true, "progression");
            }

            public static getProgressionTries(progression:string): number
            {
                if(progression in GAState.instance.progressionTries)
                {
                    return GAState.instance.progressionTries[progression];
                }
                else
                {
                    return 0;
                }
            }

            public static clearProgressionTries(progression:string): void
            {
                if(progression in GAState.instance.progressionTries)
                {
                    delete GAState.instance.progressionTries[progression];
                }

                // Delete
                var parms:Array<[string, EGAStoreArgsOperator, string]> = [];
                parms.push(["progression", EGAStoreArgsOperator.Equal, progression]);
                GAStore.delete(EGAStore.Progression, parms);
            }

            public static setKeys(gameKey:string, gameSecret:string): void
            {
                GAState.instance.gameKey = gameKey;
                GAState.instance.gameSecret = gameSecret;
            }

            public static setManualSessionHandling(flag:boolean): void
            {
                GAState.instance.useManualSessionHandling = flag;
                GALogger.i("Use manual session handling: " + flag);
            }

            public static setEnabledEventSubmission(flag:boolean): void
            {
                GAState.instance._isEventSubmissionEnabled = flag;
            }

            public static getEventAnnotations(): {[key:string]: any}
            {
                var annotations:{[key:string]: any} = {};

                // ---- REQUIRED ---- //

                // collector event API version
                annotations["v"] = 2;
                // Event UUID
                annotations["event_uuid"] = GAUtilities.createGuid();
                // User identifier
                annotations["user_id"] = GAState.instance.identifier;

                // Client Timestamp (the adjusted timestamp)
                annotations["client_ts"] = GAState.getClientTsAdjusted();
                // SDK version
                annotations["sdk_version"] = GADevice.getRelevantSdkVersion();
                // Operation system version
                annotations["os_version"] = GADevice.osVersion;
                // Device make (hardcoded to apple)
                annotations["manufacturer"] = GADevice.deviceManufacturer;
                // Device version
                annotations["device"] = GADevice.deviceModel;
                // Browser version
                annotations["browser_version"] = GADevice.browserVersion;
                // Platform (operating system)
                annotations["platform"] = GADevice.buildPlatform;
                // Session identifier
                annotations["session_id"] = GAState.instance.sessionId;
                // Session number
                annotations[GAState.SessionNumKey] = GAState.instance.sessionNum;

                // type of connection the user is currently on (add if valid)
                var connection_type:string = GADevice.getConnectionType();
                if (GAValidator.validateConnectionType(connection_type))
                {
                    annotations["connection_type"] = connection_type;
                }

                if (GADevice.gameEngineVersion)
                {
                    annotations["engine_version"] = GADevice.gameEngineVersion;
                }

                // remote configs
                if(GAState.instance.configurations)
                {
                    var count:number = 0;
                    for(let _ in GAState.instance.configurations)
                    {
                        count++;
                        break;
                    }
                    if(count > 0)
                    {
                        annotations["configurations"] = GAState.instance.configurations;
                    }
                }

                // A/B testing
                if(GAState.instance.abId)
                {
                    annotations["ab_id"] = GAState.instance.abId;
                }
                if(GAState.instance.abVariantId)
                {
                    annotations["ab_variant_id"] = GAState.instance.abVariantId;
                }

                // ---- CONDITIONAL ---- //

                // App build version (use if not nil)
                if (GAState.instance.build)
                {
                    annotations["build"] = GAState.instance.build;
                }

                return annotations;
            }

            public static getSdkErrorEventAnnotations(): {[key:string]: any}
            {
                var annotations:{[key:string]: any} = {};

                // ---- REQUIRED ---- //

                // collector event API version
                annotations["v"] = 2;
                // Event UUID
                annotations["event_uuid"] = GAUtilities.createGuid();

                // Category
                annotations["category"] = GAState.CategorySdkError;
                // SDK version
                annotations["sdk_version"] = GADevice.getRelevantSdkVersion();
                // Operation system version
                annotations["os_version"] = GADevice.osVersion;
                // Device make (hardcoded to apple)
                annotations["manufacturer"] = GADevice.deviceManufacturer;
                // Device version
                annotations["device"] = GADevice.deviceModel;
                // Platform (operating system)
                annotations["platform"] = GADevice.buildPlatform;

                // type of connection the user is currently on (add if valid)
                var connection_type:string = GADevice.getConnectionType();
                if (GAValidator.validateConnectionType(connection_type))
                {
                    annotations["connection_type"] = connection_type;
                }

                if (GADevice.gameEngineVersion)
                {
                    annotations["engine_version"] = GADevice.gameEngineVersion;
                }

                return annotations;
            }

            public static getInitAnnotations(): {[key:string]: any}
            {
                var initAnnotations:{[key:string]: any} = {};

                if(!GAState.getIdentifier())
                {
                    GAState.cacheIdentifier();
                }

                GAStore.setItem(GAState.getGameKey(), GAState.LastUsedIdentifierKey, GAState.getIdentifier());

                initAnnotations["user_id"] = GAState.getIdentifier();

                // SDK version
                initAnnotations["sdk_version"] = GADevice.getRelevantSdkVersion();
                // Operation system version
                initAnnotations["os_version"] = GADevice.osVersion;

                // Platform (operating system)
                initAnnotations["platform"] = GADevice.buildPlatform;

                // Build
                if(GAState.getBuild())
                {
                    initAnnotations["build"] = GAState.getBuild();
                }
                else
                {
                    initAnnotations["build"] = null;
                }

                initAnnotations["session_num"] = GAState.getSessionNum();
                initAnnotations["random_salt"] = GAState.getSessionNum();

                return initAnnotations;
            }

            public static getClientTsAdjusted(): number
            {
                var clientTs:number = GAUtilities.timeIntervalSince1970();
                var clientTsAdjustedInteger:number = clientTs + GAState.instance.clientServerTimeOffset;

                if(GAValidator.validateClientTs(clientTsAdjustedInteger))
                {
                    return clientTsAdjustedInteger;
                }
                else
                {
                    return clientTs;
                }
            }

            public static sessionIsStarted(): boolean
            {
                return GAState.instance.sessionStart != 0;
            }

            private static cacheIdentifier(): void
            {
                if(GAState.instance.userId)
                {
                    GAState.instance.identifier = GAState.instance.userId;
                }
                else if(GAState.instance.defaultUserId)
                {
                    GAState.instance.identifier = GAState.instance.defaultUserId;
                }

                GALogger.d("identifier, {clean:" + GAState.instance.identifier + "}");
            }

            public static ensurePersistedStates(): void
            {
                // get and extract stored states
                if(GAStore.isStorageAvailable())
                {
                    GAStore.load(GAState.getGameKey());
                }

                // insert into GAState instance
                var instance:GAState = GAState.instance;

                instance.setDefaultId(GAStore.getItem(GAState.getGameKey(), GAState.DefaultUserIdKey) != null ? GAStore.getItem(GAState.getGameKey(), GAState.DefaultUserIdKey) : GAUtilities.createGuid());

                instance.sessionNum = GAStore.getItem(GAState.getGameKey(), GAState.SessionNumKey) != null ? Number(GAStore.getItem(GAState.getGameKey(), GAState.SessionNumKey)) : 0.0;

                instance.transactionNum = GAStore.getItem(GAState.getGameKey(), GAState.TransactionNumKey) != null ? Number(GAStore.getItem(GAState.getGameKey(), GAState.TransactionNumKey)) : 0.0;

                // restore dimension settings
                if(instance.currentCustomDimension01)
                {
                    GAStore.setItem(GAState.getGameKey(), GAState.Dimension01Key, instance.currentCustomDimension01);
                }
                else
                {
                    instance.currentCustomDimension01 = GAStore.getItem(GAState.getGameKey(), GAState.Dimension01Key) != null ? GAStore.getItem(GAState.getGameKey(), GAState.Dimension01Key) : "";
                    if(instance.currentCustomDimension01)
                    {
                        GALogger.d("Dimension01 found in cache: " + instance.currentCustomDimension01);
                    }
                }

                if(instance.currentCustomDimension02)
                {
                    GAStore.setItem(GAState.getGameKey(), GAState.Dimension02Key, instance.currentCustomDimension02);
                }
                else
                {
                    instance.currentCustomDimension02 = GAStore.getItem(GAState.getGameKey(), GAState.Dimension02Key) != null ? GAStore.getItem(GAState.getGameKey(), GAState.Dimension02Key) : "";
                    if(instance.currentCustomDimension02)
                    {
                        GALogger.d("Dimension02 found in cache: " + instance.currentCustomDimension02);
                    }
                }

                if(instance.currentCustomDimension03)
                {
                    GAStore.setItem(GAState.getGameKey(), GAState.Dimension03Key, instance.currentCustomDimension03);
                }
                else
                {
                    instance.currentCustomDimension03 = GAStore.getItem(GAState.getGameKey(), GAState.Dimension03Key) != null ? GAStore.getItem(GAState.getGameKey(), GAState.Dimension03Key) : "";
                    if(instance.currentCustomDimension03)
                    {
                        GALogger.d("Dimension03 found in cache: " + instance.currentCustomDimension03);
                    }
                }

                // get cached init call values
                var sdkConfigCachedString:string = GAStore.getItem(GAState.getGameKey(), GAState.SdkConfigCachedKey) != null ? GAStore.getItem(GAState.getGameKey(), GAState.SdkConfigCachedKey) : "";
                if (sdkConfigCachedString)
                {
                    // decode JSON
                    var sdkConfigCached = JSON.parse(GAUtilities.decode64(sdkConfigCachedString));
                    if (sdkConfigCached)
                    {
                        var lastUsedIdentifier:string = GAStore.getItem(GAState.getGameKey(), GAState.LastUsedIdentifierKey);
                        GALogger.d("lastUsedIdentifier=" + lastUsedIdentifier + ", GAState.getIdentifier()=" + GAState.getIdentifier());
                        if (lastUsedIdentifier != null && lastUsedIdentifier != GAState.getIdentifier())
                        {
                            GALogger.w("New identifier spotted compared to last one used, clearing cached configs hash!!");
                            if (sdkConfigCached["configs_hash"])
                            {
                                delete sdkConfigCached["configs_hash"];
                            }
                        }
                        instance.sdkConfigCached = sdkConfigCached;
                    }
                }

                {
                    var currentSdkConfig:{[key:string]: any} = GAState.getSdkConfig();
                    instance.configsHash = currentSdkConfig["configs_hash"] ? currentSdkConfig["configs_hash"] : "";
                    instance.abId = currentSdkConfig["ab_id"] ? currentSdkConfig["ab_id"] : "";
                    instance.abVariantId = currentSdkConfig["ab_variant_id"] ? currentSdkConfig["ab_variant_id"] : "";
                }

                var results_ga_progression:Array<{[key:string]: any}> = GAStore.select(EGAStore.Progression);

                if (results_ga_progression)
                {
                    for (let i = 0; i < results_ga_progression.length; ++i)
                    {
                        var result:{[key:string]: any} = results_ga_progression[i];
                        if (result)
                        {
                            instance.progressionTries[result["progression"] as string] = result["tries"] as number;
                        }
                    }
                }
            }

            public static calculateServerTimeOffset(serverTs:number): number
            {
                var clientTs:number = GAUtilities.timeIntervalSince1970();
                return serverTs - clientTs;
            }

            private static formatString(s:string, args:Array<string>): string
            {
                var formatted: string = s;
                for (var i = 0; i < args.length; i++)
                {
                    var regexp = new RegExp('\\{' + i + '\\}', 'gi');
                    formatted = formatted.replace(regexp, args[i]);
                }
                return formatted;
            }

            public static validateAndCleanCustomFields(fields:{[id:string]: any}, errorCallback:(baseMessage:string, message:string) => void=null): {[id:string]: any}
            {
                var result:{[id:string]: any} = {};

                if(fields)
                {
                    var count:number = 0;

                    for(var key in fields)
                    {
                        var value:any = fields[key];

                        if(!key || value === null || value === undefined)
                        {
                            var baseMessage:string = "validateAndCleanCustomFields: entry with key={0}, value={1} has been omitted because its key or value is null";
                            var message:string = GAState.formatString(baseMessage, [key, value]);
                            GALogger.w(message);
                            if (errorCallback)
                            {
                                errorCallback(baseMessage, message);
                            }
                        }
                        else if(count < GAState.MAX_CUSTOM_FIELDS_COUNT)
                        {
                            var regex = new RegExp("^[a-zA-Z0-9_]{1," + GAState.MAX_CUSTOM_FIELDS_KEY_LENGTH + "}$");
                            if(GAUtilities.stringMatch(key, regex))
                            {
                                var type = typeof value;
                                if(type === "string" || value instanceof String)
                                {
                                    var valueAsString:string = value as string;

                                    if(valueAsString.length <= GAState.MAX_CUSTOM_FIELDS_VALUE_STRING_LENGTH && valueAsString.length > 0)
                                    {
                                        result[key] = valueAsString;
                                        ++count;
                                    }
                                    else
                                    {
                                        var baseMessage: string = "validateAndCleanCustomFields: entry with key={0}, value={1} has been omitted because its value is an empty string or exceeds the max number of characters (" + GAState.MAX_CUSTOM_FIELDS_VALUE_STRING_LENGTH + ")";
                                        var message: string = GAState.formatString(baseMessage, [key, value]);
                                        GALogger.w(message);
                                        if (errorCallback) {
                                            errorCallback(baseMessage, message);
                                        }
                                    }
                                }
                                else if(type === "number" || value instanceof Number)
                                {
                                    var valueAsNumber:number = value as number;

                                    result[key] = valueAsNumber;
                                    ++count;
                                }
                                else
                                {
                                    var baseMessage: string = "validateAndCleanCustomFields: entry with key={0}, value={1} has been omitted because its value is not a string or number";
                                    var message: string = GAState.formatString(baseMessage, [key, value]);
                                    GALogger.w(message);
                                    if (errorCallback) {
                                        errorCallback(baseMessage, message);
                                    }
                                }
                            }
                            else
                            {
                                var baseMessage: string = "validateAndCleanCustomFields: entry with key={0}, value={1} has been omitted because its key contains illegal character, is empty or exceeds the max number of characters (" + GAState.MAX_CUSTOM_FIELDS_KEY_LENGTH + ")";
                                var message: string = GAState.formatString(baseMessage, [key, value]);
                                GALogger.w(message);
                                if (errorCallback) {
                                    errorCallback(baseMessage, message);
                                }
                            }
                        }
                        else
                        {
                            var baseMessage: string = "validateAndCleanCustomFields: entry with key={0}, value={1} has been omitted because it exceeds the max number of custom fields (" + GAState.MAX_CUSTOM_FIELDS_COUNT + ")";
                            var message: string = GAState.formatString(baseMessage, [key, value]);
                            GALogger.w(message);
                            if (errorCallback) {
                                errorCallback(baseMessage, message);
                            }
                        }
                    }
                }

                return result;
            }

            public static validateAndFixCurrentDimensions(): void
            {
                // validate that there are no current dimension01 not in list
                if (!GAValidator.validateDimension01(GAState.getCurrentCustomDimension01(), GAState.getAvailableCustomDimensions01()))
                {
                    GALogger.d("Invalid dimension01 found in variable. Setting to nil. Invalid dimension: " + GAState.getCurrentCustomDimension01());
                    GAState.setCustomDimension01("");
                }
                // validate that there are no current dimension02 not in list
                if (!GAValidator.validateDimension02(GAState.getCurrentCustomDimension02(), GAState.getAvailableCustomDimensions02()))
                {
                    GALogger.d("Invalid dimension02 found in variable. Setting to nil. Invalid dimension: " + GAState.getCurrentCustomDimension02());
                    GAState.setCustomDimension02("");
                }
                // validate that there are no current dimension03 not in list
                if (!GAValidator.validateDimension03(GAState.getCurrentCustomDimension03(), GAState.getAvailableCustomDimensions03()))
                {
                    GALogger.d("Invalid dimension03 found in variable. Setting to nil. Invalid dimension: " + GAState.getCurrentCustomDimension03());
                    GAState.setCustomDimension03("");
                }
            }

            public static getConfigurationStringValue(key:string, defaultValue:string):string
            {
                if(GAState.instance.configurations[key])
                {
                    return GAState.instance.configurations[key].toString();
                }
                else
                {
                    return defaultValue;
                }
            }

            public static isRemoteConfigsReady():boolean
            {
                return GAState.instance.remoteConfigsIsReady;
            }

            public static addRemoteConfigsListener(listener:{ onRemoteConfigsUpdated:() => void }):void
            {
                if(GAState.instance.remoteConfigsListeners.indexOf(listener) < 0)
                {
                    GAState.instance.remoteConfigsListeners.push(listener);
                }
            }

            public static removeRemoteConfigsListener(listener:{ onRemoteConfigsUpdated:() => void }):void
            {
                var index = GAState.instance.remoteConfigsListeners.indexOf(listener);
                if(index > -1)
                {
                    GAState.instance.remoteConfigsListeners.splice(index, 1);
                }
            }

            public static getRemoteConfigsContentAsString():string
            {
                return JSON.stringify(GAState.instance.configurations);
            }

            public static populateConfigurations(sdkConfig:{[key:string]: any}):void
            {
                var configurations:any[] = sdkConfig["configs"];

                if(configurations)
                {
                    GAState.instance.configurations = {};
                    for(let i = 0; i < configurations.length; ++i)
                    {
                        var configuration:{[key:string]: any} = configurations[i];

                        if(configuration)
                        {
                            var key:string = configuration["key"];
                            var value:any = configuration["value"];
                            var start_ts:number = configuration["start_ts"] ? configuration["start_ts"] : Number.MIN_VALUE;
                            var end_ts:number = configuration["end_ts"] ? configuration["end_ts"] : Number.MAX_VALUE;

                            var client_ts_adjusted:number = GAState.getClientTsAdjusted();

                            if(key && value && client_ts_adjusted > start_ts && client_ts_adjusted < end_ts)
                            {
                                GAState.instance.configurations[key] = value;
                                GALogger.d("configuration added: " + JSON.stringify(configuration));
                            }
                        }
                    }
                }
                GAState.instance.remoteConfigsIsReady = true;

                var listeners:Array<{ onRemoteConfigsUpdated:() => void }> = GAState.instance.remoteConfigsListeners;

                for(let i = 0; i < listeners.length; ++i)
                {
                    if(listeners[i])
                    {
                        listeners[i].onRemoteConfigsUpdated();
                    }
                }
            }

            public static addOnBeforeUnloadListener(listener: { onBeforeUnload: () => void }): void
            {
                if (GAState.instance.beforeUnloadListeners.indexOf(listener) < 0)
                {
                    GAState.instance.beforeUnloadListeners.push(listener);
                }
            }

            public static removeOnBeforeUnloadListener(listener: { onBeforeUnload: () => void }): void
            {
                var index = GAState.instance.beforeUnloadListeners.indexOf(listener);
                if (index > -1)
                {
                    GAState.instance.beforeUnloadListeners.splice(index, 1);
                }
            }

            public static notifyBeforeUnloadListeners(): void
            {
                var listeners: Array<{ onBeforeUnload: () => void }> = GAState.instance.beforeUnloadListeners;

                for (let i = 0; i < listeners.length; ++i)
                {
                    if (listeners[i])
                    {
                        listeners[i].onBeforeUnload();
                    }
                }
            }
        }
    }

export module tasks
    {
        import GAUtilities = gameanalytics.utilities.GAUtilities;
        import GALogger = gameanalytics.logging.GALogger;

        export class SdkErrorTask
        {
            private static readonly MaxCount:number = 10;
            private static readonly countMap:{[key:string]: number} = {};
            private static readonly timestampMap:{[key:string]: Date} = {};

            public static execute(url:string, type:string, payloadData:string, secretKey:string): void
            {
                var now:Date = new Date();

                if(!SdkErrorTask.timestampMap[type])
                {
                    SdkErrorTask.timestampMap[type] = now;
                }
                if(!SdkErrorTask.countMap[type])
                {
                    SdkErrorTask.countMap[type] = 0;
                }
                var diff:number = now.getTime() - SdkErrorTask.timestampMap[type].getTime();
                var diffSeconds:number = diff / 1000;
                if(diffSeconds >= 3600)
                {
                    SdkErrorTask.timestampMap[type] = now;
                    SdkErrorTask.countMap[type] = 0;
                }

                if(SdkErrorTask.countMap[type] >= SdkErrorTask.MaxCount)
                {
                    return;
                }

                var hashHmac:string = GAUtilities.getHmac(secretKey, payloadData);

                var request:XMLHttpRequest = new XMLHttpRequest();

                request.onreadystatechange = () => {
                    if(request.readyState === 4)
                    {
                        if(!request.responseText)
                        {
                            GALogger.d("sdk error failed. Might be no connection. Description: " + request.statusText + ", Status code: " + request.status);
                            return;
                        }

                        if(request.status != 200)
                        {
                            GALogger.w("sdk error failed. response code not 200. status code: " + request.status + ", description: " + request.statusText + ", body: " + request.responseText);
                            return;
                        }
                        else
                        {
                            SdkErrorTask.countMap[type] = SdkErrorTask.countMap[type] + 1;
                        }
                    }
                };

                request.open("POST", url, true);
                request.setRequestHeader("Content-Type", "application/json");
                request.setRequestHeader("Authorization", hashHmac);

                try
                {
                    request.send(payloadData);
                }
                catch(e)
                {
                    console.error(e);
                }
            }
        }
    }

export module http
    {
        import GAState = gameanalytics.state.GAState;
        import GALogger = gameanalytics.logging.GALogger;
        import GAUtilities = gameanalytics.utilities.GAUtilities;
        import GAValidator = gameanalytics.validators.GAValidator;
        import SdkErrorTask = gameanalytics.tasks.SdkErrorTask;
        import EGASdkErrorCategory = gameanalytics.events.EGASdkErrorCategory;
        import EGASdkErrorArea = gameanalytics.events.EGASdkErrorArea;
        import EGASdkErrorAction = gameanalytics.events.EGASdkErrorAction;
        import EGASdkErrorParameter = gameanalytics.events.EGASdkErrorParameter;

        export class GAHTTPApi
        {
            public static readonly instance:GAHTTPApi = new GAHTTPApi();
            private protocol:string;
            private hostName:string;
            private version:string;
            private remoteConfigsVersion:string;
            private baseUrl:string;
            private remoteConfigsBaseUrl:string;
            private initializeUrlPath:string;
            private eventsUrlPath:string;
            private useGzip:boolean;
            private static readonly MAX_ERROR_MESSAGE_LENGTH:number = 256;

            private constructor()
            {
                // base url settings
                this.protocol = "https";
                this.hostName = "api.gameanalytics.com";
                this.version = "v2";
                this.remoteConfigsVersion = "v1";

                // create base url
                this.baseUrl = this.protocol + "://" + this.hostName + "/" + this.version;
                this.remoteConfigsBaseUrl = this.protocol + "://" + this.hostName + "/remote_configs/" + this.remoteConfigsVersion;

                this.initializeUrlPath = "init";
                this.eventsUrlPath = "events";

                this.useGzip = false;
            }

            public requestInit(configsHash:string, callback:(response:EGAHTTPApiResponse, json:{[key:string]: any}) => void): void
            {
                var gameKey:string = GAState.getGameKey();

                // Generate URL
                var url:string = this.remoteConfigsBaseUrl + "/" + this.initializeUrlPath + "?game_key=" + gameKey + "&interval_seconds=0&configs_hash=" + configsHash;
                GALogger.d("Sending 'init' URL: " + url);

                var initAnnotations:{[key:string]: any} = GAState.getInitAnnotations();

                // make JSON string from data
                var JSONstring:string = JSON.stringify(initAnnotations);

                if(!JSONstring)
                {
                    callback(EGAHTTPApiResponse.JsonEncodeFailed, null);
                    return;
                }

                var payloadData:string = this.createPayloadData(JSONstring, this.useGzip);
                var extraArgs:Array<string> = [];
                extraArgs.push(JSONstring);
                GAHTTPApi.sendRequest(url, payloadData, extraArgs, this.useGzip, GAHTTPApi.initRequestCallback, callback);
            }

            public sendEventsInArray(eventArray:Array<{[key:string]: any}>, requestId:string, callback:(response:EGAHTTPApiResponse, json:{[key:string]: any}, requestId:string, eventCount:number) => void): void
            {
                if(eventArray.length == 0)
                {
                    GALogger.d("sendEventsInArray called with missing eventArray");
                    return;
                }

                var gameKey:string = GAState.getGameKey();

                // Generate URL
                var url:string = this.baseUrl + "/" + gameKey + "/" + this.eventsUrlPath;
                GALogger.d("Sending 'events' URL: " + url);

                // make JSON string from data
                var JSONstring:string = JSON.stringify(eventArray);

                if(!JSONstring)
                {
                    GALogger.d("sendEventsInArray JSON encoding failed of eventArray");
                    callback(EGAHTTPApiResponse.JsonEncodeFailed, null, requestId, eventArray.length);
                    return;
                }

                var payloadData = this.createPayloadData(JSONstring, this.useGzip);
                var extraArgs:Array<string> = [];
                extraArgs.push(JSONstring);
                extraArgs.push(requestId);
                extraArgs.push(eventArray.length.toString());
                GAHTTPApi.sendRequest(url, payloadData, extraArgs, this.useGzip, GAHTTPApi.sendEventInArrayRequestCallback, callback);
            }

            public sendSdkErrorEvent(category:EGASdkErrorCategory, area:EGASdkErrorArea, action:EGASdkErrorAction, parameter:EGASdkErrorParameter, reason:string, gameKey:string, secretKey:string): void
            {
                if(!GAState.isEventSubmissionEnabled())
                {
                    return;
                }

                // Validate
                if (!GAValidator.validateSdkErrorEvent(gameKey, secretKey, category, area, action))
                {
                    return;
                }

                // Generate URL
                var url:string = this.baseUrl + "/" + gameKey + "/" + this.eventsUrlPath;
                GALogger.d("Sending 'events' URL: " + url);

                var payloadJSONString:string = "";
                var errorType:string = ""

                var json:{[key:string]: any} = GAState.getSdkErrorEventAnnotations();

                var categoryString:string = GAHTTPApi.sdkErrorCategoryString(category);
                json["error_category"] = categoryString;
                errorType += categoryString;

                var areaString:string = GAHTTPApi.sdkErrorAreaString(area);
                json["error_area"] = areaString;
                errorType += ":" + areaString;

                var actionString:string = GAHTTPApi.sdkErrorActionString(action);
                json["error_action"] = actionString;

                var parameterString:string = GAHTTPApi.sdkErrorParameterString(parameter);
                if(parameterString.length > 0)
                {
                    json["error_parameter"] = parameterString;
                }

                if(reason.length > 0)
                {
                    var reasonTrimmed = reason;
                    if(reason.length > GAHTTPApi.MAX_ERROR_MESSAGE_LENGTH)
                    {
                        var reasonTrimmed = reason.substring(0, GAHTTPApi.MAX_ERROR_MESSAGE_LENGTH);
                    }
                    json["reason"] = reasonTrimmed;
                }

                var eventArray:Array<{[key:string]: any}> = [];
                eventArray.push(json);
                payloadJSONString = JSON.stringify(eventArray);

                if(!payloadJSONString)
                {
                    GALogger.w("sendSdkErrorEvent: JSON encoding failed.");
                    return;
                }

                GALogger.d("sendSdkErrorEvent json: " + payloadJSONString);
                SdkErrorTask.execute(url, errorType, payloadJSONString, secretKey);
            }

            private static sendEventInArrayRequestCallback(request:XMLHttpRequest, url:string, callback:(response:EGAHTTPApiResponse, json:{[key:string]: any}, requestId:string, eventCount:number) => void, extra:Array<string> = null): void
            {
                var authorization:string = extra[0];
                var JSONstring:string = extra[1];
                var requestId:string = extra[2];
                var eventCount:number = parseInt(extra[3]);
                var body:string = "";
                var responseCode:number = 0;

                body = request.responseText;
                responseCode = request.status;

                GALogger.d("events request content: " + body);

                var requestResponseEnum:EGAHTTPApiResponse = GAHTTPApi.instance.processRequestResponse(responseCode, request.statusText, body, "Events");

                // if not 200 result
                if(requestResponseEnum != EGAHTTPApiResponse.Ok && requestResponseEnum != EGAHTTPApiResponse.Created && requestResponseEnum != EGAHTTPApiResponse.BadRequest)
                {
                    GALogger.d("Failed events Call. URL: " + url + ", Authorization: " + authorization + ", JSONString: " + JSONstring);
                    callback(requestResponseEnum, null, requestId, eventCount);
                    return;
                }

                // decode JSON
                var requestJsonDict:{[key:string]: any} = body ? JSON.parse(body) : {};

                if(requestJsonDict == null)
                {
                    callback(EGAHTTPApiResponse.JsonDecodeFailed, null, requestId, eventCount);
                    GAHTTPApi.instance.sendSdkErrorEvent(EGASdkErrorCategory.Http, EGASdkErrorArea.EventsHttp, EGASdkErrorAction.FailHttpJsonDecode, EGASdkErrorParameter.Undefined, body, GAState.getGameKey(), GAState.getGameSecret());
                    return;
                }

                // print reason if bad request
                if(requestResponseEnum == EGAHTTPApiResponse.BadRequest)
                {
                    GALogger.d("Failed Events Call. Bad request. Response: " + JSON.stringify(requestJsonDict));
                }

                // return response
                callback(requestResponseEnum, requestJsonDict, requestId, eventCount);
            }

            private static sendRequest(url:string, payloadData:string, extraArgs:Array<string>, gzip:boolean, callback:(request:XMLHttpRequest, url:string, callback:(response:EGAHTTPApiResponse, json:{[key:string]: any}, requestId:string, eventCount:number) => void, extra:Array<string>) => void, callback2:(response:EGAHTTPApiResponse, json:{[key:string]: any}, requestId:string, eventCount:number) => void): void
            {
                var request:XMLHttpRequest = new XMLHttpRequest();

                // create authorization hash
                var key:string = GAState.getGameSecret();
                var authorization:string = GAUtilities.getHmac(key, payloadData);

                var args:Array<string> = [];
                args.push(authorization);

                for(let s in extraArgs)
                {
                    args.push(extraArgs[s]);
                }

                request.onreadystatechange = () => {
                    if(request.readyState === 4)
                    {
                        callback(request, url, callback2, args);
                    }
                };

                request.open("POST", url, true);
                request.setRequestHeader("Content-Type", "application/json");

                request.setRequestHeader("Authorization", authorization);

                if(gzip)
                {
                    throw new Error("gzip not supported");
                    //request.setRequestHeader("Content-Encoding", "gzip");
                }

                try
                {
                    request.send(payloadData);
                }
                catch(e)
                {
                    console.error(e.stack);
                }
            }

            private static initRequestCallback(request:XMLHttpRequest, url:string, callback:(response:EGAHTTPApiResponse, json:{[key:string]: any}, requestId:string, eventCount:number) => void, extra:Array<string> = null): void
            {
                var authorization:string = extra[0];
                var JSONstring:string = extra[1];
                var body:string = "";
                var responseCode:number = 0;

                body = request.responseText;
                responseCode = request.status;

                // process the response
                GALogger.d("init request content : " + body + ", JSONstring: " + JSONstring);

                var requestJsonDict:{[key:string]: any} = body ? JSON.parse(body) : {};
                var requestResponseEnum:EGAHTTPApiResponse = GAHTTPApi.instance.processRequestResponse(responseCode, request.statusText, body, "Init");

                // if not 200 result
                if(requestResponseEnum != EGAHTTPApiResponse.Ok && requestResponseEnum != EGAHTTPApiResponse.Created && requestResponseEnum != EGAHTTPApiResponse.BadRequest)
                {
                    GALogger.d("Failed Init Call. URL: " + url + ", Authorization: " + authorization + ", JSONString: " + JSONstring);
                    callback(requestResponseEnum, null, "", 0);
                    return;
                }

                if(requestJsonDict == null)
                {
                    GALogger.d("Failed Init Call. Json decoding failed");
                    callback(EGAHTTPApiResponse.JsonDecodeFailed, null, "", 0);
                    GAHTTPApi.instance.sendSdkErrorEvent(EGASdkErrorCategory.Http, EGASdkErrorArea.InitHttp, EGASdkErrorAction.FailHttpJsonDecode, EGASdkErrorParameter.Undefined, body, GAState.getGameKey(), GAState.getGameSecret());
                    return;
                }

                // print reason if bad request
                if(requestResponseEnum === EGAHTTPApiResponse.BadRequest)
                {
                    GALogger.d("Failed Init Call. Bad request. Response: " + JSON.stringify(requestJsonDict));
                    // return bad request result
                    callback(requestResponseEnum, null, "", 0);
                    return;
                }

                // validate Init call values
                var validatedInitValues:{[key:string]: any} = GAValidator.validateAndCleanInitRequestResponse(requestJsonDict, requestResponseEnum === EGAHTTPApiResponse.Created);

                if(!validatedInitValues)
                {
                    callback(EGAHTTPApiResponse.BadResponse, null, "", 0);
                    return;
                }

                // all ok
                callback(requestResponseEnum, validatedInitValues, "", 0);
            }

            private createPayloadData(payload:string, gzip:boolean): string
            {
                var payloadData:string;

                if(gzip)
                {
                    // payloadData = GAUtilities.GzipCompress(payload);
                    // GALogger.D("Gzip stats. Size: " + Encoding.UTF8.GetBytes(payload).Length + ", Compressed: " + payloadData.Length + ", Content: " + payload);
                    throw new Error("gzip not supported");
                }
                else
                {
                    payloadData = payload;
                }

                return payloadData;
            }

            private processRequestResponse(responseCode:number, responseMessage:string, body:string, requestId:string): EGAHTTPApiResponse
            {
                // if no result - often no connection
                if(!body)
                {
                    GALogger.d(requestId + " request. failed. Might be no connection. Description: " + responseMessage + ", Status code: " + responseCode);
                    return EGAHTTPApiResponse.NoResponse;
                }

                // ok
                if (responseCode === 200)
                {
                    return EGAHTTPApiResponse.Ok;
                }
                // created
                if (responseCode === 201)
                {
                    return EGAHTTPApiResponse.Created;
                }

                // 401 can return 0 status
                if (responseCode === 0 || responseCode === 401)
                {
                    GALogger.d(requestId + " request. 401 - Unauthorized.");
                    return EGAHTTPApiResponse.Unauthorized;
                }

                if (responseCode === 400)
                {
                    GALogger.d(requestId + " request. 400 - Bad Request.");
                    return EGAHTTPApiResponse.BadRequest;
                }

                if (responseCode === 500)
                {
                    GALogger.d(requestId + " request. 500 - Internal Server Error.");
                    return EGAHTTPApiResponse.InternalServerError;
                }

                return EGAHTTPApiResponse.UnknownResponseCode;
            }

            private static sdkErrorCategoryString(value:EGASdkErrorCategory): string
            {
                switch (value)
                {
                    case EGASdkErrorCategory.EventValidation:
                        return "event_validation";
                    case EGASdkErrorCategory.Database:
                        return "db";
                    case EGASdkErrorCategory.Init:
                        return "init";
                    case EGASdkErrorCategory.Http:
                        return "http";
                    case EGASdkErrorCategory.Json:
                        return "json";
                    default:
                        break;
                }
                return "";
            }

            private static sdkErrorAreaString(value:EGASdkErrorArea): string
            {
                switch (value)
                {
                    case EGASdkErrorArea.BusinessEvent:
                        return "business";
                    case EGASdkErrorArea.ResourceEvent:
                        return "resource";
                    case EGASdkErrorArea.ProgressionEvent:
                        return "progression";
                    case EGASdkErrorArea.DesignEvent:
                        return "design";
                    case EGASdkErrorArea.ErrorEvent:
                        return "error";
                    case EGASdkErrorArea.InitHttp:
                        return "init_http";
                    case EGASdkErrorArea.EventsHttp:
                        return "events_http";
                    case EGASdkErrorArea.ProcessEvents:
                        return "process_events";
                    case EGASdkErrorArea.AddEventsToStore:
                        return "add_events_to_store";
                    default:
                        break;
                }
                return "";
            }

            private static sdkErrorActionString(value:EGASdkErrorAction): string
            {
                switch (value)
                {
                    case EGASdkErrorAction.InvalidCurrency:
                        return "invalid_currency";
                    case EGASdkErrorAction.InvalidShortString:
                        return "invalid_short_string";
                    case EGASdkErrorAction.InvalidEventPartLength:
                        return "invalid_event_part_length";
                    case EGASdkErrorAction.InvalidEventPartCharacters:
                        return "invalid_event_part_characters";
                    case EGASdkErrorAction.InvalidStore:
                        return "invalid_store";
                    case EGASdkErrorAction.InvalidFlowType:
                        return "invalid_flow_type";
                    case EGASdkErrorAction.StringEmptyOrNull:
                        return "string_empty_or_null";
                    case EGASdkErrorAction.NotFoundInAvailableCurrencies:
                        return "not_found_in_available_currencies";
                    case EGASdkErrorAction.InvalidAmount:
                        return "invalid_amount";
                    case EGASdkErrorAction.NotFoundInAvailableItemTypes:
                        return "not_found_in_available_item_types";
                    case EGASdkErrorAction.WrongProgressionOrder:
                        return "wrong_progression_order";
                    case EGASdkErrorAction.InvalidEventIdLength:
                        return "invalid_event_id_length";
                    case EGASdkErrorAction.InvalidEventIdCharacters:
                        return "invalid_event_id_characters";
                    case EGASdkErrorAction.InvalidProgressionStatus:
                        return "invalid_progression_status";
                    case EGASdkErrorAction.InvalidSeverity:
                        return "invalid_severity";
                    case EGASdkErrorAction.InvalidLongString:
                        return "invalid_long_string";
                    case EGASdkErrorAction.DatabaseTooLarge:
                        return "db_too_large";
                    case EGASdkErrorAction.DatabaseOpenOrCreate:
                        return "db_open_or_create";
                    case EGASdkErrorAction.JsonError:
                        return "json_error";
                    case EGASdkErrorAction.FailHttpJsonDecode:
                        return "fail_http_json_decode";
                    case EGASdkErrorAction.FailHttpJsonEncode:
                        return "fail_http_json_encode";
                    default:
                        break;
                }
                return "";
            }

            private static sdkErrorParameterString(value:EGASdkErrorParameter): string
            {
                switch (value)
                {
                    case EGASdkErrorParameter.Currency:
                        return "currency";
                    case EGASdkErrorParameter.CartType:
                        return "cart_type";
                    case EGASdkErrorParameter.ItemType:
                        return "item_type";
                    case EGASdkErrorParameter.ItemId:
                        return "item_id";
                    case EGASdkErrorParameter.Store:
                        return "store";
                    case EGASdkErrorParameter.FlowType:
                        return "flow_type";
                    case EGASdkErrorParameter.Amount:
                        return "amount";
                    case EGASdkErrorParameter.Progression01:
                        return "progression01";
                    case EGASdkErrorParameter.Progression02:
                        return "progression02";
                    case EGASdkErrorParameter.Progression03:
                        return "progression03";
                    case EGASdkErrorParameter.EventId:
                        return "event_id";
                    case EGASdkErrorParameter.ProgressionStatus:
                        return "progression_status";
                    case EGASdkErrorParameter.Severity:
                        return "severity";
                    case EGASdkErrorParameter.Message:
                        return "message";
                    default:
                        break;
                }
                return "";
            }
        }
    }

export module events
    {
        import GAStore = gameanalytics.store.GAStore;
        import EGAStore = gameanalytics.store.EGAStore;
        import EGAStoreArgsOperator = gameanalytics.store.EGAStoreArgsOperator;
        import GAState = gameanalytics.state.GAState;
        import GALogger = gameanalytics.logging.GALogger;
        import GAUtilities = gameanalytics.utilities.GAUtilities;
        import EGAHTTPApiResponse = gameanalytics.http.EGAHTTPApiResponse;
        import GAHTTPApi = gameanalytics.http.GAHTTPApi;
        import GAValidator = gameanalytics.validators.GAValidator;
        import ValidationResult = gameanalytics.validators.ValidationResult;

        export class GAEvents
        {
            private static readonly CategorySessionStart:string = "user";
            private static readonly CategorySessionEnd:string = "session_end";
            private static readonly CategoryDesign:string = "design";
            private static readonly CategoryBusiness:string = "business";
            private static readonly CategoryProgression:string = "progression";
            private static readonly CategoryResource:string = "resource";
            private static readonly CategoryError:string = "error";
            private static readonly CategoryAds:string = "ads";
            private static readonly MaxEventCount:number = 500;

            private static readonly MAX_ERROR_COUNT:number = 10;
            private static readonly countMap: { [key: string]: number } = {};
            private static readonly timestampMap: { [key: string]: Date } = {};

            private constructor()
            {

            }

            private static customEventFieldsErrorCallback(baseMessage:string, message:string): void
            {
                if (!GAState.isEventSubmissionEnabled()) {
                    return;
                }

                var now: Date = new Date();

                if (!GAEvents.timestampMap[baseMessage]) {
                    GAEvents.timestampMap[baseMessage] = now;
                }
                if (!GAEvents.countMap[baseMessage]) {
                    GAEvents.countMap[baseMessage] = 0;
                }
                var diff: number = now.getTime() - GAEvents.timestampMap[baseMessage].getTime();
                var diffSeconds: number = diff / 1000;
                if (diffSeconds >= 3600) {
                    GAEvents.timestampMap[baseMessage] = now;
                    GAEvents.countMap[baseMessage] = 0;
                }

                if (GAEvents.countMap[baseMessage] >= GAEvents.MAX_ERROR_COUNT) {
                    return;
                }

                gameanalytics.threading.GAThreading.performTaskOnGAThread(() => {
                    GAEvents.addErrorEvent(EGAErrorSeverity.Warning, message, null, true);
                    GAEvents.countMap[baseMessage] = GAEvents.countMap[baseMessage] + 1;
                });
            }

            public static addSessionStartEvent(): void
            {
                if(!GAState.isEventSubmissionEnabled())
                {
                    return;
                }

                // Event specific data
                var eventDict:{[key:string]: any} = {};
                eventDict["category"] = GAEvents.CategorySessionStart;

                // Increment session number  and persist
                GAState.incrementSessionNum();
                GAStore.setItem(GAState.getGameKey(), GAState.SessionNumKey, GAState.getSessionNum().toString());

                // Add custom dimensions
                GAEvents.addDimensionsToEvent(eventDict);

                var fieldsToUse: { [id: string]: any } = GAState.instance.currentGlobalCustomEventFields;

                GAEvents.addCustomFieldsToEvent(eventDict, GAState.validateAndCleanCustomFields(fieldsToUse, GAEvents.customEventFieldsErrorCallback));

                // Add to store
                GAEvents.addEventToStore(eventDict);

                // Log
                GALogger.i("Add SESSION START event");

                // Send event right away
                GAEvents.processEvents(GAEvents.CategorySessionStart, false);
            }

            public static addSessionEndEvent(): void
            {
                if(!GAState.isEventSubmissionEnabled())
                {
                    return;
                }

                var session_start_ts:number = GAState.getSessionStart();
                var client_ts_adjusted:number = GAState.getClientTsAdjusted();
                var sessionLength:number = client_ts_adjusted - session_start_ts;

                if(sessionLength < 0)
                {
                    // Should never happen.
                    // Could be because of edge cases regarding time altering on device.
                    GALogger.w("Session length was calculated to be less then 0. Should not be possible. Resetting to 0.");
                    sessionLength = 0;
                }

                // Event specific data
                var eventDict:{[key:string]: any} = {};
                eventDict["category"] = GAEvents.CategorySessionEnd;
                eventDict["length"] = sessionLength;

                // Add custom dimensions
                GAEvents.addDimensionsToEvent(eventDict);

                var fieldsToUse: { [id: string]: any } = GAState.instance.currentGlobalCustomEventFields;

                GAEvents.addCustomFieldsToEvent(eventDict, GAState.validateAndCleanCustomFields(fieldsToUse, GAEvents.customEventFieldsErrorCallback));

                // Add to store
                GAEvents.addEventToStore(eventDict);

                // Log
                GALogger.i("Add SESSION END event.");

                // Send all event right away
                GAEvents.processEvents("", false);
            }

            public static addBusinessEvent(currency:string, amount:number, itemType:string, itemId:string, cartType:string = null, fields:{[id:string]: any}, mergeFields:boolean): void
            {
                if(!GAState.isEventSubmissionEnabled())
                {
                    return;
                }

                // Validate event params
                var validationResult:ValidationResult = GAValidator.validateBusinessEvent(currency, amount, cartType, itemType, itemId);
                if (validationResult != null)
                {
                    GAHTTPApi.instance.sendSdkErrorEvent(validationResult.category, validationResult.area, validationResult.action, validationResult.parameter, validationResult.reason, GAState.getGameKey(), GAState.getGameSecret());
                    return;
                }

                // Create empty eventData
                var eventDict:{[key:string]: any} = {};

                // Increment transaction number and persist
                GAState.incrementTransactionNum();
                GAStore.setItem(GAState.getGameKey(), GAState.TransactionNumKey, GAState.getTransactionNum().toString());

                // Required
                eventDict["event_id"] = itemType + ":" + itemId;
                eventDict["category"] = GAEvents.CategoryBusiness;
                eventDict["currency"] = currency;
                eventDict["amount"] = amount;
                eventDict[GAState.TransactionNumKey] = GAState.getTransactionNum();

                // Optional
                if (cartType)
                {
                    eventDict["cart_type"] = cartType;
                }

                // Add custom dimensions
                GAEvents.addDimensionsToEvent(eventDict);

                var fieldsToUse: { [id: string]: any } = {};
                if(fields && Object.keys(fields).length > 0)
                {
                    for (let key in fields)
                    {
                        fieldsToUse[key] = fields[key];
                    }
                }
                else
                {
                    for (let key in GAState.instance.currentGlobalCustomEventFields) {
                        fieldsToUse[key] = GAState.instance.currentGlobalCustomEventFields[key];
                    }
                }

                if (mergeFields && fields && Object.keys(fields).length > 0)
                {
                    for (let key in GAState.instance.currentGlobalCustomEventFields)
                    {
                        if (!fieldsToUse[key])
                        {
                            fieldsToUse[key] = GAState.instance.currentGlobalCustomEventFields[key];
                        }
                    }
                }

                GAEvents.addCustomFieldsToEvent(eventDict, GAState.validateAndCleanCustomFields(fieldsToUse, GAEvents.customEventFieldsErrorCallback));

                // Log
                GALogger.i("Add BUSINESS event: {currency:" + currency + ", amount:" + amount + ", itemType:" + itemType + ", itemId:" + itemId + ", cartType:" + cartType + "}");

                // Send to store
                GAEvents.addEventToStore(eventDict);
            }

            public static addResourceEvent(flowType:EGAResourceFlowType, currency:string, amount:number, itemType:string, itemId:string, fields:{[id:string]: any}, mergeFields:boolean): void
            {
                if(!GAState.isEventSubmissionEnabled())
                {
                    return;
                }

                // Validate event params
                var validationResult:ValidationResult = GAValidator.validateResourceEvent(flowType, currency, amount, itemType, itemId, GAState.getAvailableResourceCurrencies(), GAState.getAvailableResourceItemTypes());
                if (validationResult != null)
                {
                    GAHTTPApi.instance.sendSdkErrorEvent(validationResult.category, validationResult.area, validationResult.action, validationResult.parameter, validationResult.reason, GAState.getGameKey(), GAState.getGameSecret());
                    return;
                }

                // If flow type is sink reverse amount
                if (flowType === EGAResourceFlowType.Sink)
                {
                    amount *= -1;
                }

                // Create empty eventData
                var eventDict:{[key:string]: any} = {};

                // insert event specific values
                var flowTypeString:string = GAEvents.resourceFlowTypeToString(flowType);
                eventDict["event_id"] = flowTypeString + ":" + currency + ":" + itemType + ":" + itemId;
                eventDict["category"] = GAEvents.CategoryResource;
                eventDict["amount"] = amount;

                // Add custom dimensions
                GAEvents.addDimensionsToEvent(eventDict);

                var fieldsToUse: { [id: string]: any } = {};
                if (fields && Object.keys(fields).length > 0) {
                    for (let key in fields) {
                        fieldsToUse[key] = fields[key];
                    }
                }
                else {
                    for (let key in GAState.instance.currentGlobalCustomEventFields) {
                        fieldsToUse[key] = GAState.instance.currentGlobalCustomEventFields[key];
                    }
                }

                if (mergeFields && fields && Object.keys(fields).length > 0) {
                    for (let key in GAState.instance.currentGlobalCustomEventFields) {
                        if (!fieldsToUse[key]) {
                            fieldsToUse[key] = GAState.instance.currentGlobalCustomEventFields[key];
                        }
                    }
                }

                GAEvents.addCustomFieldsToEvent(eventDict, GAState.validateAndCleanCustomFields(fieldsToUse, GAEvents.customEventFieldsErrorCallback));

                // Log
                GALogger.i("Add RESOURCE event: {currency:" + currency + ", amount:" + amount + ", itemType:" + itemType + ", itemId:" + itemId + "}");

                // Send to store
                GAEvents.addEventToStore(eventDict);
            }

            public static addProgressionEvent(progressionStatus:EGAProgressionStatus, progression01:string, progression02:string, progression03:string, score:number, sendScore:boolean, fields:{[id:string]: any}, mergeFields:boolean): void
            {
                if(!GAState.isEventSubmissionEnabled())
                {
                    return;
                }

                var progressionStatusString:string = GAEvents.progressionStatusToString(progressionStatus);

                // Validate event params
                var validationResult:ValidationResult = GAValidator.validateProgressionEvent(progressionStatus, progression01, progression02, progression03);
                if (validationResult != null)
                {
                    GAHTTPApi.instance.sendSdkErrorEvent(validationResult.category, validationResult.area, validationResult.action, validationResult.parameter, validationResult.reason, GAState.getGameKey(), GAState.getGameSecret());
                    return;
                }

                // Create empty eventData
                var eventDict:{[key:string]: any} = {};

                // Progression identifier
                var progressionIdentifier:string;

                if (!progression02)
                {
                    progressionIdentifier = progression01;
                }
                else if (!progression03)
                {
                    progressionIdentifier = progression01 + ":" + progression02;
                }
                else
                {
                    progressionIdentifier = progression01 + ":" + progression02 + ":" + progression03;
                }

                // Append event specifics
                eventDict["category"] = GAEvents.CategoryProgression;
                eventDict["event_id"] = progressionStatusString + ":" + progressionIdentifier;

                // Attempt
                var attempt_num:number = 0;

                // Add score if specified and status is not start
                if (sendScore && progressionStatus != EGAProgressionStatus.Start)
                {
                    eventDict["score"] = Math.round(score);
                }

                // Count attempts on each progression fail and persist
                if (progressionStatus === EGAProgressionStatus.Fail)
                {
                    // Increment attempt number
                    GAState.incrementProgressionTries(progressionIdentifier);
                }

                // increment and add attempt_num on complete and delete persisted
                if (progressionStatus === EGAProgressionStatus.Complete)
                {
                    // Increment attempt number
                    GAState.incrementProgressionTries(progressionIdentifier);

                    // Add to event
                    attempt_num = GAState.getProgressionTries(progressionIdentifier);
                    eventDict["attempt_num"] = attempt_num;

                    // Clear
                    GAState.clearProgressionTries(progressionIdentifier);
                }

                // Add custom dimensions
                GAEvents.addDimensionsToEvent(eventDict);

                var fieldsToUse: { [id: string]: any } = {};
                if (fields && Object.keys(fields).length > 0) {
                    for (let key in fields) {
                        fieldsToUse[key] = fields[key];
                    }
                }
                else {
                    for (let key in GAState.instance.currentGlobalCustomEventFields) {
                        fieldsToUse[key] = GAState.instance.currentGlobalCustomEventFields[key];
                    }
                }

                if (mergeFields && fields && Object.keys(fields).length > 0) {
                    for (let key in GAState.instance.currentGlobalCustomEventFields) {
                        if (!fieldsToUse[key]) {
                            fieldsToUse[key] = GAState.instance.currentGlobalCustomEventFields[key];
                        }
                    }
                }

                GAEvents.addCustomFieldsToEvent(eventDict, GAState.validateAndCleanCustomFields(fieldsToUse, GAEvents.customEventFieldsErrorCallback));

                // Log
                GALogger.i("Add PROGRESSION event: {status:" + progressionStatusString + ", progression01:" + progression01 + ", progression02:" + progression02 + ", progression03:" + progression03 + ", score:" + score + ", attempt:" + attempt_num + "}");

                // Send to store
                GAEvents.addEventToStore(eventDict);
            }

            public static addDesignEvent(eventId:string, value:number, sendValue:boolean, fields:{[id:string]: any}, mergeFields:boolean): void
            {
                if(!GAState.isEventSubmissionEnabled())
                {
                    return;
                }

                // Validate
                var validationResult:ValidationResult = GAValidator.validateDesignEvent(eventId);
                if (validationResult != null)
                {
                    GAHTTPApi.instance.sendSdkErrorEvent(validationResult.category, validationResult.area, validationResult.action, validationResult.parameter, validationResult.reason, GAState.getGameKey(), GAState.getGameSecret());
                    return;
                }

                // Create empty eventData
                var eventData:{[key:string]: any} = {};

                // Append event specifics
                eventData["category"] = GAEvents.CategoryDesign;
                eventData["event_id"] = eventId;

                if(sendValue)
                {
                    eventData["value"] = value;
                }

                // Add custom dimensions
                GAEvents.addDimensionsToEvent(eventData);

                var fieldsToUse: { [id: string]: any } = {};
                if (fields && Object.keys(fields).length > 0) {
                    for (let key in fields) {
                        fieldsToUse[key] = fields[key];
                    }
                }
                else {
                    for (let key in GAState.instance.currentGlobalCustomEventFields) {
                        fieldsToUse[key] = GAState.instance.currentGlobalCustomEventFields[key];
                    }
                }

                if (mergeFields && fields && Object.keys(fields).length > 0) {
                    for (let key in GAState.instance.currentGlobalCustomEventFields) {
                        if (!fieldsToUse[key]) {
                            fieldsToUse[key] = GAState.instance.currentGlobalCustomEventFields[key];
                        }
                    }
                }

                GAEvents.addCustomFieldsToEvent(eventData, GAState.validateAndCleanCustomFields(fieldsToUse, GAEvents.customEventFieldsErrorCallback));

                // Log
                GALogger.i("Add DESIGN event: {eventId:" + eventId + ", value:" + value + "}");

                // Send to store
                GAEvents.addEventToStore(eventData);
            }

            public static addErrorEvent(severity:EGAErrorSeverity, message:string, fields:{[id:string]: any}, mergeFields:boolean, skipAddingFields:boolean=false): void
            {
                if(!GAState.isEventSubmissionEnabled())
                {
                    return;
                }

                var severityString:string = GAEvents.errorSeverityToString(severity);

                // Validate
                var validationResult:ValidationResult = GAValidator.validateErrorEvent(severity, message);
                if (validationResult != null)
                {
                    GAHTTPApi.instance.sendSdkErrorEvent(validationResult.category, validationResult.area, validationResult.action, validationResult.parameter, validationResult.reason, GAState.getGameKey(), GAState.getGameSecret());
                    return;
                }

                // Create empty eventData
                var eventData:{[key:string]: any} = {};

                // Append event specifics
                eventData["category"] = GAEvents.CategoryError;
                eventData["severity"] = severityString;
                eventData["message"] = message;

                // Add custom dimensions
                GAEvents.addDimensionsToEvent(eventData);

                if(!skipAddingFields)
                {
                    var fieldsToUse: { [id: string]: any } = {};
                    if (fields && Object.keys(fields).length > 0) {
                        for (let key in fields) {
                            fieldsToUse[key] = fields[key];
                        }
                    }
                    else {
                        for (let key in GAState.instance.currentGlobalCustomEventFields) {
                            fieldsToUse[key] = GAState.instance.currentGlobalCustomEventFields[key];
                        }
                    }

                    if (mergeFields && fields && Object.keys(fields).length > 0) {
                        for (let key in GAState.instance.currentGlobalCustomEventFields) {
                            if (!fieldsToUse[key]) {
                                fieldsToUse[key] = GAState.instance.currentGlobalCustomEventFields[key];
                            }
                        }
                    }

                    GAEvents.addCustomFieldsToEvent(eventData, GAState.validateAndCleanCustomFields(fieldsToUse, GAEvents.customEventFieldsErrorCallback));
                }

                // Log
                GALogger.i("Add ERROR event: {severity:" + severityString + ", message:" + message + "}");

                // Send to store
                GAEvents.addEventToStore(eventData);
            }

            public static addAdEvent(adAction:EGAAdAction, adType:EGAAdType, adSdkName:string, adPlacement:string, noAdReason:EGAAdError, duration:number, sendDuration:boolean, fields:{[id:string]: any}, mergeFields:boolean): void
            {
                if(!GAState.isEventSubmissionEnabled())
                {
                    return;
                }

                var adActionString:string = GAEvents.adActionToString(adAction);
                var adTypeString:string = GAEvents.adTypeToString(adType);
                var noAdReasonString:string = GAEvents.adErrorToString(noAdReason);

                // Validate
                var validationResult:ValidationResult = GAValidator.validateAdEvent(adAction, adType, adSdkName, adPlacement);
                if (validationResult != null)
                {
                    GAHTTPApi.instance.sendSdkErrorEvent(validationResult.category, validationResult.area, validationResult.action, validationResult.parameter, validationResult.reason, GAState.getGameKey(), GAState.getGameSecret());
                    return;
                }

                // Create empty eventData
                var eventData:{[key:string]: any} = {};

                // Append event specifics
                eventData["category"] = GAEvents.CategoryAds;
                eventData["ad_sdk_name"] = adSdkName;
                eventData["ad_placement"] = adPlacement;
                eventData["ad_type"] = adTypeString;
                eventData["ad_action"] = adActionString;

                if(adAction == EGAAdAction.FailedShow && noAdReasonString.length > 0)
                {
                    eventData["ad_fail_show_reason"] = noAdReasonString;
                }

                if(sendDuration && (adType == EGAAdType.RewardedVideo || adType == EGAAdType.Video))
                {
                    eventData["ad_duration"] = duration;
                }

                // Add custom dimensions
                GAEvents.addDimensionsToEvent(eventData);

                var fieldsToUse: { [id: string]: any } = {};
                if (fields && Object.keys(fields).length > 0) {
                    for (let key in fields) {
                        fieldsToUse[key] = fields[key];
                    }
                }
                else {
                    for (let key in GAState.instance.currentGlobalCustomEventFields) {
                        fieldsToUse[key] = GAState.instance.currentGlobalCustomEventFields[key];
                    }
                }

                if (mergeFields && fields && Object.keys(fields).length > 0) {
                    for (let key in GAState.instance.currentGlobalCustomEventFields) {
                        if (!fieldsToUse[key]) {
                            fieldsToUse[key] = GAState.instance.currentGlobalCustomEventFields[key];
                        }
                    }
                }

                GAEvents.addCustomFieldsToEvent(eventData, GAState.validateAndCleanCustomFields(fieldsToUse, GAEvents.customEventFieldsErrorCallback));

                // Log
                GALogger.i("Add AD event: {ad_sdk_name:" + adSdkName + ", ad_placement:" + adPlacement + ", ad_type:" + adTypeString + ", ad_action:" + adActionString + ((adAction == EGAAdAction.FailedShow && noAdReasonString.length > 0) ? (", ad_fail_show_reason:" + noAdReasonString) : "") + ((sendDuration && (adType == EGAAdType.RewardedVideo || adType == EGAAdType.Video)) ? (", ad_duration:" + duration) : "") + "}");

                // Send to store
                GAEvents.addEventToStore(eventData);
            }

            public static processEvents(category:string, performCleanUp:boolean): void
            {
                if(!GAState.isEventSubmissionEnabled())
                {
                    return;
                }

                // throw new Error("processEvents not implemented");
                try
                {
                    var requestIdentifier:string = GAUtilities.createGuid();

                    // Cleanup
                    if(performCleanUp)
                    {
                        GAEvents.cleanupEvents();
                        GAEvents.fixMissingSessionEndEvents();
                    }

                    // Prepare SQL
                    var selectArgs:Array<[string, EGAStoreArgsOperator, string]> = [];
                    selectArgs.push(["status", EGAStoreArgsOperator.Equal, "new"]);

                    var updateWhereArgs:Array<[string, EGAStoreArgsOperator, string]> = [];
                    updateWhereArgs.push(["status", EGAStoreArgsOperator.Equal, "new"]);
                    if(category)
                    {
                        selectArgs.push(["category", EGAStoreArgsOperator.Equal, category]);
                        updateWhereArgs.push(["category", EGAStoreArgsOperator.Equal, category]);
                    }

                    var updateSetArgs:Array<[string, string]> = [];
                    updateSetArgs.push(["status", requestIdentifier]);

                    // Get events to process
                    var events:Array<{[key:string]: any}> = GAStore.select(EGAStore.Events, selectArgs);

                    // Check for errors or empty
                    if(!events || events.length == 0)
                    {
                        GALogger.i("Event queue: No events to send");
                        GAEvents.updateSessionStore();
                        return;
                    }

                    // Check number of events and take some action if there are too many?
                    if(events.length > GAEvents.MaxEventCount)
                    {
                        // Make a limit request
                        events = GAStore.select(EGAStore.Events, selectArgs, true, GAEvents.MaxEventCount);
                        if(!events)
                        {
                            return;
                        }

                        // Get last timestamp
                        var lastItem:{[key:string]: any} = events[events.length - 1];
                        var lastTimestamp:string = lastItem["client_ts"] as string;

                        selectArgs.push(["client_ts", EGAStoreArgsOperator.LessOrEqual, lastTimestamp]);

                        // Select again
                        events = GAStore.select(EGAStore.Events, selectArgs);
                        if (!events)
                        {
                            return;
                        }

                        updateWhereArgs.push(["client_ts", EGAStoreArgsOperator.LessOrEqual, lastTimestamp]);
                    }

                    // Log
                    GALogger.i("Event queue: Sending " + events.length + " events.");

                    // Set status of events to 'sending' (also check for error)
                    if (!GAStore.update(EGAStore.Events, updateSetArgs, updateWhereArgs))
                    {
                        return;
                    }

                    // Create payload data from events
                    var payloadArray:Array<{[key:string]: any}> = [];

                    for (var i:number = 0; i < events.length; ++i)
                    {
                        var ev:{[key:string]: any} = events[i];
                        var eventDict = JSON.parse(GAUtilities.decode64(ev["event"]));
                        if (eventDict.length != 0)
                        {
                            var clientTs: number = eventDict["client_ts"] as number;
                            if (clientTs && !GAValidator.validateClientTs(clientTs))
                            {
                                delete eventDict["client_ts"];
                            }
                            payloadArray.push(eventDict);
                        }
                    }

                    GAHTTPApi.instance.sendEventsInArray(payloadArray, requestIdentifier, GAEvents.processEventsCallback);
                }
                catch (e)
                {
                    GALogger.e("Error during ProcessEvents(): " + e.stack);
                    GAHTTPApi.instance.sendSdkErrorEvent(EGASdkErrorCategory.Json, EGASdkErrorArea.ProcessEvents, EGASdkErrorAction.JsonError, EGASdkErrorParameter.Undefined, e.stack, GAState.getGameKey(), GAState.getGameSecret());
                }
            }

            private static processEventsCallback(responseEnum:EGAHTTPApiResponse, dataDict:{[key:string]: any},  requestId:string, eventCount:number): void
            {
                var requestIdWhereArgs:Array<[string, EGAStoreArgsOperator, string]> = [];
                requestIdWhereArgs.push(["status", EGAStoreArgsOperator.Equal, requestId]);

                if(responseEnum === EGAHTTPApiResponse.Ok)
                {
                    // Delete events
                    GAStore.delete(EGAStore.Events, requestIdWhereArgs);
                    GALogger.i("Event queue: " + eventCount + " events sent.");
                }
                else
                {
                    // Put events back (Only in case of no response)
                    if(responseEnum === EGAHTTPApiResponse.NoResponse)
                    {
                        var setArgs:Array<[string, string]> = [];
                        setArgs.push(["status", "new"]);

                        GALogger.w("Event queue: Failed to send events to collector - Retrying next time");
                        GAStore.update(EGAStore.Events, setArgs, requestIdWhereArgs);
                        // Delete events (When getting some anwser back always assume events are processed)
                    }
                    else
                    {
                        if(dataDict)
                        {
                            var json:any;
                            var count:number = 0;
                            for(let j in dataDict)
                            {
                                if(count == 0)
                                {
                                    json = dataDict[j];
                                }
                                ++count;
                            }

                            if(responseEnum === EGAHTTPApiResponse.BadRequest && json.constructor === Array)
                            {
                                GALogger.w("Event queue: " + eventCount + " events sent. " + count + " events failed GA server validation.");
                            }
                            else
                            {
                                GALogger.w("Event queue: Failed to send events.");
                            }
                        }
                        else
                        {
                            GALogger.w("Event queue: Failed to send events.");
                        }

                        GAStore.delete(EGAStore.Events, requestIdWhereArgs);
                    }
                }
            }

            private static cleanupEvents(): void
            {
                GAStore.update(EGAStore.Events, [["status" , "new"]]);
            }

            private static fixMissingSessionEndEvents(): void
            {
                if(!GAState.isEventSubmissionEnabled())
                {
                    return;
                }

                // Get all sessions that are not current
                var args:Array<[string, EGAStoreArgsOperator, string]> = [];
                args.push(["session_id", EGAStoreArgsOperator.NotEqual, GAState.getSessionId()]);

                var sessions:Array<{[key:string]: any}> = GAStore.select(EGAStore.Sessions, args);

                if (!sessions || sessions.length == 0)
                {
                    return;
                }

                GALogger.i(sessions.length + " session(s) located with missing session_end event.");

                // Add missing session_end events
                for (let i = 0; i < sessions.length; ++i)
                {
                    var sessionEndEvent:{[key:string]: any} = JSON.parse(GAUtilities.decode64(sessions[i]["event"] as string));
                    var event_ts:number = sessionEndEvent["client_ts"] as number;
                    var start_ts:number = sessions[i]["timestamp"] as number;

                    var length:number = event_ts - start_ts;
                    length = Math.max(0, length);

                    GALogger.d("fixMissingSessionEndEvents length calculated: " + length);

                    sessionEndEvent["category"] = GAEvents.CategorySessionEnd;
                    sessionEndEvent["length"] = length;

                    // Add to store
                    GAEvents.addEventToStore(sessionEndEvent);
                }
            }

            private static addEventToStore(eventData:{[key:string]: any}): void
            {
                if(!GAState.isEventSubmissionEnabled())
                {
                    return;
                }

                // Check if we are initialized
                if (!GAState.isInitialized())
                {
                    GALogger.w("Could not add event: SDK is not initialized");
                    return;
                }

                try
                {
                    // Check db size limits (10mb)
                    // If database is too large block all except user, session and business
                    if (GAStore.isStoreTooLargeForEvents() && !GAUtilities.stringMatch(eventData["category"] as string, /^(user|session_end|business)$/))
                    {
                        GALogger.w("Database too large. Event has been blocked.");
                        GAHTTPApi.instance.sendSdkErrorEvent(EGASdkErrorCategory.Database, EGASdkErrorArea.AddEventsToStore, EGASdkErrorAction.DatabaseTooLarge, EGASdkErrorParameter.Undefined, "", GAState.getGameKey(), GAState.getGameSecret());
                        return;
                    }

                    // Get default annotations
                    var ev:{[key:string]: any} = GAState.getEventAnnotations();

                    // Merge with eventData
                    for(let e in eventData)
                    {
                        ev[e] = eventData[e];
                    }

                    // Create json string representation
                    var json:string = JSON.stringify(ev);

                    // output if VERBOSE LOG enabled

                    GALogger.ii("Event added to queue: " + json);

                    // Add to store
                    var values:{[key:string]: any} = {};
                    values["status"] = "new";
                    values["category"] = ev["category"];
                    values["session_id"] = ev["session_id"];
                    values["client_ts"] = ev["client_ts"];
                    values["event"] = GAUtilities.encode64(JSON.stringify(ev));

                    GAStore.insert(EGAStore.Events, values);

                    // Add to session store if not last
                    if (eventData["category"] == GAEvents.CategorySessionEnd)
                    {
                        GAStore.delete(EGAStore.Sessions, [["session_id", EGAStoreArgsOperator.Equal, ev["session_id"] as string]]);
                    }
                    else
                    {
                        GAEvents.updateSessionStore();
                    }

                    if(GAStore.isStorageAvailable())
                    {
                        GAStore.save(GAState.getGameKey());
                    }
                }
                catch (e)
                {
                    GALogger.e("addEventToStore: error");
                    GALogger.e(e.stack);
                    GAHTTPApi.instance.sendSdkErrorEvent(EGASdkErrorCategory.Database, EGASdkErrorArea.AddEventsToStore, EGASdkErrorAction.DatabaseTooLarge, EGASdkErrorParameter.Undefined, e.stack, GAState.getGameKey(), GAState.getGameSecret());
                }
            }

            private static updateSessionStore(): void
            {
                if(GAState.sessionIsStarted())
                {
                    var values:{[key:string]: any} = {};
                    values["session_id"] = GAState.instance.sessionId;
                    values["timestamp"] = GAState.getSessionStart();

                    var ev: { [key: string]: any } = GAState.getEventAnnotations();

                    // Add custom dimensions
                    GAEvents.addDimensionsToEvent(ev);

                    var fieldsToUse: { [id: string]: any } = GAState.instance.currentGlobalCustomEventFields;

                    GAEvents.addCustomFieldsToEvent(ev, GAState.validateAndCleanCustomFields(fieldsToUse, GAEvents.customEventFieldsErrorCallback));

                    values["event"] = GAUtilities.encode64(JSON.stringify(ev));
                    GAStore.insert(EGAStore.Sessions, values, true, "session_id");

                    if(GAStore.isStorageAvailable())
                    {
                        GAStore.save(GAState.getGameKey());
                    }
                }
            }

            private static addDimensionsToEvent(eventData:{[key:string]: any}): void
            {
                if (!eventData)
                {
                    return;
                }
                // add to dict (if not nil)
                if (GAState.getCurrentCustomDimension01())
                {
                    eventData["custom_01"] = GAState.getCurrentCustomDimension01();
                }
                if (GAState.getCurrentCustomDimension02())
                {
                    eventData["custom_02"] = GAState.getCurrentCustomDimension02();
                }
                if (GAState.getCurrentCustomDimension03())
                {
                    eventData["custom_03"] = GAState.getCurrentCustomDimension03();
                }
            }

            private static addCustomFieldsToEvent(eventData:{[key:string]: any}, fields:{[key:string]: any}):void
            {
                if(!eventData)
                {
                    return;
                }

                if(fields && Object.keys(fields).length > 0)
                {
                    eventData["custom_fields"] = fields;
                }
            }

            private static resourceFlowTypeToString(value:any): string
            {
                if(value == EGAResourceFlowType.Source || value == EGAResourceFlowType[EGAResourceFlowType.Source])
                {
                    return "Source";
                }
                else if(value == EGAResourceFlowType.Sink || value == EGAResourceFlowType[EGAResourceFlowType.Sink])
                {
                    return "Sink";
                }
                else
                {
                    return "";
                }
            }

            private static progressionStatusToString(value:any): string
            {
                if(value == EGAProgressionStatus.Start || value == EGAProgressionStatus[EGAProgressionStatus.Start])
                {
                    return "Start";
                }
                else if(value == EGAProgressionStatus.Complete || value == EGAProgressionStatus[EGAProgressionStatus.Complete])
                {
                    return "Complete";
                }
                else if(value == EGAProgressionStatus.Fail || value == EGAProgressionStatus[EGAProgressionStatus.Fail])
                {
                    return "Fail";
                }
                else
                {
                    return "";
                }
            }

            private static errorSeverityToString(value:any): string
            {
                if(value == EGAErrorSeverity.Debug || value == EGAErrorSeverity[EGAErrorSeverity.Debug])
                {
                    return "debug";
                }
                else if(value == EGAErrorSeverity.Info || value == EGAErrorSeverity[EGAErrorSeverity.Info])
                {
                    return "info";
                }
                else if(value == EGAErrorSeverity.Warning || value == EGAErrorSeverity[EGAErrorSeverity.Warning])
                {
                    return "warning";
                }
                else if(value == EGAErrorSeverity.Error || value == EGAErrorSeverity[EGAErrorSeverity.Error])
                {
                    return "error";
                }
                else if(value == EGAErrorSeverity.Critical || value == EGAErrorSeverity[EGAErrorSeverity.Critical])
                {
                    return "critical";
                }
                else
                {
                    return "";
                }
            }

            private static adActionToString(value:any): string
            {
                if(value == EGAAdAction.Clicked || value == EGAAdAction[EGAAdAction.Clicked])
                {
                    return "clicked";
                }
                else if(value == EGAAdAction.Show || value == EGAAdAction[EGAAdAction.Show])
                {
                    return "show";
                }
                else if(value == EGAAdAction.FailedShow || value == EGAAdAction[EGAAdAction.FailedShow])
                {
                    return "failed_show";
                }
                else if(value == EGAAdAction.RewardReceived || value == EGAAdAction[EGAAdAction.RewardReceived])
                {
                    return "reward_received";
                }
                else
                {
                    return "";
                }
            }

            private static adErrorToString(value:any): string
            {
                if(value == EGAAdError.Unknown || value == EGAAdError[EGAAdError.Unknown])
                {
                    return "unknown";
                }
                else if(value == EGAAdError.Offline || value == EGAAdError[EGAAdError.Offline])
                {
                    return "offline";
                }
                else if(value == EGAAdError.NoFill || value == EGAAdError[EGAAdError.NoFill])
                {
                    return "no_fill";
                }
                else if(value == EGAAdError.InternalError || value == EGAAdError[EGAAdError.InternalError])
                {
                    return "internal_error";
                }
                else if(value == EGAAdError.InvalidRequest || value == EGAAdError[EGAAdError.InvalidRequest])
                {
                    return "invalid_request";
                }
                else if(value == EGAAdError.UnableToPrecache || value == EGAAdError[EGAAdError.UnableToPrecache])
                {
                    return "unable_to_precache";
                }
                else
                {
                    return "";
                }
            }

            private static adTypeToString(value:any): string
            {
                if(value == EGAAdType.Video || value == EGAAdType[EGAAdType.Video])
                {
                    return "video";
                }
                else if(value == EGAAdType.RewardedVideo || value == EGAAdError[EGAAdType.RewardedVideo])
                {
                    return "rewarded_video";
                }
                else if(value == EGAAdType.Playable || value == EGAAdError[EGAAdType.Playable])
                {
                    return "playable";
                }
                else if(value == EGAAdType.Interstitial || value == EGAAdError[EGAAdType.Interstitial])
                {
                    return "interstitial";
                }
                else if(value == EGAAdType.OfferWall || value == EGAAdError[EGAAdType.OfferWall])
                {
                    return "offer_wall";
                }
                else if(value == EGAAdType.Banner || value == EGAAdError[EGAAdType.Banner])
                {
                    return "banner";
                }
                else
                {
                    return "";
                }
            }
        }
    }

export module threading
    {
export class TimedBlock
        {
            public readonly deadline:Date;
            public block:() => void;
            public readonly id:number;
            public ignore:boolean;
            public async:boolean;
            public running:boolean;
            private static idCounter:number = 0;

            public constructor(deadline:Date)
            {
                this.deadline = deadline;
                this.ignore = false;
                this.async = false;
                this.running = false;
                this.id = ++TimedBlock.idCounter;
            }
        }

export interface IComparer<T>
        {
            compare(x:T, y:T): number;
        }

        export class PriorityQueue<TItem>
        {
            public _subQueues:{[key:number]: Array<TItem>};
            public _sortedKeys:Array<number>;
            private comparer:IComparer<number>;

            public constructor(priorityComparer:IComparer<number>)
            {
                this.comparer = priorityComparer;
                this._subQueues = {};
                this._sortedKeys = [];
            }

            public enqueue(priority:number, item:TItem): void
            {
                if(this._sortedKeys.indexOf(priority) === -1)
                {
                    this.addQueueOfPriority(priority);
                }

                this._subQueues[priority].push(item);
            }

            private addQueueOfPriority(priority:number): void
            {
                this._sortedKeys.push(priority);
                this._sortedKeys.sort((x:number, y:number) => this.comparer.compare(x, y));
                this._subQueues[priority] = [];
            }

            public peek(): TItem
            {
                if(this.hasItems())
                {
                    return this._subQueues[this._sortedKeys[0]][0];
                }
                else
                {
                    throw new Error("The queue is empty");
                }
            }

            public hasItems(): boolean
            {
                return this._sortedKeys.length > 0;
            }

            public dequeue(): TItem
            {
                if(this.hasItems())
                {
                    return this.dequeueFromHighPriorityQueue();
                }
                else
                {
                    throw new Error("The queue is empty");
                }
            }

            private dequeueFromHighPriorityQueue(): TItem
            {
                var firstKey:number = this._sortedKeys[0];
                var nextItem:TItem = this._subQueues[firstKey].shift();
                if(this._subQueues[firstKey].length === 0)
                {
                    this._sortedKeys.shift();
                    delete this._subQueues[firstKey];
                }

                return nextItem;
            }
        }

import GALogger = gameanalytics.logging.GALogger;
        import GAUtilities = gameanalytics.utilities.GAUtilities;
        import GAStore = gameanalytics.store.GAStore;
        import EGAStoreArgsOperator = gameanalytics.store.EGAStoreArgsOperator;
        import EGAStore = gameanalytics.store.EGAStore;
        import GAState = gameanalytics.state.GAState;
        import GAEvents = gameanalytics.events.GAEvents;
        import GAHTTPApi = gameanalytics.http.GAHTTPApi;

        export class GAThreading
        {
            private static readonly instance:GAThreading = new GAThreading();
            public readonly blocks:PriorityQueue<TimedBlock> = new PriorityQueue<TimedBlock>(<IComparer<number>>{
                compare: (x:number, y:number) => {
                    return x - y;
                }
            });
            private readonly id2TimedBlockMap:{[key:number]: TimedBlock} = {};
            private static runTimeoutId:NodeJS.Timeout;
            private static readonly ThreadWaitTimeInMs:number = 1000;
            private static ProcessEventsIntervalInSeconds:number = 8.0;
            private keepRunning:boolean;
            private isRunning:boolean;

            private constructor()
            {
                GALogger.d("Initializing GA thread...");
                GAThreading.startThread();
            }

            public static createTimedBlock(delayInSeconds:number = 0): TimedBlock
            {
                var time:Date = new Date();
                time.setUTCSeconds(time.getUTCSeconds() + delayInSeconds);

                var timedBlock:TimedBlock = new TimedBlock(time);
                return timedBlock;
            }

            public static performTaskOnGAThread(taskBlock:() => void, delayInSeconds:number = 0): void
            {
                var time:Date = new Date();
                time.setUTCSeconds(time.getUTCSeconds() + delayInSeconds);

                var timedBlock:TimedBlock = new TimedBlock(time);
                timedBlock.block = taskBlock;
                GAThreading.instance.id2TimedBlockMap[timedBlock.id] = timedBlock;
                GAThreading.instance.addTimedBlock(timedBlock);
            }

            public static performTimedBlockOnGAThread(timedBlock:TimedBlock): void
            {
                GAThreading.instance.id2TimedBlockMap[timedBlock.id] = timedBlock;
                GAThreading.instance.addTimedBlock(timedBlock);
            }

            public static scheduleTimer(interval:number, callback:() => void): number
            {
                var time:Date = new Date();
                time.setUTCSeconds(time.getUTCSeconds() + interval);

                var timedBlock:TimedBlock = new TimedBlock(time);
                timedBlock.block = callback;
                GAThreading.instance.id2TimedBlockMap[timedBlock.id] = timedBlock;
                GAThreading.instance.addTimedBlock(timedBlock);

                return timedBlock.id;
            }

            public static getTimedBlockById(blockIdentifier:number): TimedBlock
            {
                if (blockIdentifier in GAThreading.instance.id2TimedBlockMap)
                {
                    return GAThreading.instance.id2TimedBlockMap[blockIdentifier]
                }
                else
                {
                    return null;
                }
            }

            public static ensureEventQueueIsRunning(): void
            {
                GAThreading.instance.keepRunning = true;

                if(!GAThreading.instance.isRunning)
                {
                    GAThreading.instance.isRunning = true;
                    GAThreading.scheduleTimer(GAThreading.ProcessEventsIntervalInSeconds, GAThreading.processEventQueue);
                }
            }

            public static endSessionAndStopQueue(): void
            {
                if(GAState.isInitialized())
                {
                    GALogger.i("Ending session.");
                    GAThreading.stopEventQueue();
                    if (GAState.isEnabled() && GAState.sessionIsStarted())
                    {
                        GAEvents.addSessionEndEvent();
                        GAState.instance.sessionStart = 0;
                    }
                }
            }

            public static stopEventQueue(): void
            {
                GAThreading.instance.keepRunning = false;
            }

            public static ignoreTimer(blockIdentifier:number): void
            {
                if (blockIdentifier in GAThreading.instance.id2TimedBlockMap)
                {
                    GAThreading.instance.id2TimedBlockMap[blockIdentifier].ignore = true;
                }
            }

            public static setEventProcessInterval(interval:number): void
            {
                if (interval > 0)
                {
                    GAThreading.ProcessEventsIntervalInSeconds = interval;
                }
            }

            private addTimedBlock(timedBlock:TimedBlock): void
            {
                this.blocks.enqueue(timedBlock.deadline.getTime(), timedBlock);
            }

            private static run(): void
            {
                clearTimeout(GAThreading.runTimeoutId);

                try
                {
                    var timedBlock:TimedBlock;

                    while ((timedBlock = GAThreading.getNextBlock()))
                    {
                        if (!timedBlock.ignore)
                        {
                            if(timedBlock.async)
                            {
                                if(!timedBlock.running)
                                {
                                    timedBlock.running = true;
                                    timedBlock.block();
                                    break;
                                }
                            }
                            else
                            {
                                timedBlock.block();
                            }
                        }
                    }

                    GAThreading.runTimeoutId = setTimeout(GAThreading.run, GAThreading.ThreadWaitTimeInMs);
                    return;
                }
                catch (e)
                {
                    GALogger.e("Error on GA thread");
                    GALogger.e(e.stack);
                }
                GALogger.d("Ending GA thread");
            }

            private static startThread(): void
            {
                GALogger.d("Starting GA thread");
                GAThreading.runTimeoutId = setTimeout(GAThreading.run, 0);
            }

            private static getNextBlock(): TimedBlock
            {
                var now:Date = new Date();

                if (GAThreading.instance.blocks.hasItems() && GAThreading.instance.blocks.peek().deadline.getTime() <= now.getTime())
                {
                    if(GAThreading.instance.blocks.peek().async)
                    {
                        if(GAThreading.instance.blocks.peek().running)
                        {
                            return GAThreading.instance.blocks.peek();
                        }
                        else
                        {
                            return GAThreading.instance.blocks.dequeue();
                        }
                    }
                    else
                    {
                        return GAThreading.instance.blocks.dequeue();
                    }
                }

                return null;
            }

            private static processEventQueue(): void
            {
                GAEvents.processEvents("", true);
                if(GAThreading.instance.keepRunning)
                {
                    GAThreading.scheduleTimer(GAThreading.ProcessEventsIntervalInSeconds, GAThreading.processEventQueue);
                }
                else
                {
                    GAThreading.instance.isRunning = false;
                }
            }
        }
    }

import GAThreading = gameanalytics.threading.GAThreading;
    import TimedBlock = gameanalytics.threading.TimedBlock;
    import GALogger = gameanalytics.logging.GALogger;
    import GAStore = gameanalytics.store.GAStore;
    import GAState = gameanalytics.state.GAState;
    import GAHTTPApi = gameanalytics.http.GAHTTPApi;
    import GADevice = gameanalytics.device.GADevice;
    import GAValidator = gameanalytics.validators.GAValidator;
    import EGAHTTPApiResponse = gameanalytics.http.EGAHTTPApiResponse;
    import GAUtilities = gameanalytics.utilities.GAUtilities;
    import GAEvents = gameanalytics.events.GAEvents;

    export class GameAnalytics
    {
        private static initTimedBlockId:number = -1;
        public static methodMap:{[id:string]: (...args: any[]) => void} = {};

        private static getGlobalObject(): any
        {
            if (typeof globalThis !== 'undefined') { return globalThis; }
            if (typeof self !== 'undefined') { return self; }
            if (typeof window !== 'undefined') { return window; }
            if (typeof global !== 'undefined') { return global; }
            return undefined;
        }

        public static init(): void
        {
            GADevice.touch();
            GameAnalytics.methodMap['configureAvailableCustomDimensions01'] = GameAnalytics.configureAvailableCustomDimensions01;
            GameAnalytics.methodMap['configureAvailableCustomDimensions02'] = GameAnalytics.configureAvailableCustomDimensions02;
            GameAnalytics.methodMap['configureAvailableCustomDimensions03'] = GameAnalytics.configureAvailableCustomDimensions03;
            GameAnalytics.methodMap['configureAvailableResourceCurrencies'] = GameAnalytics.configureAvailableResourceCurrencies;
            GameAnalytics.methodMap['configureAvailableResourceItemTypes'] = GameAnalytics.configureAvailableResourceItemTypes;
            GameAnalytics.methodMap['configureBuild'] = GameAnalytics.configureBuild;
            GameAnalytics.methodMap['configureSdkGameEngineVersion'] = GameAnalytics.configureSdkGameEngineVersion;
            GameAnalytics.methodMap['configureGameEngineVersion'] = GameAnalytics.configureGameEngineVersion;
            GameAnalytics.methodMap['configureUserId'] = GameAnalytics.configureUserId;
            GameAnalytics.methodMap['initialize'] = GameAnalytics.initialize;
            GameAnalytics.methodMap['addBusinessEvent'] = GameAnalytics.addBusinessEvent;
            GameAnalytics.methodMap['addResourceEvent'] = GameAnalytics.addResourceEvent;
            GameAnalytics.methodMap['addProgressionEvent'] = GameAnalytics.addProgressionEvent;
            GameAnalytics.methodMap['addDesignEvent'] = GameAnalytics.addDesignEvent;
            GameAnalytics.methodMap['addErrorEvent'] = GameAnalytics.addErrorEvent;
            GameAnalytics.methodMap['addAdEvent'] = GameAnalytics.addAdEvent;
            GameAnalytics.methodMap['setEnabledInfoLog'] = GameAnalytics.setEnabledInfoLog;
            GameAnalytics.methodMap['setEnabledVerboseLog'] = GameAnalytics.setEnabledVerboseLog;
            GameAnalytics.methodMap['setEnabledManualSessionHandling'] = GameAnalytics.setEnabledManualSessionHandling;
            GameAnalytics.methodMap['setEnabledEventSubmission'] = GameAnalytics.setEnabledEventSubmission;
            GameAnalytics.methodMap['setCustomDimension01'] = GameAnalytics.setCustomDimension01;
            GameAnalytics.methodMap['setCustomDimension02'] = GameAnalytics.setCustomDimension02;
            GameAnalytics.methodMap['setCustomDimension03'] = GameAnalytics.setCustomDimension03;
            GameAnalytics.methodMap['setGlobalCustomEventFields'] = GameAnalytics.setGlobalCustomEventFields;
            GameAnalytics.methodMap['setEventProcessInterval'] = GameAnalytics.setEventProcessInterval;
            GameAnalytics.methodMap['startSession'] = GameAnalytics.startSession;
            GameAnalytics.methodMap['endSession'] = GameAnalytics.endSession;
            GameAnalytics.methodMap['onStop'] = GameAnalytics.onStop;
            GameAnalytics.methodMap['onResume'] = GameAnalytics.onResume;
            GameAnalytics.methodMap['addRemoteConfigsListener'] = GameAnalytics.addRemoteConfigsListener;
            GameAnalytics.methodMap['removeRemoteConfigsListener'] = GameAnalytics.removeRemoteConfigsListener;
            GameAnalytics.methodMap['getRemoteConfigsValueAsString'] = GameAnalytics.getRemoteConfigsValueAsString;
            GameAnalytics.methodMap['isRemoteConfigsReady'] = GameAnalytics.isRemoteConfigsReady;
            GameAnalytics.methodMap['getRemoteConfigsContentAsString'] = GameAnalytics.getRemoteConfigsContentAsString;
            GameAnalytics.methodMap['addOnBeforeUnloadListener'] = GameAnalytics.addOnBeforeUnloadListener;
            GameAnalytics.methodMap['removeOnBeforeUnloadListener'] = GameAnalytics.removeOnBeforeUnloadListener;

            if (typeof GameAnalytics.getGlobalObject() !== 'undefined' && typeof GameAnalytics.getGlobalObject()['GameAnalytics'] !== 'undefined' && typeof GameAnalytics.getGlobalObject()['GameAnalytics']['q'] !== 'undefined')
            {
                var q: any[] = GameAnalytics.getGlobalObject()['GameAnalytics']['q'];
                for (let i in q)
                {
                    GameAnalytics.gaCommand.apply(null, q[i]);
                }
            }


            // beforeunload: call onGameAnalyticsBeforeUnload() from the app
        }

        public static gaCommand(...args: any[]): void
        {
            if(args.length > 0)
            {
                if(args[0] in gameanalytics.GameAnalytics.methodMap)
                {
                    if(args.length > 1)
                    {
                        gameanalytics.GameAnalytics.methodMap[args[0]].apply(null, Array.prototype.slice.call(args, 1));
                    }
                    else
                    {
                        gameanalytics.GameAnalytics.methodMap[args[0]]();
                    }
                }
            }
        }

        public static configureAvailableCustomDimensions01(customDimensions:Array<string> = []): void
        {
            GAThreading.performTaskOnGAThread(() =>
            {
                if(GameAnalytics.isSdkReady(true, false))
                {
                    GALogger.w("Available custom dimensions must be set before SDK is initialized");
                    return;
                }
                GAState.setAvailableCustomDimensions01(customDimensions);
            });
        }

        public static configureAvailableCustomDimensions02(customDimensions:Array<string> = []): void
        {
            GAThreading.performTaskOnGAThread(() =>
            {
                if(GameAnalytics.isSdkReady(true, false))
                {
                    GALogger.w("Available custom dimensions must be set before SDK is initialized");
                    return;
                }
                GAState.setAvailableCustomDimensions02(customDimensions);
            });
        }

        public static configureAvailableCustomDimensions03(customDimensions:Array<string> = []): void
        {
            GAThreading.performTaskOnGAThread(() =>
            {
                if(GameAnalytics.isSdkReady(true, false))
                {
                    GALogger.w("Available custom dimensions must be set before SDK is initialized");
                    return;
                }
                GAState.setAvailableCustomDimensions03(customDimensions);
            });
        }

        public static configureAvailableResourceCurrencies(resourceCurrencies:Array<string> = []): void
        {
            GAThreading.performTaskOnGAThread(() =>
            {
                if (GameAnalytics.isSdkReady(true, false))
                {
                    GALogger.w("Available resource currencies must be set before SDK is initialized");
                    return;
                }
                GAState.setAvailableResourceCurrencies(resourceCurrencies);
            });
        }

        public static configureAvailableResourceItemTypes(resourceItemTypes:Array<string> = []): void
        {
            GAThreading.performTaskOnGAThread(() =>
            {
                if (GameAnalytics.isSdkReady(true, false))
                {
                    GALogger.w("Available resource item types must be set before SDK is initialized");
                    return;
                }
                GAState.setAvailableResourceItemTypes(resourceItemTypes);
            });
        }

        public static configureBuild(build:string = ""): void
        {
            GAThreading.performTaskOnGAThread(() =>
            {
                if (GameAnalytics.isSdkReady(true, false))
                {
                    GALogger.w("Build version must be set before SDK is initialized.");
                    return;
                }
                if (!GAValidator.validateBuild(build))
                {
                    GALogger.i("Validation fail - configure build: Cannot be null, empty or above 32 length. String: " + build);
                    return;
                }
                GAState.setBuild(build);
            });
        }

        public static configureSdkGameEngineVersion(sdkGameEngineVersion:string = ""): void
        {
            GAThreading.performTaskOnGAThread(() =>
            {
                if (GameAnalytics.isSdkReady(true, false))
                {
                    return;
                }
                if (!GAValidator.validateSdkWrapperVersion(sdkGameEngineVersion))
                {
                    GALogger.i("Validation fail - configure sdk version: Sdk version not supported. String: " + sdkGameEngineVersion);
                    return;
                }
                GADevice.sdkGameEngineVersion = sdkGameEngineVersion;
            });
        }

        public static configureGameEngineVersion(gameEngineVersion:string = ""): void
        {
            GAThreading.performTaskOnGAThread(() =>
            {
                if (GameAnalytics.isSdkReady(true, false))
                {
                    return;
                }
                if (!GAValidator.validateEngineVersion(gameEngineVersion))
                {
                    GALogger.i("Validation fail - configure game engine version: Game engine version not supported. String: " + gameEngineVersion);
                    return;
                }
                GADevice.gameEngineVersion = gameEngineVersion;
            });
        }

        public static configureUserId(uId:string = ""): void
        {
            GAThreading.performTaskOnGAThread(() =>
            {
                if (GameAnalytics.isSdkReady(true, false))
                {
                    GALogger.w("A custom user id must be set before SDK is initialized.");
                    return;
                }
                if (!GAValidator.validateUserId(uId))
                {
                    GALogger.i("Validation fail - configure user_id: Cannot be null, empty or above 64 length. Will use default user_id method. Used string: " + uId);
                    return;
                }

                GAState.setUserId(uId);
            });
        }

        public static initialize(gameKey:string = "", gameSecret:string = ""): void
        {
            GADevice.updateConnectionType();

            var timedBlock:TimedBlock = GAThreading.createTimedBlock();
            timedBlock.async = true;
            GameAnalytics.initTimedBlockId = timedBlock.id;
            timedBlock.block = () => {
                void gaStorage.hydrate(gameKey).then(() => {
                if (GameAnalytics.isSdkReady(true, false))
                {
                    GALogger.w("SDK already initialized. Can only be called once.");
                    return;
                }
                if (!GAValidator.validateKeys(gameKey, gameSecret))
                {
                    GALogger.w("SDK failed initialize. Game key or secret key is invalid. Can only contain characters A-z 0-9, gameKey is 32 length, gameSecret is 40 length. Failed keys - gameKey: " + gameKey + ", secretKey: " + gameSecret);
                    return;
                }

                GAState.setKeys(gameKey, gameSecret);

                GameAnalytics.internalInitialize();
                });
            };

            GAThreading.performTimedBlockOnGAThread(timedBlock);
        }

        public static addBusinessEvent(currency:string = "", amount:number = 0, itemType:string = "", itemId:string = "", cartType:string = "", customFields:{[id:string]: any} = {}, mergeFields:boolean = false): void
        {
            GADevice.updateConnectionType();

            if(!GAState.instance.isUnloading)
            {
                GAThreading.performTaskOnGAThread(() => {
                    if (!GameAnalytics.isSdkReady(true, true, "Could not add business event")) {
                        return;
                    }
                    // Send to events
                    GAEvents.addBusinessEvent(currency, amount, itemType, itemId, cartType, customFields, mergeFields);
                });
            }
            else
            {
                if (!GameAnalytics.isSdkReady(true, true, "Could not add business event")) {
                    return;
                }
                // Send to events
                GAEvents.addBusinessEvent(currency, amount, itemType, itemId, cartType, customFields, mergeFields);
            }
        }

        public static addResourceEvent(flowType:EGAResourceFlowType = EGAResourceFlowType.Undefined, currency:string = "", amount:number = 0, itemType:string = "", itemId:string = "", customFields:{[id:string]: any} = {}, mergeFields:boolean = false): void
        {
            GADevice.updateConnectionType();

            if (!GAState.instance.isUnloading)
            {
                GAThreading.performTaskOnGAThread(() => {
                    if (!GameAnalytics.isSdkReady(true, true, "Could not add resource event")) {
                        return;
                    }

                    GAEvents.addResourceEvent(flowType, currency, amount, itemType, itemId, customFields, mergeFields);
                });
            }
            else
            {
                if (!GameAnalytics.isSdkReady(true, true, "Could not add resource event")) {
                    return;
                }

                GAEvents.addResourceEvent(flowType, currency, amount, itemType, itemId, customFields, mergeFields);
            }
        }

        public static addProgressionEvent(progressionStatus: EGAProgressionStatus = EGAProgressionStatus.Undefined, progression01: string = "", progression02: string = "", progression03: string = "", score?: number, customFields: { [id: string]: any } = {}, mergeFields: boolean = false): void
        {
            GADevice.updateConnectionType();

            if (!GAState.instance.isUnloading)
            {
                GAThreading.performTaskOnGAThread(() => {
                    if (!GameAnalytics.isSdkReady(true, true, "Could not add progression event")) {
                        return;
                    }

                    // Send to events
                    var sendScore: boolean = typeof score === "number";
                    GAEvents.addProgressionEvent(progressionStatus, progression01, progression02, progression03, sendScore ? score : 0, sendScore, customFields, mergeFields);
                });
            }
            else
            {
                if (!GameAnalytics.isSdkReady(true, true, "Could not add progression event")) {
                    return;
                }

                // Send to events
                var sendScore: boolean = typeof score === "number";
                GAEvents.addProgressionEvent(progressionStatus, progression01, progression02, progression03, sendScore ? score : 0, sendScore, customFields, mergeFields);
            }
        }

        public static addDesignEvent(eventId: string, value?: number, customFields: { [id: string]: any } = {}, mergeFields: boolean = false): void
        {
            GADevice.updateConnectionType();

            if (!GAState.instance.isUnloading)
            {
                GAThreading.performTaskOnGAThread(() => {
                    if (!GameAnalytics.isSdkReady(true, true, "Could not add design event")) {
                        return;
                    }
                    var sendValue: boolean = typeof value === "number";
                    GAEvents.addDesignEvent(eventId, sendValue ? value : 0, sendValue, customFields, mergeFields);
                });
            }
            else
            {
                if (!GameAnalytics.isSdkReady(true, true, "Could not add design event")) {
                    return;
                }
                var sendValue: boolean = typeof value === "number";
                GAEvents.addDesignEvent(eventId, sendValue ? value : 0, sendValue, customFields, mergeFields);
            }
        }

        public static addErrorEvent(severity: EGAErrorSeverity = EGAErrorSeverity.Undefined, message: string = "", customFields: { [id: string]: any } = {}, mergeFields: boolean = false): void
        {
            GADevice.updateConnectionType();

            if (!GAState.instance.isUnloading)
            {
                GAThreading.performTaskOnGAThread(() => {
                    if (!GameAnalytics.isSdkReady(true, true, "Could not add error event")) {
                        return;
                    }
                    GAEvents.addErrorEvent(severity, message, customFields, mergeFields);
                });
            }
            else
            {
                if (!GameAnalytics.isSdkReady(true, true, "Could not add error event")) {
                    return;
                }
                GAEvents.addErrorEvent(severity, message, customFields, mergeFields);
            }
        }

        public static addAdEventWithNoAdReason(adAction: EGAAdAction = EGAAdAction.Undefined, adType: EGAAdType = EGAAdType.Undefined, adSdkName: string = "", adPlacement: string = "", noAdReason: EGAAdError = EGAAdError.Undefined, customFields: { [id: string]: any } = {}, mergeFields: boolean = false): void
        {
            GADevice.updateConnectionType();

            if (!GAState.instance.isUnloading)
            {
                GAThreading.performTaskOnGAThread(() => {
                    if (!GameAnalytics.isSdkReady(true, true, "Could not add ad event")) {
                        return;
                    }
                    GAEvents.addAdEvent(adAction, adType, adSdkName, adPlacement, noAdReason, 0, false, customFields, mergeFields);
                });
            }
            else
            {
                if (!GameAnalytics.isSdkReady(true, true, "Could not add ad event")) {
                    return;
                }
                GAEvents.addAdEvent(adAction, adType, adSdkName, adPlacement, noAdReason, 0, false, customFields, mergeFields);
            }
        }

        public static addAdEventWithDuration(adAction: EGAAdAction = EGAAdAction.Undefined, adType: EGAAdType = EGAAdType.Undefined, adSdkName: string = "", adPlacement: string = "", duration: number = 0, customFields: { [id: string]: any } = {}, mergeFields: boolean = false): void
        {
            GADevice.updateConnectionType();

            if (!GAState.instance.isUnloading)
            {
                GAThreading.performTaskOnGAThread(() => {
                    if (!GameAnalytics.isSdkReady(true, true, "Could not add ad event")) {
                        return;
                    }
                    GAEvents.addAdEvent(adAction, adType, adSdkName, adPlacement, EGAAdError.Undefined, duration, true, customFields, mergeFields);
                });
            }
            else
            {
                if (!GameAnalytics.isSdkReady(true, true, "Could not add ad event")) {
                    return;
                }
                GAEvents.addAdEvent(adAction, adType, adSdkName, adPlacement, EGAAdError.Undefined, duration, true, customFields, mergeFields);
            }
        }

        public static addAdEvent(adAction: EGAAdAction = EGAAdAction.Undefined, adType: EGAAdType = EGAAdType.Undefined, adSdkName: string = "", adPlacement: string = "", customFields: { [id: string]: any } = {}, mergeFields: boolean = false): void
        {
            GADevice.updateConnectionType();

            if (!GAState.instance.isUnloading)
            {
                GAThreading.performTaskOnGAThread(() => {
                    if (!GameAnalytics.isSdkReady(true, true, "Could not add ad event")) {
                        return;
                    }
                    GAEvents.addAdEvent(adAction, adType, adSdkName, adPlacement, EGAAdError.Undefined, 0, false, customFields, mergeFields);
                });
            }
            else
            {
                if (!GameAnalytics.isSdkReady(true, true, "Could not add ad event")) {
                    return;
                }
                GAEvents.addAdEvent(adAction, adType, adSdkName, adPlacement, EGAAdError.Undefined, 0, false, customFields, mergeFields);
            }
        }

        public static setEnabledInfoLog(flag:boolean = false): void
        {
            GAThreading.performTaskOnGAThread(() =>
            {
                if (flag)
                {
                    GALogger.setInfoLog(flag);
                    GALogger.i("Info logging enabled");
                }
                else
                {
                    GALogger.i("Info logging disabled");
                    GALogger.setInfoLog(flag);
                }
            });
        }

        public static setEnabledVerboseLog(flag:boolean = false): void
        {
            GAThreading.performTaskOnGAThread(() =>
            {
                if (flag)
                {
                    GALogger.setVerboseLog(flag);
                    GALogger.i("Verbose logging enabled");
                }
                else
                {
                    GALogger.i("Verbose logging disabled");
                    GALogger.setVerboseLog(flag);
                }
            });
        }

        public static setEnabledManualSessionHandling(flag:boolean = false): void
        {
            GAThreading.performTaskOnGAThread(() =>
            {
                GAState.setManualSessionHandling(flag);
            });
        }

        public static setEnabledEventSubmission(flag:boolean = false): void
        {
            GAThreading.performTaskOnGAThread(() =>
            {
                if (flag)
                {
                    GAState.setEnabledEventSubmission(flag);
                    GALogger.i("Event submission enabled");
                }
                else
                {
                    GALogger.i("Event submission disabled");
                    GAState.setEnabledEventSubmission(flag);
                }
            });
        }

        public static setCustomDimension01(dimension:string = ""): void
        {
            GAThreading.performTaskOnGAThread(() =>
            {
                if (!GAValidator.validateDimension01(dimension, GAState.getAvailableCustomDimensions01()))
                {
                    GALogger.w("Could not set custom01 dimension value to '" + dimension + "'. Value not found in available custom01 dimension values");
                    return;
                }
                GAState.setCustomDimension01(dimension);
            });
        }

        public static setCustomDimension02(dimension:string = ""): void
        {
            GAThreading.performTaskOnGAThread(() =>
            {
                if (!GAValidator.validateDimension02(dimension, GAState.getAvailableCustomDimensions02()))
                {
                    GALogger.w("Could not set custom02 dimension value to '" + dimension + "'. Value not found in available custom02 dimension values");
                    return;
                }
                GAState.setCustomDimension02(dimension);
            });
        }

        public static setCustomDimension03(dimension:string = ""): void
        {
            GAThreading.performTaskOnGAThread(() =>
            {
                if (!GAValidator.validateDimension03(dimension, GAState.getAvailableCustomDimensions03()))
                {
                    GALogger.w("Could not set custom03 dimension value to '" + dimension + "'. Value not found in available custom03 dimension values");
                    return;
                }
                GAState.setCustomDimension03(dimension);
            });
        }

        public static setGlobalCustomEventFields(customFields: { [id: string]: any } = {}): void
        {
            GAThreading.performTaskOnGAThread(() =>
            {
                GALogger.i("Set global custom event fields: " + JSON.stringify(customFields));
                GAState.instance.currentGlobalCustomEventFields = customFields;
            });
        }

        public static setEventProcessInterval(intervalInSeconds:number): void
        {
            GAThreading.performTaskOnGAThread(() =>
            {
                GAThreading.setEventProcessInterval(intervalInSeconds);
            });
        }

        public static startSession(): void
        {
            //if(GAState.getUseManualSessionHandling())
            {
                if(!GAState.isInitialized())
                {
                    return;
                }

                var timedBlock:TimedBlock = GAThreading.createTimedBlock();
                timedBlock.async = true;
                GameAnalytics.initTimedBlockId = timedBlock.id;
                timedBlock.block = () =>
                {
                    if(GAState.isEnabled() && GAState.sessionIsStarted())
                    {
                        GAThreading.endSessionAndStopQueue();
                    }

                    GameAnalytics.resumeSessionAndStartQueue();
                };

                GAThreading.performTimedBlockOnGAThread(timedBlock);
            }
        }

        public static endSession(): void
        {
            //if(GAState.getUseManualSessionHandling())
            {
                GameAnalytics.onStop();
            }
        }

        public static onStop(): void
        {
            GAThreading.performTaskOnGAThread(() =>
            {
                try
                {
                    GAThreading.endSessionAndStopQueue();
                }
                catch (Exception)
                {
                }
            });
        }

        public static onResume(): void
        {
            var timedBlock:TimedBlock = GAThreading.createTimedBlock();
            timedBlock.async = true;
            GameAnalytics.initTimedBlockId = timedBlock.id;
            timedBlock.block = () =>
            {
                GameAnalytics.resumeSessionAndStartQueue();
            };

            GAThreading.performTimedBlockOnGAThread(timedBlock);
        }

        public static getRemoteConfigsValueAsString(key:string, defaultValue:string = null):string
        {
            return GAState.getConfigurationStringValue(key, defaultValue);
        }

        public static isRemoteConfigsReady():boolean
        {
            return GAState.isRemoteConfigsReady();
        }

        public static addRemoteConfigsListener(listener:{ onRemoteConfigsUpdated:() => void }):void
        {
            GAState.addRemoteConfigsListener(listener);
        }

        public static removeRemoteConfigsListener(listener:{ onRemoteConfigsUpdated:() => void }):void
        {
            GAState.removeRemoteConfigsListener(listener);
        }

        public static getRemoteConfigsContentAsString():string
        {
            return GAState.getRemoteConfigsContentAsString();
        }

        public static getABTestingId():string
        {
            return GAState.getABTestingId();
        }

        public static getABTestingVariantId():string
        {
            return GAState.getABTestingVariantId();
        }

        public static addOnBeforeUnloadListener(listener: { onBeforeUnload: () => void }): void
        {
            GAState.addOnBeforeUnloadListener(listener);
        }

        public static removeOnBeforeUnloadListener(listener: { onBeforeUnload: () => void }): void
        {
            GAState.removeOnBeforeUnloadListener(listener);
        }

        private static internalInitialize(): void
        {
            GAState.ensurePersistedStates();
            GAStore.setItem(GAState.getGameKey(), GAState.DefaultUserIdKey, GAState.getDefaultId());

            GAState.setInitialized(true);

            GameAnalytics.newSession();

            if (GAState.isEnabled())
            {
                GAThreading.ensureEventQueueIsRunning();
            }
        }

        private static newSession(): void
        {
            GALogger.i("Starting a new session.");

            // make sure the current custom dimensions are valid
            GAState.validateAndFixCurrentDimensions();

            GAHTTPApi.instance.requestInit(GAState.instance.configsHash, GameAnalytics.startNewSessionCallback);
        }

        private static startNewSessionCallback(initResponse:EGAHTTPApiResponse, initResponseDict:{[key:string]: any}): void
        {
            // init is ok
            if((initResponse === EGAHTTPApiResponse.Ok || initResponse === EGAHTTPApiResponse.Created) && initResponseDict)
            {
                // set the time offset - how many seconds the local time is different from servertime
                var timeOffsetSeconds:number = 0;
                if(initResponseDict["server_ts"])
                {
                    var serverTs:number = initResponseDict["server_ts"] as number;
                    timeOffsetSeconds = GAState.calculateServerTimeOffset(serverTs);
                }
                initResponseDict["time_offset"] = timeOffsetSeconds;

                if(initResponse != EGAHTTPApiResponse.Created)
                {
                    var currentSdkConfig:{[key:string]: any} = GAState.getSdkConfig();
                    // use cached if not Created
                    if(currentSdkConfig["configs"])
                    {
                        initResponseDict["configs"] = currentSdkConfig["configs"];
                    }
                    if(currentSdkConfig["configs_hash"])
                    {
                        initResponseDict["configs_hash"] = currentSdkConfig["configs_hash"];
                    }
                    if(currentSdkConfig["ab_id"])
                    {
                        initResponseDict["ab_id"] = currentSdkConfig["ab_id"];
                    }
                    if(currentSdkConfig["ab_variant_id"])
                    {
                        initResponseDict["ab_variant_id"] = currentSdkConfig["ab_variant_id"];
                    }
                }

                GAState.instance.configsHash = initResponseDict["configs_hash"] ? initResponseDict["configs_hash"] : "";
                GAState.instance.abId = initResponseDict["ab_id"] ? initResponseDict["ab_id"] : "";
                GAState.instance.abVariantId = initResponseDict["ab_variant_id"] ? initResponseDict["ab_variant_id"] : "";

                // insert new config in sql lite cross session storage
                GAStore.setItem(GAState.getGameKey(), GAState.SdkConfigCachedKey, GAUtilities.encode64(JSON.stringify(initResponseDict)));

                // set new config and cache in memory
                GAState.instance.sdkConfigCached = initResponseDict;
                GAState.instance.sdkConfig = initResponseDict;

                GAState.instance.initAuthorized = true;
            }
            else if(initResponse == EGAHTTPApiResponse.Unauthorized)
            {
                GALogger.w("Initialize SDK failed - Unauthorized");
                GAState.instance.initAuthorized = false;
            }
            else
            {
                // log the status if no connection
                if(initResponse === EGAHTTPApiResponse.NoResponse || initResponse === EGAHTTPApiResponse.RequestTimeout)
                {
                    GALogger.i("Init call (session start) failed - no response. Could be offline or timeout.");
                }
                else if(initResponse === EGAHTTPApiResponse.BadResponse || initResponse === EGAHTTPApiResponse.JsonEncodeFailed || initResponse === EGAHTTPApiResponse.JsonDecodeFailed)
                {
                    GALogger.i("Init call (session start) failed - bad response. Could be bad response from proxy or GA servers.");
                }
                else if(initResponse === EGAHTTPApiResponse.BadRequest || initResponse === EGAHTTPApiResponse.UnknownResponseCode)
                {
                    GALogger.i("Init call (session start) failed - bad request or unknown response.");
                }

                // init call failed (perhaps offline)
                if(GAState.instance.sdkConfig == null)
                {
                    if(GAState.instance.sdkConfigCached != null)
                    {
                        GALogger.i("Init call (session start) failed - using cached init values.");
                        // set last cross session stored config init values
                        GAState.instance.sdkConfig = GAState.instance.sdkConfigCached;
                    }
                    else
                    {
                        GALogger.i("Init call (session start) failed - using default init values.");
                        // set default init values
                        GAState.instance.sdkConfig = GAState.instance.sdkConfigDefault;
                    }
                }
                else
                {
                    GALogger.i("Init call (session start) failed - using cached init values.");
                }
                GAState.instance.initAuthorized = true;
            }

            // set offset in state (memory) from current config (config could be from cache etc.)
            GAState.instance.clientServerTimeOffset = GAState.getSdkConfig()["time_offset"] ? GAState.getSdkConfig()["time_offset"] as number : 0;

            // populate configurations
            GAState.populateConfigurations(GAState.getSdkConfig());

            // if SDK is disabled in config
            if(!GAState.isEnabled())
            {
                GALogger.w("Could not start session: SDK is disabled.");
                // stop event queue
                // + make sure it's able to restart if another session detects it's enabled again
                GAThreading.stopEventQueue();
                return;
            }
            else
            {
                GAThreading.ensureEventQueueIsRunning();
            }

            // generate the new session
            var newSessionId:string = GAUtilities.createGuid();

            // Set session id
            GAState.instance.sessionId = newSessionId;

            // Set session start
            GAState.instance.sessionStart = GAState.getClientTsAdjusted();

            // Add session start event
            GAEvents.addSessionStartEvent();

            var timedBlock:TimedBlock = GAThreading.getTimedBlockById(GameAnalytics.initTimedBlockId);

            if(timedBlock != null)
            {
                timedBlock.running = false;
            }

            GameAnalytics.initTimedBlockId = -1;
        }

        private static resumeSessionAndStartQueue(): void
        {
            if(!GAState.isInitialized())
            {
                return;
            }
            GALogger.i("Resuming session.");
            if(!GAState.sessionIsStarted())
            {
                GameAnalytics.newSession();
            }
        }

        private static isSdkReady(needsInitialized:boolean, warn:boolean = true, message:string = ""): boolean
        {
            if(message)
            {
                message = message + ": ";
            }

            // Is SDK initialized
            if (needsInitialized && !GAState.isInitialized())
            {
                if (warn)
                {
                    GALogger.w(message + "SDK is not initialized");
                }
                return false;
            }
            // Is SDK enabled
            if (needsInitialized && !GAState.isEnabled())
            {
                if (warn)
                {
                    GALogger.w(message + "SDK is disabled");
                }
                return false;
            }
            // Is session started
            if (needsInitialized && !GAState.sessionIsStarted())
            {
                if (warn)
                {
                    GALogger.w(message + "Session has not started yet");
                }
                return false;
            }
            return true;
        }
    }

}

export const GameAnalytics = gameanalytics.GameAnalytics;
export default GameAnalytics;

export const EGAErrorSeverity = gameanalytics.EGAErrorSeverity;
export const EGAProgressionStatus = gameanalytics.EGAProgressionStatus;
export const EGAResourceFlowType = gameanalytics.EGAResourceFlowType;
export const EGAAdAction = gameanalytics.EGAAdAction;
export const EGAAdError = gameanalytics.EGAAdError;
export const EGAAdType = gameanalytics.EGAAdType;

gameanalytics.GameAnalytics.init();
