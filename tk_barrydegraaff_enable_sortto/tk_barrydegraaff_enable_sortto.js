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
enableSortTo.prototype.onMsgView = function() {

};   

enableSortTo.prototype.init = function() {
   try {
      var app = appCtxt.getCurrentApp();
      var controller = app.getMailListController();
      var buttonSortByTO = controller._sortViewMenu._menuItems.to;
      buttonSortByTO.setVisible(true);
   }
   catch(err)
   {
      console.log('tk_barrydegraaff_enable_sortto: error: '+err);
   }
};   
   
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
      mi.setVisible(true);
   }
   mi = sortMenu.getMenuItem(ZmItem.F_TO);
   if (mi) {
      mi.setVisible(true);
   }

   return sortMenu;
};

//same thing for ZmConvListView
ZmConvListView.prototype._getActionMenuForColHeader =
function(force) {

   var menu = ZmMailListView.prototype._getActionMenuForColHeader.apply(this, arguments);
   if (!this.isMultiColumn()) {
      var mi = this._colHeaderActionMenu.getMenuItem(ZmItem.F_FROM);
      if (mi) {
         mi.setVisible(true);
      }
      mi = this._colHeaderActionMenu.getMenuItem(ZmItem.F_TO);
      if (mi) {
         mi.setVisible(true);
      }
   }
   return menu;
};
/*
ZmMailListView.prototype._initHeaders =
function() {
	if (!this._headerInit) {
		this._headerInit = {};
		this._headerInit[ZmItem.F_SELECTION]	= {icon:"CheckboxUnchecked", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.selection, precondition:ZmSetting.SHOW_SELECTION_CHECKBOX, cssClass:"ZmMsgListColSelection"};
		this._headerInit[ZmItem.F_FLAG]			= {icon:"FlagRed", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.flag, sortable:ZmItem.F_FLAG, noSortArrow:true, precondition:ZmSetting.FLAGGING_ENABLED, cssClass:"ZmMsgListColFlag"};
		this._headerInit[ZmItem.F_PRIORITY]		= {icon:"PriorityHigh_list", width:ZmListView.COL_WIDTH_NARROW_ICON, name:ZmMsg.priority, sortable:ZmItem.F_PRIORITY, noSortArrow:true, precondition:ZmSetting.MAIL_PRIORITY_ENABLED, cssClass:"ZmMsgListColPriority"};
		this._headerInit[ZmItem.F_TAG]			= {icon:"Tag", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.tag, precondition:ZmSetting.TAGGING_ENABLED, cssClass:"ZmMsgListColTag"};
		this._headerInit[ZmItem.F_ACCOUNT]		= {icon:"AccountAll", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.account, noRemove:true, resizeable:true, cssClass:"ZmMsgListColAccount"};
		this._headerInit[ZmItem.F_STATUS]		= {icon:"MsgStatus", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.status, cssClass:"ZmMsgListColStatus"};
		this._headerInit[ZmItem.F_MUTE]			= {icon:"Mute", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.muteUnmute, sortable: false, noSortArrow:true, cssClass:"ZmMsgListColMute"}; //todo - once server supports readAsc/readDesc sort orders, uncomment the sortable
		this._headerInit[ZmItem.F_READ]			= {icon:"MsgUnread", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.readUnread, sortable: ZmItem.F_READ, noSortArrow:true, cssClass:"ZmMsgListColRead"};
		this._headerInit[ZmItem.F_FROM]			= {text:ZmMsg.from, width:ZmMsg.COLUMN_WIDTH_FROM_MLV, resizeable:true, sortable:ZmItem.F_FROM, cssClass:"ZmMsgListColFrom"};      
		this._headerInit[ZmItem.F_ATTACHMENT]	= {icon:"Attachment", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.attachment, sortable:ZmItem.F_ATTACHMENT, noSortArrow:true, cssClass:"ZmMsgListColAttachment"};
		this._headerInit[ZmItem.F_SUBJECT]		= {text:ZmMsg.subject, sortable:ZmItem.F_SUBJECT, noRemove:true, resizeable:true, cssClass:"ZmMsgListColSubject"};
		this._headerInit[ZmItem.F_FOLDER]		= {text:ZmMsg.folder, width:ZmMsg.COLUMN_WIDTH_FOLDER, resizeable:true, cssClass:"ZmMsgListColFolder"};
		this._headerInit[ZmItem.F_SIZE]			= {text:ZmMsg.size, width:ZmMsg.COLUMN_WIDTH_SIZE, sortable:ZmItem.F_SIZE, resizeable:true, cssClass:"ZmMsgListColSize"};
		var column_width_date = appCtxt.get(ZmSetting.DISPLAY_TIME_IN_MAIL_LIST) ? ZmMsg.COLUMN_WIDTH_DATE_TIME : ZmMsg.COLUMN_WIDTH_DATE;
		this._headerInit[ZmItem.F_DATE]			= {text:ZmMsg.received, width:column_width_date, sortable:ZmItem.F_DATE, resizeable:true, cssClass:"ZmMsgListColDate"};
		this._headerInit[ZmItem.F_SORTED_BY]	= {text:AjxMessageFormat.format(ZmMsg.arrangedBy, ZmMsg.date), sortable:ZmItem.F_SORTED_BY, resizeable:false};      
      this._headerInit[ZmItem.F_TO]			   = {text:ZmMsg.to,   width:ZmMsg.COLUMN_WIDTH_FROM_MLV, resizeable:true, sortable:ZmItem.F_TO, cssClass:"ZmMsgListColFrom"};      
	}
};

ZmMailListView.prototype._getLabelFieldList =
function() {
	var headers = [];
	headers.push(ZmItem.F_SELECTION);
	if (appCtxt.get(ZmSetting.FLAGGING_ENABLED)) {
		headers.push(ZmItem.F_FLAG);
	}
	headers.push(
		ZmItem.F_PRIORITY,
		ZmItem.F_TAG,
		ZmItem.F_READ,
		ZmItem.F_STATUS,
		ZmItem.F_FROM,      
		ZmItem.F_ATTACHMENT,
		ZmItem.F_SUBJECT,
		ZmItem.F_FOLDER,
		ZmItem.F_SIZE,
      ZmItem.F_TO,
	);
	if (appCtxt.accountList.size() > 2) {
		headers.push(ZmItem.F_ACCOUNT);
	}
	headers.push(ZmItem.F_DATE);

	return headers;
};
*/

ZmListView.prototype._sortMenuListener =
function(ev) {
   try {
      var column;
      if (this.isMultiColumn()) { //this can happen when called from the view menu, that now, for accessibility reasons, includes the sort, for both reading pane on right and at the bottom.
         var sortField = ev && ev.item && ev.item.getData(ZmOperation.MENUITEM_ID);
         column = this._headerHash[sortField];
      }
      else {
         column = this._headerHash[ZmItem.F_SORTED_BY];
         var cell = document.getElementById(DwtId.getListViewHdrId(DwtId.WIDGET_HDR_LABEL, this._view, column._field));
         if (cell) {
              var text = ev.item.getText();
              cell.innerHTML = text && text.replace(ZmMsg.sortBy, ZmMsg.sortedBy);
         }
         column._sortable = ev.item.getData(ZmListView.KEY_ID);
      }
      this._bSortAsc = (column._sortable === this._currentSortColId) ? !this._bSortAsc : this._isDefaultSortAscending(column);
      this._sortColumn(column, this._bSortAsc);
   } catch (err)
   {
      //need to add the TO column to the list view when reading pane is off or at the bottom
      console.log('tk_barrydegraaff_enable_sortto: error, not yet implemented: '+err);
   }
};
