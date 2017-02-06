if (AjxPackage.define("CalendarCore")) {
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2012, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2006, 2007, 2008, 2009, 2010, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */
/*
 * Package: CalendarCore
 * 
 * Supports: Minimal calendar functionality
 * 
 * Loaded:
 * 	- To display mini-calendar
 * 	- For reminders refresh
 * 	- If search for resources returns data
 *
 * Any user of this package will need to load ContactsCore first.
 */

if (AjxPackage.define("zimbraMail.calendar.model.ZmCalendar")) {
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a calendar.
 * @constructor
 * @class
 *
 * @author Andy Clark
 *
 * @param {Hash}		params			a hash of parameters:
 * @param {int}			params.id		the numeric ID
 * @param {String}		params.name		the name
 * @param {ZmOrganizer}	params.parent	the parent organizer
 * @param {ZmTree}		params.tree		the tree model that contains this organizer
 * @param {constant}	params.color	the color for this calendar
 * @param {String}		params.url		the URL for this organizer's feed
 * @param {String}		params.owner	the owner of this calendar
 * @param {String}		params.zid		the Zimbra id of owner, if remote share
 * @param {String}		params.rid		the remote id of organizer, if remote share
 * @param {String}		params.restUrl	the REST URL of this organizer
 * 
 * @extends		ZmFolder
 */
ZmCalendar = function(params) {
	params.type = ZmOrganizer.CALENDAR;
	ZmFolder.call(this, params);
};

ZmCalendar.prototype = new ZmFolder;
ZmCalendar.prototype.constructor = ZmCalendar;

ZmCalendar.prototype.isZmCalendar = true;
ZmCalendar.prototype.toString = function() { return "ZmCalendar"; };

// Consts

ZmCalendar.ID_CALENDAR = ZmOrganizer.ID_CALENDAR;

// Public methods

/**
 * Creates a new calendar. The color and flags will be set later in response
 * to the create notification. This function is necessary because calendar
 * creation needs custom error handling.
 * 
 * @param	{Hash}	params		a hash of parameters
 */
ZmCalendar.create =
function(params) {
	params.errorCallback = new AjxCallback(null, ZmCalendar._handleErrorCreate, params);
	ZmOrganizer.create(params);
};

ZmCalendar._handleErrorCreate =
function(params, ex) {
	if (params.url && (ex.code == ZmCsfeException.SVC_PARSE_ERROR)) {
		msg = AjxMessageFormat.format(ZmMsg.calFeedInvalid, params.url);
		ZmOrganizer._showErrorMsg(msg);
		return true;
	}
	return ZmOrganizer._handleErrorCreate(params, ex);
};

/**
 * Gets the icon.
 * 
 * @return	{String}	the icon
 */
ZmCalendar.prototype.getIcon = 
function() {
	if (this.nId == ZmOrganizer.ID_ROOT)	{ return null; }
	if (this.link)							{ return "SharedCalendarFolder"; }
	return "CalendarFolder";
};

/**
 * Sets the free/busy.
 * 
 * @param	{Boolean}	        exclude		    if <code>true</code>, exclude free busy
 * @param	{AjxCallback}	    callback		the callback
 * @param	{AjxCallback}	    errorCallback	the error callback
 * @param   {ZmBatchCommand}    batchCmd        optional batch command
 */
ZmCalendar.prototype.setFreeBusy = 
function(exclude, callback, errorCallback, batchCmd) {
	if (this.excludeFreeBusy == exclude) { return; }
	// NOTE: Don't need to store the value since the response will
	//       report that the object was modified.
	this._organizerAction({action: "fb", attrs: {excludeFreeBusy: exclude ? "1" : "0"},
                           callback: callback, errorCallback: errorCallback, batchCmd: batchCmd});
};

ZmCalendar.prototype.setChecked = 
function(checked, batchCmd) {
	if (this.isChecked == checked) { return; }
	this.checkAction(checkAction, batchCmd);
};

ZmCalendar.prototype.checkAction = 
function(checked, batchCmd) {
	var action = checked ? "check" : "!check";
	var checkedCallback = new AjxCallback(this, this.checkedCallback, [checked]);
	this._organizerAction({action: action, batchCmd: batchCmd,callback: checkedCallback});
};

ZmCalendar.prototype.checkedCallback = 
function(checked, result) {
	var overviewController = appCtxt.getOverviewController();
	var treeController = overviewController.getTreeController(this.type);
	var overviewId = appCtxt.getCurrentApp().getOverviewId();
	var treeView = treeController.getTreeView(overviewId);

	if (treeView && this.id && treeView._treeItemHash[this.id]) {
		treeView._treeItemHash[this.id].setChecked(checked);
	}
};

/**
 * Checks if the given object(s) may be placed in this folder.
 *
 * For calendars being dragged, the current target cannot:
 *   - Be the parent of the dragged calendar
 *   - Be the dragged calendar
 *   - Be an ancestor of the dragged calendar
 *   - Contain a calendar with the same name as the dragged calendar
 *   - Be a shared calendar
 *
 * @param {Object}	what		the object(s) to possibly move into this folder (item or organizer)
 * @return	{Boolean}	<code>true</code> if the object may be placed in this folder
 */
ZmCalendar.prototype.mayContain =
function(what) {
    if (!what) { return true; }

    var invalid = false;
    if (what instanceof ZmCalendar) {
        // Calendar DnD, possibly nesting calendars
        invalid = ((what.parent == this) ||  (what.id == this.id)  || this.isChildOf(what) ||
                   (!this.isInTrash() && this.hasChild(what.name)) || this.link);
    } else {
        //exclude the deleted folders
        if(this.noSuchFolder) return invalid;

		if (this.nId == ZmOrganizer.ID_ROOT) {
			// cannot drag anything onto root folder
			invalid = true;
		} else if (this.link) {
			// cannot drop anything onto a read-only addrbook
			invalid = this.isReadOnly();
		}

		if (!invalid) {
			// An item or an array of items is being moved
			var items = (what instanceof Array) ? what : [what];
			var item = items[0];

			// can't move items to folder they're already in; we're okay if
			// we have one item from another folder
            if (item && item.folderId) {
                invalid = true;
                for (var i = 0; i < items.length; i++) {
                    var folder = appCtxt.getById(items[i].folderId);
                    if(items[i].isReadOnly() && folder.owner != this.owner) {
                        invalid = true;
                        break;
                    }
                    if (item.viewMode == ZmCalItem.MODE_NEW || folder != this) {
                        invalid = false;
                        break;
                    }

                }
            }
		}

	}

	return !invalid;
};


// Callbacks

ZmCalendar.prototype.notifyCreate =
function(obj) {
	var calendar = ZmFolderTree.createFromJs(this, obj, this.tree);
	var index = ZmOrganizer.getSortIndex(calendar, ZmFolder.sortCompareNonMail);
	this.children.add(calendar, index);
	calendar._notify(ZmEvent.E_CREATE);
};

ZmCalendar.prototype.notifyModify =
function(obj) {
	ZmFolder.prototype.notifyModify.call(this, obj);

	var doNotify = false;
	var fields = {};
	if (obj.f != null && !obj._isRemote) {
		this._parseFlags(obj.f);
		// TODO: Should a F_EXCLUDE_FB property be added to ZmOrganizer?
		//       It doesn't make sense to require the base class to know about
		//       all the possible fields in sub-classes. So I'm just using the
		//       modified property name as the key.
		fields["excludeFreeBusy"] = true;
		doNotify = true;
	}

	if (doNotify) {
		this._notify(ZmEvent.E_MODIFY, {fields: fields});
	}
};

ZmCalendar.prototype.notifyDelete =
function(obj) {

    if(this.isRemote() && !this._deleteAction){
        var overviewController = appCtxt.getOverviewController();
        var treeController = overviewController.getTreeController(this.type);
        var overviewId = appCtxt.getCurrentApp().getOverviewId();
        var treeView = treeController && treeController.getTreeView(overviewId);
        var node = treeView && treeView.getTreeItemById(this.id);
        this.noSuchFolder = true;
        if(node) {
            node.setText(this.getName(true));
        }
    }else{
        ZmFolder.prototype.notifyDelete.call(this, obj);
    }
};

ZmCalendar.prototype._delete = function(){
    this._deleteAction = true;
    ZmFolder.prototype._delete.call(this);
};

// Static methods

/**
 * Checks the calendar name.
 * 
 * @param	{String}	name		the name to check
 * @return	{String}	the valid calendar name
 */
ZmCalendar.checkName =
function(name) {
	return ZmOrganizer.checkName(name);
};

ZmCalendar.prototype.supportsPrivatePermission =
function() {
	return true;
};

// overriding ZmFolder.prototype.supportsPublicAccess
ZmCalendar.prototype.supportsPublicAccess =
function() {
	// calendars can be accessed outside of ZCS
	return true;
};

ZmCalendar.prototype.getRestUrl =
function(acct, noRemote) {

    if(!appCtxt.multiAccounts){
        return ZmFolder.prototype.getRestUrl.call(this, noRemote);
    }

	// return REST URL as seen by server
	if (this.restUrl) {
		return this.restUrl;
	}

	// if server doesn't tell us what URL to use, do our best to generate
	url = this._generateRestUrl(acct);
	DBG.println(AjxDebug.DBG3, "NO REST URL FROM SERVER. GENERATED URL: " + url);

	return url;
};

ZmCalendar.prototype._generateRestUrl =
function(acct) {
	var loc = document.location;
	var owner = this.getOwner();
	var uname = owner || appCtxt.get(ZmSetting.USERNAME);
    if (appCtxt.multiAccounts) {
        uname = appCtxt.get(ZmSetting.USERNAME, null, acct)
    }
	var m = uname.match(/^(.*)@(.*)$/);
	var host = loc.host || (m && m[2]);

	// REVISIT: What about port? For now assume other host uses same port
	if (loc.port && loc.port != 80 && (owner == appCtxt.get(ZmSetting.USERNAME))) {
		host = host + ":" + loc.port;
	}

	return [
		loc.protocol, "//", host, "/service/user/", uname, "/",
		AjxStringUtil.urlEncode(this.getSearchPath(true))
	].join("");
};


/**
 * Checks if the calendar is read-only.
 *
 * @return	{Boolean}	<code>true</code> if read-only
 */
ZmCalendar.prototype.isReadOnly =
function() {
	if (this.isFeed()) {
		return true; //feed calendar is read-only
	}
	return ZmFolder.prototype.isReadOnly.call(this);
};


/**
 * Checks if the calendar supports public access.
 *
 * @return	{Boolean}	always returns <code>true</code>
 */
ZmCalendar.prototype.supportsPublicAccess =
function() {
	// Overridden to allow sharing of calendar outside of ZCS
	return true;
};
}
if (AjxPackage.define("zimbraMail.calendar.model.ZmAppt")) {
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file defines an appointment.
 *
 */

/**
 * @class
 * This class represents a calendar item.
 *
 * @param	{ZmList}	list		the list
 * @param	{Boolean}	noinit		if <code>true</code>, do not initialize the appointment
 *
 * @extends ZmCalItem
 */
ZmAppt = function(list, noinit) {

	ZmCalItem.call(this, ZmItem.APPT, list);
	if (noinit) { return; }

	this.freeBusy = "B"; 														// Free/Busy status (F|B|T|O) (free/busy/tentative/outofoffice)
	this.privacy = "PUB";														// Privacy class (PUB|PRI|CON) (public/private/confidential)
	this.transparency = "O";
	this.startDate = new Date();
	this.endDate = new Date(this.startDate.getTime() + ZmCalViewController.DEFAULT_APPOINTMENT_DURATION);
	this.otherAttendees = false;
	this.rsvp = true;
    this.inviteNeverSent = true;

	// attendees by type
	this._attendees = {};
	this._attendees[ZmCalBaseItem.PERSON]	= [];
	this._attendees[ZmCalBaseItem.LOCATION]	= [];
	this._attendees[ZmCalBaseItem.EQUIPMENT]= [];

	this.origAttendees = null;	// list of ZmContact
	this.origLocations = null;	// list of ZmResource
	this.origEquipment = null;	// list of ZmResource

	// forward address
	this._fwdAddrs = {};    
};

ZmAppt.prototype = new ZmCalItem;
ZmAppt.prototype.constructor = ZmAppt;


// Consts

ZmAppt.MODE_DRAG_OR_SASH		= ++ZmCalItem.MODE_LAST;
ZmAppt.ATTENDEES_SEPARATOR		= "; ";

ZmAppt.ACTION_SAVE = "SAVE";
ZmAppt.ACTION_SEND = "SEND";

// Public methods

ZmAppt.prototype.toString =
function() {
	return "ZmAppt";
};

/**
 * Gets the attendees.
 * 
 * @param	{constant}		type		the type
 * @return	{Array}		an array of attendee objects
 * 
 * @see		ZmCalBaseItem.PERSON
 * @see		ZmCalBaseItem.LOCATION
 * @see		ZmCalBaseItem.EQUIPMENT
 */
ZmAppt.prototype.getAttendees =
function(type) {
	return this._attendees[type];
};

/**
 * Gets the attendee as text.
 * 
 * @param	{constant}		type		the type
 * @param	{Boolean}		inclDispName		if <code>true</code>, include the display name
 * 
 * @return	{String}	the attendee string
 */
ZmAppt.prototype.getAttendeesText =
function(type, inclDispName) {
	return ZmApptViewHelper.getAttendeesString(this._attendees[type], type, inclDispName);
};

/**
 * Checks if the appointment has attendees of the specified type.
 * 
 * @param	{constant}		type		the type
 * @return	{Boolean}	<code>true</code> if the appointment has 1 or more attendees
 */
ZmAppt.prototype.hasAttendeeForType =
function(type) {
	return (this._attendees[type].length > 0);
};

/**
 * Checks if the appointment has any attendees.
 * 
 * @return	{Boolean}	<code>true</code> if the appointment has 1 or more attendees
 */
ZmAppt.prototype.hasAttendees =
function() {
	return this.hasAttendeeForType(ZmCalBaseItem.PERSON) ||
		   this.hasAttendeeForType(ZmCalBaseItem.LOCATION) ||
		   this.hasAttendeeForType(ZmCalBaseItem.EQUIPMENT);
};

ZmAppt.prototype.setForwardAddress =
function(addrs) {
	this._fwdAddrs = addrs;
};

ZmAppt.prototype.getForwardAddress =
function() {
	return this._fwdAddrs;
};

// Public methods

ZmAppt.loadOfflineData =
function(apptInfo, list) {
    var appt = new ZmAppt(list);
    var recurrence;
    var alarmActions;
    var subObjects = {_recurrence:ZmRecurrence, alarmActions:AjxVector};
    for (var prop in apptInfo) {
        // PROBLEM: The indexeddb serialization/deserialization does not recreate the actual objects - for example,
        // a AjxVector is recreated as an object containing an array.  We really want a more generalized means, but
        // for the moment do custom deseralization here.   Also, assuming only one sublevel of custom objects
        if (subObjects[prop]) {
            var obj = new subObjects[prop]();
            for (var rprop in apptInfo[prop]) {
                obj[rprop] = apptInfo[prop][rprop];
            }
            appt[prop] = obj;
        } else {
            appt[prop] = apptInfo[prop];
        }
    }

    return appt;
}

/**
 * Used to make our own copy because the form will modify the date object by 
 * calling its setters instead of replacing it with a new date object.
 * 
 * @private
 */
ZmApptClone = function() { };
ZmAppt.quickClone = 
function(appt) {
	ZmApptClone.prototype = appt;

	var newAppt = new ZmApptClone();
	newAppt.startDate = new Date(appt.startDate.getTime());
	newAppt.endDate = new Date(appt.endDate.getTime());
	newAppt._uniqId = Dwt.getNextId();

	newAppt.origAttendees = AjxUtil.createProxy(appt.origAttendees);
	newAppt.origLocations = AjxUtil.createProxy(appt.origLocations);
	newAppt.origEquipment = AjxUtil.createProxy(appt.origEquipment);
	newAppt._validAttachments = AjxUtil.createProxy(appt._validAttachments);

	if (newAppt._orig == null) {
		newAppt._orig = appt;
	}
	newAppt.type = ZmItem.APPT;
	newAppt.rsvp = appt.rsvp;

	newAppt.freeBusy = appt.freeBusy;
    if (appt.isRecurring()) {
        newAppt._recurrence = appt.getRecurrence();
    }

    return newAppt;
};

ZmAppt.createFromDom =
function(apptNode, args, instNode, noCache) {
	var appt = new ZmAppt(args.list);
	appt._loadFromDom(apptNode, (instNode || {}));
    if (appt.id && !noCache) {
        appCtxt.cacheSet(appt.id, appt);
    }
	return appt;
};

/**
 * Gets the folder.
 * 
 * @return	{ZmFolder}		the folder
 */
ZmAppt.prototype.getFolder =
function() {
	return appCtxt.getById(this.folderId);
};

/**
 * Gets the tool tip. If it needs to make a server call, returns a callback instead.
 *
 * @param {ZmController}	controller	the controller
 * 
 * @return	{Hash|String}	the callback {Hash} or tool tip
 */
ZmAppt.prototype.getToolTip =
function(controller) {
	var appt = this.apptClone || this._orig || this;
	var needDetails = (!appt._toolTip || (appt.otherAttendees && !appt.ptstHashMap));
	if (needDetails) {
        return {callback:appt._getToolTip.bind(appt, controller), loading:false};
	} else {
		return appt._toolTip || appt._getToolTip(controller);
	}
};

ZmAppt.prototype._getToolTip =
function(controller, callback) {

	// getDetails() of original appt will reset the start date/time and will break the ui layout
	this.apptClone = ZmAppt.quickClone(this);
	var respCallback = this._handleResponseGetToolTip.bind(this.apptClone, controller, callback); //run the callback on the clone - otherwise we lost data such as freeBusy
	this.apptClone.getDetails(null, respCallback);
};

ZmAppt.prototype._handleResponseGetToolTip =
function(controller, callback) {
	var organizer = this.getOrganizer();
	var sentBy = this.getSentBy();
	var userName = appCtxt.get(ZmSetting.USERNAME);
	if (sentBy || (organizer && organizer != userName)) {
		organizer = (this.message && this.message.invite && this.message.invite.getOrganizerName()) || organizer;
		if (sentBy) {
			var contactsApp = appCtxt.getApp(ZmApp.CONTACTS);
			var contact = contactsApp && contactsApp.getContactByEmail(sentBy);
			sentBy = (contact && contact.getFullName()) || sentBy;
		}
	} else {
		organizer = null;
		sentBy = null;
	}

	var params = {
		appt: this,
		cal: (this.folderId != ZmOrganizer.ID_CALENDAR && controller) ? controller.getCalendar() : null,
		organizer: organizer,
		sentBy: sentBy,
		when: this.getDurationText(false, false),
		location: this.getLocation(),
		width: "250",
		hideAttendees: true
	};

	this.updateParticipantStatus();
	if (this.ptstHashMap != null) {
		var ptstStatus = {};
		var statusAttendees;
		var hideAttendees = true;

		statusAttendees = ptstStatus[ZmMsg.ptstAccept] = this._getPtstStatus(ZmCalBaseItem.PSTATUS_ACCEPT);
		hideAttendees = hideAttendees && !statusAttendees.count;

		statusAttendees = ptstStatus[ZmMsg.ptstDeclined] = this._getPtstStatus(ZmCalBaseItem.PSTATUS_DECLINED);
		hideAttendees = hideAttendees && !statusAttendees.count;

		statusAttendees = ptstStatus[ZmMsg.ptstTentative] = this._getPtstStatus(ZmCalBaseItem.PSTATUS_TENTATIVE);
		hideAttendees = hideAttendees && !statusAttendees.count;

		statusAttendees = ptstStatus[ZmMsg.ptstNeedsAction] = this._getPtstStatus(ZmCalBaseItem.PSTATUS_NEEDS_ACTION);
		hideAttendees = hideAttendees && !statusAttendees.count;
		params.hideAttendees = hideAttendees;
		params.ptstStatus = ptstStatus;

		var attendees = [];
		if (!this.rsvp) {
			var personAttendees = this._attendees[ZmCalBaseItem.PERSON];
			for (var i = 0; i < personAttendees.length; i++) {
				var attendee = personAttendees[i];
				attendees.push(attendee.getAttendeeText(null, true));
			}
			params.attendeesText = this.getAttendeeToolTipString(attendees);
		}
	}

	var toolTip = this._toolTip = AjxTemplate.expand("calendar.Appointment#Tooltip", params);
	if (callback) {
		callback.run(toolTip);
	} else {
		return toolTip;
	}
};

ZmAppt.prototype._getPtstStatus =
function(ptstHashKey) {
	var ptstString = this.ptstHashMap[ptstHashKey];

	return {
		count: ptstString ? ptstString.length : 0,
		attendees: this.getAttendeeToolTipString(ptstString)
	};
};

ZmAppt.prototype.getAttendeeToolTipString =
function(val) {
	var str;
	var maxLimit = 10;
	if (val && val.length > maxLimit) {
		var origLength = val.length;
		var newParts = val.splice(0, maxLimit);
		str = newParts.join(",") + " ("+ (origLength - maxLimit) +" " +  ZmMsg.more + ")" ;
	} else if (val) {
		str = val.join(",");
	}
	return str;
};

/**
 * Gets the summary for proposed time
 *
 * @param	{Boolean}	isHtml		if <code>true</code>, format as html
 * @return	{String}	the summary
 */
ZmAppt.prototype.getProposedTimeSummary =
function(isHtml) {
	var orig = this._orig || this;

	var buf = [];
	var i = 0;

	if (!this._summaryHtmlLineFormatter) {
		this._summaryHtmlLineFormatter = new AjxMessageFormat("<tr><th align='left'>{0}</th><td>{1} {2}</td></tr>");
		this._summaryTextLineFormatter = new AjxMessageFormat("{0} {1} {2}");
	}

	var formatter = isHtml ? this._summaryHtmlLineFormatter : this._summaryTextLineFormatter;

	if (isHtml) {
		buf[i++] = "<p>\n<table border='0'>\n";
	}

	var params = [ZmMsg.subjectLabel, this.name, ""];

	buf[i++] = formatter.format(params);
	buf[i++] = "\n";

	if (isHtml) {
		buf[i++] = "</table>";
	}
	buf[i++] = "\n";
	if (isHtml) {
		buf[i++] = "<p>\n<table border='0'>\n";
	}

	i = this.getApptTimeSummary(buf, i, isHtml, true);

	if (isHtml) {
		buf[i++] = "</table>\n";
	}
	buf[i++] = isHtml ? "<div>" : "\n\n";
	buf[i++] = ZmItem.NOTES_SEPARATOR;

	// bug fix #7835 - add <br> after DIV otherwise Outlook lops off 1st char
	buf[i++] = isHtml ? "</div><br>" : "\n\n";

	return buf.join("");
};

/**
 * Gets the summary.
 *
 * @param	{Boolean}	isHtml		if <code>true</code>, format as html
 * @return	{String}	the summary
 */
ZmAppt.prototype.getSummary =
function(isHtml) {

	if (this.isProposeTimeMode) {
		return this.getProposedTimeSummary(isHtml);
	}

	var orig = this._orig || this;

	var isEdit = !this.inviteNeverSent && (this.viewMode == ZmCalItem.MODE_EDIT ||
				  this.viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE ||
				  this.viewMode == ZmCalItem.MODE_EDIT_SERIES);

	var buf = [];
	var i = 0;

	if (!this._summaryHtmlLineFormatter) {
		this._summaryHtmlLineFormatter = new AjxMessageFormat("<tr><th align='left'>{0}</th><td>{1} {2}</td></tr>");
		this._summaryTextLineFormatter = new AjxMessageFormat("{0} {1} {2}");
	}
	var formatter = isHtml ? this._summaryHtmlLineFormatter : this._summaryTextLineFormatter;

	if (isHtml) {
		buf[i++] = "<p>\n<table border='0'>\n";
	}
	var modified = isEdit && (orig.getName() != this.getName());
	var params = [ ZmMsg.subjectLabel, AjxStringUtil.htmlEncode(this.name), modified ? ZmMsg.apptModifiedStamp : "" ];
	buf[i++] = formatter.format(params);
	buf[i++] = "\n";

	var userName = appCtxt.get(ZmSetting.USERNAME), displayName;
	var mailFromAddress = this.getMailFromAddress();
	if (mailFromAddress) {
		userName = mailFromAddress;
	} else if(this.identity) {
		userName = this.identity.sendFromAddress;
		displayName = this.identity.sendFromDisplay;
	}
	var organizer = this.organizer ? this.organizer : userName;
	var orgEmail = (!this.organizer && displayName)
		? (new AjxEmailAddress(userName, null, displayName)).toString()
		: ZmApptViewHelper.getAddressEmail(organizer).toString();
	var orgText = isHtml ? AjxStringUtil.htmlEncode(orgEmail) : orgEmail;
	var params = [ ZmMsg.organizer + ":", orgText, "" ];
	buf[i++] = formatter.format(params);
	buf[i++] = "\n";
	if (this.getFolder().isRemote() && this.identity) {
		var identity = this.identity;
		orgEmail = new AjxEmailAddress(identity.sendFromAddress , null, identity.sendFromDisplay);
		orgEmail = orgEmail.toString();
		orgText = isHtml ? AjxStringUtil.htmlEncode(orgEmail) : orgEmail;
		buf[i++] = formatter.format([ZmMsg.sentBy+":", orgText, ""]);
		buf[i++] = "\n";
	}
	if (isHtml) {
		buf[i++] = "</table>";
	}
	buf[i++] = "\n";
	if (isHtml) {
		buf[i++] = "<p>\n<table border='0'>\n";
	}

	var locationLabel = this.getLocation();
	var locationText = isHtml ? AjxStringUtil.htmlEncode(locationLabel) : locationLabel;
	var origLocationLabel = orig ? orig.getLocation() : "";
	var emptyLocation = (locationLabel == origLocationLabel && origLocationLabel == "");
	if (!emptyLocation || this.isForwardMode) {
		params = [ZmMsg.locationLabel, locationText, (isEdit && locationLabel != origLocationLabel && !this.isForwardMode ) ? ZmMsg.apptModifiedStamp : ""];
		buf[i++] = formatter.format(params);
		buf[i++] = "\n";
	}

	var location = this.getAttendeesText(ZmCalBaseItem.LOCATION, true);
	if (location) {
		var origLocationText = ZmApptViewHelper.getAttendeesString(this.origLocations, ZmCalBaseItem.LOCATION, true);
		modified = (isEdit && (origLocationText != location));
		var resourcesText = isHtml ? AjxStringUtil.htmlEncode(location) : location;
		params = [ZmMsg.resourcesLabel, resourcesText, modified ? ZmMsg.apptModifiedStamp : ""];
		buf[i++] = formatter.format(params);
		buf[i++] = "\n";
	}

	var equipment = this.getAttendeesText(ZmCalBaseItem.EQUIPMENT, true);
	if (equipment) {
		var origEquipmentText = ZmApptViewHelper.getAttendeesString(this.origEquipment, ZmCalBaseItem.EQUIPMENT, true);
		modified = (isEdit && (origEquipmentText != equipment));
		var equipmentText = isHtml ? AjxStringUtil.htmlEncode(equipment) : equipment;
		params = [ZmMsg.resourcesLabel, equipmentText, modified ? ZmMsg.apptModifiedStamp : "" ];
		buf[i++] = formatter.format(params);
		buf[i++] = "\n";
	}

	i = this.getApptTimeSummary(buf, i, isHtml, isEdit);
	i = this.getRecurrenceSummary(buf, i, isHtml, isEdit);

	if (this._attendees[ZmCalBaseItem.PERSON].length) {
		if (isHtml) {
			buf[i++] = "</table>\n<p>\n<table border='0'>";
		}
		buf[i++] = "\n";
		var reqAttString = ZmApptViewHelper.getAttendeesByRole(this._attendees[ZmCalBaseItem.PERSON], ZmCalBaseItem.PERSON, ZmCalItem.ROLE_REQUIRED, 10);
		var optAttString = ZmApptViewHelper.getAttendeesByRole(this._attendees[ZmCalBaseItem.PERSON], ZmCalBaseItem.PERSON, ZmCalItem.ROLE_OPTIONAL, 10);
		var reqAttText = isHtml ? AjxStringUtil.htmlEncode(reqAttString) : reqAttString;
		var optAttText = isHtml ? AjxStringUtil.htmlEncode(optAttString) : optAttString;

		var attendeeTitle = (optAttString == "") ? ZmMsg.invitees : ZmMsg.requiredInvitees ;
		params = [ attendeeTitle + ":", reqAttText, "" ];
		buf[i++] = formatter.format(params);
		buf[i++] = "\n";

		params = [ ZmMsg.optionalInvitees + ":", optAttText, "" ];
		if (optAttString != "") {
			buf[i++] = formatter.format(params);
		}

	}
	if (isHtml) {
		buf[i++] = "</table>\n";
	}
	buf[i++] = isHtml ? "<div>" : "\n\n";
	buf[i++] = ZmItem.NOTES_SEPARATOR;
	// bug fix #7835 - add <br> after DIV otherwise Outlook lops off 1st char
	buf[i++] = isHtml ? "</div><br>" : "\n\n";

	return buf.join("");
};

/**
 * Checks whether appointment needs a recurrence info in summary
 *
 * @return	{Boolean}	returns whether appointment needs recurrence summary
 */
ZmAppt.prototype.needsRecurrenceSummary =
function() {
	return this._recurrence.repeatType != "NON" &&
			this.viewMode != ZmCalItem.MODE_EDIT_SINGLE_INSTANCE &&
			this.viewMode != ZmCalItem.MODE_DELETE_INSTANCE;
};

/**
 * Returns an object with layout coordinates for this appointment.
 */
ZmAppt.prototype.getLayoutInfo =
function() {
	return this._layout;
};

/**
 * Gets the appointment time summary.
 *
 * @param	{Array}	    buf		    buffer array to fill summary content
 * @param	{Integer}	i		    buffer array index to start filling
 * @param	{Boolean}	isHtml		if <code>true</code>, format as html
 * @param	{Boolean}	isEdit		if view mode is edit/edit instance/edit series
 * @return	{String}	the appointment time summary
 */
ZmAppt.prototype.getApptTimeSummary =
function(buf, i, isHtml, isEdit) {
	var formatter = isHtml ? this._summaryHtmlLineFormatter : this._summaryTextLineFormatter;
	var orig = this._orig || this;
	var s = this.startDate;
	var e = this.endDate;

	if (this.viewMode == ZmCalItem.MODE_DELETE_INSTANCE) {
		s = this.getUniqueStartDate();
		e = this.getUniqueEndDate();
	}

	if (this.needsRecurrenceSummary())
	{
		var hasTime = isEdit
			? ((orig.startDate.getTime() != s.getTime()) || (orig.endDate.getTime() != e.getTime()))
			: false;
		params = [ ZmMsg.time + ":", this._getTextSummaryTime(isEdit, ZmMsg.time, null, s, e, hasTime), "" ];
		buf[i++] = formatter.format(params);
	}
	else if (s.getFullYear() == e.getFullYear() &&
			 s.getMonth() == e.getMonth() &&
			 s.getDate() == e.getDate())
	{
		var hasTime = isEdit
			? ((orig.startDate.getTime() != this.startDate.getTime()) || (orig.endDate.getTime() != this.endDate.getTime()))
			: false;
		params = [ ZmMsg.time + ":", this._getTextSummaryTime(isEdit, ZmMsg.time, s, s, e, hasTime), "" ];
		buf[i++] = formatter.format(params);
	}
	else
	{
		var hasTime = isEdit ? (orig.startDate.getTime() != this.startDate.getTime()) : false;
		params = [ ZmMsg.startLabel, this._getTextSummaryTime(isEdit, ZmMsg.start, s, s, null, hasTime), "" ];
		buf[i++] = formatter.format(params);

		hasTime = isEdit ? (orig.endDate.getTime() != this.endDate.getTime()) : false;
		params = [ ZmMsg.endLabel, this._getTextSummaryTime(isEdit, ZmMsg.end, e, null, e, hasTime), "" ];
		buf[i++] = formatter.format(params);
	}

	return i;
};

/**
 * Gets the recurrence summary.
 *
 * @param	{Array}	    buf		    buffer array to fill summary content
 * @param	{Integer}	i		    buffer array index to start filling
 * @param	{Boolean}	isHtml		if <code>true</code>, format as html
 * @param	{Boolean}	isEdit		if view mode is edit/edit instance/edit series
 * @return	{String}	the recurrence summary
 */
ZmAppt.prototype.getRecurrenceSummary =
function(buf, i, isHtml, isEdit) {
	var formatter = isHtml ? this._summaryHtmlLineFormatter : this._summaryTextLineFormatter;
	var orig = this._orig || this;

	if (this.needsRecurrenceSummary()) {
		var modified = false;
		if (isEdit) {
			modified = orig._recurrence.repeatType != this._recurrence.repeatType ||
					orig._recurrence.repeatCustom != this._recurrence.repeatCustom ||
					orig._recurrence.repeatCustomType != this._recurrence.repeatCustomType ||
					orig._recurrence.repeatCustomCount != this._recurrence.repeatCustomCount ||
					orig._recurrence.repeatCustomOrdinal != this._recurrence.repeatCustomOrdinal ||
					orig._recurrence.repeatCustomDayOfWeek != this._recurrence.repeatCustomDayOfWeek ||
					orig._recurrence.repeatCustomMonthDay != this._recurrence.repeatCustomMonthDay ||
					orig._recurrence.repeatEnd != this._recurrence.repeatEnd ||
					orig._recurrence.repeatEndType != this._recurrence.repeatEndType ||
					orig._recurrence.repeatEndCount != this._recurrence.repeatEndCount ||
					orig._recurrence.repeatEndDate != this._recurrence.repeatEndDate ||
					orig._recurrence.repeatWeeklyDays != this._recurrence.repeatWeeklyDays ||
					orig._recurrence.repeatMonthlyDayList != this._recurrence.repeatMonthlyDayList ||
					orig._recurrence.repeatYearlyMonthsList != this._recurrence.repeatYearlyMonthsList;
		}
		params = [ ZmMsg.recurrence, ":", this._recurrence.getBlurb(), modified ? ZmMsg.apptModifiedStamp : "" ];
		buf[i++] = formatter.format(params);
		buf[i++] = "\n";
	}
	return i;
};

/**
* Sets the attendees (person, location, or equipment) for this appt.
*
* @param {Array}	list	the list of email {String}, {@link AjxEmailAddress}, {@link ZmContact}, or {@link ZmResource}
* @param	{constant}	type		the type
*/
ZmAppt.prototype.setAttendees =
function(list, type) {
	this._attendees[type] = [];
	list = (list instanceof Array) ? list : [list];
	for (var i = 0; i < list.length; i++) {
		var attendee = ZmApptViewHelper.getAttendeeFromItem(list[i], type);
		if (attendee) {
			this._attendees[type].push(attendee);
		}
	}
};

ZmAppt.prototype.setFromMailMessage =
function(message, subject) {
	ZmCalItem.prototype.setFromMailMessage.call(this, message, subject);

	// Only unique names in the attendee list, plus omit our own name
	var account = appCtxt.multiAccounts ? message.getAccount() : null;
	var used = {};
	used[appCtxt.get(ZmSetting.USERNAME, null, account)] = true;
	var addrs = message.getAddresses(AjxEmailAddress.FROM, used, true);
	addrs.addList(message.getAddresses(AjxEmailAddress.CC, used, true));
	addrs.addList(message.getAddresses(AjxEmailAddress.TO, used, true));
	this._attendees[ZmCalBaseItem.PERSON] = addrs.getArray();
};


ZmAppt.prototype.setFromMailMessageInvite =
function(message) {
	var invite = message.invite;
	var viewMode = (!invite.isRecurring()) ? ZmCalItem.MODE_FORWARD : ZmCalItem.MODE_FORWARD_SERIES;

	if (invite.isRecurring() && invite.isException()) {
		viewMode = ZmCalItem.MODE_FORWARD_SINGLE_INSTANCE;
	}

	this.setFromMessage(message, viewMode);
	this.name = message.subject;
	this.location = message.invite.getLocation();
	this.allDayEvent = message.invite.isAllDayEvent();
	if (message.apptId) {
		this.invId = message.apptId;
	}

	this.uid = message.invite.components ? message.invite.components[0].uid : null;

	if (this.isForwardMode) {
		this.forwardInviteMsgId = message.id;
		if (!invite.isOrganizer()) {
			this.name = ZmMsg.fwd + ": " + message.subject;
		}
		this.status = invite.components ? invite.components[0].status : ZmCalendarApp.STATUS_CONF;
	}

	if (this.isProposeTimeMode) {
		this.proposeInviteMsgId = message.id;
		//bug: 49315 - use local timezone while proposing time
		this.convertToLocalTimezone();
		if (!this.ridZ) {
			this.ridZ = message.invite.components ? message.invite.components[0].ridZ : null;
		}
		this.seq = message.invite.getSequenceNo();
	}
};

/**
 * Checks if the appointment is private.
 * 
 * @return	{Boolean}	<code>true</code> if the appointment is private
 */
ZmAppt.prototype.isPrivate =
function() {
	return (this.privacy != "PUB");
};

ZmAppt.prototype.setPrivacy =
function(privacy) {
	this.privacy = privacy;
};

// Private / Protected methods

ZmAppt.prototype._setExtrasFromMessage =
function(message) {
    ZmCalItem.prototype._setExtrasFromMessage.apply(this, arguments);

	this.freeBusy = message.invite.getFreeBusy();
	this.privacy = message.invite.getPrivacy();

	var ptstReplies = {};
	this._replies = message.invite.getReplies();
	if (this._replies) {
		for (var i = 0; i < this._replies.length; i++) {
			var name = this._replies[i].at;
			var ptst = this._replies[i].ptst;
			if (name && ptst) {
				ptstReplies[name] = ptst;
			}
		}
	}

	// parse out attendees for this invite
	this._attendees[ZmCalBaseItem.PERSON] = [];
	this.origAttendees = [];
	var rsvp;
	var attendees = message.invite.getAttendees();
	if (attendees) {
		var ac = window.parentAppCtxt || window.appCtxt;
		for (var i = 0; i < attendees.length; i++) {
			var att = attendees[i];
			var addr = att.a;
			var name = att.d;
			var email = new AjxEmailAddress(addr, null, name, null, att.isGroup, att.isGroup && att.exp);
			ac.setIsExpandableDL(att.a, email.canExpand);
            if (att.rsvp) {
				rsvp = true;
			}
			var type = att.isGroup ? ZmCalBaseItem.GROUP : ZmCalBaseItem.PERSON;
			var attendee = ZmApptViewHelper.getAttendeeFromItem(email, type);
			if (attendee) {
				attendee.setParticipantStatus(ptstReplies[addr] || att.ptst);
				attendee.setParticipantRole(att.role || ZmCalItem.ROLE_REQUIRED);
				this._attendees[ZmCalBaseItem.PERSON].push(attendee);
				this.origAttendees.push(attendee);
			}
		}
	}

	// location/equpiment are known as resources now
	this._attendees[ZmCalBaseItem.LOCATION] = [];
	this.origLocations = [];
	this._ptstLocationMap = {};

	this._attendees[ZmCalBaseItem.EQUIPMENT] = [];
	this.origEquipment = [];

	var resources = message.invite.getResources();	// returns all the invite's resources
	if (resources) {
		for (var i = 0; i < resources.length; i++) {
			var addr = resources[i].a;
			var resourceName = resources[i].d;
			var ptst = resources[i].ptst;
			if (resourceName && ptst && (this._ptstLocationMap[resourceName] != null)) {
				this._ptstLocationMap[resourceName].setParticipantStatus(ptstReplies[addr] || ptst);
			}
			if (resources[i].rsvp) {
				rsvp = true;
			}
			// if multiple resources are present (i.e. aliases) select first one
			var resourceEmail = AjxEmailAddress.split(resources[i].a)[0];

			var location = ZmApptViewHelper.getAttendeeFromItem(resourceEmail, ZmCalBaseItem.LOCATION, false, false, true);
			if (location || this.isLocationResource(resourceEmail, resources[i].d)) {
                if(!location) location = ZmApptViewHelper.getAttendeeFromItem(resourceEmail, ZmCalBaseItem.LOCATION);
                if(!location) continue;
                if(resources[i].d) location.setAttr(ZmResource.F_locationName, resources[i].d);

                location.setParticipantStatus(ptstReplies[resourceEmail] || ptst);
				this._attendees[ZmCalBaseItem.LOCATION].push(location);
				this.origLocations.push(location);
			} else {
				var equipment = ZmApptViewHelper.getAttendeeFromItem(resourceEmail, ZmCalBaseItem.EQUIPMENT);
				if (equipment) {
					equipment.setParticipantStatus(ptstReplies[resourceEmail] || ptst);
					this._attendees[ZmCalBaseItem.EQUIPMENT].push(equipment);
					this.origEquipment.push(equipment);
				}
			}
		}
	}

	this.rsvp = rsvp;
	if (message.invite.hasOtherAttendees()) {
		if (this._orig) {
			this._orig.setRsvp(rsvp);
		}
	}

    // bug 53414: For a personal appt. consider inviteNeverSent=true always.
    // Wish this was handled by server.
    if(!this.isDraft && !this.hasAttendees()){
        this.inviteNeverSent = true;
    }

    if (!this.status) {
        this.status = message.invite.getStatus();
    }

    if (!this.transparency) {
        this.transparency = message.invite.getTransparency();
    }
};

ZmAppt.prototype.isLocationResource =
function(resourceEmail, displayName) {
	var locationStr = this.location;
    var items = AjxEmailAddress.split(locationStr);

    for (var i = 0; i < items.length; i++) {

        var item = AjxStringUtil.trim(items[i]);
        if (!item) { continue; }

        if(displayName == item) return true;

        var contact = AjxEmailAddress.parse(item);
        if (!contact) { continue; }

        var name = contact.getName() || contact.getDispName();

        if(resourceEmail == contact.getAddress() || displayName == name) return true;
    }

    return false;
};

ZmAppt.prototype._getTextSummaryTime =
function(isEdit, fieldstr, extDate, start, end, hasTime) {
	var showingTimezone = appCtxt.get(ZmSetting.CAL_SHOW_TIMEZONE);

	var buf = [];
	var i = 0;

	if (extDate) {
		buf[i++] = AjxDateUtil.longComputeDateStr(extDate);
		buf[i++] = ", ";
	}
	if (this.isAllDayEvent()) {
		buf[i++] = ZmMsg.allDay;
	} else {
		var formatter = AjxDateFormat.getTimeInstance();
		if (start) {
			buf[i++] = formatter.format(start);
		}
		if (start && end) {
			buf[i++] = " - ";
		}
		if (end) {
			buf[i++] = formatter.format(end);
		}
		//if (showingTimezone) { Commented for bug 13897
			buf[i++] = " ";
			buf[i++] = AjxTimezone.getLongName(AjxTimezone.getClientId(this.timezone));
		//}
	}
	// NOTE: This relies on the fact that setModel creates a clone of the
	//		 appointment object and that the original object is saved in 
	//		 the clone as the _orig property.
	if (isEdit && ((this._orig && this._orig.isAllDayEvent() != this.isAllDayEvent()) || hasTime)) {
		buf[i++] = " ";
		buf[i++] = ZmMsg.apptModifiedStamp;
	}
	buf[i++] = "\n";

	return buf.join("");
};

ZmAppt.prototype._loadFromDom =
function(calItemNode, instNode) {
	ZmCalItem.prototype._loadFromDom.call(this, calItemNode, instNode);

	this.privacy = this._getAttr(calItemNode, instNode, "class");
	this.transparency = this._getAttr(calItemNode, instNode, "transp");
	this.otherAttendees = this._getAttr(calItemNode, instNode, "otherAtt");
	this.location = this._getAttr(calItemNode, instNode, "loc");
    this.isDraft = this._getAttr(calItemNode, instNode, "draft");
    this.inviteNeverSent = this._getAttr(calItemNode, instNode, "neverSent") || false;
    this.hasEx = this._getAttr(calItemNode, instNode, "hasEx") || false;
};

ZmAppt.prototype._getRequestNameForMode =
function(mode, isException) {
	switch (mode) {
		case ZmCalItem.MODE_NEW:
		case ZmCalItem.MODE_NEW_FROM_QUICKADD:
		case ZmAppt.MODE_DRAG_OR_SASH:
			return "CreateAppointmentRequest";

		case ZmCalItem.MODE_EDIT_SINGLE_INSTANCE:
			return !isException
				? "CreateAppointmentExceptionRequest"
				: "ModifyAppointmentRequest";

		case ZmCalItem.MODE_EDIT:
		case ZmCalItem.MODE_EDIT_SERIES:
			return "ModifyAppointmentRequest";

		case ZmCalItem.MODE_DELETE:
		case ZmCalItem.MODE_DELETE_SERIES:
		case ZmCalItem.MODE_DELETE_INSTANCE:
			return "CancelAppointmentRequest";
			
		case ZmCalItem.MODE_PURGE:
			return "ItemActionRequest";
			
		case ZmCalItem.MODE_FORWARD:
		case ZmCalItem.MODE_FORWARD_SERIES:
		case ZmCalItem.MODE_FORWARD_SINGLE_INSTANCE:
			return "ForwardAppointmentRequest";

		case ZmCalItem.MODE_FORWARD_INVITE:
			return "ForwardAppointmentInviteRequest";

		case ZmCalItem.MODE_GET:
			return "GetAppointmentRequest";

		case ZmCalItem.MODE_PROPOSE_TIME:
			return "CounterAppointmentRequest";
	}

	return null;
};

ZmAppt.prototype._addExtrasToRequest =
function(request, comp) {
	ZmCalItem.prototype._addExtrasToRequest.call(this, request, comp);

    comp.fb = this.freeBusy;
    comp['class'] = this.privacy; //using ['class'] to avoid build error as class is reserved word
    comp.transp = this.transparency;
    //Add Draft flag
    var draftFlag = false;
    if(!this.isSend && this.hasAttendees()){
        draftFlag = this.isDraft || this.makeDraft;
    }
    comp.draft = draftFlag ? 1 : 0;

    if(!this.isSend && this.hasAttendees()){
        request.echo = "1";
    }
};

ZmAppt.prototype.setRsvp =
function(rsvp) {
   this.rsvp = rsvp;
};

ZmAppt.prototype.shouldRsvp =
function() {
	return this.rsvp;
};

ZmAppt.prototype.updateParticipantStatus =
function() {
	if (this._orig) {
		return this._orig.updateParticipantStatus();
	}

	var ptstHashMap = {};
	var personAttendees = this._attendees[ZmCalBaseItem.PERSON];
	for (var i = 0; i < personAttendees.length; i++) {
		var attendee = personAttendees[i];
		var ptst = attendee.getParticipantStatus() || "NE";
		if (!ptstHashMap[ptst]) {
			ptstHashMap[ptst] = [];
		}
		ptstHashMap[ptst].push(attendee.getAttendeeText(null, true));
	}
	this.ptstHashMap = ptstHashMap;
};

ZmAppt.prototype.addAttendeesToChckConflictsRequest =
function(request) {
    var type,
        usr,
        i,
        attendee,
        address;
	for (type in this._attendees) {
        //consider only location & equipments for conflict check
        if (type == ZmCalBaseItem.PERSON) {
            continue;
        }

		if (this._attendees[type] && this._attendees[type].length) {
            usr = request.usr = [];

            for (i = 0; i < this._attendees[type].length; i++) {
				//this._addAttendeeToSoap(soapDoc, inv, m, notifyList, this._attendees[type][i], type);
				attendee = this._attendees[type][i];
				address = null;
				if (attendee._inviteAddress) {
					address = attendee._inviteAddress;
					delete attendee._inviteAddress;
				} else {
					address = attendee.getEmail();
				}
				if (!address) continue;

				if (address instanceof Array) {
					address = address[0];
				}
				usr.push({
                    name : address
                });
			}
		}
	}
};

ZmAppt.prototype.send =
function(attachmentId, callback, errorCallback, notifyList){
    this._mode = ZmAppt.ACTION_SEND;
    this.isSend = true;
    ZmCalItem.prototype.save.call(this, attachmentId, callback, errorCallback, notifyList);
};

ZmAppt.prototype.save =
function(attachmentId, callback, errorCallback, notifyList, makeDraft){
    this._mode = ZmAppt.ACTION_SAVE;
    this.isSend = false;
    this.makeDraft = AjxUtil.isUndefined(makeDraft) ? this.hasAttendees() : makeDraft;
    ZmCalItem.prototype.save.call(this, attachmentId, callback, errorCallback, notifyList);
};

ZmAppt.prototype._doCancel =
function(mode, callback, msg, batchCmd, result){
    this._mode = ZmAppt.ACTION_SEND;
    this.isSend = true;
    ZmCalItem.prototype._doCancel.call(this, mode, callback, msg, batchCmd, result);
};

ZmAppt.prototype._sendCancelMsg =
function(callback){
    this.send(null, callback);  
};

ZmAppt.prototype._addAttendeesToRequest =
function(inv, m, notifyList, onBehalfOf, request) {
    var dispNamesNotifyList = this._dispNamesNotifyList = {};
	for (var type in this._attendees) {
		if (this._attendees[type] && this._attendees[type].length) {
			for (var i = 0; i < this._attendees[type].length; i++) {
				this._addAttendeeToRequest(inv, m, notifyList, this._attendees[type][i], type, request);
			}
		}
	}

	// if we have a separate list of email addresses to notify, do it here
	if (this._sendNotificationMail && this.isOrganizer() && m && notifyList && this.isSend) {
		for (var i = 0; i < notifyList.length; i++) {
			var e,
                address = notifyList[i],
                dispName = dispNamesNotifyList[address];

            e = {
                a : address,
                t : AjxEmailAddress.toSoapType[AjxEmailAddress.TO]
            };
            if (dispName) {
                e.p = dispName;
            }
            m.e.push(e);
		}
	}

	if (this.isOrganizer()) {
		// call base class LAST
		ZmCalItem.prototype._addAttendeesToRequest.call(this, inv, m, notifyList, onBehalfOf);
	}
    delete this._dispNamesNotifyList;
};

ZmAppt.prototype._addAttendeeToRequest =
function(inv, m, notifyList, attendee, type, request) {
	var address;
	if (attendee._inviteAddress) {
		address = attendee._inviteAddress;
		delete attendee._inviteAddress;
	} else {
		address = attendee.getLookupEmail() || attendee.getEmail();
	}
	if (!address) return;

	var dispName = attendee.getFullName();
	if (inv) {
		var at = {};
		// for now make attendees optional, until UI has a way of setting this
		var role = ZmCalItem.ROLE_NON_PARTICIPANT;
		if (type == ZmCalBaseItem.PERSON) {
			role = attendee.getParticipantRole() ? attendee.getParticipantRole() : ZmCalItem.ROLE_REQUIRED;
		}
		at.role = role;
		var ptst = attendee.getParticipantStatus();
		if (!ptst || type === ZmCalBaseItem.PERSON && this.dndUpdate) {  //Bug 56639 - special case for drag-n-drop since the ptst was not updated correctly as we didn't have the informations about attendees and changes.
			ptst = ZmCalBaseItem.PSTATUS_NEEDS_ACTION
		}
		if (notifyList) {
			var attendeeFound = false;
			for (var i = 0; i < notifyList.length; i++) {
				if (address == notifyList[i]) {
					attendeeFound = true;
					break;
				}
			}
			ptst = attendeeFound
				? ZmCalBaseItem.PSTATUS_NEEDS_ACTION
				: (attendee.getParticipantStatus() || ZmCalBaseItem.PSTATUS_NEEDS_ACTION);
            if(attendeeFound && dispName) {
                // If attendees is found in notify list and has display name,
                // add it to object for future reference
                this._dispNamesNotifyList[address] = dispName;
            }
		}
		at.ptst = ptst;

		var rsvpVal = this.rsvp ? "1" : "0";
		if (type != ZmCalBaseItem.PERSON) {
			at.cutype = ZmCalendarApp.CUTYPE_RESOURCE;
			if(this.isOrganizer()) {
				rsvpVal = "1";
			}
		}
		if (this._cancelFutureInstances) {
			rsvpVal = "0";
		}
		at.rsvp = rsvpVal;

		if (address instanceof Array) {
			address = address[0];
		}
		at.a = address;

		if (dispName) {
			at.d = dispName;
		}
        inv.at.push(at);
	}

	// set email to notify if notifyList not provided
	if (this._sendNotificationMail && this.isOrganizer() && m && !notifyList && !this.__newFolderId && this.isSend) {
        var e = {};
        e.a = address;
		if (dispName) {
            e.p = dispName;
		}
        e.t = AjxEmailAddress.toSoapType[AjxEmailAddress.TO];
        m.e.push(e);
	}
};

ZmAppt.prototype.replaceAttendee =
function(oldAttendee,newAttendee){
   var attendees = this._attendees[ZmCalBaseItem.PERSON];
   if(attendees && attendees.length){
    for(var a=0;a<attendees.length;a++){
        if(attendees[a].getEmail()==oldAttendee){
            attendees[a]=this._createAttendeeFromMail(newAttendee);
            break;
        }
    }
   }
   this._attendees[ZmCalBaseItem.PERSON]=attendees;
}

ZmAppt.prototype._createAttendeeFromMail=
function(mailId){
    var attendee=new ZmContact(null);
    attendee.initFromEmail(mailId);
    return attendee;
}

ZmAppt.prototype._getInviteFromError =
function(result) {
	return (result._data.GetAppointmentResponse.appt[0].inv[0]);
};


ZmAppt.prototype.forwardInvite =
function(callback, errorCallback, mode) {
    var jsonObj = {},
        requestName = this._getRequestNameForMode(ZmCalItem.MODE_FORWARD_INVITE, this.isException),
        request = jsonObj[requestName] = {
            _jsns : "urn:zimbraMail"
        },
        m = request.m = {},
        accountName = this.getRemoteFolderOwner(),
        mailFromAddress = this.getMailFromAddress(),
        e = m.e = [],
        addrs = this._fwdAddrs,
        attendee,
        address,
        name,
        i;

	if (this.forwardInviteMsgId) {
        request.id = this.forwardInviteMsgId;
	}

	m.su = this.name;
	this.isForwardMode = true;
	this._addNotesToRequest(m);

	if (this.isOrganizer() && !accountName && mailFromAddress) {
        e.push({
            a : mailFromAddress,
		    t : AjxEmailAddress.toSoapType[AjxEmailAddress.FROM]
        });
	}

	for (i = 0; i < addrs.length; i++) {
		attendee = addrs[i];
        name = "";

		if (attendee._inviteAddress) {
			address = attendee._inviteAddress;
			delete attendee._inviteAddress;
		}
        else if (attendee.isAjxEmailAddress) {
			address = attendee.address;
			name = attendee.dispName || attendee.name
		}
        else if (attendee instanceof ZmContact) {
			address = attendee.getEmail();
			name = attendee.getFullName();
		}
		if (!address) {
            continue;
        }
		if (address instanceof Array) {
			address = address[0];
		}

		this._addAddressToRequest(m, address, AjxEmailAddress.toSoapType[AjxEmailAddress.TO], name);
	}

	this._sendRequest(null, accountName, callback, errorCallback, jsonObj, requestName);
};

ZmAppt.prototype.setForwardMode =
function(forwardMode) {
	this.isForwardMode = forwardMode;
};

ZmAppt.prototype.setProposeTimeMode =
function(isProposeTimeMode) {
	this.isProposeTimeMode = isProposeTimeMode;
};

ZmAppt.prototype.sendCounterAppointmentRequest =
function(callback, errorCallback, viewMode) {
	var mode = ZmCalItem.MODE_PROPOSE_TIME,
        jsonObj = {},
        requestName = this._getRequestNameForMode(mode, this.isException),
        request = jsonObj[requestName] = {
            _jsns : "urn:zimbraMail"
        },
        m = request.m = {},
        e = m.e = [],
        inv = m.inv = {},
        comps = inv.comp = [],
        comp = inv.comp[0] = {},
        calendar = this.getFolder(),
    	acct = calendar.getAccount(),
    	accountName = this.getRemoteFolderOwner(),
    	localAcctName = this.getFolder().getAccount().name,
        cif = this._currentlyLoaded && this._currentlyLoaded.cif,
    	isOnBehalfOf = accountName && localAcctName && localAcctName != accountName,
    	mailFromAddress = this.getMailFromAddress(),
        orgEmail,
        orgAddress,
        exceptId,
        me,
        organizer,
        user,
        org,
        orgName;

    this._addInviteAndCompNum(request);
    m.su = ZmMsg.subjectNewTime + ": " + this.name;
    if (this.isOrganizer() && !accountName && mailFromAddress) {
		e.push({
            a : mailFromAddress,
		    t : AjxEmailAddress.toSoapType[AjxEmailAddress.FROM]
        });
	} else if (isOnBehalfOf || cif) {
        e.push({
            a : isOnBehalfOf ? accountName: cif,
            t : AjxEmailAddress.toSoapType[AjxEmailAddress.FROM]
        });
        e.push({
            a : localAcctName,
            t : AjxEmailAddress.toSoapType[AjxEmailAddress.SENDER]
        });
    }

	if(this.organizer) {
		orgEmail = ZmApptViewHelper.getOrganizerEmail(this.organizer);
		orgAddress = orgEmail.getAddress();
		e.push({
            a : orgAddress,
		    t : AjxEmailAddress.toSoapType[AjxEmailAddress.TO]
        });
	}
    //Do not add exceptId if propose new time for series
	if (this.ridZ && viewMode != ZmCalItem.MODE_EDIT_SERIES) {
		exceptId = comp.exceptId = {};
		exceptId.d = this.ridZ;
	}

	// subject/location
	comp.name = this.name;
	if (this.uid != null && this.uid != -1) {
		comp.uid = this.uid;
	}

	if (this.seq) {
		comp.seq = this.seq;
	}

	this._addDateTimeToRequest(request, comp);
	this._addNotesToRequest(m);

	// set organizer - but not for local account
	if (!(appCtxt.isOffline && acct.isMain)) {
		me = (appCtxt.multiAccounts) ? acct.getEmail() : appCtxt.get(ZmSetting.USERNAME);
		user = mailFromAddress || me;
		organizer = this.organizer || user;
		org = comp.or = {};
		org.a = organizer;
		if (calendar.isRemote()) {
			org.sentBy = user; // if on-behalf of, set sentBy
		}
		orgEmail = ZmApptViewHelper.getOrganizerEmail(this.organizer);
		orgName = orgEmail.getName();
		if (orgName) {
            org.d = orgName;
        }
	}

	this._sendRequest(null, accountName, callback, errorCallback, jsonObj, requestName);
};

ZmAppt.prototype.forward =
function(callback, errorCallback) {
	var mode = ZmCalItem.MODE_FORWARD,
	    needsExceptionId = this.isException;

	if (this.viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE) {
		mode = ZmCalItem.MODE_FORWARD_SINGLE_INSTANCE;
		if (!this.isException) {
			needsExceptionId = true;
		}
	} else if(this.viewMode == ZmCalItem.MODE_EDIT_SERIES) {
		mode = ZmCalItem.MODE_FORWARD_SERIES;
	}

	if (this.forwardInviteMsgId) {
		this.forwardInvite(callback, errorCallback, mode);
		return;
	}

    var jsonObj = {},
        requestName = this._getRequestNameForMode(mode, this.isException),
        request = jsonObj[requestName] = {
            _jsns : "urn:zimbraMail"
        },
        exceptId,
        message,
        invite,
        exceptIdInfo,
        allDay,
        sd,
        tz,
        timezone,
        m = request.m = {},
        accountName = this.getRemoteFolderOwner(),
    	mailFromAddress = this.getMailFromAddress(),
        e = m.e = [],
        addrs = this._fwdAddrs,
        attendee,
        address,
        name,
        i;

	if (this.uid != null && this.uid != -1) {
        request.id = this.id;
	}

	if (needsExceptionId) {
		exceptId = request.exceptId = {};
		if (this.isException) {
			message = this.message ? this.message : null;
			invite = (message && message.invite) ? message.invite : null;
			exceptIdInfo = invite.getExceptId();
			exceptId.d = exceptIdInfo.d;
			if (exceptIdInfo.tz) {
				exceptId.tz = exceptIdInfo.tz;
			}
		} else {
			allDay = this._orig ? this._orig.allDayEvent : this.allDayEvent;
			if (allDay != "1") {
				sd = AjxDateUtil.getServerDateTime(this.getOrigStartDate(), this.startsInUTC);
				// bug fix #4697 (part 2)
				timezone = this.getOrigTimezone();
				if (!this.startsInUTC && timezone) {
					exceptId.tz = timezone;
				}
				exceptId.d = sd;
			} else {
				sd = AjxDateUtil.getServerDate(this.getOrigStartDate());
				exceptId.d = sd;
			}
		}
	}

	if (this.timezone) {
		var clientId = AjxTimezone.getClientId(this.timezone);
		ZmTimezone.set(request, clientId, null, true);
		tz = this.timezone;
	}

    m.su = this.name;
    this.isForwardMode = true;
	this._addNotesToRequest(m);

	if (this.isOrganizer() && !accountName && mailFromAddress) {
		e.push({
            a : mailFromAddress,
		    t : AjxEmailAddress.toSoapType[AjxEmailAddress.FROM]
        });
	}

	for (i = 0; i < addrs.length; i++) {
		attendee = addrs[i];
		if (!attendee) { continue; }

        name = "";
		if (attendee._inviteAddress) {
			address = attendee._inviteAddress;
			delete attendee._inviteAddress;
		} else if(attendee.isAjxEmailAddress){
			address = attendee.address;
			name = attendee.dispName || attendee.name
		} else if(attendee instanceof ZmContact){
			address = attendee.getEmail();
			name = attendee.getFullName();
		}
		if (!address) { continue; }
		if (address instanceof Array) {
			address = address[0];
		}
		this._addAddressToRequest(m, address, AjxEmailAddress.toSoapType[AjxEmailAddress.TO], name);
	}

	this._sendRequest(null, accountName, callback, errorCallback, jsonObj, requestName);
};

ZmAppt.prototype._addAddressToRequest =
function(m, addr, type, name) {
	var e = {};
	e.a = addr;
	e.t = type;
	if (name) {
        e.p = name;
	}
    m.e.push(e);
};

ZmAppt.prototype.setProposedInvite =
function(invite) {
	this.proposedInvite = invite;
};

ZmAppt.prototype.getRecurrenceFromInvite =
function(invite) {
	return (invite && invite.comp && invite.comp[0]) ? invite.comp[0].recur : null;
};

ZmAppt.prototype.setInvIdFromProposedInvite =
function(invites, proposedInvite) {
	var proposalRidZ = proposedInvite.getRecurrenceId();

	if (proposedInvite.components[0].ridZ) {
		// search all the invites for an appointment
		for (var i=0; i < invites.length; i++) {
			var inv = invites[i];
			if (inv.comp[0].ridZ  == proposalRidZ) {
				this.invId = this.id + "-" + inv.id;
				break;
			}
		}

		// if new time is proposed for creating an exceptional instance - no
		// matching invites will be found
		if (!this.invId) {
			this.invId = this.id + "-" + invites[0].id;
			this.ridZ = proposalRidZ;
			var invite = ZmInvite.createFromDom(invites);
			if (invite.isRecurring()) {
				this.isException = true;
				this.recurring = this.getRecurrenceFromInvite(invites[0]);
				this._origStartDate = proposedInvite.getStartDateFromExceptId();
			}
		}
	} else {
		this.invId = this.id + "-" + invites[0].id;
	}
};

/**
 * clears the recurrence.
 */
ZmCalItem.prototype.clearRecurrence =
function() {
    this._recurrence = new ZmRecurrence(this);
    this.recurring = false;
};

ZmAppt.loadById = function(id, callback, errorCallback) {
    return ZmAppt.__load(id, null, callback, errorCallback);
};
ZmAppt.loadByUid = function(uid, callback, errorCallback) {
    return ZmAppt.__load(null, uid, callback, errorCallback);
};

ZmAppt.__load = function(id, uid, callback, errorCallback) {
    var req = { _jsns: "urn:zimbraMail", includeContent: 1 };
    if (id) req.id = id;
    else if (uid) req.uid = uid;
    var params = {
        jsonObj: { GetAppointmentRequest: req },
        accountName: appCtxt.multiAccounts ? appCtxt.accountList.mainAccount.name : null,
        asyncMode: Boolean(callback),
        callback: new AjxCallback(ZmAppt.__loadResponse, [callback]),
        errorCallback: errorCallback
    };
    var resp = appCtxt.getAppController().sendRequest(params);
    if (!callback) {
        return ZmAppt.__loadResponse(null, resp);
    }
};
ZmAppt.__loadResponse = function(callback, resp) {
    var data = resp && resp._data;
    var response = data && data.GetAppointmentResponse;
    var apptNode = response && response.appt;
    apptNode = apptNode && apptNode[0];
    if (!apptNode) return null;

    var appt = new ZmAppt();
    appt._loadFromDom(apptNode, {});
    if (apptNode.inv) {
        // HACK: There doesn't seem to be any direct way to load an appt
        // HACK: by id/uid. So I initialize the appt object with the node
        // HACK: in the response and then fake a message with the invite
        // HACK: data to initialize the rest of it.
        var message = {
            invite: new ZmInvite.createFromDom(apptNode.inv),
            getBodyPart: function(mimeType) {
                return (mimeType == ZmMimeTable.TEXT_HTML ? apptNode.descHtml : apptNode.desc) || "";
            }
        }
        appt.setFromMessage(message);
    }

    if (callback) {
        callback.run(appt);
    }
    return appt;
};

/*
 * Checks whether there is any Daylight Savings change happens on appointment end date.
 */
ZmAppt.prototype.checkDSTChangeOnEndDate = function(){
    var endDate = this.endDate;
    var eOffset = endDate.getTimezoneOffset();
    var prevDay = new Date(endDate);
    prevDay.setTime(endDate.getTime() - AjxDateUtil.MSEC_PER_DAY);
    var prevDayOffset = prevDay.getTimezoneOffset();
    var diffOffset = prevDayOffset - eOffset;
    return diffOffset;
};
}
if (AjxPackage.define("zimbraMail.calendar.model.ZmApptList")) {
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Create a new, empty appointment list.
 * @constructor
 * @class
 * This class represents a list of appointments.
 * 
 * @extends		ZmList
 */
ZmApptList = function() {
	ZmList.call(this, ZmItem.APPT);
};

ZmApptList.prototype = new ZmList;
ZmApptList.prototype.constructor = ZmApptList;

ZmApptList.prototype.isZmApptList = true;
ZmApptList.prototype.toString = function() { return "ZmApptList"; };

ZmApptList.prototype.loadFromSummaryJs =
function(appts, noCache) {
	if (!appts) { return; }

	for (var i = 0; i < appts.length; i++) {
		var apptNode = appts[i];
		var instances = apptNode ? apptNode.inst : null;
		if (instances) {
			var args = {list:this};
			for (var j = 0; j < instances.length; j++) {
				var appt = ZmAppt.createFromDom(apptNode, args, instances[j], noCache);
				if (appt) this.add(appt);
			}
		}
	}
}

ZmApptList.prototype.indexOf =
function(obj) {
	return this._vector.indexOf(obj);
};

ZmApptList.sortVector = 
function(vec) {
	vec.sort(ZmCalBaseItem.compareByTimeAndDuration);
};

/**
 * Merges all the sorted vectors in the specified array into a single sorted vector.
 * 
 * @param	{AjxVector}	vecArray		the array
 * @return	{AjxVector}	the resulting array
 */
ZmApptList.mergeVectors = 
function(vecArray) {
	var result = new AjxVector();	
	if(!vecArray) {  return result; }

	// clone the single array case!
	if (vecArray.length == 1) return vecArray[0].clone();
	for (var i=0; i < vecArray.length; i++) result.addList(vecArray[i]);
	ZmApptList.sortVector(result);
	return result;
};

ZmApptList.toVector =
function(apptList, startTime, endTime, fanoutAllDay, includeReminders) {
	var result = new AjxVector();
	var list = apptList.getVector();
	var size = list.size();
	for (var i = 0; i < size; i++) {
		var ao = list.get(i);
		var folder = ao.getFolder();
		if (ao.isInRange(startTime, endTime) || (ao.isAlarmInRange() && includeReminders)) {
			if (ao.isAllDayEvent() && !fanoutAllDay) {
				result.add(ZmAppt.quickClone(ao));
			} else {
				ZmApptList._fanout(ao, result, startTime, endTime, fanoutAllDay, includeReminders);
			}
		}
	}
	ZmApptList.sortVector(result);
	return result;
};

/**
 * fanout multi-day appoints into multiple single day appts. This has nothing to do with recurrence...
 * TODO: should be more efficient by not fanning out appts in if part of the while if they are not in the range.
 * 
 * @private
 */
ZmApptList._fanout =
function(orig, result, startTime, endTime, fanoutAllDay, includeReminders) {
	var appt = ZmAppt.quickClone(orig);
	var fanoutNum = 0;

	// HACK: Avoid "strange" appt durations that occur at transition
	//       days for timezones w/ DST. For example, going from DST to
	//       STD, the duration for a single day is 25 hours; while the
	//       transition from STD to DST, the duration is 23 hours. So
	//       we advance 12 hours (just to be safe) and then subtract
	//       off the extra hours.
	var origEndTime = orig.getEndTime();
	if (appt.isAllDayEvent()) {
		var origEndDate = new Date(origEndTime);
		origEndDate.setHours(0, 0, 0, 0);

		appt.setEndDate(origEndDate);
		origEndTime = origEndDate.getTime();
	}

    //while (appt.isInRange(startTime,endTime) || (appt.isAlarmInRange() && includeReminders)) {
    while (orig.isInRange(startTime,endTime) || (appt.isAlarmInRange() && includeReminders)) {
		if (appt.isMultiDay()) {
			var apptStartTime = appt.getStartTime();
			// bug 12205: If someone mistypes "2007" as "200", we get into
			//            a seemingly never-ending loop trying to fanout
			//            every day even *before* the startTime of the view.
			var nextDay = new Date(apptStartTime);
			nextDay.setDate(nextDay.getDate()+1);
			if (origEndTime < nextDay.getTime()) {
				nextDay = new Date(origEndTime);
			}
			nextDay.setHours(0,0,0,0);
            if(AjxDateUtil.isDayShifted(nextDay)) {
                AjxDateUtil.rollToNextDay(nextDay);
            }

            var slice = ZmAppt.quickClone(appt);
            slice._fanoutFirst = (fanoutNum == 0);
            slice._orig = orig;
            slice.setEndDate(nextDay);
            slice._fanoutLast = (slice.getEndTime() == origEndTime);
            slice._fanoutNum = fanoutNum;
            slice.uniqStartTime = slice.getStartTime();					// need to construct uniq id later
            result.add(slice);

			fanoutNum++;
			appt.setStartDate(nextDay);
			if (appt.getStartTime() >= appt.getEndTime())
				break;
		} else {
			if (orig.isInRange(startTime,endTime)  || (appt.isAlarmInRange() && includeReminders) ) {
				appt._fanoutFirst = fanoutNum == 0;
				appt._fanoutLast = appt.getEndTime() == origEndTime;
				if (!appt._fanoutFirst)
					appt._orig = orig;
				appt._fanoutNum = fanoutNum;
				appt.uniqStartTime = appt.getStartTime();						// need to construct uniq id later
				result.add(appt);
			}
			break;
		}
	}
};

/**
 * Gets a new appointment list containing only appointment in the given range.
 * 
 * @param	{Date}	startTime		the start time
 * @param	{Date}	endTime		the end time
 * @author {ZmApptList}	the new list
 */
ZmApptList.prototype.getSubset =
function(startTime, endTime) {
	var result  = new ZmApptList();
	var list = this.getVector();
	var size = list.size();
	for (var i=0; i < size; i++) {
		var ao = list.get(i);
		if (ao.isInRange(startTime, endTime)) {
			result.add(ao);
		}
	}
	return result;
};


/**
 * Moves a list of items to the given folder.
 * <p>
 * Search results are treated as though they're in a temporary folder, so that they behave as
 * they would if they were in any other folder such as Inbox. When items that are part of search
 * results are moved, they will disappear from the view, even though they may still satisfy the
 * search.
 * </p>
 *
 * @param	{Hash}			params					a hash of parameters
 * @param	{Array}			params.items			a list of items to move
 * @param	{ZmFolder}		params.folder			the destination folder
 * @param	{Hash}			params.attrs			the additional attrs for SOAP command
 * @param	{AjxCallback}	params.callback			the callback to run after each sub-request
 * @param	{closure}		params.finalCallback	the callback to run after all items have been processed
 * @param	{int}			params.count			the starting count for number of items processed
 * @param	{boolean}		params.noUndo			true if the action is not undoable (e.g. performed as an undo)
 * @param	{String}		params.actionTextKey	key for optional text to display in the confirmation toast instead of the default summary. May be set explicitly to null to disable the confirmation toast entirely
 */
ZmApptList.prototype.moveItems =
function(params) {
	params = Dwt.getParams(arguments, ["items", "folder", "attrs", "callback", "errorCallback" ,"finalCallback", "noUndo", "actionTextKey"]);

	var params1 = AjxUtil.hashCopy(params);
	params1.items = AjxUtil.toArray(params.items);
	params1.attrs = params.attrs || {};
	if (params1.folder.id == ZmFolder.ID_TRASH) {
		params1.actionTextKey = (params.actionTextKey !== null) ? (params.actionTextKey || 'actionTrash') : null;
		params1.action = "trash";
        //This code snippet differs from the ZmList.moveItems
        var currentView = appCtxt.getCurrentView();
        if(currentView) {
            var viewController = currentView.getController();
            if(viewController) {
                //Since it is a drag and drop, only one item can be dragged - so get the first element from array
                return viewController._deleteAppointment(params1.items[0]);
            }
        }
	} else {
		params1.actionTextKey = (params.actionTextKey !== null) ? (params.actionTextKey || 'actionMove') : null;
		params1.actionArg = params.folder.getName(false, false, true);
		params1.action = "move";
		params1.attrs.l = params.folder.id;
	}

    if (appCtxt.multiAccounts) {
		// Reset accountName for multi-account to be the respective account if we're
		// moving a draft out of Trash.
		// OR,
		// check if we're moving to or from a shared folder, in which case, always send
		// request on-behalf-of the account the item originally belongs to.
        var folderId = params.items[0].getFolderId();
        var fromFolder = appCtxt.getById(folderId);
		if ((params.items[0].isDraft && params.folder.id == ZmFolder.ID_DRAFTS) ||
			(params.folder.isRemote()) || (fromFolder.isRemote()))
		{
			params1.accountName = params.items[0].getAccount().name;
		}
	}

    //Error Callback
    params1.errorCallback = params.errorCallback;

	this._itemAction(params1);
};
}
if (AjxPackage.define("zimbraMail.calendar.model.ZmApptCache")) {
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

ZmApptCache = function(calViewController) {
	this._calViewController = calViewController;
	this.clearCache();
};

ZmApptCache.prototype.toString =
function() {
	return "ZmApptCache";
};

ZmApptCache.prototype.clearCache =
function(folderId) {
	if (!folderId) {
		this._cachedApptSummaries = {};
		this._cachedApptVectors = {};
		this._cachedIds = {};
	} else {
		var cacheEntries = this._cachedApptVectors[folderId];
		if (cacheEntries) {
			for (var j in cacheEntries) {
				var cachedVec = cacheEntries[j];
				var len = cachedVec.size();
				for (var i = 0; i < len; i++) {
					var appt = cachedVec.get(i);
					if (appt.folderId == folderId) {
						delete this._cachedIds[appt.id];
					}
				}
			}
			
		}
		delete this._cachedApptSummaries[folderId];
		delete this._cachedApptVectors[folderId];
		
	}
	
	this._cachedMergedApptVectors = {};
	var miniCalCache = this._calViewController.getMiniCalCache();
	miniCalCache.clearCache();
};

ZmApptCache._sortFolderId =
function (a,b) {
	return a-b;
};

ZmApptCache.prototype._getCachedMergedKey =
function(params) {
	var sortedFolderIds = [];
	sortedFolderIds = sortedFolderIds.concat(params.folderIds);
	sortedFolderIds.sort();

	// add query to cache key since user searches should not be cached
	var query = params.query && params.query.length > 0
		? (params.query + ":") : "";

	return (params.start + ":" + params.end + ":" + params.fanoutAllDay + ":" + query + sortedFolderIds.join(":"));
};

ZmApptCache.prototype._getCachedVector =
function(start, end, fanoutAllDay, folderId, query) {
	var folderCache = this._cachedApptVectors[folderId];
	if (folderCache == null)
		folderCache = this._cachedApptVectors[folderId] = {};

	var q = query ? (":" + query) : "";
	var cacheKey = start + ":" + end + ":" + fanoutAllDay + q;

	var vec = folderCache[cacheKey];
	if (vec == null) {
		// try to find it in the appt summaries results
		var apptList = this._getCachedApptSummaries(start, end, folderId, query);
		if (apptList != null) {
			vec = folderCache[cacheKey] = ZmApptList.toVector(apptList, start, end, fanoutAllDay);
		}
	}
	return vec;
};

ZmApptCache.prototype._cacheVector =
function(vector, start, end, fanoutAllDay, folderId, query) {
	var folderCache = this._cachedApptVectors[folderId];
	if (folderCache == null)
		folderCache = this._cachedApptVectors[folderId] = {};

	var q = query ? (":" + query) : "";
	var cacheKey = start + ":" + end + ":" + fanoutAllDay + q;
	folderCache[cacheKey] = vector;
};

ZmApptCache.prototype._cacheApptSummaries =
function(apptList, start, end, folderId, query) {
	var folderCache = this._cachedApptSummaries[folderId];
	if (folderCache == null)
		folderCache = this._cachedApptSummaries[folderId] = {};

	var q = query ? (":" + query) : "";
	var cacheKey = start + ":" + end + q;
	folderCache[cacheKey] = {start:start, end:end, list:apptList};
};

ZmApptCache.prototype._getCachedApptSummaries =
function(start, end, folderId, query) {
	var found = false;

	var folderCache = this._cachedApptSummaries[folderId];
	if (folderCache == null)
		folderCache = this._cachedApptSummaries[folderId] = {};

	var q = query ? (":" + query) : "";
	var cacheKey = start + ":" + end + q;

	// see if this particular range is cached
	var entry = this._cachedApptSummaries[cacheKey];
	if (entry != null) { return entry.list; }

	// look through all cache results. typically if we are asking for a week/day,
	// the month range will already be in the cache
	for (var key in folderCache) {
		entry = folderCache[key];
		if (start >= entry.start && end <= entry.end) {
			found = true;
			break;
		}
	}
	if (!found) { return null; }

	// hum. should this ever happen?
	if (entry.start == start && entry.end == end) {
		return entry.list;
	}

	// get subset, and cache it for future use (mainly if someone pages back and forth)
	var apptList = entry.list.getSubset(start, end);
	folderCache[cacheKey] = {start:start, end:end, list:apptList};
	return apptList;
};

ZmApptCache.prototype._updateCachedIds =
function(apptList) {
	var list = apptList.getVector();
	var size = list.size();
	for (var i=0; i < size; i++) {
		var ao = list.get(i);
		this._cachedIds[ao.id] = 1;
	}
};

/**
* Returns a vector of appt summaries for the specified time range across the
* specified folders.
* @param start 				[long]				start time in MS
* @param end				[long]				end time in MS
* @param fanoutAllDay		[Boolean]*
* @param folderIds			[Array]*			list of calendar folder Id's (null means use checked calendars in overview)
* @param callback			[AjxCallback]*		callback to call once search results are returned
* @param noBusyOverlay		[Boolean]*			don't show veil during search
*/
ZmApptCache.prototype.getApptSummaries =
function(params) {

	var apptVec = this.setSearchParams(params);

	if (apptVec) {
		if (params.callback) {
			params.callback.run(apptVec);
		}
		return apptVec;
	}

	// this array will hold a list of appts as we collect them from the server
	this._rawAppts = [];

	if (params.callback) {
		this._search(params);
	} else {
		return this._search(params);
	}
};

ZmApptCache.prototype.setSearchParams =
function(params) {
	if (params.folderIds && (!(params.folderIds instanceof Array))) {
		params.folderIds = [params.folderIds];
	}
	else if (!params.folderIds || (params.folderIds && params.folderIds.length == 0)) {
		return (new AjxVector());
	}

	params.mergeKey = this._getCachedMergedKey(params);
	var list = this._cachedMergedApptVectors[params.mergeKey];
	if (list != null) {
		return list.clone();
	}

	params.needToFetch = [];
	params.resultList = [];

	for (var i = 0; i < params.folderIds.length; i++) {
		var fid = params.folderIds[i];

		// bug #46296/#47041 - skip shared folders if account is offline
		var calFolder = appCtxt.isOffline && appCtxt.getById(fid);
		if (calFolder && calFolder.isRemote() && calFolder.getAccount().status == ZmZimbraAccount.STATUS_OFFLINE) {
			continue;
		}

		// check vector cache first
		list = this._getCachedVector(params.start, params.end, params.fanoutAllDay, fid);
		if (list != null) {
			params.resultList.push(list);
		} else {
			params.needToFetch.push(fid); // need to make soap call
		}
	}

	// if already cached, return from cache
	if (params.needToFetch.length == 0) {
		var newList = ZmApptList.mergeVectors(params.resultList);
		this._cachedMergedApptVectors[params.mergeKey] = newList.clone();
		return newList;
	}

    this.setFolderSearchParams(params.needToFetch, params);
    params.offset = 0;

    return null;
};

ZmApptCache.prototype.setFolderSearchParams =
function (foldersToFetch, params) {
    var folderIdMapper = {};
    var query = "";
    for (var i = 0; i < foldersToFetch.length; i++) {
        var fid = foldersToFetch[i];

        // map remote folder ids into local ones while processing search since
        // server wont do it for us (see bug 7083)
        var folder = appCtxt.getById(fid);
        var rid = folder ? folder.getRemoteId() : fid;
        folderIdMapper[rid] = fid;

        if (query.length) {
            query += " OR ";
        }
        query += "inid:" + ['"', fid, '"'].join("");

    }
    params.queryHint = query;
    params.folderIdMapper = folderIdMapper;
}

ZmApptCache.prototype._search =
function(params) {
	var jsonObj = {SearchRequest:{_jsns:"urn:zimbraMail"}};
	var request = jsonObj.SearchRequest;

	this._setSoapParams(request, params);

	var accountName = params.accountName || (appCtxt.multiAccounts ? appCtxt.accountList.mainAccount.name : null);
	if (params.callback) {
		appCtxt.getAppController().sendRequest({
			jsonObj: jsonObj,
			asyncMode: true,
			callback: (new AjxCallback(this, this._getApptSummariesResponse, [params])),
			errorCallback: (new AjxCallback(this, this._getApptSummariesError, [params])),
            offlineCallback: this.offlineSearchAppts.bind(this, null, null, params),
			noBusyOverlay: params.noBusyOverlay,
			accountName: accountName
		});
	}
	else {
		var response = appCtxt.getAppController().sendRequest({jsonObj: jsonObj, accountName: accountName, ignoreErrs: ["mail.NO_SUCH_MOUNTPOINT"]});
		var result = new ZmCsfeResult(response, false);
		return this._getApptSummariesResponse(params, result);
	}
};

ZmApptCache.prototype._initAccountLists =
function(){
    if(!this._accountsSearchList){
        this._accountsSearchList = new AjxVector();
        this._accountsMiniCalList = [];
    }
};

ZmApptCache.prototype.batchRequest =
function(searchParams, miniCalParams, reminderSearchParams) {
	// *always* recreate the accounts list, otherwise we dispose its contents
	// before the view has a chance to remove the corresponding elements
	this._accountsSearchList = new AjxVector();
	this._accountsMiniCalList = [];

	this._doBatchRequest(searchParams, miniCalParams, reminderSearchParams);
};

ZmApptCache.prototype._doBatchRequest =
function(searchParams, miniCalParams, reminderSearchParams) {
    this._cachedVec = null;
	var caledarIds = searchParams.accountFolderIds.shift();
	if (searchParams) {
		searchParams.folderIds = caledarIds;
	}
	if (miniCalParams) {
		miniCalParams.folderIds = caledarIds;
	}

	var apptVec;
	var jsonObj = {BatchRequest:{_jsns:"urn:zimbra", onerror:"continue"}};
	var request = jsonObj.BatchRequest;

	if (searchParams) {
		if (!searchParams.folderIds && !appCtxt.multiAccounts) {
			searchParams.folderIds = this._calViewController.getCheckedCalendarFolderIds();
		}
		searchParams.query = this._calViewController._userQuery;
		apptVec = this.setSearchParams(searchParams);
        DBG.println(AjxDebug.DBG1, "_doBatchRequest searchParams key: " + searchParams.mergeKey + " , size = " + (apptVec ? apptVec.size().toString() : "null"));

		// search data in cache
		if (apptVec) {
			this._cachedVec = apptVec;
			this._accountsSearchList.addList(apptVec);
		} else {
			var searchRequest = request.SearchRequest = {_jsns:"urn:zimbraMail"};
			this._setSoapParams(searchRequest, searchParams);
		}
	}

	if (reminderSearchParams) {
		if (!reminderSearchParams.folderIds) {
			reminderSearchParams.folderIds = this._calViewController.getCheckedCalendarFolderIds(true);
		}

		// reminder search params is only for grouping reminder related srch
		apptVec = this.setSearchParams(reminderSearchParams);

		if (!apptVec) {
			var searchRequest ={_jsns:"urn:zimbraMail"};
			request.SearchRequest = request.SearchRequest ? [request.SearchRequest, searchRequest] : searchRequest;
			this._setSoapParams(searchRequest, reminderSearchParams);
		}
		else if (reminderSearchParams.callback) {
			reminderSearchParams.callback.run(apptVec);
		}
	}

	if (miniCalParams) {
		var miniCalCache = this._calViewController.getMiniCalCache();
		var cacheData = miniCalCache.getCacheData(miniCalParams);
        //DBG.println(AjxDebug.DBG1, "_doBatchRequest minical key: " + miniCalCache._getCacheKey(miniCalParams) + " , size = " + (cacheData ? cacheData.length.toString() : "null"));

		// mini cal data in cache
		if (cacheData && cacheData.length > 0) {
			miniCalCache.highlightMiniCal(cacheData);
			if (miniCalParams.callback) {
				miniCalParams.callback.run(cacheData);
			}
		} else {
			var miniCalRequest = request.GetMiniCalRequest = {_jsns:"urn:zimbraMail"};
			miniCalCache._setSoapParams(miniCalRequest, miniCalParams);
		}
	}

	// both mini cal and search data is in cache, no need to send request
	if (searchParams && !request.SearchRequest && !request.GetMiniCalRequest) {

		// process the next account
		if (searchParams.accountFolderIds.length > 0) {
			this._doBatchRequest(searchParams, miniCalParams);
		}
		else if (searchParams.callback) {
			searchParams.callback.run(this._accountsSearchList);
		}
		DBG.println(AjxDebug.DBG1, "ZmApptCache._doBatchCommand, Search and Minical data cached, EXIT");
		return;
	}

	if ((searchParams && searchParams.callback) || miniCalParams.callback) {
        //re-init the account search list to avoid the duplication
        if (searchParams && request.SearchRequest) {
            this._accountsSearchList = new AjxVector();
        }
		var accountName = (appCtxt.multiAccounts && searchParams.folderIds && (searchParams.folderIds.length > 0))
			? appCtxt.getById(searchParams.folderIds[0]).getAccount().name : null;

		var params = {
			jsonObj: jsonObj,
			asyncMode: true,
			callback: (new AjxCallback(this, this.handleBatchResponse, [searchParams, miniCalParams, reminderSearchParams])),
			errorCallback: (new AjxCallback(this, this.handleBatchResponseError, [searchParams, miniCalParams, reminderSearchParams])),
            offlineCallback: this.offlineSearchAppts.bind(this, searchParams, miniCalParams, reminderSearchParams),
            noBusyOverlay: true,
			accountName: accountName
		};
		DBG.println(AjxDebug.DBG1, "ZmApptCache._doBatchCommand, Send Async Request");
		appCtxt.getAppController().sendRequest(params);
	} else {
		DBG.println(AjxDebug.DBG1, "ZmApptCache._doBatchCommand, Send Sync Request");
		var response = appCtxt.getAppController().sendRequest({jsonObj:jsonObj});
		var batchResp = (response && response.BatchResponse) ? response.BatchResponse : null;
		return this.processBatchResponse(batchResp, searchParams, miniCalParams);
	}
};

ZmApptCache.prototype.processBatchResponse =
function(batchResp, searchParams, miniCalParams, reminderSearchParams) {

    //loading the client with app=calendar will directly process the inline batch response
    if(!this._accountsSearchList) this._initAccountLists();

    var accountList = this._accountsSearchList.clone();
	var miniCalCache = this._calViewController.getMiniCalCache();
	var miniCalResp = batchResp && batchResp.GetMiniCalResponse;
	var searchResp = batchResp && batchResp.SearchResponse;

	if (batchResp && batchResp.Fault) {
		if (this._processErrorCode(batchResp)) {
			if (searchParams.accountFolderIds.length > 0) {
				this._doBatchRequest(searchParams, miniCalParams);
			}
			return;
		}
	}

	if (miniCalResp) {
		var data = [];
		miniCalCache.processBatchResponse(miniCalResp, data);
		if (!appCtxt.multiAccounts) {
			miniCalCache.highlightMiniCal(data);
			miniCalCache.updateCache(miniCalParams, data);

			if (miniCalParams.callback) {
				miniCalParams.callback.run(data);
			}
		} else {
			this._accountsMiniCalList = this._accountsMiniCalList.concat(data);
		}
	}

	if (!searchResp || !searchParams) {
		if (searchParams) {
			if (searchParams.accountFolderIds && searchParams.accountFolderIds.length > 0) {
				this._doBatchRequest(searchParams, miniCalParams);
			} else if (searchParams.callback) {
				searchParams.callback.run(accountList);
			}
		}

		if (appCtxt.multiAccounts && miniCalParams) {
			this._highliteMiniCal(miniCalCache, miniCalParams);
		}
		return;
	}

	// currently we send only one search request in batch
	if (!(searchResp instanceof Array)) {
		searchResp = [searchResp];
	}

	if (searchResp.length > 1) {
		// process reminder list
		this.processSearchResponse(searchResp[1], reminderSearchParams);
	}

	var list = this.processSearchResponse(searchResp[0], searchParams);
	accountList.addList(list);
    this._accountsSearchList = accountList.clone();

	if (searchParams.accountFolderIds && searchParams.accountFolderIds.length > 0) {
		this._doBatchRequest(searchParams, miniCalParams);
	}
    else {
		if (appCtxt.multiAccounts && miniCalParams) {
			this._highliteMiniCal(miniCalCache, miniCalParams);
		}

		if (searchParams.callback) {
			searchParams.callback.run(accountList, null, searchParams.query);
		} else {
            return accountList;
		}
	}
};

ZmApptCache.prototype._highliteMiniCal =
function(miniCalCache, miniCalParams) {
	miniCalCache.highlightMiniCal(this._accountsMiniCalList);
	miniCalCache.updateCache(miniCalParams, this._accountsMiniCalList);

	if (miniCalParams.callback) {
		miniCalParams.callback.run(this._accountsMiniCalList);
	}
};

ZmApptCache.prototype.handleBatchResponseError =
function(searchParams, miniCalParams, reminderSearchParams, response) {
	var resp = response && response._data && response._data.BatchResponse;
    this._calViewController.resetSearchFlags();
	this._processErrorCode(resp);
};

ZmApptCache.prototype._processErrorCode =
function(resp) {
	if (resp && resp.Fault && (resp.Fault.length > 0)) {

		if (this._calViewController) {
			this._calViewController.searchInProgress = false;
		}

		var errors = [];
		var ids = {};
		var invalidAccountMarker = {};
		for (var i = 0; i < resp.Fault.length; i++) {
			var fault = resp.Fault[i];
			var error = (fault && fault.Detail) ? fault.Detail.Error : null;
			var code = error ? error.Code : null;
			var attrs = error ? error.a : null;
			if (code == ZmCsfeException.ACCT_NO_SUCH_ACCOUNT || code == ZmCsfeException.MAIL_NO_SUCH_MOUNTPOINT) {
				for (var j in attrs) {
					var attr = attrs[j];
					if (attr && (attr.t == "IID") && (attr.n == "itemId")) {
						var id = attr._content;
						ids[id] = true;
						if (code == ZmCsfeException.ACCT_NO_SUCH_ACCOUNT) {
							invalidAccountMarker[id] = true;
						}
					}
				}
				
			} else {
				DBG.println("Unknown error occurred: "+code);
				errors[fault.requestId] = fault;
			}
		}

		var deleteHandled = false;
		var zidsMap = {};
		for (var id in ids) {
			if (id && appCtxt.getById(id)) {
				var folder = appCtxt.getById(id);
				folder.noSuchFolder = true;
				this.handleDeleteMountpoint(folder);
				deleteHandled = true;
				if (invalidAccountMarker[id] && folder.zid) {
					zidsMap[folder.zid] = true;
				}
			}
		}

		// no such mount point error - mark all folders owned by same account as invalid
		this.markAllInvalidAccounts(zidsMap);

		if (deleteHandled) {
			this.runErrorRecovery();
		}

		return deleteHandled;
	}

	return false;
};


//remove this after server sends fault for all removed accounts instead of no such mount point
ZmApptCache.prototype.markAllInvalidAccounts =
function(zidsMap) {
	if (this._calViewController) {
		var folderIds = this._calViewController.getCheckedCalendarFolderIds();
		for (var i = 0; i < folderIds.length; i++) {
			var folder = appCtxt.getById(folderIds[i]);
			if (folder) {
				if (folder.zid && zidsMap[folder.zid]) {
					folder.noSuchFolder = true;
					this.handleDeleteMountpoint(folder);
				}
			}
		}
        this._calViewController._updateCheckedCalendars();
	}
};

ZmApptCache.prototype.handleDeleteMountpoint =
function(organizer) {
	// Change its appearance in the tree.
	var tc = appCtxt.getOverviewController().getTreeController(ZmOrganizer.CALENDAR);
	var treeView = tc.getTreeView(appCtxt.getCurrentApp().getOverviewId());
	var node = treeView && treeView.getTreeItemById(organizer.id);
	if (organizer && node) {
		node.setText(organizer.getName(true));
	}
};

ZmApptCache.prototype.runErrorRecovery =
function() {
	if (this._calViewController) {
		this._calViewController.searchInProgress = false;
		this._calViewController._updateCheckedCalendars();
		if (this._calViewController.onErrorRecovery) {
			this._calViewController.onErrorRecovery.run();
		}
	}
};

ZmApptCache.prototype.handleBatchResponse =
function(searchParams, miniCalParams, reminderSearchParams, response) {
	var batchResp = response && response._data && response._data.BatchResponse;
	return this.processBatchResponse(batchResp, searchParams, miniCalParams, reminderSearchParams);
};

ZmApptCache.prototype._setSoapParams =
function(request, params) {
	request.sortBy = "none";
	request.limit = "500";
	// AjxEnv.DEFAULT_LOCALE is set to the browser's locale setting in the case

	// when the user's (or their COS) locale is not set.
	request.locale = { _content: AjxEnv.DEFAULT_LOCALE };
	request.calExpandInstStart = params.start;
	request.calExpandInstEnd = params.end;
	request.types = ZmSearch.TYPE[ZmItem.APPT];
	request.offset = params.offset;

	var query = params.query;

    if((query && query.indexOf("date:")!=-1)){
        var dtArray = query.split(":");
        query = null;
        var curDate = new Date(parseInt(dtArray[1]));
        curDate.setHours(0,0,0,0);
        var endDate = new Date(curDate.getTime());
        AjxDateUtil.rollToNextDay(endDate);
        request.calExpandInstStart = curDate.getTime();
	    request.calExpandInstEnd = endDate.getTime();
    }


	if (params.queryHint) {
		query = (query != null)
			? (query + " (" + params.queryHint + ")")
			: params.queryHint;
	}
	request.query = {_content:query};
};

ZmApptCache.prototype._getApptSummariesResponse =
function(params, result) {
	// TODO: mark both as needing refresh?
	if (!result) { return; }

	var callback = params.callback;
	var resp;
	try {
		resp = result.getResponse();
	} catch (ex) {
		if (callback) {
			callback.run(result);
		}
		return;
	}

	var newList = this.processSearchResponse(resp.SearchResponse, params);

	if (callback && newList) {
		callback.run(newList, params.query, result);
	} else {
		return newList;
	}
};

ZmApptCache.prototype._getApptSummariesError =
function(params, ex) {
    var code = ex ? ex.code : null;
	if (params.errorCallback) {
		//if there is a error callback handler then call it else do default handling
		params.errorCallback.run(ex);
		if (code !== ZmCsfeException.ACCT_NO_SUCH_ACCOUNT && code !== ZmCsfeException.MAIL_NO_SUCH_MOUNTPOINT) {
			//additional processing is needed for these codes so do not return yet.
			return true;
		}
	} else {
		if (code == ZmCsfeException.MAIL_QUERY_PARSE_ERROR) {
			var d = appCtxt.getMsgDialog();
			d.setMessage(ZmMsg.errorCalendarParse);
			d.popup();
			return true;
		}

		if (code == ZmCsfeException.MAIL_NO_SUCH_TAG) {
			var msg = ex.getErrorMsg();
			appCtxt.setStatusMsg(msg, ZmStatusView.LEVEL_WARNING);
			return true;
		}
	}

	var ids = {};
	var invalidAccountMarker = {};

	// check for deleted remote mount point or account
	var itemIds = (ex.data && ex.data.itemId && ex.data.itemId.length) ? ex.data.itemId : [];
	if (code == ZmCsfeException.ACCT_NO_SUCH_ACCOUNT || code == ZmCsfeException.MAIL_NO_SUCH_MOUNTPOINT) {
		for(var j = 0; j < itemIds.length; j++) {
			var id = itemIds[j];
			ids[id] = true;
			if (code == ZmCsfeException.ACCT_NO_SUCH_ACCOUNT) {
				invalidAccountMarker[id] = true;
			}
		}
	}

	var deleteHandled = this.handleDeletedFolderIds(ids, invalidAccountMarker);

	if (deleteHandled) {
		var newFolderIds = [];

		// filter out invalid folder ids
		for (var i = 0; i < params.folderIds.length; i++) {
			var folderId = params.folderIds[i];
			var isDeleted = (folderId && ids[folderId]);
			if (!isDeleted) {
				newFolderIds.push(folderId);
			}
		}

		// search again if some of the folders are marked for deletion
		if (params.folderIds.length != newFolderIds.length) {
			params.folderIds = newFolderIds;
			// handle the case where all checked folders are invalid
			if (params.folderIds.length == 0) {
				params.callback.run(new AjxVector(), "");
				return true;
			}
			DBG.println('Appt Summaries Search Failed - Error Recovery Search');
			this.getApptSummaries(params);
		}
	}

	return deleteHandled;
};

ZmApptCache.prototype.handleDeletedFolderIds =
function(ids, invalidAccountMarker) {
	var deleteHandled = false;
	var zidsMap = {};
	for (var id in ids) {
		if (id && appCtxt.getById(id)) {
			var folder = appCtxt.getById(id);
			folder.noSuchFolder = true;
			this.handleDeleteMountpoint(folder);
			deleteHandled = true;
			if (invalidAccountMarker[id] && folder.zid) {
				zidsMap[folder.zid] = true;
			}
		}
	}

	//no such mount point error - mark all folders owned by same account as invalid
	this.markAllInvalidAccounts(zidsMap);
	return deleteHandled;
};

ZmApptCache.prototype.processSearchResponse = 
function(searchResp, params) {
	if (!searchResp) {
		if (this._cachedVec) {
			var resultList = this._cachedVec.clone();
			this._cachedVec = null;
			return resultList;
		}
		return;
	}

	if (searchResp && searchResp.appt && searchResp.appt.length) {
		this._rawAppts = this._rawAppts != null 
			? this._rawAppts.concat(searchResp.appt)
			: searchResp.appt;

		// if "more" flag set, keep requesting more appts
		if (searchResp.more) {
			var lastAppt = searchResp.appt[searchResp.appt.length-1];
			if (lastAppt) {
				params.offset += 500;
				this._search(params);
				return;
			}
		}
	}

	if (this._rawAppts && this._rawAppts.length) {
		var fanoutAllDay = params.fanoutAllDay;
		var folderIds = params.needToFetch;
		var start = params.start;
		var end = params.end;
		var query = params.query;

		// create a list of appts for each folder returned
        var folder2List = this.createFolder2ListMap(this._rawAppts, "l", params.folderIdMapper);

		if (folderIds && folderIds.length) {
			for (var i = 0; i < folderIds.length; i++) {
				var folderId = folderIds[i];
				var apptList = new ZmApptList();
				apptList.loadFromSummaryJs(folder2List[folderId]);
                list = this.createCaches(apptList, params, folderId);
                params.resultList.push(list);
			}
		}
	}
	// merge all the data and return
	var newList = ZmApptList.mergeVectors(params.resultList);
	this._cachedMergedApptVectors[params.mergeKey] = newList.clone();

	this._rawAppts = null;
	return newList;
};


ZmApptCache.prototype.createFolder2ListMap =
function(items, folderFieldName, folderIdMapper) {
    var folder2List = {};
    var item;
    for (var j = 0; j < items.length; j++) {
        item = items[j];
        var fid = folderIdMapper && folderIdMapper[item[folderFieldName]];
        if (!folder2List[fid]) {
            folder2List[fid] = [];
        }
        folder2List[fid].push(item);
    }
    return folder2List;
}

ZmApptCache.prototype.createCaches =
function(apptList, params, folderId)  {
    this._updateCachedIds(apptList);
    this._cacheApptSummaries(apptList, params.start, params.end, folderId, params.query);

    // convert to sorted vector
    var list = ZmApptList.toVector(apptList, params.start, params.end, params.fanoutAllDay, params.includeReminders);
    this._cacheVector(list, params.start, params.end, params.fanoutAllDay, folderId, params.query);

    return list;
}

// return true if the cache contains the specified id(s)
// id can be an array or a single id.
ZmApptCache.prototype.containsAnyId =
function(ids) {
	if (!ids) { return false; }
	if (ids instanceof Array) {
		for (var i=0; i < ids.length; i++) {
			if (this._cachedIds[ids[i]])
				return true;
		}
	} else {
		if (this._cachedIds[ids])
			return true;
	}
	return false;
};

// similar to  containsAnyId, though deals with an object
// (or array of objects) that have the id property
ZmApptCache.prototype.containsAnyItem =
function(items) {
	if (!items) { return false; }
	if (items instanceof Array) {
		for (var i=0; i < items.length; i++) {
			if (items[i].id && this._cachedIds[items[i].id]) {
				return true;
			}
		}
	} else {
		if (items.id && this._cachedIds[items.id]) {
			return true;
		}
	}
	return false;
};

// This will be invoked from ZmApptCache.getApptSummaries (via _search)
//  and _doBatchCommand, and the ZmMiniCalCache offline callback.
// Search and Reminder Params (if both are passed) will use the
// same date range.
ZmApptCache.prototype.offlineSearchAppts =
function(searchParams, miniCalParams, reminderParams) {
    // MiniCal search called with searchParams set
    var params = null;
    if (searchParams) {
        params = searchParams;
    } else {
        params = reminderParams;

     }
    if (!params || !params.start || !params.end) {
        if (params && params.errorCallback) {
            params.errorCallback.run();
        }
        return;
    }

    var search = [params.start, params.end];
    var offlineSearchAppts2 = this._offlineSearchAppts2.bind(
        this, searchParams, miniCalParams, reminderParams, params.errorCallback, search);
    // Find the appointments whose startDate falls within the specified range
    ZmOfflineDB.doIndexSearch(
        search, ZmApp.CALENDAR, null, offlineSearchAppts2, params.errorCallback, "startDate");
}

ZmApptCache.prototype._offlineSearchAppts2 =
function(searchParams, miniCalParams, reminderParams, errorCallback, search, apptContainers) {
    var apptContainer;
    var apptSet = {};
    for (var i = 0; i < apptContainers.length; i++) {
        apptContainer = apptContainers[i];
        apptSet[apptContainer.instanceId] = apptContainer.appt;
    }

    var offlineSearchAppts3 = this._offlineSearchAppts3.bind(
        this, searchParams, miniCalParams, reminderParams, apptSet);
    // Find the appointments whose endDate falls within the specified range
    ZmOfflineDB.doIndexSearch(
        search, ZmApp.CALENDAR, null, offlineSearchAppts3, errorCallback, "endDate");
}

ZmApptCache.prototype._offlineSearchAppts3 =
function(searchParams, miniCalParams, reminderParams, apptSet, apptContainers) {
    var apptContainer;
    var reminderList;
    var calendarList;

    for (var i = 0; i < apptContainers.length; i++) {
        apptContainer = apptContainers[i];
        // Just drop them in - new entries are added, duplicate entries just written again
        apptSet[apptContainer.instanceId] = apptContainer.appt;
    }
    // For the moment, just create an array
    var appts = [];
    var appt;
    for (var instanceId in apptSet) {
        appt = apptSet[instanceId];
        appts.push(appt);
    }
    var cachedVec = this._cachedVec;
    this._cachedVec = null;

    if (reminderParams) {
        reminderList = this._cacheOfflineSearch(reminderParams, appts);

        // For getApptSummaries, searchParams == null, so its OK to invoke the reminder
        // callback, and return with the reminderList.
        if (!searchParams) {
            if (reminderParams.callback && reminderList) {
                // Last param == raw SOAP result.  The only usage seems to be from:
                // ZmSearchController.doSearch -> ZmCalViewController._handleUserSearch ...-> ZmApptCache.getApptSummaries
                // The callbacks return this to ZmSearchController._handleResponseDoSearch.
                // In order to support that param, we would need to have the rawAppts also
                // stored in a separate ObjectStore, and apply the search params to it
                // *** NOT DONE, But not supporting Calendar search right now ***
                reminderParams.callback.run(reminderList, reminderParams.query, null);
            } else {
                // Seems like the only way to get here is from
                // ZmFreeBusySchedulerView.popupFreeBusyToolTop ->
                // ZmCalViewController.getUserStatusToolTipText ...-> ZmApptCache.getApptSummaries,
                // where getUserStatusToolTipText does not provide a callback (it may be expecting
                // the appt to be cached). For offline, we are not providing FreeBusy, so should never hit here
                DBG.println(AjxDebug.DBG1, "ZmApptCache._offlineSearchAppts3 called with no reminderParam.callback");
                return reminderList;
            }
        }
    }

    if (searchParams) {
        if (cachedVec) {
            // Cache hit in _doBatchResponse for a calendar search.  Access and use in-memory cache
            calendarList = cachedVec.clone();
        } else {
            // _doBatchCommand: Search params provided - whether or not there are reminder results, the
            // search callback is executed, not the reminder.
            calendarList = this._cacheOfflineSearch(searchParams, appts);
        }
        if (searchParams.callback) {
            searchParams.callback.run(calendarList, null, searchParams.query);
        }  else {
            // This should never occur offline
        }
    }


    if (miniCalParams && calendarList) {
        // Base the miniCal off of the checked calendar appt data
        this.processOfflineMiniCal(miniCalParams, calendarList);
    }

}

ZmApptCache.prototype.processOfflineMiniCal =
function(miniCalParams, apptList) {
    // Base the minical off of the checked calendar appt data
    var dates = {};
    var dateList = [];
    var date;
    var appt;
    for (var i = 0; i < apptList.size(); i++) {
        appt = apptList.get(i);
        date = this._formatMiniCalEntry(appt.startDate);
        dates[date] = true;
    }
    for (date in dates) {
        dateList.push(date);
    }
    var miniCalCache = this._calViewController.getMiniCalCache();
    miniCalCache.highlightMiniCal(dateList);
    miniCalCache.updateCache(miniCalParams, dateList);
    //DBG.println(AjxDebug.DBG1, "Cache miniCal key: " + miniCalCache._getCacheKey(miniCalParams) + " , size = " + dateList.length);
    if (miniCalParams.callback) {
        miniCalParams.callback.run(dateList);
    }
}

ZmApptCache.prototype._formatMiniCalEntry =
function(date) {
    return date.getFullYear().toString() + AjxDateUtil._getMonth(date, true).toString() +
           AjxDateUtil._getDate(date,true).toString();
}

ZmApptCache.prototype._cacheOfflineSearch =
function(params, appts) {
    var resultList = params.resultList || [];
    var apptList;
    var appt;
    var folderList;
    var list;
    var folderId;

    var folder2List = this.createFolder2ListMap(appts, "folderId", params.folderIdMapper);

    // The offline db returns all entries within the specified date range.
    // Prune the entries by folder id here - Only process those in the params.needToFetch list
    var folderIds = params.needToFetch;
    if (folderIds && folderIds.length) {
        for (var i = 0; i < folderIds.length; i++) {
            folderId = folderIds[i];
            folderList = folder2List[folderId];
            if (folderList) {
                apptList = new ZmApptList();
                for (var j = 0; j < folderList.length; j++) {
                    // Assuming appts are a new instance, i.e. changes (like list) are not persisted
                    // SO, just set this appts list
                    appt = ZmAppt.loadOfflineData(folderList[j], apptList);
                    apptList.add(appt);
                }
                list = this.createCaches(apptList, params, folderId);
                resultList.push(list);
            }
        }
    }
    //}
    // merge all the data and return
    var newList = ZmApptList.mergeVectors(resultList);
    this._cachedMergedApptVectors[params.mergeKey] = newList.clone();
    //DBG.println(AjxDebug.DBG1, "Cache appts: " + params.mergeKey + " , size = " + newList.size());
    return newList;
}

// Update a field in a ZmAppt.  This will also trigger a clearCache call, since
// the cache entries will have an out-of-date field.  This is essentially what the online
// mode does - on a notification that modified or deletes an appt, it clears the in-memory cache.
ZmApptCache.prototype.updateOfflineAppt =
function(id, field, value, nullData, callback) {

    var search = [id];
    var errorCallback = this.updateErrorCallback.bind(this, field, value);
    var updateOfflineAppt2 = this._updateOfflineAppt2.bind(this, field, value, nullData, errorCallback, callback);
    // Find the appointments that match the specified id, update appt[field] = value,
    // and write it back into the db
    ZmOfflineDB.doIndexSearch([id], ZmApp.CALENDAR, null, updateOfflineAppt2, errorCallback, "invId");
}

ZmApptCache.prototype.updateErrorCallback =
function(field, value, e) {
    DBG.println(AjxDebug.DBG1, "Error while updating appt['" + field + "'] = '" + value + "' in indexedDB.  Error = " + e);
}

ZmApptCache.prototype._updateOfflineAppt2 =
function(fieldName, value, nullData, errorCallback, callback, apptContainers) {
    if (apptContainers.length > 0) {
        //this.clearCache();
        var appt;
        var fieldNames    = fieldName.split(".");
        var firstFieldName = fieldNames[0];
        var lastFieldName  = fieldNames[fieldNames.length-1];
        var field;
        for (var i = 0; i < apptContainers.length; i++) {
            appt = apptContainers[i].appt;
            field = appt;
            if (!appt[firstFieldName]) {
                appt[firstFieldName] = nullData;
            } else {
                for (var j = 0; j < fieldNames.length-1; j++) {
                    field = field[fieldNames[j]];
                    if (!field) break;
                }
                field[lastFieldName] = value;
            }
        }
        var errorCallback = this.updateErrorCallback.bind(this, field, value);
        var updateOfflineAppt3 = this._updateOfflineAppt3.bind(this, field, value, callback);
        ZmOfflineDB.setItem(apptContainers, ZmApp.CALENDAR, updateOfflineAppt3, errorCallback);
    }
}

ZmApptCache.prototype._updateOfflineAppt3 =
function(field, value, callback) {
    // Final step - Do a grand refresh.  We've modified the indexedDB entry, but appts
    // are used in the various caches, and in the display lists.
    this.clearCache();
    this._calViewController.refreshCurrentView();

    if (callback) {
        callback.run(field, value);
    }
}
}
if (AjxPackage.define("zimbraMail.calendar.model.ZmFreeBusyCache")) {
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

ZmFreeBusyCache = function(controller) {
	this._controller = controller;
	this.clearCache();
};

ZmFreeBusyCache.STATUS_UNKNOWN = 'n';
ZmFreeBusyCache.STATUS_TENTATIVE = 't';
ZmFreeBusyCache.STATUS_BUSY = 'b';
ZmFreeBusyCache.STATUS_OUT = 'u';
ZmFreeBusyCache.STATUS_FREE = 'f';

ZmFreeBusyCache.STATUS_WORKING_HOURS = 'f';
ZmFreeBusyCache.STATUS_NON_WORKING_HOURS = 'u';
ZmFreeBusyCache.STATUS_UNKNOWN = 'n';

ZmFreeBusyCache.prototype.toString =
function() {
	return "ZmFreeBusyCache";
};

ZmFreeBusyCache.prototype.clearCache =
function() {
    DBG.println("clearing free busy cache");
    this._schedule = {};
    this._workingHrs = {};
};

ZmFreeBusyCache.prototype.getFreeBusyKey =
function(startTime, id) {
    return startTime + "-" + id;
};

ZmFreeBusyCache.prototype.getWorkingHoursKey =
function(id, day) {
    return id + "-" + day;
};

//filter free busy slots for given time from compressed/accumulated free busy response that got cached already
ZmFreeBusyCache.prototype.getFreeBusySlot =
function(startTime, endTime, id, excludeTimeSlots) {
    var slotDate = new Date(startTime);
    slotDate.setHours(0, 0, 0, 0);

    var fbSlots = this._schedule[id] || [];
    var fbResult = {id: id};

    //free busy response is always merged
    var usr, searchRange, newSearchIsInRange;
    for(var i= fbSlots.length; --i >= 0;) {
        usr = fbSlots[i];
        searchRange = usr.searchRange;

        if(searchRange) {
            newSearchIsInRange = (startTime >= searchRange.startTime && endTime <= searchRange.endTime);
            if(!newSearchIsInRange) continue;
        }

        if (usr.n) this._addFBInfo(usr.n, id, ZmFreeBusyCache.STATUS_UNKNOWN, startTime, endTime, fbResult, excludeTimeSlots);
        if (usr.t) this._addFBInfo(usr.t, id, ZmFreeBusyCache.STATUS_TENTATIVE, startTime, endTime, fbResult, excludeTimeSlots);
        if (usr.b) this._addFBInfo(usr.b, id, ZmFreeBusyCache.STATUS_BUSY, startTime, endTime, fbResult, excludeTimeSlots);
        if (usr.u) this._addFBInfo(usr.u, id, ZmFreeBusyCache.STATUS_OUT, startTime, endTime, fbResult, excludeTimeSlots);
        if (usr.f) this._addFBInfo(usr.f, id, ZmFreeBusyCache.STATUS_FREE, startTime, endTime, fbResult, excludeTimeSlots);
    }

    return fbResult;
};

ZmFreeBusyCache.prototype._addFBInfo =
function(slots, id, status, startTime, endTime, fbResult, excludeTimeSlots) {

    if(!fbResult[status]) fbResult[status] = [];

    for (var i = 0; i < slots.length; i++) {
        var fbSlot;
        if(slots[i].s >= startTime && slots[i].e  <= endTime) {
            fbSlot = {s: slots[i].s, e: slots[i].e};
        }else if(startTime >= slots[i].s && endTime  <= slots[i].e) {
            fbSlot = {s: startTime, e: endTime};
        }else if(startTime >= slots[i].s && startTime  <= slots[i].e) {
            fbSlot = {s: startTime, e: slots[i].e};
        }else if(endTime >= slots[i].s && endTime  <= slots[i].e) {
            fbSlot = {s: slots[i].s, e: endTime};
        }

        if(fbSlot) {
            if(excludeTimeSlots && status != ZmFreeBusyCache.STATUS_FREE && status != ZmFreeBusyCache.STATUS_UNKNOWN) {
                this._addByExcludingTime(excludeTimeSlots, fbSlot, fbResult, status);
            }else {
                fbResult[status].push(fbSlot);
            }
        }
    };

    if(fbResult[status].length == 0) fbResult[status] = null;
};

ZmFreeBusyCache.prototype._addByExcludingTime =
function(excludeTimeSlots, fbSlot, fbResult, status) {
    var startTime =  excludeTimeSlots.s;
    var endTime =  excludeTimeSlots.e;
    var newFBSlot;

    if(fbSlot.s == startTime && fbSlot.e == endTime) {
        return;
    }

    if(fbSlot.s < startTime && fbSlot.e > endTime) {
        fbResult[status].push({s: fbSlot.s, e: startTime});
        newFBSlot = {s: endTime, e: fbSlot.e};
    }else if(fbSlot.s < startTime && fbSlot.e >= startTime) {
        newFBSlot = {s: fbSlot.s, e: startTime};
    }else if(fbSlot.s <= endTime && fbSlot.e > endTime) {
        newFBSlot = {s: endTime, e: fbSlot.e};
    }else if(fbSlot.s <= startTime && fbSlot.e <= startTime) {
        newFBSlot = {s: fbSlot.s, e: fbSlot.e};
    }else if(fbSlot.s >= endTime && fbSlot.e >= endTime) {
        newFBSlot = {s: fbSlot.s, e: fbSlot.e};
    }

    if(newFBSlot) {
        fbResult[status].push(newFBSlot);
    }
};

ZmFreeBusyCache.prototype.getFreeBusyInfo =
function(params) {

    var requiredEmails = [], freeBusyKey, emails = params.emails, fbSlot;
    for (var i = emails.length; --i >= 0;) {
        freeBusyKey = params.startTime + "";
        //check local cache
        var entryExists = false
        if(this._schedule[emails[i]]) {
            var fbSlots = this.getFreeBusySlot(params.startTime, params.endTime, emails[i]);
            if(fbSlots.f || fbSlots.u || fbSlots.b || fbSlots.t || fbSlots.n) entryExists = true;            
        };
        if(!entryExists) requiredEmails.push(emails[i]);
    }

    var fbCallback = new AjxCallback(this, this._handleResponseFreeBusy, [params]);
    var fbErrorCallback = new AjxCallback(this, this._handleErrorFreeBusy, [params]);

    if(requiredEmails.length) {
	    return this._getFreeBusyInfo(params.startTime,
                                     params.endTime,
                                     requiredEmails.join(","),
                                     fbCallback,
                                     fbErrorCallback,
                                     params.noBusyOverlay,
                                     params.account,
                                     params.excludedId);
    }else {
        if(params.callback) {
            params.callback.run();
        }
        return null;
    }

};

//cache free busy response in user-id -> slots hash map
ZmFreeBusyCache.prototype. _handleResponseFreeBusy =
function(params, result) {

    var freeBusyKey;
	var args = result.getResponse().GetFreeBusyResponse.usr || [];
    for (var i = 0; i < args.length; i++) {
		var usr = args[i];
        var id = usr.id;
        if (!id) {
            continue;
        }
        if(!this._schedule[id]) {
            this._schedule[id] = [];
        }

        usr.searchRange = {startTime: params.startTime,  endTime: params.endTime};
        this._schedule[id].push(usr);
    };

    if(params.callback) {
        params.callback.run(result);
    }
};

ZmFreeBusyCache.prototype._handleErrorFreeBusy =
function(params, result) {
    if(params.errorCallback) {
        params.errorCallback.run(result);
    }
};

ZmFreeBusyCache.prototype._getFreeBusyInfo =
function(startTime, endTime, emailList, callback, errorCallback, noBusyOverlay, acct, excludedId) {
	var soapDoc = AjxSoapDoc.create("GetFreeBusyRequest", "urn:zimbraMail");
	soapDoc.setMethodAttribute("s", startTime);
	soapDoc.setMethodAttribute("e", endTime);
	soapDoc.setMethodAttribute("uid", emailList);
	if (excludedId) {
		soapDoc.setMethodAttribute("excludeUid", excludedId);
	}

	return appCtxt.getAppController().sendRequest({
		soapDoc: soapDoc,
		asyncMode: true,
		callback: callback,
		errorCallback: errorCallback,
		noBusyOverlay: noBusyOverlay,
		accountName: (acct ? acct.name : null)
	});
};

//working hrs related code
ZmFreeBusyCache.prototype.getWorkingHours =
function(params) {

    var requiredEmails = [], whKey, emails = params.emails || [];
    for (var i = emails.length; --i >= 0;) {
        whKey = this.getWorkingHoursKey(emails[i], (new Date(params.startTime)).getDay());
        //check local cache
        if(!this._workingHrs[whKey]) requiredEmails.push(emails[i]);
    }

    var fbCallback = new AjxCallback(this, this._handleResponseWorkingHrs, [params]);
    var fbErrorCallback = new AjxCallback(this, this._handleErrorWorkingHrs, [params]);

    if(requiredEmails.length) {
	    return this._getWorkingHours(params.startTime,
                                     params.endTime,
                                     requiredEmails.join(","),
                                     fbCallback,
                                     fbErrorCallback,
                                     params.noBusyOverlay,
                                     params.account);
    }else {
        if(params.callback) {
            params.callback.run();
        }
        return null;
    }

};

ZmFreeBusyCache.prototype._handleResponseWorkingHrs =
function(params, result) {

    var freeBusyKey;
	var args = result.getResponse().GetWorkingHoursResponse.usr || [];
    for (var i = 0; i < args.length; i++) {
		var usr = args[i];
        var id = usr.id;
        if (!id) {
            continue;
        }
        this._addWorkingHrInfo(params.startTime, params.endTime, usr);
    };

    if(params.callback) {
        params.callback.run(result);
    }
};

ZmFreeBusyCache.prototype._addWorkingHrInfo =
function(startTime, endTime, usr) {
    var id = usr.id;
    if (usr.f) this._addWorkingHrSlot(usr.f, id, ZmFreeBusyCache.STATUS_WORKING_HOURS);
    if (usr.u) this._addWorkingHrSlot(usr.u, id, ZmFreeBusyCache.STATUS_NON_WORKING_HOURS);
    if (usr.n) this._addWorkingHrSlot(usr.n, id, ZmFreeBusyCache.STATUS_UNKNOWN);
};

ZmFreeBusyCache.prototype._addWorkingHrSlot =
function(slots, id, status) {
    var slotTime, slotDate, whKey, whSlots;
    for (var i = 0; i < slots.length; i++) {
        slotTime = slots[i].s;
        slotDate = new Date(slotTime);
        whKey = this.getWorkingHoursKey(id, slotDate.getDay());
        whSlots = this._workingHrs[whKey];
        if(!whSlots) {
            this._workingHrs[whKey] = whSlots = {id: id};
        }

        if(!whSlots[status]) {
            whSlots[status] = [];
        }
        whSlots[status].push(slots[i]);

        //unknown working hours slots will be compressed on server response (will send one accumulated slots)
        if(status == ZmFreeBusyCache.STATUS_UNKNOWN) {
            this._workingHrs[id] = whSlots;
        }
    };
};


ZmFreeBusyCache.prototype._handleErrorWorkingHrs =
function(params, result) {
    if(params.errorCallback) {
        params.errorCallback.run(result);
    }
};

ZmFreeBusyCache.prototype._getWorkingHours =
function(startTime, endTime, emailList, callback, errorCallback, noBusyOverlay, acct) {
    var soapDoc = AjxSoapDoc.create("GetWorkingHoursRequest", "urn:zimbraMail");
    soapDoc.setMethodAttribute("s", startTime);
    soapDoc.setMethodAttribute("e", endTime);
    soapDoc.setMethodAttribute("name", emailList);

    return appCtxt.getAppController().sendRequest({
        soapDoc: soapDoc,
        asyncMode: true,
        callback: callback,
        errorCallback: errorCallback,
        noBusyOverlay: noBusyOverlay,
        accountName: (acct ? acct.name : null)
    });
};

ZmFreeBusyCache.prototype.getWorkingHrsSlot =
function(startTime, endTime, id) {
    var whKey = this.getWorkingHoursKey(id, (new Date(startTime)).getDay());
    var whSlots = this._workingHrs[whKey] || {};
    var whResult = {id: id};

    //handle the case where the working hours are not available and slot dates are accumulated
    var unknownSlots = this._workingHrs[id];
    if(unknownSlots) {
        return unknownSlots;
    }

    if(whSlots[ZmFreeBusyCache.STATUS_WORKING_HOURS]) whResult[ZmFreeBusyCache.STATUS_WORKING_HOURS] = whSlots[ZmFreeBusyCache.STATUS_WORKING_HOURS];
    if(whSlots[ZmFreeBusyCache.STATUS_NON_WORKING_HOURS]) whResult[ZmFreeBusyCache.STATUS_NON_WORKING_HOURS] = whSlots[ZmFreeBusyCache.STATUS_NON_WORKING_HOURS];
    if(whSlots[ZmFreeBusyCache.STATUS_UNKNOWN]) whResult[ZmFreeBusyCache.STATUS_UNKNOWN] = whSlots[ZmFreeBusyCache.STATUS_UNKNOWN];

    if(!whResult[ZmFreeBusyCache.STATUS_WORKING_HOURS] && !whResult[ZmFreeBusyCache.STATUS_NON_WORKING_HOURS] && !whResult[ZmFreeBusyCache.STATUS_UNKNOWN]) return null;
    return whResult;        
};

ZmFreeBusyCache.prototype._addWHInfo =
function(slots, id, status, startTime, endTime, whResult) {

    if(!whResult[status]) whResult[status] = [];

    for (var i = 0; i < slots.length; i++) {
        if(startTime >= slots[i].s && endTime <= slots[i].e) {
            whResult[status].push({s: startTime, e: endTime});
        }else if(slots[i].s >= startTime && slots[i].e <= endTime) {
            whResult[status].push({s: slots[i].s, e: slots[i].e});
        }else if(slots[i].s >= startTime && slots[i].s  <= endTime) {
            whResult[status].push({s: slots[i].s, e: endTime});
        }else if(slots[i].e >= startTime && slots[i].e  <= endTime) {
            whResult[status].push({s: startTime, e: slots[i].e});
        }
    };

    if(whResult[status].length == 0) whResult[status] = null;
};

/**
 * converts working hours in different time base to required or current time base
 * this is done due to the fact that working hrs pattern repeat everyweek and
 * working hours are not fetched for every date change to optimize client code
 * @param slot  {object} working hrs slot with start and end time in milliseconds
 * @param relativeDate {date} optional date object relative to which the slot timings are converted
 */
ZmFreeBusyCache.prototype.convertWorkingHours =
function(slot, relativeDate) {
    relativeDate = relativeDate || new Date();
    var slotStartDate = new Date(slot.s);
    var slotEndDate = new Date(slot.e);
    var dur = slot.e - slot.s;
    slot.s = (new Date(relativeDate.getTime())).setHours(slotStartDate.getHours(), slotStartDate.getMinutes(), 0, 0);
    slot.e = slot.s + dur;
};
}
if (AjxPackage.define("zimbraMail.abook.model.ZmContact")) {
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file contains the contact class.
 */

if (!window.ZmContact) {
/**
 * Creates an empty contact.
 * @class
 * This class represents a contact (typically a person) with all its associated versions
 * of email address, home and work addresses, phone numbers, etc. Contacts can be filed/sorted
 * in different ways, with the default being Last, First. A contact is an item, so
 * it has tagging and flagging support, and belongs to a list.
 * <p>
 * Most of a contact's data is kept in attributes. These include name, phone, etc. Meta-data and
 * data common to items are not kept in attributes. These include flags, tags, folder, and
 * modified/created dates. Since the attribute data for contacts is loaded only once, a contact
 * gets its attribute values from that canonical list.
 * </p>
 *
 * @param {int}	id		the unique ID
 * @param {ZmContactList}	list		the list that contains this contact
 * @param {constant}	type		the item type
 * @param {object}	newDl		true if this is a new DL
 *
 * @extends		ZmItem
 */
ZmContact = function(id, list, type, newDl) {
	if (arguments.length == 0) { return; }

	type = type || ZmItem.CONTACT;
	ZmItem.call(this, type, id, list);

	this.attr = {};
	this.isGal = (this.list && this.list.isGal) || newDl;
	if (newDl) {
		this.folderId = ZmFolder.ID_DLS;
		this.dlInfo = {	isMember: false,
						isOwner: true,
						subscriptionPolicy: null,
						unsubscriptionPolicy: null,
						description: "",
						displayName: "",
						notes: "",
						hideInGal: false,
						mailPolicy: null,
						owners: [appCtxt.get(ZmSetting.USERNAME)]
		};

	}

	this.participants = new AjxVector(); // XXX: need to populate this guy (see ZmConv)
};

ZmContact.prototype = new ZmItem;
ZmContact.prototype.constructor = ZmContact;
ZmContact.prototype.isZmContact = true;

// fields
ZmContact.F_anniversary				= "anniversary";
ZmContact.F_assistantPhone			= "assistantPhone";
ZmContact.F_attachment				= "attachment";
ZmContact.F_birthday				= "birthday";
ZmContact.F_callbackPhone			= "callbackPhone";
ZmContact.F_carPhone				= "carPhone";
ZmContact.F_company					= "company";
ZmContact.F_companyPhone			= "companyPhone";
ZmContact.F_custom					= "custom";
ZmContact.F_description				= "description";
ZmContact.F_department				= "department";
ZmContact.F_dlist					= "dlist";				// Group fields
ZmContact.F_dlDisplayName			= "dldisplayname"; //DL
ZmContact.F_dlDesc					= "dldesc";  //DL
ZmContact.F_dlHideInGal				= "dlhideingal";  //DL
ZmContact.F_dlNotes					= "dlnotes";  //DL
ZmContact.F_dlSubscriptionPolicy	= "dlsubspolicy";  //DL
ZmContact.F_dlMailPolicy			= "dlmailpolicy";  //DL
ZmContact.F_dlMailPolicySpecificMailers	= "dlmailpolicyspecificmailers";  //DL
ZmContact.F_dlUnsubscriptionPolicy	= "dlunsubspolicy";  //DL
ZmContact.F_dlListOwners			= "dllistowners";  //DL
ZmContact.F_email					= "email";
ZmContact.F_email2					= "email2";
ZmContact.F_email3					= "email3";
ZmContact.F_email4					= "email4";
ZmContact.F_email5					= "email5";
ZmContact.F_email6					= "email6";
ZmContact.F_email7					= "email7";
ZmContact.F_email8					= "email8";
ZmContact.F_email9					= "email9";
ZmContact.F_email10					= "email10";
ZmContact.F_email11					= "email11";
ZmContact.F_email12					= "email12";
ZmContact.F_email13					= "email13";
ZmContact.F_email14					= "email14";
ZmContact.F_email15					= "email15";
ZmContact.F_email16					= "email16";
ZmContact.F_fileAs					= "fileAs";
ZmContact.F_firstName				= "firstName";
ZmContact.F_folderId				= "folderId";
ZmContact.F_groups                  = "groups";         //group members
ZmContact.F_homeCity				= "homeCity";
ZmContact.F_homeCountry				= "homeCountry";
ZmContact.F_homeFax					= "homeFax";
ZmContact.F_homePhone				= "homePhone";
ZmContact.F_homePhone2				= "homePhone2";
ZmContact.F_homePostalCode			= "homePostalCode";
ZmContact.F_homeState				= "homeState";
ZmContact.F_homeStreet				= "homeStreet";
ZmContact.F_homeURL					= "homeURL";
ZmContact.F_image					= "image";				// contact photo
ZmContact.F_imAddress 				= "imAddress";			// IM addresses
ZmContact.F_imAddress1 				= "imAddress1";			// IM addresses
ZmContact.F_imAddress2 				= "imAddress2";
ZmContact.F_imAddress3				= "imAddress3";
ZmContact.F_jobTitle				= "jobTitle";
ZmContact.F_lastName				= "lastName";
ZmContact.F_maidenName				= "maidenName";
ZmContact.F_memberC                 = "memberC";
ZmContact.F_memberG                 = "memberG";
ZmContact.F_memberI                 = "memberI";
ZmContact.F_middleName				= "middleName";
ZmContact.F_mobilePhone				= "mobilePhone";
ZmContact.F_namePrefix				= "namePrefix";
ZmContact.F_nameSuffix				= "nameSuffix";
ZmContact.F_nickname				= "nickname";
ZmContact.F_notes					= "notes";
ZmContact.F_otherCity				= "otherCity";
ZmContact.F_otherCountry			= "otherCountry";
ZmContact.F_otherFax				= "otherFax";
ZmContact.F_otherPhone				= "otherPhone";
ZmContact.F_otherPostalCode			= "otherPostalCode";
ZmContact.F_otherState				= "otherState";
ZmContact.F_otherStreet				= "otherStreet";
ZmContact.F_otherURL				= "otherURL";
ZmContact.F_pager					= "pager";
ZmContact.F_phoneticFirstName       = "phoneticFirstName";
ZmContact.F_phoneticLastName        = "phoneticLastName";
ZmContact.F_phoneticCompany         = "phoneticCompany";
ZmContact.F_type					= "type";
ZmContact.F_workAltPhone			= "workAltPhone";
ZmContact.F_workCity				= "workCity";
ZmContact.F_workCountry				= "workCountry";
ZmContact.F_workEmail1				= "workEmail1";
ZmContact.F_workEmail2				= "workEmail2";
ZmContact.F_workEmail3				= "workEmail3";
ZmContact.F_workFax					= "workFax";
ZmContact.F_workMobile				= "workMobile";
ZmContact.F_workPhone				= "workPhone";
ZmContact.F_workPhone2				= "workPhone2";
ZmContact.F_workPostalCode			= "workPostalCode";
ZmContact.F_workState				= "workState";
ZmContact.F_workStreet				= "workStreet";
ZmContact.F_workURL					= "workURL";
ZmContact.F_imagepart               = "imagepart";          // New field for bug 73146 - Contacts call does not return the image information
ZmContact.F_zimletImage				= "zimletImage";
ZmContact.X_fileAs					= "fileAs";				// extra fields
ZmContact.X_firstLast				= "firstLast";
ZmContact.X_fullName				= "fullName";
ZmContact.X_vcardXProps             = "vcardXProps";
ZmContact.X_outlookUserField        = "outlookUserField";
ZmContact.MC_cardOwner				= "cardOwner";			// My card fields
ZmContact.MC_workCardMessage		= "workCardMessage";
ZmContact.MC_homeCardMessage		= "homeCardMessage";
ZmContact.MC_homePhotoURL			= "homePhotoURL";
ZmContact.MC_workPhotoURL			= "workPhotoURL";
ZmContact.GAL_MODIFY_TIMESTAMP		= "modifyTimeStamp";	// GAL fields
ZmContact.GAL_CREATE_TIMESTAMP		= "createTimeStamp";
ZmContact.GAL_ZIMBRA_ID				= "zimbraId";
ZmContact.GAL_OBJECT_CLASS			= "objectClass";
ZmContact.GAL_MAIL_FORWARD_ADDRESS	= "zimbraMailForwardingAddress";
ZmContact.GAL_CAL_RES_TYPE			= "zimbraCalResType";
ZmContact.GAL_CAL_RES_LOC_NAME		= "zimbraCalResLocationDisplayName";

// file as
(function() {
	var i = 1;
	ZmContact.FA_LAST_C_FIRST			= i++;
	ZmContact.FA_FIRST_LAST 			= i++;
	ZmContact.FA_COMPANY 				= i++;
	ZmContact.FA_LAST_C_FIRST_COMPANY	= i++;
	ZmContact.FA_FIRST_LAST_COMPANY		= i++;
	ZmContact.FA_COMPANY_LAST_C_FIRST	= i++;
	ZmContact.FA_COMPANY_FIRST_LAST		= i++;
	ZmContact.FA_CUSTOM					= i++;
})();

// Field information

ZmContact.ADDRESS_FIELDS = [
    // NOTE: sync with field order in ZmEditContactView's templates
	ZmContact.F_homeCity,
	ZmContact.F_homeCountry,
	ZmContact.F_homePostalCode,
	ZmContact.F_homeState,
	ZmContact.F_homeStreet,
	ZmContact.F_workCity,
	ZmContact.F_workCountry,
	ZmContact.F_workPostalCode,
	ZmContact.F_workState,
	ZmContact.F_workStreet,
    ZmContact.F_otherCity,
    ZmContact.F_otherCountry,
    ZmContact.F_otherPostalCode,
    ZmContact.F_otherState,
    ZmContact.F_otherStreet
];
ZmContact.EMAIL_FIELDS = [
	ZmContact.F_email,
	ZmContact.F_workEmail1,
	ZmContact.F_workEmail2,
	ZmContact.F_workEmail3
];
ZmContact.IM_FIELDS = [
	ZmContact.F_imAddress
];
ZmContact.OTHER_FIELDS = [
    // NOTE: sync with field order in ZmEditContactView's templates
	ZmContact.F_birthday,
    ZmContact.F_anniversary,
	ZmContact.F_custom
];
ZmContact.PHONE_FIELDS = [
    // NOTE: sync with field order in ZmEditContactView's templates
    ZmContact.F_mobilePhone,
    ZmContact.F_workPhone,
    ZmContact.F_workFax,
    ZmContact.F_companyPhone,
    ZmContact.F_homePhone,
    ZmContact.F_homeFax,
    ZmContact.F_pager,
    ZmContact.F_callbackPhone,
	ZmContact.F_assistantPhone,
	ZmContact.F_carPhone,
	ZmContact.F_otherPhone,
    ZmContact.F_otherFax,
	ZmContact.F_workAltPhone,
	ZmContact.F_workMobile
];
ZmContact.PRIMARY_FIELDS = [
    // NOTE: sync with field order in ZmEditContactView's templates
    ZmContact.F_image,
    ZmContact.F_namePrefix,
    ZmContact.F_firstName,
    ZmContact.F_phoneticFirstName,
    ZmContact.F_middleName,
	ZmContact.F_maidenName,
    ZmContact.F_lastName,
    ZmContact.F_phoneticLastName,
    ZmContact.F_nameSuffix,
    ZmContact.F_nickname,
    ZmContact.F_jobTitle,
    ZmContact.F_department,
	ZmContact.F_company,
    ZmContact.F_phoneticCompany,
	ZmContact.F_fileAs,
	ZmContact.F_folderId,
	ZmContact.F_notes
];
ZmContact.URL_FIELDS = [
    // NOTE: sync with field order in ZmEditContactView's templates
	ZmContact.F_homeURL,
	ZmContact.F_workURL,
	ZmContact.F_otherURL
];
ZmContact.GAL_FIELDS = [
	ZmContact.GAL_MODIFY_TIMESTAMP,
	ZmContact.GAL_CREATE_TIMESTAMP,
	ZmContact.GAL_ZIMBRA_ID,
	ZmContact.GAL_OBJECT_CLASS,
	ZmContact.GAL_MAIL_FORWARD_ADDRESS,
	ZmContact.GAL_CAL_RES_TYPE,
	ZmContact.GAL_CAL_RES_LOC_NAME,
	ZmContact.F_type
];
ZmContact.MYCARD_FIELDS = [
	ZmContact.MC_cardOwner,
	ZmContact.MC_homeCardMessage,
	ZmContact.MC_homePhotoURL,
	ZmContact.MC_workCardMessage,
	ZmContact.MC_workPhotoURL
];
ZmContact.X_FIELDS = [
	ZmContact.X_firstLast,
	ZmContact.X_fullName,
    ZmContact.X_vcardXProps
];


ZmContact.IGNORE_NORMALIZATION = [];

ZmContact.ADDR_PREFIXES = ["work","home","other"];
ZmContact.ADDR_SUFFIXES = ["Street","City","State","PostalCode","Country"];

ZmContact.updateFieldConstants = function() {

	for (var i = 0; i < ZmContact.ADDR_PREFIXES.length; i++) {
		for (var j = 0; j < ZmContact.ADDR_SUFFIXES.length; j++) {
			ZmContact.IGNORE_NORMALIZATION.push(ZmContact.ADDR_PREFIXES[i] + ZmContact.ADDR_SUFFIXES[j]);
		}
	}

ZmContact.DISPLAY_FIELDS = [].concat(
	ZmContact.ADDRESS_FIELDS,
	ZmContact.EMAIL_FIELDS,
	ZmContact.IM_FIELDS,
	ZmContact.OTHER_FIELDS,
	ZmContact.PHONE_FIELDS,
	ZmContact.PRIMARY_FIELDS,
	ZmContact.URL_FIELDS
);

ZmContact.IGNORE_FIELDS = [].concat(
	ZmContact.GAL_FIELDS,
	ZmContact.MYCARD_FIELDS,
	ZmContact.X_FIELDS,
	[ZmContact.F_imagepart]
);

ZmContact.ALL_FIELDS = [].concat(
	ZmContact.DISPLAY_FIELDS, ZmContact.IGNORE_FIELDS
);

ZmContact.IS_DATE = {};
ZmContact.IS_DATE[ZmContact.F_birthday] = true;
ZmContact.IS_DATE[ZmContact.F_anniversary] = true;

ZmContact.IS_IGNORE = AjxUtil.arrayAsHash(ZmContact.IGNORE_FIELDS);

// number of distribution list members to fetch at a time
ZmContact.DL_PAGE_SIZE = 100;

ZmContact.GROUP_CONTACT_REF = "C";
ZmContact.GROUP_GAL_REF = "G";
ZmContact.GROUP_INLINE_REF = "I";	
}; // updateFieldConstants()
ZmContact.updateFieldConstants();

/**
 * This structure can be queried to determine if the first
 * entry in a multi-value entry is suffixed with "1". Most
 * attributes add a numerical suffix to all but the first
 * entry.
 * <p>
 * <strong>Note:</strong>
 * In most cases, {@link ZmContact#getAttributeName} is a better choice.
 */
ZmContact.IS_ADDONE = {};
ZmContact.IS_ADDONE[ZmContact.F_custom] = true;
ZmContact.IS_ADDONE[ZmContact.F_imAddress] = true;
ZmContact.IS_ADDONE[ZmContact.X_outlookUserField] = true;

/**
 * Gets an indexed attribute name taking into account if the field
 * with index 1 should append the "1" or not. Code should call this
 * function in lieu of accessing {@link ZmContact.IS_ADDONE} directly.
 */
ZmContact.getAttributeName = function(name, index) {
	index = index || 1;
	return index > 1 || ZmContact.IS_ADDONE[name] ? name+index : name;
};

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmContact.prototype.toString =
function() {
	return "ZmContact";
};

// Class methods

/**
 * Creates a contact from an XML node.
 *
 * @param {Object}	node		a "cn" XML node
 * @param {Hash}	args		args to pass to the constructor
 * @return	{ZmContact}	the contact
 */
ZmContact.createFromDom =
function(node, args) {
	// check global cache for this item first
	var contact = appCtxt.cacheGet(node.id);

	// make sure the revision hasnt changed, otherwise contact is out of date
	if (contact == null || (contact && contact.rev != node.rev)) {
		contact = new ZmContact(node.id, args.list);
		if (args.isGal) {
			contact.isGal = args.isGal;
		}
		contact._loadFromDom(node);
		//update the canonical list
		appCtxt.getApp(ZmApp.CONTACTS).getContactList().add(contact);
	} else {
		if (node.m) {
			contact.attr[ZmContact.F_groups] = node.m;
		}
		if (node.ref) {
			contact.ref = node.ref;
		}
		if (node.tn) {
			contact._parseTagNames(node.tn);
		}
		AjxUtil.hashUpdate(contact.attr, node._attrs);	// merge new attrs just in case we don't have them
		contact.list = args.list || new ZmContactList(null);
		contact._list = {};
		contact._list[contact.list.id] = true;
	}

	return contact;
};

/**
 * Compares two contacts based on how they are filed. Intended for use by
 * sort methods.
 *
 * @param {ZmContact}		a		a contact
 * @param {ZmContact}		b		a contact
 * @return	{int}	0 if the contacts are the same; 1 if "a" is before "b"; -1 if "b" is before "a"
 */
ZmContact.compareByFileAs =
function(a, b) {
	var aFileAs = (a instanceof ZmContact) ? a.getFileAs(true) : ZmContact.computeFileAs(a._attrs).toLowerCase();
	var bFileAs = (b instanceof ZmContact) ? b.getFileAs(true) : ZmContact.computeFileAs(b._attrs).toLowerCase();

	if (!bFileAs || (aFileAs > bFileAs)) return 1;
	if (aFileAs < bFileAs) return -1;
	return 0;
};

/**
 * Figures out the filing string for the contact according to the chosen method.
 *
 * @param {ZmContact|Hash}	contact		a contact or a hash of contact attributes
 */
ZmContact.computeFileAs =
function(contact) {
	/*
	 * Bug 98176: To keep the same logic of generating the FileAs contact
	 *    label string between the Ajax client, and HTML client, when the
	 *    computeFileAs(), and fileAs*() functions are modified, please
	 *    change the corresponding functions defined in the autoComplete.tag
	 */
	var attr = (contact instanceof ZmContact) ? contact.getAttrs() : contact;
	if (!attr) return;

	if (attr[ZmContact.F_dlDisplayName]) {
		//this is only DL case. But since this is sometimes just the attrs,
		//I can't always use isDistributionList method.
		return attr[ZmContact.F_dlDisplayName];
	}

	var val = parseInt(attr.fileAs);
	var fa;
	var idx = 0;

	switch (val) {
		case ZmContact.FA_LAST_C_FIRST: 										// Last, First
		default: {
			// if GAL contact, use full name instead (bug fix #4850,4009)
			if (contact && contact.isGal) {
				if (attr.fullName) { // bug fix #27428 - if fullName is Array, return first
					return (attr.fullName instanceof Array) ? attr.fullName[0] : attr.fullName;
				}
				return ((attr.email instanceof Array) ? attr.email[0] : attr.email);
			}
			fa = ZmContact.fileAsLastFirst(attr.firstName, attr.lastName, attr.fullName, attr.nickname);
		}
		break;

		case ZmContact.FA_FIRST_LAST: { 										// First Last
			fa = ZmContact.fileAsFirstLast(attr.firstName, attr.lastName, attr.fullName, attr.nickname);
		}
		break;

		case ZmContact.FA_COMPANY: {											// Company
			if (attr.company) fa = attr.company;
		}
		break;

		case ZmContact.FA_LAST_C_FIRST_COMPANY: {								// Last, First (Company)
			var name = ZmContact.fileAsLastFirst(attr.firstName, attr.lastName, attr.fullName, attr.nickname);
			fa = ZmContact.fileAsNameCompany(name, attr.company);
		}
		break;

		case ZmContact.FA_FIRST_LAST_COMPANY: {									// First Last (Company)
			var name = ZmContact.fileAsFirstLast(attr.firstName, attr.lastName, attr.fullName, attr.nickname);
			fa = ZmContact.fileAsNameCompany(name, attr.company);
		}
		break;

		case ZmContact.FA_COMPANY_LAST_C_FIRST: {								// Company (Last, First)
			var name = ZmContact.fileAsLastFirst(attr.firstName, attr.lastName);
			fa = ZmContact.fileAsCompanyName(name, attr.company);
		}
		break;

		case ZmContact.FA_COMPANY_FIRST_LAST: {									// Company (First Last)
			var name = ZmContact.fileAsFirstLast(attr.firstName, attr.lastName);
			fa = ZmContact.fileAsCompanyName(name, attr.company);
		}
		break;

		case ZmContact.FA_CUSTOM: {												// custom looks like this: "8:foobar"
			return attr.fileAs.substring(2);
		}
		break;
	}
	return fa || attr.fullName || "";
};

/**
 * Name printing helper "First Last".
 * 
 * @param	{String}	first		the first name
 * @param	{String}	last		the last name
 * @param	{String}	fullname		the fullname
 * @param	{String}	nickname		the nickname
 * @return	{String}	the name format
 */
ZmContact.fileAsFirstLast =
function(first, last, fullname, nickname) {
	if (first && last)
		return AjxMessageFormat.format(ZmMsg.fileAsFirstLast, [first, last]);
	return first || last || fullname || nickname || "";
};

/**
 * Name printing helper "Last, First".
 * 
 * @param	{String}	first		the first name
 * @param	{String}	last		the last name
 * @param	{String}	fullname		the fullname
 * @param	{String}	nickname		the nickname
 * @return	{String}	the name format
 */
ZmContact.fileAsLastFirst =
function(first, last, fullname, nickname) {
	if (first && last)
		return AjxMessageFormat.format(ZmMsg.fileAsLastFirst, [first, last]);
	return last || first || fullname || nickname || "";
};

/**
 * Name printing helper "Name (Company)".
 *
 * @param	{String}	name		the contact name
 * @param	{String}	company		the company
 * @return	{String}	the name format
 */
ZmContact.fileAsNameCompany =
function(name, company) {
	if (name && company)
		return AjxMessageFormat.format(ZmMsg.fileAsNameCompany, [name, company]);
	if (company)
		return AjxMessageFormat.format(ZmMsg.fileAsCompanyAsSecondaryOnly, [company]);
	return name;
};

/**
 * Name printing helper "Company (Name)".
 * 
 * @param	{String}	name		the contact name
 * @param	{String}	company		the company
 * @return	{String}	the name format
 */
ZmContact.fileAsCompanyName =
function(name, company) {
	if (company && name)
		return AjxMessageFormat.format(ZmMsg.fileAsCompanyName, [name, company]);
	if (name)
		return AjxMessageFormat.format(ZmMsg.fileAsNameAsSecondaryOnly, [name]);
	return company;
};

/**
 * Computes the custom file as string by prepending "8:" to the given custom fileAs string.
 * 
 * @param {Hash}	customFileAs	a set of contact attributes
 * @return	{String}	the name format
 */
ZmContact.computeCustomFileAs =
function(customFileAs) {
	return [ZmContact.FA_CUSTOM, ":", customFileAs].join("");
};

/*
 * 
 * These next few static methods handle a contact that is either an anonymous
 * object or an actual ZmContact. The former is used to optimize loading. The
 * anonymous object is upgraded to a ZmContact when needed.
 *  
 */

/**
 * Gets an attribute.
 * 
 * @param	{ZmContact}	contact		the contact
 * @param	{String}	attr		the attribute
 * @return	{Object}	the attribute value or <code>null</code> for none
 */
ZmContact.getAttr =
function(contact, attr) {
	return (contact instanceof ZmContact)
		? contact.getAttr(attr)
		: (contact && contact._attrs) ? contact._attrs[attr] : null;
};

/**
 * returns the prefix of a string in the format "abc123". (would return "abc"). If the string is all number, it's a special case and returns the string itself. e.g. "234" would return "234".
 */
ZmContact.getPrefix = function(s) {
	var trimmed = s.replace(/\d+$/, "");
	if (trimmed === "") {
		//number only - don't trim. The number is the prefix.
		return s;
	}
	return trimmed;
};

/**
 * Normalizes the numbering of the given attribute names and
 * returns a new object with the re-numbered attributes. For
 * example, if the attributes contains a "foo2" but no "foo",
 * then the "foo2" attribute will be renamed to "foo" in the
 * returned object.
 *
 * @param {Hash}	attrs  a hash of attributes to normalize.
 * @param {String}	[prefix] if specified, only the the attributes that match the given prefix will be returned
 * @param {Array}	[ignore] if specified, the attributes that are present in the array will not be normalized
 * @return	{Hash}	a hash of normalized attributes
 */
ZmContact.getNormalizedAttrs = function(attrs, prefix, ignore) {
	var nattrs = {};
	if (attrs) {
		// normalize attribute numbering
		var names = AjxUtil.keys(attrs);
		names.sort(ZmContact.__BY_ATTRIBUTE);
		var a = {};
		for (var i = 0; i < names.length; i++) {
			var name = names[i];
			// get current count
			var nprefix = ZmContact.getPrefix(name);
			if (prefix && prefix != nprefix) continue;
			if (AjxUtil.isArray(ignore) && AjxUtil.indexOf(ignore, nprefix)!=-1) {
				nattrs[name] = attrs[name];
			} else {
				if (!a[nprefix]) a[nprefix] = 0;
				// normalize, if needed
				var nname = ZmContact.getAttributeName(nprefix, ++a[nprefix]);
				nattrs[nname] = attrs[name];
			}
		}
	}
	return nattrs;
};

ZmContact.__RE_ATTRIBUTE = /^(.*?)(\d+)$/;
ZmContact.__BY_ATTRIBUTE = function(a, b) {
	var aa = a.match(ZmContact.__RE_ATTRIBUTE) || [a,a,1];
	var bb = b.match(ZmContact.__RE_ATTRIBUTE) || [b,b,1];
	return aa[1] == bb[1] ? Number(aa[2]) - Number(bb[2]) : aa[1].localeCompare(bb[1]);
};

/**
 * Sets the attribute.
 * 
 * @param	{ZmContact}	contact		the contact
 * @param	{String}	attr		the attribute
 * @param	{Object}	value		the attribute value
 */
ZmContact.setAttr =
function(contact, attr, value) {
	if (contact instanceof ZmContact)
		contact.setAttr(attr, value);
	else
		contact._attrs[attr] = value;
};

/**
 * Checks if the contact is in the trash.
 * 
 * @param	{ZmContact}	contact		the contact
 * @return	{Boolean}	<code>true</code> if in trash
 */
ZmContact.isInTrash =
function(contact) {
	var folderId = (contact instanceof ZmContact) ? contact.folderId : contact.l;
	var folder = appCtxt.getById(folderId);
	return (folder && folder.isInTrash());
};

/**
 * @private
 */
ZmContact.prototype.load =
function(callback, errorCallback, batchCmd, deref) {
	var jsonObj = {GetContactsRequest:{_jsns:"urn:zimbraMail"}};
	if (deref) {
		jsonObj.GetContactsRequest.derefGroupMember = "1";
	}
	var request = jsonObj.GetContactsRequest;
	request.cn = [{id:this.id}];

	var respCallback = new AjxCallback(this, this._handleLoadResponse, [callback]);

	if (batchCmd) {
		var jsonObj = {GetContactsRequest:{_jsns:"urn:zimbraMail"}};
		if (deref) {
			jsonObj.GetContactsRequest.derefGroupMember = "1";
		}
		jsonObj.GetContactsRequest.cn = {id:this.id};
		batchCmd.addRequestParams(jsonObj, respCallback, errorCallback);
	} else {
		appCtxt.getAppController().sendRequest({jsonObj:jsonObj,
												asyncMode:true,
												callback:respCallback,
												errorCallback:errorCallback});
	}
};

/**
 * @private
 */
ZmContact.prototype._handleLoadResponse =
function(callback, result) {
	var resp = result.getResponse().GetContactsResponse;

	// for now, we just assume only one contact was requested at a time
	var contact = resp.cn[0];
	this.attr = contact._attrs;
	if (contact.m) {
		for (var i = 0; i < contact.m.length; i++) {
			//cache contacts from contact groups (e.g. GAL contacts, shared contacts have not already been cached)
			var member = contact.m[i];
			var isGal = false;
			if (member.type == ZmContact.GROUP_GAL_REF) {
				isGal = true;
			}
			if (member.cn && member.cn.length > 0) {
				var memberContact = member.cn[0];
				memberContact.ref = memberContact.ref || (isGal && member.value); //we sometimes don't get "ref" but the "value" for GAL is the ref.
				var loadMember = ZmContact.createFromDom(memberContact, {list: this.list, isGal: isGal}); //pass GAL so fileAS gets set correctly
				loadMember.isDL = isGal && loadMember.attr[ZmContact.F_type] == "group";
				appCtxt.cacheSet(member.value, loadMember);
			}
			
		}
		this._loadFromDom(contact); //load group
	}
	this.isLoaded = true;
	if (callback) {
		callback.run(contact, this);
	}
};

/**
 * @private
 */
ZmContact.prototype.clear =
function() {
	// bug fix #41666 - override base class method and do nothing
};

/**
 * Checks if the contact attributes are empty.
 * 
 * @return	{Boolean}	<code>true</code> if empty
 */
ZmContact.prototype.isEmpty =
function() {
	for (var i in this.attr) {
		return false;
	}
	return true;
};

/**
 * Checks if the contact is shared.
 * 
 * @return	{Boolean}	<code>true</code> if shared
 */
ZmContact.prototype.isShared =
function() {
	return this.addrbook && this.addrbook.link;
};

/**
 * Checks if the contact is read-only.
 * 
 * @return	{Boolean}	<code>true</code> if read-only
 */
ZmContact.prototype.isReadOnly =
function() {
	if (this.isGal) { return true; }

	return this.isShared()
		? this.addrbook && this.addrbook.isReadOnly()
		: false;
};

/**
 * Checks if the contact is locked. This is different for DLs than read-only.
 *
 * @return	{Boolean}	<code>true</code> if read-only
 */
ZmContact.prototype.isLocked =
function() {
	if (!this.isDistributionList()) {
		return this.isReadOnly();
	}
	if (!this.dlInfo) {
		return false; //rare case after editing by an owner if the fileAsChanged, the new dl Info still not read, and the layout re-done. So don't show the lock.
	}
	var dlInfo = this.dlInfo;
	if (dlInfo.isOwner) {
		return false;
	}
	if (dlInfo.isMember) {
    	return dlInfo.unsubscriptionPolicy == ZmContactSplitView.SUBSCRIPTION_POLICY_REJECT;
	}
	return dlInfo.subscriptionPolicy == ZmContactSplitView.SUBSCRIPTION_POLICY_REJECT;
};

/**
 * Checks if the contact is a group.
 * 
 * @return	{Boolean}	<code>true</code> if a group
 */
ZmContact.prototype.isGroup =
function() {
	return this.getAttr(ZmContact.F_type) == "group" || this.type == ZmItem.GROUP;
};

/**
 * Checks if the contact is a DL.
 *
 * @return	{Boolean}	<code>true</code> if a group
 */
ZmContact.prototype.isDistributionList =
function() {
	return this.isGal && this.isGroup();
};


// parses "groups" attr into AjxEmailAddress objects stored in 3 vectors (all, good, and bad)
/**
 * Gets the group members.
 *
 * @return	{AjxVector}		the group members or <code>null</code> if not group
 */
ZmContact.prototype.getGroupMembers =
function() {
	var allMembers = this.getAllGroupMembers();
	var addrs = [];
	for (var i = 0; i < allMembers.length; i++) {
		addrs.push(allMembers[i].toString());
	}
	return AjxEmailAddress.parseEmailString(addrs.join(", "));
};	

/**
 * parses "groups" attr into an AjxEmailAddress with a few extra attributes (see ZmContactsHelper._wrapInlineContact)
 * 
 * @return	{AjxVector}		the group members or <code>null</code> if not group
 */
ZmContact.prototype.getAllGroupMembers =
function() {

	if (this.isDistributionList()) {
		return this.dlMembers;
	}

	var addrs = [];

	var groupMembers = this.attr[ZmContact.F_groups];
	if (!groupMembers){
		return AjxEmailAddress.parseEmailString(this.attr[ZmContact.F_email]);  //I doubt this is needed or works correctly, but I keep this logic from before. If we don't have the group members, how can we return the group email instead?
	}
	for (var i = 0; i < groupMembers.length; i++) {
		var member = groupMembers[i];
		var type = member.type;
		var value = member.value;
		if (type == ZmContact.GROUP_INLINE_REF) {
			addrs.push(ZmContactsHelper._wrapInlineContact(value));
		}
		else {
			var contact = ZmContact.getContactFromCache(value);	 //TODO: handle contacts not cached?
			if (!contact) {
				DBG.println(AjxDebug.DBG1, "Disregarding uncached contact: " + value);
				continue;
			}
			var ajxEmailAddress = ZmContactsHelper._wrapContact(contact);
			if (ajxEmailAddress && type === ZmContact.GROUP_CONTACT_REF) {
				ajxEmailAddress.groupRefValue = value; //don't normalize value
			}
			if (ajxEmailAddress) {
				addrs.push(ajxEmailAddress);
			}
		}
	}
	return addrs;
};


ZmContact.prototype.gatherExtraDlStuff =
function(callback) {
	if (this.dlInfo && !this.dlInfo.isMinimal) {
		//already there, skip to next step, loading DL Members
		this.loadDlMembers(callback);
		return;
	}
	var callbackFromGettingInfo = this._handleGetDlInfoResponse.bind(this, callback);
	this.loadDlInfo(callbackFromGettingInfo);
};


ZmContact.prototype._handleGetDlInfoResponse =
function(callback, result) {
	var response = result._data.GetDistributionListResponse;
	var dl = response.dl[0];
	var attrs = dl._attrs;
	var isMember = dl.isMember;
	var isOwner = dl.isOwner;
	var mailPolicySpecificMailers = [];
	this.dlInfo = {	isMember: isMember,
						isOwner: isOwner,
						subscriptionPolicy: attrs.zimbraDistributionListSubscriptionPolicy,
						unsubscriptionPolicy: attrs.zimbraDistributionListUnsubscriptionPolicy,
						description: attrs.description || "",
						displayName: attrs.displayName || "",
						notes: attrs.zimbraNotes || "",
						hideInGal: attrs.zimbraHideInGal == "TRUE",
						mailPolicy: isOwner && this._getMailPolicy(dl, mailPolicySpecificMailers),
						owners: isOwner && this._getOwners(dl)};
	this.dlInfo.mailPolicySpecificMailers = mailPolicySpecificMailers;

	this.loadDlMembers(callback);
};

ZmContact.prototype.loadDlMembers =
function(callback) {
	if ((!appCtxt.get("EXPAND_DL_ENABLED") || this.dlInfo.hideInGal) && !this.dlInfo.isOwner) {
		// can't get members if dl has zimbraHideInGal true, and not owner
		//also, if zimbraFeatureDistributionListExpandMembersEnabled is false - also do not show the members (again unless it's the owner)
		this.dlMembers = [];
		if (callback) {
			callback();
		}
		return;
	}
	if (this.dlMembers) {
		//already there - just callback
		if (callback) {
			callback();
		}
		return;
	}
	var respCallback = this._handleGetDlMembersResponse.bind(this, callback);
	this.getAllDLMembers(respCallback);
};


ZmContact.prototype._handleGetDlMembersResponse =
function(callback, result) {
	var list = result.list;
	if (!list) {
		this.dlMembers = [];
		callback();
		return;
	}
	var members = [];
	for (var i = 0; i < list.length; i++) {
		members.push({type: ZmContact.GROUP_INLINE_REF,
						value: list[i],
						address: list[i]});
	}

	this.dlMembers = members;
	callback();
};

ZmContact.prototype._getOwners =
function(dl) {
	var owners = dl.owners[0].owner;
	var ownersArray = [];
	for (var i = 0; i < owners.length; i++) {
		var owner = owners[i].name;
		ownersArray.push(owner); //just the email address, I think and hope.
	}
	return ownersArray;
};

ZmContact.prototype._getMailPolicy =
function(dl, specificMailers) {
	var mailPolicy;

	var rights = dl.rights[0].right;
	var right = rights[0];
	var grantees = right.grantee;
	if (!grantees) {
		return ZmGroupView.MAIL_POLICY_ANYONE;
	}
	for (var i = 0; i < grantees.length; i++) {
		var grantee = grantees[i];

		mailPolicy = ZmGroupView.GRANTEE_TYPE_TO_MAIL_POLICY_MAP[grantee.type];

		if (mailPolicy == ZmGroupView.MAIL_POLICY_SPECIFIC) {
			specificMailers.push(grantee.name);
		}
		else if (mailPolicy == ZmGroupView.MAIL_POLICY_ANYONE) {
			break;
		}
		else if (mailPolicy == ZmGroupView.MAIL_POLICY_INTERNAL) {
			break;
		}
		else if (mailPolicy == ZmGroupView.MAIL_POLICY_MEMBERS) {
			if (grantee.name == this.getEmail()) {
				//this means only members of this DL can send.
				break;
			}
			else {
				//must be another DL, and we do allow it, so treat it as regular user.
				specificMailers.push(grantee.name);
				mailPolicy = ZmGroupView.MAIL_POLICY_SPECIFIC;
			}
		}
	}
	mailPolicy = mailPolicy || ZmGroupView.MAIL_POLICY_ANYONE;

	return mailPolicy;
};


ZmContact.prototype.loadDlInfo =
function(callback) {
	var soapDoc = AjxSoapDoc.create("GetDistributionListRequest", "urn:zimbraAccount", null);
	soapDoc.setMethodAttribute("needOwners", "1");
	soapDoc.setMethodAttribute("needRights", "sendToDistList");
	var elBy = soapDoc.set("dl", this.getEmail());
	elBy.setAttribute("by", "name");

	appCtxt.getAppController().sendRequest({soapDoc: soapDoc, asyncMode: true, callback: callback});
};

ZmContact.prototype.toggleSubscription =
function(callback) {
	var soapDoc = AjxSoapDoc.create("SubscribeDistributionListRequest", "urn:zimbraAccount", null);
	soapDoc.setMethodAttribute("op", this.dlInfo.isMember ? "unsubscribe" : "subscribe");
	var elBy = soapDoc.set("dl", this.getEmail());
	elBy.setAttribute("by", "name");
	appCtxt.getAppController().sendRequest({soapDoc: soapDoc, asyncMode: true, callback: callback});
};



/**
 *  Returns the contact id.  If includeUserZid is true it will return the format zid:id
 * @param includeUserZid {boolean} true to include the zid prefix for the contact id
 * @return {String} contact id string
 */
ZmContact.prototype.getId = 
function(includeUserZid) {

	if (includeUserZid) {
		return this.isShared() ? this.id : appCtxt.accountList.mainAccount.id + ":" + this.id; 
	}
	
	return this.id;
};
/**
 * Gets the icon.
 * @param 	{ZmAddrBook} addrBook	address book of contact 
 * @return	{String}	the icon
 */
ZmContact.prototype.getIcon =
function(addrBook) {
	if (this.isDistributionList()) 						{ return "DistributionList"; }
	if (this.isGal)										{ return "GALContact"; }
	if (this.isShared() || (addrBook && addrBook.link))	{ return "SharedContact"; }
	if (this.isGroup())									{ return "Group"; }
	return "Contact";
};

ZmContact.prototype.getIconLarge =
function() {
	if (this.isDistributionList()) {
		return "Group_48";
	}
	//todo - get a big version of ImgGalContact.png
//	if (this.isGal) {
//	}
	return "Person_48";
};

/**
 * Gets the folder id.
 * 
 * @return	{String}		the folder id	
 */
ZmContact.prototype.getFolderId =
function() {
	return this.isShared()
		? this.folderId.split(":")[0]
		: this.folderId;
};

/**
 * Gets the attribute.
 * 
 * @param	{String}	name		the attribute name
 * @return	{String}	the value
 */
ZmContact.prototype.getAttr =
function(name) {
	var val = this.attr[name];
	return val ? ((val instanceof Array) ? val[0] : val) : "";
};

/**
 * Sets the attribute.
 * 
 * @param	{String}	name		the attribute name
 * @param	{String}	value		the attribute value
 */
ZmContact.prototype.setAttr =
function(name, value) {
	this.attr[name] = value;
};

/**
 * Sets the participant status.
 *
 * @param	{String}	value the participant status value
 */
ZmContact.prototype.setParticipantStatus =
function(ptst) {
	this.participantStatus = ptst;
};

/**
 * gets the participant status.
 *
 * @return	{String}    the value
 */
ZmContact.prototype.getParticipantStatus =
function() {
	return this.participantStatus;
};

/**
 * Sets the participant role.
 *
 * @param	{String}	value the participant role value
 */
ZmContact.prototype.setParticipantRole =
function(role) {
	this.participantRole = role;
};

/**
 * gets the participant role.
 *
 * @return	{String}    the value
 */
ZmContact.prototype.getParticipantRole =
function() {
	return this.participantRole;
};

/**
 * Removes the attribute.
 * 
 * @param	{String}	name		the attribute name
 */
ZmContact.prototype.removeAttr =
function(name) {
	delete this.attr[name];
};

/**
 * Gets the contact attributes.
 *
 * @param {String}	[prefix] if specified, only the the attributes that match the given prefix will be returned
 * @return	{Hash}	a hash of attribute/value pairs
 */
ZmContact.prototype.getAttrs = function(prefix) {
	var attrs = this.attr;
	if (prefix) {
		attrs = {};
		for (var aname in this.attr) {
			var namePrefix = ZmContact.getPrefix(aname);
			if (namePrefix === prefix) {
				attrs[aname] = this.attr[aname];
			}
		}
	}
	return attrs;
};

/**
 * Gets a normalized set of attributes where the attribute
 * names have been re-numbered as needed. For example, if the
 * attributes contains a "foo2" but no "foo", then the "foo2"
 * attribute will be renamed to "foo" in the returned object.
 * <p>
 * <strong>Note:</strong>
 * This method is expensive so should be called once and
 * cached temporarily as needed instead of being called
 * for each normalized attribute that is needed.
 * 
 * @param {String}	[prefix]		if specified, only the
 *                        the attributes that match the given
 *                        prefix will be returned.
 * @return	{Hash}	a hash of attribute/value pairs
 */
ZmContact.prototype.getNormalizedAttrs = function(prefix) {
	return ZmContact.getNormalizedAttrs(this.attr, prefix, ZmContact.IGNORE_NORMALIZATION);
};

/**
* Creates a contact from the given set of attributes. Used to create contacts on
* the fly (rather than by loading them). This method is called by a list's <code>create()</code>
* method.
* <p>
* If this is a GAL contact, we assume it is being added to the contact list.</p>
*
* @param {Hash}	attr			the attribute/value pairs for this contact
* @param {ZmBatchCommand}	batchCmd	the batch command that contains this request
* @param {boolean} isAutoCreate true if this is a auto create and toast message should not be shown
*/
ZmContact.prototype.create =
function(attr, batchCmd, isAutoCreate) {

	if (this.isDistributionList()) {
		this._createDl(attr);
		return;
	}

	var jsonObj = {CreateContactRequest:{_jsns:"urn:zimbraMail"}};
	var request = jsonObj.CreateContactRequest;
	var cn = request.cn = {};

	var folderId = attr[ZmContact.F_folderId] || ZmFolder.ID_CONTACTS;
	var folder = appCtxt.getById(folderId);
	if (folder && folder.isRemote()) {
		folderId = folder.getRemoteId();
	}
	cn.l = folderId;
	cn.a = [];
	cn.m = [];

	for (var name in attr) {
		if (name == ZmContact.F_folderId ||
			name == "objectClass" ||
			name == "zimbraId" ||
			name == "createTimeStamp" ||
			name == "modifyTimeStamp") { continue; }

		if (name == ZmContact.F_groups) {
			this._addContactGroupAttr(cn, attr);
		}
		else {
			this._addRequestAttr(cn, name, attr[name]);
		}
	}

	this._addRequestAttr(cn, ZmContact.X_fullName, ZmContact.computeFileAs(attr));

	var respCallback = new AjxCallback(this, this._handleResponseCreate, [attr, batchCmd != null, isAutoCreate]);

	if (batchCmd) {
		batchCmd.addRequestParams(jsonObj, respCallback);
	} else {
		appCtxt.getAppController().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:respCallback});
	}
};

/**
 * @private
 */
ZmContact.prototype._handleResponseCreate =
function(attr, isBatchMode, isAutoCreate, result) {
	// dont bother processing creates when in batch mode (just let create
	// notifications handle them)
	if (isBatchMode) { return; }

	var resp = result.getResponse().CreateContactResponse;
	cn = resp ? resp.cn[0] : null;
	var id = cn ? cn.id : null;
	if (id) {
		this._fileAs = null;
		this._fullName = null;
		this.id = id;
		this.modified = cn.md;
		this.folderId = cn.l || ZmOrganizer.ID_ADDRBOOK;
		for (var a in attr) {
			if (!(attr[a] == undefined || attr[a] == ''))
				this.setAttr(a, attr[a]);
		}
		var groupMembers = cn ? cn.m : null;
		if (groupMembers) {
			this.attr[ZmContact.F_groups] = groupMembers;
			cn._attrs[ZmContact.F_groups] = groupMembers;
		}
		if (!isAutoCreate) {
			var msg = this.isGroup() ? ZmMsg.groupCreated : ZmMsg.contactCreated;
			appCtxt.getAppController().setStatusMsg(msg);
		}
		//update the canonical list. (this includes adding to the _idHash like before (bug 44132) calling updateIdHash. But calling that left the list inconcistant.
		appCtxt.getApp(ZmApp.CONTACTS).getContactList().add(cn);
	} else {
		var msg = this.isGroup() ? ZmMsg.errorCreateGroup : ZmMsg.errorCreateContact;
		var detail = ZmMsg.errorTryAgain + "\n" + ZmMsg.errorContact;
		appCtxt.getAppController().setStatusMsg(msg, ZmStatusView.LEVEL_CRITICAL, detail);
	}
};

/**
 * Creates a contct from a VCF part of a message.
 * 
 * @param	{String}	msgId		the message
 * @param	{String}	vcardPartId	the vcard part id
 */
ZmContact.prototype.createFromVCard =
function(msgId, vcardPartId) {
	var jsonObj = {CreateContactRequest:{_jsns:"urn:zimbraMail"}};
	var cn = jsonObj.CreateContactRequest.cn = {l:ZmFolder.ID_CONTACTS};
	cn.vcard = {mid:msgId, part:vcardPartId};

	var params = {
		jsonObj: jsonObj,
		asyncMode: true,
		callback: (new AjxCallback(this, this._handleResponseCreateVCard)),
		errorCallback: (new AjxCallback(this, this._handleErrorCreateVCard))
	};

	appCtxt.getAppController().sendRequest(params);
};

/**
 * @private
 */
ZmContact.prototype._handleResponseCreateVCard =
function(result) {
	appCtxt.getAppController().setStatusMsg(ZmMsg.contactCreated);
};

/**
 * @private
 */
ZmContact.prototype._handleErrorCreateVCard =
function(ex) {
	appCtxt.getAppController().setStatusMsg(ZmMsg.errorCreateContact, ZmStatusView.LEVEL_CRITICAL);
};

/**
 * Updates contact attributes.
 *
 * @param {Hash}	attr		a set of attributes and new values
 * @param {AjxCallback}	callback	the callback
 * @param {boolean} isAutoSave  true if it is a auto save and toast should not be displayed.
 */
ZmContact.prototype.modify =
function(attr, callback, isAutoSave, batchCmd) {
	if (this.isDistributionList()) {
		this._modifyDl(attr);
		return;
	}
	if (this.list.isGal) { return; }

	// change force to 0 and put up dialog if we get a MODIFY_CONFLICT fault?
	var jsonObj = {ModifyContactRequest:{_jsns:"urn:zimbraMail", replace:"0", force:"1"}};
	var cn = jsonObj.ModifyContactRequest.cn = {id:this.id};
	cn.a = [];
	cn.m = [];
	var continueRequest = false;
	
	for (var name in attr) {
		if (name == ZmContact.F_folderId) { continue; }
		if (name == ZmContact.F_groups) {
			this._addContactGroupAttr(cn, attr);	
		}
		else {
			this._addRequestAttr(cn, name, (attr[name] && attr[name].value) || attr[name]);
		}
		continueRequest = true;
	}

    // bug: 45026
    if (ZmContact.F_firstName in attr || ZmContact.F_lastName in attr || ZmContact.F_company in attr || ZmContact.X_fileAs in attr) {
        var contact = {};
        var fields = [ZmContact.F_firstName, ZmContact.F_lastName, ZmContact.F_company, ZmContact.X_fileAs];
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            var value = attr[field];
            contact[field] = value != null ? value : this.getAttr(field);
        }
        var fullName = ZmContact.computeFileAs(contact); 
        this._addRequestAttr(cn, ZmContact.X_fullName, fullName);
    }

	if (continueRequest) {
		if (batchCmd) {
			batchCmd.addRequestParams(jsonObj, null, null); //no need for response callback for current use-case (batch modifying zimlet image)
		}
		else {
			var respCallback = this._handleResponseModify.bind(this, attr, callback, isAutoSave);
			appCtxt.getAppController().sendRequest({jsonObj: jsonObj, asyncMode: true, callback: respCallback});
		}

	} else {
		if (attr[ZmContact.F_folderId]) {
			this._setFolder(attr[ZmContact.F_folderId]);
		}
	}
};

ZmContact.prototype._createDl =
function(attr) {

	this.attr = attr; //this is mainly important for the email. attr is not set before this.

	var createDlReq = this._getCreateDlReq(attr);

	var reqs = [];

	this._addMemberModsReqs(reqs, attr);

	this._addMailPolicyAndOwnersReqs(reqs, attr);

	var jsonObj = {
		BatchRequest: {
			_jsns: "urn:zimbra",
			CreateDistributionListRequest: createDlReq,
			DistributionListActionRequest: reqs
		}
	};
	var respCallback = this._createDlResponseHandler.bind(this);
	appCtxt.getAppController().sendRequest({jsonObj: jsonObj, asyncMode: true, callback: respCallback});
	
};

ZmContact.prototype._addMailPolicyAndOwnersReqs =
function(reqs, attr) {

	var mailPolicy = attr[ZmContact.F_dlMailPolicy];
	if (mailPolicy) {
		reqs.push(this._getSetMailPolicyReq(mailPolicy, attr[ZmContact.F_dlMailPolicySpecificMailers]));
	}

	var listOwners = attr[ZmContact.F_dlListOwners];
	if (listOwners) {
		reqs.push(this._getSetOwnersReq(listOwners));
	}


};



ZmContact.prototype._addMemberModsReqs =
function(reqs, attr) {
	var memberModifications = attr[ZmContact.F_groups];
	var adds = [];
	var removes = [];
	if (memberModifications) {
		for (var i = 0; i < memberModifications.length; i++) {
			var mod = memberModifications[i];
			var col = (mod.op == "+" ? adds : removes);
			col.push(mod);
		}
	}

	if (adds.length > 0) {
		reqs.push(this._getAddOrRemoveReq(adds, true));
	}
	if (removes.length > 0) {
		reqs.push(this._getAddOrRemoveReq(removes, false));
	}
};

ZmContact.prototype._modifyDl =
function(attr) {
	var reqs = [];

	var newEmail = attr[ZmContact.F_email];

	var emailChanged = false;
	if (newEmail !== undefined) {
		emailChanged = true;
		reqs.push(this._getRenameDlReq(newEmail));
		this.setAttr(ZmContact.F_email, newEmail);
	}

	var modDlReq = this._getModifyDlAttributesReq(attr);
	if (modDlReq) {
		reqs.push(modDlReq);
	}

	var displayName = attr[ZmContact.F_dlDisplayName];
	if (displayName !== undefined) {
		this.setAttr(ZmContact.F_dlDisplayName, displayName);
	}

	var oldFileAs = this.getFileAs();
	this._resetCachedFields();
	var fileAsChanged = oldFileAs != this.getFileAs();

	this._addMemberModsReqs(reqs, attr);

	this._addMailPolicyAndOwnersReqs(reqs, attr);

	if (reqs.length == 0) {
		this._modifyDlResponseHandler(false, null); //pretend it was saved
		return;
	}
	var jsonObj = {
		BatchRequest: {
			_jsns: "urn:zimbra",
			DistributionListActionRequest: reqs
		}
	};
	var respCallback = this._modifyDlResponseHandler.bind(this, fileAsChanged || emailChanged); //there's some issue with fileAsChanged so adding the emailChanged to be on safe side
	appCtxt.getAppController().sendRequest({jsonObj: jsonObj, asyncMode: true, callback: respCallback});

};

ZmContact.prototype._getAddOrRemoveReq =
function(members, add) {
	var req = {
		_jsns: "urn:zimbraAccount",
		dl: {by: "name",
			 _content: this.getEmail()
		},
		action: {
			op: add ? "addMembers" : "removeMembers",
			dlm: []
		}
	};
	for (var i = 0; i < members.length; i++) {
		var member = members[i];
		req.action.dlm.push({_content: member.email});
	}
	return req;

};


ZmContact.prototype._getRenameDlReq =
function(name) {
	return {
		_jsns: "urn:zimbraAccount",
		dl: {by: "name",
			 _content: this.getEmail()
		},
		action: {
			op: "rename",
			newName: {_content: name}
		}
	};
};

ZmContact.prototype._getSetOwnersReq =
function(owners) {
	var ownersPart = [];
	for (var i = 0; i < owners.length; i++) {
		ownersPart.push({
			type: ZmGroupView.GRANTEE_TYPE_USER,
			by: "name",
			_content: owners[i]
		});
	}
	return {
		_jsns: "urn:zimbraAccount",
		dl: {by: "name",
			 _content: this.getEmail()
		},
		action: {
			op: "setOwners",
			owner: ownersPart
		}
	};
};

ZmContact.prototype._getSetMailPolicyReq =
function(mailPolicy, specificMailers) {
	var grantees = [];
	if (mailPolicy == ZmGroupView.MAIL_POLICY_SPECIFIC) {
		for (var i = 0; i < specificMailers.length; i++) {
			grantees.push({
				type: ZmGroupView.GRANTEE_TYPE_EMAIL,
				by: "name",
				_content: specificMailers[i]
			});
		}
	}
	else if (mailPolicy == ZmGroupView.MAIL_POLICY_ANYONE) {
		grantees.push({
			type: ZmGroupView.GRANTEE_TYPE_PUBLIC
		});
	}
	else if (mailPolicy == ZmGroupView.MAIL_POLICY_INTERNAL) {
		grantees.push({
			type: ZmGroupView.GRANTEE_TYPE_ALL
		});
	}
	else if (mailPolicy == ZmGroupView.MAIL_POLICY_MEMBERS) {
		grantees.push({
			type: ZmGroupView.GRANTEE_TYPE_GROUP,
			by: "name",
			_content: this.getEmail()
		});
	}
	else {
		throw "invalid mailPolicy value " + mailPolicy;
	}

	return {
		_jsns: "urn:zimbraAccount",
		dl: {by: "name",
			 _content: this.getEmail()
		},
		action: {
			op: "setRights",
			right: {
				right: "sendToDistList",
				grantee: grantees
			}
		}
	};

};

ZmContact.prototype._addDlAttribute =
function(attrs, mods, name, soapAttrName) {
	var attr = mods[name];
	if (attr === undefined) {
		return;
	}
	attrs.push({n: soapAttrName, _content: attr});
};

ZmContact.prototype._getDlAttributes =
function(mods) {
	var attrs = [];
	this._addDlAttribute(attrs, mods, ZmContact.F_dlDisplayName, "displayName");
	this._addDlAttribute(attrs, mods, ZmContact.F_dlDesc, "description");
	this._addDlAttribute(attrs, mods, ZmContact.F_dlNotes, "zimbraNotes");
	this._addDlAttribute(attrs, mods, ZmContact.F_dlHideInGal, "zimbraHideInGal");
	this._addDlAttribute(attrs, mods, ZmContact.F_dlSubscriptionPolicy, "zimbraDistributionListSubscriptionPolicy");
	this._addDlAttribute(attrs, mods, ZmContact.F_dlUnsubscriptionPolicy, "zimbraDistributionListUnsubscriptionPolicy");

	return attrs;
};


ZmContact.prototype._getCreateDlReq =
function(attr) {
	return {
		_jsns: "urn:zimbraAccount",
		name: attr[ZmContact.F_email],
		a: this._getDlAttributes(attr),
		dynamic: false
	};
};

ZmContact.prototype._getModifyDlAttributesReq =
function(attr) {
	var modAttrs = this._getDlAttributes(attr);
	if (modAttrs.length == 0) {
		return null;
	}
	return {
		_jsns: "urn:zimbraAccount",
		dl: {by: "name",
			 _content: this.getEmail()
		},
		action: {
			op: "modify",
			a: modAttrs
		}
	};
};

ZmContact.prototype._modifyDlResponseHandler =
function(fileAsChanged, result) {
	if (this._handleErrorDl(result)) {
		return;
	}
	appCtxt.setStatusMsg(ZmMsg.dlSaved);

	//for DLs we reload from the server since the server does not send notifications.
	this.clearDlInfo();

	var details = {
		fileAsChanged: fileAsChanged
	};

	this._popView(fileAsChanged);

	this._notify(ZmEvent.E_MODIFY, details);
};

ZmContact.prototype._createDlResponseHandler =
function(result) {
	if (this._handleErrorDl(result, true)) {
		this.attr = {}; //since above in _createDl, we set it to new values prematurely. which would affect next gathering of modified attributes.
		return;
	}
	appCtxt.setStatusMsg(ZmMsg.distributionListCreated);

	this._popView(true);
};

ZmContact.prototype._popView =
function(updateDlList) {
	var controller = AjxDispatcher.run("GetContactController");
	controller.popView(true);
	if (!updateDlList) {
		return;
	}
	var clc = AjxDispatcher.run("GetContactListController");
	if (clc.getFolderId() != ZmFolder.ID_DLS) {
		return;
	}
	ZmAddrBookTreeController.dlFolderClicked(); //This is important in case of new DL created OR a renamed DL, so it would reflect in the list.
};

ZmContact.prototype._handleErrorDl =
function(result, creation) {
	if (!result) {
		return false;
	}
	var batchResp = result.getResponse().BatchResponse;
	var faults = batchResp.Fault;
	if (!faults) {
		return false;
	}
	var ex = ZmCsfeCommand.faultToEx(faults[0]);
	var controller = AjxDispatcher.run("GetContactController");
	controller.popupErrorDialog(creation ? ZmMsg.dlCreateFailed : ZmMsg.dlModifyFailed, ex);
	return true;

};

ZmContact.prototype.clearDlInfo =
function () {
	this.dlMembers = null;
	this.dlInfo = null;
	var app = appCtxt.getApp(ZmApp.CONTACTS);
	app.cacheDL(this.getEmail(), null); //clear the cache for this DL.
	appCtxt.cacheRemove(this.getId()); //also some other cache.
};

/**
 * @private
 */
ZmContact.prototype._handleResponseModify =
function(attr, callback, isAutoSave, result) {
	var resp = result.getResponse().ModifyContactResponse;
	var cn = resp ? resp.cn[0] : null;
	var id = cn ? cn.id : null;
	var groupMembers = cn ? cn.m : null;
	if (groupMembers) {
		this.attr[ZmContact.F_groups] = groupMembers;
		cn._attrs[ZmContact.F_groups] = groupMembers;	
	}

	if (id && id == this.id) {
		if (!isAutoSave) {
			appCtxt.setStatusMsg(this.isGroup() ? ZmMsg.groupSaved : ZmMsg.contactSaved);
		}
		// was this contact moved to another folder?
		if (attr[ZmContact.F_folderId] && this.folderId != attr[ZmContact.F_folderId]) {
			this._setFolder(attr[ZmContact.F_folderId]);
		}
		appCtxt.getApp(ZmApp.CONTACTS).updateIdHash(cn, false);
	} else {
        var detail = ZmMsg.errorTryAgain + "\n" + ZmMsg.errorContact;
        appCtxt.getAppController().setStatusMsg(ZmMsg.errorModifyContact, ZmStatusView.LEVEL_CRITICAL, detail);
	}
	// NOTE: we no longer process callbacks here since notification handling
	//       takes care of everything
};

/**
 * @private
 */
ZmContact.prototype._handleResponseMove =
function(newFolderId, resp) {
	var newFolder = newFolderId && appCtxt.getById(newFolderId);
	var count = 1;
	if (newFolder) {
		appCtxt.setStatusMsg(ZmList.getActionSummary({
			actionTextKey:  'actionMove',
			numItems:       count,
			type:           ZmItem.CONTACT,
			actionArg:      newFolder.name
		}));
	}

	this._notify(ZmEvent.E_MODIFY, resp);
};

/**
 * @private
 */
ZmContact.prototype._setFolder =
function(newFolderId) {
	var folder = appCtxt.getById(this.folderId);
	var fId = folder ? folder.nId : null;
	if (fId == newFolderId) { return; }

	// moving out of a share or into one is handled differently (create then hard delete)
	var newFolder = appCtxt.getById(newFolderId);
	if (this.isShared() || (newFolder && newFolder.link)) {
		if (this.list) {
			this.list.moveItems({items:[this], folder:newFolder});
		}
	} else {
		var jsonObj = {ContactActionRequest:{_jsns:"urn:zimbraMail"}};
		jsonObj.ContactActionRequest.action = {id:this.id, op:"move", l:newFolderId};
		var respCallback = new AjxCallback(this, this._handleResponseMove, [newFolderId]);
		var accountName = appCtxt.multiAccounts && appCtxt.accountList.mainAccount.name;
		appCtxt.getAppController().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:respCallback, accountName:accountName});
	}
};

/**
 * @private
 */
ZmContact.prototype.notifyModify =
function(obj, batchMode) {

	var result = ZmItem.prototype.notifyModify.apply(this, arguments);

	var context = window.parentAppCtxt || window.appCtxt;
	context.clearAutocompleteCache(ZmAutocomplete.AC_TYPE_CONTACT);

	if (result) {
		return result;
	}

	// cache old fileAs/fullName before resetting them
	var oldFileAs = this.getFileAs();
	var oldFullName = this.getFullName();
	this._resetCachedFields();

	var oldAttrCache = {};
	if (obj._attrs) {
		// remove attrs that were not returned back from the server
		var oldAttrs = this.getAttrs();
		for (var a in oldAttrs) {
			oldAttrCache[a] = oldAttrs[a];
			if (obj._attrs[a] == null)
				this.removeAttr(a);
		}

		// set attrs returned by server
		for (var a in obj._attrs) {
			this.setAttr(a, obj._attrs[a]);
		}
		if (obj.m) {
			this.setAttr(ZmContact.F_groups, obj.m);
		}
	}

	var details = {
		attr: obj._attrs,
		oldAttr: oldAttrCache,
		fullNameChanged: (this.getFullName() != oldFullName),
		fileAsChanged: (this.getFileAs() != oldFileAs),
		contact: this
	};

	// update this contact's list per old/new attrs
	for (var listId in this._list) {
		var list = listId && appCtxt.getById(listId);
		if (!list) { continue; }
		list.modifyLocal(obj, details);
	}

	this._notify(ZmEvent.E_MODIFY, obj);
};

/**
 * @private
 */
ZmContact.prototype.notifyDelete =
function() {
	ZmItem.prototype.notifyDelete.call(this);
	var context = window.parentAppCtxt || window.appCtxt;
	context.clearAutocompleteCache(ZmAutocomplete.AC_TYPE_CONTACT);
};

/**
 * Initializes this contact using an email address.
 *
 * @param {AjxEmailAddress|String}	email		an email address or an email string
 * @param {Boolean}	strictName	if <code>true</code>, do not try to set name from user portion of address
 */
ZmContact.prototype.initFromEmail =
function(email, strictName) {
	if (email instanceof AjxEmailAddress) {
		this.setAttr(ZmContact.F_email, email.getAddress());
		this._initFullName(email, strictName);
	} else {
		this.setAttr(ZmContact.F_email, email);
	}
};

/**
 * Initializes this contact using a phone number.
 *
 * @param {String}	phone		the phone string
 * @param {String}	field		the field or company phone if <code>null</code>
 */
ZmContact.prototype.initFromPhone =
function(phone, field) {
	this.setAttr(field || ZmContact.F_companyPhone, phone);
};

/**
 * Gets the email address.
 * 
 * @param {boolean}		asObj	if true, return an AjxEmailAddress
 * 
 * @return	the email address
 */
ZmContact.prototype.getEmail =
function(asObj) {

	var email = (this.getAttr(ZmContact.F_email) ||
				 this.getAttr(ZmContact.F_workEmail1) ||
				 this.getAttr(ZmContact.F_email2) ||
				 this.getAttr(ZmContact.F_workEmail2) ||
				 this.getAttr(ZmContact.F_email3) ||
				 this.getAttr(ZmContact.F_workEmail3));
	
	if (asObj) {
		email = AjxEmailAddress.parse(email);
        if(email){
		    email.isGroup = this.isGroup();
		    email.canExpand = this.canExpand;
        }
	}
	
	return email;
};

/**
 * Returns user's phone number
 * @return {String} phone number
 */
ZmContact.prototype.getPhone = 
function() {
	var phone = (this.getAttr(ZmContact.F_mobilePhone) ||
				this.getAttr(ZmContact.F_workPhone) || 
				this.getAttr(ZmContact.F_homePhone) ||
				this.getAttr(ZmContact.F_otherPhone));
	return phone;
};

    
/**
 * Gets the lookup email address, when an contact object is located using email address we store
 * the referred email address in this variable for easy lookup
 *
 * @param {boolean}		asObj	if true, return an AjxEmailAddress
 *
 * @return	the lookup address
 */
ZmContact.prototype.getLookupEmail =
function(asObj) {
    var email = this._lookupEmail;

    if (asObj && email) {
        email = AjxEmailAddress.parse(email);
        email.isGroup = this.isGroup();
        email.canExpand = this.canExpand;
    }

	return  email;
};

/**
 * Gets the emails.
 * 
 * @return	{Array}	 an array of all valid emails for this contact
 */
ZmContact.prototype.getEmails =
function() {
	var emails = [];
	var attrs = this.getAttrs();
	for (var index = 0; index < ZmContact.EMAIL_FIELDS.length; index++) {
		var field = ZmContact.EMAIL_FIELDS[index];
		for (var i = 1; true; i++) {
			var aname = ZmContact.getAttributeName(field, i);
			if (!attrs[aname]) break;
			emails.push(attrs[aname]);
		}
	}
	return emails;
};

/**
 * Gets the full name.
 * 
 * @return	{String}	the full name
 */
ZmContact.prototype.getFullName =
function(html) {
    var fullNameHtml = null;
	if (!this._fullName || html) {
		var fullName = this.getAttr(ZmContact.X_fullName); // present if GAL contact
		if (fullName) {
			this._fullName = (fullName instanceof Array) ? fullName[0] : fullName;
		}
        else {
            this._fullName = this.getFullNameForDisplay(false);
        }

        if (html) {
            fullNameHtml = this.getFullNameForDisplay(html);
        }
	}

	// as a last resort, set it to fileAs
	if (!this._fullName) {
		this._fullName = this.getFileAs();
	}

	return fullNameHtml || this._fullName;
};

/*
* Gets the fullname for display -- includes (if applicable): prefix, first, middle, maiden, last, suffix
*
* @param {boolean}  if phonetic fields should be used
* @return {String}  the fullname for display
*/
ZmContact.prototype.getFullNameForDisplay =
function(html){
	if (this.isDistributionList()) {
		//I'm not sure where that fullName is set sometime to the display name. This is so complicated
		// I'm trying to set attr[ZmContact.F_dlDisplayName] to the display name but in soem cases it's not.
		return this.getAttr(ZmContact.F_dlDisplayName) || this.getAttr("fullName");
	}
    var prefix = this.getAttr(ZmContact.F_namePrefix);
    var first = this.getAttr(ZmContact.F_firstName);
    var middle = this.getAttr(ZmContact.F_middleName);
    var maiden = this.getAttr(ZmContact.F_maidenName);
    var last = this.getAttr(ZmContact.F_lastName);
    var suffix = this.getAttr(ZmContact.F_nameSuffix);
    var pattern = ZmMsg.fullname;
    if (suffix) {
        pattern = maiden ? ZmMsg.fullnameMaidenSuffix : ZmMsg.fullnameSuffix;
    }
    else if (maiden) {
        pattern = ZmMsg.fullnameMaiden;
    }
    if (appCtxt.get(ZmSetting.LOCALE_NAME) === "ja") {
        var fileAsId = this.getAttr(ZmContact.F_fileAs);
        if (!AjxUtil.isEmpty(fileAsId) && fileAsId !== "1" && fileAsId !== "4" && fileAsId !== "6") {
            /* When Japanese locale is selected, in the most every case, the name should be
             * displayed as "Last First" which is set by the default pattern (ZmMsg_ja.fullname).
             * But if the contact entry's fileAs field explicitly specifies the display
             * format as "First Last", we should override the pattern to lay it out so.
             * For other locales, it is not necessary to override the pattern: The default pattern is
             * already set as "First Last", and even the FileAs specifies as "Last, First", the display
             * name is always expected to be displayed as "First Last".
             */
            pattern = "{0} {1} {2} {4}";
        }
    }
    var formatter = new AjxMessageFormat(pattern);
    var args = [prefix,first,middle,maiden,last,suffix];
    if (!html){
        return AjxStringUtil.trim(formatter.format(args), true);
    }

    return this._getFullNameHtml(formatter, args);
};

/**
 * @param formatter
 * @param parts {Array} Name parts: [prefix,first,middle,maiden,last,suffix]
 */
ZmContact.prototype._getFullNameHtml = function(formatter, parts) {
    var a = [];
    var segments = formatter.getSegments();
    for (var i = 0; i < segments.length; i++) {
        var segment = segments[i];
        if (segment instanceof AjxFormat.TextSegment) {
            a.push(segment.format());
            continue;
        }
        // NOTE: Assume that it's a AjxMessageFormat.MessageSegment
        // NOTE: if not a AjxFormat.TextSegment.
        var index = segment.getIndex();
        var base = parts[index];
        var text = ZmContact.__RUBY_FIELDS[index] && this.getAttr(ZmContact.__RUBY_FIELDS[index]);
        a.push(AjxStringUtil.htmlRubyEncode(base, text));
    }
    return a.join("");
};
ZmContact.__RUBY_FIELDS = [
    null, ZmContact.F_phoneticFirstName, null, null,
    ZmContact.F_phoneticLastName, null
];

/**
 * Gets the tool tip for this contact.
 * 
 * @param	{String}	email		the email address
 * @param	{Boolean}	isGal		(not used)
 * @param	{String}	hint		the hint text
 * @return	{String}	the tool tip in HTML
 */
ZmContact.prototype.getToolTip =
function(email, isGal, hint) {
	// XXX: we dont cache tooltip info anymore since its too dynamic :/
	// i.e. IM status can change anytime so always rebuild tooltip and bug 13834
	var subs = {
		contact: this,
		entryTitle: this.getFileAs(),
		hint: hint
	};

	return (AjxTemplate.expand("abook.Contacts#Tooltip", subs));
};

/**
 * Gets the filing string for this contact, computing it if necessary.
 * 
 * @param	{Boolean}	lower		<code>true</code> to use lower case
 * @return	{String}	the file as string
 */
ZmContact.prototype.getFileAs =
function(lower) {
	// update/null if modified
	if (!this._fileAs) {
		this._fileAs = ZmContact.computeFileAs(this);
		this._fileAsLC = this._fileAs ? this._fileAs.toLowerCase() : null;
	}
	// if for some reason fileAsLC is not set even though fileAs is, reset it
	if (lower && !this._fileAsLC) {
		this._fileAsLC = this._fileAs.toLowerCase();
	}
	return lower ? this._fileAsLC : this._fileAs;
};

/**
 * Gets the filing string for this contact, from the email address (used in case no name exists).
 * todo - maybe return this from getFileAs, but there are a lot of callers to getFileAs, and not sure
 * of the implications on all the use-cases.
 *
 * @return	{String}	the file as string
 */
ZmContact.prototype.getFileAsNoName = function() {
	return [ZmMsg.noName, this.getEmail()].join(" ");
};

/**
 * Gets the header.
 * 
 * @return	{String}	the header
 */
ZmContact.prototype.getHeader =
function() {
	return this.id ? this.getFileAs() : ZmMsg.newContact;
};

ZmContact.NO_MAX_IMAGE_WIDTH = ZmContact.NO_MAX_IMAGE_HEIGHT = - 1;

/**
 * Get the image URL.
 *
 * Please note that maxWidth and maxHeight are hints, as they have no
 * effect on Zimlet-supplied images.
 *
 * maxWidth {int} max pixel width (optional - default 48, or pass ZmContact.NO_MAX_IMAGE_WIDTH if full size image is required)
 * maxHeight {int} max pixel height (optional - default to maxWidth, or pass ZmContact.NO_MAX_IMAGE_HEIGHT if full size image is required)
 * @return	{String}	the image URL
 */
ZmContact.prototype.getImageUrl =
function(maxWidth, maxHeight) {
  	var image = this.getAttr(ZmContact.F_image);
	var imagePart  = image && image.part || this.getAttr(ZmContact.F_imagepart); //see bug 73146

	if (!imagePart) {
		return this.getAttr(ZmContact.F_zimletImage);  //return zimlet populated image only if user-uploaded image is not there.
	}
  	var msgFetchUrl = appCtxt.get(ZmSetting.CSFE_MSG_FETCHER_URI);
	var maxWidthStyle = "";
	if (maxWidth !== ZmContact.NO_MAX_IMAGE_WIDTH) {
		maxWidth = maxWidth || 48;
		maxWidthStyle = ["&max_width=", maxWidth].join("");
	}
	var maxHeightStyle = "";
	if (maxHeight !== ZmContact.NO_MAX_IMAGE_HEIGHT) {
		maxHeight = maxHeight ||
			(maxWidth !== ZmContact.NO_MAX_IMAGE_WIDTH ? maxWidth : 48);
		maxHeightStyle = ["&max_height=", maxHeight].join("");
	}
  	return  [msgFetchUrl, "&id=", this.id, "&part=", imagePart, maxWidthStyle, maxHeightStyle, "&t=", (new Date()).getTime()].join("");
};

ZmContact.prototype.addModifyZimletImageToBatch =
function(batchCmd, image) {
	var attr = {};
	if (this.getAttr(ZmContact.F_zimletImage) === image) {
		return; //no need to update if same
	}
	attr[ZmContact.F_zimletImage] = image;
	batchCmd.add(this.modify.bind(this, attr, null, true));
};

/**
 * Gets the company field. Company field has a getter b/c fileAs may be the Company name so
 * company field should return "last, first" name instead *or* prepend the title
 * if fileAs is not Company (assuming it exists).
 * 
 * @return	{String}	the company
 */
ZmContact.prototype.getCompanyField =
function() {

	var attrs = this.getAttrs();
	if (attrs == null) return null;

	var fa = parseInt(attrs.fileAs);
	var val = [];
	var idx = 0;

	if (fa == ZmContact.FA_LAST_C_FIRST || fa == ZmContact.FA_FIRST_LAST) {
		// return the title, company name
		if (attrs.jobTitle) {
			val[idx++] = attrs.jobTitle;
			if (attrs.company)
				val[idx++] = ", ";
		}
		if (attrs.company)
			val[idx++] = attrs.company;

	} else if (fa == ZmContact.FA_COMPANY) {
		// return the first/last name
		if (attrs.lastName) {
			val[idx++] = attrs.lastName;
			if (attrs.firstName)
				val[idx++] = ", ";
		}

		if (attrs.firstName)
			val[idx++] = attrs.firstName;

		if (attrs.jobTitle)
			val[idx++] = " (" + attrs.jobTitle + ")";

	} else {
		// just return the title
		if (attrs.jobTitle) {
			val[idx++] = attrs.jobTitle;
			// and/or company name if applicable
			if (attrs.company && (attrs.fileAs == null || fa == ZmContact.FA_LAST_C_FIRST || fa == ZmContact.FA_FIRST_LAST))
				val[idx++] = ", ";
		}
		if (attrs.company && (attrs.fileAs == null || fa == ZmContact.FA_LAST_C_FIRST || fa == ZmContact.FA_FIRST_LAST))
			 val[idx++] = attrs.company;
	}
	if (val.length == 0) return null;
	return val.join("");
};

/**
 * Gets the work address.
 * 
 * @param	{Object}	instance		(not used)
 * @return	{String}	the work address
 */
ZmContact.prototype.getWorkAddrField =
function(instance) {
	var attrs = this.getAttrs();
	return this._getAddressField(attrs.workStreet, attrs.workCity, attrs.workState, attrs.workPostalCode, attrs.workCountry);
};

/**
 * Gets the home address.
 * 
 * @param	{Object}	instance		(not used)
 * @return	{String}	the home address
 */
ZmContact.prototype.getHomeAddrField =
function(instance) {
	var attrs = this.getAttrs();
	return this._getAddressField(attrs.homeStreet, attrs.homeCity, attrs.homeState, attrs.homePostalCode, attrs.homeCountry);
};

/**
 * Gets the other address.
 * 
 * @param	{Object}	instance		(not used)
 * @return	{String}	the other address
 */
ZmContact.prototype.getOtherAddrField =
function(instance) {
	var attrs = this.getAttrs();
	return this._getAddressField(attrs.otherStreet, attrs.otherCity, attrs.otherState, attrs.otherPostalCode, attrs.otherCountry);
};

/**
 * Gets the address book.
 * 
 * @return	{ZmAddrBook}	the address book
 */
ZmContact.prototype.getAddressBook =
function() {
	if (!this.addrbook) {
		this.addrbook = appCtxt.getById(this.folderId);
	}
	return this.addrbook;
};

/**
 * @private
 */
ZmContact.prototype._getAddressField =
function(street, city, state, zipcode, country) {
	if (street == null && city == null && state == null && zipcode == null && country == null) return null;

	var html = [];
	var idx = 0;

	if (street) {
		html[idx++] = street;
		if (city || state || zipcode)
			html[idx++] = "\n";
	}

	if (city) {
		html[idx++] = city;
		if (state)
			html[idx++] = ", ";
		else if (zipcode)
			html[idx++] = " ";
	}

	if (state) {
		html[idx++] = state;
		if (zipcode)
			html[idx++] = " ";
	}

	if (zipcode)
		html[idx++] = zipcode;

	if (country)
		html[idx++] = "\n" + country;

	return html.join("");
};

/**
 * Sets the full name based on an email address.
 * 
 * @private
 */
ZmContact.prototype._initFullName =
function(email, strictName) {
	var name = email.getName();
	name = AjxStringUtil.trim(name.replace(AjxEmailAddress.commentPat, '')); // strip comment (text in parens)

	if (name && name.length) {
		this._setFullName(name, [" "]);
	} else if (!strictName) {
		name = email.getAddress();
		if (name && name.length) {
			var i = name.indexOf("@");
			if (i == -1) return;
			name = name.substr(0, i);
			this._setFullName(name, [".", "_"]);
		}
	}
};

/**
 * Tries to extract a set of name components from the given text, with the
 * given list of possible delimiters. The first delimiter contained in the
 * text will be used. If none are found, the first delimiter in the list is used.
 * 
 * @private
 */
ZmContact.prototype._setFullName =
function(text, delims) {
	var delim = delims[0];
	for (var i = 0; i < delims.length; i++) {
		if (text.indexOf(delims[i]) != -1) {
			delim = delims[i];
			break;
		}
	}
    var parts = text.split(delim);
    var func = this["__setFullName_"+AjxEnv.DEFAULT_LOCALE] || this.__setFullName;
    func.call(this, parts, text, delims);
};

ZmContact.prototype.__setFullName = function(parts, text, delims) {
    this.setAttr(ZmContact.F_firstName, parts[0]);
    if (parts.length == 2) {
        this.setAttr(ZmContact.F_lastName, parts[1]);
    } else if (parts.length == 3) {
        this.setAttr(ZmContact.F_middleName, parts[1]);
        this.setAttr(ZmContact.F_lastName, parts[2]);
    }
};
ZmContact.prototype.__setFullName_ja = function(parts, text, delims) {
    if (parts.length > 2) {
        this.__setFullName(parts, text, delims);
        return;
    }
    // TODO: Perhaps do some analysis to auto-detect Japanese vs.
    // TODO: non-Japanese names. For example, if the name text is
    // TODO: comprised of kanji, treat it as "last first"; else if
    // TODO: first part is all uppercase, treat it as "last first";
    // TODO: else treat it as "first last".
    this.setAttr(ZmContact.F_lastName, parts[0]);
    if (parts.length > 1) {
        this.setAttr(ZmContact.F_firstName, parts[1]);
    }
};
ZmContact.prototype.__setFullName_ja_JP = ZmContact.prototype.__setFullName_ja;

/**
 * @private
 */
ZmContact.prototype._addRequestAttr =
function(cn, name, value) {
	var a = {n:name};
	if (name == ZmContact.F_image && AjxUtil.isString(value) && value.length) {
		// handle contact photo
		if (value.indexOf("aid_") != -1) {
			a.aid = value.substring(4);
		} else {
			a.part = value.substring(5);
		}
	} else {
		a._content = value || "";
	}

    if (value instanceof Array) {
        if (!cn._attrs)
            cn._attrs = {};
        cn._attrs[name] = value || "";
    }
    else  {
        if (!cn.a)
            cn.a = [];
        cn.a.push(a);
    }
};
	
ZmContact.prototype._addContactGroupAttr = 
function(cn, group) {
	var groupMembers = group[ZmContact.F_groups];
	for (var i = 0; i < groupMembers.length; i++) {
		var member = groupMembers[i];
		if (!cn.m) {
			cn.m = [];
		}

		var m = {type: member.type,	value: member.value}; //for the JSON object this is all we need.
		if (member.op) {
			m.op = member.op; //this is only for modify, not for create.
		}
		cn.m.push(m);
	}
};

/**
 * Reset computed fields.
 * 
 * @private
 */
ZmContact.prototype._resetCachedFields =
function() {
	this._fileAs = this._fileAsLC = this._fullName = null;
};

/**
 * Parse contact node.
 * 
 * @private
 */
ZmContact.prototype._loadFromDom =
function(node) {
	this.isLoaded = true;
	this.rev = node.rev;
	this.sf = node.sf || node._attrs.sf;
	if (!this.isGal) {
		this.folderId = node.l;
	}
	this.created = node.cd;
	this.modified = node.md;

	this.attr = node._attrs || {};
	if (node.m) {
		this.attr[ZmContact.F_groups] = node.m;
	}

	this.ref = node.ref || this.attr.dn; //bug 78425
	
	// for shared contacts, we get these fields outside of the attr part
	if (node.email)		{ this.attr[ZmContact.F_email] = node.email; }
	if (node.email2)	{ this.attr[ZmContact.F_email2] = node.email2; }
	if (node.email3)	{ this.attr[ZmContact.F_email3] = node.email3; }

	// in case attrs are coming in from an external GAL, make an effort to map them, including multivalued ones
	this.attr = ZmContact.mapAttrs(this.attr);

    //the attr groups is returned as [] so check both null and empty array to set the type
    var groups = this.attr[ZmContact.F_groups];
    if(!groups || (groups instanceof Array && groups.length == 0)) {
        this.type = ZmItem.CONTACT;
    }
    else {
        this.type = ZmItem.GROUP;
    }

	// check if the folderId is found in our address book (otherwise, we assume
	// this contact to be a shared contact)
	var ac = window.parentAppCtxt || window.appCtxt;
	this.addrbook = ac.getById(this.folderId);

	this._parseTagNames(node.tn);

	// dont process flags for shared contacts until we get server support
	if (!this.isShared()) {
		this._parseFlags(node.f);
	} else {
		// shared contacts are never fully loaded since we never cache them
		this.isLoaded = false;
	}

	// bug: 22174
	// We ignore the server's computed file-as property and instead
	// format it based on the user's locale.
	this._fileAs = ZmContact.computeFileAs(this);

	// Is this a distribution list?
	this.isDL = this.isDistributionList();
	if (this.isDL) {
		this.dlInfo = { //this is minimal DL info, available mainly to allow to know whether to show the lock or not.
			isMinimal: true,
			isMember: node.isMember,
			isOwner: node.isOwner,
			subscriptionPolicy: this.attr.zimbraDistributionListSubscriptionPolicy,
			unsubscriptionPolicy: this.attr.zimbraDistributionListUnsubscriptionPolicy,
			displayName: node.d || "",
			hideInGal: this.attr.zimbraHideInGal == "TRUE"
		};

		this.canExpand = node.exp !== false; //default to true, since most cases this is implicitly true if not returned. See bug 94867
		var emails = this.getEmails();
		var ac = window.parentAppCtxt || window.appCtxt;
		for (var i = 0; i < emails.length; i++) {
			ac.setIsExpandableDL(emails[i], this.canExpand);
		}
	}
};

/**
 * Gets display text for an attendee. Prefers name over email.
 *
 * @param {constant}	type		the attendee type
 * @param {Boolean}	shortForm		if <code>true</code>, return only name or email
 * @return	{String}	the attendee
 */
ZmContact.prototype.getAttendeeText =
function(type, shortForm) {
	var email = this.getEmail(true);
	return (email?email.toString(shortForm || (type && type != ZmCalBaseItem.PERSON)):"");
};

/**
 * Gets display text for an attendee. Prefers name over email.
 *
 * @param {constant}	type		the attendee type
 * @param {Boolean}	shortForm		if <code>true</code>, return only name or email
 * @return	{String}	the attendee
 */
ZmContact.prototype.getAttendeeKey =
function() {
	var email = this.getLookupEmail() || this.getEmail();
	var name = this.getFullName();
	return email ? email : name;
};

/**
 * Gets the unknown fields.
 * 
 * @param	{function}	[sortByNameFunc]	sort by function
 * @return	{Array}	an array of field name/value pairs
 */
ZmContact.prototype.getUnknownFields = function(sortByNameFunc) {
	var map = ZmContact.__FIELD_MAP;
	if (!map) {
		map = ZmContact.__FIELD_MAP = {};
		for (var i = 0; i < ZmContact.DISPLAY_FIELDS; i++) {
			map[ZmContact.DISPLAY_FIELDS[i]] = true;
		}
	}
	var fields = [];
	var attrs = this.getAttrs();
	for (var aname in attrs) {
		var field = ZmContact.getPrefix(aname);
		if (map[aname]) continue;
		fields.push(field);
	}
	return this.getFields(fields, sortByNameFunc);
};

/**
 * Gets the fields.
 * 
 * @param	{Array}	field		the fields
 * @param	{function}	[sortByNameFunc]	sort by function
 * @return	{Array}	an array of field name/value pairs
 */
ZmContact.prototype.getFields =
function(fields, sortByNameFunc) {
	// TODO: [Q] Should sort function handle just the field names or the attribute names?
	var selection;
	var attrs = this.getAttrs();
	for (var index = 0; index < fields.length; index++) {
		for (var i = 1; true; i++) {
			var aname = ZmContact.getAttributeName(fields[index], i);
			if (!attrs[aname]) break;
			if (!selection) selection = {};
			selection[aname] = attrs[aname];
		}
	}
	if (sortByNameFunc && selection) {
		var keys = AjxUtil.keys(selection);
		keys.sort(sortByNameFunc);
		var nfields = {};
		for (var i = 0; i < keys; i++) {
			var key = keys[i];
			nfields[key] = fields[key];
		}
		selection = nfields;
	}
	return selection;
};

/**
 * Returns a list of distribution list members for this contact. Only the
 * requested range is returned.
 *
 * @param offset	{int}			offset into list to start at
 * @param limit		{int}			number of members to fetch and return
 * @param callback	{AjxCallback}	callback to run with results
 */
ZmContact.prototype.getDLMembers =
function(offset, limit, callback) {

	var result = {list:[], more:false, isDL:{}};
	if (!this.isDL) { return result; }

	var email = this.getEmail();
	var app = appCtxt.getApp(ZmApp.CONTACTS);
	var dl = app.getDL(email);
	if (!dl) {
		dl = result;
		dl.more = true;
		app.cacheDL(email, dl);
	}

	limit = limit || ZmContact.DL_PAGE_SIZE;
	var start = offset || 0;
	var end = (offset + limit) - 1;

	// see if we already have the requested members, or know that we don't
	if (dl.list.length >= end + 1 || !dl.more) {
		var list = dl.list.slice(offset, end + 1);
		result = {list:list, more:dl.more || (dl.list.length > end + 1), isDL:dl.isDL};
		DBG.println("dl", "found cached DL members");
		this._handleResponseGetDLMembers(start, limit, callback, result);
		return;
	}

	DBG.println("dl", "server call " + offset + " / " + limit);
	if (!dl.total || (offset < dl.total)) {
		var jsonObj = {GetDistributionListMembersRequest:{_jsns:"urn:zimbraAccount", offset:offset, limit:limit}};
		var request = jsonObj.GetDistributionListMembersRequest;
		request.dl = {_content: this.getEmail()};
		var respCallback = new AjxCallback(this, this._handleResponseGetDLMembers, [offset, limit, callback]);
		appCtxt.getAppController().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:respCallback});
	} else {
		this._handleResponseGetDLMembers(start, limit, callback, result);
	}
};

ZmContact.prototype._handleResponseGetDLMembers =
function(offset, limit, callback, result, resp) {

	if (resp || !result.list) {
		var list = [];
		resp = resp || result.getResponse();  //if response is passed, take it. Otherwise get it from result
		resp = resp.GetDistributionListMembersResponse;
		var dl = appCtxt.getApp(ZmApp.CONTACTS).getDL(this.getEmail());
		var more = dl.more = resp.more;
		var isDL = {};
		var members = resp.dlm;
		if (members && members.length) {
			for (var i = 0, len = members.length; i < len; i++) {
				var member = members[i]._content;
				list.push(member);
				dl.list[offset + i] = member;
				if (members[i].isDL) {
					isDL[member] = dl.isDL[member] = true;
				}
			}
		}
		dl.total = resp.total;
		DBG.println("dl", list.join("<br>"));
		var result = {list:list, more:more, isDL:isDL};
	}
	DBG.println("dl", "returning list of " + result.list.length + ", more is " + result.more);
	if (callback) {
		callback.run(result);
	}
	else { //synchronized case - see ZmContact.prototype.getDLMembers above
		return result;
	}
};

/**
 * Returns a list of all the distribution list members for this contact.
 *
 * @param callback	{AjxCallback}	callback to run with results
 */
ZmContact.prototype.getAllDLMembers =
function(callback) {

	var result = {list:[], more:false, isDL:{}};
	if (!this.isDL) { return result; }

	var dl = appCtxt.getApp(ZmApp.CONTACTS).getDL(this.getEmail());
	if (dl && !dl.more) {
		result = {list:dl.list.slice(), more:false, isDL:dl.isDL};
		callback.run(result);
		return;
	}

	var nextCallback = new AjxCallback(this, this._getNextDLChunk, [callback]);
	this.getDLMembers(dl ? dl.list.length : 0, null, nextCallback);
};

ZmContact.prototype._getNextDLChunk =
function(callback, result) {

	var dl = appCtxt.getApp(ZmApp.CONTACTS).getDL(this.getEmail());
	if (result.more) {
		var nextCallback = new AjxCallback(this, this._getNextDLChunk, [callback]);
		this.getDLMembers(dl.list.length, null, nextCallback);
	} else {
		result.list = dl.list.slice();
		callback.run(result);
	}
};

/**
 * Gets the contact from cache handling parsing of contactId
 * 
 * @param contactId {String} contact id
 * @return contact {ZmContact} contact or null
 * @private
 */
ZmContact.getContactFromCache =
function(contactId) {
	var userZid = appCtxt.accountList.mainAccount.id;
	var contact = null;
	if (contactId && contactId.indexOf(userZid + ":") !=-1) {
		//strip off the usersZid to pull from cache
		var arr = contactId.split(userZid + ":");
		contact = arr && arr.length > 1 ? appCtxt.cacheGet(arr[1]) : appCtxt.cacheGet(contactId);
	}
	else {
		contact = appCtxt.cacheGet(contactId);
	}
	if (contact instanceof ZmContact) {
		return contact;
	}
	return null;
};

// For mapAttrs(), prepare a hash where each key is the base name of an attr (without an ending number and lowercased),
// and the value is a numerically sorted list of attr names in their original form.
ZmContact.ATTR_VARIANTS = {};
ZmContact.IGNORE_ATTR_VARIANT = {};
ZmContact.IGNORE_ATTR_VARIANT[ZmContact.F_groups] = true;

ZmContact.initAttrVariants = function(attrClass) {
	var keys = Object.keys(attrClass),
		len = keys.length, key, i, attr,
		attrs = [];

	// first, grab all the attr names
	var ignoreVariant = attrClass.IGNORE_ATTR_VARIANT || {};
	for (i = 0; i < len; i++) {
		key = keys[i];
		if (key.indexOf('F_') === 0) {
			attr = attrClass[key];
			if (!ignoreVariant[attr]) {
				attrs.push(attr);
			}
		}
	}

	// sort numerically, eg so that we get ['email', 'email2', 'email10'] in right order
	var numRegex = /^([a-zA-Z]+)(\d+)$/;
	attrs.sort(function(a, b) {
		var aMatch = a.match(numRegex),
			bMatch = b.match(numRegex);
		// check if both are numbered attrs with same base
		if (aMatch && bMatch && aMatch[1] === bMatch[1]) {
			return aMatch[2] - bMatch[2];
		}
		else {
			return a > b ? 1 : (a < b ? -1 : 0);
		}
	});

	// construct hash mapping generic base name to its iterated attr names
	var attr, base;
	for (i = 0; i < attrs.length; i++) {
		attr = attrs[i];
		base = attr.replace(/\d+$/, '').toLowerCase();
		if (!ZmContact.ATTR_VARIANTS[base]) {
			ZmContact.ATTR_VARIANTS[base] = [];
		}
		ZmContact.ATTR_VARIANTS[base].push(attr);
	}
};
ZmContact.initAttrVariants(ZmContact);

/**
 * Takes a hash of attrs and values and maps it to our attr names as best as it can. Scalar attrs will map if they
 * have the same name or only differ by case. A multivalued attr will map to a set of our attributes that share the
 * same case-insensitive base name. Some examples:
 *
 *      FIRSTNAME: "Mildred"    =>      firstName: "Mildred"
 *      email: ['a', 'b']       =>      email: 'a',
 *                                      email2: 'b'
 *      WorkEmail: ['y', 'z']   =>      workEmail1: 'y',
 *                                      workEmail2: 'z'
 *      IMaddress: ['f', 'g']   =>      imAddress1: 'f',
 *                                      imAddress2: 'g'
 *
 * @param   {Object}    attrs       hash of attr names/values
 *
 * @returns {Object}    hash of attr names/values using known attr names ZmContact.F_*
 */
ZmContact.mapAttrs = function(attrs) {

	var attr, value, baseAttrs, newAttrs = {};
	for (attr in attrs) {
		value = attrs[attr];
		if (value) {
			baseAttrs = ZmContact.ATTR_VARIANTS[attr.toLowerCase()];
			if (baseAttrs) {
				value = AjxUtil.toArray(value);
				var len = Math.min(value.length, baseAttrs.length), i;
				for (i = 0; i < len; i++) {
					newAttrs[baseAttrs[i]] = value[i];
				}
			} else {
				// Any overlooked/ignored attributes are simply passed along
				newAttrs[attr] = value;
			}
		}
	}
	return newAttrs;
};

// these need to be kept in sync with ZmContact.F_*
ZmContact._AB_FIELD = {
	firstName:				ZmMsg.AB_FIELD_firstName,		// file as info
	lastName:				ZmMsg.AB_FIELD_lastName,
	middleName:				ZmMsg.AB_FIELD_middleName,
	fullName:				ZmMsg.AB_FIELD_fullName,
	jobTitle:				ZmMsg.AB_FIELD_jobTitle,
	company:				ZmMsg.AB_FIELD_company,
	department:				ZmMsg.AB_FIELD_department,
	email:					ZmMsg.AB_FIELD_email,			// email addresses
	email2:					ZmMsg.AB_FIELD_email2,
	email3:					ZmMsg.AB_FIELD_email3,
	imAddress1:				ZmMsg.AB_FIELD_imAddress1,		// IM addresses
	imAddress2:				ZmMsg.AB_FIELD_imAddress2,
	imAddress3:				ZmMsg.AB_FIELD_imAddress3,
	image: 					ZmMsg.AB_FIELD_image,			// contact photo
	attachment:				ZmMsg.AB_FIELD_attachment,
	workStreet:				ZmMsg.AB_FIELD_street,			// work address info
	workCity:				ZmMsg.AB_FIELD_city,
	workState:				ZmMsg.AB_FIELD_state,
	workPostalCode:			ZmMsg.AB_FIELD_postalCode,
	workCountry:			ZmMsg.AB_FIELD_country,
	workURL:				ZmMsg.AB_FIELD_URL,
	workPhone:				ZmMsg.AB_FIELD_workPhone,
	workPhone2:				ZmMsg.AB_FIELD_workPhone2,
	workFax:				ZmMsg.AB_FIELD_workFax,
	assistantPhone:			ZmMsg.AB_FIELD_assistantPhone,
	companyPhone:			ZmMsg.AB_FIELD_companyPhone,
	callbackPhone:			ZmMsg.AB_FIELD_callbackPhone,
	homeStreet:				ZmMsg.AB_FIELD_street,			// home address info
	homeCity:				ZmMsg.AB_FIELD_city,
	homeState:				ZmMsg.AB_FIELD_state,
	homePostalCode:			ZmMsg.AB_FIELD_postalCode,
	homeCountry:			ZmMsg.AB_FIELD_country,
	homeURL:				ZmMsg.AB_FIELD_URL,
	homePhone:				ZmMsg.AB_FIELD_homePhone,
	homePhone2:				ZmMsg.AB_FIELD_homePhone2,
	homeFax:				ZmMsg.AB_FIELD_homeFax,
	mobilePhone:			ZmMsg.AB_FIELD_mobilePhone,
	pager:					ZmMsg.AB_FIELD_pager,
	carPhone:				ZmMsg.AB_FIELD_carPhone,
	otherStreet:			ZmMsg.AB_FIELD_street,			// other info
	otherCity:				ZmMsg.AB_FIELD_city,
	otherState:				ZmMsg.AB_FIELD_state,
	otherPostalCode:		ZmMsg.AB_FIELD_postalCode,
	otherCountry:			ZmMsg.AB_FIELD_country,
	otherURL:				ZmMsg.AB_FIELD_URL,
	otherPhone:				ZmMsg.AB_FIELD_otherPhone,
	otherFax:				ZmMsg.AB_FIELD_otherFax,
	notes:					ZmMsg.notes,					// misc fields
	birthday:				ZmMsg.AB_FIELD_birthday
};

ZmContact._AB_FILE_AS = {
	1:						ZmMsg.AB_FILE_AS_lastFirst,
	2:						ZmMsg.AB_FILE_AS_firstLast,
	3:						ZmMsg.AB_FILE_AS_company,
	4:						ZmMsg.AB_FILE_AS_lastFirstCompany,
	5:						ZmMsg.AB_FILE_AS_firstLastCompany,
	6:						ZmMsg.AB_FILE_AS_companyLastFirst,
	7:						ZmMsg.AB_FILE_AS_companyFirstLast
};

} // if (!window.ZmContact)
}
if (AjxPackage.define("zimbraMail.abook.model.ZmContactList")) {
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file contains the contact list class.
 * 
 */

/**
 * Create a new, empty contact list.
 * @class
 * This class represents a list of contacts. In general, the list is the result of a
 * search. It may be the result of a <code>&lt;GetContactsRequest&gt;</code>, which returns all of the user's
 * local contacts. That list is considered to be canonical.
 * <p>
 * Loading of all local contacts has been optimized by delaying the creation of {@link ZmContact} objects until
 * they are needed. That has a big impact on IE, and not much on Firefox. Loading a subset
 * of attributes did not have much impact on load time, probably because a large majority
 * of contacts contain only those minimal fields.</p>
 *
 * @author Conrad Damon
 *
 * @param {ZmSearch}	search	the search that generated this list
 * @param {Boolean}	isGal		if <code>true</code>, this is a list of GAL contacts
 * @param {constant}	type		the item type
 * 
 * @extends		ZmList
 */
ZmContactList = function(search, isGal, type) {

	if (arguments.length == 0) { return; }
	type = type || ZmItem.CONTACT;
	ZmList.call(this, type, search);

	this.isGal = (isGal === true);
	this.isCanonical = false;
	this.isLoaded = false;

	this._app = appCtxt.getApp(ZmApp.CONTACTS);
	if (!this._app) { 
		this._emailToContact = this._phoneToContact = {};
		return;
	}
	this._emailToContact = this._app._byEmail;
	this._phoneToContact = this._app._byPhone;

	this._alwaysUpdateHashes = true; // Should we update the phone & IM fast-lookup hashes even when account features don't require it? (bug #60411)
};

ZmContactList.prototype = new ZmList;
ZmContactList.prototype.constructor = ZmContactList;

ZmContactList.prototype.isZmContactList = true;
ZmContactList.prototype.toString = function() { return "ZmContactList"; };




// Constants

// Support for loading user's local contacts from a large string

ZmContactList.URL = "/Contacts";	// REST URL for loading user's local contacts
ZmContactList.URL_ARGS = { fmt: 'cf', t: 2, all: 'all' }; // arguments for the URL above
ZmContactList.CONTACT_SPLIT_CHAR	= '\u001E';	// char for splitting string into contacts
ZmContactList.FIELD_SPLIT_CHAR		= '\u001D';	// char for splitting contact into fields
// fields that belong to a contact rather than its attrs
ZmContactList.IS_CONTACT_FIELD = {"id":true, "l":true, "d":true, "fileAsStr":true, "rev":true};



/**
 * @private
 */
ZmContactList.prototype.addLoadedCallback =
function(callback) {
	if (this.isLoaded) {
		callback.run();
		return;
	}
	if (!this._loadedCallbacks) {
		this._loadedCallbacks = [];
	}
	this._loadedCallbacks.push(callback);
};

/**
 * @private
 */
ZmContactList.prototype._finishLoading =
function() {
	DBG.timePt("done loading " + this.size() + " contacts");
	this.isLoaded = true;
	if (this._loadedCallbacks) {
		var callback;
		while (callback = this._loadedCallbacks.shift()) {
			callback.run();
		}
	}
};

/**
 * Retrieves the contacts from the back end, and parses the response. The list is then sorted.
 * This method is used only by the canonical list of contacts, in order to load their content.
 * <p>
 * Loading a minimal set of attributes did not result in a significant performance gain.
 * </p>
 * 
 * @private
 */
ZmContactList.prototype.load =
function(callback, errorCallback, accountName) {
	// only the canonical list gets loaded
	this.isCanonical = true;
	var respCallback = new AjxCallback(this, this._handleResponseLoad, [callback]);
	DBG.timePt("requesting contact list", true);
    if(appCtxt.isExternalAccount()) {
        //Do not make a call in case of external user
        //The rest url constructed wont exist in case of external user
        if (callback) {
		    callback.run();
	    }
        return;
    }
	var args = ZmContactList.URL_ARGS;

	// bug 74609: suppress overzealous caching by IE
	if (AjxEnv.isIE) {
		args = AjxUtil.hashCopy(args);
		args.sid = ZmCsfeCommand.getSessionId();
	}

	var params = {asyncMode:true, noBusyOverlay:true, callback:respCallback, errorCallback:errorCallback, offlineCallback:callback};
	params.restUri = AjxUtil.formatUrl({
		path:["/home/", (accountName || appCtxt.getUsername()),
	          ZmContactList.URL].join(""),
	    qsArgs: args, qsReset:true
	});
	DBG.println(AjxDebug.DBG1, "loading contacts from " + params.restUri);
	appCtxt.getAppController().sendRequest(params);

	ZmContactList.addDlFolder();
	
};

/**
 * @private
 */
ZmContactList.prototype._handleResponseLoad =
function(callback, result) {
	DBG.timePt("got contact list");
	var text = result.getResponse();
    if (text && typeof text !== 'string'){
        text = text._data;
    }
	var derefList = [];
	if (text) {
		var contacts = text.split(ZmContactList.CONTACT_SPLIT_CHAR);
		var derefBatchCmd = new ZmBatchCommand(true, null, true);
		for (var i = 0, len = contacts.length; i < len; i++) {
			var fields = contacts[i].split(ZmContactList.FIELD_SPLIT_CHAR);
			var contact = {}, attrs = {};
			var groupMembers = [];
			var foundDeref = false;
			for (var j = 0, len1 = fields.length; j < len1; j += 2) {
				if (ZmContactList.IS_CONTACT_FIELD[fields[j]]) {
					contact[fields[j]] = fields[j + 1];
				} else {
					var value = fields[j+1];
					switch (fields[j]) {
						case ZmContact.F_memberC:
							groupMembers.push({type: ZmContact.GROUP_CONTACT_REF, value: value});
							foundDeref = true; //load shared contacts
							break;
						case ZmContact.F_memberG:
							groupMembers.push({type: ZmContact.GROUP_GAL_REF, value: value});
							foundDeref = true;
							break;
						case ZmContact.F_memberI:
							groupMembers.push({type: ZmContact.GROUP_INLINE_REF, value: value});
							foundDeref = true;
							break;
						default:
							attrs[fields[j]] = value;
					}
				}
			}
			if (attrs[ZmContact.F_type] === "group") { //set only for group.
				attrs[ZmContact.F_groups] = groupMembers;
			}
			if (foundDeref) {
				//batch group members for deref loading
				var dummy = new ZmContact(contact["id"], this);
				derefBatchCmd.add(new AjxCallback(dummy, dummy.load, [null, null, derefBatchCmd, true]));
			}
			contact._attrs = attrs;
			this._addContact(contact);
		}
		derefBatchCmd.run();
	}

	this._finishLoading();

	if (callback) {
		callback.run();
	}
};

/**
 * @static
 */
ZmContactList.addDlFolder =
function() {

	if (!appCtxt.get(ZmSetting.DLS_FOLDER_ENABLED)) {
		return;
	}

	var dlsFolder = appCtxt.getById(ZmOrganizer.ID_DLS);

	var root = appCtxt.getById(ZmOrganizer.ID_ROOT);
	if (!root) { return; }

	if (dlsFolder && root.getById(ZmOrganizer.ID_DLS)) {
		//somehow (after a refresh block, can be reprod using $set:refresh. ZmClientCmdHandler.prototype.execute_refresh) the DLs folder object is removed from under the root (but still cached in appCtxt). So making sure it's there.
		return;
	}

	if (!dlsFolder) {
		var params = {
			id: ZmOrganizer.ID_DLS,
			name: ZmMsg.distributionLists,
			parent: root,
			tree: root.tree,
			type: ZmOrganizer.ADDRBOOK,
			numTotal: null, //we don't know how many
			noTooltip: true //so don't show tooltip
		};

		dlsFolder = new ZmAddrBook(params);
		root.children.add(dlsFolder);
		dlsFolder._isDL = true;
	}
	else {
		//the dls folder object exists but no longer as a child of the root.
		dlsFolder.parent = root;
		root.children.add(dlsFolder); //any better way to do this?
	}

};

ZmContactList.prototype.add = 
function(item, index) {
	if (!item.id || !this._idHash[item.id]) {
		this._vector.add(item, index);
		if (item.id) {
			this._idHash[item.id] = item;
		}
		this._updateHashes(item, true);
	}
};

ZmContactList.prototype.cache = 
function(offset, newList) {
	var getId = function(){
		return this.id;
	}
	var exists = function(obj) {
		return this._vector.containsLike(obj, getId);
	}
	var unique = newList.sub(exists, this);

	this.getVector().merge(offset, unique);
	// reparent each item within new list, and add it to ID hash
	var list = unique.getArray();
	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		item.list = this;
		if (item.id) {
			this._idHash[item.id] = item;
		}
	}
};

/**
 * @private
 */
ZmContactList.prototype._addContact =
function(contact) {

	// note that we don't create a ZmContact here (optimization)
	contact.list = this;
	this._updateHashes(contact, true);
	var fn = [], fl = [];
	if (contact._attrs[ZmContact.F_firstName])	{ fn.push(contact._attrs[ZmContact.F_firstName]); }
	if (contact._attrs[ZmContact.F_middleName])	{ fn.push(contact._attrs[ZmContact.F_middleName]); }
	if (contact._attrs[ZmContact.F_lastName])	{ fn.push(contact._attrs[ZmContact.F_lastName]); }
	if (fn.length) {
		contact._attrs[ZmContact.X_fullName] = fn.join(" ");
	}
	if (contact._attrs[ZmContact.F_firstName])	{ fl.push(contact._attrs[ZmContact.F_firstName]); }
	if (contact._attrs[ZmContact.F_lastName])	{ fl.push(contact._attrs[ZmContact.F_lastName]); }
	contact._attrs[ZmContact.X_firstLast] = fl.join(" ");

	this.add(contact);
};

/**
 * Converts an anonymous contact object (contained by the JS returned by load request)
 * into a ZmContact, and updates the containing list if it is the canonical one.
 *
 * @param {Object}	contact		a contact
 * @param {int}	idx		the index of contact in canonical list
 * 
 * @private
 */
ZmContactList.prototype._realizeContact =
function(contact, idx) {

	if (contact instanceof ZmContact) { return contact; }
	if (contact && contact.type == ZmItem.CONTACT) { return contact; }	// instanceof often fails in new window

	var args = {list:this};
	var obj = eval(ZmList.ITEM_CLASS[this.type]);
	var realContact = obj && obj.createFromDom(contact, args);

	if (this.isCanonical) {
		var a = this.getArray();
		idx = idx || this.getIndexById(contact.id);
		a[idx] = realContact;
		this._updateHashes(realContact, true);
		this._idHash[contact.id] = realContact;
	}

	return realContact;
};

/**
 * Finds the array index for the contact with the given ID.
 *
 * @param {int}	id		the contact ID
 * @return	{int}	the index
 * @private
 */
ZmContactList.prototype.getIndexById =
function(id) {
	var a = this.getArray();
	for (var i = 0; i < a.length; i++) {
		if (a[i].id == id) {
			return i;
		}
	}
	return null;
};

/**
 * Override in order to make sure the contacts have been realized. We don't
 * call realizeContact() since this is not the canonical list.
 *
 * @param {int}	offset		the starting index
 * @param {int}	limit		the size of sublist
 * @return	{AjxVector}	a vector of {@link ZmContact} objects
 */
ZmContactList.prototype.getSubList =
function(offset, limit, folderId) {
	if (folderId && this.isCanonical) {
		// only collect those contacts that belong to the given folderId if provided
		var newlist = [];
		var sublist = this.getArray();
		var offsetCount = 0;
		this.setHasMore(false);

		for (var i = 0; i < sublist.length; i++) {
			sublist[i] = this._realizeContact(sublist[i], i);
			var folder = appCtxt.getById(sublist[i].folderId);
			if (folder && folder.nId == ZmOrganizer.normalizeId(folderId)) {
				if (offsetCount >= offset) {
					if (newlist.length == limit) {
						this.setHasMore(true);
						break;
					}
					newlist.push(sublist[i]);
				}
				offsetCount++;
			}
		}

		return AjxVector.fromArray(newlist);
	} else {
		var vec = ZmList.prototype.getSubList.call(this, offset, limit);
		if (vec) {
			var a = vec.getArray();
			for (var i = 0; i < a.length; i++) {
				a[i] = this._realizeContact(a[i], offset + i);
			}
		}

		return vec;
	}
};

/**
 * Override in order to make sure the contact has been realized. Canonical list only.
 *
 * @param {int}	id		the contact ID
 * @return	{ZmContact}	the contact or <code>null</code> if not found
 */
ZmContactList.prototype.getById =
function(id) {
	if (!id || !this.isCanonical) return null;

	var contact = this._idHash[id];
	return contact ? this._realizeContact(contact) : null;
};

/**
 * Gets the contact with the given address, if any (canonical list only).
 *
 * @param {String}	address	an email address
 * @return	{ZmContact}	the contact or <code>null</code> if not found
 */
ZmContactList.prototype.getContactByEmail =
function(address) {
	if (!address || !this.isCanonical) return null;

	var contact = this._emailToContact[address.toLowerCase()];
	if (contact) {
		contact = this._realizeContact(contact);
		contact._lookupEmail = address;	// so caller knows which address matched
		return contact;
	} else {
		return null;
	}
};

/**
 * Gets information about the contact with the given phone number, if any (canonical list only).
 *
 * @param {String}	phone	the phone number
 * @return	{Hash}	an object with <code>contact</code> = the contact & <code>field</code> = the field with the matching phone number
 */
ZmContactList.prototype.getContactByPhone =
function(phone) {
	if (!phone || !this.isCanonical) return null;

	var digits = this._getPhoneDigits(phone);
	var data = this._phoneToContact[digits];
	if (data) {
		data.contact = this._realizeContact(data.contact);
		return data;
	} else {
		return null;
	}
};

/**
 * Moves a list of items to the given folder.
 * <p>
 * This method calls the base class for normal "moves" UNLESS we're dealing w/
 * shared items (or folder) in which case we must send a CREATE request for the
 * given folder to the server followed by a hard delete of the shared contact.
 * </p>
 *
 * @param {Hash}	params		a hash of parameters
 * @param	{Array}       params.items			a list of items to move
 * @param	{ZmFolder}	params.folder		the destination folder
 * @param	{Hash}	       params.attrs		the additional attrs for SOAP command
 * @param	{Boolean}	params.outOfTrash	if <code>true</code>, we are moving contacts out of trash
 */
ZmContactList.prototype.moveItems =
function(params) {

	params = Dwt.getParams(arguments, ["items", "folder", "attrs", "outOfTrash"]);
	params.items = AjxUtil.toArray(params.items);

	var moveBatchCmd = new ZmBatchCommand(true, null, true);
	var loadBatchCmd = new ZmBatchCommand(true, null, true);
	var softMove = [];

	// if the folder we're moving contacts to is a shared folder, then dont bother
	// checking whether each item is shared or not
	if (params.items[0] && params.items[0] instanceof ZmItem) {
		for (var i = 0; i < params.items.length; i++) {
			var contact = params.items[i];

			if (contact.isReadOnly()) { continue; }

			softMove.push(contact);
		}
	} else {
		softMove = params.items;
	}

	// for "soft" moves, handle moving out of Trash differently
	if (softMove.length > 0) {
		var params1 = AjxUtil.hashCopy(params);
		params1.attrs = params.attrs || {};
		var toFolder = params.folder;
		params1.attrs.l = toFolder.isRemote() ? toFolder.getRemoteId() : toFolder.id;
		params1.action = "move";
        params1.accountName = appCtxt.multiAccounts && appCtxt.accountList.mainAccount.name;
        if (params1.folder.id == ZmFolder.ID_TRASH) {
            params1.actionTextKey = 'actionTrash';
            // bug: 47389 avoid moving to local account's Trash folder.
            params1.accountName = appCtxt.multiAccounts && params.items[0].getAccount().name;
        } else {
            params1.actionTextKey = 'actionMove';
            params1.actionArg = toFolder.getName(false, false, true);
        }
		params1.callback = params.outOfTrash && new AjxCallback(this, this._handleResponseMoveItems, params);

		this._itemAction(params1);
	}
};

/**
 * @private
 */
ZmContactList.prototype._handleResponseMoveBatchCmd =
function(result) {
	var resp = result.getResponse().BatchResponse.ContactActionResponse;
	// XXX: b/c the server does not return notifications for actions done on
	//      shares, we manually notify - TEMP UNTIL WE GET BETTER SERVER SUPPORT
	var ids = resp[0].action.id.split(",");
	for (var i = 0; i < ids.length; i++) {
		var contact = appCtxt.cacheGet(ids[i]);
		if (contact && contact.isShared()) {
			contact.notifyDelete();
			appCtxt.cacheRemove(ids[i]);
		}
	}
};

/**
 * @private
 */
ZmContactList.prototype._handleResponseLoadMove =
function(moveBatchCmd, params) {
	var deleteCmd = new AjxCallback(this, this._itemAction, [params]);
	moveBatchCmd.add(deleteCmd);

	var respCallback = new AjxCallback(this, this._handleResponseMoveBatchCmd);
	moveBatchCmd.run(respCallback);
};

/**
 * @private
 */
ZmContactList.prototype._handleResponseBatchLoad =
function(batchCmd, folder, result, contact) {
	batchCmd.add(this._getCopyCmd(contact, folder));
};

/**
 * @private
 */
ZmContactList.prototype._getCopyCmd =
function(contact, folder) {
	var temp = new ZmContact(null, this);
	for (var j in contact.attr) {
		temp.attr[j] = contact.attr[j];
	}
	temp.attr[ZmContact.F_folderId] = folder.id;

	return new AjxCallback(temp, temp.create, [temp.attr]);
};

/**
 * Deletes contacts after checking that this is not a GAL list.
 *
 * @param {Hash}	params		a hash of parameters
 * @param	{Array}	       params.items			the list of items to delete
 * @param	{Boolean}	params.hardDelete	if <code>true</code>, force physical removal of items
 * @param	{Object}	params.attrs			the additional attrs for SOAP command
 */
ZmContactList.prototype.deleteItems =
function(params) {
	if (this.isGal) {
		if (ZmContactList.deleteGalItemsAllowed(params.items)) {
			this._deleteDls(params.items);
			return;
		}
		DBG.println(AjxDebug.DBG1, "Cannot delete GAL contacts that are not DLs");
		return;
	}
	ZmList.prototype.deleteItems.call(this, params);
};

ZmContactList.deleteGalItemsAllowed =
function(items) {
	var deleteDomainsAllowed = appCtxt.createDistListAllowedDomainsMap;
	if (items.length == 0) {
		return false; //need a special case since we don't want to enable the "delete" button for 0 items.
	}
	for (var i = 0; i < items.length; i++) {
		var contact = items[i];
		var email = contact.getEmail();
		var domain = email.split("@")[1];
		var isDL = contact && contact.isDistributionList();
		//see bug 71368 and also bug 79672 - the !contact.dlInfo is in case somehow dlInfo is missing - so unfortunately if that happens (can't repro) - let's not allow to delete since we do not know if it's an owner
		if (!isDL || !deleteDomainsAllowed[domain] || !contact.dlInfo || !contact.dlInfo.isOwner) {
			return false;
		}
	}
	return true;
};

ZmContactList.prototype._deleteDls =
function(items, confirmDelete) {

	if (!confirmDelete) {
		var callback = this._deleteDls.bind(this, items, true);
		this._popupDeleteWarningDialog(callback, false, items.length);
		return;
	}

	var reqs = [];
	for (var i = 0; i < items.length; i++) {
		var contact = items[i];
		var email = contact.getEmail();
		reqs.push({
				_jsns: "urn:zimbraAccount",
				dl: {by: "name",
					 _content: contact.getEmail()
				},
				action: {
					op: "delete"
				}
			});
	}
	var jsonObj = {
		BatchRequest: {
			_jsns: "urn:zimbra",
			DistributionListActionRequest: reqs
		}
	};
	var respCallback = this._deleteDlsResponseHandler.bind(this, items);
	appCtxt.getAppController().sendRequest({jsonObj: jsonObj, asyncMode: true, callback: respCallback});

};

ZmContactList.prototype._deleteDlsResponseHandler =
function(items) {
	if (appCtxt.getCurrentView().isZmGroupView) {
		//this is the case we were editing the DL (different than viewing it in the DL list, in which case it's the contactListController).
		//so we now need to pop up the view.
		this.controller.popView();
	}

	appCtxt.setStatusMsg(items.length == 1 ? ZmMsg.dlDeleted : ZmMsg.dlsDeleted);

	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		item.clearDlInfo();
		item._notify(ZmEvent.E_DELETE);
	}
};



/**
 * Sets the is GAL flag.
 * 
 * @param	{Boolean}	isGal		<code>true</code> if contact list is GAL
 */
ZmContactList.prototype.setIsGal =
function(isGal) {
	this.isGal = isGal;
};

ZmContactList.prototype.notifyCreate =
function(node) {
	var obj = eval(ZmList.ITEM_CLASS[this.type]);
	if (obj) {
		var item = obj.createFromDom(node, {list:this});
		var index = this._sortIndex(item);
		// only add if it sorts into this list
		var listSize = this.size();
		var visible = false;
		if (index < listSize || listSize == 0 || (index==listSize && !this._hasMore)) {
			this.add(item, index);
			this.createLocal(item);
			visible = true;
		}
		this._notify(ZmEvent.E_CREATE, {items: [item], sortIndex: index, visible: visible});
	}
};

/**
 * Moves the items.
 * 
 * @param	{Array}	items		an array of {@link ZmContact} objects
 * @param	{String}	folderId	the folder id
 */
ZmContactList.prototype.moveLocal =
function(items, folderId) {
	// don't remove any contacts from the canonical list
	if (!this.isCanonical)
		ZmList.prototype.moveLocal.call(this, items, folderId);
	if (folderId == ZmFolder.ID_TRASH) {
		for (var i = 0; i < items.length; i++) {
			this._updateHashes(items[i], false);
		}
	}
};

/**
 * Deletes the items.
 * 
 * @param	{Array}	items		an array of {@link ZmContact} objects
 */
ZmContactList.prototype.deleteLocal =
function(items) {
	ZmList.prototype.deleteLocal.call(this, items);
	for (var i = 0; i < items.length; i++) {
		this._updateHashes(items[i], false);
	}
};

/**
 * Handle modified contact.
 * 
 * @private
 */
ZmContactList.prototype.modifyLocal =
function(item, details) {
	if (details) {
		// notify item's list
		this._evt.items = details.items = [item];
		this._evt.item = details.contact; //somehow this was set to something obsolete. What a mess. Also note that item is Object while details.contact is ZmContact
		this._notify(ZmEvent.E_MODIFY, details);
	}

	var contact = details.contact;
	if (this.isCanonical || contact.attr[ZmContact.F_email] != details.oldAttr[ZmContact.F_email]) {
		// Remove traces of old contact - NOTE: we pass in null for the ID on
		// PURPOSE to avoid overwriting the existing cached contact
		var oldContact = new ZmContact(null, this);
		oldContact.id = details.contact.id;
		oldContact.attr = details.oldAttr;
		this._updateHashes(oldContact, false);

		// add new contact to hashes
		this._updateHashes(contact, true);
	}

	// place in correct position in list
	if (details.fileAsChanged) {
		this.remove(contact);
		var index = this._sortIndex(contact);
		var listSize = this.size();
		if (index < listSize || listSize == 0 || (index == listSize && !this._hasMore)) {
			this.add(contact, index);
		}
	}

	// reset addrbook property
	if (contact.addrbook && (contact.addrbook.id != contact.folderId)) {
		contact.addrbook = appCtxt.getById(contact.folderId);
	}
};

/**
 * Creates the item local.
 * 
 * @param	{ZmContact}	item		the item
 */
ZmContactList.prototype.createLocal =
function(item) {
	this._updateHashes(item, true);
};

/**
 * @private
 */
ZmContactList.prototype._updateHashes =
function(contact, doAdd) {

	this._app.updateCache(contact, doAdd);

	// Update email hash.
	for (var index = 0; index < ZmContact.EMAIL_FIELDS.length; index++) {
		var field = ZmContact.EMAIL_FIELDS[index];
		for (var i = 1; true; i++) {
			var aname = ZmContact.getAttributeName(field, i);
			var avalue = ZmContact.getAttr(contact, aname);
			if (!avalue) break;
			if (doAdd) {
				this._emailToContact[avalue.toLowerCase()] = contact;
			} else {
				delete this._emailToContact[avalue.toLowerCase()];
			}
		}
	}

	// Update phone hash.
	if (appCtxt.get(ZmSetting.VOICE_ENABLED) || this._alwaysUpdateHashes) {
		for (var index = 0; index < ZmContact.PHONE_FIELDS.length; index++) {
			var field = ZmContact.PHONE_FIELDS[index];
			for (var i = 1; true; i++) {
				var aname = ZmContact.getAttributeName(field, i);
				var avalue = ZmContact.getAttr(contact, aname);
				if (!avalue) break;
				var digits = this._getPhoneDigits(avalue);
				if (digits) {
					if (doAdd) {
						this._phoneToContact[avalue] = {contact: contact, field: aname};
					} else {
						delete this._phoneToContact[avalue];
					}
				}
			}
		}
	}
};

/**
 * Strips all non-digit characters from a phone number.
 * 
 * @private
 */
ZmContactList.prototype._getPhoneDigits =
function(phone) {
	return phone.replace(/[^\d]/g, '');
};

/**
 * Returns the position at which the given contact should be inserted in this list.
 * 
 * @private
 */
ZmContactList.prototype._sortIndex =
function(contact) {
	var a = this._vector.getArray();
	for (var i = 0; i < a.length; i++) {
		if (ZmContact.compareByFileAs(a[i], contact) > 0) {
			return i;
		}
	}
	return a.length;
};

/**
 * Gets the list ID hash
 * @return idHash {Ojbect} list ID hash
 */
ZmContactList.prototype.getIdHash =
function() {
	return this._idHash;
}

/**
 * @private
 */
ZmContactList.prototype._handleResponseModifyItem =
function(item, result) {
	// NOTE: we overload and do nothing b/c base class does more than we want
	//       (since everything is handled by notifications)
};
}
if (AjxPackage.define("zimbraMail.calendar.model.ZmResource")) {
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a resource.
 * @class
 * This class represents a resource.
 * 
 * @param	{String}	id		the id
 * @param	{ZmList}	list	the list
 * @param	{constant}	resType		the resource type
 * 
 * @extends		ZmContact
 * @see		ZmCalBaseItem
 */
ZmResource = function(id, list, resType) {
	id = id ? id : Dwt.getNextId();
	ZmContact.call(this, id, list, ZmItem.RESOURCE);
	
	this.resType = resType;
};

ZmResource.F_capacity			= "zimbraCalResCapacity";
ZmResource.F_contactMail		= "zimbraCalResContactEmail";
ZmResource.F_locationName		= "zimbraCalResLocationDisplayName";
ZmResource.F_mail			= "email";
ZmResource.F_name			= "fullName";
ZmResource.F_type			= "zimbraCalResType";
ZmResource.F_description		= "description";

ZmResource.ATTR_LOCATION	= "Location";
ZmResource.ATTR_EQUIPMENT	= "Equipment";

ZmContact.initAttrVariants(ZmResource);

/**
* Creates a resource from an XML node.
*
* @param node		a "calresource" XML node
* @param args		args to pass to the constructor
*/
ZmResource.createFromDom =
function(node, args) {
	var resource = new ZmResource(node.id, args.list);
	resource._loadFromDom(node);
	resource.resType = (resource.getAttr(ZmResource.F_type) == ZmResource.ATTR_LOCATION) ?
						ZmCalBaseItem.LOCATION : ZmCalBaseItem.EQUIPMENT;
	if (!resource.list) {
		var calApp = appCtxt.getApp(ZmApp.CALENDAR);
		resource.list = (resource.resType == ZmCalBaseItem.LOCATION) ? calApp.getLocations() :
																   calApp.getEquipment();
	}
	
	return resource;
};

ZmResource.prototype = new ZmContact;
ZmResource.prototype.constructor = ZmResource;

ZmResource.prototype.toString =
function() {
	return "ZmResource";
};

/**
 * Checks if the resource is a location.
 * 
 * @return	{Boolean}	<code>true</code> if is location
 */
ZmResource.prototype.isLocation =
function() {
	return (this.resType == ZmCalBaseItem.LOCATION);
};

/**
 * Gets the resource email.
 * 
 * @return	{String}	the email
 */
ZmResource.prototype.getEmail =
function() {
	var attr = this.getAttr(ZmResource.F_mail);
	return attr instanceof Array ? attr[0] : attr;
};

/**
 * Gets the resource full name.
 * 
 * @return	{String}	the full name
 */
ZmResource.prototype.getFullName =
function() {
	return ( this.getAttr(ZmResource.F_name)
            || this.getAttr(ZmResource.F_locationName) );
};

/**
 * Initializes from an email address.
 *
 * @param {AjxEmailAddress|String}	email	an email address object an email string
 */
ZmResource.prototype.initFromEmail =
function(email) {
	if (email instanceof AjxEmailAddress) {
		this.setAttr(ZmResource.F_mail, email.getAddress());
		this.setAttr(ZmResource.F_name, email.getName());
	} else {
		this.setAttr(ZmResource.F_mail, email);
	}
};

ZmResource.prototype.getAttendeeText =
function(type, shortForm) {
	var text = "";
	var name = this.getFullName();
	var email = this._lookupEmail || this.getEmail();
	if (shortForm) {
		text = name || email || "";
	} else {
		var e = new AjxEmailAddress(email, null, name);
		text = e.toString();
	}
	return text;
};
}
if (AjxPackage.define("zimbraMail.calendar.model.ZmResourceList")) {
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Create a new, empty calendar resources list.
 * @constructor
 * @class
 * This class represents a list of calendar resources. A calendar resource can be a
 * location or a piece of equipment. All calendar resource records are stored in the GAL.
 *
 * @author Conrad Damon
 *
 * @param {constant}	resType	the type of resources (location or equipment)
 * @param {ZmSearch}	search	the search that generated this list
 * 
 * @extends		ZmContactList
 * 
 * @see		ZmCalBaseItem
 */
ZmResourceList = function(resType, search) {
	ZmContactList.call(this, search, true, ZmItem.RESOURCE);

	this.resType = resType;
	
	this._nameToResource = {};
	this._emailToResource = {};
	this._app = appCtxt.getApp(ZmApp.CALENDAR);
};

ZmResourceList.ATTRS =
	[ZmResource.F_name, ZmResource.F_mail, ZmResource.F_type, ZmResource.F_locationName,
	 ZmResource.F_capacity, ZmResource.F_contactMail, ZmResource.F_description];

ZmResourceList.prototype = new ZmContactList;
ZmResourceList.prototype.constructor = ZmResourceList;

ZmResourceList.prototype.toString =
function() {
	return "ZmResourceList";
};

/**
 * Loads the list.
 * 
 * @param	{ZmBatchCommand}	batchCmd		the batch command
 */
ZmResourceList.prototype.load =
function(batchCmd) {
	var conds = [];
	var value = (this.resType == ZmCalBaseItem.LOCATION) ? ZmResource.ATTR_LOCATION : ZmResource.ATTR_EQUIPMENT;
	conds.push({attr: ZmResource.F_type, op: "eq", value: value});
	var params = {conds: conds, join: ZmSearch.JOIN_OR, attrs: ZmResourceList.ATTRS};
    if(batchCmd) {
        var search = new ZmSearch(params);        
	    search.execute({callback: new AjxCallback(this, this._handleResponseLoad), batchCmd: batchCmd});
    }else{
        if (appCtxt.isOffline) {
            if (appCtxt.isZDOnline()) {
                this.searchCalResources(params);
            }
        } else {
            this.searchCalResources(params);
        }
    }
};

/**
 * Searches the calendar resources.
 * 
 * @param	{Hash}	params		a hash of parameters
 */
ZmResourceList.prototype.searchCalResources =
function(params) {
    var soapDoc = AjxSoapDoc.create("SearchCalendarResourcesRequest", "urn:zimbraAccount");
    var method = soapDoc.getMethod();
    if (params.attrs) {
        AjxUtil.arrayRemove(params.attrs, "fullName");
        method.setAttribute("attrs", params.attrs.join(","));
    }
    var searchFilterEl = soapDoc.set("searchFilter");
    if (params.conds && params.conds.length) {
        var condsEl = soapDoc.set("conds", null, searchFilterEl);
        if (params.join == ZmSearch.JOIN_OR) {
            condsEl.setAttribute("or", 1);
        }
        for (var i = 0; i < params.conds.length; i++) {
            var cond = params.conds[i];
            if (cond.attr=="fullName" && cond.op=="has") {
                var nameEl = soapDoc.set("name", cond.value);
            } else {
                var condEl = soapDoc.set("cond", null, condsEl);
                condEl.setAttribute("attr", cond.attr);
                condEl.setAttribute("op", cond.op);
                condEl.setAttribute("value", cond.value);
            }
        }
    }

    var response = appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:false,
        timeout:params.timeout, noBusyOverlay:params.noBusyOverlay});
    var result = new ZmCsfeResult(response, false);

    var search = new ZmSearch(params);
    search.isCalResSearch = true;

    var searchResult = new ZmSearchResult(search);
    searchResult.set(response.SearchCalendarResourcesResponse);
    result.set(searchResult);
    
    this._handleResponseLoad(result);
};

ZmResourceList.prototype._handleResponseLoad = 
function(result) {
	var resp = result.getResponse();
	this._vector = resp.getResults(ZmItem.RESOURCE).getVector();
	var a = this._vector.getArray();
	for (var i = 0; i < a.length; i++) {
		var resource = a[i];
		this._updateHashes(resource);
		this._idHash[resource.id] = resource;
	}
	//bug:16436 this._loaded changed to this.isLoaded 
	this.isLoaded = true;
	this._galAutocompleteEnabled = false;
};

ZmResourceList.prototype._updateHashes =
function(resource) {
	this._app.updateResourceCache(resource);
	var name = resource.getFullName();
	if (name) {
		this._nameToResource[name.toLowerCase()] = resource;
	}
	var email = resource.getEmail();
	if (email) {
		this._emailToResource[email.toLowerCase()] = resource;
	}
};

// Override so we don't invoke ZmContactList.addFromDom
ZmResourceList.prototype.addFromDom =
function(node, args) {
	ZmList.prototype.addFromDom.call(this, node, args);
};

/**
 * Gets the resource with the given name, if any. Canonical list only.
 * Since names aren't guaranteed to be unique, this returns the last resource
 * with the given name.
 *
 * @param {String}	name	the resource name
 * @return	{ZmResource}	the resource or <code>null</code> if not found
 */
ZmResourceList.prototype.getResourceByName = 
function(name) {
	if (!name || !this.isCanonical) return null;

	return this._nameToResource[name.toLowerCase()];
};

/**
 *Gets the resource with the given address, if any. Canonical list only.
 *
 * @param {String}	address	an email address
 * @return	{ZmResource}	the resource or <code>null</code> if not found
 */
ZmResourceList.prototype.getResourceByEmail = 
function(address) {
	if (!address || !this.isCanonical) return null;

	return this._emailToResource[address.toLowerCase()];
};
}
if (AjxPackage.define("zimbraMail.calendar.view.ZmApptViewHelper")) {
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Does nothing.
 * @constructor
 * @class
 * This static class provides utility functions for dealing with appointments
 * and their related forms and views.
 *
 * @author Parag Shah
 * @author Conrad Damon
 *
 * - Helper methods shared by several views associated w/ creating new appointments.
 *   XXX: move to new files when fully baked!
 *   
 * @private
 */
ZmApptViewHelper = function() {
};

ZmApptViewHelper.REPEAT_OPTIONS = [
	{ label: ZmMsg.none, 				value: "NON", 	selected: true 	},
	{ label: ZmMsg.everyDay, 			value: "DAI", 	selected: false },
	{ label: ZmMsg.everyWeek, 			value: "WEE", 	selected: false },
	{ label: ZmMsg.everyMonth, 			value: "MON", 	selected: false },
	{ label: ZmMsg.everyYear, 			value: "YEA", 	selected: false },
	{ label: ZmMsg.custom, 				value: "CUS", 	selected: false }];


ZmApptViewHelper.SHOWAS_OPTIONS = [
	{ label: ZmMsg.free, 				value: "F", 	selected: false },
	{ label: ZmMsg.organizerTentative, 		value: "T", 	selected: false },
	{ label: ZmMsg.busy, 				value: "B", 	selected: true  },
	{ label: ZmMsg.outOfOffice,			value: "O", 	selected: false }
];

/**
 * returns the label of the option specified by it's value. This is used in calendar.Appointment#Tooltip template
 *
 * @param value
 * returns the label
 */
ZmApptViewHelper.getShowAsOptionLabel =
function(value) {

	for (var i = 0; i < ZmApptViewHelper.SHOWAS_OPTIONS.length; i++) {
		var option = ZmApptViewHelper.SHOWAS_OPTIONS[i];
		if (option.value == value) {
			return option.label;
		}
	}
};


/**
 * Gets an object with the indices of the currently selected time fields.
 *
 * @param {ZmApptEditView}	tabView		the edit/tab view containing time widgets
 * @param {Hash}	dateInfo	a hash of date info to fill in
 */
ZmApptViewHelper.getDateInfo =
function(tabView, dateInfo) {
	dateInfo.startDate = tabView._startDateField.value;
	dateInfo.endDate = tabView._endDateField.value;
    var tzoneSelect = tabView._tzoneSelect || tabView._tzoneSelectStart;
    dateInfo.timezone = tzoneSelect ? tzoneSelect.getValue() : "";
    if (tabView._allDayCheckbox && tabView._allDayCheckbox.checked) {
		dateInfo.showTime = false;

        //used by DwtTimeInput - advanced time picker
        dateInfo.startTimeStr = dateInfo.endTimeStr = null;

        //used by DwtTimeSelect
        dateInfo.startHourIdx = dateInfo.startMinuteIdx = dateInfo.startAmPmIdx =
		dateInfo.endHourIdx = dateInfo.endMinuteIdx = dateInfo.endAmPmIdx = null;

        dateInfo.isAllDay = true;
    } else {
		dateInfo.showTime = true;

        if(tabView._startTimeSelect instanceof DwtTimeSelect) {
            dateInfo.startHourIdx = tabView._startTimeSelect.getSelectedHourIdx();
            dateInfo.startMinuteIdx = tabView._startTimeSelect.getSelectedMinuteIdx();
            dateInfo.startAmPmIdx = tabView._startTimeSelect.getSelectedAmPmIdx();
            dateInfo.endHourIdx = tabView._endTimeSelect.getSelectedHourIdx();
            dateInfo.endMinuteIdx = tabView._endTimeSelect.getSelectedMinuteIdx();
            dateInfo.endAmPmIdx = tabView._endTimeSelect.getSelectedAmPmIdx();
        }else {
            dateInfo.startHourIdx = dateInfo.startMinuteIdx = dateInfo.startAmPmIdx =
            dateInfo.endHourIdx = dateInfo.endMinuteIdx = dateInfo.endAmPmIdx = null;            
        }

        if(tabView._startTimeSelect instanceof DwtTimeInput) {
            dateInfo.startTimeStr = tabView._startTimeSelect.getTimeString();
            dateInfo.endTimeStr = tabView._endTimeSelect.getTimeString();
        }else {
            dateInfo.startTimeStr = dateInfo.endTimeStr = null;
        }

        dateInfo.isAllDay = false;
	}
};

ZmApptViewHelper.handleDateChange = 
function(startDateField, endDateField, isStartDate, skipCheck, oldStartDate) {
	var needsUpdate = false;
	var sd = AjxDateUtil.simpleParseDateStr(startDateField.value);
	var ed = AjxDateUtil.simpleParseDateStr(endDateField.value);

	// if start date changed, reset end date if necessary
	if (isStartDate) {
		// if date was input by user and it's foobar, reset to today's date
		if (!skipCheck) {
			if (sd == null || isNaN(sd)) {
				sd = new Date();
			}
			// always reset the field value in case user entered date in wrong format
			startDateField.value = AjxDateUtil.simpleComputeDateStr(sd);
		}

		if (ed.valueOf() < sd.valueOf()) {
			endDateField.value = startDateField.value;
        }else if(oldStartDate != null) {
            var delta = ed.getTime() - oldStartDate.getTime();
            var newEndDate = new Date(sd.getTime() + delta);
            endDateField.value = AjxDateUtil.simpleComputeDateStr(newEndDate);
        }
		needsUpdate = true;
	} else {
		// if date was input by user and it's foobar, reset to today's date
		if (!skipCheck) {
			if (ed == null || isNaN(ed)) {
				ed = new Date();
			}
			// always reset the field value in case user entered date in wrong format
			endDateField.value = AjxDateUtil.simpleComputeDateStr(ed);
		}

		// otherwise, reset start date if necessary
		if (sd.valueOf() > ed.valueOf()) {
			startDateField.value = endDateField.value;
			needsUpdate = true;
		}
	}

	return needsUpdate;
};

ZmApptViewHelper.getApptToolTipText =
function(origAppt, controller) {
    if(origAppt._toolTip) {
        return origAppt._toolTip;
    }
    var appt = ZmAppt.quickClone(origAppt);
    var organizer = appt.getOrganizer();
	var sentBy = appt.getSentBy();
	var userName = appCtxt.get(ZmSetting.USERNAME);
	if (sentBy || (organizer && organizer != userName)) {
		organizer = (appt.message && appt.message.invite && appt.message.invite.getOrganizerName()) || organizer;
		if (sentBy) {
			var contactsApp = appCtxt.getApp(ZmApp.CONTACTS);
			var contact = contactsApp && contactsApp.getContactByEmail(sentBy);
			sentBy = (contact && contact.getFullName()) || sentBy;
		}
	} else {
		organizer = null;
		sentBy = null;
	}

	var params = {
		appt: appt,
		cal: (appt.folderId != ZmOrganizer.ID_CALENDAR && controller) ? controller.getCalendar() : null,
		organizer: organizer,
		sentBy: sentBy,
		when: appt.getDurationText(false, false),
		location: appt.getLocation(),
		width: "250",
        hideAttendees: true
	};

	var toolTip = origAppt._toolTip = AjxTemplate.expand("calendar.Appointment#Tooltip", params);
    return toolTip;
};


ZmApptViewHelper.getDayToolTipText =
function(date, list, controller, noheader, emptyMsg, isMinical, getSimpleToolTip) {
	
	if (!emptyMsg) {
		emptyMsg = ZmMsg.noAppts;
	}

	var html = new AjxBuffer();

	var formatter = DwtCalendar.getDateFullFormatter();	
	var title = formatter.format(date);
	
	html.append("<div>");

	html.append("<table cellpadding='0' cellspacing='0' border='0'>");
	if (!noheader) html.append("<tr><td><div class='calendar_tooltip_month_day_label'>", title, "</div></td></tr>");
	html.append("<tr><td>");
	html.append("<table cellpadding='1' cellspacing='0' border='0'>");
	
	var size = list ? list.size() : 0;

	var useEmptyMsg = true;
	var dateTime = date.getTime();
	for (var i = 0; i < size; i++) {
		var ao = list.get(i);
		var isAllDay = ao.isAllDayEvent();
		if (isAllDay || getSimpleToolTip) {
			// Multi-day "appts/all day events" will be broken up into one sub-appt per day, so only show
			// the one that matches the selected date
			var apptDate = new Date(ao.startDate.getTime());
			apptDate.setHours(0,0,0,0);
			if (apptDate.getTime() != dateTime) continue;
		}

		if (isAllDay && !getSimpleToolTip) {
			useEmptyMsg = false;
			if(!isMinical && ao.toString() == "ZmAppt") {
				html.append("<tr><td><div class=appt>");
				html.append(ZmApptViewHelper.getApptToolTipText(ao, controller));
				html.append("</div></td></tr>");
			}
			else {
				//DBG.println("AO    "+ao);
				var widthField = AjxEnv.isIE ? "width:500px;" : "min-width:300px;";
				html.append("<tr><td><div style='" + widthField + "' class=appt>");
				html.append(ZmApptViewHelper._allDayItemHtml(ao, Dwt.getNextId(), controller, true, true));
				html.append("</div></td></tr>");
			}
		}
		else {
			useEmptyMsg = false;
			if (!isMinical && ao.toString() == "ZmAppt") {
				html.append("<tr><td><div class=appt>");
				html.append(ZmApptViewHelper.getApptToolTipText(ao, controller));
				html.append("</div></td></tr>");
			}
			else {
				var color = ZmCalendarApp.COLORS[controller.getCalendarColor(ao.folderId)];
				var isNew = ao.status == ZmCalBaseItem.PSTATUS_NEEDS_ACTION;
				html.append("<tr><td class='calendar_month_day_item'><div class='", color, isNew ? "DarkC" : "C", "'>");
				if (isNew) html.append("<b>");
				
				var dur; 
				if (isAllDay) {
					dur = ao._orig.getDurationText(false, false, true)
				} 
				else {
					//html.append("&bull;&nbsp;");
					//var dur = ao.getShortStartHour();
					dur = getSimpleToolTip ? ao._orig.getDurationText(false,false,true) : ao.getDurationText(false,false);
				}
				html.append(dur);
				if (dur != "") {
					html.append("&nbsp;");
					if (isAllDay) { 
						html.append("-&nbsp"); 
					}
				}   
				html.append(AjxStringUtil.htmlEncode(ao.getName()));
				
				if (isNew) html.append("</b>");
				html.append("</div>");
				html.append("</td></tr>");
			}
		}
	}
	if (useEmptyMsg) {
		html.append("<tr><td>"+emptyMsg+"</td></tr>");
	}
	html.append("</table>");
	html.append("</td></tr></table>");
	html.append("</div>");

	return html.toString();
};

/**
 * Returns a list of calendars based on certain conditions. Especially useful
 * for multi-account
 *
 * @param folderSelect	[DwtSelect]		DwtSelect object to populate
 * @param folderRow		[HTMLElement]	Table row element to show/hide
 * @param calendarOrgs	[Object]		Hash map of calendar ID to calendar owner
 * @param calItem		[ZmCalItem]		a ZmAppt or ZmTask object
 */
ZmApptViewHelper.populateFolderSelect =
function(folderSelect, folderRow, calendarOrgs, calItem) {
	// get calendar folders (across all accounts)
	var org = ZmOrganizer.ITEM_ORGANIZER[calItem.type];
	var data = [];
	var folderTree;
	var accounts = appCtxt.accountList.visibleAccounts;
	for (var i = 0; i < accounts.length; i++) {
		var acct = accounts[i];

		var appEnabled = ZmApp.SETTING[ZmItem.APP[calItem.type]];
		if ((appCtxt.isOffline && acct.isMain) ||
			!appCtxt.get(appEnabled, null, acct))
		{
			continue;
		}

		folderTree = appCtxt.getFolderTree(acct);
		data = data.concat(folderTree.getByType(org));
	}

	// add the local account last for multi-account
	if (appCtxt.isOffline) {
		folderTree = appCtxt.getFolderTree(appCtxt.accountList.mainAccount);
		data = data.concat(folderTree.getByType(org));
	}

	folderSelect.clearOptions();
    
	for (var i = 0; i < data.length; i++) {
		var cal = data[i];
		var acct = cal.getAccount();

		if (cal.noSuchFolder || cal.isFeed() || (cal.link && cal.isReadOnly()) || cal.isInTrash()) { continue; }

		if (appCtxt.multiAccounts &&
			cal.nId == ZmOrganizer.ID_CALENDAR &&
			acct.isCalDavBased())
		{
			continue;
		}

        var id = cal.link ? cal.getRemoteId() : cal.id;
		calendarOrgs[id] = cal.owner;

		// bug: 28363 - owner attribute is not available for shared sub folders
		if (cal.isRemote() && !cal.owner && cal.parent && cal.parent.isRemote()) {
			calendarOrgs[id] = cal.parent.getOwner();
		}

		var selected = ((calItem.folderId == cal.id) || (calItem.folderId == id));
		var icon = appCtxt.multiAccounts ? acct.getIcon() : cal.getIconWithColor();
		var name = AjxStringUtil.htmlDecode(appCtxt.multiAccounts
			? ([cal.getName(), " (", acct.getDisplayName(), ")"].join(""))
			: cal.getName());
		var option = new DwtSelectOption(id, selected, name, null, null, icon);
		folderSelect.addOption(option, selected);
	}

    ZmApptViewHelper.folderSelectResize(folderSelect);
    //todo: new ui hide folder select if there is only one folder
};

/**
 * Takes a string, AjxEmailAddress, or contact/resource and returns
 * a ZmContact or a ZmResource. If the attendee cannot be found in
 * contacts, locations, or equipment, a new contact or
 * resource is created and initialized.
 *
 * @param item			[object]		string, AjxEmailAddress, ZmContact, or ZmResource
 * @param type			[constant]*		attendee type
 * @param strictText	[boolean]*		if true, new location will not be created from free text
 * @param strictEmail	[boolean]*		if true, new attendee will not be created from email address
 */
ZmApptViewHelper.getAttendeeFromItem =
function(item, type, strictText, strictEmail, checkForAvailability) {

	if (!item || !type) return null;

	if (type == ZmCalBaseItem.LOCATION && !ZmApptViewHelper._locations) {
		if (!appCtxt.get(ZmSetting.GAL_ENABLED)) {
			//if GAL is disabled then user does not have permission to load locations.
			return null;
		}
		var locations = ZmApptViewHelper._locations = appCtxt.getApp(ZmApp.CALENDAR).getLocations();
        if(!locations.isLoaded) {
            locations.load();
        }

	}
	if (type == ZmCalBaseItem.EQUIPMENT && !ZmApptViewHelper._equipment) {
		if (!appCtxt.get(ZmSetting.GAL_ENABLED)) {
			//if GAL is disabled then user does not have permission to load equipment.
			return null;
		}
		var equipment = ZmApptViewHelper._equipment = appCtxt.getApp(ZmApp.CALENDAR).getEquipment();
        if(!equipment.isLoaded) {
            equipment.load();
        }                
	}
	
	var attendee = null;
	if (item.type == ZmItem.CONTACT || item.type == ZmItem.GROUP || item.type == ZmItem.RESOURCE) {
		// it's already a contact or resource, return it as is
		attendee = item;
	} else if (item instanceof AjxEmailAddress) {
		var addr = item.getAddress();
		// see if we have this contact/resource by checking email address
		attendee = ZmApptViewHelper._getAttendeeFromAddr(addr, type);

		// Bug 7837: preserve the email address as it was typed
		//           instead of using the contact's primary email.
		if (attendee && (type === ZmCalBaseItem.PERSON || type === ZmCalBaseItem.GROUP)) {
			attendee = AjxUtil.createProxy(attendee);
			attendee._inviteAddress = addr;
			attendee.getEmail = function() {
				return this._inviteAddress || this.constructor.prototype.getEmail.apply(this);
			};
		}

		if (!checkForAvailability && !attendee && !strictEmail) {
			// AjxEmailAddress has name and email, init a new contact/resource from those
			if (type === ZmCalBaseItem.PERSON) {
				attendee = new ZmContact(null, null, ZmItem.CONTACT);
			}
			else if (type === ZmCalBaseItem.GROUP) {
				attendee = new ZmContact(null, null, ZmItem.GROUP);
			}
			else {
				attendee = new ZmResource(type);
			}
			attendee.initFromEmail(item, true);
		}
		attendee.canExpand = item.canExpand;
		var ac = window.parentAppCtxt || window.appCtxt;
		ac.setIsExpandableDL(addr, attendee.canExpand);
	} else if (typeof item == "string") {
		item = AjxStringUtil.trim(item);	// trim white space
		item = item.replace(/;$/, "");		// trim separator
		// see if it's an email we can use for lookup
	 	var email = AjxEmailAddress.parse(item);
	 	if (email) {
	 		var addr = email.getAddress();
	 		// is it a contact/resource we already know about?
			attendee = ZmApptViewHelper._getAttendeeFromAddr(addr, type);
			if (!checkForAvailability && !attendee && !strictEmail) {
				if (type === ZmCalBaseItem.PERSON || type === ZmCalBaseItem.FORWARD) {
					attendee = new ZmContact(null, null, ZmItem.CONTACT);
				}
				else if (type === ZmCalBaseItem.GROUP) {
					attendee = new ZmContact(null, null, ZmItem.GROUP);
				}
				else if (type === ZmCalBaseItem.LOCATION) {
					attendee = new ZmResource(null, ZmApptViewHelper._locations, ZmCalBaseItem.LOCATION);
				}
				else if (type === ZmCalBaseItem.EQUIPMENT) {
					attendee = new ZmResource(null, ZmApptViewHelper._equipment, ZmCalBaseItem.EQUIPMENT);
				}
				attendee.initFromEmail(email, true);
			} else if (attendee && (type === ZmCalBaseItem.PERSON || type === ZmCalBaseItem.GROUP)) {
				// remember actual address (in case it's email2 or email3)
				attendee._inviteAddress = addr;
                attendee.getEmail = function() {
				    return this._inviteAddress || this.constructor.prototype.getEmail.apply(this);
			    };
			}
		}
	}
	return attendee;
};

ZmApptViewHelper._getAttendeeFromAddr =
function(addr, type) {

	var attendee = null;
	if (type === ZmCalBaseItem.PERSON || type === ZmCalBaseItem.GROUP || type === ZmCalBaseItem.FORWARD) {
		var contactsApp = appCtxt.getApp(ZmApp.CONTACTS);
		attendee = contactsApp && contactsApp.getContactByEmail(addr);
	} else if (type == ZmCalBaseItem.LOCATION) {
        attendee = ZmApptViewHelper._locations.getResourceByEmail(addr);
	} else if (type == ZmCalBaseItem.EQUIPMENT) {
		attendee = ZmApptViewHelper._equipment.getResourceByEmail(addr);
	}
	return attendee;
};

/**
 * Returns a AjxEmailAddress for the organizer.
 *
 * @param organizer	[string]*		organizer's email address
 * @param account	[ZmAccount]*	organizer's account
 */
ZmApptViewHelper.getOrganizerEmail =
function(organizer, account) {
	var orgAddress = organizer ? organizer : appCtxt.get(ZmSetting.USERNAME, null, account);
	var orgName = (orgAddress == appCtxt.get(ZmSetting.USERNAME, null, account))
		? appCtxt.get(ZmSetting.DISPLAY_NAME, null, account) : null;
	return new AjxEmailAddress(orgAddress, null, orgName);
};

ZmApptViewHelper.getAddressEmail =
function(email, isIdentity) {
	var orgAddress = email ? email : appCtxt.get(ZmSetting.USERNAME);
	var orgName;
    if(email == appCtxt.get(ZmSetting.USERNAME)){
        orgName = appCtxt.get(ZmSetting.DISPLAY_NAME);
    }else{
        //Identity
        var iCol = appCtxt.getIdentityCollection(),
            identity = iCol ? iCol.getIdentityBySendAddress(orgAddress) : "";
        if(identity){
            orgName = identity.sendFromDisplay;
        }
    }
    return new AjxEmailAddress(orgAddress, null, orgName);    
};

/**
* Creates a string from a list of attendees/locations/resources. If an item
* doesn't have a name, its address is used.
*
* @param list					[array]			list of attendees (ZmContact or ZmResource)
* @param type					[constant]		attendee type
* @param includeDisplayName		[boolean]*		if true, include location info in parens (ZmResource)
* @param includeRole		    [boolean]*		if true, include attendee role
*/
ZmApptViewHelper.getAttendeesString = 
function(list, type, includeDisplayName, includeRole) {
	if (!(list && list.length)) return "";

	var a = [];
	for (var i = 0; i < list.length; i++) {
		var attendee = list[i];
		var text = ZmApptViewHelper.getAttendeesText(attendee, type);
		if (includeDisplayName && list.length == 1) {
			var displayName = attendee.getAttr(ZmResource.F_locationName);
			if (displayName) {
				text = [text, " (", displayName, ")"].join("");
			}
		}
        if(includeRole) {
            text += " " + (attendee.getParticipantRole() || ZmCalItem.ROLE_REQUIRED);
        }
		a.push(text);
	}

	return a.join(ZmAppt.ATTENDEES_SEPARATOR);
};

ZmApptViewHelper.getAttendeesText =
function(attendee, type, shortForm) {

    //give preference to lookup email is the attendee object is located by looking up email address
    var lookupEmailObj = attendee.getLookupEmail(true);
    if(lookupEmailObj) {
		return lookupEmailObj.toString(shortForm || (type && type !== ZmCalBaseItem.PERSON && type !== ZmCalBaseItem.GROUP));
	}

    return attendee.getAttendeeText(type, shortForm);
};

/**
* Creates a string of attendees by role. If an item
* doesn't have a name, its address is used.
*
* calls common code from mail msg view to get the collapse/expand "show more" funcitonality for large lists.
*
* @param list					[array]			list of attendees (ZmContact or ZmResource)
* @param type					[constant]		attendee type
* @param role      		        [constant]      attendee role
* @param count                  [number]        number of attendees to be returned
*/
ZmApptViewHelper.getAttendeesByRoleCollapsed =
function(list, type, role, objectManager, htmlElId) {
    if (!(list && list.length)) return "";
	var attendees = ZmApptViewHelper.getAttendeesArrayByRole(list, role);

	var emails = [];
	for (var i = 0; i < attendees.length; i++) {
		var att = attendees[i];
		emails.push(new AjxEmailAddress(att.getEmail(), type, att.getFullName(), att.getFullName()));
	}

	var options = {};
	options.shortAddress = appCtxt.get(ZmSetting.SHORT_ADDRESS);
	var addressInfo = ZmMailMsgView.getAddressesFieldHtmlHelper(emails, options,
		role, objectManager, htmlElId);
	return addressInfo.html;
};

/**
* Creates a string of attendees by role. this allows to show only count elements, with "..." appended.
*
* @param list					[array]			list of attendees (ZmContact or ZmResource)
* @param type					[constant]		attendee type
* @param role      		        [constant]      attendee role
* @param count                  [number]        number of attendees to be returned
*/
ZmApptViewHelper.getAttendeesByRole =
function(list, type, role, count) {
    if (!(list && list.length)) return "";

	var res = [];

	var attendees = ZmApptViewHelper.getAttendeesArrayByRole(list, role);
	for (var i = 0; i < attendees.length; i++) {
		if (count && i > count) {
			res.push(" ...");
			break;
		}
		if (i > 0) {
			res.push(ZmAppt.ATTENDEES_SEPARATOR);
		}
		res.push(attendees[i].getAttendeeText(type));
	}
	return res.join("");
};



/**
* returns array of attendees by role.
*
* @param list					[array]			list of attendees (ZmContact or ZmResource)
* @param role      		        [constant]      attendee role
*/
ZmApptViewHelper.getAttendeesArrayByRole =
function(list, role, count) {

    if (!(list && list.length)) {
	    return [];
    }

    var a = [];
    for (var i = 0; i < list.length; i++) {
        var attendee = list[i];
        var attendeeRole = attendee.getParticipantRole() || ZmCalItem.ROLE_REQUIRED;
        if (attendeeRole === role){
            a.push(attendee);
        }
    }
	return a;
};

ZmApptViewHelper._allDayItemHtml =
function(appt, id, controller, first, last) {
	var isNew = appt.ptst == ZmCalBaseItem.PSTATUS_NEEDS_ACTION;
	var isAccepted = appt.ptst == ZmCalBaseItem.PSTATUS_ACCEPT;
	var calendar = appt.getFolder();
    AjxDispatcher.require(["MailCore", "CalendarCore", "Calendar"]);

    var tagNames  = appt.getVisibleTags();
    var tagIcon = last ? appt.getTagImageFromNames(tagNames) : null;

    var fba = isNew ? ZmCalBaseItem.PSTATUS_NEEDS_ACTION : appt.fba;
    var headerColors = ZmApptViewHelper.getApptColor(isNew, calendar, tagNames, "header");
    var headerStyle  = ZmCalBaseView._toColorsCss(headerColors.appt);
    var bodyColors   = ZmApptViewHelper.getApptColor(isNew, calendar, tagNames, "body");
    var bodyStyle    = ZmCalBaseView._toColorsCss(bodyColors.appt);

    var borderLeft  = first ? "" : "border-left:0;";
    var borderRight = last  ? "" : "border-right:0;";

    var newState = isNew ? "_new" : "";
	var subs = {
		id:           id,
		headerStyle:  headerStyle,
		bodyStyle:    bodyStyle,
		newState:     newState,
		name:         first ? AjxStringUtil.htmlEncode(appt.getName()) : "&nbsp;",
//		tag: isNew ? "NEW" : "",		//  HACK: i18n
		starttime:    appt.getDurationText(true, true),
		endtime:      (!appt._fanoutLast && (appt._fanoutFirst || (appt._fanoutNum > 0))) ? "" : ZmCalBaseItem._getTTHour(appt.endDate),
		location:     AjxStringUtil.htmlEncode(appt.getLocation()),
		status:       appt.isOrganizer() ? "" : appt.getParticipantStatusStr(),
		icon:         first && appt.isPrivate() ? "ReadOnly" : null,
        showAsColor:  first ? ZmApptViewHelper._getShowAsColorFromId(fba) : "",
        showAsClass:  first ? "" : "appt_allday" + newState + "_name",
        boxBorder:    ZmApptViewHelper.getBoxBorderFromId(fba),
        borderLeft:   borderLeft,
        borderRight:  borderRight,
        tagIcon:      tagIcon
	};
    ZmApptViewHelper.setupCalendarColor(last, headerColors, tagNames, subs, "headerStyle", null, 1, 1);
    return AjxTemplate.expand("calendar.Calendar#calendar_appt_allday", subs);
};

ZmApptViewHelper._getShowAsColorFromId =
function(id) {
    var color = "#4AA6F1";
	switch(id) {
        case ZmCalBaseItem.PSTATUS_NEEDS_ACTION: color = "#FF3300"; break;
		case "F": color = "#FFFFFF"; break;
		case "B": color = "#4AA6F1"; break;
		case "T": color = "#BAE0E3"; break;
		case "O": color = "#7B5BAC"; break;
	}
    var colorCss = Dwt.createLinearGradientCss("#FFFFFF", color, "v");
    if (!colorCss) {
        colorCss = "background-color: " + color + ";";
    }
    return colorCss;
};

ZmApptViewHelper.getBoxBorderFromId =
function(id) {
	switch(id) {
		case "F": return "ZmSchedulerApptBorder-free";
        case ZmCalBaseItem.PSTATUS_NEEDS_ACTION:
		case "B": return "ZmSchedulerApptBorder-busy";
		case "T": return "ZmSchedulerApptBorder-tentative";
		case "O": return "ZmSchedulerApptBorder-outOfOffice";
	}
	return "ZmSchedulerApptBorder-busy";
};

/**
 * Returns a list of attendees with the given role.
 *
 * @param	{array}		list		list of attendees
 * @param	{constant}	role		defines the role of the attendee (required/optional)
 *
 * @return	{array}	a list of attendees
 */
ZmApptViewHelper.filterAttendeesByRole =
function(list, role) {

	var result = [];
	for (var i = 0; i < list.length; i++) {
		var attendee = list[i];
		var attRole = attendee.getParticipantRole() || ZmCalItem.ROLE_REQUIRED;
		if (attRole == role){
			result.push(attendee);
		}
	}
	return result;
};

ZmApptViewHelper.getApptColor =
function(deeper, calendar, tagNames, segment) {
    var colors = ZmCalBaseView._getColors(calendar.rgb || ZmOrganizer.COLOR_VALUES[calendar.color]);
    var calColor = deeper ? colors.deeper[segment] : colors.standard[segment];
    var apptColor = calColor;
    if (tagNames && (tagNames.length == 1)) {
		var tagList = appCtxt.getAccountTagList(calendar);

        var tag = tagList.getByNameOrRemote(tagNames[0]);
        if(tag){apptColor = { bgcolor: tag.getColor() };}
    }
    return {calendar:calColor, appt:apptColor};
};

ZmApptViewHelper.setupCalendarColor =
function(last, colors, tagNames, templateData, colorParam, clearParam, peelTopOffset, peelRightOffset, div) {
    var colorCss = Dwt.createLinearGradientCss("#FFFFFF", colors.appt.bgcolor, "v");
    if (colorCss) {
        templateData[colorParam] = colorCss;
        if (clearParam) {
            templateData[clearParam] = null;
        }
    }
    if (last && tagNames && (tagNames.length == 1)) {
        if (!colorCss) {
            // Can't use the gradient color.  IE masking doesn't work properly for tags on appts;
            // Since the color is already set in the background, just print the overlay image
            var match = templateData.tagIcon.match(AjxImg.RE_COLOR);
            if (match) {
                templateData.tagIcon = (match && match[1]) + "Overlay";
            }
        }
        // Tag color has been applied to the appt.  Add the calendar peel image
        templateData.peelIcon  = "Peel,color=" + colors.calendar.bgcolor;
        templateData.peelTop   = peelTopOffset;
        templateData.peelRight = peelRightOffset;
    }
};

/**
 * Gets the attach list as HTML.
 * 
 * @param {ZmCalItem}	calItem			calendar item
 * @param {Object}		attach			a generic Object contain meta info about the attachment
 * @param {Boolean}		hasCheckbox		<code>true</code> to insert a checkbox prior to the attachment
 * @return	{String}	the HTML
 * 
 * TODO: replace string onclick handlers with funcs
 */
ZmApptViewHelper.getAttachListHtml =
function(calItem, attach, hasCheckbox, getLinkIdCallback) {
	var msgFetchUrl = appCtxt.get(ZmSetting.CSFE_MSG_FETCHER_URI);

	// gather meta data for this attachment
	var mimeInfo = ZmMimeTable.getInfo(attach.ct);
	var icon = mimeInfo ? mimeInfo.image : "GenericDoc";
	var size = attach.s;
	var sizeText;
	if (size != null) {
		if (size < 1024)		sizeText = size + " B";
		else if (size < 1024^2)	sizeText = Math.round((size/1024) * 10) / 10 + " KB";
		else 					sizeText = Math.round((size / (1024*1024)) * 10) / 10 + " MB";
	}

	var html = [];
	var i = 0;

	// start building html for this attachment
	html[i++] = "<table border=0 cellpadding=0 cellspacing=0><tr>";
	if (hasCheckbox) {
		html[i++] = "<td width=1%><input type='checkbox' checked value='";
		html[i++] = attach.part;
		html[i++] = "' name='";
		html[i++] = ZmCalItem.ATTACHMENT_CHECKBOX_NAME;
		html[i++] = "'></td>";
	}

	var hrefRoot = ["href='", msgFetchUrl, "&id=", calItem.invId, "&amp;part=", attach.part].join("");
	html[i++] = "<td width=20><a target='_blank' class='AttLink' ";
	if (getLinkIdCallback) {
		var imageLinkId = getLinkIdCallback(attach.part, ZmCalItem.ATT_LINK_IMAGE);
		html[i++] = "id='";
		html[i++] = imageLinkId;
		html[i++] = "' ";
	}
	html[i++] = hrefRoot;
	html[i++] = "'>";
	html[i++] = AjxImg.getImageHtml(icon);

	html[i++] = "</a></td><td><a target='_blank' class='AttLink' ";

	if (appCtxt.get(ZmSetting.MAIL_ENABLED) && attach.ct == ZmMimeTable.MSG_RFC822) {
		html[i++] = " href='javascript:;' onclick='ZmCalItemView.rfc822Callback(";
		html[i++] = '"';
		html[i++] = calItem.invId;
		html[i++] = '"';
		html[i++] = ",\"";
		html[i++] = attach.part;
		html[i++] = "\"); return false;'";
	} else {
		html[i++] = hrefRoot;
		html[i++] = "'";
	}
	if (getLinkIdCallback) {
		var mainLinkId = getLinkIdCallback(attach.part, ZmCalItem.ATT_LINK_MAIN);
		html[i++] = " id='";
		html[i++] = mainLinkId;
		html[i++] = "'";
	}
	html[i++] = ">";
	html[i++] = AjxStringUtil.htmlEncode(attach.filename);
	html[i++] = "</a>";

	var addHtmlLink = (appCtxt.get(ZmSetting.VIEW_ATTACHMENT_AS_HTML) &&
					   attach.body == null && ZmMimeTable.hasHtmlVersion(attach.ct));

	if (sizeText || addHtmlLink) {
		html[i++] = "&nbsp;(";
		if (sizeText) {
			html[i++] = sizeText;
			html[i++] = ") ";
		}
		var downloadLinkId = "";
		if (getLinkIdCallback) {
			downloadLinkId = getLinkIdCallback(attach.part, ZmCalItem.ATT_LINK_DOWNLOAD);
		}
		if (addHtmlLink) {
			html[i++] = "<a style='text-decoration:underline' target='_blank' class='AttLink' ";
			if (getLinkIdCallback) {
				html[i++] = "id='";
				html[i++] = downloadLinkId;
				html[i++] = "' ";
			}
			html[i++] = hrefRoot;
			html[i++] = "&view=html'>";
			html[i++] = ZmMsg.preview;
			html[i++] = "</a>&nbsp;";
		}
		if (attach.ct != ZmMimeTable.MSG_RFC822) {
			html[i++] = "<a style='text-decoration:underline' class='AttLink' onclick='ZmZimbraMail.unloadHackCallback();' ";
			if (getLinkIdCallback) {
				html[i++] = " id='";
				html[i++] = downloadLinkId;
				html[i++] = "' ";
			}
			html[i++] = hrefRoot;
			html[i++] = "&disp=a'>";
			html[i++] = ZmMsg.download;
			html[i++] = "</a>";
		}
	}

	html[i++] = "</td></tr></table>";

	// Provide lookup id and label for offline mode
	if (!attach.mid) {
		attach.mid = calItem.invId;
		attach.label = attach.filename;
	}

	return html.join("");
};

/**
 * @param {DwtSelect} folderSelect
 *
 * TODO: set the width for folderSelect once the image icon gets loaded if any
 */
ZmApptViewHelper.folderSelectResize =
function(folderSelect) {

    var divEl = folderSelect._containerEl,
        childNodes,
        img;

    if (divEl) {
        childNodes = divEl.childNodes[0];
        if (childNodes) {
            img = childNodes.getElementsByTagName("img")[0];
            if (img) {
                img.onload = function() {
                    divEl.style.width = childNodes.offsetWidth || "auto";// offsetWidth doesn't work in IE if the element or one of its parents has display:none
                    img.onload = "";
                }
            }
        }
    }
};
}
if (AjxPackage.define("zimbraMail.calendar.controller.ZmCalItemComposeController")) {

/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a new appointment controller to manage appointment creation/editing.
 * @constructor
 * @class
 * This class manages appointment creation/editing.
 *
 * @author Parag Shah
 *
 * @param {DwtShell}	container	the containing shell
 * @param {ZmApp}		app			the containing app
 * @param {constant}	type		controller type
 * @param {string}		sessionId	the session id
 * 
 * @extends		ZmBaseController
 */
ZmCalItemComposeController = function(container, app, type, sessionId) {
	if (arguments.length == 0) { return; }
	ZmBaseController.apply(this, arguments);
	this._elementsToHide = ZmAppViewMgr.LEFT_NAV;

	this._onAuthTokenWarningListener = this._onAuthTokenWarningListener.bind(this);
	appCtxt.addAuthTokenWarningListener(this._onAuthTokenWarningListener);
};

ZmCalItemComposeController.prototype = new ZmBaseController;
ZmCalItemComposeController.prototype.constructor = ZmCalItemComposeController;

ZmCalItemComposeController.prototype.isZmCalItemComposeController = true;
ZmCalItemComposeController.prototype.toString = function() { return "ZmCalItemComposeController"; };

ZmCalItemComposeController.DEFAULT_TAB_TEXT = ZmMsg.appointment;

ZmCalItemComposeController.SAVE_CLOSE 	= "SAVE_CLOSE";
ZmCalItemComposeController.SEND 		= "SEND";
ZmCalItemComposeController.SAVE  		= "SAVE";
ZmCalItemComposeController.APPT_MODE  	= "APPT";
ZmCalItemComposeController.MEETING_MODE	= "MEETING";

// Public methods

ZmCalItemComposeController.prototype.show =
function(calItem, mode, isDirty) {

    this._mode = mode;
	if (this._toolbar.toString() != "ZmButtonToolBar") {
		this._createToolBar();
	}
	var initial = this.initComposeView();
	this._app.pushView(this._currentViewId);
	this._composeView.set(calItem, mode, isDirty);
	this._composeView.reEnableDesignMode();
    this._initToolbar(mode);
	if (initial) {
		this._setComposeTabGroup();
	}
};

ZmCalItemComposeController.prototype._preHideCallback =
function(view, force) {

	ZmController.prototype._preHideCallback.call(this);
	return force ? true : this.popShield();
};

ZmCalItemComposeController.prototype._preUnloadCallback =
function(view) {
	return !this._composeView.isDirty();
};


ZmCalItemComposeController.prototype._preShowCallback =
function() {
	return true;
};

ZmCalItemComposeController.prototype._postShowCallback =
function(view, force) {
	var ta = new AjxTimedAction(this, this._setFocus);
	AjxTimedAction.scheduleAction(ta, 10);
};

ZmCalItemComposeController.prototype._postHideCallback =
function() {
	// overload me
};

ZmCalItemComposeController.prototype.popShield =
function() {
	if (!this._composeView.isDirty()) {
		this._composeView.cleanup();
		return true;
	}

	var ps = this._popShield = appCtxt.getYesNoCancelMsgDialog();
	ps.reset();
	ps.setMessage(ZmMsg.askToSave, DwtMessageDialog.WARNING_STYLE);
	ps.registerCallback(DwtDialog.YES_BUTTON, this._popShieldYesCallback, this);
	ps.registerCallback(DwtDialog.NO_BUTTON, this._popShieldNoCallback, this);
	ps.popup(this._composeView._getDialogXY());

	return false;
};

ZmCalItemComposeController.prototype._onAuthTokenWarningListener =
function() {
	// The auth token will expire in less than five minutes, so we must issue
	// issue a last, hard save. This method is typically called more than once.
	try {
		if (this._composeView && this._composeView.isDirty()) {
			// bypass most of the validity checking logic
			var calItem = this._composeView.getCalItem();
			return this._saveCalItemFoRealz(calItem, null, null, true);
		}
	} catch(ex) {
		var msg = AjxUtil.isString(ex) ?
			AjxMessageFormat.format(ZmMsg.errorSavingWithMessage, errorMsg) :
			ZmMsg.errorSaving;

		appCtxt.setStatusMsg(msg, ZmStatusView.LEVEL_CRITICAL);
	}
};

/**
 * Gets the appt view.
 * 
 * @return	{ZmApptView}	the appt view
 */
ZmCalItemComposeController.prototype.getItemView = function() {
	return this._composeView;
};

/**
 * Gets the toolbar.
 *
 * @return	{ZmButtonToolBar}	the toolbar
 */
ZmCalItemComposeController.prototype.getToolbar =
function() {
	return this._toolbar;
};

/**
 * Saves the calendar item.
 * 
 * @param	{String}	attId		the item id
 */
ZmCalItemComposeController.prototype.saveCalItem =
function(attId) {
	// override
};

/**
 * Toggles the spell check button.
 * 
 * @param	{Boolean}	toggled		if <code>true</code>, select the spell check button 
 */
ZmCalItemComposeController.prototype.toggleSpellCheckButton =
function(toggled) {
	var spellCheckButton = this._toolbar.getButton(ZmOperation.SPELL_CHECK);
	if (spellCheckButton) {
		spellCheckButton.setSelected((toggled || false));
	}
};

ZmCalItemComposeController.prototype.initComposeView =
function(initHide) {
	if (!this._composeView) {
		this._composeView = this._createComposeView();
		var callbacks = {};
		callbacks[ZmAppViewMgr.CB_PRE_HIDE] = new AjxCallback(this, this._preHideCallback);
		callbacks[ZmAppViewMgr.CB_PRE_UNLOAD] = new AjxCallback(this, this._preUnloadCallback);
		callbacks[ZmAppViewMgr.CB_POST_SHOW] = new AjxCallback(this, this._postShowCallback);
		callbacks[ZmAppViewMgr.CB_PRE_SHOW] = new AjxCallback(this, this._preShowCallback);
		callbacks[ZmAppViewMgr.CB_POST_HIDE] = new AjxCallback(this, this._postHideCallback);
		if (this._toolbar.toString() != "ZmButtonToolBar")
			this._createToolBar();
		var elements = this.getViewElements(null, this._composeView, this._toolbar);

		this._app.createView({	viewId:		this._currentViewId,
								viewType:	this._currentViewType,
								elements:	elements,
								hide:		this._elementsToHide,
								controller:	this,
								callbacks:	callbacks,
								tabParams:	this._getTabParams()});
		if (initHide) {
			this._composeView.preload();
		}
		return true;
	}
	return false;
};

ZmCalItemComposeController.prototype._getTabParams =
function() {
	return {id:this.tabId, image:"CloseGray", hoverImage:"Close", text:ZmCalItemComposeController.DEFAULT_TAB_TEXT, textPrecedence:76,
			tooltip:ZmCalItemComposeController.DEFAULT_TAB_TEXT, style: DwtLabel.IMAGE_RIGHT};
};

ZmCalItemComposeController.prototype._createComposeView =
function() {
	// override
};

ZmCalItemComposeController.prototype._setComposeTabGroup =
function(setFocus) {
	// override
};

ZmCalItemComposeController.prototype._setFocus =
function(focusItem, noFocus) {
	DBG.println(AjxDebug.KEYBOARD, "timed action restoring focus to " + focusItem + "; noFocus = " + noFocus);
	this._restoreFocus(focusItem, noFocus);
};

ZmCalItemComposeController.prototype.getKeyMapName =
function() {
	// override
};

ZmCalItemComposeController.prototype.handleKeyAction =
function(actionCode) {
	DBG.println(AjxDebug.DBG2, "ZmCalItemComposeController.handleKeyAction");
	switch (actionCode) {
		case ZmKeyMap.SAVE:
			this._saveListener();
			break;

		case ZmKeyMap.CANCEL:
			this._cancelListener();
			break;


		case ZmKeyMap.HTML_FORMAT:
			if (appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED)) {
				var mode = this._composeView.getComposeMode();
				var newMode = (mode == Dwt.TEXT) ? Dwt.HTML : Dwt.TEXT;
				this._formatListener(null, newMode);
				// reset the radio button for the format button menu
				var formatBtn = this._toolbar.getButton(ZmOperation.COMPOSE_OPTIONS);
				if (formatBtn) {
					formatBtn.getMenu().checkItem(ZmHtmlEditor.VALUE, newMode, true);
				}
			}
			break;

		default:
			return ZmController.prototype.handleKeyAction.call(this, actionCode);
			break;
	}
	return true;
};

ZmCalItemComposeController.prototype.mapSupported =
function(map) {
	return (map == "editor");
};

ZmCalItemComposeController.prototype.getTabView =
function() {
	return this._composeView;
};

/**
 * inits check mark for menu item depending on compose mode preference.
 * 
 * @private
 */
ZmCalItemComposeController.prototype.setFormatBtnItem =
function(skipNotify, composeMode) {
	var mode;
	if (composeMode) {
		mode = composeMode;
	} else {
		var bComposeEnabled = appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED);
		var composeFormat = appCtxt.get(ZmSetting.COMPOSE_AS_FORMAT);
		mode = (bComposeEnabled && composeFormat == ZmSetting.COMPOSE_HTML)
			? Dwt.HTML : Dwt.TEXT;
	}

	var formatBtn = this._toolbar.getButton(ZmOperation.COMPOSE_OPTIONS);
	if (formatBtn) {
        var menu = formatBtn.getMenu ? formatBtn.getMenu() : null;
        if(menu) {
		    menu.checkItem(ZmHtmlEditor.VALUE, mode, skipNotify);
        }
	}
};

ZmCalItemComposeController.prototype.setOptionsBtnItem =
function(skipNotify, composeMode) {
	var mode;
	if (composeMode) {
		mode = composeMode;
	} else {
		var bComposeEnabled = appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED);
		var composeFormat = appCtxt.get(ZmSetting.COMPOSE_AS_FORMAT);
		mode = (bComposeEnabled && composeFormat == ZmSetting.COMPOSE_HTML)
			? Dwt.HTML : Dwt.TEXT;
	}

	var formatBtn = this._toolbar.getButton(ZmOperation.COMPOSE_OPTIONS);
	if (formatBtn) {
		formatBtn.getMenu().checkItem(ZmHtmlEditor.VALUE, mode, skipNotify);
	}
};

// Private / Protected methods


ZmCalItemComposeController.prototype._initToolbar =
function(mode) {
	if (this._toolbar.toString() != "ZmButtonToolBar") {
		this._createToolBar();
	}

    this.enableToolbar(true);

	var isNew = (mode == null || mode == ZmCalItem.MODE_NEW || mode == ZmCalItem.MODE_NEW_FROM_QUICKADD);

	var cancelButton = this._toolbar.getButton(ZmOperation.CANCEL);
	if (isNew) {
		cancelButton.setText(ZmMsg.cancel);
	} else {
		cancelButton.setText(ZmMsg.close);
	}

    var saveButton = this._toolbar.getButton(ZmOperation.SAVE);
    //use send button for forward appt view
    if(ZmCalItem.FORWARD_MAPPING[mode]) {
        saveButton.setText(ZmMsg.send);
    }

	var printButton = this._toolbar.getButton(ZmOperation.PRINT);
	if (printButton) {
		printButton.setEnabled(!isNew);
	}

	appCtxt.notifyZimlets("initializeToolbar", [this._app, this._toolbar, this, this._currentViewId], {waitUntilLoaded:true});
};


ZmCalItemComposeController.prototype._createToolBar =
function() {

	var buttons = [ZmOperation.SEND_INVITE, ZmOperation.SAVE, ZmOperation.CANCEL, ZmOperation.SEP];

	if (appCtxt.get(ZmSetting.ATTACHMENT_ENABLED)) {
		buttons.push(ZmOperation.ATTACHMENT);
	}

    if (appCtxt.get(ZmSetting.PRINT_ENABLED)) {
		buttons.push(ZmOperation.PRINT);
	}

	if (appCtxt.isSpellCheckerAvailable()) {
		buttons.push(ZmOperation.SPELL_CHECK);
	}
	buttons.push(ZmOperation.SEP, ZmOperation.COMPOSE_OPTIONS);

	this._toolbar = new ZmButtonToolBar({
		parent:     this._container,
		buttons:    buttons,
		overrides:  this._getButtonOverrides(buttons),
		context:    this._currentViewId,
		controller: this
	});
	this._toolbar.addSelectionListener(ZmOperation.SAVE, new AjxListener(this, this._saveListener));
	this._toolbar.addSelectionListener(ZmOperation.CANCEL, new AjxListener(this, this._cancelListener));

	if (appCtxt.get(ZmSetting.PRINT_ENABLED)) {
		this._toolbar.addSelectionListener(ZmOperation.PRINT, new AjxListener(this, this._printListener));
	}

	if (appCtxt.get(ZmSetting.ATTACHMENT_ENABLED)) {
		this._toolbar.addSelectionListener(ZmOperation.ATTACHMENT, new AjxListener(this, this._attachmentListener));
	}

    var sendButton = this._toolbar.getButton(ZmOperation.SEND_INVITE);
    sendButton.setVisible(false);

	// change default button style to toggle for spell check button
	var spellCheckButton = this._toolbar.getButton(ZmOperation.SPELL_CHECK);
	if (spellCheckButton) {
		spellCheckButton.setAlign(DwtLabel.IMAGE_LEFT | DwtButton.TOGGLE_STYLE);
	}

	var optionsButton = this._toolbar.getButton(ZmOperation.COMPOSE_OPTIONS);
	if (optionsButton) {
		optionsButton.setVisible(false); //start it hidden, and show in case it's needed.
	}

	if (optionsButton && appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED)) {
		optionsButton.setVisible(true); 

		var m = new DwtMenu({parent:optionsButton});
		optionsButton.setMenu(m);

		var mi = new DwtMenuItem({parent:m, style:DwtMenuItem.RADIO_STYLE, id:[ZmId.WIDGET_MENU_ITEM,this._currentViewId,ZmOperation.FORMAT_HTML].join("_")});
		mi.setImage("HtmlDoc");
		mi.setText(ZmMsg.formatAsHtml);
		mi.setData(ZmHtmlEditor.VALUE, Dwt.HTML);
        mi.addSelectionListener(new AjxListener(this, this._formatListener));

		mi = new DwtMenuItem({parent:m, style:DwtMenuItem.RADIO_STYLE, id:[ZmId.WIDGET_MENU_ITEM,this._currentViewId,ZmOperation.FORMAT_TEXT].join("_")});
		mi.setImage("GenericDoc");
		mi.setText(ZmMsg.formatAsText);
		mi.setData(ZmHtmlEditor.VALUE, Dwt.TEXT);
        mi.addSelectionListener(new AjxListener(this, this._formatListener));
	}

	this._toolbar.addSelectionListener(ZmOperation.SPELL_CHECK, new AjxListener(this, this._spellCheckListener));
};

ZmCalItemComposeController.prototype.showErrorMessage =
function(errorMsg) {
	var dialog = appCtxt.getMsgDialog();
    dialog.reset();
	//var msg = ZmMsg.errorSaving + (errorMsg ? (":<p>" + errorMsg) : ".");
	var msg = errorMsg ? AjxMessageFormat.format(ZmMsg.errorSavingWithMessage, errorMsg) : ZmMsg.errorSaving;
	dialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
	dialog.popup();
    this.enableToolbar(true);
};

ZmCalItemComposeController.prototype._saveCalItemFoRealz = function(calItem, attId, notifyList, force) {

    var recurringChanges = this._composeView.areRecurringChangesDirty();

	if (this._composeView.isDirty() || recurringChanges || force) {
		// bug: 16112 - check for folder existance
		if (calItem.getFolder() && calItem.getFolder().noSuchFolder) {
			var msg = AjxMessageFormat.format(ZmMsg.errorInvalidFolder, calItem.getFolder().name);
			this.showErrorMessage(msg);
			return false;
		}
        if(this._composeView.isReminderOnlyChanged()) {
            calItem.setMailNotificationOption(false);
        }
        var callback = new AjxCallback(this, this._handleResponseSave, calItem);
		var errorCallback = new AjxCallback(this, this._handleErrorSave, calItem);
        this._doSaveCalItem(calItem, attId, callback, errorCallback, notifyList);
	} else {
        if (this._action == ZmCalItemComposeController.SAVE && !this._composeView.isDirty()) {
            this.enableToolbar(true);
        }
        
        if (this.isCloseAction()){
            this._composeView.cleanup();  // bug: 27600 clean up edit view to avoid stagnant attendees
            this.closeView();
        }
	}
};

ZmCalItemComposeController.prototype._doSaveCalItem =
function(calItem, attId, callback, errorCallback, notifyList){
    if(this._action == ZmCalItemComposeController.SEND)
        calItem.send(attId, callback, errorCallback, notifyList);
    else
        calItem.save(attId, callback, errorCallback, notifyList);
};

ZmCalItemComposeController.prototype.isCloseAction =
function() {
    return ( this._action == ZmCalItemComposeController.SEND ||  this._action == ZmCalItemComposeController.SAVE_CLOSE );
};

ZmCalItemComposeController.prototype._handleResponseSave =
function(calItem, result) {
    try {
        if (calItem.__newFolderId) {
            var folder = appCtxt.getById(calItem.__newFolderId);
            calItem.__newFolderId = null;
            this._app.getListController()._doMove(calItem, folder, null, false);
        }

        calItem.handlePostSaveCallbacks();
        if(this.isCloseAction()) {
        	this.closeView();
        }
        appCtxt.notifyZimlets("onSaveApptSuccess", [this, calItem, result]);//notify Zimlets on success
    } catch (ex) {
        DBG.println(ex);
    } finally {
        this._composeView.cleanup();
    }
};

ZmCalItemComposeController.prototype._handleErrorSave =
function(calItem, ex) {
	var status = this._getErrorSaveStatus(calItem, ex);
	return status.handled;
};

ZmCalItemComposeController.prototype._getErrorSaveStatus =
function(calItem, ex) {
	// TODO: generalize error message for calItem instead of just Appt
	var status = calItem.processErrorSave(ex);
	status.handled = false;

    if (status.continueSave) {
        this.saveCalItemContinue(calItem);
        status.handled = true;
    } else {
        // Enable toolbar if not attempting to continue the Save
        this.enableToolbar(true);
        if (status.errorMessage) {
            // Handled the error, display the error message
            status.handled = true;
            var dialog = appCtxt.getMsgDialog();
            dialog.setMessage(status.errorMessage, DwtMessageDialog.CRITICAL_STYLE);
            dialog.popup();
        }
        appCtxt.notifyZimlets("onSaveApptFailure", [this, calItem, ex]);
    }

    return status;
};

// Spell check methods

ZmCalItemComposeController.prototype._spellCheckAgain =
function() {
	this._composeView.getHtmlEditor().discardMisspelledWords();
	this._doSpellCheck();
	return false;
};

ZmCalItemComposeController.prototype.enableToolbar =
function(enabled) {
    this._toolbar.enableAll(enabled);
};

// Listeners

// Save button was pressed
ZmCalItemComposeController.prototype._saveListener =
function(ev) {
    this._action = ZmCalItemComposeController.SAVE;
    this.enableToolbar(false);
	if (this._doSave() === false) {
		return;
    }
};

// Cancel button was pressed
ZmCalItemComposeController.prototype._cancelListener =
function(ev) {
	this._action = ZmCalItemComposeController.SAVE_CLOSE;
	this._app.popView();
};

ZmCalItemComposeController.prototype._printListener =
function() {
	// overload me.
};

// Attachment button was pressed
ZmCalItemComposeController.prototype._attachmentListener =
function(ev) {
	this._composeView.addAttachmentField();
};

ZmCalItemComposeController.prototype._formatListener =
function(ev, mode) {
	if (!mode && !(ev && ev.item.getChecked())) return;

	mode = mode || ev.item.getData(ZmHtmlEditor.VALUE);
	if (mode == this._composeView.getComposeMode()) return;

	if (mode == Dwt.TEXT) {
		// if formatting from html to text, confirm w/ user!
		if (!this._textModeOkCancel) {
			var dlgId = this._composeView.getHTMLElId() + "_formatWarning";
			this._textModeOkCancel = new DwtMessageDialog({id: dlgId, parent:this._shell, buttons:[DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON]});
			this._textModeOkCancel.setMessage(ZmMsg.switchToText, DwtMessageDialog.WARNING_STYLE);
			this._textModeOkCancel.registerCallback(DwtDialog.OK_BUTTON, this._textModeOkCallback, this);
			this._textModeOkCancel.registerCallback(DwtDialog.CANCEL_BUTTON, this._textModeCancelCallback, this);
		}
		this._textModeOkCancel.popup(this._composeView._getDialogXY());
	} else {
		this._composeView.setComposeMode(mode);
	}
};

ZmCalItemComposeController.prototype._spellCheckListener =
function(ev) {
	var spellCheckButton = this._toolbar.getButton(ZmOperation.SPELL_CHECK);
	var htmlEditor = this._composeView.getHtmlEditor();

	if (spellCheckButton.isToggled()) {
		var callback = new AjxCallback(this, this.toggleSpellCheckButton)
		if (!htmlEditor.spellCheck(callback))
			this.toggleSpellCheckButton(false);
	} else {
		htmlEditor.discardMisspelledWords();
	}
};

ZmCalItemComposeController.prototype._doSave =
function() {
	// check if all fields are populated w/ valid values
	try {
		if (this._composeView.isValid()) {
			return this.saveCalItem();
		}
	} catch(ex) {
		if (AjxUtil.isString(ex)) {
			this.showErrorMessage(ex);
		} else {
			DBG.dumpObj(AjxDebug.DBG1, ex);
		}

		return false;
	}
};


// Callbacks

ZmCalItemComposeController.prototype._doSpellCheck =
function() {
	var text = this._composeView.getHtmlEditor().getTextVersion();
	var soap = AjxSoapDoc.create("CheckSpellingRequest", "urn:zimbraMail");
	soap.getMethod().appendChild(soap.getDoc().createTextNode(text));
	var cmd = new ZmCsfeCommand();
	var callback = new AjxCallback(this, this._spellCheckCallback);
	cmd.invoke({soapDoc:soap, asyncMode:true, callback:callback});
};

ZmCalItemComposeController.prototype._popShieldYesCallback =
function() {
	this._popShield.popdown();
	this._action = ZmCalItemComposeController.SAVE_CLOSE;
	if (this._doSave()) {
		appCtxt.getAppViewMgr().showPendingView(true);
	}
};

ZmCalItemComposeController.prototype._popShieldNoCallback =
function() {
	this._popShield.popdown();
    this.enableToolbar(true);
	try {
		// bug fix #33001 - prism throws exception with this method:
		appCtxt.getAppViewMgr().showPendingView(true);
	} catch(ex) {
		// so do nothing
	} finally {
		// but make sure cleanup is *always* called
		this._composeView.cleanup();
	}
};

ZmCalItemComposeController.prototype._closeView =
function() {
	this._app.popView(true,this._currentViewId);
    this._composeView.cleanup();
};

ZmCalItemComposeController.prototype._textModeOkCallback =
function(ev) {
	this._textModeOkCancel.popdown();
	this._composeView.setComposeMode(Dwt.TEXT);
};

ZmCalItemComposeController.prototype._textModeCancelCallback =
function(ev) {
	this._textModeOkCancel.popdown();
	// reset the radio button for the format button menu
	var formatBtn = this._toolbar.getButton(ZmOperation.COMPOSE_OPTIONS);
	if (formatBtn) {
		formatBtn.getMenu().checkItem(ZmHtmlEditor.VALUE, Dwt.HTML, true);
	}
	this._composeView.reEnableDesignMode();
};
}
if (AjxPackage.define("zimbraMail.calendar.controller.ZmApptComposeController")) {
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a new appointment controller to manage appointment creation/editing.
 * @constructor
 * @class
 * This class manages appointment creation/editing.
 *
 * @author Parag Shah
 *
 * @param {DwtShell}	container	the containing shell
 * @param {ZmApp}		app			the containing app
 * @param {constant}	type		controller type
 * @param {string}		sessionId	the session id
 * 
 * @extends		ZmCalItemComposeController
 */
ZmApptComposeController = function(container, app, type, sessionId) {
    if (arguments.length == 0) { return; }

	ZmCalItemComposeController.apply(this, arguments);

	this._addedAttendees = [];
	this._removedAttendees = [];
	this._kbMgr = appCtxt.getKeyboardMgr();
};

ZmApptComposeController.prototype = new ZmCalItemComposeController;
ZmApptComposeController.prototype.constructor = ZmApptComposeController;

ZmApptComposeController.prototype.isZmApptComposeController = true;
ZmApptComposeController.prototype.toString = function() { return "ZmApptComposeController"; };

ZmApptComposeController._VALUE = "value";

ZmApptComposeController._DIALOG_OPTIONS = {
	SEND: 'SEND',
	CANCEL: 'CANCEL',
	DISCARD: 'DISCARD'
};

// Public methods

ZmApptComposeController.getDefaultViewType =
function() {
	return ZmId.VIEW_APPOINTMENT;
};
ZmApptComposeController.prototype.getDefaultViewType = ZmApptComposeController.getDefaultViewType;

ZmApptComposeController.prototype.show =
function(calItem, mode, isDirty) {
	ZmCalItemComposeController.prototype.show.call(this, calItem, mode, isDirty);

	this._addedAttendees.length = this._removedAttendees.length = 0;
	this._setComposeTabGroup();
};

/**
 * Forwards the calendar item.
 * 
 * @param	{ZmAppt}	appt		the appointment
 * @return	{Boolean}	<code>true</code> indicates the forward is executed
 */
ZmApptComposeController.prototype.forwardCalItem =
function(appt, forwardCallback) {
	// todo: to address input validation
	var callback = new AjxCallback(this, this._handleForwardInvite, forwardCallback);
	appt.forward(callback);
	return true;
};

/**
 * Propose new time for an appointment
 *
 * @param	{ZmAppt}	    appt		            the appointment
 * @param	{AjxCallback}	proposeTimeCallback		callback executed  after proposing time
 * @return	{Boolean}	    <code>true</code>       indicates that propose time is executed
 */
ZmApptComposeController.prototype.sendCounterAppointmentRequest =
function(appt, proposeTimeCallback) {
	var callback = new AjxCallback(this, this._handleCounterAppointmentRequest, proposeTimeCallback);
    var apptEditView = this._composeView ? this._composeView.getApptEditView() : null;
    var viewMode = apptEditView ? apptEditView.getMode() : null;
	appt.sendCounterAppointmentRequest(callback, null, viewMode);
	return true;
};

ZmApptComposeController.prototype._handleCounterAppointmentRequest =
function(proposeTimeCallback) {
	appCtxt.setStatusMsg(ZmMsg.newTimeProposed);
	if (proposeTimeCallback instanceof AjxCallback) {
		proposeTimeCallback.run();
	}
};

ZmApptComposeController.prototype._handleForwardInvite =
function(forwardCallback) {
	appCtxt.setStatusMsg(ZmMsg.forwardInviteSent);
	if (forwardCallback instanceof AjxCallback) {
		forwardCallback.run();
	}
};

ZmApptComposeController.prototype._badAddrsOkCallback =
function(dialog, appt) {
	dialog.popdown();
	this.forwardCalItem(appt, new AjxCallback(this, this._apptForwardCallback));
};

ZmApptComposeController.prototype._apptForwardCallback =
function() {
	this.closeView();
};

ZmApptComposeController.prototype._checkIsDirty =
function(type, attribs){
    return this._composeView.checkIsDirty(type, attribs)
};

ZmApptComposeController.prototype._getChangesDialog =
function(){
    var id,
        dlg,
        isOrganizer = this._composeView.isOrganizer();
    if(isOrganizer) {
        dlg = this._changesDialog;
        if (!dlg) {
			dlg = this._changesDialog = new DwtOptionDialog({
				parent: appCtxt.getShell(),
				id: Dwt.getNextId("CHNG_DLG_ORG_"),
				title: ZmMsg.apptSave,
				message: ZmMsg.apptSignificantChanges,
				options: [
					{
						name: ZmApptComposeController._DIALOG_OPTIONS.SEND,
						text: ZmMsg.apptSaveChanges
					},
					{
						name: ZmApptComposeController._DIALOG_OPTIONS.CANCEL,
						text: ZmMsg.apptSaveCancel
					},
					{
						name: ZmApptComposeController._DIALOG_OPTIONS.DISCARD,
						text: ZmMsg.apptSaveDiscard
					}
				]
			});
			dlg.registerCallback(DwtDialog.OK_BUTTON,
			                     this._changesDialogListener.bind(this));
        }
    }
    else {
        dlg = this._attendeeChangesDialog;
        if (!dlg) {
            dlg = this._attendeeChangesDialog = new DwtDialog({parent:appCtxt.getShell(), id:Dwt.getNextId("CHNG_DLG_ATTNDE_")});
            id = this._attendeeChangesDialogId = Dwt.getNextId();
            dlg.setContent(AjxTemplate.expand("calendar.Appointment#ChangesDialogAttendee", {id: id}));
            dlg.setTitle(ZmMsg.apptSave);
            dlg.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._attendeeChangesDialogListener, id));
        }
    }
    return dlg;
};

ZmApptComposeController.prototype._changesDialogListener =
function(){

    this.clearInvalidAttendees();
    delete this._invalidAttendees;

	switch (this._changesDialog.getSelection()) {
	case ZmApptComposeController._DIALOG_OPTIONS.SEND:
        this._sendListener();
		break;

	case ZmApptComposeController._DIALOG_OPTIONS.CANCEL:
		break;

	case ZmApptComposeController._DIALOG_OPTIONS.DISCARD:
        this.closeView();
		break;
	}

	this._changesDialog.popdown();
};

ZmApptComposeController.prototype._attendeeChangesDialogListener =
function(id){
    this.clearInvalidAttendees();
    delete this._invalidAttendees;
    this.closeView();
    this._attendeeChangesDialog.popdown();
};

ZmApptComposeController.prototype.saveCalItem =
function(attId) {
	this._composeView.cancelLocationRequest();
	var appt = this._composeView.getAppt(attId);
    var numRecurrence = this._composeView.getNumLocationConflictRecurrence ?
        this._composeView.getNumLocationConflictRecurrence() :
        ZmTimeSuggestionPrefDialog.DEFAULT_NUM_RECURRENCE;

	if (appt) {

		if (!appt.isValidDuration()) {
			this._composeView.showInvalidDurationMsg();
			this.enableToolbar(true);
			return false;
		}
		if (!appt.isValidDurationRecurrence()) {
			this._composeView.showInvalidDurationRecurrenceMsg();
			this.enableToolbar(true);
			return false;
		}

        if (appCtxt.get(ZmSetting.GROUP_CALENDAR_ENABLED)) {
            if (this._requestResponses)
            	appt.setRsvp(this._requestResponses.getChecked());
            appt.setMailNotificationOption(true);
        }

        if(appt.isProposeTime && !appt.isOrganizer()) {
            return this.sendCounterAppointmentRequest(appt);
        }

		if (appt.isForward) {
			var addrs = this._composeView.getForwardAddress();

			// validate empty forward address
			if (!addrs.gotAddress) {
				var msgDialog = appCtxt.getMsgDialog();
				msgDialog.setMessage(ZmMsg.noForwardAddresses, DwtMessageDialog.CRITICAL_STYLE);
				msgDialog.popup();
                this.enableToolbar(true);
				return false;
			}

			if (addrs[ZmApptEditView.BAD] && addrs[ZmApptEditView.BAD].size()) {
				var cd = appCtxt.getOkCancelMsgDialog();
				cd.reset();
				var bad = AjxStringUtil.htmlEncode(addrs[ZmApptEditView.BAD].toString(AjxEmailAddress.SEPARATOR));
				var msg = AjxMessageFormat.format(ZmMsg.compBadAddresses, bad);
				cd.setMessage(msg, DwtMessageDialog.WARNING_STYLE);
				cd.registerCallback(DwtDialog.OK_BUTTON, this._badAddrsOkCallback, this, [cd,appt]);
				cd.setVisible(true); // per fix for bug 3209
				cd.popup();
                this.enableToolbar(true);
				return false;
			}

            //attendee forwarding an appt
            /* if(!appt.isOrganizer()) */ return this.forwardCalItem(appt);
		}

		if (!this._attendeeValidated && this._invalidAttendees && this._invalidAttendees.length > 0) {
			var dlg = appCtxt.getYesNoMsgDialog();
			dlg.registerCallback(DwtDialog.YES_BUTTON, this._clearInvalidAttendeesCallback, this, [appt, attId, dlg]);
			var msg = "";
            if(this._action == ZmCalItemComposeController.SAVE){
               msg = AjxMessageFormat.format(ZmMsg.compSaveBadAttendees, AjxStringUtil.htmlEncode(this._invalidAttendees.join(",")));
            }
            else{
                msg = AjxMessageFormat.format(ZmMsg.compBadAttendees, AjxStringUtil.htmlEncode(this._invalidAttendees.join(",")));
            }
			dlg.setMessage(msg, DwtMessageDialog.WARNING_STYLE);
			dlg.popup();
            this.enableToolbar(true);
            this._attendeeValidated = true;
			return false;
		}

        //Validation Check for Significant / Insignificant / Local changes
        if(this._action == ZmCalItemComposeController.SAVE && !appt.inviteNeverSent){
            //Check for Significant Changes
            if(this._checkIsDirty(ZmApptEditView.CHANGES_SIGNIFICANT)){
                this._getChangesDialog().popup();
                this.enableToolbar(true);
                return false;
            }
        }

		var origAttendees = appt.origAttendees;						// bug fix #4160
		if (origAttendees && origAttendees.length > 0 && 			// make sure we're not u/l'ing a file
			attId == null) 											// make sure we are editing an existing appt w/ attendees
		{
			if (!appt.inviteNeverSent && !this._composeView.getApptEditView().isDirty(true)) {	// make sure other fields (besides attendees field) have not changed
				var attendees = appt.getAttendees(ZmCalBaseItem.PERSON);
				if (attendees.length > 0) {
					// check whether organizer has added/removed any attendees
					if (this._action == ZmCalItemComposeController.SEND && this._attendeesUpdated(appt, attId, attendees, origAttendees))
						return false;
				}
			}

			// check whether moving appt from local to remote folder with attendees
			var cc = AjxDispatcher.run("GetCalController");
			if (cc.isMovingBetwAccounts(appt, appt.__newFolderId)) {
				var dlg = appCtxt.getMsgDialog();
                dlg.setMessage(ZmMsg.orgChange, DwtMessageDialog.WARNING_STYLE);
                dlg.popup();
                this.enableToolbar(true);
                return false;
			}
		}

        var ret = this._initiateSaveWithChecks(appt, attId, numRecurrence);
		return ret;
	}

	return false;
};

ZmApptComposeController.prototype._initiateSaveWithChecks =
function(appt, attId, numRecurrence) {
    var resources = appt.getAttendees(ZmCalBaseItem.EQUIPMENT);
    var locations = appt.getAttendees(ZmCalBaseItem.LOCATION);
    var attendees = appt.getAttendees(ZmCalBaseItem.PERSON);

    var notifyList;

    var needsPermissionCheck = (attendees && attendees.length > 0) ||
                               (resources && resources.length > 0) ||
                               (locations && locations.length > 0);

    var needsConflictCheck = !appt.isForward &&
         ((resources && resources.length > 0) ||
         // If alteredLocations specified, it implies the user
         // has already examined and modified the location conflicts
         // that they want - so issue no further warnings.

         // NOTE: appt.alteredLocations is disabled (and hence undefined)
         //       for now.  It will be set once CreateAppt/ModifyAppt
         //       SOAP API changes are completed (Bug 56464)
          (!appt.alteredLocations && locations && locations.length > 0));

    if (needsConflictCheck) {
        this.checkConflicts(appt, numRecurrence, attId, notifyList);
        return false;
    } else if (needsPermissionCheck) {
        this.checkAttendeePermissions(appt, attId, notifyList);
        return false;
    } else {
        this._saveCalItemFoRealz(appt, attId, notifyList);
    }
    return true;
};

ZmApptComposeController.prototype.updateToolbarOps =
function(mode, appt) {

    var saveButton = this._toolbar.getButton(ZmOperation.SAVE);
    var sendButton = this._toolbar.getButton(ZmOperation.SEND_INVITE);

    if (mode == ZmCalItemComposeController.APPT_MODE) {
        saveButton.setText(ZmMsg.saveClose);
        saveButton.setVisible(true);
        sendButton.setVisible(false);
    } else {
        sendButton.setVisible(true);
        saveButton.setVisible(true);
        saveButton.setText(ZmMsg.save);

        //change cancel button's text/icon to close
        var cancelButton = this._toolbar.getButton(ZmOperation.CANCEL);
        cancelButton.setText(ZmMsg.close);
    }
	if (this._requestResponses) {
		this._requestResponses.setEnabled(mode !== ZmCalItemComposeController.APPT_MODE);
	}

    if ((this._mode == ZmCalItem.MODE_PROPOSE_TIME) || ZmCalItem.FORWARD_MAPPING[this._mode]) {
        sendButton.setVisible(true);
        saveButton.setVisible(false);
        // Enable the RequestResponse when Forwarding
		if (this._requestResponses) {
			this._requestResponses.setEnabled(this._mode !== ZmCalItem.MODE_PROPOSE_TIME);
		}
    }

};

ZmApptComposeController.prototype._initToolbar =
function(mode) {

    ZmCalItemComposeController.prototype._initToolbar.call(this, mode);

    //use send button for forward appt view
    //Switch Save Btn label n listeners 
    var saveButton = this._toolbar.getButton(ZmOperation.SAVE);
    saveButton.removeSelectionListeners();
    if(ZmCalItem.FORWARD_MAPPING[mode]) {
        saveButton.addSelectionListener(new AjxListener(this, this._sendBtnListener));
    }else {
        saveButton.addSelectionListener(new AjxListener(this, this._saveBtnListener));
    }

    var sendButton = this._toolbar.getButton(ZmOperation.SEND_INVITE);
    sendButton.removeSelectionListeners();
    sendButton.addSelectionListener(new AjxListener(this, this._sendBtnListener));

	var saveButton = this._toolbar.getButton(ZmOperation.SAVE);
	saveButton.setToolTipContent(ZmMsg.saveToCalendar);
	
    var btn = this._toolbar.getButton(ZmOperation.ATTACHMENT);
    if(btn)
        btn.setEnabled(!(this._mode == ZmCalItem.MODE_PROPOSE_TIME || ZmCalItem.FORWARD_MAPPING[mode]));
};

ZmApptComposeController.prototype._sendListener =
function(ev){

     var appt = this._composeView.getApptEditView()._calItem;

     if(!appt.inviteNeverSent){
        this._sendAfterExceptionCheck();
     }
     else{this._sendContinue();}

     return true;
};

ZmApptComposeController.prototype._sendAfterExceptionCheck =
function(){
     var appt = this._composeView.getApptEditView()._calItem;
     var isExceptionAllowed = appCtxt.get(ZmSetting.CAL_EXCEPTION_ON_SERIES_TIME_CHANGE);
     var isEditingSeries = (this._mode == ZmCalItem.MODE_EDIT_SERIES);
     var showWarning = appt.isRecurring() && appt.hasEx && isEditingSeries && appt.getAttendees(ZmCalBaseItem.PERSON) && !isExceptionAllowed && this._checkIsDirty(ZmApptEditView.CHANGES_TIME_RECURRENCE);
     if(showWarning){
          var dialog = appCtxt.getYesNoCancelMsgDialog();
		  dialog.setMessage(ZmMsg.recurrenceUpdateWarning, DwtMessageDialog.WARNING_STYLE);
          dialog.registerCallback(DwtDialog.YES_BUTTON, this._sendContinue, this,[dialog]);
          dialog.registerCallback(DwtDialog.NO_BUTTON, this._dontSend,this,[dialog]);
          dialog.getButton(DwtDialog.CANCEL_BUTTON).setText(ZmMsg.discard);
		  dialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._dontSendAndClose,this,[dialog]);
		  dialog.popup();
    }
    else{
        this._sendContinue();
    }
}

ZmApptComposeController.prototype._dontSend =
function(dialog){
    this._revertWarningDialog(dialog);
}

ZmApptComposeController.prototype._dontSendAndClose =
function(dialog){
this._revertWarningDialog(dialog);
this.closeView();
}

ZmApptComposeController.prototype._revertWarningDialog =
function(dialog){
    if(dialog){
        dialog.popdown();
        dialog.getButton(DwtDialog.CANCEL_BUTTON).setText(ZmMsg.cancel);
    }
}

ZmApptComposeController.prototype._sendContinue =
function(dialog){
    this._revertWarningDialog(dialog);
    this._action = ZmCalItemComposeController.SEND;
    this.enableToolbar(false);
	if (this._doSave() === false) {
		return;
    }
	this.closeView();
}

ZmApptComposeController.prototype.isSave =
function(){
    return (this._action == ZmCalItemComposeController.SAVE); 
};

ZmApptComposeController.prototype._saveBtnListener =
function(ev) {
    delete this._attendeeValidated;
    return this._saveListener(ev, true);
};

ZmApptComposeController.prototype._sendBtnListener =
function(ev) {
    delete this._attendeeValidated;
    return this._sendListener(ev);
};

ZmApptComposeController.prototype._saveListener =
function(ev, force) {
    var isMeeting = !this._composeView.isAttendeesEmpty();

    this._action = isMeeting ? ZmCalItemComposeController.SAVE : ZmCalItemComposeController.SAVE_CLOSE;

    //attendee should not have send/save option
    if(!this._composeView.isOrganizer()) {
        this._action = ZmCalItemComposeController.SAVE_CLOSE;
    }
    this.enableToolbar(false);

    var dlg = appCtxt.getOkCancelMsgDialog();
    if(dlg.isPoppedUp()){
        dlg.popdown();
    }

    if(!force && this._action == ZmCalItemComposeController.SAVE){
        var appt = this._composeView.getApptEditView()._calItem;
        var inviteNeverSent = (appt && appt.inviteNeverSent);
        var showDlg = true;
        if(appt.isDraft){
            showDlg = false;
        }
        if(showDlg && !inviteNeverSent && (this._checkIsDirty(ZmApptEditView.CHANGES_SIGNIFICANT)
                ||  this._checkIsDirty(ZmApptEditView.CHANGES_LOCAL))){
            showDlg = false;
        }
        if(showDlg){
            dlg.setMessage(ZmMsg.saveApptInfoMsg);
            dlg.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._saveListener, [ev, true]));
            dlg.popup();
            this.enableToolbar(true);
            return;
        }
    }

	if (this._doSave() === false) {
		return;
    }
};

ZmApptComposeController.prototype._createToolBar =
function() {

    ZmCalItemComposeController.prototype._createToolBar.call(this);

	var optionsButton = this._toolbar.getButton(ZmOperation.COMPOSE_OPTIONS);
	if (optionsButton){
        optionsButton.setVisible(true); //might be invisible if not ZmSetting.HTML_COMPOSE_ENABLED (see ZmCalItemComposeController._createToolBar)

        var m = optionsButton.getMenu();
        if (m) {
            var sepMi = new DwtMenuItem({parent:m, style:DwtMenuItem.SEPARATOR_STYLE});
        }
        else {
            m = new DwtMenu({parent:optionsButton});
            optionsButton.setMenu(m);
        }

        var mi = this._requestResponses = new DwtMenuItem({parent:m, style:DwtMenuItem.CHECK_STYLE});
        mi.setText(ZmMsg.requestResponses);
        mi.setChecked(true, true);

        sepMi = new DwtMenuItem({parent:m, style:DwtMenuItem.SEPARATOR_STYLE});
        mi = new DwtMenuItem({parent:m, style:DwtMenuItem.NO_STYLE});
        mi.setText(ZmMsg.suggestionPreferences);
        mi.addSelectionListener(this._prefListener.bind(this));
    }

	this._toolbar.addSelectionListener(ZmOperation.SPELL_CHECK, new AjxListener(this, this._spellCheckListener));
};

ZmApptComposeController.prototype._prefListener =
function(ev) {
    this._prefDialog = appCtxt.getSuggestionPreferenceDialog();
    this._prefDialog.popup(this.getCalendarAccount());
};

ZmApptComposeController.prototype.setRequestResponsesEnabled =
function(enabled) {
   if (this._requestResponses)
   this._requestResponses.setEnabled(enabled);
};

ZmApptComposeController.prototype.setRequestResponses =
function(requestResponses) {
   if (this._requestResponses)
   this._requestResponses.setChecked(requestResponses);
};

ZmApptComposeController.prototype.getRequestResponses =
function() {
    if (this._requestResponses)
    return this._requestResponses.getEnabled() ? this._requestResponses.getChecked() : true;
};

ZmApptComposeController.prototype.getNotifyList =
function(addrs) {
    var notifyList = [];
    for(var i = 0; i < addrs.length; i++) {
        notifyList.push(addrs[i]._inviteAddress || addrs[i].address || addrs[i].getEmail());
    }

    return notifyList;
}; 

ZmApptComposeController.prototype.isAttendeesEmpty =
function(appt) {
    var resources = appt.getAttendees(ZmCalBaseItem.EQUIPMENT);
	var locations = appt.getAttendees(ZmCalBaseItem.LOCATION);
	var attendees = appt.getAttendees(ZmCalBaseItem.PERSON);

	var isAttendeesNotEmpty = (attendees && attendees.length > 0) ||
							   (resources && resources.length > 0) ||
							   (locations && locations.length > 0);
    return !isAttendeesNotEmpty
};

ZmApptComposeController.prototype.checkConflicts =
function(appt, numRecurrence, attId, notifyList) {
	var resources = appt.getAttendees(ZmCalBaseItem.EQUIPMENT);
	var locations = appt.getAttendees(ZmCalBaseItem.LOCATION);
	var attendees = appt.getAttendees(ZmCalBaseItem.PERSON);

	var needsPermissionCheck = (attendees && attendees.length > 0) ||
							   (resources && resources.length > 0) ||
							   (locations && locations.length > 0);

	var callback = needsPermissionCheck
		? (new AjxCallback(this, this.checkAttendeePermissions, [appt, attId, notifyList]))
		: (new AjxCallback(this, this.saveCalItemContinue, [appt, attId, notifyList]));

	this._checkResourceConflicts(appt, numRecurrence, callback, false, true, false);
};

ZmApptComposeController.prototype.checkAttendeePermissions =
function(appt, attId, notifyList) {
	var newEmails = [];

	var attendees = appt.getAttendees(ZmCalBaseItem.PERSON);
	if (attendees && attendees.length > 0) {
		for (var i = 0; i < attendees.length; i++) {
			newEmails.push(attendees[i].getEmail());
		}
	}

	var locations = appt.getAttendees(ZmCalBaseItem.LOCATION);
	if (locations && locations.length > 0) {
		for (var i = 0; i < locations.length; i++) {
			newEmails.push(locations[i].getEmail());
		}
	}

	var resources = appt.getAttendees(ZmCalBaseItem.EQUIPMENT);
	if (resources && resources.length > 0) {
		for (var i = 0; i < resources.length; i++) {
			newEmails.push(resources[i].getEmail());
		}
	}

	if (newEmails.length) {
		this.checkPermissionRequest(newEmails, appt, attId, notifyList);
		return false;
	}

	// otherwise, just save the appointment
	this._saveCalItemFoRealz(appt, attId, notifyList);
};

// Expose the resource conflict check call to allow the ApptEditView to
// trigger a location conflict check
ZmApptComposeController.prototype.getCheckResourceConflicts =
function(appt, numRecurrence, callback, displayConflictDialog) {
    return this.checkResourceConflicts.bind(this, appt, numRecurrence, callback, displayConflictDialog);
}

ZmApptComposeController.prototype.checkResourceConflicts =
function(appt, numRecurrence, callback, displayConflictDialog) {
	return this._checkResourceConflicts(appt, numRecurrence, callback,
        true, displayConflictDialog, true);
};

ZmApptComposeController.prototype._checkResourceConflicts =
function(appt, numRecurrence, callback, showAll, displayConflictDialog, conflictCallbackOverride) {
	var mode = appt.viewMode;
	var reqId;
	if (mode!=ZmCalItem.MODE_NEW_FROM_QUICKADD && mode!= ZmCalItem.MODE_NEW) {
		if(appt.isRecurring() && mode != ZmCalItem.MODE_EDIT_SINGLE_INSTANCE) {
			// for recurring appt - user GetRecurRequest to get full recurrence
			// information and use the component in CheckRecurConflictRequest
			var recurInfoCallback = this._checkResourceConflicts.bind(this,
                appt, numRecurrence, callback, showAll, displayConflictDialog, conflictCallbackOverride);
			reqId = this.getRecurInfo(appt, recurInfoCallback);
		}
        else {
			reqId = this._checkResourceConflicts(appt, numRecurrence, callback,
                showAll, displayConflictDialog, conflictCallbackOverride);
		}
	}
    else {
		reqId = this._checkResourceConflicts(appt, numRecurrence, callback,
            showAll, displayConflictDialog, conflictCallbackOverride);
	}
	return reqId;
};

/**
 * JSON request is used to make easy re-use of "comp" elements from GetRecurResponse.
 * 
 * @private
 */
ZmApptComposeController.prototype._checkResourceConflicts =
function(appt, numRecurrence, callback, showAll, displayConflictDialog,
         conflictCallbackOverride, recurInfo) {
	var mode = appt.viewMode,
	    jsonObj = {
            CheckRecurConflictsRequest: {
                _jsns:"urn:zimbraMail"
            }
        },
	    request = jsonObj.CheckRecurConflictsRequest,
        startDate = new Date(appt.startDate),
        comps = request.comp = [],
        comp = request.comp[0] = {},
        recurrence,
        recur;

    startDate.setHours(0,0,0,0);
	request.s = startDate.getTime();
	request.e = ZmApptComposeController.getCheckResourceConflictEndTime(
	        appt, startDate, numRecurrence);

    if (showAll) {
        request.all = "1";
    }

	if (mode!=ZmCalItem.MODE_NEW_FROM_QUICKADD && mode!= ZmCalItem.MODE_NEW) {
		request.excludeUid = appt.uid;
	}


    appt._addDateTimeToRequest(request, comp);

    //preserve the EXDATE (exclude recur) information
    if(recurInfo) {
        recurrence = appt.getRecurrence();
        recur = (recurInfo && recurInfo.comp) ? recurInfo.comp[0].recur : null;
        recurrence.parseExcludeInfo(recur);
    }

    if(mode != ZmCalItem.MODE_EDIT_SINGLE_INSTANCE) {
        appt._recurrence.setJson(comp);
    }

    this.setExceptFromRecurInfo(request, recurInfo);

    appt.addAttendeesToChckConflictsRequest(request);

    return appCtxt.getAppController().sendRequest({
        jsonObj: jsonObj,
        asyncMode: true,
        callback: (new AjxCallback(this, this._handleResourceConflict, [appt, callback,
            displayConflictDialog, conflictCallbackOverride])),
        errorCallback: (new AjxCallback(this, this._handleResourceConflictError, [appt, callback])),
        noBusyOverlay: true
    });
};

ZmApptComposeController.prototype.setExceptFromRecurInfo =
function(request, recurInfo) {
	var exceptInfo = recurInfo && recurInfo.except,
        i,
        s,
        e,
        exceptId,
        except,
        sNode,
        eNode,
        exceptIdNode;
	if (!exceptInfo) { return; }

	for (i in exceptInfo) {
		s = exceptInfo[i].s ? exceptInfo[i].s[0] : null;
		e = exceptInfo[i].e ? exceptInfo[i].e[0] : null;
		exceptId = exceptInfo[i].exceptId ? exceptInfo[i].exceptId[0] : null;

		except = request.except = {};
		if (s) {
			sNode = except.s = {};
			sNode.d = s.d;
			if (s.tz) {
				sNode.tz = s.tz;
			}
		}

		if (e) {
			eNode = except.e = {};
			eNode.d = e.d;
			if (e.tz) {
				eNode.tz = e.tz;
			}
		}

		if (exceptId) {
			exceptIdNode = except.exceptId = {};
			exceptIdNode.d = exceptId.d;
			if (exceptId.tz) {
				exceptIdNode.tz = exceptId.tz;
			}
		}
	}
};

// Use the (numRecurrences * the recurrence period * repeat.customCount)
// time interval to determine the endDate of the resourceConflict check
ZmApptComposeController.getCheckResourceConflictEndTime =
function(appt, originalStartDate, numRecurrence) {
    var startDate = new Date(originalStartDate.getTime());
    var recurrence = appt.getRecurrence();
    var endDate;
    var range = recurrence.repeatCustomCount * numRecurrence;
    if (recurrence.repeatType == ZmRecurrence.NONE) {
        endDate = appt.endDate;
    } else if (recurrence.repeatType == ZmRecurrence.DAILY) {
        endDate = AjxDateUtil.roll(startDate, AjxDateUtil.DAY, range);
    } else if (recurrence.repeatType == ZmRecurrence.WEEKLY) {
        endDate = AjxDateUtil.roll(startDate, AjxDateUtil.WEEK, range);
    } else if (recurrence.repeatType == ZmRecurrence.MONTHLY) {
        endDate = AjxDateUtil.roll(startDate, AjxDateUtil.MONTH, range);
    } else if (recurrence.repeatType == ZmRecurrence.YEARLY) {
        endDate = AjxDateUtil.roll(startDate, AjxDateUtil.YEAR, range);
    }
    var endTime = endDate.getTime();
    if (recurrence.repeatEndDate) {
        var repeatEndTime = recurrence.repeatEndDate.getTime();
        if (endTime > repeatEndTime) {
            endTime = repeatEndTime;
        }
    }
    return endTime;
}

/**
 * Gets the recurrence definition of an appointment.
 * 
 * @param {ZmAppt}	appt 	the appointment
 * @param {AjxCallback}	recurInfoCallback 		the callback module after getting recurrence info
 */
ZmApptComposeController.prototype.getRecurInfo =
function(appt, recurInfoCallback) {
	var soapDoc = AjxSoapDoc.create("GetRecurRequest", "urn:zimbraMail");
	soapDoc.setMethodAttribute("id", appt.id);

	return appCtxt.getAppController().sendRequest({
		soapDoc: soapDoc,
		asyncMode: true,
		callback: (new AjxCallback(this, this._handleRecurInfo, [appt, recurInfoCallback])),
		errorCallback: (new AjxCallback(this, this._handleRecurInfoError, [appt, recurInfoCallback])),
		noBusyOverlay: true
	});
};

/**
 * Handle Response for GetRecurRequest call
 * 
 * @private
 */
ZmApptComposeController.prototype._handleRecurInfo =
function(appt, callback, result) {
	var recurResponse = result.getResponse().GetRecurResponse;
	if (callback) {
		callback.run(recurResponse);
	}
};

ZmApptComposeController.prototype._handleRecurInfoError =
function(appt, callback, result) {
	if (callback) {
		callback.run();
	}
};

ZmApptComposeController.prototype.checkPermissionRequest =
function(names, appt, attId, notifyList) {
    // CheckPermissions to be retired after IronMaiden.  Replaced with CheckRights
    var jsonObj = {CheckRightsRequest:{_jsns:"urn:zimbraAccount"}};
    var request = jsonObj.CheckRightsRequest;

    request.target = [];
    for (var i = 0; i < names.length; i++) {
        var targetInstance = {
            type: "account",
            by:   "name",
            key:   names[i]
        };
        targetInstance.right = [{_content: "invite"}];
        request.target.push(targetInstance);
    }

    var respCallback  = new AjxCallback(this, this.handleCheckRightsResponse, [appt, attId, names, notifyList]);
    var errorCallback = new AjxCallback(this, this.handleCheckRightsResponse, [appt, attId, names, notifyList]);
    appCtxt.getAppController().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:respCallback, errorCallback: errorCallback, noBusyOverlay:true});
};

ZmApptComposeController.prototype.handleCheckRightsResponse =
function(appt, attId, names, notifyList, response) {
	var checkRightsResponse = response && response._data && response._data.CheckRightsResponse;
	if (checkRightsResponse && checkRightsResponse.target) {
		var deniedAttendees = [];
		for (var i in checkRightsResponse.target) {
			if (!checkRightsResponse.target[i].allow) {
				deniedAttendees.push(names[i]);
			}
		}
		if (deniedAttendees.length > 0) {
			var msg =  AjxMessageFormat.format(ZmMsg.invitePermissionDenied, [deniedAttendees.join(",")]);
			var msgDialog = appCtxt.getMsgDialog();
			msgDialog.reset();
			msgDialog.setMessage(msg, DwtMessageDialog.INFO_STYLE);
			msgDialog.popup();
            this.enableToolbar(true);
			return;
		}
	}
	this.saveCalItemContinue(appt, attId, notifyList);
};

ZmApptComposeController.prototype._saveAfterPermissionCheck =
function(appt, attId, notifyList, msgDialog) {
	msgDialog.popdown();
	this.saveCalItemContinue(appt, attId, notifyList);
};

ZmApptComposeController.prototype.saveCalItemContinue =
function(appt, attId, notifyList) {
	this._saveCalItemFoRealz(appt, attId, notifyList);
};

ZmApptComposeController.prototype.handleCheckPermissionResponseError =
function(appt, attId, names, notifyList, response) {
	var resp = response && response._data && response._data.BatchResponse;
	this.saveCalItemContinue(appt, attId, notifyList);
};

ZmApptComposeController.prototype._handleResourceConflict =
function(appt, callback, displayConflictDialog, conflictCallbackOverride, result) {
	var conflictExist = false;
    var inst = null;
	if (result) {
		var conflictResponse = result.getResponse().CheckRecurConflictsResponse;
		inst = this._conflictingInstances = conflictResponse.inst;
		if (inst && inst.length > 0) {
			if (displayConflictDialog) {
				this.showConflictDialog(appt, callback, inst);
			}
			conflictExist = true;
			this.enableToolbar(true);
		}
	}

	if ((conflictCallbackOverride || !conflictExist) && callback) {
		callback.run(inst);
	}
};

ZmApptComposeController.prototype.showConflictDialog =
function(appt, callback, inst) {
	DBG.println("conflict instances :" + inst.length);

	var conflictDialog = this.getConflictDialog();
	conflictDialog.initialize(inst, appt, callback);
	conflictDialog.popup();
};

ZmApptComposeController.prototype.getConflictDialog =
function() {
	if (!this._resConflictDialog) {
		this._resConflictDialog = new ZmResourceConflictDialog(this._shell);
	}
	return this._resConflictDialog;
};

ZmApptComposeController.prototype._handleResourceConflictError =
function(appt, callback) {
	// continue with normal saving process via callback
	if (callback) {
		callback.run();
	}
};

ZmApptComposeController.prototype.getFreeBusyInfo =
function(startTime, endTime, emailList, callback, errorCallback, noBusyOverlay) {
	var soapDoc = AjxSoapDoc.create("GetFreeBusyRequest", "urn:zimbraMail");
	soapDoc.setMethodAttribute("s", startTime);
	soapDoc.setMethodAttribute("e", endTime);
	soapDoc.setMethodAttribute("uid", emailList);

	var acct = (appCtxt.multiAccounts)
		? this._composeView.getApptEditView().getCalendarAccount() : null;

	return appCtxt.getAppController().sendRequest({
		soapDoc: soapDoc,
		asyncMode: true,
		callback: callback,
		errorCallback: errorCallback,
		noBusyOverlay: noBusyOverlay,
		accountName: (acct ? acct.name : null)
	});
};

ZmApptComposeController.prototype._createComposeView =
function() {
	return (new ZmApptComposeView(this._container, null, this._app, this));
};

ZmApptComposeController.prototype._setComposeTabGroup =
function(setFocus) {
	DBG.println(AjxDebug.DBG2, "_setComposeTabGroup");
	var tg = this._createTabGroup();
	var rootTg = appCtxt.getRootTabGroup();
	tg.newParent(rootTg);
	tg.addMember(this._toolbar);
	var editView = this._composeView.getApptEditView();
	editView._addTabGroupMembers(tg);

	var focusItem = editView._savedFocusMember || editView._getDefaultFocusItem() || tg.getFirstMember(true);
	var ta = new AjxTimedAction(this, this._setFocus, [focusItem, !setFocus]);
	AjxTimedAction.scheduleAction(ta, 10);
};

ZmApptComposeController.prototype._getDefaultFocusItem =
function() {
    return this._composeView.getApptEditView()._getDefaultFocusItem();	
};

ZmApptComposeController.prototype.getKeyMapName =
function() {
	return ZmKeyMap.MAP_EDIT_APPOINTMENT;
};


// Private / Protected methods

ZmApptComposeController.prototype._attendeesUpdated =
function(appt, attId, attendees, origAttendees) {
	// create hashes of emails for comparison
	var origEmails = {};
	for (var i = 0; i < origAttendees.length; i++) {
		var email = origAttendees[i].getEmail();
		origEmails[email] = true;
	}
	var fwdEmails = {};
	var fwdAddrs = appt.getForwardAddress();
	for(var i=0;i<fwdAddrs.length;i++) {
		var email = fwdAddrs[i].getAddress();
		fwdEmails[email] = true;
	}
	var curEmails = {};
	for (var i = 0; i < attendees.length; i++) {
		var email = attendees[i].getEmail();
		curEmails[email] = true;
	}

	// walk the current list of attendees and check if there any new ones
	for (var i = 0 ; i < attendees.length; i++) {
		var email = attendees[i].getEmail();
		if (!origEmails[email] && !fwdEmails[email]) {
			this._addedAttendees.push(email);
		}
	}
    
	for (var i = 0 ; i < origAttendees.length; i++) {
		var email = origAttendees[i].getEmail();
		if (!curEmails[email]) {
			this._removedAttendees.push(email);
		}
	}

	if (this._addedAttendees.length > 0 || this._removedAttendees.length > 0) {
		if (!this._notifyDialog) {
			this._notifyDialog = new ZmApptNotifyDialog(this._shell);
			this._notifyDialog.addSelectionListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._notifyDlgOkListener));
			this._notifyDialog.addSelectionListener(DwtDialog.CANCEL_BUTTON, new AjxListener(this, this._notifyDlgCancelListener));
		}
		appt.setMailNotificationOption(true);
		this._notifyDialog.initialize(appt, attId, this._addedAttendees, this._removedAttendees);
		this._notifyDialog.popup();
        this.enableToolbar(true);
		return true;
	}

	return false;
};


// Listeners

// Cancel button was pressed
ZmApptComposeController.prototype._cancelListener =
function(ev) {

    var isDirty = false;

    if(this._composeView.gotNewAttachments()) {
        isDirty = true;
    }else {
        var appt = this._composeView.getAppt(this._attId);
        if (appt && !appt.inviteNeverSent){
           //Check for Significant Changes
            isDirty = this._checkIsDirty(ZmApptEditView.CHANGES_SIGNIFICANT)
        }
    }

    if(isDirty){
        this._getChangesDialog().popup();
        this.enableToolbar(true);
        return;
    }

	this._app.getCalController().setNeedsRefresh(true);

	ZmCalItemComposeController.prototype._cancelListener.call(this, ev);
};

ZmApptComposeController.prototype._printListener =
function() {
	var calItem = this._composeView._apptEditView._calItem;
	var url = ["/h/printappointments?id=", calItem.invId, "&tz=", AjxTimezone.getServerId(AjxTimezone.DEFAULT)]; //bug:53493
    if (appCtxt.isOffline) {
        url.push("&zd=true", "&acct=", this._composeView.getApptEditView().getCalendarAccount().name);
    }
	window.open(appContextPath + url.join(""), "_blank");
};


// Callbacks

ZmApptComposeController.prototype._notifyDlgOkListener =
function(ev) {
	var notifyList = this._notifyDialog.notifyNew() ? this._addedAttendees : null;
	this._saveCalItemFoRealz(this._notifyDialog.getAppt(), this._notifyDialog.getAttId(), notifyList);
};

ZmApptComposeController.prototype._notifyDlgCancelListener =
function(ev) {
	this._addedAttendees.length = this._removedAttendees.length = 0;
};

ZmApptComposeController.prototype._changeOrgCallback =
function(appt, attId, dlg) {
	dlg.popdown();
	this._saveCalItemFoRealz(appt, attId);
};

ZmApptComposeController.prototype._saveCalItemFoRealz =
function(calItem, attId, notifyList, force){
    force = force || ( this._action == ZmCalItemComposeController.SEND );

    //organizer forwarding an appt is same as organizer editing appt while adding new attendees
    if(calItem.isForward) {
        notifyList = this.getForwardNotifyList(calItem);
    }

    this._composeView.getApptEditView().resetParticipantStatus();

    // NOTE: Once CreateAppt/ModifyAppt SOAP API changes are completed (Bug 56464), pass to
    // the base _saveCalItemFoRealz appt.alteredLocations, to create a set of location
    // exceptions along with creation/modification of the underlying appt
    // *** NOT DONE ***
    ZmCalItemComposeController.prototype._saveCalItemFoRealz.call(this, calItem, attId, notifyList, force);
};

/**
 * To get the array of forward email addresses
 *
 * @param	{ZmAppt}	appt		the appointment
 * @return	{Array}	an array of email addresses
 */
ZmApptComposeController.prototype.getForwardNotifyList =
function(calItem){
    var fwdAddrs = calItem.getForwardAddress();
    var notifyList = [];
    for(var i=0;i<fwdAddrs.length;i++) {
        var email = fwdAddrs[i].getAddress();
        notifyList.push(email);
    }
    return notifyList;
};

ZmApptComposeController.prototype._doSaveCalItem =
function(appt, attId, callback, errorCallback, notifyList){
    delete this._attendeeValidated;
    if(this._action == ZmCalItemComposeController.SEND){
        appt.send(attId, callback, errorCallback, notifyList);
    }else{
        var isMeeting = appt.hasAttendees();
        if(isMeeting){
            this._draftFlag = appt.isDraft || appt.inviteNeverSent || this._checkIsDirty(ZmApptEditView.CHANGES_INSIGNIFICANT);
        }else{
            this._draftFlag = false;
        }
        appt.save(attId, callback, errorCallback, notifyList, this._draftFlag);
    }
};

ZmApptComposeController.prototype._handleResponseSave =
function(calItem, result) {
	if (calItem.__newFolderId) {
		var folder = appCtxt.getById(calItem.__newFolderId);
		calItem.__newFolderId = null;
		this._app.getListController()._doMove(calItem, folder, null, false);
	}

    var isNewAppt;
    var viewMode = calItem.getViewMode();
    if(viewMode == ZmCalItem.MODE_NEW || viewMode == ZmCalItem.MODE_NEW_FROM_QUICKADD || viewMode == ZmAppt.MODE_DRAG_OR_SASH) {
        isNewAppt = true;
    }

    if(this.isCloseAction()) {
        calItem.handlePostSaveCallbacks();
        this.closeView();	    
    }else {
        this.enableToolbar(true);
        if(isNewAppt) {
            viewMode = calItem.isRecurring() ? ZmCalItem.MODE_EDIT_SERIES : ZmCalItem.MODE_EDIT;
        }
        calItem.setFromSavedResponse(result);
        if(this._action == ZmCalItemComposeController.SAVE){
            calItem.isDraft = this._draftFlag;
            calItem.draftUpdated = true;
        }
        this._composeView.set(calItem, viewMode);        
    }

    var msg = isNewAppt ? ZmMsg.apptCreated : ZmMsg.apptSaved;
    if(calItem.hasAttendees()){
        if(this._action == ZmCalItemComposeController.SAVE || this._action == ZmCalItemComposeController.SAVE_CLOSE){
            msg = ZmMsg.apptSaved;
        }else{
            if(viewMode != ZmCalItem.MODE_NEW){
                msg = ZmMsg.apptSent;
            }
        }              
    }
    appCtxt.setStatusMsg(msg);
    
    appCtxt.notifyZimlets("onSaveApptSuccess", [this, calItem, result]);//notify Zimlets on success
};

ZmApptComposeController.prototype._resetNavToolBarButtons =
function(view) {
	//do nothing
};

ZmApptComposeController.prototype._clearInvalidAttendeesCallback =
function(appt, attId, dlg) {
	dlg.popdown();
    this.clearInvalidAttendees();
	delete this._invalidAttendees;
    if(this._action == ZmCalItemComposeController.SAVE){
	    this._saveListener();
    }else{
        this._sendListener();
    }
};

ZmApptComposeController.prototype.clearInvalidAttendees =
function() {
	this._invalidAttendees = [];
};

ZmApptComposeController.prototype.addInvalidAttendee =
function(item) {
	if (AjxUtil.indexOf(this._invalidAttendees, item)==-1) {
		this._invalidAttendees.push(item);
	}
};

ZmApptComposeController.prototype.closeView =
function() {
	this._closeView();
};

ZmApptComposeController.prototype.forwardInvite =
function(newAppt) {
	this.show(newAppt, ZmCalItem.MODE_FORWARD_INVITE);
};

ZmApptComposeController.prototype.proposeNewTime =
function(newAppt) {
	this.show(newAppt, ZmCalItem.MODE_PROPOSE_TIME);
};

ZmApptComposeController.prototype.initComposeView =
function(initHide) {
    
	if (!this._composeView) {
		this._composeView = this._createComposeView();
        var appEditView = this._composeView.getApptEditView();
        this._savedFocusMember = appEditView._getDefaultFocusItem();

		var callbacks = {};
		callbacks[ZmAppViewMgr.CB_PRE_HIDE] = new AjxCallback(this, this._preHideCallback);
		callbacks[ZmAppViewMgr.CB_PRE_UNLOAD] = new AjxCallback(this, this._preUnloadCallback);
		callbacks[ZmAppViewMgr.CB_POST_SHOW] = new AjxCallback(this, this._postShowCallback);
		callbacks[ZmAppViewMgr.CB_PRE_SHOW] = new AjxCallback(this, this._preShowCallback);
		callbacks[ZmAppViewMgr.CB_POST_HIDE] = new AjxCallback(this, this._postHideCallback);
		if (!this._toolbar)
			this._createToolBar();

		var elements = this.getViewElements(null, this._composeView, this._toolbar);

		this._app.createView({	viewId:		this._currentViewId,
								viewType:	this._currentViewType,
								elements:	elements,
								hide:		this._elementsToHide,
								controller:	this,
								callbacks:	callbacks,
								tabParams:	this._getTabParams()});
		if (initHide) {
			this._composeView.preload();
		}
		return true;
	}
    else{
        this._savedFocusMember = this._composeView.getApptEditView()._getDefaultFocusItem();
    }
	return false;
};

ZmApptComposeController.prototype.getCalendarAccount =
function() {
    return (appCtxt.multiAccounts)
        ? this._composeView.getApptEditView().getCalendarAccount() : null;

};

ZmApptComposeController.prototype.getAttendees =
function(type) {
    return this._composeView.getAttendees(type);
};

ZmApptComposeController.prototype._postHideCallback =
function() {

	ZmCalItemComposeController.prototype._postHideCallback(); 

    if (appCtxt.getCurrentAppName() == ZmApp.CALENDAR || appCtxt.get(ZmSetting.CAL_ALWAYS_SHOW_MINI_CAL)) {
		appCtxt.getAppViewMgr().displayComponent(ZmAppViewMgr.C_TREE_FOOTER, true);
    }
};

ZmApptComposeController.prototype._postShowCallback =
function(view, force) {
	var ta = new AjxTimedAction(this, this._setFocus);
	AjxTimedAction.scheduleAction(ta, 10);
};

ZmApptComposeController.prototype.getWorkingInfo =
function(startTime, endTime, emailList, callback, errorCallback, noBusyOverlay) {
   var soapDoc = AjxSoapDoc.create("GetWorkingHoursRequest", "urn:zimbraMail");
   soapDoc.setMethodAttribute("s", startTime);
   soapDoc.setMethodAttribute("e", endTime);
   soapDoc.setMethodAttribute("name", emailList);

   var acct = (appCtxt.multiAccounts)
       ? this._composeView.getApptEditView().getCalendarAccount() : null;

   return appCtxt.getAppController().sendRequest({
       soapDoc: soapDoc,
       asyncMode: true,
       callback: callback,
       errorCallback: errorCallback,
       noBusyOverlay: noBusyOverlay,
       accountName: (acct ? acct.name : null)
   });
};

ZmApptComposeController.prototype._resetToolbarOperations =
function() {
    //do nothing - this  gets called when this controller handles a list view
};

// --- Subclass the ApptComposeController for saving Quick Add dialog appointments, and doing a
//     save when the CalColView drag and drop is used
ZmSimpleApptComposeController = function(container, app, type, sessionId) {
    ZmApptComposeController.apply(this, arguments);
    this._closeCallback = null;
    // Initialize a static/dummy compose view.  It is never actually used
    // for display (only for the function calls made to it during the save),
    // so it can be setup here.
    this.initComposeView();
};

ZmSimpleApptComposeController.prototype = new ZmApptComposeController;
ZmSimpleApptComposeController.prototype.constructor = ZmSimpleApptComposeController;

ZmSimpleApptComposeController.prototype.toString = function() { return "ZmSimpleApptComposeController"; };

ZmSimpleApptComposeController.getDefaultViewType =
function() {
	return ZmId.VIEW_SIMPLE_ADD_APPOINTMENT;
};

ZmSimpleApptComposeController.prototype.doSimpleSave =
function(appt, action, closeCallback, errorCallback, cancelCallback) {
    var ret = false;
    this._action = action;
    this._closeCallback = null;
    if(!appt.isValidDuration()){
        this._composeView.showInvalidDurationMsg();
    } else if (appt) {
        this._simpleCloseCallback  = closeCallback;
        this._simpleErrorCallback  = errorCallback;
        this._simpleCancelCallback = cancelCallback;
        ret = this._initiateSaveWithChecks(appt, null, ZmTimeSuggestionPrefDialog.DEFAULT_NUM_RECURRENCE);
    }
    return ret;
};

ZmSimpleApptComposeController.prototype._handleResponseSave =
function(calItem, result) {
    if (this._simpleCloseCallback) {
        this._simpleCloseCallback.run();
    }
    appCtxt.notifyZimlets("onSaveApptSuccess", [this, calItem, result]);//notify Zimlets on success
};

ZmSimpleApptComposeController.prototype._getErrorSaveStatus =
function(calItem, ex) {
    var status = ZmCalItemComposeController.prototype._getErrorSaveStatus.call(this, calItem, ex);
    if (!status.continueSave && this._simpleErrorCallback) {
        this._simpleErrorCallback.run(this);
    }

    return status;
};

ZmSimpleApptComposeController.prototype.initComposeView =
function() {
	if (!this._composeView) {
		// Create an empty compose view and make it always return isDirty == true
		this._composeView = this._createComposeView();
		this._composeView.isDirty = function() { return true; };
		return true;
    }
	return false;
};

ZmSimpleApptComposeController.prototype.enableToolbar =
function(enabled) { }


ZmSimpleApptComposeController.prototype.showConflictDialog =
function(appt, callback, inst) {
	DBG.println("conflict instances :" + inst.length);

	var conflictDialog = this.getConflictDialog();
	conflictDialog.initialize(inst, appt, callback, this._simpleCancelCallback);
	conflictDialog.popup();
};
}
if (AjxPackage.define("zimbraMail.calendar.controller.ZmCalViewController")) {
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates the calendar view controller.
 * @class
 * The strategy for the calendar is to leverage the list view stuff by creating a single
 * view (i.e. {@link ZmCalViewMgr}) and have it manage the schedule views (e.g. week, month) and
 * a single calendar view (the calendar widget to the right). Each of the schedule views
 * will be a list view that are managed by the {@link ZmCalViewMgr}.
 * <p>
 * To do this we have to trick the {@link ZmListController}. Specifically we have only one toolbar and
 * directly manipulate this._toolbar elements to point to a single instance of the toolbar. We also
 * directly override the {@link ZmListControl.initializeToolBar} method.
 *
 * @param {DwtComposite}				container					the containing element
 * @param {ZmCalendarApp}				calApp						the handle to the calendar application
 * @param {string}						sessionId					the session id
 * @param {ZmSearchResultsController}	searchResultsController		containing controller
 * 
 * @extends		ZmListController
 */
ZmCalViewController = function(container, calApp, sessionId, searchResultsController) {

	ZmListController.apply(this, arguments);
    
	var apptListener = this._handleApptRespondAction.bind(this);
	var apptEditListener = this._handleApptEditRespondAction.bind(this);

	// get view based on op
	ZmCalViewController.OP_TO_VIEW = {};
	ZmCalViewController.OP_TO_VIEW[ZmOperation.DAY_VIEW]		= ZmId.VIEW_CAL_DAY;
	ZmCalViewController.OP_TO_VIEW[ZmOperation.WEEK_VIEW]		= ZmId.VIEW_CAL_WEEK;
	ZmCalViewController.OP_TO_VIEW[ZmOperation.WORK_WEEK_VIEW]	= ZmId.VIEW_CAL_WORK_WEEK;
	ZmCalViewController.OP_TO_VIEW[ZmOperation.MONTH_VIEW]		= ZmId.VIEW_CAL_MONTH;
	ZmCalViewController.OP_TO_VIEW[ZmOperation.CAL_LIST_VIEW]	= ZmId.VIEW_CAL_LIST;
	ZmCalViewController.OP_TO_VIEW[ZmOperation.FB_VIEW]			= ZmId.VIEW_CAL_FB;

	// get op based on view
	ZmCalViewController.VIEW_TO_OP = {};
	for (var op in ZmCalViewController.OP_TO_VIEW) {
		ZmCalViewController.VIEW_TO_OP[ZmCalViewController.OP_TO_VIEW[op]] = op;
	}

	this._listeners[ZmOperation.REPLY_ACCEPT]			= apptListener;
	this._listeners[ZmOperation.REPLY_DECLINE]			= apptListener;
	this._listeners[ZmOperation.REPLY_TENTATIVE]		= apptListener;
	this._listeners[ZmOperation.EDIT_REPLY_ACCEPT]		= apptEditListener;
	this._listeners[ZmOperation.EDIT_REPLY_DECLINE]		= apptEditListener;
	this._listeners[ZmOperation.EDIT_REPLY_TENTATIVE]	= apptEditListener;

	this._listeners[ZmOperation.SHOW_ORIG]				= this._showOrigListener.bind(this);
	this._listeners[ZmOperation.VIEW_APPOINTMENT]		= this._handleMenuViewAction.bind(this);
	this._listeners[ZmOperation.OPEN_APPT_INSTANCE]		= this._handleMenuViewAction.bind(this);
	this._listeners[ZmOperation.OPEN_APPT_SERIES]		= this._handleMenuViewAction.bind(this);
	this._listeners[ZmOperation.TODAY]					= this._todayButtonListener.bind(this);
	this._listeners[ZmOperation.NEW_APPT]				= this._newApptAction.bind(this);
	this._listeners[ZmOperation.NEW_ALLDAY_APPT]		= this._newAllDayApptAction.bind(this);
	this._listeners[ZmOperation.SEARCH_MAIL]			= this._searchMailAction.bind(this);
	this._listeners[ZmOperation.MOVE]					= this._apptMoveListener.bind(this);
	this._listeners[ZmOperation.DELETE_INSTANCE]		= this._deleteListener.bind(this);
	this._listeners[ZmOperation.DELETE_SERIES]			= this._deleteListener.bind(this);
	this._listeners[ZmOperation.FORWARD_APPT]			= this._forwardListener.bind(this);
    this._listeners[ZmOperation.PROPOSE_NEW_TIME]		= this._proposeTimeListener.bind(this);
    this._listeners[ZmOperation.REINVITE_ATTENDEES]		= this._reinviteAttendeesListener.bind(this);
	this._listeners[ZmOperation.FORWARD_APPT_INSTANCE]	= this._forwardListener.bind(this);
	this._listeners[ZmOperation.FORWARD_APPT_SERIES]	= this._forwardListener.bind(this);
	this._listeners[ZmOperation.REPLY]					= this._replyListener.bind(this);
	this._listeners[ZmOperation.REPLY_ALL]				= this._replyAllListener.bind(this);
	this._listeners[ZmOperation.DUPLICATE_APPT]			= this._duplicateApptListener.bind(this);
    this._listeners[ZmOperation.PRINT_CALENDAR]			= this._printCalendarListener.bind(this);

	this._treeSelectionListener = this._calTreeSelectionListener.bind(this);
	this._maintTimedAction = new AjxTimedAction(this, this._maintenanceAction);
	this._pendingWork = ZmCalViewController.MAINT_NONE;
	this.apptCache = new ZmApptCache(this);
	this._currentViewIdOverride = ZmId.VIEW_CAL;	// public view ID
	
	ZmCalViewController.OPS = [
		ZmOperation.DAY_VIEW, ZmOperation.WORK_WEEK_VIEW, ZmOperation.WEEK_VIEW,
		ZmOperation.MONTH_VIEW, ZmOperation.CAL_LIST_VIEW
	];
    if (appCtxt.get(ZmSetting.FREE_BUSY_VIEW_ENABLED)) {
        ZmCalViewController.OPS.push(ZmOperation.FB_VIEW);    
    }
	var viewOpsListener = new AjxListener(this, this._viewActionMenuItemListener);
	for (var i = 0; i < ZmCalViewController.OPS.length; i++) {
		var op = ZmCalViewController.OPS[i];
		this._listeners[op] = viewOpsListener;
	}
	
	this._errorCallback = this._handleError.bind(this);

	// needed by ZmCalListView:
	if (this.supportsDnD()) {
		this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
		this._dragSrc.addDragListener(this._dragListener.bind(this));
	}
	
	this._clearCacheFolderMap = {};
	this._apptSessionId = {};
};

ZmCalViewController.prototype = new ZmListController;
ZmCalViewController.prototype.constructor = ZmCalViewController;

ZmCalViewController.prototype.isZmCalViewController = true;
ZmCalViewController.prototype.toString = function() { return "ZmCalViewController"; };

ZmCalViewController.DEFAULT_APPOINTMENT_DURATION = 30*60*1000;

// maintenance needed on views and/or minical
ZmCalViewController.MAINT_NONE 		= 0x0; // no work to do
ZmCalViewController.MAINT_MINICAL 	= 0x1; // minical needs refresh
ZmCalViewController.MAINT_VIEW 		= 0x2; // view needs refresh
ZmCalViewController.MAINT_REMINDER	= 0x4; // reminders need refresh

// get view based on op
ZmCalViewController.ACTION_CODE_TO_VIEW = {};
ZmCalViewController.ACTION_CODE_TO_VIEW[ZmKeyMap.CAL_DAY_VIEW]			= ZmId.VIEW_CAL_DAY;
ZmCalViewController.ACTION_CODE_TO_VIEW[ZmKeyMap.CAL_WEEK_VIEW]			= ZmId.VIEW_CAL_WEEK;
ZmCalViewController.ACTION_CODE_TO_VIEW[ZmKeyMap.CAL_WORK_WEEK_VIEW]	= ZmId.VIEW_CAL_WORK_WEEK;
ZmCalViewController.ACTION_CODE_TO_VIEW[ZmKeyMap.CAL_MONTH_VIEW]		= ZmId.VIEW_CAL_MONTH;
ZmCalViewController.ACTION_CODE_TO_VIEW[ZmKeyMap.CAL_LIST_VIEW]			= ZmId.VIEW_CAL_LIST;
ZmCalViewController.ACTION_CODE_TO_VIEW[ZmKeyMap.CAL_FB_VIEW]		    = ZmId.VIEW_CAL_FB;

ZmCalViewController.CHECKED_STATE_KEY = "CalendarsChecked";

// Zimlet hack
ZmCalViewController.prototype.postInitListeners =
function () {
	if (ZmZimlet.listeners && ZmZimlet.listeners["ZmCalViewController"]) {
		for(var ix in ZmZimlet.listeners["ZmCalViewController"]) {
			if(ZmZimlet.listeners["ZmCalViewController"][ix] instanceof AjxListener) {
				this._listeners[ix] = ZmZimlet.listeners["ZmCalViewController"][ix];
			} else {
				this._listeners[ix] = new AjxListener(this, ZmZimlet.listeners["ZmCalViewController"][ix]);
			}
		}
	}
};

ZmCalViewController.getDefaultViewType =
function() {
	var setting = appCtxt.get(ZmSetting.CALENDAR_INITIAL_VIEW);
    //This if loop has to be removed once bug 68708 is fixed
    if(setting === "schedule"){
        setting = ZmSetting.CAL_DAY;//Assigning day view as default view instead of schedule view as it is removed
    }
	return ZmCalendarApp.VIEW_FOR_SETTING[setting] || ZmId.VIEW_CAL_WORK_WEEK;
};
ZmCalViewController.prototype.getDefaultViewType = ZmCalViewController.getDefaultViewType;

/**
 * Gets the first day of week setting.
 * 
 * @return	{int}	the first day of week index
 */
ZmCalViewController.prototype.firstDayOfWeek =
function() {
	return appCtxt.get(ZmSetting.CAL_FIRST_DAY_OF_WEEK) || 0;
};

ZmCalViewController.prototype.setCurrentViewId =
function(viewId) {
    if (viewId != ZmId.VIEW_CAL) {
        // Only store a real view id; VIEW_CAL is a placeholder used to identity the
        // constellation of calendar views to the AppViewMgr.  Cal views are handled
        // by their own ZmCalViewMgr.
        ZmController.prototype.setCurrentViewId.call(this, viewId);
    }
};

ZmCalViewController.prototype.show =
function(viewId, startDate, skipMaintenance) {
	AjxDispatcher.require(["MailCore", "CalendarCore", "Calendar"]);
	DBG.println(AjxDebug.DBG1, "ZmCalViewController.show, viewId = " + viewId);
	if (!viewId || viewId == ZmId.VIEW_CAL) {
		viewId = this.getCurrentViewType() || this.getDefaultViewType();
	}

	if (!this._viewMgr) {
		this.createViewMgr(startDate);
		this._setup(viewId); // TODO: Needed? Wouldn't this be handled by next conditional?
	}

	if (!this._viewMgr.getView(viewId)) {
		this._setup(viewId);
	}

	var previousView = this._viewMgr.getCurrentView();
	var hadFocus = previousView && previousView.hasFocus();

	this._viewMgr.setView(viewId);
	DBG.timePt("setup and set view");

	var elements = this.getViewElements(ZmId.VIEW_CAL, this._viewMgr);

	// we need to mark the current view _before_ actually setting the view,
	// otherwise we won't get the tab group added if the view already exists
	this._currentViewId = this._currentViewType = this._viewMgr.getCurrentViewName();

    this._setView({ view:		ZmId.VIEW_CAL,
					viewType:	this._currentViewType,
					elements:	elements,
					isAppView:	true});

    this.setCurrentListView(null);
    var currentView = this._listView[this._currentViewId] = this._viewMgr.getCurrentView();
	this._resetToolbarOperations(viewId);


	DBG.timePt("switching selection mode and tooltips");

    switch(viewId) {
        case ZmId.VIEW_CAL_DAY:
            this._miniCalendar.setSelectionMode(DwtCalendar.DAY);
            this._navToolBar[ZmId.VIEW_CAL].setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previousDay);
            this._navToolBar[ZmId.VIEW_CAL].setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.nextDay);
            break;
        case ZmId.VIEW_CAL_WORK_WEEK:
            this._miniCalendar.setSelectionMode(DwtCalendar.WORK_WEEK);
            this._navToolBar[ZmId.VIEW_CAL].setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previousWorkWeek);
            this._navToolBar[ZmId.VIEW_CAL].setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.nextWorkWeek);
            break;
        case ZmId.VIEW_CAL_WEEK:
            this._miniCalendar.setSelectionMode(DwtCalendar.WEEK);
            this._navToolBar[ZmId.VIEW_CAL].setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previousWeek);
            this._navToolBar[ZmId.VIEW_CAL].setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.nextWeek);
            break;
        case ZmId.VIEW_CAL_MONTH:
            // use day until month does something
            this._miniCalendar.setSelectionMode(DwtCalendar.DAY);
            this._navToolBar[ZmId.VIEW_CAL].setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previousMonth);
            this._navToolBar[ZmId.VIEW_CAL].setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.nextMonth);
            break;
        case ZmId.VIEW_CAL_LIST:
            this._miniCalendar.setSelectionMode(DwtCalendar.DAY);
            break;
    }
    if (viewId == ZmId.VIEW_CAL_LIST) {
		this._navToolBar[ZmId.VIEW_CAL].setVisible(false);
	} else {
        if(viewId!=ZmId.VIEW_CAL_MONTH){this._viewMgr.getView(viewId).initializeTimeScroll();}
		this._navToolBar[ZmId.VIEW_CAL].setVisible(true);
		var navText = viewId == ZmId.VIEW_CAL_MONTH
			? currentView.getShortCalTitle()
			: currentView.getCalTitle();
		this._navToolBar[ZmId.VIEW_CAL].setText(navText);
		DBG.println(AjxDebug.DBG1, "ZmCalViewController.show, skipMaintenance = " + skipMaintenance);
		if (!skipMaintenance) {
			var work = ZmCalViewController.MAINT_VIEW;
			if (window.inlineCalSearchResponse) {
				this.processInlineCalSearch();
				window.inlineCalSearchResponse = null;
				work = ZmCalViewController.MAINT_MINICAL|ZmCalViewController.MAINT_VIEW|ZmCalViewController.MAINT_REMINDER;
			}
			this._scheduleMaintenance(work);
		}
        if (!this.isSearchResults) {
            this.updateTimeIndicator(viewId);
        }
		DBG.timePt("scheduling maintenance");
	}

	if (hadFocus) {
		currentView.focus();
	}

	// do this last
	if (!this._calTreeController) {
		this._calTreeController = appCtxt.getOverviewController().getTreeController(ZmOrganizer.CALENDAR);
		if (this._calTreeController) {
			if (appCtxt.multiAccounts) {
				var overviews = this._app.getOverviewContainer().getOverviews();
				for (var i in overviews) {
					this._calTreeController.addSelectionListener(i, this._treeSelectionListener);
				}
			} else {
				this._calTreeController.addSelectionListener(this._app.getOverviewId(), this._treeSelectionListener);
			}
			var calTree = appCtxt.getFolderTree();
			if (calTree) {
				calTree.addChangeListener(new AjxListener(this, this._calTreeChangeListener));
			}
		}
		DBG.timePt("getting tree controller", true);
	}
};

/**
 * Updates the time indicator strip.
 *
 */
ZmCalViewController.prototype.updateTimeIndicator =
function(viewId) {
    viewId = viewId || this.getCurrentViewType();
    this._viewMgr.getView(viewId).startIndicatorTimer(this.isSearchResults);
};

/**
 * Gets the calendar tree controller.
 *
 * @return	{ZmCalendarTreeController}		the controller
 */
ZmCalViewController.prototype.getCalTreeController =
function() {
	return this._calTreeController;
};

ZmCalViewController.prototype.createViewMgr =
function(startDate) {
	var newDate = startDate || (this._miniCalendar ? this._miniCalendar.getDate() : new Date());

	if (!this._miniCalendar) {
		this._createMiniCalendar(newDate);
	}

	this._viewMgr = new ZmCalViewMgr(this._container, this, this._dropTgt);
	this._viewMgr.setDate(newDate);
	this._viewMgr.addTimeSelectionListener(new AjxListener(this, this._timeSelectionListener));
	this._viewMgr.addDateRangeListener(new AjxListener(this, this._dateRangeListener));
	this._viewMgr.addViewActionListener(new AjxListener(this, this._viewActionListener));
	DBG.timePt("created view manager");
};

/**
 * Gets the checked calendars.
 * 
 * @param	{String}	overviewId		the overview id
 * @return	{Array}		an array of {ZmCalendar} objects
 */
ZmCalViewController.prototype.getCheckedCalendars =
function(includeTrash) {
	if (!this._checkedCalendars) {
		this._updateCheckedCalendars();
	}
    return includeTrash ? this._checkedCalendarsAll : this._checkedCalendars;
};

ZmCalViewController.prototype.getMainAccountCheckedCalendarIds =
function() {
    if (!this._checkedAccountCalendarIds) {
        // Generate the checked calendar data
        this._updateCheckedCalendars();
    }
    // If there are any account calendar ids, the 0th should be the main account - copy its checked calendars
    return (this._checkedAccountCalendarIds.length == 0) ? [] : this._checkedAccountCalendarIds[0].slice(0);
}

// Called whether starting on or offline
ZmCalViewController.prototype.getOfflineSearchCalendarIds =
function() {
    if (!this._offlineSearchCalendarIds) {

        var checkedCalendarHash = null;
        if (appCtxt.isWebClientOffline()) {
            checkedCalendarHash = this._retrieveCalendarCheckedState();
        }

        // Generate the checked calendar data - this will also store the calendar entries, if we are starting up online
        this._updateCheckedCalendars(checkedCalendarHash);
    }
    return (this._offlineSearchCalendarIds);
}

ZmCalViewController.prototype._storeCalendarCheckedState =
function() {
    // if !offline, store which calendars are currently checked, in localStorage.  This will be updated
    // while running, and reloaded if the app starts in offline mode.
    var calendarCheckedState = this._checkedCalendarIds.join(":");
    localStorage.setItem(ZmCalendarApp.CHECKED_STATE_KEY, calendarCheckedState);
}


ZmCalViewController.prototype._retrieveCalendarCheckedState =
function() {
    // Starting up offline, retrieve the stored calendar checked state
    var checkedStateText = localStorage.getItem(ZmCalendarApp.CHECKED_STATE_KEY);
    var checkedCalendarFolderIds = checkedStateText.split(":");
    var checkedCalendarHash = {};
    for (var i = 0; i < checkedCalendarFolderIds.length; i++) {
        checkedCalendarHash[checkedCalendarFolderIds[i]] = true;
    }
    return checkedCalendarHash;
}


/**
 * Gets the unchecked calendar folder ids for a owner email
 *
 * @param	{String}	ownerEmailId		email id of the owner account
 * @return	{Array}		an array of folder ids
 */
ZmCalViewController.prototype.getUncheckedCalendarIdsByOwner =
function(ownerEmailId) {
	var dataTree = appCtxt.getTree(ZmId.ORG_CALENDAR, appCtxt.getActiveAccount()),
        calendars = dataTree.getByType(ZmId.ORG_CALENDAR),
        len = calendars.length,
        calIds = [],
        calendar,
        i;

    for (i=0; i<len; i++) {
        calendar = calendars[i];
        if(!calendar.isChecked && calendar.owner && calendar.owner == ownerEmailId) {
            calIds.push(calendar.id);
        }
    }
    return calIds;
};

/**
 * Gets the checked calendar folder ids.
 * 
 * @param	{Boolean}	localOnly		if <code>true</code>, include local calendars only
 * @return	{Array}		an array of folder ids
 */
ZmCalViewController.prototype.getCheckedCalendarFolderIds =
function(localOnly, includeTrash) {
	if (!this._checkedCalendarIds) {
		this.getCheckedCalendars(includeTrash);
		if (!this._checkedCalendarIds) {
			return [ZmOrganizer.ID_CALENDAR];
		}
	}
    // TODO: Do we also need to handle includeTrash here?
	return localOnly
		? this._checkedLocalCalendarIds
		: this._checkedCalendarIds;
};

/**
 * Gets the checked calendar folder ids.
 *
 * @param	{Boolean}	localOnly		if <code>true</code>, include local calendars only
 * @return	{Array}		an array of folder ids
 */
ZmCalViewController.prototype.getOwnedCalendarIds =
function(email, includeTrash) {
    var i,
        cal,
        calendars,
        calIds = [];
    if(!this._calTreeController) {
        this._calTreeController = appCtxt.getOverviewController().getTreeController(ZmOrganizer.CALENDAR);
    }

    calendars = this._calTreeController.getOwnedCalendars(this._app.getOverviewId(), email);
    for (i = 0; i < calendars.length; i++) {
        cal = calendars[i];
        if (cal) {
            if(!includeTrash && (cal.nId == ZmFolder.ID_TRASH)) { continue; }
            calIds.push(appCtxt.multiAccounts ? cal.id : cal.nId);
        }
    }

	return calIds;
};

/**
 * Gets the calendar folder ids used to create reminders.
 * All local calendars and shared calendars with the reminder flag set, checked or unchecked.
 * Does not include the trash folder.
 *
 * @return	{Array}		an array of folder ids
 */
ZmCalViewController.prototype.getReminderCalendarFolderIds =
function() {
	if (!this._reminderCalendarIds) {
		this._updateCheckedCalendars();
		if (!this._reminderCalendarIds) {
			return [ZmOrganizer.ID_CALENDAR];
		}
	}
	return this._reminderCalendarIds;
};

/**
 * Gets the checked organizers.
 *
 * @return {Array} array of {ZmOrganizer}
 */
ZmCalViewController.prototype.getCheckedOrganizers = function(includeTrash, acct) {
    var controller = appCtxt.getOverviewController();
    var overviewId = appCtxt.getApp(ZmApp.CALENDAR).getOverviewId(acct);
    var treeId = ZmOrganizer.CALENDAR;
    var treeView = controller.getTreeView(overviewId, treeId);
    var organizers = treeView.getSelected();
    if (!includeTrash) {
        for (var i = 0; i < organizers.length; i++) {
            if (organizers[i].id == ZmOrganizer.ID_TRASH) {
                organizers.splice(i, 1);
                break;
            }
        }
    }
    return organizers;
};

/**
 * Gets the checked organizer IDs.
 *
 * @return {Array} array of strings
 */
ZmCalViewController.prototype.getCheckedOrganizerIds = function() {
    return AjxUtil.map(this.getCheckedOrganizers(), ZmCalViewController.__map_id);
};
ZmCalViewController.__map_id = function(item) {
    return item.id;
};

ZmCalViewController.prototype._updateCheckedCalendars =
function(checkedCalendarHash) {
    var allCalendars = [];
	if (this._calTreeController) {
		if (appCtxt.multiAccounts) {
			var overviews = this._app.getOverviewContainer().getOverviews();
			for (var i in overviews) {
				allCalendars = allCalendars.concat(this._calTreeController.getCalendars(i));
			}
		} else {
			// bug fix #25512 - avoid race condition
			if (!this._app._overviewPanelContent) {
				this._app.setOverviewPanelContent(true);
			}
			allCalendars = this._calTreeController.getCalendars(this._app.getOverviewId());
		}
	} else {
		this._app._createDeferredFolders(ZmApp.CALENDAR);
        var ac = window.parentAppCtxt || window.appCtxt;
		var list = ac.accountList.visibleAccounts;
		for (var i = 0; i < list.length; i++) {
			var acct = list[i];
			if (!ac.get(ZmSetting.CALENDAR_ENABLED, null, acct)) { continue; }

			var folderTree = ac.getFolderTree(acct);
			var calendars = folderTree && folderTree.getByType(ZmOrganizer.CALENDAR);
			if (calendars) {
				for (var j = 0; j < calendars.length; j++) {
					// bug: 43067: skip the default calendar for caldav based accounts
					if (acct.isCalDavBased() && calendars[j].nId == ZmOrganizer.ID_CALENDAR) {
						continue;
					}
					allCalendars.push(calendars[j]);
				}
			}
		}
	}

    this._checkedCalendars = [];
    this._checkedCalendarIds = [];
    this._checkedLocalCalendarIds = [];
    this._checkedAccountCalendarIds = [];
    this._offlineSearchCalendarIds = [];
    this._reminderCalendarIds = [];
    var checkedAccountCalendarIds = {};
    var trashFolder = null;
    for (var i = 0; i < allCalendars.length; i++) {
        var cal = allCalendars[i];
        if (!cal.noSuchFolder) {
            this._offlineSearchCalendarIds.push(cal.id);
        }
        if (!cal.noSuchFolder && (cal.id != ZmOrganizer.ID_TRASH) &&
            (cal.isRemote && !cal.isRemote())) {
            this._reminderCalendarIds.push(cal.id);
        }
        var checked = cal.isChecked;
        if (checkedCalendarHash) {
            // LocalStorage values passed in upon offline startup, use those
            checked = checkedCalendarHash[cal.id] ? true : false;
            cal.isChecked = checked;
        }
        if (checked) {
            if (cal.id == ZmOrganizer.ID_TRASH) {
                trashFolder = cal;
            } else {
                this._checkedCalendars.push(cal);
            }
            if (!cal.noSuchFolder) {
                this._checkedCalendarIds.push(cal.id);
                if (cal.isRemote && !cal.isRemote()) {
                    this._checkedLocalCalendarIds.push(cal.id);
                }
                var acctId = (appCtxt.multiAccounts) ? cal.getAccount().id : appCtxt.accountList.mainAccount.id;
                if (!checkedAccountCalendarIds[acctId]) {
                    checkedAccountCalendarIds[acctId] = [];
                }
                checkedAccountCalendarIds[acctId].push(cal.id);
            }
        }
    }

    this._checkedCalendarsAll = trashFolder ? this._checkedCalendars.concat(trashFolder) : this._checkedCalendars;

    // convert hash to local array
    for (var i in checkedAccountCalendarIds) {
        this._checkedAccountCalendarIds.push(checkedAccountCalendarIds[i]);
    }

    if (!checkedCalendarHash) {
        // Not the initial call, update the stored calendar info.  Note this will be called when calendars are
        // checked/unchecked by the user (online or offline), and when notifications modifying the calendars
        // are received.
        this._storeCalendarCheckedState();
    }

    // return list of checked calendars
    return this._checkedCalendars;
};

ZmCalViewController.prototype._calTreeSelectionListener =
function(ev) {
	if (ev.detail != DwtTree.ITEM_CHECKED) { return; }

    // NOTE: This isn't called by the cal tree controller in all cases so
    // NOTE: we need to make sure the checked calendar list is up-to-date.
	this._updateCheckedCalendars();

	if (!this._calItemStatus) {
		this._calItemStatus = {};
	}

	if (ev.item) {
        var organizer = ev.item.getData && ev.item.getData(Dwt.KEY_OBJECT);
        if (organizer && organizer.nId == ZmOrganizer.ID_TRASH) {
            var found = false;
            var acct = organizer.getAccount();
            var organizers = this.getCheckedOrganizers(true, acct);
            for (var i = 0; i < organizers.length; i++) {
                var id = organizers[i].nId;
                if (id == ZmOrganizer.ID_TRASH) {
                    found = true;
                    break;
                }
            }
            this._viewMgr.setSubContentVisible(found);
            return;
        }
		ev.items = [ ev.item ];
	}
	if (ev.items && ev.items.length) {
		for (var i = 0; i < ev.items.length; i++) {
			var item = ev.items[i];
			this.__addCalItemStatus(item, item.getChecked());
		}
	}

	// update calendar state on time delay to avoid race condition
	if (!this._updateCalItemStateActionId) {
		this._updateCalItemStateActionId = AjxTimedAction.scheduleAction(new AjxTimedAction(this, this._updateCalItemState), 1200);
	}
};

ZmCalViewController.prototype.__addCalItemStatus =
function(item, checked) {
	item.setChecked(checked);
	var organizer = item.getData(Dwt.KEY_OBJECT);
	if (organizer && organizer.type == ZmOrganizer.CALENDAR) {
        AjxDebug.println(AjxDebug.CALENDAR, " ---------------- calendar " +  organizer.name + " [" + organizer.id + "] is " + (checked ? "checked" : "unchecked"));
		this._calItemStatus[organizer.id] = {item: organizer, checked: checked};
	}

	// bug 6410
	var items = item.getItems();
	for (var i = 0; i < items.length; i++) {
		item = items[i];
		this.__addCalItemStatus(item, checked);
	}
};

ZmCalViewController.prototype._updateCalItemState =
function() {
	if (!this._calItemStatus) { return; }

	var accountName = appCtxt.isOffline && appCtxt.accountList.mainAccount.name;
	var batchCmd = new ZmBatchCommand(null, accountName, true);
	var itemCount = 0;
    for (var i in this._calItemStatus) {
        var info = this._calItemStatus[i];
        if (info.item) {
            var calendar = info.item;
            //If, Remote Calendars & not mount-points, dont send check/uncheck requests
            if ((calendar.isRemote() && (!calendar.isMountpoint || !calendar.zid))) {
                calendar.isChecked = info.checked;
                calendar.checkedCallback(info.checked);
                this._handleCheckedCalendarRefresh(calendar);
            } else {
                batchCmd.add(new AjxCallback(calendar, calendar.checkAction, [info.checked]));
                itemCount++;
            }
        }
    }

    if (appCtxt.multiAccounts) {
        this.apptCache.clearCache();
    }

    if (itemCount > 0) {
        if (appCtxt.isWebClientOffline()) {
            // The offlineCallback gets bound inside batchCmd.run to this
            var offlineCallback = this._handleOfflineCalendarCheck.bind(this, batchCmd);
            batchCmd.run(null, null, offlineCallback);
        } else {
            this._calItemStatus = {};
            batchCmd.run();
        }
    }

	this._updateCalItemStateActionId = null;
};

// Update the check change locally (a folder and its subfolders) and store the batch command into the request queue
ZmCalViewController.prototype._handleOfflineCalendarCheck =
function(batchCmd) {

    // Json batchCommand created in _updaetCalItemState above.  Must be Json to be stored in offline request queue
    var jsonObj = batchCmd.getRequestBody();

    this.apptCache.clearCache();
    // Apply the changes locally
    var calendarIds = [];
    for (var i in this._calItemStatus) {
        var info = this._calItemStatus[i];
        if (info.item) {
            var calendar = info.item;
            calendarIds.push(calendar.id);
            // Remote non-mountpoint has aleady been processed for local display - ignore it
            if (!(calendar.isRemote() && (!calendar.isMountpoint || !calendar.zid))) {
                calendar.isChecked = info.checked;
                calendar.checkedCallback(info.checked);
                this._handleCheckedCalendarRefresh(calendar);
            }
        }
    }
     this._calItemStatus = {};

    // Store the request for playback
    var jsonObjCopy = $.extend(true, {}, jsonObj);  //Always clone the object.  ?? Needed here ??
    // This should be the only BatchCommand queued for calendars for replay (for the FolderAction, checked).
    jsonObjCopy.methodName = "BatchRequest";
    // Modify the id to thwart ZmOffline._handleResponseSendOfflineRequest, which sends a DELETE
    // notification for the id - so a single calendar would get deleted in the UI
    jsonObjCopy.id = "C" + calendarIds.join(":");
    var value = {
        update:          true,
        methodName:      jsonObjCopy.methodName,
        id:              jsonObjCopy.id,
        value:           jsonObjCopy
    };

    // No callback - we apply the check changes, whether or not the request goes into the queue successfully
    ZmOfflineDB.setItemInRequestQueue(value);
};


ZmCalViewController.prototype._handleCheckedCalendarRefresh =
function(calendar){
	this._updateCheckedCalendars();
	this._refreshAction(true);
};

ZmCalViewController.prototype._calTreeChangeListener =
function(ev) {
	if (ev.event == ZmEvent.E_DELETE) {
		this._updateCheckedCalendars();
	}
    if (ev.event == ZmEvent.E_MODIFY) {
        var details = ev.getDetails(),
            fields = details ? details.fields : null;

        if (fields && (fields[ZmOrganizer.F_COLOR] || fields[ZmOrganizer.F_RGB])) {
            this._refreshAction(true);
        }
	}
};

ZmCalViewController.prototype.getApptCache =
function(){
    return this.apptCache;
};
    
/**
 * Gets the calendar by folder id.
 * 
 * @param	{String}	folderId		the folder id
 * @return	{ZmCalendar}	the calendar
 */
ZmCalViewController.prototype.getCalendar =
function(folderId) {
	return appCtxt.getById(folderId);
};

/**
 * Gets the calendar for the specified account.
 *
 * @param   {Hash}      params              Param hash
 * @param	{Boolean}	params.includeLinks	if <code>true</code>, include links
 * @param   {Boolean}   params.onlyWritable if <code>true</code> only writable calendars
 * @param	{ZmAccount}	params.account		the account
 * @return	{Array}	an array of {ZmCalendar} objects
 */
ZmCalViewController.prototype.getCalendars =
function(params) {
	params = params || {};
	var account = params.account;
	var includeLinks = params.includeLinks;
	var onlyWritable = params.onlyWritable;
	this._updateCheckedCalendars();
	var calendars = [];
	var organizers = appCtxt.getFolderTree(account).getByType(ZmOrganizer.CALENDAR);
	for (var i = 0; i < organizers.length; i++) {
		var organizer = organizers[i];
		if ((organizer.zid && !includeLinks) ||
			(appCtxt.multiAccounts &&
			 organizer.nId == ZmOrganizer.ID_CALENDAR &&
			 organizer.getAccount().isCalDavBased()))
		{
			continue;
		}

		if (account && organizer.getAccount() != account) { continue; }

		if (onlyWritable && organizer.isReadOnly()) continue;

		calendars.push(organizer);
	}
	calendars.sort(ZmCalViewController.__BY_NAME);
	return calendars;
};

ZmCalViewController.__BY_NAME =
function(a, b) {
	return a.name.localeCompare(b.name);
};

// todo: change to currently "selected" calendar
ZmCalViewController.prototype.getDefaultCalendarFolderId =
function() {
	return ZmOrganizer.ID_CALENDAR;
};

/**
 * Gets the calendar color.
 * 
 * @param	{String}	folderId		the folder id
 * @return	{String}	the color
 */
ZmCalViewController.prototype.getCalendarColor =
function(folderId) {
	if (!folderId) { return ZmOrganizer.DEFAULT_COLOR[ZmOrganizer.CALENDAR]; }
	var cal = this.getCalendar(folderId);
	return cal ? cal.color : ZmOrganizer.DEFAULT_COLOR[ZmOrganizer.CALENDAR];
};

ZmCalViewController.prototype._refreshButtonListener =
function(ev) {
	//Return if a search is already in progress
	if (this.searchInProgress) {
		return;
	}
    this.setCurrentListView(null);
    
	// bug fix #33830 - force sync for calendar refresh
	if (appCtxt.isOffline) {
		appCtxt.accountList.syncAll();
	}

	var app = appCtxt.getApp(ZmApp.CALENDAR);
	// reset possibly set user query
	this._userQuery = null;
	if (app === appCtxt.getCurrentApp()) {
		var sc = appCtxt.getSearchController();
		sc.setSearchField("");
		sc.getSearchToolbar().blur();
	}
	app.currentSearch = null;
	app.currentQuery = null;
	this._refreshMaintenance = true;
    this.searchInProgress = false;
	this._refreshAction(false);

	var overview = appCtxt.getOverviewController().getOverview(app.getOverviewId());
	if (overview) {
		overview.clearSelection();
	}

};

// Move button has been pressed, show the dialog.
ZmCalViewController.prototype._apptMoveListener =
function(ev) {
	var items = this.getSelection();
	var divvied = (items.length > 1) ? this._divvyItems(items) : null;

	if (divvied && divvied.readonly.length > 0) {
		var dlg = appCtxt.getMsgDialog();
		var list = [];
		if (divvied.normal.length > 0) {
			list = list.concat(divvied.normal);
		}
		if (divvied.recurring.length > 0) {
			list = list.concat(this._dedupeSeries(divvied.recurring));
		}
		var callback = (list.length > 0)
			? (new AjxCallback(this, this._moveListener, [ev, list])) : null;
		var listener = new AjxListener(this, this._handleReadonlyOk, [callback, dlg]);
		dlg.setButtonListener(DwtDialog.OK_BUTTON, listener);
		dlg.setMessage(ZmMsg.moveReadonly);
		dlg.popup();
	}
	else {
		this._moveListener(ev, this._dedupeSeries(items));
	}
};

ZmCalViewController.prototype._isItemMovable =
function(item, isShiftKey, folder) {
	return (!isShiftKey && !folder.isReadOnly() && !appCtxt.isWebClientOffline());
};

ZmCalViewController.prototype._moveCallback =
function(folder) {
	if (this.isMovingBetwAccounts(this._pendingActionData, folder.id)) {
        var dlg = appCtxt.getMsgDialog();
        dlg.setMessage(ZmMsg.orgChange, DwtMessageDialog.WARNING_STYLE);
        dlg.popup();
        return false;
    }else if (this.isMovingBetwAcctsAsAttendee(this._pendingActionData, folder.id)) {
		var dlg = appCtxt.getMsgDialog();
		dlg.setMessage(ZmMsg.apptInviteOnly, DwtMessageDialog.WARNING_STYLE);
		dlg.popup();
	} else {
		this._doMove(this._pendingActionData, folder, null, false);
		this._clearDialog(appCtxt.getChooseFolderDialog());
		this._pendingActionData = null;
	}
};

ZmCalViewController.prototype._changeOrgCallback =
function(dlg, folder) {
	dlg.popdown();
	ZmListController.prototype._moveCallback.call(this, folder);
};

ZmCalViewController.prototype._doTag =
function(items, tag, doTag) {

	var list = this._getTaggableItems(items);

	if (doTag) {
		if (list.length > 0 && list.length == items.length) {
			// there are items to tag, and all are taggable
			ZmListController.prototype._doTag.call(this, list, tag, doTag);
		} else {
			var msg;
			var dlg = appCtxt.getMsgDialog();
			if (list.length > 0 && list.length < items.length) {
				// there are taggable and nontaggable items
				var listener = new AjxListener(this, this._handleDoTag, [dlg, list, tag, doTag]);
				dlg.setButtonListener(DwtDialog.OK_BUTTON, listener);
				msg = ZmMsg.tagReadonly;
			} else if (list.length == 0) {
				// no taggable items
				msg = ZmMsg.nothingToTag;
			}
			dlg.setMessage(msg);
			dlg.popup();
		}
	} else if (list.length > 0) {
		ZmListController.prototype._doTag.call(this, list, tag, doTag);
	}
};

ZmCalViewController.prototype._doRemoveAllTags =
function(items) {
	var list = this._getTaggableItems(items);
	ZmListController.prototype._doRemoveAllTags.call(this, list);
};

ZmCalViewController.prototype._handleDoTag =
function(dlg, list, tag, doTag) {
	dlg.popdown();
	ZmListController.prototype._doTag.call(this, list, tag, doTag);
};

ZmCalViewController.prototype._getTaggableItems =
function(items) {
	var divvied = (items.length > 1) ? this._divvyItems(items) : null;

	if (divvied && (divvied.readonly.length > 0 || divvied.shared.length > 0)) {
		// get a list of items that are "taggable"
		items = [];
		for (var i in divvied) {
			// we process read only appts b/c it can also mean any appt where
			// i'm not the organizer but still resides in my local folder.
			if (i == "shared") { continue; }

			var list = divvied[i];
			for (var j = 0; j < list.length; j++) {
				var appt = list[j];
				var calendar = appt.getFolder();
				if (calendar && !calendar.isRemote()) {
					items.push(appt);
				}
			}
		}
	}

	return items;
};

ZmCalViewController.prototype._getToolBarOps =
function() {
    var toolbarOptions = [
		ZmOperation.DELETE, ZmOperation.SEP, ZmOperation.MOVE_MENU,
		ZmOperation.TAG_MENU,
		ZmOperation.SEP,
		ZmOperation.PRINT_CALENDAR,
		ZmOperation.SEP,
		ZmOperation.TODAY,
        ZmOperation.FILLER,
        ZmOperation.DAY_VIEW,
        ZmOperation.WORK_WEEK_VIEW,
        ZmOperation.WEEK_VIEW,
		ZmOperation.MONTH_VIEW,
        ZmOperation.CAL_LIST_VIEW
	];
    if( appCtxt.get(ZmSetting.FREE_BUSY_VIEW_ENABLED) ){
        toolbarOptions.push(ZmOperation.FB_VIEW);
    }
    return toolbarOptions;
};

/* This method is called from ZmListController._setup. We control when this method is called in our
 * show method. We ensure it is only called once i.e the first time show is called
 */
ZmCalViewController.prototype._initializeToolBar =
function(viewId) {
	if (this._toolbar[ZmId.VIEW_CAL]) { return; }

	ZmListController.prototype._initializeToolBar.call(this, ZmId.VIEW_CAL_DAY);
	var toolbar = this._toolbar[ZmId.VIEW_CAL_DAY];

	// Set the other view toolbar entries to point to the Day view entry. Hack
	// to fool the ZmListController into thinking there are multiple toolbars
    this._toolbar[ZmId.VIEW_CAL_FB] = this._toolbar[ZmId.VIEW_CAL_WEEK] =
	this._toolbar[ZmId.VIEW_CAL_WORK_WEEK] = this._toolbar[ZmId.VIEW_CAL_MONTH] =
	this._toolbar[ZmId.VIEW_CAL_LIST] = this._toolbar[ZmId.VIEW_CAL_DAY];

	this._toolbar[ZmId.VIEW_CAL] = toolbar;

	// Setup the toolbar stuff
	toolbar.enable([ZmOperation.PAGE_BACK, ZmOperation.PAGE_FORWARD], true);
	toolbar.enable([ZmOperation.WEEK_VIEW, ZmOperation.MONTH_VIEW, ZmOperation.DAY_VIEW], true);

	// We have style sheets in place to position the navigation toolbar at the
	// center of the main toolbar. The filler is usually at that location, so
	// to ensure that the semantic order matches the visual order as close as
	// possible, we position the navigation toolbar after it.
	var pos = AjxUtil.indexOf(this._getToolBarOps(), ZmOperation.FILLER) + 1;

	var tb = new ZmNavToolBar({
		parent: toolbar,
		index: pos,
		className: "ZmNavToolbar ZmCalendarNavToolbar",
		context: ZmId.VIEW_CAL,
		posStyle: Dwt.ABSOLUTE_STYLE
	});
	this._setNavToolBar(tb, ZmId.VIEW_CAL);

	var printButton = toolbar.getButton(ZmOperation.PRINT_CALENDAR);
	if (printButton) {
		printButton.setToolTipContent(ZmMsg.printCalendar);
	}

	toolbar.getButton(ZmOperation.DELETE).setToolTipContent(ZmMsg.hardDeleteTooltip);

	appCtxt.notifyZimlets("initializeToolbar", [this._app, toolbar, this, viewId], {waitUntilLoaded:true});
};

ZmCalViewController.prototype._initializeTabGroup = function(viewId) {
	if (this._tabGroups[viewId]) {
		return;
	}

	ZmListController.prototype._initializeTabGroup.apply(this, arguments);

	// this is kind of horrible, but since list views don't normally have
	// children, we can't do this the right way by having a tab group in
	// ZmCalListView
	if (viewId === ZmId.VIEW_CAL_LIST) {
		var view = this._view[viewId];
		var topTabGroup = view._getSearchBarTabGroup();

		this._tabGroups[viewId].addMemberBefore(topTabGroup, view);
	}
}

ZmCalViewController.prototype.runRefresh =
function() {
	this._refreshButtonListener();
};

ZmCalViewController.prototype._setView =
function(params) {
	if (!this.isSearchResults) {
		ZmListController.prototype._setView.apply(this, arguments);
	}
};

ZmCalViewController.prototype._setViewContents =
function(viewId) {
	// Ignore since this will always be ZmId.VIEW_CAL as we are fooling
	// ZmListController (see our show method)
};

ZmCalViewController.prototype._getTagMenuMsg =
function(num) {
	return AjxMessageFormat.format(ZmMsg.tagAppts, num);
};

ZmCalViewController.prototype._createNewView =
function(viewId) {
	return this._viewMgr.createView(viewId);
};

// Switch to selected view.
ZmCalViewController.prototype._viewActionMenuItemListener =
function(ev) {
	Dwt.setLoadingTime("ZmCalItemView");
	if (appCtxt.multiAccounts) {
		this.apptCache.clearCache();
	}
	var id = ev.item.getData(ZmOperation.KEY_ID);
    var viewType = ZmCalViewController.OP_TO_VIEW[id];
    //Check if the view is current calendar view
    if (this.getCurrentViewType() === viewType) {
        return;
    }
	this.show(viewType);
};

// Switch to selected view.
ZmCalViewController.prototype._viewMenuItemListener =
function(ev) {

};

/**
 * Creates the mini-calendar widget that sits below the overview.
 * 
 * @param {Date}		date		the date to highlight (defaults to today)
 * @private
 */
ZmCalViewController.prototype._createMiniCalendar =
function(date) {
	var calMgr = appCtxt.getCalManager();
	if (calMgr._miniCalendar == null) {
		calMgr._createMiniCalendar(date);
		this._miniCalendar = calMgr.getMiniCalendar();
	} else {
		this._miniCalendar = calMgr.getMiniCalendar();
		if (date != null) {
			this._miniCalendar.setDate(date, true);
		}
	}
	this._minicalMenu = calMgr._miniCalMenu;
	this._miniCalDropTarget = calMgr._miniCalDropTarget;
};

ZmCalViewController.prototype.recreateMiniCalendar =
function() {
	var calMgr = appCtxt.getCalManager();
	if (calMgr._miniCalendar != null) {
		var mc = calMgr.getMiniCalendar();
		var el = mc.getHtmlElement();
		var date = mc.getDate();
		if(el) {
			el.parentNode.removeChild(el);
		}
		this._miniCalendar = null;
		calMgr._miniCalendar = null;
		calMgr._createMiniCalendar(date);
		this._miniCalendar = calMgr.getMiniCalendar();
		this._createMiniCalendar();
	}
};

ZmCalViewController.prototype._miniCalDropTargetListener =
function(ev) {

	if (appCtxt.isWebClientOffline()) return;

	var data = ((ev.srcData.data instanceof Array) && ev.srcData.data.length == 1)
	? ev.srcData.data[0] : ev.srcData.data;

	// use shiftKey to create new Tasks if enabled. NOTE: does not support Contacts yet
	var shiftKey = appCtxt.get(ZmSetting.TASKS_ENABLED) && ev.uiEvent.shiftKey;

	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		// Hack: in some instances ZmContact is reported as being an Array of
		//       length 1 (as well as a ZmContact) under FF1.5
		if (data instanceof Array && data.length > 1) {
			var foundValid = false;
			for (var i = 0; i < data.length; i++) {
				if (!shiftKey && (data[i] instanceof ZmContact)) {
					if (data[i].isGroup() && data[i].getGroupMembers().good.size() > 0) {
						foundValid = true;
					} else {
						var email = data[i].getEmail();
						if (email && email != "")
							foundValid = true;
					}
				} else {
					// theres other stuff besides contacts in here.. bail
					ev.doIt = false;
					return;
				}
			}

			// if not a single valid email was found in list of contacts, bail
			if (!foundValid) {
				ev.doIt = false;
				return;
			}
		} else {
			if (!this._miniCalDropTarget.isValidTarget(data)) {
				ev.doIt = false;
				return;
			}

			// If dealing with a contact, make sure it has a valid email address
			if (!shiftKey && data.isZmContact) {
				if (data.isGroup() && !data.isDistributionList()) {
					ev.doIt = (data.getGroupMembers().good.size() > 0);
				} else {
					var email = data.getEmail();
					ev.doIt = (email != null && email != "");
				}
			}
		}
	} else if (ev.action == DwtDropEvent.DRAG_DROP) {
		var dropDate = this._miniCalendar.getDndDate();

		if (dropDate) {
			// bug fix #5088 - reset time to next available slot
			var now = new Date();
			dropDate.setHours(now.getHours());
			dropDate.setMinutes(now.getMinutes());
			dropDate = AjxDateUtil.roundTimeMins(dropDate, 30);

			if ((data instanceof ZmContact) ||
				((data instanceof Array) && data[0] instanceof ZmContact))
			{
				this.newApptFromContact(data, dropDate);
			}
			else
			{
				if (shiftKey) {
					AjxDispatcher.require(["TasksCore", "Tasks"]);
					appCtxt.getApp(ZmApp.TASKS).newTaskFromMailItem(data, dropDate);
				} else {
					this.newApptFromMailItem(data, dropDate);
				}
			}
		}
	}
};

/**
 * This method will create a new appointment from a conversation/mail message. In the case
 * of a conversation, the appointment will be populated by the first message in the
 * conversation (or matched msg in the case of a search). This method is asynchronous and
 * will return immediately if the mail message must load in the background.
 *
 * @param {ZmConv|ZmMailMsg}	mailItem the may either be a conversation of message
 * @param {Date}	date 	the date/time for the appointment
 */
ZmCalViewController.prototype.newApptFromMailItem =
function(mailItem, date) {
	var subject = mailItem.subject || "";
	if (mailItem instanceof ZmConv) {
		mailItem = mailItem.getFirstHotMsg();
	}
	mailItem.load({getHtml:false, markRead: true, forceLoad: true, noTruncate: true,
	               callback:new AjxCallback(this, this._msgLoadedCallback, [mailItem, date, subject])});
};

ZmCalViewController.prototype._msgLoadedCallback =
function(mailItem, date, subject) {
	var newAppt = this._newApptObject(date, null, null, mailItem);
	newAppt.setFromMailMessage(mailItem, subject);
	
	 if (appCtxt.get(ZmSetting.GROUP_CALENDAR_ENABLED)) {
        var addAttendeeDlg = this._attAttendeeDlg = appCtxt.getYesNoMsgDialog();
        addAttendeeDlg.reset();
        addAttendeeDlg.setMessage(ZmMsg.addRecipientstoAppt, DwtMessageDialog.WARNING_STYLE, ZmMsg.addAttendees);
        addAttendeeDlg.registerCallback(DwtDialog.YES_BUTTON, this._addAttendeeYesCallback, this, [newAppt]);
        addAttendeeDlg.registerCallback(DwtDialog.NO_BUTTON, this._addAttendeeNoCallback, this, [newAppt]);
        addAttendeeDlg.popup();
    }
    else {
        this.newAppointment(newAppt, ZmCalItem.MODE_NEW, true);
    }
};

ZmCalViewController.prototype._addAttendeeYesCallback =
function(newAppt) {
    this._attAttendeeDlg.popdown();
    this.newAppointment(newAppt, ZmCalItem.MODE_NEW, true);
};

ZmCalViewController.prototype._addAttendeeNoCallback =
function(newAppt) {
    this._attAttendeeDlg.popdown();
    newAppt.setAttendees(null,ZmCalBaseItem.PERSON);
    this.newAppointment(newAppt, ZmCalItem.MODE_NEW, true);
};


/**
 * This method will create a new appointment from a contact.
 *
 * @param {ZmContact}		contact the contact
 * @param {Date}	date 	the date/time for the appointment
 */
ZmCalViewController.prototype.newApptFromContact =
function(contact, date) {
	var emails = [];
	var list = AjxUtil.toArray(contact);
	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		if (item.isGroup() && !item.isDistributionList()) {
			var members = item.getGroupMembers().good.getArray();
			for (var j = 0; j < members.length; j++) {
				var e = members[j].address;
				if (e && e !== "") {
					emails.push(e);
				}
			}
		}
		else {
			// grab the first valid email address for this contact
			var e = item.getEmail();
			if (e && e !== "") {
				emails.push(e);
			}
		}
	}

	if (emails.length > 0) {
		var newAppt = this._newApptObject(date);
		newAppt.setAttendees(emails, ZmCalBaseItem.PERSON);
		this.newAppointment(newAppt, ZmCalItem.MODE_NEW);
	}
};

/**
 * This method will create a new appointment from an email address.
 *
 * @param {String}	emailAddr	the email address
 * @param {Date}	date 	the date/time for the appointment
 */
ZmCalViewController.prototype.newApptFromEmailAddr =
function(emailAddr, date) {
	if (!emailAddr || emailAddr == "") {return; }

	var newAppt = this._newApptObject(date);
	newAppt.setAttendees(emailAddr, ZmCalBaseItem.PERSON);
	this.newAppointment(newAppt, ZmCalItem.MODE_NEW);
};

ZmCalViewController.prototype.getMiniCalendar =
function(delay) {
	if (!this._miniCalendar) {
		this._createMiniCalendar(null, delay);
	}
	return this._miniCalendar;
};

ZmCalViewController.prototype._todayButtonListener =
function(ev) {
    this.setCurrentListView(null);
	this.setDate(new Date(), 0, false);
};

ZmCalViewController.prototype._newApptAction =
function(ev) {
	var d = this._minicalMenu ? this._minicalMenu.__detail : null;

	if (d != null) {
		delete this._minicalMenu.__detail;
	} else {
		d = this._viewMgr ? this._viewMgr.getDate() : null;
	}

	// Bug 15686, eshum
	// Uses the selected timeslot if possible.
	var curr = this._viewVisible ? this._viewMgr.getDate() : new Date(); //new Date();
	if (d == null) {
		d = curr;
	} else {
		// bug fix #4693 - set the current time since it will be init'd to midnite
		d.setHours(curr.getHours());
		d.setMinutes(curr.getMinutes());
	}
	//bug:44423, Action Menu needs to select appropriate Calendar
	var calendarId = null;
	if (this._viewActionMenu && this._viewActionMenu._calendarId) {
		calendarId = this._viewActionMenu._calendarId;
		this._viewActionMenu._calendarId = null;
	}

	var loadCallback = new AjxCallback(this, this._handleLoadNewApptAction, [d, calendarId]);
	AjxDispatcher.require(["MailCore", "CalendarCore", "Calendar"], false, loadCallback, null, true);
};

ZmCalViewController.prototype._handleLoadNewApptAction =
function(d, calendarId) {
	appCtxt.getAppViewMgr().popView(true, ZmId.VIEW_LOADING);	// pop "Loading..." page
	this.newAppointmentHelper(d, null, calendarId);
};

ZmCalViewController.prototype._searchMailAction =
function(ev) {
	var d = this._minicalMenu ? this._minicalMenu.__detail : null;
	if (d != null) {
		delete this._minicalMenu.__detail;
		appCtxt.getSearchController().dateSearch(d, ZmId.SEARCH_MAIL);
	}
};

ZmCalViewController.prototype._newAllDayApptAction =
function(ev) {
	var d = this._minicalMenu ? this._minicalMenu.__detail : null;
	if (d != null) delete this._minicalMenu.__detail;
	else d = this._viewMgr ? this._viewMgr.getDate() : null;
	if (d == null) d = new Date();

	//bug:44423, Action Menu needs to select appropriate Calendar
	var calendarId = null;
	if (this._viewActionMenu && this._viewActionMenu._calendarId) {
		calendarId = this._viewActionMenu._calendarId;
		this._viewActionMenu._calendarId = null;
	}

	var loadCallback = new AjxCallback(this, this._handleLoadNewAllDayApptAction, [d, calendarId]);
	AjxDispatcher.require(["MailCore", "CalendarCore", "Calendar"], false, loadCallback, null, true);
};

ZmCalViewController.prototype._handleLoadNewAllDayApptAction =
function(d, calendarId) {
	appCtxt.getAppViewMgr().popView(true, ZmId.VIEW_LOADING);	// pop "Loading..." page
	this.newAllDayAppointmentHelper(d, null, calendarId);
};

ZmCalViewController.prototype._postShowCallback =
function() {
	ZmController.prototype._postShowCallback.call(this);
	this._viewVisible = true;
	if (this._viewMgr.needsRefresh()) {
		this._scheduleMaintenance(ZmCalViewController.MAINT_MINICAL|ZmCalViewController.MAINT_VIEW);
	}
    //this._app.setOverviewPanelContent();
};

ZmCalViewController.prototype._postHideCallback =
function() {
    if (appCtxt.multiAccounts) {
        var ovc = this._app.getOverviewContainer();
        var overviews = ovc.getOverviews();
        var overview;
        for (var ov in overviews) {
            ovc.getOverview(ov).zShow(false);
        }
    } else {
        overview =  this._app.getOverview();
        overview.zShow(false);
    }
    this._viewVisible = false;
};

ZmCalViewController.prototype.isCurrent =
function() {
    var currentView = this._viewMgr && this._viewMgr.getCurrentViewName();
    return (this._currentViewId === currentView);
};

ZmCalViewController.prototype._paginate =
function(viewId, forward) {
    this.setCurrentListView(null);
	var view = this._listView[viewId];
	var field = view.getRollField();
	var d = new Date(this._viewMgr.getDate());
	d = AjxDateUtil.roll(d, field, forward ? 1 : -1);
	this.setDate(d, 0, true);
    this._viewMgr.getView(viewId).checkIndicatorNeed(viewId,d);
};

/**
 * Sets the date.
 * 
 * @param	{Date}		date		the date
 * @param	{int}		duration	the duration
 * @param	{Boolean}	roll		if <code>true</code>, roll
 */
ZmCalViewController.prototype.setDate =
function(date, duration, roll) {
	AjxDispatcher.require(["MailCore", "CalendarCore", "Calendar"]);
	// set mini-cal first so it will cache appts we might need
	if (this._miniCalendar.getDate() == null ||
		this._miniCalendar.getDate().getTime() != date.getTime())
	{
		this._miniCalendar.setDate(date, true, roll);
	}
	if (this._viewMgr != null) {
		this._viewMgr.setDate(date, duration, roll);
		var viewId = this._viewMgr.getCurrentViewName();
		var currentView = this._viewMgr.getCurrentView();
		var title = currentView.getCalTitle();
		Dwt.setTitle([ZmMsg.zimbraTitle, ": ", title].join(""));
		if (!roll &&
			this._currentViewType == ZmId.VIEW_CAL_WORK_WEEK &&
			!currentView.workingHours[date.getDay()].isWorkingDay &&
			(date.getDay() == 0 || date.getDay() == 6))
		{
			this.show(ZmId.VIEW_CAL_WEEK);
		}
		if (ZmId.VIEW_CAL_MONTH == this._currentViewType) {
			title = this._viewMgr.getCurrentView().getShortCalTitle();
		}
        if (ZmId.VIEW_CAL_FB == this._currentViewType && roll && appCtxt.get(ZmSetting.FREE_BUSY_VIEW_ENABLED)) {
            currentView._navDateChangeListener(date);
		}
		this._navToolBar[ZmId.VIEW_CAL].setText(title);
	}
};

ZmCalViewController.prototype._dateSelectionListener =
function(ev) {
	this.setDate(ev.detail, 0, ev.force);
};

ZmCalViewController.prototype._miniCalSelectionListener =
function(ev) {
	if (ev.item instanceof DwtCalendar) {
		var loadCallback = new AjxCallback(this, this._handleLoadMiniCalSelection, [ev]);
		AjxDispatcher.require(["MailCore", "CalendarCore", "Calendar"], false, loadCallback, null, true);
	}
};

ZmCalViewController.prototype._handleLoadMiniCalSelection =
function(ev) {
	this.setDate(ev.detail, 0, ev.item.getForceRollOver());
	if (!this._viewVisible) {
		this.show();
	}
};

ZmCalViewController.prototype.newApptObject =
function(startDate, duration, folderId, mailItem) {
	return this._newApptObject(startDate, duration, folderId, mailItem);
};

ZmCalViewController.prototype._newApptObject =
function(startDate, duration, folderId, mailItem) {
	var newAppt = new ZmAppt();
	newAppt.setStartDate(AjxDateUtil.roundTimeMins(startDate, 30));
	newAppt.setEndDate(newAppt.getStartTime() + (duration ? duration : ZmCalViewController.DEFAULT_APPOINTMENT_DURATION));
	newAppt.resetRepeatWeeklyDays();
	newAppt.resetRepeatMonthlyDayList();
	newAppt.resetRepeatYearlyMonthsList(startDate.getMonth()+1);
	newAppt.resetRepeatCustomDayOfWeek();
    var defaultWarningTime = appCtxt.get(ZmSetting.CAL_REMINDER_WARNING_TIME);
	if (defaultWarningTime) {
		newAppt.setReminderMinutes(defaultWarningTime);
	}

	if (folderId) {
		newAppt.setFolderId(folderId);
	} else {
		// get folderId from mail message if being created off of one
		if (appCtxt.multiAccounts && mailItem) {
			newAppt.setFolderId(mailItem.getAccount().getDefaultCalendar().id);
		} else {
			// bug: 27646 case where only one calendar is checked
			var checkedFolderIds = this.getCheckedCalendarFolderIds();
			if (checkedFolderIds && checkedFolderIds.length == 1) {
				var calId = checkedFolderIds[0];
				var cal = appCtxt.getById(calId);
				// don't use calendar if feed, or remote and don't have write perms
				if (cal) {
					var share = cal.getMainShare();
					var skipCal = (cal.isFeed() || (cal.link && share && !share.isWrite()));
					if (cal && !skipCal) {
						newAppt.setFolderId(calId);
					}
				}
			} else if (appCtxt.multiAccounts) {
				// calendar app has no notion of "active" app, so always set to default calendar
				this.defaultAccount = appCtxt.isFamilyMbox ? this.mainAccount : this.visibleAccounts[1];
				newAppt.setFolderId(calId);
			}
		}
	}
	newAppt.setPrivacy((appCtxt.get(ZmSetting.CAL_APPT_VISIBILITY) == ZmSetting.CAL_VISIBILITY_PRIV)?"PRI" :"PUB");
	return newAppt;
};

ZmCalViewController.prototype._timeSelectionListener =
function(ev) {
    if (!this._app.containsWritableFolder()) {
        return;
    }
	var view = this._viewMgr.getCurrentView();
	if (view.getSelectedItems().size() > 0) {
		view.deselectAll();
		this._resetOperations(this._toolbar[ZmId.VIEW_CAL_DAY], 0);
	}
	this.setDate(ev.detail, 0, ev.force);

	// popup the edit dialog
	if (ev._isDblClick){
		this._apptFromView = view;
		var appt = this._newApptObject(ev.detail);
		appt.setAllDayEvent(ev.isAllDay);
		if (ev.folderId) {
			appt.setFolderId(ev.folderId);
		}
		this._showQuickAddDialog(appt, ev.shiftKey);
	}
};

ZmCalViewController.prototype._printCalendarListener =
function(ev) {
	var url,
	    viewId = this._viewMgr.getCurrentViewName(),
        printDialog = this._printDialog,
        wHrs = ZmCalBaseView.parseWorkingHours(ZmCalBaseView.getWorkingHours()),
        curDate = this._viewMgr.getDate() || new Date();

    if(!printDialog) {
        printDialog = this.createPrintDialog();
    }

    var org = ZmApp.ORGANIZER[this._app._name] || ZmOrganizer.FOLDER;
    var params = {
                overviewId: appCtxt.getOverviewId(["ZmCalPrintDialog", this._app._name], null),
                treeIds: [org],
                treeStyle: DwtTree.CHECKEDITEM_STYLE,
                appName: this._app._name,
                currentViewId: viewId,
                workHours: wHrs[curDate.getDay()],
                currentDate: curDate,
                timeRange: this.getViewMgr().getView(viewId).getTimeRange()
            };

    printDialog.popup(params);

    this._printDialog = printDialog;
    /*
	if (viewId == ZmId.VIEW_CAL_LIST)
	{
		var ids = [];
		var list = this.getSelection();
		for (var i = 0; i < list.length; i++) {
			ids.push(list[i].invId);
		}
        url = ["/h/printappointments?id=", ids.join(','), "&tz=", AjxTimezone.getServerId(AjxTimezone.DEFAULT)];
        if(appCtxt.isOffline) {
            if (ids.length == 1) {
                var appt = this.getSelection()[0];
                url.push("&acct=", appt.getFolder().getAccount().name);
            }
            url.push("&zd=", "true");
        }
        url = url.join("");
    } else {
		var date = this._viewMgr
			? this._viewMgr.getDate()
			: (new Date());

		var day = (date.getDate() < 10)
			? ('0' + date.getDate())
			: date.getDate();

		var month = date.getMonth() + 1;
		if (month < 10) {
			month = '0' + month;
		}

		var view;
		switch (viewId) {
			case ZmId.VIEW_CAL_DAY: 		view = "day"; break;
			case ZmId.VIEW_CAL_WORK_WEEK:	view = "workWeek"; break;
			case ZmId.VIEW_CAL_WEEK:		view = "week"; break;
			case ZmId.VIEW_CAL_SCHEDULE:	view = "schedule"; break;
			default:						view = "month"; break;				// default is month
		}

		var folderIds = this.getCheckedCalendarFolderIds();
		var l = folderIds.join(",");

		url = [
			"/h/printcalendar?view=", view,
			"&l=", l,
			"&date=", date.getFullYear(), month, day,
			"&tz=",AjxTimezone.getServerId(AjxTimezone.DEFAULT)
		].join("");
	} */

	//window.open(appContextPath+url, "_blank");
};

ZmCalViewController.prototype.createPrintDialog =
function() {
    var pd,
        params = {},
        curDate = this._viewMgr.getDate() || new Date();

    //params.calendars = this.getCalTreeController().getOwnedCalendars(this._app.getOverviewId(), appCtxt.getActiveAccount().getEmail());
    params.parent = this._shell;
    pd = new ZmCalPrintDialog(params);
    return pd;
};

ZmCalViewController.prototype._printListener =
function(ev) {
    var ids = [];
    var list = this.getSelection();
    if (list.length == 0) {
        // Calendar list view is anomalous - on a right click (action menu) when resetOperations
        // is called, getSelection returns 1 item, but the selection actually only occurs if it was a
        // left click.  So we can get here with no selections.  Use the appt associated with the menu.
        var actionMenu = this.getActionMenu();
        var appt = actionMenu.__appt;
        if (appt) {
            ids.push(appt.invId);
        }
        // bug:68735 if no selection is made in the calendar, open up the print dialog
        else{
            this._printCalendarListener(ev);
        }

    }
    else {
        for (var i = 0; i < list.length; i++) {
            ids.push(list[i].invId);
        }
    }
    if (ids.length == 0) return;

    var url = ["/h/printappointments?id=", ids.join(','), "&tz=", AjxTimezone.getServerId(AjxTimezone.DEFAULT)];
    if(appCtxt.isOffline) {
        if (ids.length == 1) {
            var appt = this.getSelection()[0];
            url.push("&acct=", appt.getFolder().getAccount().name);
        }
        url.push("&zd=", "true");
    }
    url = url.join("");

    window.open(appContextPath+url, "_blank");
};

ZmCalViewController.prototype._deleteListener =
function(ev) {
	var op = (ev && ev.item instanceof DwtMenuItem)
		? ev.item.parent.getData(ZmOperation.KEY_ID) : null;
	this._doDelete(this.getSelection(), null, null, op);
};

ZmCalViewController.prototype._replyListener =
function(ev) {
	var op = (ev && ev.item instanceof DwtMenuItem)
		? ev.item.parent.getData(ZmOperation.KEY_ID) : null;
	var items = this.getSelection();
	if (items && items.length)
		this._replyAppointment(items[0], false);
};

ZmCalViewController.prototype._replyAllListener =
function(ev) {
	var op = (ev && ev.item instanceof DwtMenuItem)
		? ev.item.parent.getData(ZmOperation.KEY_ID) : null;
	var items = this.getSelection();
	if (items && items.length)
		this._replyAppointment(items[0], true);
};

ZmCalViewController.prototype._forwardListener =
function(ev) {
	var op = (ev && ev.item instanceof DwtMenuItem)
		? ev.item.parent.getData(ZmOperation.KEY_ID) : null;
	this._doForward(this.getSelection(), op);
};

ZmCalViewController.prototype._duplicateApptListener =
function(ev) {
	var op = (ev && ev.item instanceof DwtMenuItem)
		? ev.item.parent.getData(ZmOperation.KEY_ID) : null;
	var items = this.getSelection();
	var appt = items[0];
	var isException = (appt.isRecurring() && op == ZmOperation.VIEW_APPT_INSTANCE);
	this.duplicateAppt(appt, {isException: isException});
};

ZmCalViewController.prototype.duplicateAppt =
function(appt, params) {
	Dwt.setLoadingTime("ZmCalendarApp-cloneAppt");
	var clone = ZmAppt.quickClone(appt);
	var mode = ZmCalItem.MODE_EDIT;
	if (appt.isRecurring()) {
		mode = params.isException ? ZmCalItem.MODE_COPY_SINGLE_INSTANCE : ZmCalItem.MODE_EDIT_SERIES;  //at first I also created a MODE_COPY_SERIES but I'm afraid of the impact and regressions. So keep it as "edit".
	}
	clone.getDetails(mode, new AjxCallback(this, this._duplicateApptContinue, [clone, ZmCalItem.MODE_NEW, params]));
	Dwt.setLoadedTime("ZmCalendarApp-cloneAppt");
};

ZmCalViewController.prototype._duplicateApptContinue =
function(appt, mode, params) {
	if(params.isException) appt.clearRecurrence();
	if(params.startDate) appt.setStartDate(params.startDate);
	if(params.endDate) appt.setEndDate(params.endDate);

    if (!appt.isOrganizer() || appt.isReadOnly()) {  //isOrganizer means current user is the organizer of the appt. (which is not the case if the appt is on a shared folder, even if the current user has admin or manager rights (i.e. not read only)
          var origOrganizer=appt.organizer;
          var myEmail=appt.getFolder().getAccount().getEmail();
          appt.replaceAttendee(myEmail,origOrganizer);
          appt.organizer=myEmail;
          appt.isOrg=true;
          if(appt.isShared()) {
            appt.isSharedCopy = true;
			if (!appt.getFolderId()) { //not sure why the following line is done, but if the appt is of a certain folder, it should be kept that folder in the copy.
            	appt.setFolderId(ZmOrganizer.ID_CALENDAR);
			}
          }
          var dlg = appCtxt.getMsgDialog();
		  var callback = new AjxCallback(this, this.newAppointment,[appt,mode,true]);
		  var listener = new AjxListener(this, this._handleReadonlyOk, [callback, dlg]);
		  dlg.setButtonListener(DwtDialog.OK_BUTTON, listener);
		  dlg.setMessage(ZmMsg.confirmApptDuplication);
		  dlg.popup();
    }
    else {
		appt.organizer = null; // Let the organizer be set according to the choise in the form. (the calendar).
	    this.newAppointment(appt, mode, true);
    }
};

ZmCalViewController.prototype._proposeTimeListener =
function(ev) {
	var op = ev.item.parent.getData(ZmOperation.KEY_ID);

	var items = this.getSelection();

	// listview cannot handle proposing time for multiple items at once
	if (this._viewMgr.getCurrentViewName() == ZmId.VIEW_CAL_LIST && items.length > 1) {
		return;
	}

	var mode = ZmCalItem.MODE_EDIT;
	if (op == ZmOperation.VIEW_APPT_INSTANCE || op == ZmOperation.VIEW_APPT_SERIES) {
		mode = (op == ZmOperation.VIEW_APPT_INSTANCE)
			? ZmCalItem.MODE_EDIT_SINGLE_INSTANCE
			: ZmCalItem.MODE_EDIT_SERIES;
	}

	var appt = items[0];
	var clone = ZmAppt.quickClone(appt);
	clone.setProposeTimeMode(true);
	clone.getDetails(mode, new AjxCallback(this, this._proposeTimeContinue, [clone, mode]));
};

ZmCalViewController.prototype._proposeTimeContinue =
function(appt, mode) {
	appt.setViewMode(mode);
	AjxDispatcher.run("GetApptComposeController").proposeNewTime(appt);
};

ZmCalViewController.prototype._reinviteAttendeesListener =
function(ev) {
    var items = this.getSelection();
    // listview cannot handle reinvite for multiple items at once
    if (this._viewMgr.getCurrentViewName() == ZmId.VIEW_CAL_LIST && items.length > 1) {
        return;
    }
    // Get the details.  Otherwise, on send, any missing information will be deleted server side
    var detailsSuccessCallback = this._sendAppt.bind(this, items[0]);
    items[0].getDetails(null, detailsSuccessCallback, this._errorCallback);
};

ZmCalViewController.prototype._sendAppt =
function(appt) {
    var mode = appt.viewMode;
    appt.viewMode =  ZmCalItem.MODE_EDIT;

    var callback = new AjxCallback(this, this._handleResponseSave, appt);
    var errorCallback = new AjxCallback(this, this._handleErrorSave, appt);
    appt.send(null, callback, errorCallback);

    appt.viewMode = mode;
};

ZmCalViewController.prototype._handleResponseSave =
function(response) {
    appCtxt.setStatusMsg(ZmMsg.apptSent);
};

ZmCalViewController.prototype._handleErrorSave =
function(calItem, ex) {
    var status = calItem.processErrorSave(ex);
    var handled = false;

    if (status.continueSave) {
        this._sendAppt(calItem);
        handled = true;
    } else {
        if (status.errorMessage) {
            // Handled the error, display the error message
            handled = true;
            var dialog = appCtxt.getMsgDialog();
            dialog.setMessage(status.errorMessage, DwtMessageDialog.CRITICAL_STYLE);
            dialog.popup();
        }
        appCtxt.notifyZimlets("onSaveApptFailure", [this, calItem, ex]);
    }
    return handled;
};

ZmCalViewController.prototype._doForward =
function(items, op) {
	// listview cannot handle forwarding multiple items at once
	if (this._viewMgr.getCurrentViewName() == ZmId.VIEW_CAL_LIST && items.length > 1) {
		return;
	}

	// since base view has multiple selection turned off, always select first item
	var appt = items[0];
	var mode = ZmCalItem.MODE_FORWARD;
	if (op == ZmOperation.VIEW_APPT_INSTANCE || op == ZmOperation.VIEW_APPT_SERIES) {
		mode = (op == ZmOperation.VIEW_APPT_INSTANCE)
			? ZmCalItem.MODE_FORWARD_SINGLE_INSTANCE
			: ZmCalItem.MODE_FORWARD_SERIES;
	}
	this._forwardAppointment(appt, mode);
};

/**
 * Override the ZmListController method.
 * 
 * @private
 */
ZmCalViewController.prototype._doDelete =
function(items, hardDelete, attrs, op) {

    var isTrash = false;

	// listview can handle deleting multiple items at once
    if(items.length>0){
        var calendar = items[0].getFolder();
        isTrash = calendar && calendar.nId==ZmOrganizer.ID_TRASH;
    }

	if ((this._viewMgr.getCurrentViewName() == ZmId.VIEW_CAL_LIST || isTrash) && items.length > 1) {
		var divvied = this._divvyItems(items);

		// first attempt to deal with read-only appointments
		if (divvied.readonly.length > 0) {
			var dlg = appCtxt.getMsgDialog();
			var callback = (divvied.recurring.length > 0)
				? this._showTypeDialog.bind(this, [divvied.recurring, ZmCalItem.MODE_DELETE])
				: null;
			var listener = new AjxListener(this, this._handleReadonlyOk, [callback, dlg]);
			dlg.setButtonListener(DwtDialog.OK_BUTTON, listener);
			dlg.setMessage(ZmMsg.deleteReadonly);
			dlg.popup();
		}
		else if (divvied.recurring.length > 0) {
			this._showTypeDialog(divvied.recurring, ZmCalItem.MODE_DELETE);
		}
		else {
			this._promptDeleteApptList(divvied.normal);
		}
	}
	else {
		// since base view has multiple selection turned off, always select first item
		var appt = items[0];
		if (op == ZmOperation.VIEW_APPT_INSTANCE || op == ZmOperation.VIEW_APPT_SERIES) {
			var mode = (op == ZmOperation.VIEW_APPT_INSTANCE)
				? ZmCalItem.MODE_DELETE_INSTANCE
				: ZmCalItem.MODE_DELETE_SERIES;
			this._promptDeleteAppt(appt, mode);
		} else {
			this._deleteAppointment(appt);
		}
	}
};

ZmCalViewController.prototype._handleReadonlyOk =
function(callback, dlg) {
	dlg.popdown();
	if (callback) {
		callback.run();
	}
};

ZmCalViewController.prototype._handleMultiDelete =
function(deleteList, mode) {
	var batchCmd = new ZmBatchCommand(true, null, true);

	// first, get details for each appointment
	for (var i = 0; i < deleteList.length; i++) {
		var appt = deleteList[i];
		var args = [mode, null, null, null, null];
		batchCmd.add(new AjxCallback(appt, appt.getDetails, args));
	}
	batchCmd.run(this._handleGetDetails.bind(this, deleteList, mode));
};

ZmCalViewController.prototype._handleGetDetails =
function(deleteList, mode) {
	var batchCmd = new ZmBatchCommand(true, null, true);
	for (var i = 0; i < deleteList.length; i++) {
		var appt = deleteList[i];
		var args = [mode, null, null, null];
		batchCmd.add(new AjxCallback(appt, appt.cancel, args));
	}
	batchCmd.run();
	var summary = ZmList.getActionSummary({
		actionTextKey:  'actionDelete',
		numItems:       batchCmd.size(),
		type:           ZmItem.APPT
	});
	appCtxt.setStatusMsg(summary);
	appCtxt.notifyZimlets("onAppointmentDelete", deleteList);//notify Zimlets on delete
};

ZmCalViewController.prototype.getSelection =
function() {
    return ZmListController.prototype.getSelection.call(this, this.getCurrentListView());
};

ZmCalViewController.prototype.getSelectionCount = function() {
    return ZmListController.prototype.getSelectionCount.call(this, this.getCurrentListView());
};

ZmCalViewController.prototype._divvyItems =
function(items) {

	var normal = [];
	var readonly = [];
	var recurring = [];
	var shared = [];

	for (var i = 0; i < items.length; i++) {
		var appt = items[i];
		if (appt.type != ZmItem.APPT) { continue; }

		if (appt.isFolderReadOnly()) {
			readonly.push(appt);
		}
		else if (appt.isRecurring() && !appt.isException) {
			recurring.push(appt);
		}
		else {
			normal.push(appt);
		}

		// keep a separate list of shared items. This means "recurring" and
		// "normal" can contain shared items as well.
		var calendar = appt.getFolder();
		if (calendar && calendar.isRemote()) {
			shared.push(appt);
		}
	}

	return {normal:normal, readonly:readonly, recurring:recurring, shared:shared};
};

ZmCalViewController.prototype._promptDeleteApptList =
function(deleteList) {
	if (deleteList.length === 0) {
		return;
	}
	var calendar = deleteList[0].getFolder();
	var isTrash = calendar && calendar.nId == ZmOrganizer.ID_TRASH;
	var msg = (isTrash) ? ZmMsg.confirmCancelApptListPermanently : ZmMsg.confirmCancelApptList;
	var callback = this._handleMultiDelete.bind(this, deleteList, ZmCalItem.MODE_DELETE);
	appCtxt.getConfirmationDialog().popup(msg, callback);
};

ZmCalViewController.prototype._promptDeleteAppt =
function(appt, mode) {
    if(!appt){
        return;
    }
	if (appt instanceof Array) {
		this._continueDelete(appt, mode);
	} else {
		if (appt.isOrganizer()) {
			if (mode == ZmCalItem.MODE_DELETE_SERIES) {
				this._promptDeleteFutureInstances(appt, mode);
			} else {
				this._promptCancelReply(appt, mode);
			}
		} else {
			this._promptDeleteNotify(appt, mode);
		}
	}
};
ZmCalViewController.prototype._confirmDeleteApptDialog =
function(){

    if (!ZmCalViewController._confirmDialog) {
        var editMessageButton =new DwtDialog_ButtonDescriptor(DwtDialog.YES_BUTTON, ZmMsg.editMessage , DwtDialog.ALIGN_LEFT);
        var buttons = [ DwtDialog.NO_BUTTON, DwtDialog.CANCEL_BUTTON ];
        var extraButtons = [editMessageButton];
        ZmCalViewController._confirmDialog = new DwtConfirmDialog(this._shell, null, "CNF_DEL_SENDEDIT", buttons, extraButtons);
        var noButton = ZmCalViewController._confirmDialog.getButton(DwtDialog.NO_BUTTON);
        noButton.setText(ZmMsg.sendCancellation); // Changing the text for No button
	}
	return ZmCalViewController._confirmDialog;
};

ZmCalViewController.prototype._promptCancelReply =
function(appt, mode) {
	var cancelNoReplyCallback = new AjxCallback(this, this._continueDelete, [appt, mode]);
    var confirmDialog;
    var calendar = appt && appt.getFolder();
    var isTrash = calendar && calendar.nId==ZmOrganizer.ID_TRASH;

    // Display traditional Yes/No Dialog if
    // - If appt has no attendees
    // - appt is from trash
    // - appt is saved but not sent
	if (!isTrash && appt.otherAttendees && !appt.inviteNeverSent && appCtxt.get(ZmSetting.MAIL_ENABLED)) {
        confirmDialog = this._confirmDeleteApptDialog();
        var cancelReplyCallback = new AjxCallback(this, this._continueDeleteReply, [appt, mode]);

        confirmDialog.setTitle(ZmMsg.confirmDeleteApptTitle);
		confirmDialog.popup(ZmMsg.confirmCancelApptReply, cancelReplyCallback, cancelNoReplyCallback);
	} else {
        confirmDialog = appCtxt.getConfirmationDialog("CNF_DEL_YESNO");
		var msg = isTrash ? ZmMsg.confirmPermanentCancelAppt : ZmMsg.confirmCancelAppt;

		if (appt.isRecurring() && !appt.isException && !isTrash) {
	    	msg = (mode == ZmCalItem.MODE_DELETE_INSTANCE) ? AjxMessageFormat.format(ZmMsg.confirmCancelApptInst, AjxStringUtil.htmlEncode(appt.name)) :  ZmMsg.confirmCancelApptSeries; 
		}
        confirmDialog.setTitle(ZmMsg.confirmDeleteApptTitle);
		confirmDialog.popup(msg, cancelNoReplyCallback);
	}
};

ZmCalViewController.prototype._promptDeleteFutureInstances =
function(appt, mode) {

    if (appt.getAttendees(ZmCalBaseItem.PERSON).length>0) {
        this._delFutureInstNotifyDlgWithAttendees = this._delFutureInstNotifyDlgWithAttendees ?
            this._delFutureInstNotifyDlgWithAttendees : (new ZmApptDeleteNotifyDialog({
			    parent: this._shell,
			    title: AjxMsg.confirmTitle,
			    confirmMsg: ZmMsg.confirmCancelApptSeries,
			    choiceLabel1: ZmMsg.confirmCancelApptWholeSeries,
			    choiceLabel2 : ZmMsg.confirmCancelApptFutureInstances,
                choice2WarningMsg : ZmMsg.deleteApptWarning
		    }));
        this._delFutureInstNotifyDlg = this._delFutureInstNotifyDlgWithAttendees;
    }
    else{
            this._delFutureInstNotifyDlgWithoutAtteendees = this._delFutureInstNotifyDlgWithoutAtteendees ?
                this._delFutureInstNotifyDlgWithoutAtteendees : (new ZmApptDeleteNotifyDialog({
			        parent: this._shell,
			        title: ZmMsg.confirmDeleteApptTitle,
			        confirmMsg: ZmMsg.confirmCancelApptSeries,
			        choiceLabel1: ZmMsg.confirmDeleteApptWholeSeries,
                    choiceLabel2 : ZmMsg.confirmDeleteApptFutureInstances,
                    choice2WarningMsg : ZmMsg.deleteApptWarning
		        }));
        this._delFutureInstNotifyDlg = this._delFutureInstNotifyDlgWithoutAtteendees;
    }
	this._delFutureInstNotifyDlg.popup(new AjxCallback(this, this._deleteFutureInstYesCallback, [appt,mode]));
};

ZmCalViewController.prototype._deleteFutureInstYesCallback =
function(appt, mode) {
	var deleteWholeSeries = this._delFutureInstNotifyDlg.isDefaultOptionChecked();
	if (!deleteWholeSeries) {
		appt.setCancelFutureInstances(true);
	}

	var cancelNoReplyCallback = new AjxCallback(this, this._continueDelete, [appt, mode]);

    var confirmDialog = this._confirmDeleteApptDialog();
	if (appt.otherAttendees && !appt.inviteNeverSent && appCtxt.get(ZmSetting.MAIL_ENABLED)) {
		var cancelReplyCallback = new AjxCallback(this, this._continueDeleteReply, [appt, mode]);
		confirmDialog.popup(ZmMsg.sendCancellationConfirmation, cancelReplyCallback, cancelNoReplyCallback);
	} else {
		this._continueDelete(appt, mode);
	}
};

ZmCalViewController.prototype._promptDeleteNotify =
function(appt, mode) {
	if (!this._deleteNotifyDialog) {
		this._deleteNotifyDialog = new ZmApptDeleteNotifyDialog({
			parent: this._shell,
			title: AjxMsg.confirmTitle,
			confirmMsg: "",
            choiceLabel1: ZmMsg.dontNotifyOrganizer,
			choiceLabel2 : ZmMsg.notifyOrganizer
		});
	}
    if(this._deleteMode != mode){
        var msg = ZmMsg.confirmCancelAppt;
        if(appt.isRecurring()){
            msg = (mode == ZmCalItem.MODE_DELETE_INSTANCE)
    			? AjxMessageFormat.format(ZmMsg.confirmCancelApptInst, AjxStringUtil.htmlEncode(appt.name))
    			: ZmMsg.confirmCancelApptSeries;
        }
        var msgDiv = document.getElementById(this._deleteNotifyDialog._confirmMessageDivId);
        msgDiv.innerHTML = msg;
        this._deleteMode = mode;
    }
	this._deleteNotifyDialog.popup(new AjxCallback(this, this._deleteNotifyYesCallback, [appt,mode]));
};

ZmCalViewController.prototype._deleteNotifyYesCallback =
function(appt, mode) {
	var notifyOrg = !this._deleteNotifyDialog.isDefaultOptionChecked();
	if (notifyOrg) {
		this._cancelBeforeDelete(appt, mode);
	} else {
		this._continueDelete(appt, mode);
	}
};

ZmCalViewController.prototype._cancelBeforeDelete =
function(appt, mode) {
	var type = ZmOperation.REPLY_DECLINE;
	var respCallback = new AjxCallback(this, this._cancelBeforeDeleteContinue, [appt, type, mode]);
	appt.getDetails(null, respCallback, this._errorCallback);
};

ZmCalViewController.prototype._cancelBeforeDeleteContinue =
function(appt, type, mode) {
	var msgController = this._getMsgController();
	msgController.setMsg(appt.message);
	// poke the msgController
	var instanceDate = mode == ZmCalItem.MODE_DELETE_INSTANCE ? new Date(appt.uniqStartTime) : null;
    var delContCallback = new AjxCallback(this, this._continueDelete, [appt, mode]);
	msgController._sendInviteReply(type, appt.compNum || 0, instanceDate, appt.getRemoteFolderOwner(),false,null,null,delContCallback);
};


ZmCalViewController.prototype._deleteAppointment =
function(appt) {
	if (!appt) { return; }

    var calendar = appt.getFolder();
    var isTrash =  calendar && calendar.nId == ZmOrganizer.ID_TRASH;

	if (appt.isRecurring() && !isTrash && !appt.isException) {
		this._showTypeDialog(appt, ZmCalItem.MODE_DELETE);
	} else {
		this._promptDeleteAppt(appt, ZmCalItem.MODE_DELETE);
	}
};

ZmCalViewController.prototype._continueDeleteReply =
function(appt, mode) {
	var action = ZmOperation.REPLY_CANCEL;
	var respCallback = new AjxCallback(this, this._continueDeleteReplyRespondAction, [appt, action, mode]);
	appt.getDetails(mode, respCallback, this._errorCallback);
};

ZmCalViewController.prototype._continueDeleteReplyRespondAction =
function(appt, action, mode) {
	var msgController = this._getMsgController();
	var msg = appt.message;
	msg._appt = appt;
	msg._mode = mode;
	msgController.setMsg(msg);
	var instanceDate = mode == ZmCalItem.MODE_DELETE_INSTANCE ? new Date(appt.uniqStartTime) : null;
	msg._instanceDate = instanceDate;
	msgController._editInviteReply(action, 0, instanceDate);
};

ZmCalViewController.prototype._continueDelete =
function(appt, mode) {
	if (appt instanceof Array) {
		// if list of appointments, de-dupe the same series appointments
		var deleteList = (mode === ZmCalItem.MODE_DELETE_SERIES) ? this._dedupeSeries(appt) : appt;
		this._handleMultiDelete(deleteList, mode);
	}
	else {
		var respCallback = new AjxCallback(this, this._handleResponseContinueDelete, appt);
		appt.cancel(mode, null, respCallback, this._errorCallback);
	}
};

ZmCalViewController.prototype._handleResponseContinueDelete =
function(appt) {

    var currentView = appCtxt.getCurrentView();
    if (currentView && currentView.isZmApptView) {
        currentView.close();
    }

	var summary = ZmList.getActionSummary({
		actionTextKey:  'actionDelete',
		numItems:       1,
		type:           ZmItem.APPT
	});
	appCtxt.setStatusMsg(summary);
	appCtxt.notifyZimlets("onAppointmentDelete", [appt]);//notify Zimlets on delete 
};

/**
 * This method takes a list of recurring appointments and returns a list of
 * unique appointments (removes instances)
 *
 * @param list		[Array]		List of *recurring* appointments
 * 
 * @private
 */
ZmCalViewController.prototype._dedupeSeries =
function(list) {
	var unique = [];
	var deduped = {};
	for (var i = 0; i < list.length; i++) {
		var appt = list[i];
		if (!deduped[appt.id]) {
			deduped[appt.id] = true;
			unique.push(appt);
		}
	}
	return unique;
};

ZmCalViewController.prototype._getMoveParams =
function(dlg) {
	var params = ZmListController.prototype._getMoveParams.apply(this, arguments);
	var omit = {};
	var folderTree = appCtxt.getFolderTree();
	if (!folderTree) { return params; }

	var folders = folderTree.getByType(ZmOrganizer.CALENDAR);
	for (var i = 0; i < folders.length; i++) {
		var folder = folders[i];
		if (folder.link && folder.isReadOnly()) {
			omit[folder.id] = true;
		}
	}
	params.omit = omit;
	params.description = ZmMsg.targetCalendar;

	return params;
};

ZmCalViewController.prototype._getMoveDialogTitle =
function(num) {
	return AjxMessageFormat.format(ZmMsg.moveAppts, num);
};

/**
 * Shows a dialog for handling recurring appointments. User must choose to
 * perform the action on the instance of the series of a recurring appointment.
 *
 * @param appt		[ZmAppt]	This can be a single appt object or a *list* of appts
 * @param mode		[Integer]	Constant describing what kind of appointments we're dealing with
 * 
 * @private
 */
ZmCalViewController.prototype._showTypeDialog =
function(appt, mode) {
	if (this._typeDialog == null) {
		AjxDispatcher.require(["MailCore", "CalendarCore", "Calendar", "CalendarAppt"]);
		this._typeDialog = new ZmCalItemTypeDialog({
			id: 'CAL_ITEM_TYPE_DIALOG',
			parent: this._shell
		});
		this._typeDialog.registerCallback(DwtDialog.OK_BUTTON, this._typeOkListener, this);
		this._typeDialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._typeCancelListener, this);
	}
	this._typeDialog.initialize(appt, mode, ZmItem.APPT);
	this._typeDialog.popup();
};

ZmCalViewController.prototype.showApptReadOnlyView =
function(appt, mode) {
	var clone = ZmAppt.quickClone(appt);
	clone.getDetails(mode, new AjxCallback(this, this._showApptReadOnlyView, [clone, mode]));
};

ZmCalViewController.prototype._showApptReadOnlyView =
function(appt, mode) {
	var controller = this._app.getApptViewController(this._apptSessionId[appt.invId]);
	this._apptSessionId[appt.invId] = controller.getSessionId();
	controller.show(appt, mode);
};

ZmCalViewController.prototype._showQuickAddDialog =
function(appt, shiftKey) {
    if(appCtxt.isExternalAccount() || appCtxt.isWebClientOffline()) { return; }
	// find out if we really should display the quick add dialog
	var useQuickAdd = appCtxt.get(ZmSetting.CAL_USE_QUICK_ADD);
	if ((useQuickAdd && !shiftKey) || (!useQuickAdd && shiftKey)) {
		if (AjxTimezone.TIMEZONE_CONFLICT || AjxTimezone.DEFAULT_RULE.autoDetected) {
			var timezonePicker = this.getTimezonePicker();
			var callback = new AjxCallback(this, this.handleTimezoneSelectionQuickAdd, [appt, shiftKey]);
			timezonePicker.setCallback(callback);
			timezonePicker.popup();
		} else {
			this._showQuickAddDialogContinue(appt, shiftKey);
		}
	} else {
		this.newAppointment(appt);
	}
};

ZmCalViewController.prototype._showQuickAddDialogContinue =
function(appt, shiftKey) {
	if (this._quickAddDialog == null) {
		AjxDispatcher.require(["MailCore", "CalendarCore", "Calendar", "CalendarAppt"]);
		this._quickAddDialog = new ZmApptQuickAddDialog(this._shell);
		this._quickAddDialog.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._quickAddOkListener));
		this._quickAddDialog.addSelectionListener(ZmApptQuickAddDialog.MORE_DETAILS_BUTTON, new AjxListener(this, this._quickAddMoreListener));
	}
	this._quickAddDialog.initialize(appt);
	this._quickAddDialog.popup();
};

ZmCalViewController.prototype.newAppointmentHelper =
function(startDate, optionalDuration, folderId, shiftKey) {
	var appt = this._newApptObject(startDate, optionalDuration, folderId);
	this._showQuickAddDialog(appt, shiftKey);
};

ZmCalViewController.prototype.newAllDayAppointmentHelper =
function(startDate, endDate, folderId, shiftKey) {
	var appt = this._newApptObject(startDate, null, folderId);
	if (endDate) {
		appt.setEndDate(endDate);
	}
	appt.setAllDayEvent(true);
	appt.freeBusy = "F";
	this._showQuickAddDialog(appt, shiftKey);
};

ZmCalViewController.prototype.newAppointment =
function(newAppt, mode, isDirty, startDate) {
	AjxDispatcher.require(["MailCore", "CalendarCore", "Calendar"]);
	var sd = startDate || (this._viewVisible ? this._viewMgr.getDate() : new Date());
	var appt = newAppt || this._newApptObject(sd, (appCtxt.get(ZmSetting.CAL_DEFAULT_APPT_DURATION) * 1000));  //bug:50121 added appt duration as configurable from preference

    //certain views can set attendees before creating appointment
    if(this._viewVisible && this._viewMgr.getCurrentView().getAtttendees) {
        var attendees = this._viewMgr.getCurrentView().getAtttendees();
        if(attendees && attendees.length > 0) appt.setAttendees(attendees, ZmCalBaseItem.PERSON);
    }

    if (AjxTimezone.TIMEZONE_CONFLICT || AjxTimezone.DEFAULT_RULE.autoDetected) {
		var timezonePicker = this.getTimezonePicker();
		var callback = new AjxCallback(this, this.handleTimezoneSelection, [appt, mode, isDirty]);
		timezonePicker.setCallback(callback);
		timezonePicker.popup();
	} else {
		this._app.getApptComposeController().show(appt, mode, isDirty);
	}
};

ZmCalViewController.prototype.handleTimezoneSelection =
function(appt, mode, isDirty, serverId) {
	this.updateTimezoneInfo(appt, serverId);
	this._app.getApptComposeController().show(appt, mode, isDirty);
};

ZmCalViewController.prototype.handleTimezoneSelectionQuickAdd =
function(appt, shiftKey, serverId) {
	this.updateTimezoneInfo(appt, serverId);
	this._showQuickAddDialogContinue(appt, shiftKey);
};

ZmCalViewController.prototype.updateTimezoneInfo =
function(appt, serverId) {
	appt.setTimezone(serverId);
	appCtxt.set(ZmSetting.DEFAULT_TIMEZONE, serverId);
	AjxTimezone.TIMEZONE_CONFLICT = false;
	this.updateDefaultTimezone(serverId);
	var settings = appCtxt.getSettings();
	var tzSetting = settings.getSetting(ZmSetting.DEFAULT_TIMEZONE);
	settings.save([tzSetting], new AjxCallback(this, this._timezoneSaveCallback));
};

ZmCalViewController.prototype.updateDefaultTimezone =
function(serverId) {
	for (var i =0; i < AjxTimezone.MATCHING_RULES.length; i++) {
		if (AjxTimezone.MATCHING_RULES[i].serverId == serverId) {
			AjxTimezone.DEFAULT_RULE = AjxTimezone.MATCHING_RULES[i];
			AjxTimezone.DEFAULT = AjxTimezone.getClientId(AjxTimezone.DEFAULT_RULE.serverId);
			break;
		}
	}
};

ZmCalViewController.prototype._timezoneSaveCallback =
function() {
	appCtxt.setStatusMsg(ZmMsg.timezonePrefSaved);
};

ZmCalViewController.prototype.getTimezonePicker =
function() {
	if (!this._timezonePicker) {
		this._timezonePicker = appCtxt.getTimezonePickerDialog();
	}
	return this._timezonePicker;
};

/**
 * Edits the appointment.
 * 
 * @param	{ZmAppt}		appt		the appointment
 * @param	{constant}		mode		the mode
 */
ZmCalViewController.prototype.editAppointment =
function(appt, mode) {
	Dwt.setLoadingTime("ZmCalendarApp-editAppt");
	AjxDispatcher.require(["MailCore", "CalendarCore", "Calendar"]);
	if (mode != ZmCalItem.MODE_NEW) {
		var clone = ZmAppt.quickClone(appt);
		clone.getDetails(mode, new AjxCallback(this, this._showApptComposeView, [clone, mode]));
	} else {
		this._app.getApptComposeController().show(appt, mode);
	}
	Dwt.setLoadedTime("ZmCalendarApp-editAppt");
};

ZmCalViewController.prototype._replyAppointment =
function(appt, all) {
	Dwt.setLoadingTime("ZmCalendarApp-replyAppt");
	AjxDispatcher.require(["MailCore", "Mail"]);
    var clone = ZmAppt.quickClone(appt);
	var respCallback = new AjxCallback(this, this._replyDetailsHandler, [clone, all]);
	clone.getDetails(null, respCallback, this._errorCallback, true, true);
	Dwt.setLoadedTime("ZmCalendarApp-replyAppt");
};

ZmCalViewController.prototype._replyDetailsHandler =
function(appt, all, result) {

	var msg = new ZmMailMsg(-1, null, true);
	var orig = appt.message;
	if (orig) {
		var inviteHtml = orig.getInviteDescriptionContent(ZmMimeTable.TEXT_HTML);
        if (inviteHtml) {
            var htmlContent = inviteHtml.getContent();
            htmlContent && msg.setInviteDescriptionContent(ZmMimeTable.TEXT_HTML, htmlContent);
        }

		var inviteText = orig.getInviteDescriptionContent(ZmMimeTable.TEXT_PLAIN);
        if (inviteText) {
            var textContent = inviteText.getContent();
            textContent && msg.setInviteDescriptionContent(ZmMimeTable.TEXT_PLAIN, textContent);
        }
        if (htmlContent || textContent) {
            msg._loaded = true;
        }

		msg.invite = orig.invite;
		msg.id = orig.id;
        msg.date = orig.date;
	}
	msg.setSubject(appt.name);

	var organizer = appt.getOrganizer();
	var organizerAddress = AjxEmailAddress.parse(organizer);
	var self = appCtxt.getActiveAccount().name;
	msg.getHeaderStr = AjxCallback.returnFalse; // Real ugly hack to prevent headers from showing in the message

    var isOrganizer = appt.isOrganizer();
    var folder = appt.getFolder();
    var isRemote = folder ? folder.isRemote() : false;
	if (!isOrganizer || isRemote) {
		organizerAddress.setType(AjxEmailAddress.FROM);
		msg.addAddress(organizerAddress);
	}

	if (all) {
		var omit = AjxUtil.arrayAsHash([ self, organizerAddress.getAddress() ]),
			attendees = appt.getAttendees(ZmCalBaseItem.PERSON);

		this._addAttendeesToReply(attendees, msg, ZmCalItem.ROLE_REQUIRED, AjxEmailAddress.FROM, omit);
		this._addAttendeesToReply(attendees, msg, ZmCalItem.ROLE_OPTIONAL, AjxEmailAddress.CC, omit);
	}
	
	var data = {action: all ? ZmOperation.CAL_REPLY_ALL : ZmOperation.CAL_REPLY, msg: msg};
	AjxDispatcher.run("GetComposeController").doAction(data);
};

ZmCalViewController.prototype._addAttendeesToReply = function(attendees, msg, role, addrType, omit) {

	var attendeesByRole = ZmApptViewHelper.getAttendeesArrayByRole(attendees, role),
		ln = attendeesByRole.length, i, addr;

	for (i = 0; i < ln; i++) {
		addr = attendeesByRole[i].getAttendeeText(ZmCalBaseItem.PERSON);
		if (addr && !omit[addr]) {
			var addrObj = new AjxEmailAddress(addr);
			addrObj.setType(addrType);
			msg.addAddress(addrObj);
		}
	}
};

ZmCalViewController.prototype._forwardAppointment =
function(appt, mode) {
	Dwt.setLoadingTime("ZmCalendarApp-fwdAppt");
	AjxDispatcher.require(["MailCore", "CalendarCore", "Calendar"]);
	if (mode != ZmCalItem.MODE_NEW) {
		var clone = ZmAppt.quickClone(appt);
		clone.getDetails(mode, new AjxCallback(this, this._showApptForwardComposeView, [clone, mode]));
	} else {
		this._showApptForwardComposeView(appt, mode);
	}
	Dwt.setLoadedTime("ZmCalendarApp-fwdAppt");
};

ZmCalViewController.prototype._showAppointmentDetails =
function(appt) {
	// if we have an appointment, go get all the details.
	if (!appt.__creating) {
		var calendar = appt.getFolder();
		var isSynced = Boolean(calendar.url);
		if (appt.isRecurring()) {
			// prompt user to edit instance vs. series if recurring but not for exception and from edit mode
			if (appt.isException || appt.editViewMode) {
				var mode = appt.editViewMode || ZmCalItem.MODE_EDIT_SINGLE_INSTANCE;
				if (appt.isReadOnly() || calendar.isReadOnly() || isSynced || appCtxt.isWebClientOffline()) {
					this.showApptReadOnlyView(appt, mode);
				} else {
					this.editAppointment(appt, mode);
				}
			} else {
				this._showTypeDialog(appt, ZmCalItem.MODE_EDIT);
			}
		} else {
			// if simple appointment, no prompting necessary
            var isTrash = calendar.nId == ZmOrganizer.ID_TRASH;
			if (appt.isReadOnly() || calendar.isReadOnly() || isSynced || isTrash || appCtxt.isWebClientOffline()) {
                var mode = appt.isRecurring() ? (appt.isException ? ZmCalItem.MODE_EDIT_SINGLE_INSTANCE : ZmCalItem.MODE_EDIT_SERIES) : ZmCalItem.MODE_EDIT;
				this.showApptReadOnlyView(appt, mode);
			} else {
				this.editAppointment(appt, ZmCalItem.MODE_EDIT);
			}
		}
	} else {
		this.newAppointment(appt);
	}
};

ZmCalViewController.prototype._typeOkListener =
function(ev) {
	if (this._typeDialog) {
		this._typeDialog.popdown();
	}

	if (this._typeDialog.mode == ZmCalItem.MODE_DELETE)
		this._promptDeleteAppt(this._typeDialog.calItem, this._typeDialog.isInstance() ? ZmCalItem.MODE_DELETE_INSTANCE : ZmCalItem.MODE_DELETE_SERIES);
	else
		this._performApptAction(this._typeDialog.calItem, this._typeDialog.mode, this._typeDialog.isInstance());
};

ZmCalViewController.prototype._performApptAction =
function(appt, mode, isInstance) {
	if (mode == ZmCalItem.MODE_DELETE) {
		var delMode = isInstance ? ZmCalItem.MODE_DELETE_INSTANCE : ZmCalItem.MODE_DELETE_SERIES;
		if (appt instanceof Array) {
			this._continueDelete(appt, delMode);
		} else {
			if (appt.isOrganizer()) {
				this._continueDelete(appt, delMode);
			} else {
				this._promptDeleteNotify(appt, delMode);
			}
		}
	}
	else if (mode == ZmAppt.MODE_DRAG_OR_SASH) {
		var viewMode = isInstance ? ZmCalItem.MODE_EDIT_SINGLE_INSTANCE : ZmCalItem.MODE_EDIT_SERIES;
		var state = this._updateApptDateState;
		var args = [state.appt, viewMode, state.startDateOffset, state.endDateOffset, state.callback, state.errorCallback];
		var respCallback = new AjxCallback(this, this._handleResponseUpdateApptDate, args);
		delete this._updateApptDateState;
		appt.getDetails(viewMode, respCallback, state.errorCallback);
	}
	else {
		var editMode = isInstance ? ZmCalItem.MODE_EDIT_SINGLE_INSTANCE : ZmCalItem.MODE_EDIT_SERIES;
		var calendar = appt.getFolder();
		var isSynced = Boolean(calendar.url);

		if (appt.isReadOnly() || calendar.isReadOnly() || isSynced || appCtxt.isWebClientOffline()) {
			this.showApptReadOnlyView(appt, editMode);
		} else {
			this.editAppointment(appt, editMode);
		}
	}
};

ZmCalViewController.prototype._typeCancelListener =
function(ev) {
	if (this._typeDialog.mode == ZmAppt.MODE_DRAG_OR_SASH) {
		// we cancel the drag/sash, refresh view
		this._refreshAction(true);
	}

	this._typeDialog.popdown();
};

ZmCalViewController.prototype._quickAddOkListener =
function(ev) {
    var isValid = this._quickAddDialog.isValid();
    var appt = this._quickAddDialog.getAppt();
    var closeCallback = this._quickAddCallback.bind(this, true);
    var errorCallback = this._quickAddCallback.bind(this, false);

    var locations = appt.getAttendees(ZmCalBaseItem.LOCATION);
    // Send if any locations attendees are specified.  This will send invites
    var action = (locations.length == 0) ? ZmCalItemComposeController.SAVE_CLOSE :
                                           ZmCalItemComposeController.SEND;
    this._saveSimpleAppt(isValid, appt, action, closeCallback, errorCallback);
}

ZmCalViewController.prototype._saveSimpleAppt =
function(isValid, appt, action, closeCallback, errorCallback, cancelCallback) {
	try {
		if (isValid && appt) {
            if (appt.getFolder() && appt.getFolder().noSuchFolder) {
                throw AjxMessageFormat.format(ZmMsg.errorInvalidFolder, appt.getFolder().name);
            }
            if (!this._simpleComposeController) {
                // Create a compose controller, used for saving the quick add
                // appt and modifications made via ZmCalColView drag and drop, in
                // order to trigger permission and resource checks.
                this._simpleComposeController = this._app.getSimpleApptComposeController();
            }
            this._simpleComposeController.doSimpleSave(appt, action, closeCallback,
                                                       errorCallback, cancelCallback);
        }
	} catch(ex) {
		if (typeof ex == "string") {
			var errorDialog = new DwtMessageDialog({parent:this._shell});
			var msg = ex ? AjxMessageFormat.format(ZmMsg.errorSavingWithMessage, ex) : ZmMsg.errorSaving;
			errorDialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
			errorDialog.popup();
		}else{
            ZmController.handleScriptError(ex);
        }
	}
};

ZmCalViewController.prototype._quickAddCallback =
function(success) {
    if (success) {
        this._quickAddDialog.popdown();
    }
    appCtxt.setStatusMsg(success ? ZmMsg.apptCreated : ZmMsg.apptCreationError);
};

ZmCalViewController.prototype._quickAddMoreListener =
function(ev) {
	var appt = this._quickAddDialog.getAppt();
	if (appt) {
		this._quickAddDialog.popdown();
		this.newAppointment(appt, ZmCalItem.MODE_NEW_FROM_QUICKADD, this._quickAddDialog.isDirty());
	}
};

ZmCalViewController.prototype._showApptComposeView =
function(appt, mode) {
	this._app.getApptComposeController().show(appt, mode);
};

ZmCalViewController.prototype._showApptForwardComposeView =
function(appt, mode) {
	/*if(!appt.isOrganizer()) { */
	appt.name = ZmMsg.fwd + ": " + appt.name;
	//}
	this._app.getApptComposeController().show(appt, mode);
};

/**
 * appt - appt to change
 * startDate - new date or null to leave alone
 * endDate - new or null to leave alone
 * changeSeries - if recurring, change the whole series
 *
 * TODO: change this to work with _handleException, and take callback so view can
 *       restore appt location/size on failure
 *       
 * @private
 */
ZmCalViewController.prototype.dndUpdateApptDate =
function(appt, startDateOffset, endDateOffset, callback, errorCallback, ev) {	
	appt.dndUpdate = true;
	if (!appt.isRecurring()) {
		var viewMode = ZmCalItem.MODE_EDIT;
		var respCallback = new AjxCallback(this, this._handleResponseUpdateApptDate, [appt, viewMode, startDateOffset, endDateOffset, callback, errorCallback]);
		appt.getDetails(viewMode, respCallback, errorCallback);
	}
	else {
		if (ev.shiftKey || ev.altKey) {
			var viewMode = ev.altKey ? ZmCalItem.MODE_EDIT_SERIES : ZmCalItem.MODE_EDIT_SINGLE_INSTANCE;
			var respCallback = new AjxCallback(this, this._handleResponseUpdateApptDate, [appt, viewMode, startDateOffset, endDateOffset, callback, errorCallback]);
			appt.getDetails(viewMode, respCallback, errorCallback);
		}
		else {
			this._updateApptDateState = {appt:appt, startDateOffset: startDateOffset, endDateOffset: endDateOffset, callback: callback, errorCallback: errorCallback };
			if (appt.isException) {
				this._performApptAction(appt, ZmAppt.MODE_DRAG_OR_SASH, true);
			} else {
				this._showTypeDialog(appt, ZmAppt.MODE_DRAG_OR_SASH);
			}
		}
	}
	appCtxt.notifyZimlets("onApptDrop", [appt, startDateOffset, endDateOffset]);		
};

ZmCalViewController.prototype._handleResponseUpdateApptDate =
function(appt, viewMode, startDateOffset, endDateOffset, callback, errorCallback, result) {
	// skip prompt if no attendees
	if (appt.inviteNeverSent || !appt.otherAttendees) {
		this._handleResponseUpdateApptDateSave.apply(this, arguments);
		return;
	}

	// NOTE: We copy the arguments into an array because arguments
	//       is *not* technically an array. So if anyone along the
	//       line considers it such it will blow up -- this prevents
	//       that at the expense of having to keep this array and
	//       the actual argument list in sync.
	var args = [appt, viewMode, startDateOffset, endDateOffset, callback, errorCallback, result];
	var edit = new AjxCallback(this, this._handleResponseUpdateApptDateEdit, args);
	var save = new AjxCallback(this, this._handleResponseUpdateApptDateSave, args);
	var ignore = new AjxCallback(this, this._handleResponseUpdateApptDateIgnore, args);

	var dialog = appCtxt.getConfirmationDialog();
	dialog.popup(ZmMsg.confirmModifyApptReply, edit, save, ignore);
};

ZmCalViewController.prototype._handleResponseUpdateApptDateEdit =
function(appt, viewMode, startDateOffset, endDateOffset, callback, errorCallback, result) {
	var clone = ZmAppt.quickClone(appt);
    clone.editViewMode = viewMode;
	if (startDateOffset) clone.setStartDate(new Date(clone.getStartTime() + startDateOffset));
	if (endDateOffset) clone.setEndDate(new Date(clone.getEndTime() + endDateOffset));
	this._showAppointmentDetails(clone);
};
ZmCalViewController.prototype._handleResponseUpdateApptDateEdit2 =
function(appt, action, mode, startDateOffset, endDateOffset) {
	if (startDateOffset) appt.setStartDate(new Date(appt.getStartTime() + startDateOffset));
	if (endDateOffset) appt.setEndDate(new Date(appt.getEndTime() + endDateOffset));
	this._continueDeleteReplyRespondAction(appt, action, mode);
};

ZmCalViewController.prototype._handleResponseUpdateApptDateSave =
function(appt, viewMode, startDateOffset, endDateOffset, callback, errorCallback, result) {
         var isExceptionAllowed = appCtxt.get(ZmSetting.CAL_EXCEPTION_ON_SERIES_TIME_CHANGE);
         var showWarning = appt.isRecurring() && appt.hasEx && appt.getAttendees(ZmCalBaseItem.PERSON) && !isExceptionAllowed && viewMode==ZmCalItem.MODE_EDIT_SERIES;
         if(showWarning){
            var respCallback = new AjxCallback(this, this._handleResponseUpdateApptDateSaveContinue, [appt, viewMode, startDateOffset, endDateOffset, callback, errorCallback, result]);
            this._showExceptionWarning(respCallback);
         }
         else{
             this._handleResponseUpdateApptDateSaveContinue(appt, viewMode, startDateOffset, endDateOffset, callback, errorCallback, result);
         }
};

ZmCalViewController.prototype._handleResponseUpdateApptDateSaveContinue =
function(appt, viewMode, startDateOffset, endDateOffset, callback, errorCallback, result) {
    try {
        // NOTE: If the appt was already populated (perhaps by
		//       dragging it once, canceling the change, and then
		//       dragging it again), then the result will be null.
		if (result) {
			result.getResponse();
		}
		var apptStartDate = appt.startDate;
		var apptEndDate   = appt.endDate;
	    var apptDuration = appt.getDuration();

		appt.setViewMode(viewMode);
		if (startDateOffset) {
			var sd = (viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE) ? appt.getUniqueStartDate() : new Date(appt.getStartTime());
			appt.setStartDate(new Date(sd.getTime() + startDateOffset));
			appt.resetRepeatWeeklyDays();
		}
		if (endDateOffset) {
			var endDateTime;

			if (viewMode === ZmCalItem.MODE_EDIT_SINGLE_INSTANCE) {
				// For some reason the recurring all day events have their end date set to the next day while the normal all day events don't.
				// For e.g. an event with startDate 9th June and endDate 10th June when dragged to the next day has varying results:
				// -> Regular all day event has end Date as 9th June which with endDateOffset results in 10th June as new endDate
				// -> Recurring all day event has end Date as 10th June which with endDateOffset results in 11th June as new endDate
				// To tackle this the new End date is now calculated from the new start date and appt duration and equivalent of 1 day is subtracted from it.
				// TODO: Need a better solution for this -> investigate why the end date difference is present in the first place.
				if (appt.allDayEvent) {
					endDateTime = appt.getStartTime() + apptDuration - AjxDateUtil.MSEC_PER_DAY;
				}
				else {
					endDateTime = appt.getUniqueEndDate().getTime() + endDateOffset;
				}
			}
			else {
				endDateTime = appt.getEndTime()  + endDateOffset;
			}
			appt.setEndDate(new Date(endDateTime));
		}

		if (viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE) {
			//bug: 32231 - use proper timezone while creating exceptions
			appt.setOrigTimezone(AjxTimezone.getServerId(AjxTimezone.DEFAULT));
		}

		if(!appt.getTimezone()) appt.setTimezone(AjxTimezone.getServerId(AjxTimezone.DEFAULT));
		var respCallback    = new AjxCallback(this, this._handleResponseUpdateApptDateSave2, [callback]);
		var respErrCallback = new AjxCallback(this, this._handleResponseUpdateApptDateSave2, [errorCallback, appt, apptStartDate, apptEndDate]);
		appCtxt.getShell().setBusy(true);

        var action = appt.inviteNeverSent ? ZmCalItemComposeController.SAVE_CLOSE :
                                            ZmCalItemComposeController.SEND;
        this._saveSimpleAppt(true, appt, action, respCallback, respErrCallback, respErrCallback);
	} catch (ex) {
		appCtxt.getShell().setBusy(false);
		if (ex.msg) {
			this.popupErrorDialog(AjxMessageFormat.format(ZmMsg.mailSendFailure, ex.msg));
		} else {
			this.popupErrorDialog(ZmMsg.errorGeneric, ex);
		}
		if (errorCallback) errorCallback.run(ex);
	}
	if (callback) callback.run(result);
}

ZmCalViewController.prototype._showExceptionWarning = function(yesCB,noCB) {
          var dialog = appCtxt.getYesNoMsgDialog();
		  dialog.setMessage(ZmMsg.recurrenceUpdateWarning, DwtMessageDialog.WARNING_STYLE);
          dialog.registerCallback(DwtDialog.YES_BUTTON, this._handleExceptionWarningResponse, this,[dialog,yesCB]);
          dialog.registerCallback(DwtDialog.NO_BUTTON, this._handleExceptionWarningResponse,this,[dialog,noCB]);
		  dialog.popup();
}

ZmCalViewController.prototype._handleExceptionWarningResponse = function(dialog,respCallback) {
          if(respCallback){respCallback.run();}
          else{this._refreshAction(true);}
          if(dialog){
              dialog.popdown();
          }
}

ZmCalViewController.prototype._handleResponseUpdateApptDateSave2 =
function(callback, appt, apptStartDate, apptEndDate) {
    // Appt passed in for cancel/failure.  Restore the start and endDates
    if (appt) {
        appt.setStartDate(apptStartDate);
        appt.setEndDate(apptEndDate);
        appt.resetRepeatWeeklyDays();
    }
    if (callback) callback.run();
    appCtxt.getShell().setBusy(false);


};

ZmCalViewController.prototype._handleResponseUpdateApptDateIgnore =
function(appt, viewMode, startDateOffset, endDateOffset, callback, errorCallback, result) {
	this._refreshAction(true);
	if (callback) callback.run(result);
};

/**
 * Gets the day tool tip text.
 * 
 * @param	{Date}		date		the date
 * @param	{Boolean}	noheader	if <code>true</code>, do not include tool tip header
 * @param	{AjxCallback}	callback		the callback
 * @param	{Boolean}	getSimpleToolTip	 if <code>true</code>,show only plain text in tooltip for all day events.
 * Multi day "appts/allday events" would be shown by just one entry showing final start/end date&time.
 */
ZmCalViewController.prototype.getDayToolTipText =
function(date, noheader, callback, isMinical, getSimpleToolTip) {
	try {
		var start = new Date(date.getTime());
		start.setHours(0, 0, 0, 0);
		var startTime = start.getTime();
		var end = start.getTime() + AjxDateUtil.MSEC_PER_DAY;
		var params = {start:startTime, end:end, fanoutAllDay:true};
		if(callback) {
			params.callback = new AjxCallback(this, this._handleToolTipSearchResponse, [start, noheader, callback, isMinical]);
			this.getApptSummaries(params);
		} else {
			var result = this.getApptSummaries(params);
			return ZmApptViewHelper.getDayToolTipText(start, result, this, noheader, null, isMinical, getSimpleToolTip);
		}
	} catch (ex) {
		DBG.println(ex);
		return "<b>" + ZmMsg.errorGettingAppts + "</b>";
	}
};

ZmCalViewController.prototype._handleToolTipSearchResponse =
function(start, noheader, callback, isMinical, result) {
	try {
		var tooltip = ZmApptViewHelper.getDayToolTipText(start, result, this, noheader, null, isMinical);
		callback.run(tooltip);
	} catch (ex) {
		DBG.println(ex);
		callback.run("<b>" + ZmMsg.errorGettingAppts + "</b>");
	}
};

ZmCalViewController.prototype.getUserStatusToolTipText =
function(start, end, noheader, email, emptyMsg, calIds) {
	try {
        if(!calIds) {
            calIds = [];
            if (this._calTreeController) {
                var calendars = this._calTreeController.getOwnedCalendars(this._app.getOverviewId(),email);
                for (var i = 0; i < calendars.length; i++) {
                    var cal = calendars[i];
                    if (cal && (cal.nId != ZmFolder.ID_TRASH)) {
                        calIds.push(appCtxt.multiAccounts ? cal.id : cal.nId);
                    }
                }
            }

            if ((calIds.length == 0) || !email) {
                return "<b>" + ZmMsg.statusFree + "</b>";
            }
        }

		var startTime = start.getTime();
		var endTime = end.getTime();

		var dayStart = new Date(start.getTime());
		dayStart.setHours(0, 0, 0, 0);

		var dayEnd = new Date(dayStart.getTime() + AjxDateUtil.MSEC_PER_DAY);

		// to avoid frequent request to server we cache the appt for the entire
		// day first before getting the appts for selected time interval
		this.getApptSummaries({start:dayStart.getTime(), end:dayEnd.getTime(), fanoutAllDay:true, folderIds: calIds});

		var result = this.getApptSummaries({start:startTime, end:endTime, fanoutAllDay:true, folderIds: calIds});

		return ZmApptViewHelper.getDayToolTipText(start, result, this, noheader, emptyMsg);
	} catch (ex) {
		DBG.println(ex);
		return "<b>" + ZmMsg.meetingStatusUnknown + "</b>";
	}
};

ZmCalViewController.prototype._miniCalDateRangeListener =
function(ev) {
	this._scheduleMaintenance(ZmCalViewController.MAINT_MINICAL);
};

ZmCalViewController.prototype._dateRangeListener =
function(ev) {
	ev.item.setNeedsRefresh(true);
	this._scheduleMaintenance(ZmCalViewController.MAINT_VIEW);
};

ZmCalViewController.prototype.processInlineCalSearch =
function() {
	var srchResponse = window.inlineCalSearchResponse;
	if (!srchResponse) { return; }

	var params = srchResponse.search;
	var response = srchResponse.Body;

	if (params instanceof Array) {
		params = params[0];
	}

	var viewId = this._currentViewId || this.getDefaultViewType();
	var fanoutAllDay = (viewId == ZmId.VIEW_CAL_MONTH);
	var searchParams = {start: params.s, end: params.e, fanoutAllDay: fanoutAllDay, callback: null};
	searchParams.folderIds = params.l ? params.l.split(",") : []; 
	searchParams.query = "";

	var miniCalParams = this.getMiniCalendarParams();
	miniCalParams.folderIds = searchParams.folderIds;

	this.apptCache.setSearchParams(searchParams);
	this.apptCache.processBatchResponse(response.BatchResponse, searchParams, miniCalParams);
};

ZmCalViewController.prototype.setCurrentView =
function(view) {
	// do nothing
};

ZmCalViewController.prototype._resetNavToolBarButtons =
function(view) {
	this._navToolBar[ZmId.VIEW_CAL].enable([ZmOperation.PAGE_BACK, ZmOperation.PAGE_FORWARD], true);
};

ZmCalViewController.prototype._resetToolbarOperations =
function(viewId) {
	ZmListController.prototype._resetToolbarOperations.call(this);
};

ZmCalViewController.prototype._setNavToolbarPosition =
function(navToolbar, currentViewName) {
    if(!navToolbar || !currentViewName) { return; }
    navToolbar.setVisible(currentViewName != ZmId.VIEW_CAL_LIST);
};

ZmCalViewController.prototype._resetOperations =
function(parent, num) {
    if (!parent) return;

	parent.enableAll(true);
	var currViewName = this._viewMgr.getCurrentViewName();
    parent.enable(ZmOperation.TAG_MENU, appCtxt.get(ZmSetting.TAGGING_ENABLED) && !appCtxt.isWebClientOffline());

	if (currViewName == ZmId.VIEW_CAL_LIST && num > 1) { return; }

    this._setNavToolbarPosition(this._navToolBar[ZmId.VIEW_CAL], currViewName);

    var appt = this.getSelection()[0];
    var calendar = appt && appt.getFolder();
    var isTrash = calendar && calendar.nId == ZmOrganizer.ID_TRASH;
    num = ( isTrash && this.getCurrentListView() ) ? this.getCurrentListView().getSelectionCount() : num ;
    var isReadOnly = calendar ? calendar.isReadOnly() : false;
    var isSynced = Boolean(calendar && calendar.url);
    var isShared = calendar ? calendar.isRemote() : false;
    var disabled = isSynced || isReadOnly || (num == 0) || appCtxt.isWebClientOffline();
    var isPrivate = appt && appt.isPrivate() && calendar.isRemote() && !calendar.hasPrivateAccess();
    var isForwardable = !isTrash && calendar && !calendar.isReadOnly() && appCtxt.get(ZmSetting.GROUP_CALENDAR_ENABLED) && !appCtxt.isWebClientOffline();
    var isReplyable = !isTrash && appt && (num == 1) && !appCtxt.isWebClientOffline();
    var isTrashMultiple = isTrash && (num && num>1);

    parent.enable([ZmOperation.REPLY, ZmOperation.REPLY_ALL], (isReplyable && !isTrashMultiple));
    parent.enable(ZmOperation.TAG_MENU, ((!isReadOnly && !isSynced && num > 0) || isTrashMultiple) && !appCtxt.isWebClientOffline());
    parent.enable(ZmOperation.VIEW_APPOINTMENT, !isPrivate && !isTrashMultiple);
    parent.enable([ZmOperation.FORWARD_APPT, ZmOperation.FORWARD_APPT_INSTANCE, ZmOperation.FORWARD_APPT_SERIES], isForwardable
                  && !isTrashMultiple  && !appCtxt.isWebClientOffline());
    parent.enable(ZmOperation.PROPOSE_NEW_TIME, !isTrash && (appt && !appt.isOrganizer()) && !isTrashMultiple && !appCtxt.isWebClientOffline());
    parent.enable(ZmOperation.SHOW_ORIG, num == 1 && appt && appt.getRestUrl() != null && !isTrashMultiple  && !appCtxt.isWebClientOffline());

    parent.enable([ZmOperation.DELETE, ZmOperation.MOVE, ZmOperation.MOVE_MENU], !disabled || isTrashMultiple);

    parent.enable(ZmOperation.VIEW_APPT_INSTANCE,!isTrash);

    var apptAccess = ((appt && appt.isPrivate() && calendar.isRemote()) ? calendar.hasPrivateAccess() : true );
    parent.enable(ZmOperation.DUPLICATE_APPT,apptAccess && !isTrashMultiple && this._app.containsWritableFolder() && !appCtxt.isWebClientOffline());
    parent.enable(ZmOperation.SHOW_ORIG,apptAccess && !isTrashMultiple  && !appCtxt.isWebClientOffline());

	/*if (currViewName == ZmId.VIEW_CAL_LIST) {
		parent.enable(ZmOperation.PRINT_CALENDAR, num > 0);
	} */
	parent.enable(ZmOperation.PRINT_CALENDAR, !appCtxt.isWebClientOffline());

	// disable button for current view
	var op = ZmCalViewController.VIEW_TO_OP[currViewName];
	// setSelected on a Toolbar; Do nothing for an ActionMenu
	if (op && parent.setSelected) {
		parent.setSelected(op);
	}

    if (appCtxt.isWebClientOffline()) {
        // Disable the list view when offline
        //parent.enable(ZmCalViewController.VIEW_TO_OP[ZmOperation.CAL_LIST_VIEW], false);
        parent.enable(ZmOperation.CAL_LIST_VIEW, false);
    }

    //this._resetQuickCommandOperations(parent);
};

ZmCalViewController.prototype._listSelectionListener =
function(ev) {

	ZmListController.prototype._listSelectionListener.call(this, ev);
    // to avoid conflicts on opening a readonly appointment in readonly view
	if (ev.detail == DwtListView.ITEM_SELECTED) {
		this._viewMgr.getCurrentView()._apptSelected();
	} else if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		var appt = ev.item;
		if (appt.isPrivate() && appt.getFolder().isRemote() && !appt.getFolder().hasPrivateAccess()) {
			var msgDialog = appCtxt.getMsgDialog();
			msgDialog.setMessage(ZmMsg.apptIsPrivate, DwtMessageDialog.INFO_STYLE);
			msgDialog.popup();
		} else {
			// open a appointment view
			this._apptIndexShowing = this._list.indexOf(appt);
			this._apptFromView = this._viewMgr.getCurrentView();
			this._showAppointmentDetails(appt);
		}
	}
};

ZmCalViewController.prototype.getViewMgr =
function(){
    return this._viewMgr;
}

ZmCalViewController.prototype._handleMenuViewAction =
function(ev) {
	var actionMenu = this.getActionMenu();
	var appt = actionMenu.__appt;
	delete actionMenu.__appt;

    var orig = appt.getOrig();
    appt = orig && orig.isMultiDay() ? orig : appt;
	var calendar = appt.getFolder();
    var isTrash = calendar && calendar.nId == ZmOrganizer.ID_TRASH;
	var isSynced = Boolean(calendar.url);
	var mode = ZmCalItem.MODE_EDIT;
	var menuItem = ev.item;
	var menu = menuItem.parent;
	var id = menu.getData(ZmOperation.KEY_ID);
	switch(id) {
		case ZmOperation.VIEW_APPT_INSTANCE:	mode = ZmCalItem.MODE_EDIT_SINGLE_INSTANCE; break;
		case ZmOperation.VIEW_APPT_SERIES:		mode = ZmCalItem.MODE_EDIT_SERIES; break;
	}
	
	if (appt.isReadOnly() || isSynced || isTrash || appCtxt.isWebClientOffline()) {
		var clone = ZmAppt.quickClone(appt);
		var callback = new AjxCallback(this, this._showApptReadOnlyView, [clone, mode]);
		clone.getDetails(mode, callback, this._errorCallback);
	} else {
		this.editAppointment(appt, mode);
	}
};

ZmCalViewController.prototype._handleApptRespondAction =
function(ev) {
	var appt = this.getSelection()[0];
    if(!appt){return;}
	var type = ev.item.getData(ZmOperation.KEY_ID);
	var op = ev.item.parent.getData(ZmOperation.KEY_ID);
	var respCallback = new AjxCallback(this, this._handleResponseHandleApptRespondAction, [appt, type, op, null]);
	appt.getDetails(null, respCallback, this._errorCallback);
};

ZmCalViewController.prototype._handleResponseHandleApptRespondAction =
function(appt, type, op, callback) {
	var msgController = this._getMsgController();
	msgController.setMsg(appt.message);
	// poke the msgController
	var instanceDate = op == ZmOperation.VIEW_APPT_INSTANCE ? new Date(appt.uniqStartTime) : null;

    if(type == ZmOperation.REPLY_DECLINE) {
        var promptCallback = new AjxCallback(this, this._sendInviteReply, [type, instanceDate]);
        this._promptDeclineNotify(appt, promptCallback, callback);
    }else {
        msgController._sendInviteReply(type, appt.compNum || 0, instanceDate, appt.getRemoteFolderOwner(), false, null, null, callback);
    }
};

ZmCalViewController.prototype._promptDeclineNotify =
function(appt, promptCallback, callback) {
	if (!this._declineNotifyDialog) {
		var msg = ZmMsg.confirmDeclineAppt;
		this._declineNotifyDialog = new ZmApptDeleteNotifyDialog({
			parent: this._shell,
			title: AjxMsg.confirmTitle,
			confirmMsg: msg,
			choiceLabel1: ZmMsg.dontNotifyOrganizer,
			choiceLabel2 : ZmMsg.notifyOrganizer
		});
	}
	this._declineNotifyDialog.popup(new AjxCallback(this, this._declineNotifyYesCallback, [appt, promptCallback, callback]));
};

ZmCalViewController.prototype._declineNotifyYesCallback =
function(appt, promptCallback, callback) {
	var notifyOrg = !this._declineNotifyDialog.isDefaultOptionChecked();
    if(promptCallback) promptCallback.run(appt, notifyOrg, callback);
};


ZmCalViewController.prototype._sendInviteReply =
function(type, instanceDate, appt, notifyOrg, callback) {
    var msgController = this._getMsgController();
    msgController._sendInviteReply(type, appt.compNum || 0, instanceDate, appt.getRemoteFolderOwner(), !notifyOrg, null, null, callback);
};

ZmCalViewController.prototype._handleApptEditRespondAction =
function(ev) {
	var appt = this.getSelection()[0];
	var id = ev.item.getData(ZmOperation.KEY_ID);
	var op = ev.item.parent.parent.parent.getData(ZmOperation.KEY_ID);
	var respCallback = new AjxCallback(this, this._handleResponseHandleApptEditRespondAction, [appt, id, op]);
	appt.getDetails(null, respCallback, this._errorCallback);
};

ZmCalViewController.prototype._handleResponseHandleApptEditRespondAction =
function(appt, id, op) {
	var msgController = this._getMsgController();
	var msg = appt.message;
	msg.subject = msg.subject || appt.name;
	if (!msg.getAddress(AjxEmailAddress.REPLY_TO)) {
		msg.setAddress(AjxEmailAddress.REPLY_TO, new AjxEmailAddress(appt.organizer));
	}
	msgController.setMsg(msg);

	// poke the msgController
	switch (id) {
		case ZmOperation.EDIT_REPLY_ACCEPT: 	id = ZmOperation.REPLY_ACCEPT; break;
		case ZmOperation.EDIT_REPLY_DECLINE: 	id = ZmOperation.REPLY_DECLINE; break;
		case ZmOperation.EDIT_REPLY_TENTATIVE: 	id = ZmOperation.REPLY_TENTATIVE; break;
	}
	var instanceDate = op == ZmOperation.VIEW_APPT_INSTANCE ? new Date(appt.uniqStartTime) : null;
	msgController._editInviteReply(id, 0, instanceDate, appt.getRemoteFolderOwner());
};

ZmCalViewController.prototype._handleError =
function(ex) {
	if (ex.code == 'mail.INVITE_OUT_OF_DATE' ||	ex.code == 'mail.NO_SUCH_APPT') {
		var msgDialog = appCtxt.getMsgDialog();
		msgDialog.registerCallback(DwtDialog.OK_BUTTON, this._handleError2, this, [msgDialog]);
		msgDialog.setMessage(ZmMsg.apptOutOfDate, DwtMessageDialog.INFO_STYLE);
		msgDialog.popup();
		return true;
	}
	return false;
};

ZmCalViewController.prototype._handleError2 =
function(msgDialog) {
	msgDialog.unregisterCallback(DwtDialog.OK_BUTTON);
	msgDialog.popdown();
	this._refreshAction(false);
};

ZmCalViewController.prototype._initCalViewMenu =
function(menu) {
	for (var i = 0; i < ZmCalViewController.OPS.length; i++) {
		var op = ZmCalViewController.OPS[i];
		menu.addSelectionListener(op, this._listeners[op]);
        menu.enable(op, ((op != ZmOperation.CAL_LIST_VIEW) || !appCtxt.isWebClientOffline()));
	}
};

/**
 * Overrides ZmListController.prototype._getViewActionMenuOps
 * 
 * @private
 */
ZmCalViewController.prototype._getViewActionMenuOps =
function () {
    if(this._app.containsWritableFolder()) {
        return [ZmOperation.NEW_APPT, ZmOperation.NEW_ALLDAY_APPT,
			    ZmOperation.SEP,
			    ZmOperation.TODAY, ZmOperation.CAL_VIEW_MENU];
    }
    else {
        return [ZmOperation.TODAY,
                ZmOperation.CAL_VIEW_MENU];
    }
};

/**
 * Overrides ZmListController.prototype._initializeActionMenu
 * 
 * @private
 */
ZmCalViewController.prototype._initializeActionMenu =
function() {
	this._actionMenu = this._createActionMenu(this._getActionMenuOps());
	if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		this._setupTagMenu(this._actionMenu);
	}

	var recurrenceModeOps = this._getRecurrenceModeOps();
	var params = {parent: this._shell, menuItems: recurrenceModeOps};
	this._recurrenceModeActionMenu = new ZmActionMenu(params);
	for (var i = 0; i < recurrenceModeOps.length; i++) {
		var recurrenceMode = recurrenceModeOps[i];
		var modeItem = this._recurrenceModeActionMenu.getMenuItem(recurrenceMode);
		var menuOpsForMode = this._getActionMenuOps(recurrenceMode);
		var actionMenuForMode = this._createActionMenu(menuOpsForMode, modeItem, recurrenceMode);
		if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
			this._setupTagMenu(actionMenuForMode);
		}
		modeItem.setMenu(actionMenuForMode);
		// NOTE: Target object for listener is menu item
		var menuItemListener = this._recurrenceModeMenuPopup.bind(modeItem);
		modeItem.addListener(AjxEnv.isIE ? DwtEvent.ONMOUSEENTER : DwtEvent.ONMOUSEOVER, menuItemListener);
	}
	this._recurrenceModeActionMenu.addPopdownListener(this._menuPopdownListener);
};

ZmCalViewController.prototype._createActionMenu =
function(menuItems, parentMenuItem, context) {
	var params = {parent: parentMenuItem || this._shell, menuItems: menuItems, context: this._getMenuContext() + (context ? "_" + context : "")};
	var actionMenu = new ZmActionMenu(params);
	menuItems = actionMenu.opList;
	for (var i = 0; i < menuItems.length; i++) {
		var menuItem = menuItems[i];
		if (menuItem == ZmOperation.INVITE_REPLY_MENU) {
			var menu = actionMenu.getOp(ZmOperation.INVITE_REPLY_MENU).getMenu();
			menu.addSelectionListener(ZmOperation.EDIT_REPLY_ACCEPT, this._listeners[ZmOperation.EDIT_REPLY_ACCEPT]);
			menu.addSelectionListener(ZmOperation.EDIT_REPLY_TENTATIVE, this._listeners[ZmOperation.EDIT_REPLY_TENTATIVE]);
			menu.addSelectionListener(ZmOperation.EDIT_REPLY_DECLINE, this._listeners[ZmOperation.EDIT_REPLY_DECLINE]);
		} else if (menuItem == ZmOperation.CAL_VIEW_MENU) {
			var menu = actionMenu.getOp(ZmOperation.CAL_VIEW_MENU).getMenu();
			this._initCalViewMenu(menu);
		}
		if (this._listeners[menuItem]) {
			actionMenu.addSelectionListener(menuItem, this._listeners[menuItem]);
		}
	}
	actionMenu.addPopdownListener(this._menuPopdownListener);
	return actionMenu;
};

/**
 * The <code>this</code> in this method is the menu item.
 * 
 * @private
 */
ZmCalViewController.prototype._recurrenceModeMenuPopup =
function(ev) {
	if (!this.getEnabled()) { return; }

	var menu = this.getMenu();
	var opId = this.getData(ZmOperation.KEY_ID);
	menu.setData(ZmOperation.KEY_ID, opId);
};

/**
 * Overrides ZmListController.prototype._getActionMenuOptions
 * 
 * @private
 */
ZmCalViewController.prototype._getActionMenuOps =
function(recurrenceMode) {

	var deleteOp = ZmOperation.DELETE;
	var viewOp = ZmOperation.VIEW_APPOINTMENT;
	var forwardOp = ZmOperation.FORWARD_APPT;

	if (recurrenceMode == ZmOperation.VIEW_APPT_INSTANCE) {
		deleteOp = ZmOperation.DELETE_INSTANCE;
		viewOp = ZmOperation.OPEN_APPT_INSTANCE;
		forwardOp = ZmOperation.FORWARD_APPT_INSTANCE;
	} else if (recurrenceMode == ZmOperation.VIEW_APPT_SERIES) {
		deleteOp = ZmOperation.DELETE_SERIES;
		viewOp = ZmOperation.OPEN_APPT_SERIES;
		forwardOp = ZmOperation.FORWARD_APPT_SERIES;
	}
	
	var retVal = [viewOp,
	      		ZmOperation.PRINT,
	      		ZmOperation.SEP,
	    		ZmOperation.REPLY_ACCEPT,
	    		ZmOperation.REPLY_TENTATIVE,
	    		ZmOperation.REPLY_DECLINE,
	    		ZmOperation.INVITE_REPLY_MENU,
                ZmOperation.PROPOSE_NEW_TIME,
                ZmOperation.REINVITE_ATTENDEES,
	    		ZmOperation.DUPLICATE_APPT,
	    		ZmOperation.SEP,
	    		ZmOperation.REPLY,
	    		ZmOperation.REPLY_ALL,
	    		forwardOp,
	    		deleteOp,
	    		ZmOperation.SEP];
	if (recurrenceMode != ZmOperation.VIEW_APPT_INSTANCE) {
		retVal.push(ZmOperation.MOVE);
	}
	retVal.push(ZmOperation.TAG_MENU);
	retVal.push(ZmOperation.SHOW_ORIG);
    //retVal.push(ZmOperation.QUICK_COMMANDS);
	return retVal;
};

ZmCalViewController.prototype._getRecurrenceModeOps =
function() {
	return [ZmOperation.VIEW_APPT_INSTANCE, ZmOperation.VIEW_APPT_SERIES];
};

ZmCalViewController.prototype._enableActionMenuReplyOptions =
function(appt, actionMenu) {

    if (!(appt && actionMenu)) {
        return;
    }
    var isExternalAccount = appCtxt.isExternalAccount();
    var isFolderReadOnly = appt.isFolderReadOnly();
	var isShared = appt.isShared();

	//Note - isOrganizer means the Calendar is the organizer of the appt. i.e. the appointment was created on this calendar.
	//This could be "true" even if the current user is just a sharee of the calendar.
	var isTheCalendarOrganizer = appt.isOrganizer();

	// find the checked calendar for this appt
	var calendar;
	var folderId = appt.getLocalFolderId();
	var calendars = this.getCheckedCalendars(true);
	for (var i = 0; i < calendars.length; i++) {
		if (calendars[i].id == folderId) {
			calendar = calendars[i];
			break;
		}
	}
    //bug:68452 if its a trash folder then its not present in the calendars array
    if (!calendar){
        calendar = appt.getFolder();
    }
	var share = calendar && calendar.link ? calendar.getMainShare() : null;
	var workflow = share ? share.isWorkflow() : true;
    var isTrash = calendar && calendar.nId == ZmOrganizer.ID_TRASH;
	var isPrivate = appt.isPrivate() && calendar.isRemote() && !calendar.hasPrivateAccess();
    var isReplyable = !isTrash && appt.otherAttendees;
	var isForwardable = !isTrash && calendar && !calendar.isReadOnly() && appCtxt.get(ZmSetting.GROUP_CALENDAR_ENABLED);

	//don't show for organizer calendar, or readOnly attendee calendar.
	var showAcceptDecline = !isTheCalendarOrganizer && !isFolderReadOnly;
	actionMenu.setItemVisible(ZmOperation.REPLY_ACCEPT, showAcceptDecline);
	actionMenu.setItemVisible(ZmOperation.REPLY_DECLINE, showAcceptDecline);
	actionMenu.setItemVisible(ZmOperation.REPLY_TENTATIVE, showAcceptDecline);
	actionMenu.setItemVisible(ZmOperation.INVITE_REPLY_MENU, showAcceptDecline);
	actionMenu.setItemVisible(ZmOperation.PROPOSE_NEW_TIME, showAcceptDecline);
    actionMenu.setItemVisible(ZmOperation.REINVITE_ATTENDEES, !isTrash && isTheCalendarOrganizer && !isFolderReadOnly && !appt.inviteNeverSent && appt.otherAttendees);
    actionMenu.setItemVisible(ZmOperation.TAG_MENU, appCtxt.get(ZmSetting.TAGGING_ENABLED));

    // Initially enabling all the options in the action menu. And then selectively disabling unsupported options for special users.
    actionMenu.enableAll(true);

	//enable/disable specific actions, only if we actually show them. (we don't show for organizer or shared calendar)
	if (showAcceptDecline) {
		var enabled = isReplyable && workflow && !isPrivate && !isExternalAccount;
        actionMenu.enable(ZmOperation.REPLY_ACCEPT, enabled && appt.ptst != ZmCalBaseItem.PSTATUS_ACCEPT);
        actionMenu.enable(ZmOperation.REPLY_DECLINE, enabled && appt.ptst != ZmCalBaseItem.PSTATUS_DECLINED);
        actionMenu.enable(ZmOperation.REPLY_TENTATIVE, enabled && appt.ptst != ZmCalBaseItem.PSTATUS_TENTATIVE);
        actionMenu.enable(ZmOperation.INVITE_REPLY_MENU, enabled);
		// edit reply menu
		var mi = enabled && actionMenu.getMenuItem(ZmOperation.INVITE_REPLY_MENU);
		var replyMenu = mi && mi.getMenu();
		if (replyMenu) {
			replyMenu.enable(ZmOperation.EDIT_REPLY_ACCEPT,	appt.ptst != ZmCalBaseItem.PSTATUS_ACCEPT);
			replyMenu.enable(ZmOperation.EDIT_REPLY_DECLINE, appt.ptst != ZmCalBaseItem.PSTATUS_DECLINED);
			replyMenu.enable(ZmOperation.EDIT_REPLY_TENTATIVE, appt.ptst != ZmCalBaseItem.PSTATUS_TENTATIVE);
		}
	}

    actionMenu.enable([ZmOperation.FORWARD_APPT, ZmOperation.FORWARD_APPT_INSTANCE, ZmOperation.FORWARD_APPT_SERIES], isForwardable);
	var myEmail = appt.getFolder().getAccount().getEmail();
	//the last condition in the following is for the somewhat corner case user1 invites user2, and user1 is looking at user2's calendar as a share.
	actionMenu.enable(ZmOperation.REPLY, isReplyable && !isTheCalendarOrganizer && myEmail !== appt.organizer); //the organizer can't reply just to himself
	actionMenu.enable(ZmOperation.REPLY_ALL, isReplyable);

    var disabledOps;
    if(appCtxt.isWebClientOffline()) {
         disabledOps = [ZmOperation.REINVITE_ATTENDEES,
            ZmOperation.PROPOSE_NEW_TIME,
            ZmOperation.REPLY,
            ZmOperation.REPLY_ALL,
            ZmOperation.DUPLICATE_APPT,
            ZmOperation.DELETE,
            ZmOperation.DELETE_INSTANCE,
            ZmOperation.DELETE_SERIES,
            ZmOperation.FORWARD_APPT,
            ZmOperation.FORWARD_APPT_INSTANCE,
            ZmOperation.FORWARD_APPT_SERIES,
            ZmOperation.SHOW_ORIG,
            ZmOperation.DUPLICATE_APPT,
			ZmOperation.MOVE,
			ZmOperation.PRINT,
			ZmOperation.TAG_MENU,
            ZmOperation.MOVE_MENU];
        actionMenu.enable(disabledOps, false);
    } else {
        if(isExternalAccount) {
            disabledOps = [ZmOperation.REINVITE_ATTENDEES,
                ZmOperation.PROPOSE_NEW_TIME,
                ZmOperation.REPLY,
                ZmOperation.REPLY_ALL,
                ZmOperation.DUPLICATE_APPT,
                ZmOperation.DELETE,
                ZmOperation.DELETE_INSTANCE,
                ZmOperation.DELETE_SERIES];

            actionMenu.enable(disabledOps, false);
        }

        // bug:71007 Disabling unsupported options for shared calendar with view only rights
        if (isFolderReadOnly) {
            disabledOps = [ZmOperation.REINVITE_ATTENDEES,
                           ZmOperation.PROPOSE_NEW_TIME,
                           ZmOperation.DELETE,
                           ZmOperation.DELETE_INSTANCE,
                           ZmOperation.DELETE_SERIES,
                           ZmOperation.MOVE,
                           ZmOperation.TAG_MENU,
                           ZmOperation.MOVE_MENU];

            actionMenu.enable(disabledOps, false);
        }
    }

	var del = actionMenu.getMenuItem(ZmOperation.DELETE);
	if (del && !isTrash) {
		del.setText((isTheCalendarOrganizer && appt.otherAttendees) ? ZmMsg.cancel : ZmMsg.del);
		var isSynced = Boolean(calendar.url);
		del.setEnabled(!calendar.isReadOnly() && !isSynced && !isPrivate && !appCtxt.isWebClientOffline());
	}

	// recurring action menu options
	if (this._recurrenceModeActionMenu && !isTrash) {
		this._recurrenceModeActionMenu.enable(ZmOperation.VIEW_APPT_SERIES, !appt.exception);
	}
};

ZmCalViewController.prototype._listActionListener =
function(ev) {
	ZmListController.prototype._listActionListener.call(this, ev);
	var count = this.getSelectionCount();
	var appt = ev.item;
	var actionMenu = this.getActionMenu();
	actionMenu.enableAll(count === 1);
	if (count > 1) {
		var isExternalAccount = appCtxt.isExternalAccount();
  		var isFolderReadOnly = appt.isFolderReadOnly();
		var enabled = !isExternalAccount && !isFolderReadOnly;
		actionMenu.enable([ZmOperation.TAG_MENU, ZmOperation.MOVE_MENU, ZmOperation.MOVE, ZmOperation.DELETE], enabled);
		actionMenu.popup(0, ev.docX, ev.docY);
		return;
	}
    var calendar = appt && appt.getFolder();
    var isTrash = calendar && calendar.nId == ZmOrganizer.ID_TRASH;
	var menu = (appt.isRecurring() && !appt.isException && !isTrash) ? this._recurrenceModeActionMenu : actionMenu;
	this._enableActionMenuReplyOptions(appt, menu);
	var op = (menu == actionMenu) && appt.exception ? ZmOperation.VIEW_APPT_INSTANCE : null;
	actionMenu.__appt = appt;
	menu.setData(ZmOperation.KEY_ID, op);

	if (appt.isRecurring() && !appt.isException && !isTrash) {
		var menuItem = menu.getMenuItem(ZmOperation.VIEW_APPT_INSTANCE);
		this._setTagMenu(menuItem.getMenu());
		this._enableActionMenuReplyOptions(appt, menuItem.getMenu());
		menuItem = menu.getMenuItem(ZmOperation.VIEW_APPT_SERIES);
		this._setTagMenu(menuItem.getMenu());
		this._enableActionMenuReplyOptions(appt, menuItem.getMenu());
	}
	menu.popup(0, ev.docX, ev.docY);
};

ZmCalViewController.prototype._clearViewActionMenu =
function() {
    // This will cause it to regenerate next time its accessed
    this._viewActionMenu = null;
}

ZmCalViewController.prototype._viewActionListener =
function(ev) {
	if (!this._viewActionMenu) {
		var menuItems = this._getViewActionMenuOps();
		if (!menuItems) return;
		var overrides = {};
		overrides[ZmOperation.TODAY] = {textKey:"todayGoto"};
		var params = {parent:this._shell, menuItems:menuItems, overrides:overrides};
		this._viewActionMenu = new ZmActionMenu(params);
		menuItems = this._viewActionMenu.opList;
		for (var i = 0; i < menuItems.length; i++) {
			var menuItem = menuItems[i];
			if (menuItem == ZmOperation.CAL_VIEW_MENU) {
				var menu = this._viewActionMenu.getOp(ZmOperation.CAL_VIEW_MENU).getMenu();
				this._initCalViewMenu(menu);
			} else if (this._listeners[menuItem]) {
				this._viewActionMenu.addSelectionListener(menuItem, this._listeners[menuItem]);
                if ((menuItem == ZmOperation.NEW_APPT) || (menuItem == ZmOperation.NEW_ALLDAY_APPT)) {
                    this._viewActionMenu.enable(menuItem, !appCtxt.isWebClientOffline());
                }
			}
		}
        this._viewActionMenu.addPopdownListener(this._menuPopdownListener);
	}

	if ( this._viewVisible && this._currentViewType == ZmId.VIEW_CAL_DAY) {
        var calId = ev.target.getAttribute(ZmCalDayTabView.ATTR_CAL_ID);
        if(!calId) {
            var view = this._viewMgr.getView(this._currentViewId);
            var gridLoc = Dwt.toWindow(ev.target, ev.elementX, ev.elementY, ev.target, true);
            var col = view._getColFromX(gridLoc.x);
            calId = (col && col.cal) ? col.cal.id : null;
        }
        this._viewActionMenu._calendarId = calId;
	} else {
		this._viewActionMenu._calendarId = null;
	}

	this._viewActionMenu.__view = ev.item;
	this._viewActionMenu.popup(0, ev.docX, ev.docY);
};

ZmCalViewController.prototype._dropListener =
function(ev) {
	var view = this._listView[this._currentViewId];
	var div = view.getTargetItemDiv(ev.uiEvent);
	var item = div ? view.getItemFromElement(div) : null;

	// only tags can be dropped on us *if* we are not readonly
	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		if (item && item.type == ZmItem.APPT) {
			var calendar = item.getFolder();
			var isReadOnly = calendar ? calendar.isReadOnly() : false;
			var isSynced = Boolean(calendar && calendar.url);
			if (isSynced || isReadOnly  || appCtxt.isWebClientOffline()) {
				ev.doIt = false; // can't tag a GAL or shared contact
				view.dragSelect(div);
				return;
			}
		}
	}

	ZmListController.prototype._dropListener.call(this, ev);
};

ZmCalViewController.prototype.sendRequest =
function(soapDoc) {
	try {
		return appCtxt.getAppController().sendRequest({soapDoc: soapDoc});
	} catch (ex) {
		// do nothing
		return null;
	}
};

/**
 * Caller is responsible for exception handling. caller should also not modify
 * appts in this list directly.
 *
 * @param	{Hash}		params		a hash of parameters
 * @param	{long}	params.start 			the start time (in milliseconds)
 * @param	{long}	params.end				the end time (in milliseconds)
 * @param	{Boolean}	params.fanoutAllDay	if <code>true</code>, 
 * @param	{Array}	params.folderIds		the list of calendar folder Id's (null means use checked calendars in overview)
 * @param	{AjxCallback}	params.callback		the callback triggered once search results are returned
 * @param	{Boolean}	params.noBusyOverlay	if <code>true</code>, do not show veil during search
 * 
 * @private
 */
ZmCalViewController.prototype.getApptSummaries =
function(params) {
	if (!params.folderIds) {
		params.folderIds = this.getCheckedCalendarFolderIds();
	}
	params.query = this._userQuery;

	return this.apptCache.getApptSummaries(params);
};

ZmCalViewController.prototype.handleUserSearch =
function(params, callback) {
	AjxDispatcher.require(["MailCore", "CalendarCore", "Calendar"]);
	//Calendar search is defaulted to list view when searched from the calendar app.
	if (params.origin === ZmId.SEARCH) {
		this.show(ZmId.VIEW_CAL_LIST, null, true);
	}
	else {
		this.show(null, null, true);
	}

	this.apptCache.clearCache();
	this._viewMgr.setNeedsRefresh();
	this._userQuery = params.query;

	// set start/end date boundaries
	var view = this._listView[this._currentViewId];

	if (view) {
		var rt = view.getTimeRange();
		params.start = rt.start;
		params.end = rt.end;
	} else if (this._miniCalendar) {
		var calRange = this._miniCalendar.getDateRange();
		params.start = calRange.start.getTime();
		params.end = calRange.end.getTime();
	} else {
		// TODO - generate start/end based on current month?
	}

	params.fanoutAllDay = view && view._fanoutAllDay();
	params.callback = this._searchResponseCallback.bind(this, callback);

	this.getApptSummaries(params);
};

ZmCalViewController.prototype._searchResponseCallback =
function(callback, list, userQuery, result) {

	this.show(null, null, true);	// always make sure a calendar view is being shown
	this._userQuery = userQuery;	// cache the user-entered search query

	this._maintGetApptCallback(ZmCalViewController.MAINT_VIEW, this._listView[this._currentViewId], list, true, userQuery);

	if (callback) {
		callback.run(result);
	}
};

// TODO: appt is null for now. we are just clearing our caches...
ZmCalViewController.prototype.notifyCreate =
function(create) {
	// mark folders which needs to be cleared
	if (create && create.l) {
		var cal = appCtxt.getById(create.l);
		if (cal && cal.id) {
			this._clearCacheFolderMap[cal.id] = true;
		}
	}
};

ZmCalViewController.prototype.notifyDelete =
function(ids) {
    if (this._modifyAppts) {
        var apptList = this._viewMgr.getSubContentView().getApptList();
        for (var i = 0; i < ids.length; i++) {
            var appt = ZmCalViewController.__AjxVector_getById(apptList, ids[i])
            if (appt) {
                apptList.remove(appt);
                this._modifyAppts.removes++;
            }
        }
    }

	if (this._clearCache) { return; }

	this._clearCache = this.apptCache.containsAnyId(ids);
	this.handleEditConflict(ids);
};

ZmCalViewController.prototype.handleEditConflict =
function(ids) {
	//handling a case where appt is edited and related calendar is deleted
	if (appCtxt.getCurrentViewId() == ZmId.VIEW_APPOINTMENT) {
		var view = appCtxt.getCurrentView();
		var appt = view.getAppt(true);
		var calendar = appt && appt.getFolder();
		var idStr = ","+ ids+",";
		if (idStr.indexOf("," + calendar.id + ",") >= 0) {
			this._app.getApptComposeController()._closeView();
		}
	}
};

ZmCalViewController.prototype.notifyModify =
function(modifies) {
    var apptObjs = modifies.appt;
    if (apptObjs && this._viewMgr) {
        var listView = this._viewMgr.getSubContentView();
        if (listView) {
            for (var i = 0; i < apptObjs.length; i++) {
                var apptObj = apptObjs[i];
                // case 1: item moved *into* Trash
                if (apptObj.l == ZmOrganizer.ID_TRASH) {
                    this._modifyAppts.adds++;
                    ZmAppt.loadByUid(apptObj.uid, new AjxCallback(this, this._updateSubContent));
                }
                // case 2: item moved *from* Trash
                else {
                    var apptList = listView.getApptList();
                    var appt = ZmCalViewController.__AjxVector_getById(apptList, apptObj.id)
                    if (appt) {
                        apptList.remove(appt);
                        this._modifyAppts.removes++;
                        // TODO: was this appointment moved to a checked calendar w/in the specified range?
                    }
                }
                // case 3: neither, ignore
            }
        }
    }

	if (this._clearCache) { return; }

	// if any of the ids are in the cache then...
	for (var name in modifies) {
		var list = modifies[name];
		this._clearCache = this._clearCache || this.apptCache.containsAnyItem(list);
	}
};

ZmCalViewController.__AjxVector_getById = function(vector, id) {
    var array = vector.getArray();
    for (var i = 0; i < array.length; i++) {
        var item = array[i];
        if (item.id == id) return item;
    }
    return null;
};

ZmCalViewController.prototype._updateSubContent = function(appt) {
    if (appt) {
        var listView = this._viewMgr.getSubContentView();
        if (listView) {
            if (!listView.hasItem(appt.id)) {
                listView.getApptList().add(appt);
            }
            listView.setNeedsRefresh(true);
            if (!this._modifyAppts || --this._modifyAppts.adds <= 0) {
                listView.refresh();
                this._clearCache = true;
                this.refreshHandler();
            }
        }
    }
};

// this gets called before all the above notify* methods get called
ZmCalViewController.prototype.preNotify = function(notify) {
    DBG.println(AjxDebug.DBG2, "ZmCalViewController: preNotify");
    this._modifyAppts = null;
    if (notify.deleted || (notify.modified && notify.modified.appt)) {
        var listView = this._viewMgr && this._viewMgr.getSubContentView();
        if (listView) {
            this._modifyAppts = { adds: 0, removes:0 };
        }
    }
};

// this gets called after all the above notify* methods get called
ZmCalViewController.prototype.postNotify =
function(notify) {
	DBG.println(AjxDebug.DBG2, "ZmCalViewController: postNotify: " + this._clearCache);

    // update the trash list all at once
    if (this._modifyAppts) {
        var removes = this._modifyAppts.removes;
        var adds = this._modifyAppts.adds;
        if (removes || adds) {
            var listView = this._viewMgr.getSubContentView();
            if (listView) {
                listView.setNeedsRefresh(true);
                listView.refresh();
                this._clearCache = true;
            }
        }
        this._modifyAppts.removes = 0;
    }

	var clearCacheByFolder = false;
	
	for (var i in this._clearCacheFolderMap) {
		DBG.println("clear cache :" + i);
		this.apptCache.clearCache(i);
		clearCacheByFolder = true;
	}
	this._clearCacheFolderMap = {};

	//offline client makes batch request for each account configured causing
	//refresh overlap clearing calendar
	var timer = (appCtxt.isOffline && this.searchInProgress) ? 1000 : 0;
	
	if (this._clearCache) {
		var act = new AjxTimedAction(this, this._refreshAction);
		AjxTimedAction.scheduleAction(act, timer);
		this._clearCache = false;
	} else if(clearCacheByFolder) {
		var act = new AjxTimedAction(this, this._refreshAction, [true]);
		AjxTimedAction.scheduleAction(act, timer);
	}
};

ZmCalViewController.prototype.setNeedsRefresh =
function(refresh) {
	if (this._viewMgr != null && this._viewMgr.setNeedsRefresh) {
		this._viewMgr.setNeedsRefresh(refresh);
	}
};

// returns true if moving given appt from local to remote folder or vice versa
ZmCalViewController.prototype.isMovingBetwAccounts =
function(appts, newFolderId) {
	appts = (!(appts instanceof Array)) ? [appts] : appts;
	var isMovingBetw = false;
	for (var i = 0; i < appts.length; i++) {
		var appt = appts[i];
		if (!appt.isReadOnly() && appt._orig && appt.otherAttendees && !appCtxt.isWebClientOffline()) {
			var origFolder = appt._orig.getFolder();
			var newFolder = appCtxt.getById(newFolderId);
			if (origFolder && newFolder) {
				if ((origFolder.id != newFolderId) &&
					((origFolder.link && !newFolder.link) || (!origFolder.link && newFolder.link)))
				{
					isMovingBetw = true;
					break;
				}
			}
		}
	}

	return isMovingBetw;
};

// returns true if moving given read-only invite appt between accounts
ZmCalViewController.prototype.isMovingBetwAcctsAsAttendee =
function(appts, newFolderId) {
	appts = (!(appts instanceof Array)) ? [appts] : appts;
	var isMovingBetw = false;
	for (var i = 0; i < appts.length; i++) {
		var appt = appts[i];
		if (appt.isReadOnly() && appt._orig) {
			var origFolder = appt._orig.getFolder();
			var newFolder = appCtxt.getById(newFolderId);
			if (origFolder && newFolder) {
				if ((origFolder.id != newFolderId) && origFolder.owner != newFolder.owner)
				{
					isMovingBetw = true;
					break;
				}
			}
		}
	}

	return isMovingBetw;
};

// this gets called when we get a refresh block from the server
ZmCalViewController.prototype.refreshHandler =
function() {
	var act = new AjxTimedAction(this, this._refreshAction);
	AjxTimedAction.scheduleAction(act, 0);
};

ZmCalViewController.prototype._refreshAction =
function(dontClearCache) {
	DBG.println(AjxDebug.DBG1, "ZmCalViewController: _refreshAction: " + dontClearCache);
	var forceMaintenance = false;
	// reset cache
	if (!dontClearCache) {
		this.apptCache.clearCache();
		forceMaintenance = true;
	}

	if (this._viewMgr != null) {
		// mark all views as dirty
		this._viewMgr.setNeedsRefresh(true);
		this._scheduleMaintenance(ZmCalViewController.MAINT_MINICAL|ZmCalViewController.MAINT_VIEW|ZmCalViewController.MAINT_REMINDER, forceMaintenance);
	} else if (this._miniCalendar != null) {
		this._scheduleMaintenance(ZmCalViewController.MAINT_MINICAL|ZmCalViewController.MAINT_REMINDER, forceMaintenance);
	} else {
		this._scheduleMaintenance(ZmCalViewController.MAINT_REMINDER, forceMaintenance);
	}
};

ZmCalViewController.prototype._maintErrorHandler =
function(params) {
	// TODO: resched work?
};

ZmCalViewController.prototype._maintGetApptCallback =
function(work, view, list, skipMiniCalUpdate, query) {
	if (list instanceof ZmCsfeException) {
		this.searchInProgress = false;
		this._handleError(list, new AjxCallback(this, this._maintErrorHandler));
		return;
	}
	DBG.println(AjxDebug.DBG2, "ZmCalViewController: _maintGetApptCallback: " + work);
	this._userQuery = query;

	if (work & ZmCalViewController.MAINT_VIEW) {
		this._list = new ZmApptList();
		this._list.getVector().addList(list);
		var sel = view.getSelection();
		view.set(list);

		// For bug 27221, reset toolbar after refresh
		if (sel && sel.length > 0) {
			var id = sel[0].id;
			for (var i = 0; i < this._list.size(); i++) {
				if (this._list.getArray()[i].id == id) {
					view.setSelection(this._list.getArray[i],true);
					break;
				}
			}
		}
		this._resetToolbarOperations();
	}

	if (work & ZmCalViewController.MAINT_REMINDER) {
		this._app.getReminderController().refresh();
	}

	this.searchInProgress = false;

	// initiate schedule action for pending work (process queued actions)
	if (this._pendingWork != ZmCalViewController.MAINT_NONE) {
		var newWork = this._pendingWork;
		this._pendingWork = ZmCalViewController.MAINT_NONE;
		this._scheduleMaintenance(newWork);
	}
};


ZmCalViewController.prototype.refreshCurrentView =
 function() {
    var currentView = this.getCurrentView();
    if (currentView) {
        currentView.setNeedsRefresh(true);
        this._scheduleMaintenance(ZmCalViewController.MAINT_VIEW);
    }
}


ZmCalViewController.prototype._scheduleMaintenance =
function(work, forceMaintenance) {

	DBG.println(AjxDebug.DBG1, "ZmCalViewController._scheduleMaintenance, work = " + work + ", forceMaintenance = " + forceMaintenance);
	DBG.println(AjxDebug.DBG1, "ZmCalViewController._scheduleMaintenance, searchInProgress = " + this.searchInProgress + ", pendingWork = " + this._pendingWork);
	this.onErrorRecovery = new AjxCallback(this, this._errorRecovery, [work, forceMaintenance]);

	// schedule timed action
	if ((!this.searchInProgress || forceMaintenance) &&
		(this._pendingWork == ZmCalViewController.MAINT_NONE))
	{
		this._pendingWork |= work;
		AjxTimedAction.scheduleAction(this._maintTimedAction, 0);
	}
	else
	{
		this._pendingWork |= work;
	}
};

ZmCalViewController.prototype.resetSearchFlags =
function() {
    this.searchInProgress = false;
    this._pendingWork = ZmCalViewController.MAINT_NONE;
};

ZmCalViewController.prototype._errorRecovery =
function(work, forceMaintenance) {
	var maintainMiniCal = (work & ZmCalViewController.MAINT_MINICAL);
	var maintainView = (work & ZmCalViewController.MAINT_VIEW);
	var maintainRemainder = (work & ZmCalViewController.MAINT_REMINDER);
	if (maintainMiniCal || maintainView || maintainRemainder) {
		this.getCurrentView().setNeedsRefresh(true);
	}
	this._scheduleMaintenance(work, forceMaintenance);
};

ZmCalViewController.prototype._maintenanceAction =
function() {
	DBG.println(AjxDebug.DBG1, "ZmCalViewController._maintenanceAction, work = " + this._pendingWork);
 	var work = this._pendingWork;
	this.searchInProgress = true;
	this._pendingWork = ZmCalViewController.MAINT_NONE;

	var maintainMiniCal = (work & ZmCalViewController.MAINT_MINICAL);
	var maintainView = (work & ZmCalViewController.MAINT_VIEW);
	var maintainRemainder = (work & ZmCalViewController.MAINT_REMINDER);
	
	if (work == ZmCalViewController.MAINT_REMINDER) {
		this._app.getReminderController().refresh();
		this.searchInProgress = false;
	}
	else if (maintainMiniCal || maintainView || maintainRemainder) {
        // NOTE: It's important that we go straight to the view!
		var view = this._viewMgr ? this._viewMgr.getView(this._currentViewId) : null;
		var needsRefresh =  view && view.needsRefresh();
		DBG.println(AjxDebug.DBG1, "ZmCalViewController._maintenanceAction, view = " + this._currentViewId + ", needsRefresh = " + needsRefresh);
		if (needsRefresh) {
            var rt = view.getTimeRange();
			var params = {
				start: rt.start,
				end: rt.end,
				fanoutAllDay: view._fanoutAllDay(),
				callback: (new AjxCallback(this, this._maintGetApptCallback, [work, view])),
				accountFolderIds: ([].concat(this._checkedAccountCalendarIds)), // pass in a copy, not a reference
				query: this._userQuery
			};

			var reminderParams;
			if (maintainRemainder) {
				reminderParams = this._app.getReminderController().getRefreshParams();
				reminderParams.callback = null;
			}

			DBG.println(AjxDebug.DBG1, "ZmCalViewController._maintenanceAction, do apptCache.batchRequest");
			this.apptCache.batchRequest(params, this.getMiniCalendarParams(), reminderParams);
			view.setNeedsRefresh(false);
		} else {
			this.searchInProgress = false;
		}
	}
};

ZmCalViewController.prototype.getKeyMapName =
function() {
	return ZmKeyMap.MAP_CALENDAR;
};

ZmCalViewController.prototype.handleKeyAction =
function(actionCode) {
	DBG.println(AjxDebug.DBG3, "ZmCalViewController.handleKeyAction");
	var isWebClientOffline = appCtxt.isWebClientOffline();

	switch (actionCode) {

		case ZmKeyMap.CAL_DAY_VIEW:
		case ZmKeyMap.CAL_WEEK_VIEW:
		case ZmKeyMap.CAL_WORK_WEEK_VIEW:
		case ZmKeyMap.CAL_MONTH_VIEW:
			this.show(ZmCalViewController.ACTION_CODE_TO_VIEW[actionCode]);
			break;

		case ZmKeyMap.CAL_LIST_VIEW:
			if (!isWebClientOffline) {
				this.show(ZmCalViewController.ACTION_CODE_TO_VIEW[actionCode]);
			}
			break;

        case ZmKeyMap.CAL_FB_VIEW:
            if(appCtxt.get(ZmSetting.FREE_BUSY_VIEW_ENABLED) && !isWebClientOffline) {
                this.show(ZmCalViewController.ACTION_CODE_TO_VIEW[actionCode]);
            }
			break;

		case ZmKeyMap.TODAY:
			this._todayButtonListener();
			break;

		case ZmKeyMap.REFRESH:
			this._refreshButtonListener();
			break;

		case ZmKeyMap.QUICK_ADD:
			if (appCtxt.get(ZmSetting.CAL_USE_QUICK_ADD) && !isWebClientOffline) {
				var date = this._viewMgr ? this._viewMgr.getDate() : new Date();
				this.newAppointmentHelper(date, ZmCalViewController.DEFAULT_APPOINTMENT_DURATION);
			}
			break;

		case ZmKeyMap.EDIT:
			if (!isWebClientOffline) {
				var appt = this.getSelection()[0];
				if (appt) {
					var ev = new DwtSelectionEvent();
					ev.detail = DwtListView.ITEM_DBL_CLICKED;
					ev.item = appt;
					this._listSelectionListener(ev);
				}
			}
			break;

		case ZmKeyMap.CANCEL:
            var currentView = this._viewMgr.getCurrentView();
            if ((this._currentViewType == ZmId.VIEW_CAL_WORK_WEEK) ||
                (this._currentViewType == ZmId.VIEW_CAL_WEEK) ||
                (this._currentViewType == ZmId.VIEW_CAL_MONTH)) {
                // Abort - restore location and Mouse up
                var data = DwtMouseEventCapture.getTargetObj();
                if (data) {
                    currentView._restoreApptLoc(data);
                    currentView._cancelNewApptDrag(data);
                    data.startDate = data.appt ? data.appt._orig.startDate : null;
                    ZmCalBaseView._apptMouseUpHdlr(null);
                }
            }
			break;

		default:
			return ZmListController.prototype.handleKeyAction.call(this, actionCode);
	}
	return true;
};

ZmCalViewController.prototype._getDefaultFocusItem =
function() {
	return this._toolbar[ZmId.VIEW_CAL];
};

/**
 * Returns a reference to the singleton message controller, used to send mail (in our case,
 * invites and their replies). If mail is disabled, we create our own ZmMsgController so that
 * we don't load the mail package.
 * 
 * @private
 */
ZmCalViewController.prototype._getMsgController =
function() {
	if (!this._msgController) {
		if (appCtxt.get(ZmSetting.MAIL_ENABLED)) {
			this._msgController = AjxDispatcher.run("GetMsgController");
		} else {
			AjxDispatcher.require("Mail");
			this._msgController = new ZmMsgController(this._container, this._app);
		}
	}
	return this._msgController;
};

ZmCalViewController.prototype.getMiniCalendarParams =
function() {
	var dr = this.getMiniCalendar().getDateRange();
	return {
		start: dr.start.getTime(),
		end: dr.end.getTime(),
		fanoutAllDay: true,
		noBusyOverlay: true,
		folderIds: this.getCheckedCalendarFolderIds(),
		tz: AjxTimezone.DEFAULT
	};
};

ZmCalViewController.prototype.getMiniCalCache =
function() {
	if (!this._miniCalCache) {
		this._miniCalCache = new ZmMiniCalCache(this);
	}
	return this._miniCalCache;
};

/**
 * Gets the calendar name.
 * 
 * @param	{String}	folderId		the folder id
 * @return	{String}	the name
 */
ZmCalViewController.prototype.getCalendarName =
function(folderId) {
	var cal = appCtxt.getById(folderId);
	return cal && cal.getName();
};

ZmCalViewController.prototype._checkItemCount =
function() {
	// No-op since this view doesn't do virtual paging.
};


ZmCalViewController.prototype._showOrigListener =
function(ev) {
	var actionMenu = this.getActionMenu();
	var appt = actionMenu && actionMenu.__appt;
	if (appt) {
		setTimeout(this._showApptSource.bind(this, appt), 100); // Other listeners are focusing the main window, so delay the window opening for just a bit
	}
};

ZmCalViewController.prototype._showApptSource =
function(appt) {
    var apptFetchUrl = appCtxt.get(ZmSetting.CSFE_MSG_FETCHER_URI)
                    + "&id=" + AjxStringUtil.urlComponentEncode(appt.id || appt.invId)
                    +"&mime=text/plain&noAttach=1&icalAttach=none";
    // create a new window w/ generated msg based on msg id
    window.open(apptFetchUrl, "_blank", "menubar=yes,resizable=yes,scrollbars=yes");
};

ZmCalViewController.prototype.getAppointmentByInvite =
function(invite, callback) {

	var apptId = invite.getAppointmentId();
	if(apptId) {
		var jsonObj = {GetAppointmentRequest:{_jsns:"urn:zimbraMail"}};
		var request = jsonObj.GetAppointmentRequest;
		request.id = apptId;
		request.includeContent = "1";

		var accountName = (appCtxt.multiAccounts ? appCtxt.accountList.mainAccount.name : null);

		appCtxt.getAppController().sendRequest({
			jsonObj: jsonObj,
			asyncMode: true,
			callback: (new AjxCallback(this, this._getApptItemInfoHandler, [invite, callback])),
			errorCallback: (new AjxCallback(this, this._getApptItemInfoErrorHandler, [invite, callback])),
			accountName: accountName
		});
	}
};

ZmCalViewController.prototype._getApptItemInfoHandler =
function(invite, callback, result) {
	var resp = result.getResponse();
	resp = resp.GetAppointmentResponse;

	var apptList = new ZmApptList();
	var apptNode = resp.appt[0];
	var appt = ZmAppt.createFromDom(apptNode, {list: apptList}, null);

	var invites = apptNode.inv;
	appt.setInvIdFromProposedInvite(invites, invite);

	if(callback) {
		callback.run(appt);
	}
};

ZmCalViewController.prototype._getApptItemInfoErrorHandler =
function(invite, callback, result) {
	var msgDialog = appCtxt.getMsgDialog();
	msgDialog.reset();
	msgDialog.setMessage(ZmMsg.unableToAcceptTime, DwtMessageDialog.INFO_STYLE);
	msgDialog.popup();
	return true;
};

ZmCalViewController.prototype.acceptProposedTime =
function(apptId, invite, proposeTimeCallback) {

	this._proposedTimeCallback = proposeTimeCallback;

	if(apptId) {
		var callback = new AjxCallback(this, this._acceptProposedTimeContinue, [invite]);
		this.getAppointmentByInvite(invite, callback);
	}else {
		var msgDialog = appCtxt.getMsgDialog();
		msgDialog.reset();
		msgDialog.setMessage(ZmMsg.unableToAcceptTime, DwtMessageDialog.INFO_STYLE);
		msgDialog.popup();
	}
};

ZmCalViewController.prototype._acceptProposedTimeContinue =
function(invite, appt) {
	var mode = appt.isRecurring() ? (appt.isException ? ZmCalItem.MODE_EDIT_SINGLE_INSTANCE : ZmCalItem.MODE_EDIT_SERIES) : ZmCalItem.MODE_EDIT;
	appt.setProposedInvite(invite);
	appt.setProposedTimeCallback(this._proposedTimeCallback);
	this.editAppointment(appt, mode);
};

ZmCalViewController.prototype.proposeNewTime =
function(msg) {
	var newAppt = this.newApptObject(new Date(), null, null, msg),
        mode = ZmCalItem.MODE_EDIT,
        apptId = msg.invite.getAppointmentId();
	newAppt.setProposeTimeMode(true);
	newAppt.setFromMailMessageInvite(msg);
    if (apptId) {
		var msgId = msg.id;
		var inx = msg.id.indexOf(":");
		var accountId = null;
		if (inx !== -1) {
			accountId = msgId.substr(0, inx);
			msgId = msgId.substr(inx + 1);
		}
		var invId = [apptId, msgId].join("-");
		if (accountId) {
			invId = [accountId, invId].join(":");
		}
		newAppt.invId = invId;
        newAppt.getDetails(mode, new AjxCallback(this, this.proposeNewTimeContinue, [newAppt, mode]));
    }
    else {
        newAppt.setViewMode(mode);
        AjxDispatcher.run("GetApptComposeController").proposeNewTime(newAppt);
    }
};

ZmCalViewController.prototype.proposeNewTimeContinue =
function(newAppt, mode) {
    newAppt.setViewMode(mode);
	AjxDispatcher.run("GetApptComposeController").proposeNewTime(newAppt);
};

ZmCalViewController.prototype.forwardInvite =
function(msg) {
	var invite = msg.invite;
	var apptId = invite.getAppointmentId();

	if(apptId && invite.isOrganizer()) {
		var callback = new AjxCallback(this, this.forwardInviteContinue, [invite, msg]);
		this.getAppointmentByInvite(invite, callback);
	}else {
		var newAppt = this.newApptObject(new Date(), null, null, msg);
		newAppt.setForwardMode(true);
		newAppt.setFromMailMessageInvite(msg);
		AjxDispatcher.run("GetApptComposeController").forwardInvite(newAppt);
	}
};

ZmCalViewController.prototype.forwardInviteContinue =
function(invite, msg, appt) {
	appt.setForwardMode(true);
	appt.setFromMailMessageInvite(msg);
	var mode = appt.isRecurring() ? (appt.isException ? ZmCalItem.MODE_EDIT_SINGLE_INSTANCE : ZmCalItem.MODE_EDIT_SERIES) : ZmCalItem.MODE_EDIT;
	var clone = ZmAppt.quickClone(appt);
	clone.getDetails(mode, new AjxCallback(this, this._forwardInviteCompose, [clone]));
};

ZmCalViewController.prototype._forwardInviteCompose =
function (appt) {
	AjxDispatcher.run("GetApptComposeController").forwardInvite(appt);
};

ZmCalViewController.prototype.getFreeBusyInfo =
function(startTime, endTime, emailList, callback, errorCallback, noBusyOverlay) {
	var soapDoc = AjxSoapDoc.create("GetFreeBusyRequest", "urn:zimbraMail");
	soapDoc.setMethodAttribute("s", startTime);
	soapDoc.setMethodAttribute("e", endTime);
	soapDoc.setMethodAttribute("uid", emailList);

	var acct = (appCtxt.multiAccounts)
		? this._composeView.getApptEditView().getCalendarAccount() : null;

	return appCtxt.getAppController().sendRequest({
		soapDoc: soapDoc,
		asyncMode: true,
		callback: callback,
		errorCallback: errorCallback,
		noBusyOverlay: noBusyOverlay,
		accountName: (acct ? acct.name : null)
	});
};

ZmCalViewController.prototype.getWorkingInfo =
function(startTime, endTime, emailList, callback, errorCallback, noBusyOverlay) {
   var soapDoc = AjxSoapDoc.create("GetWorkingHoursRequest", "urn:zimbraMail");
   soapDoc.setMethodAttribute("s", startTime);
   soapDoc.setMethodAttribute("e", endTime);
   soapDoc.setMethodAttribute("name", emailList);

   var acct = (appCtxt.multiAccounts)
       ? this._composeView.getApptEditView().getCalendarAccount() : null;

   return appCtxt.getAppController().sendRequest({
       soapDoc: soapDoc,
       asyncMode: true,
       callback: callback,
       errorCallback: errorCallback,
       noBusyOverlay: noBusyOverlay,
       accountName: (acct ? acct.name : null)
   });
};

/**
 * Sets the current view.
 *
 * @param {ZmListView} view	the view
 */
ZmCalViewController.prototype.setCurrentListView = function(view) {
    if (!view) {
        return;
    }

    if (this._currentListView != view) {
        var hadFocus = this._currentListView && this._currentListView.hasFocus();

        this._currentListView = view;
        this._resetToolbarOperations();

        if (hadFocus) {
            this._currentListView.focus();
        }
    }
};

ZmCalViewController.prototype.getCurrentListView = function() {
    return this._currentListView || this.getCurrentView();
};

/**
 * Creates appointment as configured in the out-of-office preference
 */
ZmCalViewController.prototype.createAppointmentFromOOOPref=
function(startDate, endDate, allDay, respCallback){
       var newAppt = new ZmAppt();
       newAppt.setAllDayEvent(allDay);
	   newAppt.setStartDate(startDate);
	   newAppt.setEndDate(endDate);
       newAppt.name = ZmMsg.outOfOffice;
       newAppt.freeBusy = (appCtxt.get(ZmSetting.VACATION_CALENDAR_TYPE)=="BUSY")?"B":"O";
       newAppt.message = appCtxt.get(ZmSetting.VACATION_MSG);
       newAppt.convertToLocalTimezone();
       newAppt.save(null, respCallback);
};
}

}
if (AjxPackage.define("calendar.Appointment")) {
AjxTemplate.register("calendar.Appointment#ComposeViewColumns", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<colgroup><col width=\"80\"><col><col width=\"90\"><col width=\"130\"><col width=\"100\"></colgroup>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#ComposeViewColumns"
}, false);
AjxTemplate.register("calendar.Appointment", AjxTemplate.getTemplate("calendar.Appointment#ComposeViewColumns"), AjxTemplate.getParams("calendar.Appointment#ComposeViewColumns"));

AjxTemplate.register("calendar.Appointment#ComposeView", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_main'>";
	 var labelStyle = "width:"+(AjxEnv.isIE ? 30 : 32)+"px; overflow:visible; white-space:nowrap"; 
	 var inputStyle = AjxEnv.isSafari && !AjxEnv.isSafariNightly ? "height:52px;" : "height:21px; overflow:hidden" 
	buffer[_i++] = "<div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_top'><table role=\"presentation\" width='100%' class='calendar_edit_view_separator'><tr><td valign='top'><table role=\"presentation\" width=100% style='margin-top:5px;' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_table' class='ZPropertySheet' cellspacing='6'>";
	buffer[_i++] =  AjxTemplate.expand("#ComposeViewColumns") ;
	buffer[_i++] = "<tr id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_invitemsg_container' style='display:none;'><td class='ZmFieldLabelRight'>&nbsp;</td><td colspan='4'><table role=\"presentation\"><tr><td id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_invitemsgicon\" >";
	buffer[_i++] =  AjxImg.getImageHtml("Information") ;
	buffer[_i++] = "</td><td id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_invitemsg\"><!-- Invite message --></td></tr></table></td></tr><tr id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_forward_options' style='display:none;'><td class='ZmFieldLabelRight'><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_picker'>";
	buffer[_i++] = ZmMsg.toLabel;
	buffer[_i++] = "</div></td><td colspan='4' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_to_control'></td></tr>";
	 if (data.isAppt && !appCtxt.multiAccounts) { 
	buffer[_i++] = "<tr id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_identityContainer\"><td class='ZmFieldLabelRight'>";
	buffer[_i++] =  ZmMsg.fromLabel ;
	buffer[_i++] = "</td><td colspan='4' id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_identity\"></td></tr>";
	 } 
	buffer[_i++] = "<tr><td class='ZmFieldLabelRight'>";
	buffer[_i++] =  ZmMsg.subjectLabel ;
	buffer[_i++] = "</td><td colspan='4' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_subject'></td></tr>";
	 if(data.isGroupCalEnabled) { 
	buffer[_i++] = "<tr id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_attendeesContainer\"><td class='ZmFieldLabelRight'><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_req_att_picker'>";
	buffer[_i++] =  ZmMsg.attendeesLabel ;
	buffer[_i++] = "</div></td><td colspan='3' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_person'></td><td><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_show_optional' role='link' class='FakeAnchor' style='white-space:nowrap;'>";
	buffer[_i++] =  ZmMsg.showOptional ;
	buffer[_i++] = "</div></td></tr><tr id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_optionalContainer'><td class='ZmFieldLabelRight'><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_opt_att_picker'>";
	buffer[_i++] =  ZmMsg.optionalLabel ;
	buffer[_i++] = "</div></td><td colspan='3' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_optional'></td></tr><tr><td></td><td colspan='4'><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_attendee_status' class='ZmLocationStatusConflict' style=\"float:left;\" x-display='inline-block'>";
	buffer[_i++] =  AjxImg.getImageHtml("Warning_12", "display:inline-block;padding-right:4px;float:left;") + ZmMsg.attendeeConflict ;
	buffer[_i++] = "</div><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_suggest_time' role='link' class='FakeAnchor ZmSuggestLink' x-display='inline-block'>";
	buffer[_i++] =  ZmMsg.suggestATime ;
	buffer[_i++] = "</div></td></tr>";
	 } 
	buffer[_i++] = "<tr><td class='ZmFieldLabelRight'><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_loc_picker'>";
	buffer[_i++] =  ZmMsg.locationLabel ;
	buffer[_i++] = "</div></td>";
	 if (data.isGalEnabled && data.isGroupCalEnabled) { 
	buffer[_i++] = "<td colspan='3' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_location'></td><td><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_show_resources' role='link' class='FakeAnchor' style='white-space:nowrap;'>";
	buffer[_i++] =  ZmMsg.showEquipment ;
	buffer[_i++] = "</div></td>";
	 }else { 
	buffer[_i++] = "<td colspan='4' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_location'></td>";
	 } 
	buffer[_i++] = "</tr><tr><td></td><td colspan='4'><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_location_status'  class='ZmLocationStatusConflict' x-display='inline-block'></div><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_location_status_action' role='link' class='FakeAnchor ZmSuggestLink' x-display='inline-block'></div><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_suggest_location' role='link' class='FakeAnchor ZmSuggestLink' x-display='inline-block'>";
	buffer[_i++] =  ZmMsg.suggestALocation ;
	buffer[_i++] = "</div></td></tr>";
	 if (data.isGalEnabled && data.isGroupCalEnabled) { 
	buffer[_i++] = "<tr id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_resourcesContainer'><td class='ZmFieldLabelRight'><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_res_btn'>";
	buffer[_i++] =  ZmMsg.equipmentLabel ;
	buffer[_i++] = "</div></td><td colspan='3' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_resourcesData'></td><td>&nbsp;</td></tr>";
	 } 
	buffer[_i++] = "<tr><td style='";
	buffer[_i++] =  AjxEnv.isWebKitBased ? "padding-top:14px;" : "" ;
	buffer[_i++] = "' class='ZmFieldLabelRight'>";
	buffer[_i++] =  (data.isAppt ? ZmMsg.startLabel : (ZmMsg.startDate+":")) ;
	buffer[_i++] = "</td><td rowspan=\"2\" colspan=\"3\" align=\"right\"><table role=\"presentation\" width=\"100%\"><tr><td style='";
	buffer[_i++] =  AjxEnv.isIE ? "overflow:visible;" : "" ;
	buffer[_i++] = "'><table role=\"presentation\" class='ZPropertySheet' cellspacing='6'><tr>";
	buffer[_i++] =  AjxTemplate.expand("#ApptTimeSection_StartDate", data) ;
	buffer[_i++] = "<td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_tzoneSelectStart'></td><td align=\"left\" nowrap=\"true\"><input type='checkbox' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_allDayCheckbox'><label for=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_allDayCheckbox\" style='margin-left:.25em;white-space:nowrap;'>";
	buffer[_i++] =  ZmMsg.allDay ;
	buffer[_i++] = "</label></td></tr></table></td><td colspan=\"2\" rowspan=\"2\" align=\"right\"><table role=\"presentation\" class='ZPropertySheet' cellspacing='6'><tr><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_repeatLabel' class='ZmFieldLabelRight'>";
	buffer[_i++] =  ZmMsg.repeatLabel ;
	buffer[_i++] = "</td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_repeat_options' colspan=\"2\"><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_repeatSelect' class=\"ZmApptComposeField\"></div><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_repeatDesc' class=\"ZmApptComposeField FakeAnchor\"></div></td></tr><tr><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_reminder_options' class='ZmFieldLabelRight'>";
	buffer[_i++] =  ZmMsg.reminderLabel ;
	buffer[_i++] = "</td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_reminderSelectContainer' class='miniTimeButton ZmSelector'><table role=\"presentation\"><tr><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_reminderSelectInput'></td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_reminderSelect'> </td></tr></table></td></tr></table></td></tr><tr><td style='";
	buffer[_i++] =  AjxEnv.isIE ? "overflow:visible;" : "" ;
	buffer[_i++] = "'><table role=\"presentation\" class='ZPropertySheet' cellspacing='6'><tr>";
	buffer[_i++] =  AjxTemplate.expand("#ApptTimeSection_EndDate", data) ;
	buffer[_i++] = "<td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_tzoneSelectEnd'></td></tr></table></td></tr></table></td><td></td></tr><tr><td style='";
	buffer[_i++] =  AjxEnv.isWebKitBased ? "padding-top:6px;" : "" ;
	buffer[_i++] = "' class='ZmFieldLabelRight'>";
	buffer[_i++] =  (data.isAppt ? ZmMsg.endLabel : ZmMsg.dateDueLabel ) ;
	buffer[_i++] = "</td><td><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_reminderConfigure'></div></td></tr><tr><td class='ZmFieldLabelRight'>";
	buffer[_i++] =  data.isAppt ? ZmMsg.displayLabel : ZmMsg.taskFolder ;
	buffer[_i++] = "</td><td><table role=\"presentation\" class='ZPropertySheet' cellspacing='6'><tr><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_showAsSelect' align=\"right\" style='padding-left:0;'></td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_folderSelect'></td><td><input type='checkbox' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_privateCheckbox'><label for=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_privateCheckbox\" style='margin-left:.25em;white-space:nowrap;'>";
	buffer[_i++] =  ZmMsg._private ;
	buffer[_i++] = "</label></td></tr></table></td><td></td><td colspan='2'><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_reminderEmailCheckbox'></div></td></tr>";
	 if (appCtxt.get(ZmSetting.CAL_DEVICE_EMAIL_REMINDERS_ENABLED)) { 
	buffer[_i++] = "<tr><td colspan='2'></td><td></td><td colspan='2'><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_reminderDeviceEmailCheckbox'></div></td></tr>";
	 } 
	buffer[_i++] = "<tr id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_attachment_container' style=\"display:none;\"></tr><tr><td colspan='5' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_scheduler_option' style='padding:7px;'><div style=\"float:left;\" class=\"calendar_edit_field\">";
	buffer[_i++] =  ZmMsg.scheduler ;
	buffer[_i++] = "</div><div style=\"float:left; padding-left:5px;\" id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_scheduleButton\" class=\"FakeAnchor\">";
	buffer[_i++] = 
                        ZmMsg.show ;
	buffer[_i++] = "</div><div id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_scheduleImage\" class=\"ImgSelectPullDownArrow\" style=\"float:left;\"></div></td></tr><tr><td colspan='5' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_scheduler'></td></tr></table></td><td width=\"8\"></td></tr></table></div><!-- appointment notes --><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_notes' style='padding:5px;' class='calendar_edit_notes_separator'></div></div><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_suggestions' class='ZmSuggestView'> </div>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#ComposeView"
}, false);

AjxTemplate.register("calendar.Appointment#SuggestionsView", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_suggest_container' class='ZmSuggestContainer'><div class='ZmSuggestHeader'><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_suggestion_name'\t\t\tclass='ZmSuggestLabel'>&nbsp;</div><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_suggest_options_image'\tclass='ZmSuggestOptionsButton'>";
	buffer[_i++] = AjxImg.getImageHtml("Options");
	buffer[_i++] = "</div><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_suggest_close'\t\t\tclass='ZmSuggestCloseButton'>";
	buffer[_i++] = AjxImg.getImageHtml("CloseGray");
	buffer[_i++] = "</div></div><div class='ZmSuggestBody'><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_suggest_minical'\t\t\tclass='ZmSuggestMiniCal'></div><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_suggest_view'\t\t\tclass='ZmSuggestResults'></div></div></div>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#SuggestionsView"
}, false);

AjxTemplate.register("calendar.Appointment#EditView", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	 var labelStyle = "width:"+(AjxEnv.isIE ? 30 : 32)+"px; overflow:visible; white-space:nowrap"; 
	 var inputStyle = AjxEnv.isSafari && !AjxEnv.isSafariNightly ? "height:52px;" : "height:21px; overflow:hidden" 
	buffer[_i++] = "<div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_top'><table role=\"presentation\" width=100% style='table-layout:fixed;' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_table'><colgroup><col width='";
	buffer[_i++] =  AjxEnv.is800x600orLower ? "235" : "50%" ;
	buffer[_i++] = "' /><col width='";
	buffer[_i++] =  AjxEnv.is800x600orLower ? "*" : "50%" ;
	buffer[_i++] = "' /></colgroup><tr id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_forward_options' style='display:none;'><td colspan=2><!-- appointment forward UI --><table role=\"presentation\" width=100% class='ZPropertySheet' cellspacing='6'><tr><td align=right valign=top width='1%' style='";
	buffer[_i++] = labelStyle;
	buffer[_i++] = "'><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_picker'>";
	buffer[_i++] = ZmMsg.toLabel;
	buffer[_i++] = "</div></td><td colspan=2 id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_to_control'></td></tr></table></td></tr><tr><!-- appointment details section --><td valign=top><fieldset><legend>";
	buffer[_i++] =  ZmMsg.details ;
	buffer[_i++] = "</legend><div><table role=\"presentation\" width=100% class='ZPropertySheet' cellspacing='6'><colgroup><col width='1%' /><col /><col /></colgroup>";
	 if (data.isAppt && !appCtxt.multiAccounts) { 
	buffer[_i++] = "<tr id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_identityContainer\"><td width=\"1%\" class='ZmFieldLabelRight'>";
	buffer[_i++] =  ZmMsg.fromLabel ;
	buffer[_i++] = "</td><td colspan='2' id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_identity\"></td></tr>";
	 } 
	buffer[_i++] = "<tr><td width=\"1%\" class='ZmFieldLabelRight'>*&nbsp;";
	buffer[_i++] =  ZmMsg.subjectLabel ;
	buffer[_i++] = "</td><td colspan=2 id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_subject'></td></tr><tr><td width='1%' class='ZmApptTabViewPageField' style='white-space:nowrap;'>";
	buffer[_i++] =  ZmMsg.locationLabel ;
	buffer[_i++] = "</td><td colspan='2' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_location'></td></tr>";
	 if (data.isAppt) { 
	buffer[_i++] = "<tr><td width=\"100%\" colspan=3><table role=\"presentation\" class='ZPropertySheet' cellspacing='6' width='100%'><tr><td class='ZmFieldLabelRight' style='margin-right:.25em;'>";
	buffer[_i++] =  ZmMsg.showAsLabel ;
	buffer[_i++] = "</td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_showAsSelect'></td><td class='ZmFieldLabelRight' style='margin-right:.25em;' width='100%'>";
	buffer[_i++] =  ZmMsg.markAs ;
	buffer[_i++] = "</td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_privacySelect'></td></tr></table></td></tr>";
	 } else { 
	buffer[_i++] = "<tr><td class='ZmFieldLabelRight'>";
	buffer[_i++] =  ZmMsg.priorityLabel ;
	buffer[_i++] = "</td><td colspan=2 id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_priority'></td></tr>";
	 } 
	buffer[_i++] = "<tr id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_folderRow'><td class='ZmFieldLabelRight'>";
	buffer[_i++] =  data.isAppt ? ZmMsg.calendarLabel : ZmMsg.taskFolder ;
	buffer[_i++] = "</td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_folderSelect'></td></tr><tr>";
	 if(!data.isAppt){ 
	buffer[_i++] = "<td colspan=10>";
	buffer[_i++] =  data.isAppt ? "&nbsp;" : "" ;
	buffer[_i++] = "</td>";
	 } 
	buffer[_i++] = "</tr><tr><td colspan=10></td></tr></table></div></fieldset></td><!-- appointment date/time section --><td valign=top><fieldset><legend id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_timeLegend\">";
	buffer[_i++] =  (data.isAppt ? ZmMsg.time : ZmMsg.progress) ;
	buffer[_i++] = "</legend><div style='overflow:hidden; ";
	buffer[_i++] =  AjxEnv.isIE ? " width:99%" : "" ;
	buffer[_i++] = "'><table role=\"presentation\" width=100% class=\"ZPropertySheet\" cellspacing='6'><colgroup><col width='1%' /><col /><col /></colgroup>";
	buffer[_i++] =  (data.isAppt ? "" : AjxTemplate.expand("calendar.Appointment#TaskDueSection", data)) ;
	buffer[_i++] =  AjxTemplate.expand("calendar.Appointment#ApptTimeSection", data) ;
	 if(!data.isAppt) { 
	buffer[_i++] = "<tr><td class='ZmFieldLabelRight' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_reminderLabel'>";
	buffer[_i++] =  ZmMsg.reminderLabel ;
	buffer[_i++] = "</td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_reminderSelectContainer' width=\"50px\"><table role=\"presentation\"><tr><td class='ZmFieldLabelCenter'><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_reminderCheckbox'></div></td><td class=\"quickAddDateFld\">";
	buffer[_i++] = AjxTemplate.expand("#DateField", {id: data.id + "_remindDateField", value: data.currDate, label: ZmMsg.reminder});
	buffer[_i++] = "</td><td class=\"miniCalendarButton ZmSelector\" id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_remindMiniCalBtn'> </td></tr></table></td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_remindTimeSelect' colspan=2></td></tr><tr><td>&nbsp;</td><td colspan=\"3\"><table role=\"presentation\"><tr><td style=\"padding:0px 0px 0px 8px;\"><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_reminderConfigure'></div></td></tr></table></td></tr><tr><td></td><td colspan=\"3\"><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_reminderEmailCheckbox'></div></td></td></tr>";
	 if (appCtxt.get(ZmSetting.CAL_DEVICE_EMAIL_REMINDERS_ENABLED)) { 
	buffer[_i++] = "<tr><td></td><td colspan=\"3\"><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_reminderDeviceEmailCheckbox'></div></td></td></tr>";
	 } 
	 } 
	 if(data.isAppt) { 
	buffer[_i++] = "<tr id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_repeat_options'><td valign=top class='ZmFieldLabelRight' style='line-height:1.8rem' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_repeatLabel'>";
	buffer[_i++] =  ZmMsg.repeatLabel ;
	buffer[_i++] = "</td><td valign=top colspan=10><table role=\"presentation\" width=100%><tr><td width=100 id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_repeatSelect' style='padding-right:5px;'></td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_repeatDesc' style='text-decoration:underline'></td></tr></table></td></tr><tr id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_reminder_options'><td valign=top class='ZmFieldLabelRight' style='line-height:22px; line-height:1.8rem' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_repeatLabel'>";
	buffer[_i++] =  ZmMsg.reminderLabel ;
	buffer[_i++] = "</td><td valign=top colspan=9 align='left' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_reminderSelectContainer' class='miniTimeButton ZmSelector'><table role=\"presentation\"><tr><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_reminderSelectInput'></td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_reminderSelect'> </td></tr></table></td><td style=\"padding:0px 0px 0px 8px;\"><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_reminderConfigure'></div></td></tr><tr><td><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_reminderEmailCheckbox'></div></td></tr>";
	 if (appCtxt.get(ZmSetting.CAL_DEVICE_EMAIL_REMINDERS_ENABLED)) { 
	buffer[_i++] = "<tr><td><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_reminderDeviceEmailCheckbox'></div></td></tr>";
	 } 
	 } 
	buffer[_i++] = "</table></div></fieldset></td></tr>";
	 if(data.isAppt && data.isGroupCalEnabled) { 
	buffer[_i++] = "<tr><td colspan='2'><!-- appointment attendees / resources --><table role=\"presentation\" width=100% class='ZPropertySheet' cellspacing='6'><tr id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_organizer_options'><td width='1%' align='right' valign='top' class='ZmApptTabViewPageField'><legend>";
	buffer[_i++] =  ZmMsg.organizerLabel ;
	buffer[_i++] = "</legend></td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_organizer'></td></tr><tr><td rowspan='2' width='1%' align='right' valign='top' class='ZmApptTabViewPageField'><legend>";
	buffer[_i++] =  ZmMsg.attendeesLabel ;
	buffer[_i++] = "</legend></td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_person'></td></tr><tr id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_notification_options'><td><table role=\"presentation\"><tr><td><input type='checkbox' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_requestResponses'></td><td class='ZmFieldLabelLeft' style='padding-left:5px;'><label for='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_requestResponses'>";
	buffer[_i++] =  ZmMsg.requestResponses ;
	buffer[_i++] = "</label></td><td><input type='checkbox' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_sendNotificationMail'></td><td class='ZmFieldLabelLeft' style='padding-left:5px;'><label for='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_sendNotificationMail'>";
	buffer[_i++] =  ZmMsg.sendNotificationMail ;
	buffer[_i++] = "<label></td></tr></table></td></tr>";
	 if (data.isGalEnabled) { 
	buffer[_i++] = "<tr><td colspan='2'><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_resourcesContainer' style='display:none'><table role=\"presentation\" width=100%><tr><td valign=top width=1% align=right class='ZmApptTabViewPageField'>";
	buffer[_i++] =  ZmMsg.resourcesLabel ;
	buffer[_i++] = "</td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_resourcesData'></td></tr></table></div></td></tr>";
	 } 
	buffer[_i++] = "</table></td></tr>";
	 } 
	buffer[_i++] = "</table></div><!-- appointment notes --><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_notes' style='padding:5px;'></div>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#EditView"
}, false);

AjxTemplate.register("calendar.Appointment#AttachContainer", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<fieldset class='ZmFieldset'><legend class='ZmLegend'>";
	buffer[_i++] =  ZmMsg.attachments ;
	buffer[_i++] = "</legend><form style='margin:0;padding:0' method='POST' action='";
	buffer[_i++] = data["url"];
	buffer[_i++] = "' id='";
	buffer[_i++] = data["uploadFormId"];
	buffer[_i++] = "' enctype='multipart/form-data'><div id='";
	buffer[_i++] = data["attachDivId"];
	buffer[_i++] = "'></div></form></fieldset>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#AttachContainer"
}, false);

AjxTemplate.register("calendar.Appointment#AttachAdd", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<input type='file' size=40 name='";
	buffer[_i++] = data["uploadFieldName"];
	buffer[_i++] = "' id='";
	buffer[_i++] = data["attachInputId"];
	buffer[_i++] = "' multiple style='margin:0 5px;'><span style='cursor:pointer;color:blue;text-decoration:underline;' id='";
	buffer[_i++] = data["attachRemoveId"];
	buffer[_i++] = "'>";
	buffer[_i++] =  ZmMsg.remove ;
	buffer[_i++] = "</span><span id='";
	buffer[_i++] = data["sizeId"];
	buffer[_i++] = "'>&nbsp;</span>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#AttachAdd"
}, false);

AjxTemplate.register("calendar.Appointment#ZmApptQuickAddDialog", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<table role=\"presentation\" class=\"ZPropertySheet\" cellspacing='6'><tr><td valign=top><table role=\"presentation\" style=\"margin-left:25px; width:330px;\" class=\"ZPropertySheet\" cellspacing='6'><tr><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_subject_label' class='ZmApptTabViewPageField'><sup>*</sup>";
	buffer[_i++] =  ZmMsg.subjectLabel ;
	buffer[_i++] = "</td><td colspan='2' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_subject'></td></tr><tr><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_location_label' class='ZmApptTabViewPageField'>";
	buffer[_i++] =  ZmMsg.locationLabel ;
	buffer[_i++] = "</td><td colspan='2' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_location'></td></tr><tr><td></td><td colspan='2'><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_suggest_location' style=\"height:1.4em;\" role='link' class='FakeAnchor'>";
	buffer[_i++] =  ZmMsg.suggestALocation ;
	buffer[_i++] = "</div></td></tr><tr><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_display_label' class='ZmApptTabViewPageField'>";
	buffer[_i++] =  ZmMsg.displayLabel ;
	buffer[_i++] = "</td><td colspan='2'><table role=\"presentation\" class='ZPropertySheet' cellspacing='6' width='100%'><tr><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_showAs' width='100%'></td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_privacy_label' class='ZmApptTabViewPageField'>";
	buffer[_i++] =  ZmMsg.markAs ;
	buffer[_i++] = "</td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_privacy'></td></tr></table></td></tr><tr id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_folderRow'><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_calendar_label' class='ZmApptTabViewPageField'>";
	buffer[_i++] =  ZmMsg.calendarLabel ;
	buffer[_i++] = "</td><td colspan='2' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_calendar'></td></tr><tr><td colspan='3'></td></tr><tr><td class='ZmApptTabViewPageField'>";
	buffer[_i++] =  ZmMsg.startTimeLabel ;
	buffer[_i++] = "</td><td colspan=2><table role=\"presentation\"><tr><td class=\"quickAddDateFld\">";
	buffer[_i++] = AjxTemplate.expand("#DateField", {id: data.id + "_startDate", label: ZmMsg.startDate});
	buffer[_i++] = "</td><td class=\"miniCalendarButton ZmSelector\" id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_startMiniCal'></td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_startTimeAt'><div style='margin:0 5px;'>";
	buffer[_i++] =  ZmMsg.at ;
	buffer[_i++] = "</div></td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_startTime'></td></tr></table></td></tr><tr><td class='ZmApptTabViewPageField'>";
	buffer[_i++] =  ZmMsg.endTimeLabel ;
	buffer[_i++] = "</td><td colspan='2'><table role=\"presentation\"><tr><td class=\"quickAddDateFld\">";
	buffer[_i++] = AjxTemplate.expand("#DateField", {id: data.id + "_endDate", label: ZmMsg.endDate});
	buffer[_i++] = "</td><td class=\"miniCalendarButton ZmSelector\" id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_endMiniCal'></td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_endTimeAt'><div style='margin:0 5px;'>";
	buffer[_i++] =  ZmMsg.at ;
	buffer[_i++] = "</div></td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_endTime'></td></tr></table></td></tr><tr><td colspan='3'></td></tr><tr><td class='ZmApptTabViewPageField'>";
	buffer[_i++] =  ZmMsg.repeatLabel ;
	buffer[_i++] = "</td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_repeat'></td><td><span class='ZmApptTabViewPageField' style='width:100%' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_repeatDesc'></span></td></tr><tr><td class='ZmApptTabViewPageField'>";
	buffer[_i++] =  ZmMsg.reminderLabel ;
	buffer[_i++] = "</td><td colspan='2'><table role=\"presentation\"><tr><td colspan='2' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_reminderSelect'></td><td><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_reminderEmailCheckbox'></div></td>";
	 if (appCtxt.get(ZmSetting.CAL_DEVICE_EMAIL_REMINDERS_ENABLED)) { 
	buffer[_i++] = "<td><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_reminderDeviceEmailCheckbox'></div></td>";
	 } 
	buffer[_i++] = "</tr></table></td></tr></table></td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_suggestions' class='ZmSuggestView' valign=top><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_suggest_view'></div></td></tr></table>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#ZmApptQuickAddDialog"
}, false);

AjxTemplate.register("calendar.Appointment#TaskDueSection", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<tr><td class='ZmFieldLabelRight' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_statusLabel'>";
	buffer[_i++] =  ZmMsg.statusLabel ;
	buffer[_i++] = "</td><td width=175 id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_status'></td><td><table role=\"presentation\" class='ZmCompletionSelector ZmSelector'><tr><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_pCompleteSelectInput'></td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_pCompleteSelect'></td><tr></table></td></tr><tr><td></td><td colspan='3' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_due_message'></td></tr>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#TaskDueSection"
}, false);

AjxTemplate.register("calendar.Appointment#ApptTimeSection", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	 if (data.isAppt) { 
	buffer[_i++] = "<tr><td></td><td width=1%><table role=\"presentation\"><tr><td><input type='checkbox' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_allDayCheckbox'></td><td class='ZmFieldLabelLeft'><label for='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_allDayCheckbox' style='margin-left:.25em;'>";
	buffer[_i++] =  ZmMsg.allDayEvent ;
	buffer[_i++] = "</label></td></tr></table></td><td></td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_tzoneSelect'></td></tr>";
	 } 
	buffer[_i++] = "<tr><td class='ZmFieldLabelRight'>";
	buffer[_i++] =  (data.isAppt ? ZmMsg.startLabel : (ZmMsg.startDate+":")) ;
	buffer[_i++] = "</td><td ";
	 if (!data.isAppt) { 
	buffer[_i++] = " colspan='3' ";
	 } 
	buffer[_i++] = " ><table role=\"presentation\"><tr><td class='quickAddDateFld'>";
	buffer[_i++] = AjxTemplate.expand("#DateField", {id: data.id + "_startDateField", value: data.currDate, label: ZmMsg.startDate});
	buffer[_i++] = "</td><td class='miniCalendarButton ZmSelector' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_startMiniCalBtn'></td></tr></table></td>";
	 if (data.isAppt) { 
	buffer[_i++] = "<td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_startTimeAtLbl' class='ZmFieldLabelCenter'>";
	buffer[_i++] =  ZmMsg.at ;
	buffer[_i++] = "</td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_startTimeSelect'></td>";
	 } 
	buffer[_i++] = "</tr><tr><td class='ZmFieldLabelRight'>";
	buffer[_i++] =  (data.isAppt ? ZmMsg.endLabel : ZmMsg.dateDueLabel ) ;
	buffer[_i++] = "</td><td ";
	 if (!data.isAppt) { 
	buffer[_i++] = " colspan='3' ";
	 } 
	buffer[_i++] = "><table role=\"presentation\"><tr><td class='quickAddDateFld'>";
	buffer[_i++] = AjxTemplate.expand("#DateField", {id: data.id + "_endDateField", value: data.currDate, label: ZmMsg.endDate});
	buffer[_i++] = "</td><td class='miniCalendarButton ZmSelector' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_endMiniCalBtn'></td></tr></table></td>";
	 if (data.isAppt) { 
	buffer[_i++] = "<td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_endTimeAtLbl' class='ZmFieldLabelCenter'>";
	buffer[_i++] =  ZmMsg.at ;
	buffer[_i++] = "</td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_endTimeSelect'></td>";
	 } 
	buffer[_i++] = "</tr>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#ApptTimeSection"
}, false);

AjxTemplate.register("calendar.Appointment#ApptTimeSection_New", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<tr><td width=\"60\" class='ZmFieldLabelRight'>";
	buffer[_i++] =  (data.isAppt ? ZmMsg.startLabel : (ZmMsg.startDate+":")) ;
	buffer[_i++] = "</td><td><table role=\"presentation\"><tr><td class=\"quickAddDateFld\">";
	buffer[_i++] = AjxTemplate.expand("#DateField", {id: data.id + "_startDateField", value: data.currDate, label: ZmMsg.startDate});
	buffer[_i++] = "</td><td class=\"miniCalendarButton ZmSelector\" id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_startMiniCalBtn'></td></tr></table></td>";
	 if (data.isAppt) { 
	buffer[_i++] = "<td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_startTimeAtLbl' class='ZmFieldLabelCenter'>";
	buffer[_i++] =  ZmMsg.at ;
	buffer[_i++] = "</td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_startTimeSelect'></td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_tzoneSelect'></td>";
	 } 
	buffer[_i++] = "</tr><tr><td width=\"60\" class='ZmFieldLabelRight'>";
	buffer[_i++] =  (data.isAppt ? ZmMsg.endLabel : ZmMsg.dateDueLabel ) ;
	buffer[_i++] = "</td><td><table role=\"presentation\"><tr><td class=\"quickAddDateFld\">";
	buffer[_i++] = AjxTemplate.expand("#DateField", {id: data.id + "_endDateField", value: data.currDate, label: ZmMsg.startDate});
	buffer[_i++] = "</td><td class=\"miniCalendarButton ZmSelector\" id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_endMiniCalBtn'></td></tr></table></td>";
	 if (data.isAppt) { 
	buffer[_i++] = "<td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_endTimeAtLbl' class='ZmFieldLabelCenter'>";
	buffer[_i++] =  ZmMsg.at ;
	buffer[_i++] = "</td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_endTimeSelect'></td><td><table role=\"presentation\"><tr><td><input type='checkbox' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_allDayCheckbox'></td><td class='ZmFieldLabelLeft'><label for='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_allDayCheckbox' style='margin-left:.25em;'> ";
	buffer[_i++] =  ZmMsg.allDayEvent ;
	buffer[_i++] = "</label></td></tr></table></td>";
	 } 
	buffer[_i++] = "</tr>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#ApptTimeSection_New"
}, false);

AjxTemplate.register("calendar.Appointment#ApptTimeSection_EndDate", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<td style='padding-left:0;'><table role=\"presentation\"><tr><td class=\"quickAddDateFld\">";
	buffer[_i++] = AjxTemplate.expand("#DateField", {id: data.id + "_endDateField", value: data.currDate, label: ZmMsg.endDate});
	buffer[_i++] = "</td><td class=\"miniCalendarButton ZmSelector\" id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_endMiniCalBtn'></td></tr></table></td>";
	 if (data.isAppt) { 
	buffer[_i++] = "<td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_endTimeSelect'></td>";
	 } 

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#ApptTimeSection_EndDate"
}, false);

AjxTemplate.register("calendar.Appointment#ApptTimeSection_StartDate", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<td style='padding-left:0;'><table role=\"presentation\"><tr><td class=\"quickAddDateFld\">";
	buffer[_i++] = AjxTemplate.expand("#DateField", {id: data.id + "_startDateField", value: data.currDate, label: ZmMsg.startDate});
	buffer[_i++] = "</td><td class=\"miniCalendarButton ZmSelector\" id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_startMiniCalBtn'></td></tr></table></td>";
	 if (data.isAppt) { 
	buffer[_i++] = "<td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_startTimeSelect'></td>";
	 } 

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#ApptTimeSection_StartDate"
}, false);

AjxTemplate.register("calendar.Appointment#DateField", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<input autocomplete='off' class='ZmDateFieldInput' type='text' size=14 id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "' aria-label='";
	buffer[_i++] = data["label"];
	buffer[_i++] = "' value='";
	buffer[_i++] = data["value"];
	buffer[_i++] = "'>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#DateField"
}, false);

AjxTemplate.register("calendar.Appointment#ScheduleView", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<table role=\"presentation\" width=100% class='ZPropertySheet' cellspacing='6'><tr><td width=100%><!-- date/time section --><table role=\"presentation\">";
	buffer[_i++] =  AjxTemplate.expand("calendar.Appointment#ApptTimeSection", data) ;
	buffer[_i++] = "</table></td><td style='text-align:right'><!-- key/legend section --><table role=\"presentation\" class='ZmGraphKey'><tr><td class='ZmGraphKeyHeader'>";
	buffer[_i++] =  ZmMsg.key ;
	buffer[_i++] = "</td></tr><tr><td class='ZmGraphKeyBody'><table role=\"presentation\"><tr><td><div class='ZmGraphKeyColorBox ZmScheduler-free'></div></td><td class='ZmGraphKeyColorText'>";
	buffer[_i++] =  ZmMsg.free ;
	buffer[_i++] = "</td><td>&nbsp;</td><td><div class='ZmGraphKeyColorBox ZmScheduler-busy'></div></td><td class='ZmGraphKeyColorText'>";
	buffer[_i++] =  ZmMsg.busy ;
	buffer[_i++] = "</td><td>&nbsp;</td><td><div class='ZmGraphKeyColorBox ZmScheduler-tentative'></div></td><td class='ZmGraphKeyColorText'>";
	buffer[_i++] =  ZmMsg.tentative ;
	buffer[_i++] = "</td><td>&nbsp;</td></tr><tr><td><div class='ZmGraphKeyColorBox ZmScheduler-unknown'></div></td><td class='ZmGraphKeyColorText'>";
	buffer[_i++] =  ZmMsg.unknown ;
	buffer[_i++] = "</td><td>&nbsp;</td><td><div class='ZmGraphKeyColorBox ZmScheduler-outOfOffice'></div></td><td class='ZmGraphKeyColorText'>";
	buffer[_i++] =  ZmMsg.outOfOffice ;
	buffer[_i++] = "</td><td>&nbsp;</td></tr></table></td></tr></table></td></tr></table><div style='margin-top:10'><!-- free/busy section --><table role=\"presentation\" style='padding-left:3px;' width=100% id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_attendeesTable'><colgroup><col style='width:165px' /><col style='width:626px' /></colgroup><tr><td align='center' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_navToolbar' ";
	buffer[_i++] =  AjxEnv.isIE ? " width=100%" : "" ;
	buffer[_i++] = "></td><td><table role=\"presentation\" class='ZmSchedulerGridHeaderTable'><tr>";
	
								for (var j = 0; j <= 24; j++) {
									var hour = AjxDateUtil.isLocale24Hour() ? j : ((j % 12) || 12);
							
	buffer[_i++] = "<td><div class='ZmSchedulerGridHeaderCell'>";
	buffer[_i++] =  hour ;
	buffer[_i++] = "</div></td>";
		} 
	buffer[_i++] = "</tr></table></td></tr></table></div>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#ScheduleView"
}, false);

AjxTemplate.register("calendar.Appointment#InlineScheduleView", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<div class='ZmScheduler'><!-- free/busy section --><table role=\"presentation\" width=100% id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_attendeesTable'><colgroup><col style='width:250px' /><col style='width:710px' /></colgroup><tr><td align='center' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_navToolbar'>&nbsp;</td><td valign=bottom><table role=\"presentation\" width=100% class='ZmSchedulerGridHeaderTable' style='";
	buffer[_i++] =  AjxEnv.isIE ? "width:101%" : "" ;
	buffer[_i++] = "'><tr>";
	
								for (var j = 0; j <= 24; j++) {
									var hour = AjxDateUtil.isLocale24Hour() ? j : ((j % 12) || 12);
							
	buffer[_i++] = "<td width=2%><div class='ZmSchedulerGridHeaderCell'>";
	buffer[_i++] =  hour ;
	buffer[_i++] = "</div></td>";
		} 
	buffer[_i++] = "</tr></table></td></tr></table><table role=\"presentation\" class='ZPropertySheet' cellspacing='6'><tr><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_graphKeySpacer'><span id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_showMoreLink' class=\"FakeAnchor\" style='display:none;'>";
	buffer[_i++] =  ZmMsg.showMore ;
	buffer[_i++] = "</span></td><td><div class='ZmGraphKeyColorBox ZmScheduler-working'></div></td><td class='ZmGraphKeyColorText' style='padding-right:1em;'>";
	buffer[_i++] =  ZmMsg.free ;
	buffer[_i++] = "</td><td><div class='ZmGraphKeyColorBox ZmScheduler-free'></div></td><td class='ZmGraphKeyColorText' style='padding-right:1em;'>";
	buffer[_i++] =  ZmMsg.nonWorking ;
	buffer[_i++] = "</td><td><div class='ZmGraphKeyColorBox ZmScheduler-busy'></div></td><td class='ZmGraphKeyColorText' style='padding-right:1em;'>";
	buffer[_i++] =  ZmMsg.busy ;
	buffer[_i++] = "</td><td><div class='ZmGraphKeyColorBox ZmScheduler-tentative'></div></td><td class='ZmGraphKeyColorText' style='padding-right:1em;'>";
	buffer[_i++] =  ZmMsg.tentative ;
	buffer[_i++] = "</td><td><div class='ZmGraphKeyColorBox ZmScheduler-unknown'></div></td><td class='ZmGraphKeyColorText' style='padding-right:1em;'>";
	buffer[_i++] =  ZmMsg.unknown ;
	buffer[_i++] = "</td><td><div class='ZmGraphKeyColorBox ZmScheduler-outOfOffice'></div></td><td class='ZmGraphKeyColorText' style='padding-right:1em;'>";
	buffer[_i++] =  ZmMsg.outOfOffice ;
	buffer[_i++] = "</td></tr></table></div>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#InlineScheduleView"
}, false);

AjxTemplate.register("calendar.Appointment#AttendeeName", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<table role=\"presentation\" width=100%><tr>";
	 if (data.isAllAttendees) { 
	buffer[_i++] = "<td class='ZmSchedulerAllLabel'>";
	buffer[_i++] = ZmMsg.allAttendees;
	buffer[_i++] = "</td>";
	 } else if (data.organizer || !data.isComposeMode) { 
	buffer[_i++] = "<td width=45 align=left class='";
	buffer[_i++] =  data.isComposeMode ? "ZmSchedulerOrgIconTd" : "ZmSchedulerViewAttendeeTd" ;
	buffer[_i++] = "' style='padding-left: 7px;'>";
	buffer[_i++] = AjxImg.getImageHtml("Person");
	buffer[_i++] = "</td>";
	 } else { 
	buffer[_i++] = "<td width=50 id='";
	buffer[_i++] = data["sched"]["dwtSelectId"];
	buffer[_i++] = "'></td>";
	 } 
	 if (!data.isAllAttendees) { 
	buffer[_i++] = "<td ";
	 if (!data.organizer) { 
	buffer[_i++] = "class='ZmSchedulerNameTd'";
	 } else { 
	buffer[_i++] = " class='ZmSchedulerInputDisabledTd' ";
	 } 
	buffer[_i++] = " id='";
	buffer[_i++] = data["sched"]["dwtNameId"];
	buffer[_i++] = "'>";
	 if (data.organizer) { 
	buffer[_i++] = "<div class='ZmSchedulerInputDisabled'>";
	buffer[_i++] = data["organizer"];
	buffer[_i++] = "</div>";
	 } 
	buffer[_i++] = "</td><td width=28 id='";
	buffer[_i++] = data["sched"]["dwtNameId"];
	buffer[_i++] = "_ptst' align='center' class='ZmSchedulerPTSTTd'>&nbsp;</td>";
	 } 
	buffer[_i++] = "</tr></table>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#AttendeeName"
}, false);

AjxTemplate.register("calendar.Appointment#AttendeeFreeBusy", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<table role=\"presentation\" id='";
	buffer[_i++] = data["sched"]["dwtTableId"];
	buffer[_i++] = "' class='ZmSchedulerGridTable";
	buffer[_i++] =  data.isAllAttendees ? "-allAttendees" : "" ;
	buffer[_i++] = "' ";
	buffer[_i++] =  AjxEnv.isIE ? "width=99%" : "width=100%" ;
	buffer[_i++] = "><tr>";
	
				var normalClassName = "ZmSchedulerGridDiv", newClass;
				for (var k = 0; k < data.cellCount; k++) {
					newClass = normalClassName;
					if(k == data.dateBorder.start) {
						newClass = normalClassName + "-start";
					}else if(k == data.dateBorder.end) {
						newClass = normalClassName + "-end";
					}else if (k % 2 == 0) {
						newClass = normalClassName + "-halfHour";
					}
					if ((k==0) && (data.dateBorder.start == -1)) {
						newClass += " " + normalClassName + "-leftStart";
					}
				
	buffer[_i++] = "<td class='ZmScheduler-free' width=2%><div id='";
	buffer[_i++] = data["sched"]["dwtTableId"];
	buffer[_i++] = "_";
	buffer[_i++] =  k ;
	buffer[_i++] = "' class='";
	buffer[_i++] =  newClass ;
	buffer[_i++] = "'></div></td>";
	 } 
	buffer[_i++] = "</tr></table>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#AttendeeFreeBusy"
}, false);

AjxTemplate.register("calendar.Appointment#Tooltip", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<table role=\"presentation\" style='width:";
	buffer[_i++] =  data.width ;
	buffer[_i++] = "px'><tr valign='center'><td colspan='2' align='left'><div style='border-bottom:1px solid black;'><table role=\"presentation\" style='width:100%;'><tr><td>";
	 if (data.cal && data.cal.link) { 
	buffer[_i++] =  AjxImg.getImageHtml("GroupSchedule") ;
	 } else { 
	buffer[_i++] =  AjxImg.getImageHtml("Appointment") ;
	 } 
	buffer[_i++] = "</td><td style='font-weight:bold;white-space:nowrap'>";
	buffer[_i++] =  AjxStringUtil.htmlEncode(data.appt.getName()) ;
	buffer[_i++] = "</td>";
	 if (data.appt.isException) { 
	buffer[_i++] = "<td>";
	buffer[_i++] =  AjxImg.getImageHtml("ApptExceptionIndicator") ;
	buffer[_i++] = "</td>";
	 } else if (data.appt.isRecurring()) { 
	buffer[_i++] = "<td>";
	buffer[_i++] =  AjxImg.getImageHtml("ApptRecurIndicator") ;
	buffer[_i++] = "</td>";
	 } 
	buffer[_i++] = "<td style='width:100%'></td>";
	 if (data.appt.otherAttendees) { 
	buffer[_i++] = "<td style='text-align:right;'>";
	buffer[_i++] =  AjxImg.getImageHtml("ApptMeetingIndicator") ;
	buffer[_i++] = "</td>";
	 } 
	buffer[_i++] = "</tr></table></div></td></tr>";
	 if (data.cal && data.cal.getName()) { 
	buffer[_i++] = "<tr valign='top'><td align='right' style='padding-right:5px;'><b><div style='white-space:nowrap'>";
	buffer[_i++] =  AjxStringUtil.htmlEncode(ZmMsg.calendarLabel) ;
	buffer[_i++] = "</div></b></td><td align='left'><div style='white-space:nowrap'>";
	buffer[_i++] =  AjxStringUtil.htmlEncode(data.cal.getName()) ;
	buffer[_i++] = "</div></td></tr>";
	 } 
	 if (data.organizer) { 
	buffer[_i++] = "<tr valign='top'><td align='right' style='padding-right:5px;'><b><div style='white-space:nowrap'>";
	buffer[_i++] =  AjxStringUtil.htmlEncode(ZmMsg.organizerLabel) ;
	buffer[_i++] = "</div></b></td><td align='left'><div style='white-space:nowrap;'>";
	buffer[_i++] =  AjxStringUtil.htmlEncode(data.organizer) ;
	buffer[_i++] = "</div></td></tr>";
	 } 
	 if (data.sentBy) { 
	buffer[_i++] = "<tr valign='top'><td align='right' style='padding-right:5px;'><b><div style='white-space:nowrap'>";
	buffer[_i++] =  AjxStringUtil.htmlEncode(ZmMsg.sentBy) ;
	buffer[_i++] = "</div></b></td><td align='left'><div style='white-space:nowrap;'>";
	buffer[_i++] =  AjxStringUtil.htmlEncode(data.sentBy) ;
	buffer[_i++] = "</div></td></tr>";
	 } 
	 if (!data.appt.isDraft && data.appt.otherAttendees) { 
	buffer[_i++] = "<tr valign='top'><td align='right' style='padding-right:5px;'><b><div style='white-space:nowrap'>";
	buffer[_i++] =  AjxStringUtil.htmlEncode(ZmMsg.myStatusLabel) ;
	buffer[_i++] = "</div></b></td><td align='left'><div style='white-space:nowrap;'>";
	buffer[_i++] =  AjxStringUtil.htmlEncode(data.appt.getParticipantStatusStr()) ;
	buffer[_i++] = "</div></td></tr>";
	 } 
	 if (data.when && data.when != "") { 
	buffer[_i++] = "<tr valign='top'><td align='right' style='padding-right:5px;'><b><div style='white-space:nowrap'>";
	buffer[_i++] =  AjxStringUtil.htmlEncode(ZmMsg.whenLabel) ;
	buffer[_i++] = "</div></b></td><td align='left'><div style='white-space:nowrap;'>";
	buffer[_i++] =  AjxStringUtil.htmlEncode(data.when) ;
	buffer[_i++] = "</div></td></tr>";
	 } 
	 if (data.location && data.location != "") { 
	buffer[_i++] = "<tr valign='top'><td align='right' style='padding-right:5px;'><b><div style='white-space:nowrap'>";
	buffer[_i++] =  AjxStringUtil.htmlEncode(ZmMsg.locationLabel) ;
	buffer[_i++] = "</div></b></td><td align='left'><div style='white-space:nowrap;'>";
	buffer[_i++] =  AjxStringUtil.htmlEncode(data.location) ;
	buffer[_i++] = "</div></td></tr>";
	 } 
	buffer[_i++] = "<tr valign='top'><td align='right' style='padding-right:5px;'><div style='font-weight:bold;white-space:nowrap'>";
	buffer[_i++] =  AjxStringUtil.htmlEncode(ZmMsg.displayLabel) ;
	buffer[_i++] = "</div></td><td align='left' nowrap><span style=\"float:left\">";
	buffer[_i++] =  AjxImg.getImageHtml("showAs" + data.appt.freeBusy) ;
	buffer[_i++] = "</span><span style=\"float:left\">&nbsp;";
	buffer[_i++] =  AjxStringUtil.htmlEncode(ZmApptViewHelper.getShowAsOptionLabel(data.appt.freeBusy)) ;
	buffer[_i++] = "</span></td></tr>";
	 if (data.appt.fragment && data.appt.fragment != "") { 
	buffer[_i++] = "<tr valign='top'><td align='right' style='padding-right:5px;'><b><div style='white-space:nowrap'>";
	buffer[_i++] =  AjxStringUtil.htmlEncode(ZmMsg.notesLabel) ;
	buffer[_i++] = "</div></b></td><td align='left'>";
	buffer[_i++] =  AjxStringUtil.htmlEncode(data.appt.fragment) ;
	buffer[_i++] = "</td></tr>";
	 } 
	 if (!data.appt.isDraft && data.appt.isOrganizer() && data.appt.otherAttendees && !data.hideAttendees) { 
	buffer[_i++] = "<tr valign='center'><td colspan='2'><div class='calendar_tooltip_attendees'>";
	buffer[_i++] =  AjxStringUtil.htmlEncode(ZmMsg.attendees) ;
	buffer[_i++] = "</div></td></tr>";
	
				if (data.attendeesText) {
			
	buffer[_i++] = "<tr valign='top'><td colspan='2' align='left' style='padding-right:5px;'>";
	buffer[_i++] =  AjxStringUtil.htmlEncode(data.attendeesText) ;
	buffer[_i++] = "</td></tr>";
	
				} else {
					var ptstStatus = data.ptstStatus;
					for (var i in ptstStatus) {
						if (!ptstStatus[i].attendees) { continue; }
			
	buffer[_i++] = "<tr valign='top'><td align='right' style='padding-right:5px;' nowrap><b>";
	buffer[_i++] =  AjxMessageFormat.format(ZmMsg.makeLabel, AjxStringUtil.htmlEncode(i) + "&nbsp;(&nbsp;" + ptstStatus[i].count + "&nbsp;)&nbsp;") ;
	buffer[_i++] = "</b></td><td nowrap>";
	buffer[_i++] =  AjxStringUtil.htmlEncode(ptstStatus[i].attendees) ;
	buffer[_i++] = "</td></tr>";
	
					}
				}
		}
		
	 if (appCtxt.accountList.size() > 1) { 
	buffer[_i++] = "<tr valign='top'><td align='right' style='padding-right:5px;'><b><div style='white-space:nowrap'>";
	buffer[_i++] =  AjxStringUtil.htmlEncode(ZmMsg.accountLabel) ;
	buffer[_i++] = "</div></b></td><td align='left'>";
	buffer[_i++] =  AjxStringUtil.htmlEncode(data.appt.getFolder().account.getDisplayName()) ;
	buffer[_i++] = "</td></tr>";
	 } 
	buffer[_i++] = "</table>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#Tooltip"
}, false);

AjxTemplate.register("calendar.Appointment#ReadOnlyView", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<div class='ApptHeaderDiv'>";
	 if (!data.isTask){ 
	buffer[_i++] = "<div class='InvResponseBar'><table role=\"presentation\" class='ZPropertySheet' cellspacing='6'><tr><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_responseActionSelectCell' width='1%'></td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_responseActionMsgCell'></td></tr></table></div>";
	 } 
	buffer[_i++] = "<div class='MsgHeader'><table role=\"presentation\" id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_hdrTable' class='ZPropertySheet' cellspacing='6'><tr><td class='SubjectCol' colspan='2'>";
	buffer[_i++] =  data.subject ;
	buffer[_i++] = "</td></tr>";
	 if (data.location) { 
	buffer[_i++] =  AjxTemplate.expand("calendar.Appointment#AddEntry", {lbl:ZmMsg.location, val:data.location}) ;
	 } 
	 if (data.equipment) { 
	buffer[_i++] =  AjxTemplate.expand("calendar.Appointment#AddEntry", {lbl:ZmMsg.resources, val:data.equipment}) ;
	 } 
	 if (data.dateStr) { 
	buffer[_i++] =  AjxTemplate.expand("calendar.Appointment#AddEntry", {lbl:ZmMsg.date, val:data.dateStr}) ;
	 } 
	 if (data.startDate) { 
	buffer[_i++] =  AjxTemplate.expand("calendar.Appointment#AddEntry", {lbl:ZmMsg.startDate, val:data.startDate}) ;
	 } 
	 if (data.dueDate) { 
	buffer[_i++] =  AjxTemplate.expand("calendar.Appointment#AddEntry", {lbl:ZmMsg.dueDate, val:data.dueDate}) ;
	 } 
	 if (data.priority) { 
	buffer[_i++] =  AjxTemplate.expand("calendar.Appointment#AddEntry", {lbl:ZmMsg.priority, val:data.priority}) ;
	 } 
	 if (data.status) { 
	buffer[_i++] =  AjxTemplate.expand("calendar.Appointment#AddEntry", {lbl:ZmMsg.status, val:data.status}) ;
	 } 
	 if (data.pComplete) { 
	buffer[_i++] =  AjxTemplate.expand("calendar.Appointment#AddEntry", {lbl:ZmMsg.percentComplete, val:data.pComplete}) ;
	 } 
	buffer[_i++] = "<!-- exception warning -->";
	 if (data.isException) { 
	buffer[_i++] = "<tr valign='center'><td colspan='2'><table role=\"presentation\" class='ZPropertySheet' cellspacing='6'><tr><td>";
	buffer[_i++] =  AjxImg.getImageHtml("ApptException") ;
	buffer[_i++] = "</td><td><strong>";
	buffer[_i++] =  ZmMsg.apptExceptionNote;
	buffer[_i++] = "</strong></td></tr></table></td></tr>";
	 } 
	 if (data.isAttendees && data.org) { 
	buffer[_i++] =  AjxTemplate.expand("calendar.Appointment#AddEntry", {lbl:ZmMsg.organizer, val:data.org}) ;
	 } 
	 if (data.isAttendees && data.obo) { 
	buffer[_i++] =  AjxTemplate.expand("calendar.Appointment#AddEntry", {lbl:ZmMsg.onBehalfOf, val:data.obo}) ;
	 } 
	 if (data.reqAttendees) { 
	buffer[_i++] =  AjxTemplate.expand("calendar.Appointment#AddEntry", {lbl:ZmMsg.attendees, val:data.reqAttendees}) ;
	 } 
	 if (data.optAttendees) { 
	buffer[_i++] =  AjxTemplate.expand("calendar.Appointment#AddEntry", {lbl:ZmMsg.optionalAttendees, val:data.optAttendees}) ;
	 } 
	 if (data.recurStr) { 
	buffer[_i++] =  AjxTemplate.expand("calendar.Appointment#AddEntry", {lbl:ZmMsg.repeats, val:data.recurStr}) ;
	 } 
	 if (data.attachStr) { 
	buffer[_i++] =  AjxTemplate.expand("calendar.Appointment#AddEntry", {lbl:ZmMsg.attachments, val:data.attachStr}) ;
	 } 
	buffer[_i++] = "</table></div></div><div id='";
	buffer[_i++] = data["_infoBarId"];
	buffer[_i++] = "'></div>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#ReadOnlyView"
}, false);

AjxTemplate.register("calendar.Appointment#AddEntry", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<tr><td class='LabelColName' width='1%'>";
	buffer[_i++] =  AjxMessageFormat.format(ZmMsg.makeLabel, AjxStringUtil.htmlEncode(data.lbl)) ;
	buffer[_i++] = " </td><td class='LabelColValue'>";
	buffer[_i++] =  data.val ;
	buffer[_i++] = "</td></tr>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#AddEntry"
}, false);

AjxTemplate.register("calendar.Appointment#ApptDetailsDialog", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<table role=\"presentation\" class='ZPropertySheet' cellspacing='6'><tr valign='center'><td class='LabelColName'>";
	buffer[_i++] =  ZmMsg.icsLabel ;
	buffer[_i++] = "</td><td class='LabelColValue'><a href=\"";
	buffer[_i++] =  data.icsUrl ;
	buffer[_i++] = "\" target=\"_blank\">";
	buffer[_i++] =  data.icsUrl ;
	buffer[_i++] = "</a></td></tr></table>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#ApptDetailsDialog"
}, false);

AjxTemplate.register("calendar.Appointment#ApptTimeInput", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<table role=\"presentation\" class='miniTimeButton ZmSelector'><tr><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_timeSelectInput'></td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_timeSelectBtn'> </td></tr></table>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#ApptTimeInput"
}, false);

AjxTemplate.register("calendar.Appointment#TimeSuggestion", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<table role=\"presentation\" id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "' width=\"100%\" class=\"Row ZPropertySheet\" cellspacing=\"6\"><tr><td width=\"16\" >";
	buffer[_i++] =  AjxImg.getImageHtml(data.attendeeImage) ;
	buffer[_i++] = "</td><td>";
	buffer[_i++] =  data.timeLabel ;
	buffer[_i++] = "</td>";
	 if (data.totalLocations > 0) { 
	buffer[_i++] = "<td align=\"right\" width=\"20\" id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_loc'><span class=\"FakeAnchor\">";
	buffer[_i++] =  data.locationCountStr
			;
	buffer[_i++] = "</span></td><td width=\"16\">";
	buffer[_i++] =  AjxImg.getImageHtml(data.locationImage) ;
	buffer[_i++] = "</td>";
	 } 
	buffer[_i++] = "</tr></table>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#TimeSuggestion"
}, false);

AjxTemplate.register("calendar.Appointment#LocationSuggestion", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "' class=\"ZmLocationSuggestion\">";
	buffer[_i++] =  data.locationName ;
	 if (data.locationDescription) { 
	buffer[_i++] = "<br>";
	buffer[_i++] =  data.locationDescription ;
	 } 
	buffer[_i++] = "</div>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#LocationSuggestion"
}, false);

AjxTemplate.register("calendar.Appointment#ResolveLocationConflictHeader", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<div class=\"ZmResolveLocationConflictHeader\"><div class=\"ZmResolveLocationConflictName\">";
	buffer[_i++] =  ZmMsg.date ;
	buffer[_i++] = "</div><div class=\"ZmResolveLocationConflictAlternate\">";
	buffer[_i++] =  ZmMsg.location ;
	buffer[_i++] = "</div></div>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#ResolveLocationConflictHeader"
}, false);

AjxTemplate.register("calendar.Appointment#ResolveLocationConflict", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "' class=\"ZmResolveLocationConflict ";
	buffer[_i++] =  data.className ;
	buffer[_i++] = "\"><div class=\"ZmResolveLocationConflictName\">";
	buffer[_i++] =  data.date ;
	buffer[_i++] = "</div><div class=\"ZmResolveLocationConflictAlternate\" id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_alternatives'></div></div>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#ResolveLocationConflict"
}, false);

AjxTemplate.register("calendar.Appointment#TimeSuggestion-NoAttendees", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<div class='NoResults' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "'>";
	buffer[_i++] =  ZmMsg.noAttendees ;
	buffer[_i++] = "</div>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#TimeSuggestion-NoAttendees"
}, false);

AjxTemplate.register("calendar.Appointment#TimeSuggestion-NoSuggestions", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<div class='NoSuggestions'><div style='margin-bottom:2em;'>";
	buffer[_i++] = data["message"];
	buffer[_i++] = "</div><span class=\"FakeAnchor\" id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_showall\">";
	buffer[_i++] =  ZmMsg.showTimesAnyway ;
	buffer[_i++] = "</span></div>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#TimeSuggestion-NoSuggestions"
}, false);

AjxTemplate.register("calendar.Appointment#TimeSuggestion-ShowSuggestions", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<div class='NoSuggestions'>\n";
	buffer[_i++] = "\t\t";
	buffer[_i++] = data["message"];
	buffer[_i++] = "\n";
	buffer[_i++] = "\t</div>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#TimeSuggestion-ShowSuggestions"
}, false);

AjxTemplate.register("calendar.Appointment#TimeSuggestion-Loading", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<div class='SuggestionMessage'><div class='DwtWait32Icon'></div><div style='margin-top:1em;'>";
	buffer[_i++] =  ZmMsg.searching ;
	buffer[_i++] = "</div></div>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#TimeSuggestion-Loading"
}, false);

AjxTemplate.register("calendar.Appointment#LocationSuggestion-Warning", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<div class=\"ZmLocationSuggestionWarning\"><div class=\"ZmLocationSuggestionWarningImage\">";
	buffer[_i++] =  AjxImg.getImageHtml("Warning_12") ;
	buffer[_i++] = "</div><div class=\"ZmLocationSuggestionWarningText\">";
	buffer[_i++] =  ZmMsg.locationSuggestionWarning ;
	buffer[_i++] = "</div></div>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#LocationSuggestion-Warning"
}, false);

AjxTemplate.register("calendar.Appointment#AlternateLocation-Loading", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<div class='SuggestionMessage'><div class='DwtWait32Icon'></div><div style='margin-top:1em;'>";
	buffer[_i++] =  ZmMsg.loadingAlternateLocations ;
	buffer[_i++] = "</div></div>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#AlternateLocation-Loading"
}, false);

AjxTemplate.register("calendar.Appointment#TimeLocationPreference", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<table role=\"presentation\" id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_timepref\" class=\"ZPropertySheet\" cellspacing=\"6\" style='margin-bottom:1em;'><tbody><tr><td class=\"SuggestionPrefTitle\" colspan=\"3\">";
	buffer[_i++] =  ZmMsg.timePreferences ;
	buffer[_i++] = "</td></tr><tr><td class=\"ZmFieldLabelRight\">";
	buffer[_i++] =  ZmMsg.suggestionTimes ;
	buffer[_i++] = ":</td><td align=\"right\"><input type=\"checkbox\" id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_my_working_hrs_pref\"></td><td width=\"100%\"><label for=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_my_working_hrs_pref\">";
	buffer[_i++] =  ZmMsg.schedulerPrefMyWorkingHours ;
	buffer[_i++] = "</label></td></tr><tr><td>&nbsp;</td><td align=\"right\"><input type=\"checkbox\" id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_others_working_hrs_pref\"></td><td width=\"100%\"><label for=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_others_working_hrs_pref\">";
	buffer[_i++] =  ZmMsg.schedulerPrefOtherWorkingHours ;
	buffer[_i++] = "</label></td></tr><tr><td class=\"ZmFieldLabelRight\">";
	buffer[_i++] =  ZmMsg.recurrence ;
	buffer[_i++] = ":</td><td align=\"right\" id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_recurrence'></td><td width=\"100%\">";
	buffer[_i++] =  ZmMsg.calculateAvailability ;
	buffer[_i++] = "</td></tr></tbody></table>";
	 if (appCtxt.get(ZmSetting.GAL_ENABLED)) { 
	buffer[_i++] = "<table role=\"presentation\" id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_locationpref\" class=\"ZPropertySheet\" cellspacing=\"6\"><tbody><tr><td class=\"SuggestionPrefTitle\" colspan=\"5\">";
	buffer[_i++] =  ZmMsg.locationPreferences ;
	buffer[_i++] = "</td></tr><tr><td class='ZmFieldLabelRight'>";
	buffer[_i++] =  ZmMsg._name ;
	buffer[_i++] = ":</td><td><input type=\"text\" id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_name\" nowrap=\"\" size=\"30\" autocomplete=\"off\"></td><td class='ZmFieldLabelRight' style='padding-left:2em;'>";
	buffer[_i++] =  ZmMsg.site ;
	buffer[_i++] = ":</td><td><input type=\"text\" id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_site\" nowrap=\"\" size=\"30\" autocomplete=\"off\"></td></tr><tr><td class='ZmFieldLabelRight'>";
	buffer[_i++] =  ZmMsg.minimumCapacity ;
	buffer[_i++] = ":</td><td><input type=\"text\" id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_capacity\" nowrap=\"\" size=\"30\" autocomplete=\"off\"></td><td class='ZmFieldLabelRight' style='padding-left:2em;'>";
	buffer[_i++] =  ZmMsg.building ;
	buffer[_i++] = ":</td><td><input type=\"text\" id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_building\" nowrap=\"\" size=\"30\" autocomplete=\"off\"></td></tr><tr><td class='ZmFieldLabelRight'>";
	buffer[_i++] =  ZmMsg.description ;
	buffer[_i++] = ":</td><td><input type=\"text\" id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_desc\" nowrap=\"\" size=\"30\" autocomplete=\"off\"></td><td class='ZmFieldLabelRight' style='padding-left:2em;'>";
	buffer[_i++] =  ZmMsg.floor ;
	buffer[_i++] = ":</td><td><input type=\"text\" id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_floor\" nowrap=\"\" size=\"30\" autocomplete=\"off\"></td></tr></tbody></table>";
	 } 

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#TimeLocationPreference"
}, false);

AjxTemplate.register("calendar.Appointment#SuggestionTooltip", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<span='font-weight:bold;'>";
	buffer[_i++] =  ZmMsg.busy ;
	buffer[_i++] = "</span>";
	
	        for (var i=0; i < data.attendees.length; i++) {
	    
	buffer[_i++] = "<br><span class=\"suggestion_tooltip_attendee\">";
	buffer[_i++] =  AjxStringUtil.htmlEncode(data.attendees[i]) ;
	buffer[_i++] = "</span>";
	
	        }
	    

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#SuggestionTooltip"
}, false);

AjxTemplate.register("calendar.Appointment#LocationSuggestionTooltip", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<div class='ZmLocationSuggestionTooltip'><div class='ZmLocationTooltipTitle'>";
	buffer[_i++] =  AjxStringUtil.htmlEncode(data.name) ;
	buffer[_i++] = "</div>";
	 if (data.description != "") {  
	buffer[_i++] =  AjxStringUtil.htmlEncode(data.description) ;
	buffer[_i++] = "<br>";
	 } 
	 if (data.contactMail != "") {  
	buffer[_i++] =  ZmMsg.contact + ": " + AjxStringUtil.htmlEncode(data.contactMail) ;
	buffer[_i++] = "<br>";
	 } 
	 if (data.capacity != "") {  
	buffer[_i++] =  ZmMsg.capacity + ": " + AjxStringUtil.htmlEncode(data.capacity) ;
	buffer[_i++] = "<br>";
	 } 
	buffer[_i++] = "</div>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#LocationSuggestionTooltip"
}, false);

AjxTemplate.register("calendar.Appointment#ChangesDialogAttendee", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<table role=\"presentation\" width='300'><tr><td>";
	buffer[_i++] = ZmMsg.apptSignificantChangesAttendee ;
	buffer[_i++] = "</td></tr></table>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#ChangesDialogAttendee"
}, false);

}
if (AjxPackage.define("calendar.Calendar")) {
AjxTemplate.register("calendar.Calendar#calendar_appt", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_body' class='appt_body ";
	buffer[_i++] = data["bodyColor"];
	buffer[_i++] = " ";
	buffer[_i++] = data["boxBorder"];
	buffer[_i++] = "'><table role=\"presentation\" id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_tableBody' style=\"width:100%; height:100%;";
	buffer[_i++] = data["bodyStyle"];
	buffer[_i++] = "\">";
	 if(data.headerStyle) {
	buffer[_i++] = "<tr style=\"";
	buffer[_i++] = data["headerStyle"];
	buffer[_i++] = "\">";
	 }else { 
	buffer[_i++] = "<tr class='";
	buffer[_i++] = data["headerColor"];
	buffer[_i++] = "'>";
	 } 
	buffer[_i++] = "<td style=\"";
	buffer[_i++] = data["showAsColor"];
	buffer[_i++] = "\" width=4 rowspan=\"";
	buffer[_i++] =  data.hideTime ? 2 : 3 ;
	buffer[_i++] = "\"></td><td class='appt";
	buffer[_i++] = data["newState"];
	buffer[_i++] = "_time'><table role=\"presentation\" style='background: none repeat scroll 0 0 transparent;border:0;border-collapse:collapse;border-spacing:0;width:100%'><tr><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_st' style='padding-right:3px;white-space:nowrap;'>";
	buffer[_i++] = data["starttime"];
	buffer[_i++] = "</td>";
	 if (data.icon) { 
	buffer[_i++] = "<td style='padding-right:3px;'>";
	buffer[_i++] =  AjxImg.getImageHtml(data.icon, "width:16") ;
	buffer[_i++] = "</td>";
	 } 
	 if (data.isException) { 
	buffer[_i++] = "<td style='padding-right:3px;'>";
	buffer[_i++] =  AjxImg.getImageHtml("ApptExceptionIndicator") ;
	buffer[_i++] = "</td>";
	 } else if (data.isRecurring) { 
	buffer[_i++] = "<td style='padding-right:3px;'>";
	buffer[_i++] =  AjxImg.getImageHtml("ApptRecurIndicator") ;
	buffer[_i++] = "</td>";
	 } 
	buffer[_i++] = "<td style='width:100%'></td>";
	 if (data.otherAttendees) { 
	buffer[_i++] = "<td style='padding-right:3px;'>";
	buffer[_i++] =  AjxImg.getImageHtml("ApptMeetingIndicator") ;
	 if(data.isDraft) { 
	buffer[_i++] = "<div style=\"position:absolute;top:5px;\">";
	buffer[_i++] =  AjxImg.getImageHtml("Edit", "width:16") ;
	buffer[_i++] = "</div>";
	 } 
	buffer[_i++] = "</td>";
	 } 
	buffer[_i++] =  AjxTemplate.expand("#calendar_tag_icon",  data) ;
	buffer[_i++] = "</tr></table></td></tr><tr valign=top><td class=appt";
	buffer[_i++] = data["newState"];
	buffer[_i++] = "_name style='height:100%'>\n";
	buffer[_i++] = "\t\t\t\t\t";
	buffer[_i++] = data["name"];
	buffer[_i++] = "\n";
	buffer[_i++] = "\t\t\t\t\t";
	 if (data.location) { 
	buffer[_i++] = "\n";
	buffer[_i++] = "\t\t\t\t\t\t";
	buffer[_i++] = data["location"];
	buffer[_i++] = "\n";
	buffer[_i++] = "\t\t\t\t\t";
	 } 
	buffer[_i++] = "</td></tr>";
	 if(!data.hideTime) {
	buffer[_i++] = "<tr><td class=appt_end_time id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_et'>";
	buffer[_i++] = data["endtime"];
	buffer[_i++] = "</td></tr>";
	 } 
	buffer[_i++] = "</table></div>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Calendar#calendar_appt",
	"height": "7",
	"width": "10"
}, false);
AjxTemplate.register("calendar.Calendar", AjxTemplate.getTemplate("calendar.Calendar#calendar_appt"), AjxTemplate.getParams("calendar.Calendar#calendar_appt"));

AjxTemplate.register("calendar.Calendar#calendar_tag_icon", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	 if (data.tagIcon) { 
	buffer[_i++] = "<td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_tag' width=20px style='padding-right:3px;'>";
	buffer[_i++] =  AjxImg.getImageHtml(data.tagIcon, "width:16") ;
	buffer[_i++] = "</td>";
	 } 
	 if (data.peelIcon) { 
	buffer[_i++] = "<td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_peel' width=12 valign=\"top\">";
	buffer[_i++] =  AjxImg.getImageHtml('PeelSpacer', "width:12") ;
	buffer[_i++] = "<div style='position:absolute;z-index:1;top:";
	buffer[_i++] = data["peelTop"];
	buffer[_i++] = "px;right:";
	buffer[_i++] = data["peelRight"];
	buffer[_i++] = "px;'>";
	buffer[_i++] =  AjxImg.getImageHtml(data.peelIcon, "width:12") ;
	buffer[_i++] = "</div></td>";
	 } 

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Calendar#calendar_tag_icon"
}, false);

AjxTemplate.register("calendar.Calendar#calendar_appt_bottom_only", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_body' class='appt_body ";
	buffer[_i++] = data["bodyColor"];
	buffer[_i++] = " ";
	buffer[_i++] = data["boxBorder"];
	buffer[_i++] = "'><table role=\"presentation\" id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_tableBody' style=\"width:100%;height:100%;";
	buffer[_i++] = data["bodyStyle"];
	buffer[_i++] = "\"><tr valign=top><td width='4px' style='";
	buffer[_i++] = data["showAsColor"];
	buffer[_i++] = "' ></td><td class=appt";
	buffer[_i++] = data["newState"];
	buffer[_i++] = "_name style='height:100%'>\n";
	buffer[_i++] = "\t\t\t\t\t";
	buffer[_i++] = data["name"];
	buffer[_i++] = "\n";
	buffer[_i++] = "\t\t\t\t\t";
	 if (data.location) { 
	buffer[_i++] = "\n";
	buffer[_i++] = "\t\t\t\t\t\t";
	buffer[_i++] = data["location"];
	buffer[_i++] = "\n";
	buffer[_i++] = "\t\t\t\t\t";
	 } 
	buffer[_i++] = "</td></tr><tr><td colspan=2 class=appt_end_time id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_et'>";
	buffer[_i++] = data["endtime"];
	buffer[_i++] = "</td></tr></table></div>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Calendar#calendar_appt_bottom_only",
	"height": "7",
	"width": "10"
}, false);

AjxTemplate.register("calendar.Calendar#calendar_appt_30", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_body' class='appt_30_body  ";
	buffer[_i++] = data["headerColor"];
	buffer[_i++] = " ";
	buffer[_i++] = data["boxBorder"];
	buffer[_i++] = "'><table role=\"presentation\" id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_tableBody' width=100% style=\"width:100%;height:100%;";
	buffer[_i++] = data["headerStyle"];
	buffer[_i++] = "\">";
	 if(data.headerStyle) {
	buffer[_i++] = "<tr style=\"";
	buffer[_i++] = data["headerStyle"];
	buffer[_i++] = "\">";
	 }else { 
	buffer[_i++] = "<tr class='";
	buffer[_i++] = data["headerColor"];
	buffer[_i++] = "'>";
	 } 
	buffer[_i++] = "<td width='4px' style=\"";
	buffer[_i++] = data["showAsColor"];
	buffer[_i++] = "\" ></td><td class=appt_30";
	buffer[_i++] = data["newState"];
	buffer[_i++] = "_name style=\"white-space:nowrap;\">";
	buffer[_i++] = data["name"];
	buffer[_i++] = "</td>";
	 if (data.icon) { 
	buffer[_i++] = "<td valign=top width=16>";
	buffer[_i++] =  AjxImg.getImageHtml(data.icon, "width:16") ;
	buffer[_i++] = "</td>";
	 } 
	 if (data.tagIcon) { 
	buffer[_i++] = "<td valign=top width=16  style='padding-right:3px;'>";
	buffer[_i++] =  AjxImg.getImageHtml(data.tagIcon, "width:16") ;
	buffer[_i++] = "</td>";
	 } 
	 if (data.peelIcon) { 
	buffer[_i++] = "<td width=12>";
	buffer[_i++] =  AjxImg.getImageHtml('PeelSpacer', "width:12") ;
	buffer[_i++] = "</td><div style='position:absolute;top:1;right:1;'>";
	buffer[_i++] =  AjxImg.getImageHtml(data.peelIcon, "width:12") ;
	buffer[_i++] = "</div>";
	 } 
	buffer[_i++] = "</tr></table></div>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Calendar#calendar_appt_30",
	"height": "4",
	"width": "4"
}, false);

AjxTemplate.register("calendar.Calendar#calendar_appt_allday", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_body' class='appt_allday_body ";
	buffer[_i++] = data["headerColor"];
	buffer[_i++] = " ";
	buffer[_i++] = data["boxBorder"];
	buffer[_i++] = "'><table role=\"presentation\" id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_tableBody' style=\"table-layout:fixed;height:100%;";
	buffer[_i++] = data["headerStyle"];
	buffer[_i++] = data["borderLeft"];
	buffer[_i++] = data["borderRight"];
	buffer[_i++] = "\">";
	 if(data.headerStyle) {
	buffer[_i++] = "<tr style=\"";
	buffer[_i++] = data["headerStyle"];
	buffer[_i++] = "\">";
	 }else { 
	buffer[_i++] = "<tr class='";
	buffer[_i++] = data["headerColor"];
	buffer[_i++] = "'>";
	 } 
	buffer[_i++] = "<td class='";
	buffer[_i++] = data["showAsClass"];
	buffer[_i++] = "' style=\"min-width:4px; ";
	buffer[_i++] = data["showAsColor"];
	buffer[_i++] = "\" ></td><td width=100% class=appt_allday";
	buffer[_i++] = data["newState"];
	buffer[_i++] = "_name><div style=\"overflow: hidden; white-space: nowrap;\">";
	buffer[_i++] = data["name"];
	buffer[_i++] = "</div></td>";
	 if (data.icon) { 
	buffer[_i++] = "<td width=16px style='padding-right:3px;'><div class='appt_icon'>";
	buffer[_i++] =  AjxImg.getImageHtml(data.icon, "width:16") ;
	buffer[_i++] = "</div></td>";
	 } 
	buffer[_i++] =  AjxTemplate.expand("#calendar_tag_icon",  data) ;
	buffer[_i++] = "</tr></table></div>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Calendar#calendar_appt_allday",
	"height": "4",
	"width": "4"
}, false);

AjxTemplate.register("calendar.Calendar#calendar_fb_appt", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_body' class='appt_allday_body'><div style=\"padding:3px;overflow:hidden;height:21px;\">";
	buffer[_i++] = data["name"];
	buffer[_i++] = "</div></div>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Calendar#calendar_fb_appt",
	"height": "4",
	"width": "4"
}, false);

AjxTemplate.register("calendar.Calendar#month_appt", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	 var continues = data.multiday && !data.last; 
	 var continued = data.multiday && !data.first; 
	 var style = continues ? "padding-right:14px;" : ""; 
	buffer[_i++] = "<div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_body' style='position:relative;'><table role=\"presentation\" id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_tableBody' width=100% style=\"table-layout:fixed; ";
	buffer[_i++] = data["headerStyle"];
	buffer[_i++] = "\"><tr><td width='4px' style=\"";
	buffer[_i++] = data["showAsColor"];
	buffer[_i++] = "\" ></td><td width=100%><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_st_su' style='overflow:hidden;white-space:nowrap; ";
	buffer[_i++] = style;
	buffer[_i++] = "'>";
	 if (continues) { 
	buffer[_i++] = "<div class='calendar_month_day_item_continues'>&raquo;</div>";
	 } 
	 if (continued) { 
	buffer[_i++] = "\n";
	buffer[_i++] = "                        &laquo;&nbsp;\n";
	buffer[_i++] = "                    ";
	 } else { 
	buffer[_i++] = "<span id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_start_time' class='start_time'>";
	buffer[_i++] = data["duration"];
	buffer[_i++] = "</span>";
	 } 
	buffer[_i++] = "<span id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_subject' class='subject'>";
	buffer[_i++] =  AjxStringUtil.htmlEncode(data.appt.getName()) ;
	buffer[_i++] = "</span></div></td>";
	buffer[_i++] =  AjxTemplate.expand("#calendar_tag_icon",  data) ;
	buffer[_i++] = "</tr></table></div>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Calendar#month_appt"
}, false);

AjxTemplate.register("calendar.Calendar#TypeDialog", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<div style='width:274px' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_question'></div><p><table role=\"presentation\" align=center width=1%><tr><td width=1%><input checked value='1' type='radio' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_defaultRadio' name='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_instSeriesName'></td><td style='white-space:nowrap'><label id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_instanceMsg' for='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_defaultRadio'> </label></td></tr><tr><td width=1%><input value='2' type='radio' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_openSeries' name='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_instSeriesName'></td><td style='white-space:nowrap'><label id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_seriesMsg' for='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_openSeries'> </label></td></tr></table>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Calendar#TypeDialog"
}, false);

AjxTemplate.register("calendar.Calendar#PrintDialog", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_printDialogContainer'><table role=\"presentation\" align=center width=600><tr><td width=30% valign=top><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_calTreeContainer' style=\"margin-right:5px;\"></div></td><td width=70% valign=top><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_printErrorMsgContainer'></div><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_printOptionsContainer'><table role=\"presentation\" class=\"ZPropertySheet\" cellspacing=\"6\"><tr><td width=25><input checked value='sel_date' type='radio' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_selDateRadio' name='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_selDateRange'></td><td width=80><label for='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_selDateRadio'> ";
	buffer[_i++] =  ZmMsg.calPrintSelDate ;
	buffer[_i++] = "</label></td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_selDateContainer'></td><td>&nbsp;</td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_todayButtonContainer'></td></tr><tr><td width=25><input value=\"date_range\" type='radio' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_dateRangeRadio' name='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_selDateRange'></td><td width=80><label for='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_dateRangeRadio'>";
	buffer[_i++] =  ZmMsg.calPrintDateRange ;
	buffer[_i++] = "</label></td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_dateRangeFromContainer'></td><td>&nbsp; ";
	buffer[_i++] =  ZmMsg.calPrintTo ;
	buffer[_i++] = " &nbsp;</td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_dateRangeToContainer'></td></tr></table><div class=\"horizSep\"></div><table role=\"presentation\" class=\"ZPropertySheet\" cellspacing=\"6\" width=100%><tr style='display:block;'><td align=right width=111>";
	buffer[_i++] =  ZmMsg.calPrintView ;
	buffer[_i++] = "</td><td colspan=4><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_printViewContainer'></div></td></tr><tr id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_hoursContainer' style='display:block;'><td align=right width=111>";
	buffer[_i++] =  ZmMsg.calPrintHours ;
	buffer[_i++] = "</td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_fromHoursContainer'></td><td>&nbsp; ";
	buffer[_i++] =  ZmMsg.calPrintTo ;
	buffer[_i++] = " &nbsp;</td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_toHoursContainer'></td><td></td></tr><tr style='display:block;'><td align=right valign=top width=111>";
	buffer[_i++] =  ZmMsg.calPrintOptions ;
	buffer[_i++] = "</td><td colspan=4><table role=\"presentation\" class=\"ZCheckboxTable\" width=100%><tr id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_workDaysOnlyContainer'><td><input value=\"1\" type='checkbox' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_workDaysOnly' name='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_workDaysOnly'></td><td><label for='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_workDaysOnly'>";
	buffer[_i++] =  ZmMsg.calPrintWorkDaysOnly ;
	buffer[_i++] = "</label></td></tr><tr id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_oneWeekPerPageContainer'><td><input value=\"1\" type='checkbox' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_oneWeekPerPage' name='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_oneWeekPerPage'></td><td><label for='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_oneWeekPerPage'>";
	buffer[_i++] =  ZmMsg.calPrintOneWeekPerPage ;
	buffer[_i++] = "</label></td></tr><tr id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_oneDayPerPageContainer'><td><input value=\"1\" type='checkbox' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_oneDayPerPage' name='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_oneDayPerPage'></td><td><label for='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_oneDayPerPage'>";
	buffer[_i++] =  ZmMsg.calPrintOneDayPerPage ;
	buffer[_i++] = "</label></td></tr><tr id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_includeMiniCalContainer'><td><input value=\"1\" type='checkbox' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_includeMiniCal' name='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_includeMiniCal'></td><td><label for='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_includeMiniCal'>";
	buffer[_i++] =  ZmMsg.calPrintIncludeMiniCal ;
	buffer[_i++] = "</label></td></tr></table></td></tr></table></div></td></tr></table><div>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Calendar#PrintDialog"
}, false);

AjxTemplate.register("calendar.Calendar#SharedCalendarDialog", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_shareCalendarView1'><table role=\"presentation\" width=300><tr><td valign=top align=right>";
	buffer[_i++] =  ZmMsg.sourceLabel ;
	buffer[_i++] = "</td><td><table role=\"presentation\" class=\"ZRadioButtonTable\" width=100%><tr><td width=\"5\"><input type=\"radio\" name=\"extCalType\" id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_shareRadioYahoo\"></td><td align=left><label for=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_shareRadioYahoo\">";
	buffer[_i++] =  ZmMsg.sharedCalTitleYahoo ;
	buffer[_i++] = "</label></td></tr><tr><td width=\"5\"><input type=\"radio\" name=\"extCalType\" id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_shareRadioOther\"></td><td align=left><label for=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_shareRadioOther\">";
	buffer[_i++] =  ZmMsg.sharedCalTitleOther ;
	buffer[_i++] = "</label></td></tr></table></td></tr></table></div><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_shareCalendarView2'><table role=\"presentation\" width=300><tr><td>&nbsp;</td><td><table role=\"presentation\" class=\"ZPropertySheet\" cellspacing=\"6\" width=100%><tr><td align=right width=80>";
	buffer[_i++] =  ZmMsg.sharedCalTypeLabel ;
	buffer[_i++] = "</td><td id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_syncType\"></td></tr><tr id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_syncUserNameContainer\"><td align=right width=80>";
	buffer[_i++] =  ZmMsg.sharedCalUserNameLabel ;
	buffer[_i++] = "</td><td id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_syncUserName\"></td></tr><tr id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_syncPasswordContainer\"><td align=right width=80>";
	buffer[_i++] =  ZmMsg.sharedCalPasswordLabel ;
	buffer[_i++] = "</td><td id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_syncPassword\"></td></tr><tr id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_syncUrlContainer\"><td align=right width=80>";
	buffer[_i++] =  ZmMsg.sharedCalCalDAVServerLabel ;
	buffer[_i++] = "</td><td id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_syncUrl\"></td></tr><tr id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_syncIcsUrlContainer\"><td align=right width=80>";
	buffer[_i++] =  ZmMsg.sharedCalIcsUrlLabel ;
	buffer[_i++] = "</td><td id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_syncIcsUrl\"></td></tr><tr id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_syncMsgContainer\" style=\"display:none;\"><td colspan=2 id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_syncMsg\"></td></tr></table></td></tr></table></div><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_shareCalendarView3'></div>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Calendar#SharedCalendarDialog"
}, false);

AjxTemplate.register("calendar.Calendar#ApptDragProxy", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<div class='";
	buffer[_i++] = data["color"];
	buffer[_i++] = "'><table role=\"presentation\"><tr><td rowspan=2>";
	buffer[_i++] =  AjxImg.getImageHtml("Appointment") ;
	buffer[_i++] = "</td><td><b>";
	buffer[_i++] = data["shortDate"];
	buffer[_i++] = "</b> ";
	buffer[_i++] = data["dur"];
	buffer[_i++] = "</td></tr><tr><td><b>";
	buffer[_i++] = data["apptName"];
	buffer[_i++] = "</b></td></tr></table></div>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Calendar#ApptDragProxy"
}, false);

AjxTemplate.register("calendar.Calendar#ListViewFolder", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<table role=\"presentation\"><tr><td width=16 id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_image\">";
	buffer[_i++] =  AjxImg.getImageHtml(data.folder.getIconWithColor()) ;
	buffer[_i++] = "</td><td width=100% id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_name\">";
	buffer[_i++] = data["folderName"];
	buffer[_i++] = "</td></tr></table>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Calendar#ListViewFolder"
}, false);

AjxTemplate.register("calendar.Calendar#ListViewSearchBar", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<table role=\"presentation\" width=100%><tr><td id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_searchBarControls\"></td><td id=\"";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_searchBarDate\" class='calendar_date_search-dateRange'></td></tr></table>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Calendar#ListViewSearchBar"
}, false);

AjxTemplate.register("calendar.Calendar#ListViewSearchBarInput", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<table role=\"presentation\" width=100%><tr><td class='calendar_date_search_td'><input autocomplete='off' style='height:22px;' type='text' size=14 id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "DateInput' value='";
	buffer[_i++] = data["value"];
	buffer[_i++] = "'></td><td class=\"miniCalendarButton\" id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "MiniCal'></td></tr></table>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Calendar#ListViewSearchBarInput"
}, false);

AjxTemplate.register("calendar.Calendar#ReminderDialogRow", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<tr id='";
	buffer[_i++] = data["rowId"];
	buffer[_i++] = "'><td style=\"max-width:350px;\" valign=top><div id='";
	buffer[_i++] = data["openLinkId"];
	buffer[_i++] = "' class='ZmApptOpenLink'></div><div id='";
	buffer[_i++] = data["reminderDescContainerId"];
	buffer[_i++] = "'>";
	 if (data.durationText != "") { 
	buffer[_i++] = "\n";
	buffer[_i++] = "\t\t\t    ";
	buffer[_i++] = data["durationText"];
	buffer[_i++] = "<br>";
	 } 
	 if (data.organizer) { 
	buffer[_i++] =  ZmMsg.organizerLabel ;
	buffer[_i++] = " ";
	buffer[_i++] = data["organizer"];
	buffer[_i++] = "<br>";
	 } 
	 if (data.calName) { 
	 if(data.type == ZmItem.APPT) { 
	buffer[_i++] =  ZmMsg.calendarLabel ;
	buffer[_i++] = " ";
	buffer[_i++] = data["calName"];
	buffer[_i++] = "<br>";
	 } else if (data.type == ZmItem.TASK) { 
	buffer[_i++] =  ZmMsg.tasks ;
	buffer[_i++] = ": ";
	buffer[_i++] = data["calName"];
	buffer[_i++] = "<br>";
	 } 
	 } 
	 if (data.accountName) { 
	buffer[_i++] =  ZmMsg.accountLabel ;
	buffer[_i++] = " ";
	buffer[_i++] = data["accountName"];
	buffer[_i++] = "<br>";
	 } 
	 if (data.location) { 
	buffer[_i++] =  ZmMsg.locationLabel ;
	buffer[_i++] = " ";
	buffer[_i++] = data["location"];
	buffer[_i++] = "<br>";
	 } 
	buffer[_i++] = "</div></td><td valign=top align=right><table role=\"presentation\" style=\"margin-left:15px;\"><tr id='";
	buffer[_i++] = data["actionsRowId"];
	buffer[_i++] = "'><td valign=top align=right><table role=\"presentation\" class='ZPropertySheet' cellspacing='6'><tr><td valign=top id='";
	buffer[_i++] = data["snoozeSelectInputId"];
	buffer[_i++] = "' style=\"padding-right:0;\"></td><td valign=top id='";
	buffer[_i++] = data["snoozeSelectBtnId"];
	buffer[_i++] = "' style=\"padding-left:0\" width=\"1%\"></td><td valign=top id='";
	buffer[_i++] = data["snoozeBtnId"];
	buffer[_i++] = "'></td><td valign=top id='";
	buffer[_i++] = data["dismissBtnId"];
	buffer[_i++] = "'></td></tr></table></td></tr><tr><td style='white-space:nowrap;' align='right' id='";
	buffer[_i++] = data["deltaId"];
	buffer[_i++] = "'></td></tr></table></td></tr>";
	 if (!data.noSep) { /* used only from ZmQuickReminderDialog */ 
	buffer[_i++] = "<tr name=\"rdsep\"><td colspan=3><div class=\"horizSep\"></div></td></tr>";
	 } 

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Calendar#ReminderDialogRow"
}, false);

AjxTemplate.register("calendar.Calendar#ReminderDialogAllSection", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<table role=\"presentation\" class='ZPropertySheet' cellspacing='6' cellpadding=0 border=0 width=\"100%\"><tr><td width=100% valign=middle align=right><span id='";
	buffer[_i++] = data["snoozeAllLabelId"];
	buffer[_i++] = "'></span></td><td valign=top id='";
	buffer[_i++] = data["snoozeSelectInputId"];
	buffer[_i++] = "' style=\"padding-right:0\"></td><td valign=top id='";
	buffer[_i++] = data["snoozeSelectBtnId"];
	buffer[_i++] = "' style=\"padding-left:0\"></td><td valign=top id='";
	buffer[_i++] = data["snoozeBtnId"];
	buffer[_i++] = "' class=\"DwtDialogButtonBar\"></td><td valign=top id='";
	buffer[_i++] = data["dismissBtnId"];
	buffer[_i++] = "' class=\"DwtDialogButtonBar\"></td></tr></table>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Calendar#ReminderDialogAllSection"
}, false);

AjxTemplate.register("calendar.Appointment#DnDProxy", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<table role=\"presentation\" class=\"dnd_calendar_month_day_table\"><tr></tr></table>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "calendar.Appointment#DnDProxy"
}, false);

}
