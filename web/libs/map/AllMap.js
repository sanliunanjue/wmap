/**
 * 创建WMap对象(使用组合模式)
 * @author weixiquan@cetiti.com
 * @date 2018-4-26
 */
'use strict';

/**
 * WMap层，用来控制地图本身的相关操作，如zoom，center等，也可以控制layer的增删改。
 * 注意：地图交互放在这一层控制。
 * 注意: WMap层不会控制feature的增删改查，feature统一由layer层控制。
 * @param containerId{String} 地图容器domId
 * @param mapType{String}  "baidu" || "openlayers"
 * @constructor
 */
function WMap(containerId, mapType) {
    var map;
    this.containerId = containerId;
    this.mapType = mapType;
    this.layers = new Set();

    //按照给定类型初始化地图
    if ('baidu' === mapType) {
        map = new BMap.Map(containerId, {
            enableMapClick: false
        });
        map.enableScrollWheelZoom(true);
    }
    if ('openlayers' === mapType) {
        map = new ol.Map({
            interactions: ol.interaction.defaults({
                altShiftDragRotate: true, //alt+shift+左键可以让地图旋转
                shiftDragZoom: true
            }),
            controls: ol.control.defaults({
                attribution: false,
                rotate: false,
                zoom: false
            }),
            target: containerId,
            view: new ol.View({
                projection: "EPSG:4326"
            }),
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.BaiduMap()
                })
            ]
        });
        /*鼠标样式设置*/
        var target = map.getTarget();
        var domTarget = typeof target === "string" ? document.getElementById(target) : target;
        domTarget.style.cursor = 'pointer';
    }
    this.map = map;
}
WMap.prototype = {
    constructor: WMap,
    /**
     * 返回地图实例
     * @returns {*} openlayers返回ol.Map， 百度地图返回: BMap.map
     */
    getMap: function () {
        return this.map;
    },
    /**
     * 返回地图类别
     * @returns {String} "baidu" || "openlayers"
     */
    getMapType: function () {
        return this.mapType;
    },
    /**
     * 设置地图的中心点
     * @param longtitude{Number} 经度坐标
     * @param latidute{Number} 纬度坐标
     * @param zoom{Number} 非必填，地图缩放级别
     */
    setCenter: function (longtitude, latidute, zoom) {
        var map = this.getMap();
        var mapType = this.mapType;
        zoom = parseInt(zoom);
        if ('openlayers' === mapType) {
            var view = map.getView();
            view.setCenter([longtitude, latidute]);
            if (zoom) {
                view.setZoom(zoom);
            }
        } else if ('baidu' === mapType) {
            var curZoom = map.getZoom();
            curZoom = zoom || curZoom;
            map.centerAndZoom(new BMap.Point(longtitude, latidute), curZoom); //curZoom必填
        }
    },
    /**
     * 设置openlayers底图
     */
    setBaseLayer: function () {
        //todo 设置openlayers的底图
    },
    /**
     * 添加图层
     * @param layer{WLayer} WLayer图层
     */
    addLayer: function (layer) {
        var mapType = this.mapType,
            map = this.map;
        if ('openlayers' === mapType) {
            layer.map = this;
            map.addLayer(layer.getLayer());
            this.layers.add(layer);
        } else if ('baidu' === mapType) {
            //WMap的逻辑是先WMap.add(layer),然WLayer.addFeature(feature).即和openalyer一样，将feature的控制权交给Layer层.WMap层不再关注feature的操作。
            layer.map = this;
            this.layers.add(layer);
        }
    },
    /**
     * 返回地图中所有的layers
     * @returns {*} openlayers返回的是{ol.Collection.<ol.layer.Base>} ;百度返回的是{Array.<WLayer>}对象
     */
    getLayers: function () {
        return this.layers.show();
    },
    /**
     * 通过名字查找图层
     * @param {String} name 
     * @returns {WLyer} 
     */
    getLayerByName: function (name) {
        var mapType = this.mapType;
        var layers = this.layers.show();
        var layer = $.grep(layers, function (n, i) {
            return name === n.name;
        })
        return layer;
    },
    /**
     * 删除图层
     * openlayer可直接删除图层，
     * baidu需要对清理图层里面的feature，然后删除地图关联的layer
     * @param layer{WLayer} 要删除的图层
     */
    removeLayer: function (layer) {
        var mapType = this.mapType,
            map = this.map;
        if ('openlayers' === mapType) {
            map.removeLayer(layer.getLayer());
        } else if ('baidu' === mapType) {
            this.layers.remove(layer);
            layer.clear();
        }
    },
    /**
     * 地图交互，先实现简单的悬浮和点击事件
     * @param type{String} "click" || "hover"
     * @param layers{WLayer} 监听交互的图层
     * @param callback{Function} 交互事件完成后的回调函数
     */
    addInteraction: function (type, layers, callback) {
        var mapType = this.mapType,
            map = this.map;
        var orglayers = $.map(layers, function (layer) {
            return layer.getLayer();
        });
        if ('openlayers' === mapType) {
            var interaction;
            switch (type) {
                case "click":
                    interaction = new ol.interaction.Select({
                        layers: orglayers,
                        wrapX: false
                    });
                    interaction.on("select", callback);
                    break;
                case "hover":
                    interaction = new ol.interaction.Hover({
                        cursor: "pointer",
                        layerFilter: function (l) {
                            return orglayers.indexOf(l)>=0;
                        }
                    });
                    interaction.on("enter", callback);
                    interaction.on("leave", callback);
                    break;
                default:
                    break;
            }
            map.addInteraction(interaction);
        } else if ('baidu' === mapType) {
            var allFeatures = [];
            $.each(layers, function (key, value) {
                value.interactions[type] = callback;
                $.each(value.getFeatures(), function (id, feature) {
                    allFeatures.push(feature);
                })
            });
            switch (type) {
                case "click":
                    $.each(allFeatures, function (key, feature) {
                        feature.removeEventListener("click", callback);
                        feature.addEventListener("click", callback);
                    });
                    break;
                case "hover":
                    $.each(allFeatures, function (key, feature) {
                        feature.removeEventListener("mouseover", callback);
                        feature.removeEventListener("mouseout", callback);
                        feature.addEventListener("mouseover", callback);
                        feature.addEventListener("mouseout", callback);
                    });
                    break;
                default:
                    break;
            }
        }
    },
    /**
     * 对features添加交互
     * @param {String} type 交互类型
     * @param {Array.<feature>} features 交互的feature数组
     * @param {any} callback 回调函数
     */
    addFeaturesInteraction: function (type, features, callback) {
        var mapType = this.mapType,
            map = this.map;
        if ('openlayers' === mapType) {
            var interaction;
            switch (type) {
                case "click":
                    interaction = new ol.interaction.Select({
                        features: features,
                        wrapX: false
                    });
                    interaction.on("select", callback);
                    break;
                case "hover":
                    interaction = new ol.interaction.Hover({
                        cursor: "pointer",
                        featureFilter: function (f) {
                            return features.indexOf(f)>=0;
                        }
                    });
                    interaction.on("enter", callback);
                    interaction.on("leave", callback);
                    break;
                default:
                    break;
            }
            map.addInteraction(interaction);
        } else if ('baidu' === mapType) {
            switch (type) {
                case "click":
                    $.each(features, function (key, feature) {
                        feature.removeEventListener("click", callback);
                        feature.addEventListener("click", callback);
                    });
                    break;
                case "hover":
                    $.each(features, function (key, feature) {
                        feature.removeEventListener("mouseover", callback);
                        feature.removeEventListener("mouseout", callback);
                        feature.addEventListener("mouseover", callback);
                        feature.addEventListener("mouseout", callback);
                    });
                    break;
                default:
                    break;
            }
        }
    },
    /**
     * 地图缩放监听事件
     * @param callback
     */
    zoomEnd: function (callback) {
        var mapType = this.mapType,
            map = this.map;
        if ('openlayers' === mapType) {
            /*
                openlayers的zoom变化为非离散变化,即小数变化，如果需要整数变化，可以在callback中做如下处理:
                function callback(e){
                    var view = e.target;
                    zoom = view.getZoom();
                    var zoomInt = parseInt(zoom);
                    var flag = zoom-zoomInt;
                    if(!flag){
                        doSomething();
                    }
                }
             */
            map.getView().on('change:resolution', callback)
        } else if ('baidu' === mapType) {
            map.addEventListener('zoomend', callback);
        }
    }
};
/**
 * 图层类，所有的feature控制都放置在layer层进行处理
 * 对于openlayers来说，WLayer.getLayer()获得的是 ol.layer.Vector, 可以用这个layer实例进行feature的控制。
 * 对于baidu地图来说, WLayer的get_layer()获得的是WLayer实例，这个实例相当于一个feature的集合，在集合里面控制feature的增删改查。
 * @param name{String} 图层名字
 * @param mapType{String} 地图类型： baidu \\ openlayers
 * @constructor
 */
