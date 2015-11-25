/*

work-around for https://bugzilla.zimbra.com/show_bug.cgi?id=101907

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
tk_barrydegraaff_disable_quick_reply = function() {
};

tk_barrydegraaff_disable_quick_reply.prototype = new ZmZimletBase;
tk_barrydegraaff_disable_quick_reply.prototype.constructor = tk_barrydegraaff_disable_quick_reply;

tk_barrydegraaff_disable_quick_reply.prototype.toString =
function() {
   return "tk_barrydegraaff_disable_quick_reply";
};

/* This method gets called when Zimbra Zimlet framework initializes
 */
tk_barrydegraaff_disable_quick_reply.prototype.init = function() {
   try 
   {
      var currentSheet = null;
      var i = 0;
      var j = 0;
      var ruleKey = null;
      
      //loop through styleSheet(s)
      for(i = 0; i<document.styleSheets.length; i++){
         currentSheet = document.styleSheets[i];
         currentSheet.insertRule(".ZmMailMsgCapsuleView .footer { display:none; }", 1);
         currentSheet.insertRule(".ReplyTextarea { display:none; }", 1);
      }
   } catch (err) {}   
}

/* This method is called when a message is viewed in Zimbra
 * 
 * See the comment above in init function on maximum email size ZmSetting.MAX_MESSAGE_SIZE on why onMsgView function is a bit complicated.
 * 
 * */
tk_barrydegraaff_disable_quick_reply.prototype.onMsgView = function (msg, oldMsg, msgView) {
   //Remove Zimlets infobar from previous message
   try {
   var elem = document.getElementById('main_MSGC'+msg.id+'__footer_reply');
   elem.parentNode.removeChild(elem);
   
   var elem = document.getElementById('main_MSGC'+msg.id+'__footer_replyAll');
   elem.parentNode.removeChild(elem);
   } catch (err) {}   
};   
