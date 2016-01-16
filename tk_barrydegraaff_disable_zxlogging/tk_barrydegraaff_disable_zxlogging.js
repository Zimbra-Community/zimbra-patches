/*

work-around for https://bugzilla.zextras.com/show_bug.cgi?id=171

Copyright (C) 2014-2015  Barry de Graaff

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see http://www.gnu.org/licenses/.
*/

//Constructor
tk_barrydegraaff_disable_zxlogging = function() {
};

tk_barrydegraaff_disable_zxlogging.prototype = new ZmZimletBase;
tk_barrydegraaff_disable_zxlogging.prototype.constructor = tk_barrydegraaff_disable_zxlogging;

tk_barrydegraaff_disable_zxlogging.prototype.toString =
function() {
   return "tk_barrydegraaff_disable_zxlogging";
};

/* This method gets called when Zimbra Zimlet framework initializes
 */
tk_barrydegraaff_disable_zxlogging.prototype.init = function() {
   try 
   {
      console.log('------------------------------------- ZeXtras logger level set to warn');
      ZxDevTools.getLogEngine().getLogger('chat').setLogLevel('warn');
   } catch (err) {}   
}

/* This method is called when a message is viewed in Zimbra
 * */
tk_barrydegraaff_disable_zxlogging.prototype.onMsgView = function (msg, oldMsg, msgView) {  
};   
