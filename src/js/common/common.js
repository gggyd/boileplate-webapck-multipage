'use strict';

var popPanelTpl = require("../../tpls/popPanel.hbs"),
    tipsPanelTpl = require("../../tpls/tipsPanel.hbs")
    ;

module.exports = (function() {
  var config = {
    domain: {
      api: 'http://testsdkserver.domestore.cn'
    }
  }

  var ajaxHelp = function (url, type, data, callback, status) {
    var me = this;
    $.ajax({
        url: url,
        type: type,
        data: data,
        dataType: 'json',
        success: function (d) {
            var responseCode = parseInt(d.responseCode);
            if(responseCode === 1000){
                callback(d, true);
            } else if (responseCode === 1004){
                window.location.href='login.html?' + location.href;
            } else {
                if (!status) {
                    me.tipsAlert(null, d.errorMsg, 'tips-panel', 'info', null, null, tipsPanelTpl);
                } else {
                    callback(d, true);
                }
            }
        },
        error: function (e) {
            me.tipsAlert(null, '系统异常，请刷新重试!', 'tips-panel', 'fail', null, null, tipsPanelTpl);
        }
    })
  }


  var tipsAlert = function (title, html, tplId, tipType, btns, callback, tplFun) {
    var obj = {
    title: title || '温馨提示',
    tipType: tipType || 'info',
    html: html,
    btns: btns
    };

    var open = function () {
    var html= tplFun(obj), 
        tipEl = '.util-tips-box';

    if($(tipEl).length > 0){
        $(tipEl).remove();
    }

    $(html).find('.close').on('click', function () {
        $(this).parents(tipEl).remove();
        if(callback && tplId != 'tips-warning-alert'){
            callback();
        }
    }).end().find('.util-submit').on('click', function () {
        $(this).parents(tipEl).remove();
        callback();
    }).end().find('.util-cencer').on('click', function () {
        $(this).parents(tipEl).remove();
    }).end().appendTo('body');
    };

    open();
  }

  var getQueryString = function(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)","i");
    var r = window.location.search.substr(1).match(reg);
    if (r!=null) return (decodeURIComponent(r[2])); return null;
  }

  return {
    config: config,
    ajaxHelp: ajaxHelp,
    tipsAlert: tipsAlert,
    getQueryString: getQueryString
  }
}());