function WLayer(name, mapType) {
  this.name = name;
  this.features = new Set();
  this.mapType = mapType;
  this.interactions = {};
  var layer;
  if ('openlayers' === mapType) {
      layer = new ol.layer.Vector({
          source: new ol.source.Vector({
              wrapX: false
          }),
          name: name,
          type: 'vector'
      });
      this.layer = layer;
  }
}
WLayer.prototype = {
  constructor: WLayer,
  /**
   * 获取layer图层，openlayers返回ol.layer， 百度返回WLayer自身（类似集合）
   * @returns {*}
   */
  getLayer: function () {
      var mapType = this.mapType;
      if ('openlayers' === mapType) {
          return this.layer;
      } else if ('baidu' === mapType) {
          return this;
      }
  },
  /**
   * 获取layer层所在的地图，在WMap.addLayer(layer)的时候，会给layer注入map对象。
   */
  getMap: function () {
      return this.map;
  },
  /**
   * 获取地图类型，openlayer或者baidu
   * @returns {*}
   */
  getMapType: function () {
      return this.mapType;
  },
  /**
   * 获取图层名称
   * @returns {String} 图层名称
   */
  getName: function () {
      return this.name;
  },
  addDrawendFeature: function (overlay) {
      var mapType = this.mapType;
      if ('openlayers' === mapType) {
          return;
      } else if ('baidu' === mapType) {
          this.features.add(overlay);
      }
  },
  /**
   * 在layer层添加feature，openlayers本身就是在layer层控制feature，WMap将百度控制权从map层授权到了Layer层。
   * @param feature
   */
  addFeature: function (feature) {
      var mapType = this.mapType;
      if ('openlayers' === mapType) {
          if (this.features.add(feature)) {
              this.layer.getSource().addFeature(feature);
          }
      } else if ('baidu' === mapType) {
          var map = this.map;
          if (this.features.add(feature) && map) {
              map.getMap().addOverlay(feature);
          }
          //解决wmap添加interaction在wlayer添加feature之前时，无法给后添加的feature绑定事件的bug
          var _this = this;
          if (Object.keys(_this.interactions).length) {
              $.each(_this.interactions, function (key, value) {
                  _this.map.addInteraction(key, [_this], value);
              })
          }
      }
  },
  /**
   * 添加多个feature
   * @param features
   */
  addFeatures: function (features) {
      var mapType = this.mapType;
      if ('openlayers' === mapType) {
          this.layer.getSource().addFeatures(features);
      } else if ('baidu' === mapType) {
          var _this = this,
              map = _this.map.getMap(),
              featureSet = _this.features;
          $.each(features, function (key, value) {
              if (featureSet.add(value) && map) {
                  map.addOverlay(value);
              }
              //解决wmap添加interaction在wlayer添加feature之前时，无法给后添加的feature绑定事件的bug
              if (Object.keys(_this.interactions).length) {
                  $.each(_this.interactions, function (type, callbackValue) {
                      _this.map.addFeaturesInteraction(type, [feature], callbackValue);
                  })
              }
          })
      }
  },
  /**
   * 获取图层所有features
   * @returns {Set} 返回一个features的数组
   */
  getFeatures: function () {
      var mapType = this.mapType;
      if ('openlayers' === mapType) {
          return this.layer.getSource().getFeatures();
      } else if ('baidu' === mapType) {
          return this.features.show();
      }
  },
  /**
   * 删除某个feature
   * @param feature
   */
  removeFeature: function (feature) {
      var mapType = this.mapType;
      if ('openlayers' === mapType) {
          this.layer.getSource().removeFeature(feature);
      } else if ('baidu' === mapType) {
          this.features.remove(feature);
          this.map.getMap().removeOverlay(feature);
      }
  },
  /**
   * 删除多个features
   * @param features
   */
  removeFeatures: function (features) {
      var mapType = this.mapType;
      if ('openlayers' === mapType) {
          var layer = this.layer;
          $.each(features, function (key, value) {
              layer.getSource().removeFeature(value);
          })
      } else if ('baidu' === mapType) {
          var map = this.map.getMap(),
              featureSet = this.features;
          $.each(features, function (key, value) {
              if (featureSet.remove(value) && map) {
                  map.removeOverlay(value);
              }
          })
      }
  },
  /**
   * 隐藏图层
   */
  hide: function () {
      var mapType = this.mapType,
          layer = this.layer;
      if ('openlayers' === mapType) {
          this.getLayer().setVisible(false);
      } else if ('baidu' === mapType) {
          $.each(this.features.show(), function (key, value) {
              value.hide();
          })
      }
  },
  /**
   * 显示图层
   */
  show: function () {
      var mapType = this.mapType,
          layer = this.layer;
      if ('openlayers' === mapType) {
          this.getLayer().setVisible(true);
      } else if ('baidu' === mapType) {
          $.each(this.features.show(), function (key, value) {
              value.show();
          })
      }
  },
  /**
   * 清除所有features
   */
  clear: function () {
      var map = this.map.getMap();
      var mapType = this.mapType;
      if ('openlayers' === mapType) {
          this.layer.getSource().clear();
      } else if ('baidu' === mapType) {
          if (map) {
              $.each(this.features.show(), function (key, value) {
                  map.removeOverlay(value);
              })
          }
          this.features.clear();
      }
  }
};

