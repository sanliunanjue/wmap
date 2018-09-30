function WDrawingManager(map, layer, opts) {
  this.map = map;
  this.mapType = map.getMapType();
  this.curDrawingType = "";
  this.openlayerDrawingJson = {};
  this.status = false;
  this.layer = layer;

  if ('openlayers' === this.mapType) {
    var marker = new ol.interaction.Draw({
      source: layer.getLayer().getSource(),
      type: "Point"
    });
    marker.setActive(false);

    var circle = new ol.interaction.Draw({
      source: layer.getLayer().getSource(),
      type: "Circle"
    });
    circle.setActive(false);

    var polyline = new ol.interaction.Draw({
      source: layer.getLayer().getSource(),
      type: "LineString"
    });
    polyline.setActive(false);

    var polygon = new ol.interaction.Draw({
      source: layer.getLayer().getSource(),
      type: "Polygon"
    });
    polygon.setActive(false);

    var rectangle = new ol.interaction.DrawRegular({
      source: layer.getLayer().getSource(),
      sides: 4,
      canRotate: false
    });
    rectangle.setActive(false);
    this.openlayerDrawingJson = {
      "DRAWING_MARKER": marker,
      "DRAWING_CIRCLE": circle,
      "DRAWING_POLYLINE": polyline,
      "DRAWING_POLYGON": polygon,
      "DRAWING_RECTANGLE": rectangle
    }

  } else if ('baidu' === this.mapType) {
    var drawingManager = new BMapLib.DrawingManager(map.getMap(), {
      isOpen: false
    });
    this.drawingManager = drawingManager;
    drawingManager.addEventListener("overlaycomplete", function (e) {
      layer.addDrawendFeature(e.overlay);
    })
  }
}
WDrawingManager.prototype = {
  constructor: WDrawingManager,
  /**
   * 获取绘制工具
   * @returns 如果是百度，返回BMapLib.DrawingManager的实例，
   */
  getDrawingManager: function () {
    return this.drawingManager;
  },
  getMapType: function () {
    return this.mapType;
  },
  getMap: function () {
    return this.map.getMap();
  },
  setDrawingMode: function (DrawingType, callback) {
    //todo 设置当前绘制模式
    var mapType = this.mapType,
      _this = this;
    _this.curDrawingType = DrawingType;
    if ('openlayers' === mapType) {
      $.each(_this.openlayerDrawingJson, function (key, value) {
        _this.map.getMap().removeInteraction(value);
      })
      var drawingIns = _this.openlayerDrawingJson[DrawingType];
      _this.map.getMap().addInteraction(drawingIns);
      drawingIns.on("drawend", callback);
    } else if ('baidu' === mapType) {
      switch (DrawingType) {
        case 'DRAWING_MARKER':
          this.drawingManager.setDrawingMode(BMAP_DRAWING_MARKER);
          //百度事件监听不会做去重处理，callback添加几次，百度都会重复监听，所以WDrawingManager在这里做了去重处理
          if(!_this.drawingManager.__listeners["onmarkercomplete"] || _.values(_this.drawingManager.__listeners["onmarkercomplete"]).indexOf(callback) < 0){
            _this.drawingManager.addEventListener("markercomplete", callback);
          }
          break;
        case 'DRAWING_CIRCLE':
          this.drawingManager.setDrawingMode(BMAP_DRAWING_CIRCLE);
          if(!_this.drawingManager.__listeners["oncirclecomplete"] || _.values(_this.drawingManager.__listeners["onmarkercomplete"]).indexOf(callback) < 0){
            _this.drawingManager.addEventListener("circlecomplete", callback);
          }
          break;
        case 'DRAWING_POLYLINE':
          this.drawingManager.setDrawingMode(BMAP_DRAWING_POLYLINE);
          if(!_this.drawingManager.__listeners["onpolylinecomplete"] || _.values(_this.drawingManager.__listeners["onmarkercomplete"]).indexOf(callback) < 0){
            _this.drawingManager.addEventListener("polylinecomplete", callback);
          }
          break;
        case 'DRAWING_POLYGON':
          this.drawingManager.setDrawingMode(BMAP_DRAWING_POLYGON);
          if(!_this.drawingManager.__listeners["onpolygoncomplete"] || _.values(_this.drawingManager.__listeners["onmarkercomplete"]).indexOf(callback) < 0){
            _this.drawingManager.addEventListener("polygoncomplete", callback);
          }
          break;
        case 'DRAWING_RECTANGLE':
          this.drawingManager.setDrawingMode(BMAP_DRAWING_RECTANGLE);
          if(!_this.drawingManager.__listeners["onrectanglecomplete"] || _.values(_this.drawingManager.__listeners["onmarkercomplete"]).indexOf(callback) < 0){
            _this.drawingManager.addEventListener("rectanglecomplete", callback);
          }
          break;
        default:
          break;
      }
      if (_this.status) {
        _this.getDrawingManager().open
      }
    }
  },
  getDrawingMode: function () {
    //todo 获取当前的绘制模式
  },
  open: function () {
    //todo 开启地图的绘制模式
    var mapType = this.mapType,
      _this = this,
      DrawingType = _this.curDrawingType;
    this.status = true;
    if ('openlayers' === mapType) {
      if (DrawingType) {
        _this.openlayerDrawingJson[DrawingType].setActive(true);
      }
    } else if ('baidu' === mapType) {
      this.drawingManager.open();
    }
  },
  close: function () {
    //关闭地图的绘制模式
    var mapType = this.mapType;
    this.status = false;
    if ('openlayers' === mapType) {
      $.each(this.openlayerDrawingJson, function (key, value) {
        value.setActive(false);
      })
      this.curDrawingType = "";
    } else if ('baidu' === mapType) {
      this.drawingManager.close();
    }
  }
}