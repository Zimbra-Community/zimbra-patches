/**
Copyright (C) 2014-2019  Barry de Graaff

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
function tk_barrydegraaff_zbug1005_HandlerObject() {
};


tk_barrydegraaff_zbug1005_HandlerObject.prototype = new ZmZimletBase();
tk_barrydegraaff_zbug1005_HandlerObject.prototype.constructor = tk_barrydegraaff_zbug1005_HandlerObject;

tk_barrydegraaff_zbug1005_HandlerObject.prototype.toString =
function() {
   return "tk_barrydegraaff_zbug1005_HandlerObject";
};

/** 
 * Creates the Zimlet, extends {@link https://files.zimbra.com/docs/zimlet/zcs/8.6.0/jsapi-zimbra-doc/symbols/ZmZimletBase.html ZmZimletBase}.
 * @class
 * @extends ZmZimletBase
 *  */
var zbug1005 = tk_barrydegraaff_zbug1005_HandlerObject;

/** 
 * This method gets called when Zimbra Zimlet framework initializes.
 * zbug1005 uses the init function to load openpgp.js and configure the user settings and runtime variables.
 */
zbug1005.prototype.init = function() {
try {
   AjxDispatcher.require(["MailCore", "Mail"]);
   ZmMailMsg.prototype._handleResponseSendInviteReply =
   function(callback, toastMessage, result) {
      var resp = result.getResponse();
   
      var id = resp.id ? resp.id.split("-")[0] : null;
      var statusOK = (id || resp.status == "OK");
   
      if (statusOK) {
         this._notifySendListeners();
         this._origMsg.folderId = ZmFolder.ID_TRASH;
      }
   
      // allow or disallow move logic:
      var allowMove;
      if ((this.acceptFolderId != appCtxt.get(ZmSetting.CAL_DEFAULT_ID)) ||
         (appCtxt.multiAccounts &&
            !this.getAccount().isMain &&
            this.acceptFolderId == appCtxt.get(ZmSetting.CAL_DEFAULT_ID)))
      {
         allowMove = true;
      }
   
      //if (this.acceptFolderId && allowMove && resp.apptId != null) {
         this.moveApptItem(resp.apptId, this.acceptFolderId);
      //}
   
       if (window.parentController) {
         window.close();
      }
   
      if (toastMessage) {
         //note - currently this is not called from child window, but just in case it will in the future.
         var ctxt = window.parentAppCtxt || window.appCtxt; //show on parent window if this is a child window, since we close this child window on accept/decline/etc
         ctxt.setStatusMsg(toastMessage);
      }
   
      if (callback) {
         callback.run(result, this._origMsg.getPtst()); // the ptst was updated in _sendInviteReply
      }
   };
} catch (err) { console.log('zbug1005 err'+err);}
}

