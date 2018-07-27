/**
Copyright (C) 2014-2018  Barry de Graaff

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see http://www.gnu.org/licenses/.
*/

//Constructor
function tk_barrydegraaff_enable_pkcs7_signature_HandlerObject() {
};


tk_barrydegraaff_enable_pkcs7_signature_HandlerObject.prototype = new ZmZimletBase();
tk_barrydegraaff_enable_pkcs7_signature_HandlerObject.prototype.constructor = tk_barrydegraaff_enable_pkcs7_signature_HandlerObject;

tk_barrydegraaff_enable_pkcs7_signature_HandlerObject.prototype.toString =
function() {
   return "tk_barrydegraaff_enable_pkcs7_signature_HandlerObject";
};

/** 
 * Creates the Zimlet, extends {@link https://files.zimbra.com/docs/zimlet/zcs/8.6.0/jsapi-zimbra-doc/symbols/ZmZimletBase.html ZmZimletBase}.
 * @class
 * @extends ZmZimletBase
 *  */
var enablePkcs7Sig = tk_barrydegraaff_enable_pkcs7_signature_HandlerObject;

/** 
 * This method gets called when Zimbra Zimlet framework initializes.
 * enablePkcs7Sig uses the init function to load openpgp.js and configure the user settings and runtime variables.
 */
enablePkcs7Sig.prototype.init = function() {
   AjxDispatcher.require(["MailCore", "Mail"]);
   try {
   
       /* Customer cannot add p7s attachments, nor can the client view them from the webUI.
        This Zimlet reverts the ignoring of application/pkcs7-signature that was introduced
        in bugzilla 69476
        
        See also:
        the problem seems to be build in by design as a result of:
         
        zm-web-client/WebRoot/js/zimbraMail/core/ZmMimeTable.js  :
        ZmMimeTable.APP_SIGNATURE           = "application/pkcs7-signature"; // IGNORE (added per bug 69476)
         ... 
         
         ZmMimeTable.isIgnored = 
         function(type) {
            return (type == ZmMimeTable.MULTI_ALT ||
                  type == ZmMimeTable.MULTI_MIXED ||
                  type == ZmMimeTable.MULTI_RELATED ||
                  type == ZmMimeTable.MULTI_APPLE_DBL ||
                  type == ZmMimeTable.APP_MS_TNEF ||
                  type == ZmMimeTable.APP_MS_TNEF2 ||
                     type == ZmMimeTable.APP_SIGNATURE);
         };
      */
      ZmMimeTable.isIgnored = 
      function(type) {
         return (type == ZmMimeTable.MULTI_ALT ||
               type == ZmMimeTable.MULTI_MIXED ||
               type == ZmMimeTable.MULTI_RELATED ||
               type == ZmMimeTable.MULTI_APPLE_DBL ||
               type == ZmMimeTable.APP_MS_TNEF ||
               type == ZmMimeTable.APP_MS_TNEF2);
      };
      console.log("tk_barrydegraaff_enable_pkcs7_signature: overriding ZmMimeTable.isIgnored");
   }
   catch(err)
   {
      console.log("tk_barrydegraaff_enable_pkcs7_signature: ERROR" + err);
   }   
};

