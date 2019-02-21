/* eslint-disable */
/**
 * 创建WMap对象(使用组合模式)
 * @author weixiquan@cetiti.com
 * @date 2018-4-26
 */

/**
* 构造函数
* 基于数组存储数据
* @constructor
*/
function Set() {
    this.dataList = [];
}
Set.prototype = {
    /* 修正constructor */
    constructor: Set,
    /* 显示当前集合 */
    show: function () {
        return this.dataList;
    },
    /* 返回集合元素个数 */
    size: function () {
        return this.dataList.length;
    },
    /* 判断集合中是否存在某成员 */
    contains: function (data) {
        return this.dataList.indexOf(data) > -1 ? true : false;
    },
    /* 添加元素 */
    add: function (data) {
        if (!this.contains(data)) {
            // 不存在,插入元素,并返回true
            this.dataList.push(data);
            return true;
        }
        // 存在,返回false
        return false;
    },
    /* 删除元素 */
    remove: function (data) {
        var index = this.dataList.indexOf(data);
        if (index > -1) {
            // 存在当前数据,则删除并返回true
            this.dataList.splice(index, 1);
            return true;
        }
        // 不存在返回false
        return false;
    },
    clear: function () {
        this.dataList = [];
    }
};

/**
 * WMap层，用来控制地图本身的相关操作，如zoom，center等，也可以控制layer的增删改。
 * 注意：地图交互放在这一层控制。
 * 注意: WMap层不会控制feature的增删改查，feature统一由layer层控制。
 * @param containerId{String} 地图容器domId
 * @param mapType{String}  "baidu" || "openlayers"
 * @constructor
 */
