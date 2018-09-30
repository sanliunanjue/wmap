
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