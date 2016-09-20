/**
Copyright (C) 2014-2016  Barry de Graaff

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
function tk_barrydegraaff_zmcsferesultpatch_HandlerObject() {
};


tk_barrydegraaff_zmcsferesultpatch_HandlerObject.prototype = new ZmZimletBase();
tk_barrydegraaff_zmcsferesultpatch_HandlerObject.prototype.constructor = tk_barrydegraaff_zmcsferesultpatch_HandlerObject;

tk_barrydegraaff_zmcsferesultpatch_HandlerObject.prototype.toString =
function() {
   return "tk_barrydegraaff_zmcsferesultpatch_HandlerObject";
};

/** 
 * Creates the Zimlet, extends {@link https://files.zimbra.com/docs/zimlet/zcs/8.6.0/jsapi-zimbra-doc/symbols/ZmZimletBase.html ZmZimletBase}.
 * @class
 * @extends ZmZimletBase
 *  */
var ZmCsfeResultPatch = tk_barrydegraaff_zmcsferesultpatch_HandlerObject;

/** 
 * This method gets called when Zimbra Zimlet framework initializes.
 * ZmCsfeResultPatch uses the init function to load openpgp.js and configure the user settings and runtime variables.
 */
ZmCsfeResultPatch.prototype.init = function() {

}


ZmCsfeResult.prototype.getResponse =
function() {
 	if (this._isException) {
      if (this._data.msg == "permission denied: cannot dismiss alarms of a shared calendar")
      {
         console.log("ZmCsfeResultPatch suppress error message: permission denied: cannot dismiss alarms of a shared calendar");
         console.log(this._data);
         throw null; //will result in Uncaught TypeErrors... at least will halt the execution (and not throw next error)
      }
      else
      {
 		   throw this._data;
      }   
 	} else {
 		return this._data;
 	}
 };