export function WMap(containerId, mapType, interactions, flag = false) {
    var map;
    this.containerId = containerId;
    this.mapType = mapType;
    this.layers = new Set();
    this.interactionsArray = new Set();

    //按照给定类型初始化地图
    if ('baidu' === mapType) {
        map = new BMap.Map(containerId, {
            enableMapClick: false
        });
        map.enableScrollWheelZoom(true);
    }
    if ('openlayers' === mapType) {
        var projection = ol.proj.get("EPSG:3857");
        var resolutions = [];
        for (var i = 0; i < 19; i++) {
            resolutions[i] = Math.pow(2, 18 - i);
        }
        var tilegrid = new ol.tilegrid.TileGrid({
            origin: [0, 0],
            resolutions: resolutions
        });

        var baidu_source = new ol.source.TileImage({
            projection: projection,
            tileGrid: tilegrid,
            tileUrlFunction: function (tileCoord, pixelRatio, proj) {
                if (!tileCoord) {
                    return "";
                }
                var z = tileCoord[0];
                var x = tileCoord[1];
                var y = tileCoord[2];

                if (x < 0) {
                    x = "M" + (-x);
                }
                if (y < 0) {
                    y = "M" + (-y);
                }
                var style = ""
                if (flag) {
                    style = "&styles=t%3Awater%7Ce%3Aall%7Cc%3A%23021019%2Ct%3Ahighway%7Ce%3Ag.f%7Cc%3A%23000000%2Ct%3Ahighway%7Ce%3Ag.s%7Cc%3A%23147a92%2Ct%3Aarterial%7Ce%3Ag.f%7Cc%3A%23000000%2Ct%3Aarterial%7Ce%3Ag.s%7Cc%3A%230b3d51%2Ct%3Alocal%7Ce%3Ag%7Cc%3A%23000000%2Ct%3Aland%7Ce%3Aall%7Cc%3A%2308304b%2Ct%3Arailway%7Ce%3Ag.f%7Cc%3A%23000000%2Ct%3Arailway%7Ce%3Ag.s%7Cc%3A%2308304b%2Ct%3Asubway%7Ce%3Ag%7Cl%3A-70%2Ct%3Abuilding%7Ce%3Ag.f%7Cc%3A%23000000%2Ct%3Aall%7Ce%3Al.t.f%7Cc%3A%23857f7f%2Ct%3Aall%7Ce%3Al.t.s%7Cc%3A%23000000%2Ct%3Abuilding%7Ce%3Ag%7Cc%3A%23022338%2Ct%3Agreen%7Ce%3Ag%7Cc%3A%23062032%2Ct%3Aboundary%7Ce%3Aall%7Cc%3A%231e1c1c%2Ct%3Amanmade%7Ce%3Ag%7Cc%3A%23022338%2Ct%3Apoi%7Ce%3Aall%7Cv%3Aoff%2Ct%3Aall%7Ce%3Al.i%7Cv%3Aoff%2Ct%3Aall%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%232da0c6"
                }
                return "http://api0.map.bdimg.com/customimage/tile?&x=" + x + "&y=" + y + "&z=" + z + "&udt=20181205&scale=1&ak=6xXKKxY1nBiItcyG9QVERbhpnBPpBeNK" + style;
            }
        });

        var baidu_layer = new ol.layer.Tile({
            source: baidu_source
        });

        map = new ol.Map({
            interactions: interactions || ol.interaction.defaults({
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
                projection: "EPSG:3857"
            }),
            layers: [
                baidu_layer
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
                    this.interactionsArray.add(interaction);
                    break;
                case "hover":
                    interaction = new ol.interaction.Hover({
                        cursor: "pointer",
                        layerFilter: function (l) {
                            return orglayers.indexOf(l) >= 0;
                        }
                    });
                    interaction.on("enter", callback);
                    interaction.on("leave", callback);
                    this.interactionsArray.add(interaction);
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
     * 获取当前地图已有的interactions数组
     */
    getInteractionsArray: function () {
        return this.interactionsArray.show()
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
                            return features.indexOf(f) >= 0;
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
     * 清除openlayer点击事件中的features. 修复当前选择图标无法再次点击以响应点击事件的bug
     */
    clearSelectFeatures: function () {
        var mapType = this.mapType,
            interactions = this.getInteractionsArray(),
            selectInteraction;
        if ('openlayers' === mapType) {
            if (interactions && interactions.length >= 0)
                selectInteraction = interactions.filter(function (item) {
                    return item instanceof ol.interaction.Select
                })
            selectInteraction[0] && selectInteraction[0].getFeatures().clear()
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
export function WLayer(name, mapType) {
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
export function WFeature(mapType) {
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

            var iconStyle = [
                new ol.style.Style({
                    image: new ol.style.Shadow({ radius: 15 }),
                    stroke: new ol.style.Stroke({ color: [0, 0, 0, 0.3], width: 2 }),
                    fill: new ol.style.Fill({ color: [0, 0, 0, 0.3] }),
                    zIndex: -1
                }),
                new ol.style.Style({
                    image: new ol.style.Icon({
                        src: url,
                        size: size,
                        anchor: anchor,
                        anchorXUnits: 'pixels',
                        anchorYUnits: 'pixels',
                    })
                })];
            iconStyle[1].getImage().getAnchor()[1] += 10;
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
            label.setStyle({ border: "solid 1px black", color: textOpts.color || "red", backgroundColor: "white" });
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
export function WOverlay(map, opts) {
    this.map = map.getMap();
    this.mapType = map.getMapType();

    if ('openlayers' === this.mapType) {
        var infoBox = new ol.Overlay.Popup(opts || {
            offset: [0, -18],
            popupClass: "black", //"tooltips", "warning" "black" "default", "tips", "shadow",
            closeBox: false,
            positioning: 'bottom-center', //Overlay position: 'bottom-left', 'bottom-center', 'bottom-right', 'center-left', 'center-center', 'center-right', 'top-left', 'top-center', 'top-right'
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
export function WDrawingManager(map, layer, opts) {
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
                    if (!_this.drawingManager.__listeners["onmarkercomplete"] || _.values(_this.drawingManager.__listeners["onmarkercomplete"]).indexOf(callback) < 0) {
                        _this.drawingManager.addEventListener("markercomplete", callback);
                    }
                    break;
                case 'DRAWING_CIRCLE':
                    this.drawingManager.setDrawingMode(BMAP_DRAWING_CIRCLE);
                    if (!_this.drawingManager.__listeners["oncirclecomplete"] || _.values(_this.drawingManager.__listeners["onmarkercomplete"]).indexOf(callback) < 0) {
                        _this.drawingManager.addEventListener("circlecomplete", callback);
                    }
                    break;
                case 'DRAWING_POLYLINE':
                    this.drawingManager.setDrawingMode(BMAP_DRAWING_POLYLINE);
                    if (!_this.drawingManager.__listeners["onpolylinecomplete"] || _.values(_this.drawingManager.__listeners["onmarkercomplete"]).indexOf(callback) < 0) {
                        _this.drawingManager.addEventListener("polylinecomplete", callback);
                    }
                    break;
                case 'DRAWING_POLYGON':
                    this.drawingManager.setDrawingMode(BMAP_DRAWING_POLYGON);
                    if (!_this.drawingManager.__listeners["onpolygoncomplete"] || _.values(_this.drawingManager.__listeners["onmarkercomplete"]).indexOf(callback) < 0) {
                        _this.drawingManager.addEventListener("polygoncomplete", callback);
                    }
                    break;
                case 'DRAWING_RECTANGLE':
                    this.drawingManager.setDrawingMode(BMAP_DRAWING_RECTANGLE);
                    if (!_this.drawingManager.__listeners["onrectanglecomplete"] || _.values(_this.drawingManager.__listeners["onmarkercomplete"]).indexOf(callback) < 0) {
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
export function WUtils(map) {
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
                    var isFeatureInCircle = (distance <= radius);
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
        if ('openlayers' === mapType) {
            var wgs84Sphere = new ol.Sphere(6378137);
            var center = circle.getGeometry().getCenter();
            var circleExtent = circle.getGeometry().getExtent();
            var circleRight = [circleExtent[2], center[1]];
            var radiusInMeter = wgs84Sphere.haversineDistance(center, circleRight);
            return radiusInMeter;

        }
        else if ('baidu' === mapType) {
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
                if (value.enableDragging) {
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
                if (value.disableEditing) {
                    value.disableEditing();
                }
                if (value.disableDragging) {
                    value.disableDragging();
                }
            })
        }
    }
}


// 坐标转换
/** @module transformUtils*/

/**
 * Created by fuchenen on 2017/7/19.
 */
var transformUtils = transformUtils || {};
(function (transformUtils) {
    // 定义一些常量
    var PI = 3.1415926535897932384626;
    var x_PI = 3.14159265358979324 * 3000.0 / 180.0;
    var a = 6378245.0;
    var ee = 0.00669342162296594323;
    // 高斯-克吕格6度分带
    var MCBAND = [12890594.86, 8362377.87, 5591021, 3481989.83,
        1678043.12, 0];//baidu墨卡托
    var LLBAND = [75, 60, 45, 30, 15, 0];//baidu经纬度
    //baidu墨卡托转baidu经纬度分带转换
    var MC2LL = [
        [1.410526172116255e-8, 0.00000898305509648872,
            -1.9939833816331, 200.9824383106796,
            -187.2403703815547, 91.6087516669843,
            -23.38765649603339, 2.57121317296198,
            -0.03801003308653, 17337981.2],
        [-7.435856389565537e-9, 0.000008983055097726239,
        -0.78625201886289, 96.32687599759846,
        -1.85204757529826, -59.36935905485877,
            47.40033549296737, -16.50741931063887,
            2.28786674699375, 10260144.86],
        [-3.030883460898826e-8, 0.00000898305509983578,
            0.30071316287616, 59.74293618442277,
            7.357984074871, -25.38371002664745,
            13.45380521110908, -3.29883767235584,
            0.32710905363475, 6856817.37],
        [-1.981981304930552e-8, 0.000008983055099779535,
            0.03278182852591, 40.31678527705744,
            0.65659298677277, -4.44255534477492,
            0.85341911805263, 0.12923347998204,
        -0.04625736007561, 4482777.06],
        [3.09191371068437e-9, 0.000008983055096812155,
            0.00006995724062, 23.10934304144901,
            -0.00023663490511, -0.6321817810242,
            -0.00663494467273, 0.03430082397953,
            -0.00466043876332, 2555164.4],
        [2.890871144776878e-9, 0.000008983055095805407,
            -3.068298e-8, 7.47137025468032,
            -0.00000353937994, -0.02145144861037,
            -0.00001234426596, 0.00010322952773,
            -0.00000323890364, 826088.5]];
    //baidu经纬度转baidu墨卡托分带转换
    var LL2MC = [
        [-0.0015702102444, 111320.7020616939,
            1704480524535203, -10338987376042340,
            26112667856603880, -35149669176653700,
            26595700718403920, -10725012454188240,
            1800819912950474, 82.5],
        [0.0008277824516172526, 111320.7020463578,
            647795574.6671607, -4082003173.641316,
            10774905663.51142, -15171875531.51559,
            12053065338.62167, -5124939663.577472,
            913311935.9512032, 67.5],
        [0.00337398766765, 111320.7020202162,
            4481351.045890365, -23393751.19931662,
            79682215.47186455, -115964993.2797253,
            97236711.15602145, -43661946.33752821,
            8477230.501135234, 52.5],
        [0.00220636496208, 111320.7020209128,
            51751.86112841131, 3796837.749470245,
            992013.7397791013, -1221952.21711287,
            1340652.697009075, -620943.6990984312,
            144416.9293806241, 37.5],
        [-0.0003441963504368392, 111320.7020576856,
            278.2353980772752, 2485758.690035394,
            6070.750963243378, 54821.18345352118,
            9540.606633304236, -2710.55326746645,
            1405.483844121726, 22.5],
        [-0.0003218135878613132, 111320.7020701615,
            0.00369383431289, 823725.6402795718,
            0.46104986909093, 2351.343141331292,
            1.58060784298199, 8.77738589078284,
            0.37238884252424, 7.45]];

    function transformlon(x, y) {
        var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(x * PI) + 40.0 * Math.sin(x / 3.0 * PI)) * 2.0 / 3.0;
        ret += (150.0 * Math.sin(x / 12.0 * PI) + 300.0 * Math.sin(x / 30.0 * PI)) * 2.0 / 3.0;
        return ret
    }

    function transformlat(x, y) {
        var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(y * PI) + 40.0 * Math.sin(y / 3.0 * PI)) * 2.0 / 3.0;
        ret += (160.0 * Math.sin(y / 12.0 * PI) + 320 * Math.sin(y * PI / 30.0)) * 2.0 / 3.0;
        return ret
    }

    function Point(lng, lat) {
        return new Array(lng, lat);
    }

    function convertor(point, ll2mc) {
        if (!point || !ll2mc) {
            return
        }
        // 经度的转换比较简单，一个简单的线性转换就可以了。
        // 0、1的数量级别是这样的-0.0015702102444, 111320.7020616939
        var x = ll2mc[0] + ll2mc[1] * Math.abs(point[0]);
        // 先计算一个线性关系，其中9的数量级是这样的：67.5，a的估值大约是一个个位数
        var a = Math.abs(point[1]) / ll2mc[9];
        // 纬度的转换相对比较复杂，y=b+ca+da^2+ea^3+fa^4+ga^5+ha^6
        // 其中，a是纬度的线性转换，而最终值则是一个六次方的多项式，2、3、4、5、6、7、8的数值大约是这样的：
        // 278.2353980772752, 2485758.690035394,
        // 6070.750963243378, 54821.18345352118,
        // 9540.606633304236, -2710.55326746645,
        // 1405.483844121726,
        // 这意味着纬度会变成一个很大的数，大到多少很难说
        var y = ll2mc[2] + ll2mc[3] * a + ll2mc[4] * a * a + ll2mc[5] * a
            * a * a + ll2mc[6] * a * a * a * a + ll2mc[7] * a
            * a * a * a * a + ll2mc[8] * a * a * a * a
            * a * a;
        // 整个计算是基于绝对值的，符号位最后补回去就行了
        x *= (point[0] < 0 ? -1 : 1);
        y *= (point[1] < 0 ? -1 : 1);
        // 产生一个新的点坐标。果然不一样了啊
        return Point(x, y)
    }

    function lngLatToMercator(T) {
        return convertLL2MC(T);
    }

    function mercatorToLngLat(T) {
        return convertMC2LL(T);
    }

    function getLoop(value, min, max) {
        while (value > max) {
            value -= max - min
        }
        while (value < min) {
            value += max - min
        }
        return value
    }

    function convertLL2MC(point) {
        var point1;
        var ll2mc;
        point[0] = getLoop(point[0], -180, 180);// 标准化到区间内
        point[1] = getLoop(point[1], -74, 74);// 标准化到区间内
        point1 = Point(point[0], point[1]);
        // 查找LLBAND的维度字典，字典由大到小排序，找到则停止
        for (var i = 0; i < LLBAND.length; i++) {
            if (point1[1] >= LLBAND[i]) {
                ll2mc = LL2MC[i];
                break;
            }
        }
        // 如果没有找到，则反过来找。找到即停止。
        if (!ll2mc) {
            for (var i = LLBAND.length - 1; i >= 0; i--) {
                if (point1[1] <= -LLBAND[i]) {
                    ll2mc = LL2MC[i];
                    break;
                }
            }
        }
        var newPoint = convertor(point, ll2mc);
        var point = Point(parseFloat(newPoint[0].toFixed(6)), parseFloat(newPoint[1].toFixed(6)));
        return point;
    }

    function convertMC2LL(point) {
        var point1;
        var mc2ll;
        point[0] = getLoop(point[0], -20037726.372307, 20037726.369172);// 标准化到区间内
        point[1] = getLoop(point[1], -11708041.658062, 12474104.174136);// 标准化到区间内
        point1 = Point(point[0], point[1]);
        // 查找LLBAND的维度字典，字典由大到小排序，找到则停止
        for (var i = 0; i < MCBAND.length; i++) {
            if (point1[1] >= MCBAND[i]) {
                mc2ll = MC2LL[i];
                break;
            }
        }
        // 如果没有找到，则反过来找。找到即停止。
        if (!mc2ll) {
            for (var i = MCBAND.length - 1; i >= 0; i--) {
                if (point1[1] <= -MCBAND[i]) {
                    mc2ll = MC2LL[i];
                    break;
                }
            }
        }
        var newPoint = convertor(point, mc2ll);
        var point = Point(newPoint[0].toFixed(6), newPoint[1].toFixed(6));
        return point;
    }

    /**
     * 判断是否在国内，不在国内则不做偏移
     * @param lon
     * @param lat
     * @returns {boolean}
     */
    function outOfChina(lon, lat) {
        return (lon < 72.004 || lon > 137.8347) || ((lat < 0.8293 || lat > 55.8271) || false);
    }

    /**
     * 84 to 火星坐标系 (GCJ-02) World Geodetic System ==> Mars Geodetic System
     * @param lon
     * @param lat
     * @returns {*[]}
     */
    transformUtils.WGS84_To_GCJ02 = function (lon, lat) {
        if (outOfChina(lon, lat)) {
            return [lon, lat]
        }
        var dlon = transformlon(lon - 105.0, lat - 35.0);
        var dlat = transformlat(lon - 105.0, lat - 35.0);
        var radlat = lat / 180.0 * PI;
        var magic = Math.sin(radlat);
        magic = 1 - ee * magic * magic;
        var sqrtmagic = Math.sqrt(magic);
        dlon = (dlon * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
        dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
        var mglng = Number(lon) + Number(dlon);
        var mglat = Number(lat) + Number(dlat);
        return [mglng, mglat]
    };

    /**
     * GCJ02 转换为 WGS84
     * @param lon
     * @param lat
     * @returns {*[]}
     */
    transformUtils.GCJ02_To_WGS84 = function (lon, lat) {
        if (outOfChina(lon, lat)) {
            return [lon, lat]
        }
        var dlon = transformlon(lon - 105.0, lat - 35.0);
        var dlat = transformlat(lon - 105.0, lat - 35.0);
        var radlat = lat / 180.0 * PI;
        var magic = Math.sin(radlat);
        magic = 1 - ee * magic * magic;
        var sqrtmagic = Math.sqrt(magic);
        dlon = (dlon * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
        dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
        var mglon = lon + dlon;
        var mglat = lat + dlat;
        return [lon * 2 - mglon, lat * 2 - mglat]
    };


    /**
     * 火星坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换
     * 即谷歌、高德 转 百度
     * @param lon
     * @param lat
     * @returns {*[]}
     */
    transformUtils.GCJ02_To_BD09 = function (lon, lat) {
        var z = Math.sqrt(lon * lon + lat * lat) + 0.00002 * Math.sin(lat * x_PI);
        var theta = Math.atan2(lat, lon) + 0.000003 * Math.cos(lon * x_PI);
        var bd_lng = z * Math.cos(theta) + 0.0065;
        var bd_lat = z * Math.sin(theta) + 0.006;
        return [bd_lng, bd_lat]
    };

    /**
     * 百度坐标系 (BD-09) 与 火星坐标系 (GCJ-02) 的转换
     * 即 百度 转 谷歌、高德
     * @param bd_lon
     * @param bd_lat
     * @returns {*[]}
     */
    transformUtils.BD09_To_GCJ02 = function (bd_lon, bd_lat) {
        var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
        var x = bd_lon - 0.0065;
        var y = bd_lat - 0.006;
        var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
        var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
        var gg_lng = z * Math.cos(theta);
        var gg_lat = z * Math.sin(theta);
        return [gg_lng, gg_lat]
    };

    /**
     * 将wgs84转为bd09
     *
     * @param lat
     * @param lon
     * @return
     */
    transformUtils.WGS84_To_BD09 = function (lon, lat) {
        var gcj02 = transformUtils.WGS84_To_GCJ02(lon, lat);
        var bd09 = transformUtils.GCJ02_To_BD09(gcj02[0], gcj02[1]);
        return bd09;
    };
    /**
     * 将bd09转为wgs84
     *
     * @param lat
     * @param lon
     * @return
     */
    transformUtils.BD09_To_WGS84 = function (lon, lat) {
        var gcj02 = transformUtils.BD09_To_GCJ02(lon, lat);
        var wgs84 = transformUtils.GCJ02_To_WGS84(gcj02[0], gcj02[1]);
        return wgs84;
    };
    /**
     * 超图投影转换
     * @param lon
     * @param lat
     */
    transformUtils.smLngLatToMercato = function (lon, lat) {
        var lonlat = { x: lon, y: lat };
        return SuperMap.Projection.transform(
            lonlat,
            new SuperMap.Projection("EPSG:4326"),
            new SuperMap.Projection("EPSG:3857")
        );
    };
    transformUtils.smMercatoToLngLat = function (x, y) {
        var point = { x: x, y: y };
        return SuperMap.Projection.transform(
            point,
            new SuperMap.Projection("EPSG:3857"),
            new SuperMap.Projection("EPSG:4326")

        );
    };
    /**
     * 通过百度API坐标转换接口转换，墨卡托=>经纬度
     * @param lon
     * @param lat
     */
    transformUtils.baiduCoordTransLonLat = function (lon, lat) {
        //百度地图容器
        $('body').append('<div id="baidu_container" style="margin: 0;padding: 0;height: 0;width: 0;"/>');
        var baiduMap = new BMap.Map('baidu_container');
        var convertor = new BMap.Convertor();
        var point = new BMap.Point(lon, lat);
        var points = [];
        points.push(point);
        convertor.translate(points, 6, 5, function (data) {
            if (data.status === 0) {
                console.log(data.points[0].lng + "," + data.points[0].lat);
                $('#baidu_container').remove();
            }
        })
    };
    /**
     * 通过百度API坐标转换接口转换，经纬度=>墨卡托
     * @param x
     * @param y
     */
    transformUtils.baiduCoordTransMi = function (x, y) {
        //百度地图容器
        $('body').append('<div id="baidu_container" style="margin: 0;padding: 0;height: 0;width: 0;"/>');
        var baiduMap = new BMap.Map('baidu_container');
        var convertor = new BMap.Convertor();
        var point = new BMap.Point(x, y);
        var points = [];
        points.push(point);
        convertor.translate(points, 5, 6, function (data) {
            if (data.status === 0) {
                console.log(data.points[0].lng + "," + data.points[0].lat);
                $('#baidu_container').remove();
            }
        })
    };
    /**
     * 百度墨卡托转百度经纬度坐标依赖百度API
     * @returns{lngLatPt}
     * @param x
     * @param y
     */
    transformUtils.baiduMercatoToLngLat = function (x, y) {
        //百度地图容器
        $('body').append('<div id="baidu_container" style="margin: 0;padding: 0;height: 0;width: 0;"/>');
        var baiduMap = new BMap.Map('baidu_container');
        // 通过 web mercato 坐标构建起点终点
        var ptXY = new BMap.Pixel(x, y);
        // 通过相应接口将起点终点的 web mercato 坐标转换为经纬度坐标
        var projection2 = baiduMap.getMapType().getProjection();
        var lngLatPt = projection2.pointToLngLat(ptXY);
        $('#baidu_container').remove();
        return [lngLatPt.lng, lngLatPt.lat];
    };

    /**
     * 百度经纬度坐标转百度墨卡托坐标依赖百度API
     * @param lon
     * @param lat
     * @returns{mercatoPt}
     */
    transformUtils.baiduLngLatToMercato = function (lon, lat) {
        //百度地图容器
        $('body').append('<div id="baidu_container" style="margin: 0;padding: 0;height: 0;width: 0;"/>');
        var baiduMap = new BMap.Map('baidu_container');
        var bdXY = new BMap.Point(lon, lat);
        var projection2 = baiduMap.getMapType().getProjection();
        var mercatoPt = projection2.lngLatToPoint(bdXY);
        $('#baidu_container').remove();
        return [mercatoPt.x, mercatoPt.y];
    };
    transformUtils.baiduMercatoToLngLatWithoutBaidu = function (x, y) {
        if (!y) {
            y = x[1];
            x = x[0]
        }
        var mercato = Point(x, y);
        var lngLat = mercatorToLngLat(mercato);
        return lngLat;
    };
    transformUtils.baiduLngLatToMercatoWithoutBaidu = function (lon, lat) {
        if (!lat) {
            lat = lon[1];
            lon = lon[0]
        }
        var lngLat = Point(lon, lat);
        var mercato = lngLatToMercator(lngLat);
        return mercato;
    };
    /**
     * 百度墨卡托坐标转WGS84坐标
     * @param x
     * @param y
     */
    transformUtils.baiduMercatorToWGS84LngLat = function (x, y) {
        if (!y) {
            y = x[1];
            x = x[0]
        }
        var bdLngLat = transformUtils.baiduMercatoToLngLatWithoutBaidu(x, y);
        var wgs84LngLat = transformUtils.BD09_To_WGS84(bdLngLat[0], bdLngLat[1]);
        return wgs84LngLat;
    };
    /**
     * WGS84坐标转百度墨卡托坐标
     * @param lon
     * @param lat
     * @returns {mercatoPt}
     * @constructor
     */
    transformUtils.WGS84ToBaiduMercator = function (lon, lat) {
        if (!lat) {
            lat = lon[1];
            lon = lon[0]
        }
        var bdLngLat = transformUtils.WGS84_To_BD09(lon, lat);
        //var baiduMercator = transformUtils.baiduLngLatToMercato(bdLngLat[0],bdLngLat[1]);
        var baiduMercator = transformUtils.baiduLngLatToMercatoWithoutBaidu(bdLngLat[0], bdLngLat[1]);
        return baiduMercator;
    }
}(transformUtils));
export { transformUtils }
