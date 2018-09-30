/**
 * @constructor 提示框类
 * @param {WMap} map Wmap对象
 * @param {any} opts 参数配置项， 如果为openlayers则为ol.Overlay.popup的配置项，如果为baidu，则是BMapLib.InfoBox的配置项
 */
function WOverlay(map, opts) {
  this.map = map.getMap();
  this.mapType = map.getMapType();

  if ('openlayers' === this.mapType) {
    var infoBox = new ol.Overlay.Popup(opts || {
      popupClass: "black", //"tooltips", "warning" "black" "default", "tips", "shadow",
      closeBox: true,
      positioning: 'auto', //Overlay position: 'bottom-left', 'bottom-center', 'bottom-right', 'center-left', 'center-center', 'center-right', 'top-left', 'top-center', 'top-right'
    });
    this.map.addOverlay(infoBox);
    this.infoBox = infoBox;
  } else if ('baidu' === this.mapType) {
    var infoBox = new BMapLib.InfoBox(this.map, "", opts || {
      boxClass: "b-popup",
      boxStyle: {
        width: "100px",
        backgroundColor: "white"
      },
      offset: new BMap.Size(0, 35),
      closeIconMargin: "1px 1px 0 0",
      closeIconUrl: "../img/bd_close.png",
      enableAutoPan: true,
      align: INFOBOX_AT_TOP
    });
    this.infoBox = infoBox;
  }
}
WOverlay.prototype = {
  /**
   * 返回弹框实例
   * @returns baidu: BMapLib.InfoBox || openlayers: ol.Overlay.Popup
   */
  getInfoBox: function () {
    return this.infoBox;
  },
  /**
   * 返回地图类型
   * @returns {String} "baidu" || "openlayers"
   */
  getMapType: function () {
    return this.mapType;
  },
  /**
   * 显示提示框
   * @param {Array.<Number>} coordinates 显示提示框的位置
   * @param {String} contentHtml 显示的内容
   */
  show: function (coordinates, contentHtml) {
    var mapType = this.mapType,
      infoBox = this.infoBox;
    if ('openlayers' === mapType) {
      infoBox.show(coordinates, contentHtml);
    } else if ('baidu' === mapType) {
      infoBox.open(new BMap.Point(coordinates[0], coordinates[1]));
      infoBox.setContent(contentHtml);
    }
  },
  /**
   * 关闭弹窗实例
   */
  hide: function () {
    var mapType = this.mapType;
    if ('openlayers' === mapType) {
      this.infoBox.hide();
    } else if ('baidu' === mapType) {
      this.infoBox.close();
    }
  }
}