/**
 * 覆盖物
 * @param {any} mapType 
 * @constructor
 */
function WFeature(mapType) {
  this.mapType = mapType;
}
WFeature.prototype = {
  /**
   * 返回地图类型
   * @returns {String} "baidu" || "openalyers"
   */
  getMapType: function () {
      return this.mapType;
  },
  /**
   * 地图默认点feature
   * @param {Array.<Number>} coordinates 坐标位置，如[120, 30]
   * @returns {*} feature openlayers为ol.Feature， baidu为BMap.Marker
   */
  Point: function (coordinates) {
      var feature,
          mapType = this.mapType;
      if ('openlayers' === mapType) {
          feature = new ol.Feature({
              geometry: new ol.geom.Point(coordinates)
          });
      } else if ('baidu' === mapType) {
          feature = new BMap.Marker(new BMap.Point(coordinates[0], coordinates[1]));
      }
      return feature;
  },
  /**
   * 图标feature
   * @param {Array.<Number>} coordinates 坐标位置，如[120, 30]
   * @param {String} url 图片的地址
   * @param {Array.<Number>} size 图片大，如[24, 24]
   * @param {Array.<Number>} anchor 图片相对于左上角的偏移（定位时，默认定位在图片的左上角,即coordinates实际在图片的左上角），单位为像素
   * @returns {any} feature openlayers为ol.Feature， baidu为BMap.Marker
   */
  Icon: function (coordinates, url, size, anchor) {
      var mapType = this.mapType;
      if ('openlayers' === mapType) {
          var icon = new ol.Feature({
              geometry: new ol.geom.Point(coordinates)
          });
          var iconStyle = new ol.style.Style({
              image: new ol.style.Icon({
                  src: url,
                  size: size,
                  anchor: anchor,
                  anchorXUnits: 'pixels',
                  anchorYUnits: 'pixels',
              })
          });
          icon.setStyle(iconStyle);
      } else if ('baidu' === mapType) {
          var bPoint = new BMap.Point(coordinates[0], coordinates[1]);
          var iconStyle = new BMap.Icon(url, new BMap.Size(size[0], size[1]), {
              anchor: new BMap.Size(anchor[0], anchor[1])
          });
          var icon = new BMap.Marker(bPoint, {
              icon: iconStyle
          });
      }
      return icon;
  },
  Polyline: function (coordiantes, strokeColor, strokeWeight) {
      var mapType = this.mapType;
      if ('openlayers' === mapType) {
          var polyline = new ol.Feature({
              geometry: new ol.geom.LineString(coordiantes)
          });
          polyline.setStyle(new ol.style.Style({
              stroke: new ol.style.Stroke({
                  color: strokeColor,
                  width: strokeWeight
              })
          }));
      } else if ('baidu' === mapType) {
          var bcoordinates = $.map(coordiantes, function (value) {
              return new BMap.Point(value[0], value[1]);
          })
          var polyline = new BMap.Polyline(bcoordinates, {
              strokeColor: strokeColor,
              strokeWeight: strokeWeight
          })
      }
      return polyline;
  },
  Rectangle: function (LTCoordiantes, RBCoordinates, strokeColor, strokeWeight, fillColor) {
      var mapType = this.mapType,
          RTCoordinates = [RBCoordinates[0], LTCoordiantes[1]],
          LBCoordinates = [LTCoordiantes[0], RBCoordinates[1]],
          coordiantes = [LTCoordiantes, RTCoordinates, RBCoordinates, LBCoordinates];
      if ('openlayers' === mapType) {
          var retangle = new ol.Feature({
              geometry: new ol.geom.Polygon([coordiantes])
          });
          retangle.setStyle(new ol.style.Style({
              fill: new ol.style.Fill({
                  color: fillColor
              }),
              stroke: new ol.style.Stroke({
                  color: strokeColor,
                  width: strokeWeight,
              })
          }));
      } else if ('baidu' === mapType) {
          var bcoordinates = $.map(coordiantes, function (value) {
              return new BMap.Point(value[0], value[1]);
          })
          var retangle = new BMap.Polygon(bcoordinates, {
              strokeColor: strokeColor,
              strokeWeight: strokeWeight,
              fillColor: fillColor
          })
      }
      return retangle;
  },
  Polygon: function (coordiantes, strokeColor, strokeWeight, fillColor) {
      var mapType = this.mapType;
      if ('openlayers' === mapType) {
          var polygon = new ol.Feature({
              geometry: new ol.geom.Polygon([coordiantes])
          });
          polygon.setStyle(new ol.style.Style({
              fill: new ol.style.Fill({
                  color: fillColor
              }),
              stroke: new ol.style.Stroke({
                  color: strokeColor,
                  width: strokeWeight,
              })
          }));
      } else if ('baidu' === mapType) {
          var bcoordinates = $.map(coordiantes, function (value) {
              return new BMap.Point(value[0], value[1]);
          })
          var polygon = new BMap.Polygon(bcoordinates, {
              strokeColor: strokeColor,
              strokeWeight: strokeWeight,
              fillColor: fillColor
          })
      }
      return polygon;
  },
  Circle: function (center, radius, strokeColor, strokeWeight, fillColor) {
      var mapType = this.mapType;
      if ('openlayers' === mapType) {
          var desCoordinates = this.get_lonlat_from_distance(center, 90, radius);
          var openlayersRadius = desCoordinates[0] - center[0]; //取圆最右边到圆心的距离作为圆的半径。
          var circle = new ol.Feature(new ol.geom.Circle(center, openlayersRadius));
          circle.setStyle(new ol.style.Style({
              fill: new ol.style.Fill({
                  color: fillColor
              }),
              stroke: new ol.style.Stroke({
                  color: strokeColor,
                  width: strokeWeight
              })
          }));
      } else if ('baidu' === mapType) {
          var bPoint = new BMap.Point(center[0], center[1]);
          var circle = new BMap.Circle(bPoint, radius, {
              strokeColor: strokeColor,
              strokeWeight: strokeWeight,
              fillColor: fillColor
          })
      }
      return circle;
  },
  TextIcon: function (coordinates, textOpts, url, size, anchor, opts) {
      var mapType = this.mapType,
          textIcon;
      if ('openlayers' === mapType) {
          textIcon = new ol.Feature({
              geometry: new ol.geom.Point(coordinates)
          });
          var textIconStyle = new ol.style.Style({
              image: new ol.style.Icon({
                  src: url,
                  size: size,
                  anchor: anchor,
                  anchorXUnits: 'pixels',
                  anchorYUnits: 'pixels',
              }),
              text: new ol.style.Text({
                  text: textOpts.text,
                  font: textOpts.font,
                  offsetY: textOpts.offsetY || 0,
                  offsetX: textOpts.offsetX || 0,
                  fill: new ol.style.Fill({
                      color: textOpts.color || "red"
                  }),
                  backgroundStroke: new ol.style.Stroke({
                      color: "black",
                      width: 1
                  })
              })
          });
          textIcon.setStyle(textIconStyle);
      } else if ('baidu' === mapType) {
          var label = new BMap.Label(textOpts.text, {
              offset: new BMap.Size(textOpts.offsetX || 0, textOpts.offsetY || 0)
          });
          label.setStyle({border: "solid 1px black", color: textOpts.color || "red", backgroundColor: "white"});
          textIcon = this.Icon(coordinates, url, size, anchor);
          textIcon.setLabel(label);
      }
      return textIcon;
  },
  /**
   * 根据传入的起始点经纬度(度)、角方向（度）和距离(米)计算目标点的经纬度(度)，brng为0的时候，是向上（北）的方向
   * @param lonlat{Array.<Number>} 坐标数组，如[120,30]
   * @param brng{Number} 角度，角度为0的时候是向上（北）的方向。
   * @param dist{Number} 距离
   * @returns {Array.<Number>}
   */
  get_lonlat_from_distance: function (lonlat, brng, dist) {
      var VincentyConstants = {
          a: 6378137,
          b: 6356752.3142,
          f: 1 / 298.257223563
      };
      var ct = VincentyConstants;
      var a = ct.a,
          b = ct.b,
          f = ct.f;

      var lon1 = lonlat[0];
      var lat1 = lonlat[1];

      var s = dist;
      var alpha1 = brng * Math.PI / 180.0;
      var sinAlpha1 = Math.sin(alpha1);
      var cosAlpha1 = Math.cos(alpha1);

      var tanU1 = (1 - f) * Math.tan(lat1 * Math.PI / 180.0);
      var cosU1 = 1 / Math.sqrt((1 + tanU1 * tanU1)),
          sinU1 = tanU1 * cosU1;
      var sigma1 = Math.atan2(tanU1, cosAlpha1);
      var sinAlpha = cosU1 * sinAlpha1;
      var cosSqAlpha = 1 - sinAlpha * sinAlpha;
      var uSq = cosSqAlpha * (a * a - b * b) / (b * b);
      var A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
      var B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));

      var sigma = s / (b * A),
          sigmaP = 2 * Math.PI;
      while (Math.abs(sigma - sigmaP) > 1e-12) {
          var cos2SigmaM = Math.cos(2 * sigma1 + sigma);
          var sinSigma = Math.sin(sigma);
          var cosSigma = Math.cos(sigma);
          var deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
              B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));
          sigmaP = sigma;
          sigma = s / (b * A) + deltaSigma;
      }

      var tmp = sinU1 * sinSigma - cosU1 * cosSigma * cosAlpha1;
      var lat2 = Math.atan2(sinU1 * cosSigma + cosU1 * sinSigma * cosAlpha1,
          (1 - f) * Math.sqrt(sinAlpha * sinAlpha + tmp * tmp));
      var lambda = Math.atan2(sinSigma * sinAlpha1, cosU1 * cosSigma - sinU1 * sinSigma * cosAlpha1);
      var C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
      var L = lambda - (1 - C) * f * sinAlpha *
          (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));

      var revAz = Math.atan2(sinAlpha, -tmp); // final bearing
      //return [120.27826680969, 30.872129577657];
      return [lon1 + (L * 180 / Math.PI), (lat2 * 180 / Math.PI)];
  }
};
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