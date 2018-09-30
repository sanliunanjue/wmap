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