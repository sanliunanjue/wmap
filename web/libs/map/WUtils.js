
/**
 * 工具类，辅助开发
 * @param {any} map 
 */
function WUtils(map) {
  this.mapType = map.getMapType();
  this.map = map;
}
WUtils.prototype = {
  constructor: WUtils,
  /**
   * 判断图层内哪些点在圆内，设置对这些点的响应函数
   * @param {any} circle 圆
   * @param {WLayer} layers 图层
   * @param {any} callback 圆内点的响应函数
   */
  forFeaturesInCircle: function (circle, layers, callback) {
    var mapType = this.mapType,
      allFeatures = [],
      _this = this;
    if ('openlayers' === mapType) {
      var wgs84Sphere = new ol.Sphere(6378137),
        radius = circle.getGeometry().getRadius(),
        centerCoordinates = circle.getGeometry().getCenter();

      _.each(layers, function (value) {
        var layer = value.getLayer();
        var features = layer.getSource().getFeaturesInExtent(circle.getGeometry().getExtent());
        features = _.filter(features, function (feature) {
          //根据点和圆中心的距离是否大于半径判断点是否在圆内，算法待优化
          var coordinates = feature.getGeometry().getCoordinates ? feature.getGeometry().getCoordinates() : false;
          coordinates = (coordinates && !coordinates.length) ? false : coordinates;
          var distance = wgs84Sphere.haversineDistance(
            ol.proj.transform(coordinates, 'EPSG:3857', 'EPSG:4326'),
            ol.proj.transform(centerCoordinates, 'EPSG:3857', 'EPSG:4326')
          );
          var isFeatureInCircle = ( distance <= radius );
          return isFeatureInCircle;
        })
        allFeatures = allFeatures.concat(features);
      })
      callback(allFeatures);
    } else if ('baidu' === mapType) {
      _.each(layers, function (value) {
        var features = value.getFeatures();
        allFeatures = allFeatures.concat(features);
      })
      //用以下方法可以对feature进行筛选 
      var rightFeatures = _.filter(allFeatures, function (num) {
        var isPointInCircle = num.getPosition && BMapLib.GeoUtils.isPointInCircle(num.getPosition(), circle);
        return isPointInCircle;
      })
      callback(rightFeatures);
    }
  },
  forFeaturesInRectangle: function (rectangle, layers, callback) {
    var mapType = this.mapType,
      allFeatures = [],
      _this = this;
    if ('openlayers' === mapType) {
      _.each(layers, function (value) {
        var layer = value.getLayer();
        var features = layer.getSource().getFeaturesInExtent(rectangle.getGeometry().getExtent());
        allFeatures = allFeatures.concat(features);
      })
      callback(allFeatures);
    } else if ('baidu' === mapType) {
      _.each(layers, function (value) {
        var features = value.getFeatures();
        allFeatures = allFeatures.concat(features);
      })
      //用以下方法可以对feature进行筛选 
      var rightFeatures = _.filter(allFeatures, function (num) {
        if (num.getPosition) {
          var isPointInCircle = num.getPosition && BMapLib.GeoUtils.isPointInPolygon(num.getPosition(), rectangle);
          return isPointInCircle;
        }
      })
      callback(rightFeatures);
    }
  },
  getCircleRadius: function (circle) {
    var mapType = this.mapType;
    if('openlayers' === mapType){
      var wgs84Sphere = new ol.Sphere(6378137);
      var center = circle.getGeometry().getCenter();
      var circleExtent = circle.getGeometry().getExtent();
      var circleRight = [circleExtent[2], center[1]];
      var radiusInMeter = wgs84Sphere.haversineDistance(center, circleRight);
      return radiusInMeter;

    }
    else if('baidu' === mapType){
        return circle.getRadius();
    }
  },
  enableEditing: function (features) {
    var mapType = this.mapType;
    if ('openlayers' === mapType) {
      this.map.getMap().removeInteraction(this.modify);
      var modify = new ol.interaction.Transform({
        features: features
      });
      this.modify = modify;
      this.map.getMap().addInteraction(modify);
    } else if ('baidu' === mapType) {
      _.each(features, function (value) {
        value.enableEditing ? value.enableEditing() : value.enableDragging()
      })
    }
  },
  disableEditing: function (features) {
    var mapType = this.mapType;
    if ('openlayers' === mapType) {
      this.map.getMap().removeInteraction(this.modify);
      this.modify = {};
    } else if ('baidu' === mapType) {
      _.each(features, function (value) {
        value.disableEditing ? value.disableEditing() : value.disableDragging()
      })
    }
  },
  enableDragging: function (features, dragingCallback, dragendCallback) {
    var mapType = this.mapType;
    if ('openlayers' === mapType) {
      this.map.getMap().removeInteraction(this.modify);
      var modify = new ol.interaction.Transform({
        features: features
      });
      modify.on("translating", dragingCallback);
      modify.on("translateend", dragendCallback);
      this.modify = modify;
      this.map.getMap().addInteraction(modify);
    } else if ('baidu' === mapType) {
      _.each(features, function (value) {
        if(value.enableDragging){
          value.enableEditing();
          value.addEventListener("dragging", dragingCallback);
          value.addEventListener("dragend", dragendCallback);
        }
      })
    }
  },
  disableTransform: function (features) {
    var mapType = this.mapType;
    if ('openlayers' === mapType) {
      this.map.getMap().removeInteraction(this.modify);
      this.modify = {};
    } else if ('baidu' === mapType) {
      _.each(features, function (value) {
        if(value.disableEditing){
          value.disableEditing();
        }
        if(value.disableDragging){
          value.disableDragging();
        }
      })
    }
  }
}