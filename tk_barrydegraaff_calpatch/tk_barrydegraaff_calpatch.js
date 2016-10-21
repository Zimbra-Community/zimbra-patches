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
function tk_barrydegraaff_calpatch_HandlerObject() {
};


tk_barrydegraaff_calpatch_HandlerObject.prototype = new ZmZimletBase();
tk_barrydegraaff_calpatch_HandlerObject.prototype.constructor = tk_barrydegraaff_calpatch_HandlerObject;

tk_barrydegraaff_calpatch_HandlerObject.prototype.toString =
function() {
   return "tk_barrydegraaff_calpatch_HandlerObject";
};

/** 
 * Creates the Zimlet, extends {@link https://files.zimbra.com/docs/zimlet/zcs/8.6.0/jsapi-zimbra-doc/symbols/ZmZimletBase.html ZmZimletBase}.
 * @class
 * @extends ZmZimletBase
 *  */
var calPatch = tk_barrydegraaff_calpatch_HandlerObject;

/** 
 * This method gets called when Zimbra Zimlet framework initializes.
 * calPatch uses the init function to load openpgp.js and configure the user settings and runtime variables.
 */
calPatch.prototype.init = function() {
try {
AjxDispatcher.require(["Calendar"]);
if(ZmCalDayTabView)
{
   ZmCalDayTabView.prototype._createHtml =
   function(abook) {
      this._days = {};
      this._columns = [];
      this._hours = {};
      this._layouts = [];
      this._allDayAppts = [];
       this._allDayRows = [];
   
      this._headerYearId = Dwt.getNextId();
      this._yearHeadingDivId = Dwt.getNextId();
      this._yearAllDayDivId = Dwt.getNextId();
      this._yearAllDayTopBorderId = Dwt.getNextId();
      this._yearAllDayBottomBorderId = Dwt.getNextId();
      this._leftAllDaySepDivId = Dwt.getNextId();
      this._leftApptSepDivId = Dwt.getNextId();
   
      this._allDayScrollDivId = Dwt.getNextId();
      this._allDayHeadingDivId = Dwt.getNextId();
      this._allDayApptScrollDivId = Dwt.getNextId();
      this._allDayDivId = Dwt.getNextId();
      this._hoursScrollDivId = Dwt.getNextId();
      this._bodyHourDivId = Dwt.getNextId();
      this._allDaySepDivId = Dwt.getNextId();
      this._bodyDivId = Dwt.getNextId();
      this._apptBodyDivId = Dwt.getNextId();
      this._newApptDivId = Dwt.getNextId();
      this._newAllDayApptDivId = Dwt.getNextId();
      this._timeSelectionDivId = Dwt.getNextId();
       this._curTimeIndicatorHourDivId = Dwt.getNextId();
       this._curTimeIndicatorGridDivId = Dwt.getNextId();
       this._startLimitIndicatorDivId = Dwt.getNextId();
       this._endLimitIndicatorDivId = Dwt.getNextId();
       this._hourColDivId = Dwt.getNextId();
   
       this._unionHeadingDivId = Dwt.getNextId();
       this._unionAllDayDivId = Dwt.getNextId();
       this._unionHeadingSepDivId = Dwt.getNextId();
       this._unionGridScrollDivId = Dwt.getNextId();
       this._unionGridDivId = Dwt.getNextId();
       this._unionGridSepDivId = Dwt.getNextId();
       this._workingHrsFirstDivId = Dwt.getNextId();
       this._workingHrsSecondDivId = Dwt.getNextId();
   
       this._tabsContainerDivId = Dwt.getNextId();
       this._toggleBtnContainerId = Dwt.getNextId();
   
       this._borderLeftDivId = Dwt.getNextId();
       this._borderRightDivId = Dwt.getNextId();
       this._borderTopDivId = Dwt.getNextId();
       this._borderBottomDivId = Dwt.getNextId();
       this._startLimitIndicatorDivId = Dwt.getNextId();
       this._endLimitIndicatorDivId = Dwt.getNextId();
   
       var html = new AjxBuffer(),
           // year heading
          inviteMessageHeaderStyle = (this._isInviteMessage && !this._isRight ? "height:26px;" : ""), //override class css in this case, so the header height aligns with the message view on the left
          headerStyle = "position:absolute;" + inviteMessageHeaderStyle,
           func,
           ids,
           types,
           i;
   
      // div under year
      html.append("<div id='", this._yearAllDayDivId, "' name='_yearAllDayDivId' style='position:absolute;'>");
       html.append("<div id='", this._yearHeadingDivId, "' class='calendar_heading_day_tab' name='_yearHeadingDivId' style='width:100%;height:100%;'>");
      html.append("<div id='", this._headerYearId,
         "' name='_headerYearId' class=calendar_heading_year_text style='position:absolute; width:", ZmCalColView._HOURS_DIV_WIDTH,"px;'></div>");
      html.append("</div>");
       html.append("</div>");
   
      // sep between year and headings
      html.append("<div id='", this._leftAllDaySepDivId, "' name='_leftAllDaySepDivId' class='calendar_day_separator' style='position:absolute'></div>");
   
       if (this._scheduleMode) {
   
         // div in all day space
         html.append("<div id='", this._unionAllDayDivId, "' name='_unionAllDayDivId' style='position:absolute'>");
           html.append("<div id='", this._unionHeadingDivId, "' name='_unionHeadingDivId' class=calendar_heading style='position:absolute'>");
         html.append("<div class=calendar_heading_year_text style='position:absolute; width:", ZmCalDayTabView._UNION_DIV_WIDTH,"px;'>",ZmMsg.allDay,"</div>");
         html.append("</div>");
           html.append("</div>");
   
         // sep between year and headings
         html.append("<div id='", this._unionHeadingSepDivId, "' name='_unionHeadingSepDivId' class='calendar_day_separator' style='position:absolute'></div>");
      }
   
      // all day scroll	=============
      html.append("<div id='", this._allDayScrollDivId, "' name='_allDayScrollDivId' style='position:absolute; overflow:hidden;'>");
      html.append("</div>");
      // end of all day scroll ===========
   
      // div holding all day appts
      html.append("<div id='", this._allDayApptScrollDivId, "' name='_allDayApptScrollDivId' class='calendar_allday_appt' style='position:absolute'>");
      html.append("<div id='", this._allDayHeadingDivId, "' name='_allDayHeadingDivId' style='", headerStyle,	"'></div>");
      html.append("<div id='", this._allDayDivId, "' name='_allDayDivId' style='position:absolute;margin-top:20px'>");
      html.append("<div id='", this._newAllDayApptDivId, "' name='_newAllDayApptDivId' class='appt-selected' style='position:absolute; display:none;'></div>");
      html.append("</div>");
      html.append("</div>");
       // end of div holding all day appts
   
      // sep betwen all day and normal appts
      html.append("<div id='", this._allDaySepDivId, "' name='_allDaySepDivId' style='overflow:hidden;position:absolute;display:none'></div>");
   
      // div to hold hours
      html.append("<div id='", this._hoursScrollDivId, "' name='_hoursScrollDivId' class=calendar_hour_scroll style='position:absolute;'>");
      this._createHoursHtml(html);
      html.append("</div>");
       // end of div to hold hours
   
      // sep between hours and grid
      html.append("<div id='", this._leftApptSepDivId, "' name='_leftApptSepDivId' class='calendar_day_separator' style='position:absolute'></div>");
   
      // union grid
      if (this._scheduleMode) {
         html.append("<div id='", this._unionGridScrollDivId, "' name='_unionGridScrollDivId' class=calendar_union_scroll style='position:absolute;display:none;'>");
         html.append("<div id='", this._unionGridDivId, "' name='_unionGridDivId' class='ImgCalendarDayGrid' style='width:100%; height:1008px; position:absolute;'>");
         html.append("</div></div>");
         // sep between union grid and appt grid
         html.append("<div id='", this._unionGridSepDivId, "' name='_unionGridSepDivId' class='calendar_day_separator' style='position:absolute;display:none;'></div>");
      }
   
      // grid body
       // Fix for bug: 66603. Removed horizontal scroll bar from grid body
      html.append("<div id='", this._bodyDivId, "' name='_bodyDivId' class='calendar_body' style='position:absolute; overflow-x:hidden;'>");
      html.append("<div id='", this._apptBodyDivId, "' name='_apptBodyDivId' class='ImgCalendarDayGrid' style='width:100%; height:1008px; position:absolute;background-color:#E3E3DC;'>");
      html.append("<div id='", this._timeSelectionDivId, "' name='_timeSelectionDivId' class='calendar_time_selection' style='position:absolute; display:none;z-index:10;'></div>");
      html.append("<div id='", this._newApptDivId, "' name='_newApptDivId' class='appt-selected' style='position:absolute; display:none;'></div>");
   
       html.append("<div id='", this._workingHrsFirstDivId, "' style='position:absolute;background-color:#FFFFFF;'><div class='ImgCalendarDayGrid' id='", this._workingHrsFirstChildDivId, "' style='position:absolute;top:0px;left:0px;overflow:hidden;'></div></div>");
       html.append("<div id='", this._workingHrsSecondDivId, "' style='position:absolute;background-color:#FFFFFF;'><div class='ImgCalendarDayGrid' id='", this._workingHrsSecondChildDivId, "' style='position:absolute;top:0px;left:0px;overflow:hidden;'></div></div>");
   
       html.append("<div id='", this._borderLeftDivId, "' name='_borderLeftDivId' class='ZmDayTabSeparator' style='background-color:#FFFFFF;position:absolute;'></div>");
       html.append("<div id='", this._borderRightDivId, "' name='_borderRightDivId' class='ZmDayTabSeparator' style='background-color:#FFFFFF;position:absolute;'></div>");
       html.append("<div id='", this._borderTopDivId, "' name='_borderTopDivId' class='ZmDayTabSeparator' style='background-color:#FFFFFF;position:absolute;'></div>");
       html.append("<div id='", this._borderBottomDivId, "' name='_borderBottomDivId' class='ZmDayTabSeparator' style='background-color:#FFFFFF;position:absolute;'></div>");
      html.append("</div>");
       // end of grid body
   
       //Strip to indicate the current time
       html.append("<div id='"+this._curTimeIndicatorGridDivId+"' name='_curTimeIndicatorGridDivId' class='calendar_cur_time_indicator_strip' style='position:absolute;background-color:#F16426; height: 1px;'></div>");
       //arrow to indicate the off-screen appointments
       html.append("<div id='"+this._startLimitIndicatorDivId+"' class='calendar_start_limit_indicator'><div class='ImgArrowMoreUp'></div></div>");
       html.append("<div id='"+this._endLimitIndicatorDivId+"' class='calendar_end_limit_indicator'><div class='ImgArrowMoreDown'></div></div>");
   
       //html.append("<div id='"+this._curTimeIndicatorGridDivId+"' name='_curTimeIndicatorGridDivId' class='calendar_cur_time_indicator_strip' style='position:absolute;background-color:#F16426; height: 1px;'></div>");
      html.append("</div>");
   
       // all day headings
       // Fix for bug: 66603. Separating merge/split button from tab container
       html.append("<div id='", this._toggleBtnContainerId, "' name='_toggleBtnContainerId' style='position:absolute;bottom:0px;'></div>");
       // Fix for bug: 66603. Hide the overflow
      html.append("<div id='", this._tabsContainerDivId, "' name='_tabsContainerDivId' style='position:absolute;height:45px;bottom:0px;overflow-y:hidden;'>");
      //html.append("<div id='", this._allDayHeadingDivId, "' name='_allDayHeadingDivId' style='", headerStyle,	"'></div>");
      html.append("</div>");
       // end of all day headings
   
   
      this.getHtmlElement().innerHTML = html.toString();
       func = AjxCallback.simpleClosure(ZmCalColView.__onScroll, ZmCalColView, this);
      document.getElementById(this._bodyDivId).onscroll = func;
      document.getElementById(this._allDayApptScrollDivId).onscroll = func;
       // Fix for bug: 66603. Attaching a scroll function.
       document.getElementById(this._tabsContainerDivId).onscroll = func;
   
      ids = [this._apptBodyDivId, this._bodyHourDivId, this._allDayDivId, this._allDaySepDivId];
      types = [ZmCalBaseView.TYPE_APPTS_DAYGRID, ZmCalBaseView.TYPE_HOURS_COL, ZmCalBaseView.TYPE_ALL_DAY, ZmCalBaseView.TYPE_DAY_SEP];
      for (i = 0; i < ids.length; i++) {
         this.associateItemWithElement(null, document.getElementById(ids[i]), types[i], ids[i]);
      }
      this._scrollToTime(8);
   };
}
} catch (err) { console.log('calpatch err'+err);}
}

