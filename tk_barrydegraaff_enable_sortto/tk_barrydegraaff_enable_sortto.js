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
function tk_barrydegraaff_enable_sortto_HandlerObject() {
};


tk_barrydegraaff_enable_sortto_HandlerObject.prototype = new ZmZimletBase();
tk_barrydegraaff_enable_sortto_HandlerObject.prototype.constructor = tk_barrydegraaff_enable_sortto_HandlerObject;

tk_barrydegraaff_enable_sortto_HandlerObject.prototype.toString =
function() {
   return "tk_barrydegraaff_enable_sortto_HandlerObject";
};

/** 
 * Creates the Zimlet, extends {@link https://files.zimbra.com/docs/zimlet/zcs/8.6.0/jsapi-zimbra-doc/symbols/ZmZimletBase.html ZmZimletBase}.
 * @class
 * @extends ZmZimletBase
 *  */
var enableSortTo = tk_barrydegraaff_enable_sortto_HandlerObject;

/** 
 * This method gets called when Zimbra Zimlet framework initializes.
 * enableSortTo uses the init function to load openpgp.js and configure the user settings and runtime variables.
 */
enableSortTo.prototype.init = function() {
   AjxDispatcher.require(["MailCore", "Mail"]);
   console.log("tk_barrydegraaff_enable_sortto: overriding ZmMailListView.prototype._setupSortMenu");

   /* See also:
   The SOAP sortBy documentation seems to be incomplete:
   https://files.zimbra.com/docs/soap_api/8.8.8/api-reference/zimbraMail/Search.html#tbl-SearchRequest-sortBy
   
   It looks like one can use all the sorts defined in: 
   zm-mailbox/store/src/java/com/zimbra/cs/index/SortBy.java
   
   The UI parts are here:
   zm-web-client/WebRoot/js/zimbraMail/mail/view/ZmMailListView.js _setupSortMenu and _getSingleColumnSortFields 
   zm-web-client/WebRoot/js/zimbraMail/share/view/ZmListView.js _getSortMenu
   
   The list of sortables is in the UI in: 
   ZmMailListView.SINGLE_COLUMN_SORT (TO is already implemented, but normally only shown in the Sent items)
    
   override _setupSortMenu
   */
   ZmMailListView.prototype._setupSortMenu = function(parent, includeGroupByMenu) {
   
      var activeSortBy = this.getActiveSearchSortBy();
      var defaultSort = activeSortBy && ZmMailListView.SORTBY_HASH[activeSortBy] ?
         ZmMailListView.SORTBY_HASH[activeSortBy].field : ZmItem.F_DATE;
      var sortMenu = this._getSortMenu(this._getSingleColumnSortFields(), defaultSort, parent);
   
      if (includeGroupByMenu) {
         this._groupByActionMenu = this._getGroupByActionMenu(sortMenu);
         this._setGroupByCheck();
      }
      var mi = sortMenu.getMenuItem(ZmItem.F_FROM);
      if (mi) {
         mi.setVisible(!this._isOutboundFolder());
      }
      mi = sortMenu.getMenuItem(ZmItem.F_TO);
      if (mi) {
         //mi.setVisible(this._isOutboundFolder());
      }
   
      return sortMenu;
   };
};

