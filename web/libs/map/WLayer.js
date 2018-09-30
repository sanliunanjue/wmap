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