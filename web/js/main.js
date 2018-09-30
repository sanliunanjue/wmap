    //WMap.map 地图模块
    var map1 = new WMap("map_container", "openlayers");
    map1.setCenter(120, 30, 14);

    var map2 = new WMap("map_container1", "baidu");
    map2.setCenter(120, 30, 14);

    //WMap.layer 图层模块
    var layer1 = new WLayer("layer1", "openlayers");
    var layer2 = new WLayer("layer2", "baidu");
    var layer3 = new WLayer("layer2", "baidu");
    var layer4 = new WLayer("layer2", "baidu");

    //WMap.feature 覆盖物模块
    var feature11 = new WFeature("openlayers").Point([120, 30.01]);
    var feature12 = new WFeature("openlayers").Point([120, 30.02]);
    var feature13 = new WFeature("openlayers").Point([120, 30.03]);
    var feature21 = new WFeature("baidu").Point([120, 30.01]);
    var feature22 = new WFeature("baidu").Point([120, 30.02]);
    var feature23 = new WFeature("baidu").Point([120, 30.03]);

    //WOverlay 弹框层模块
    var infoBox1 = new WOverlay(map1);
    var infoBox2 = new WOverlay(map2);

    //将图层和feature添加到地图上
    map1.addLayer(layer1);
    map2.addLayer(layer2);
    map2.addLayer(layer3);
    map2.addLayer(layer4);
    layer1.addFeature(feature11);
    layer1.addFeature(feature12);
    layer1.addFeature(feature13);
    layer2.addFeature(feature21);
    layer3.addFeature(feature22);
    layer4.addFeature(feature23);

    map1.addInteraction("hover", [layer1], function (e) {
        if ("enter" === e.type) {
            // alert("enter  " + e.coordinate.join(",  "));
            infoBox1.show(e.feature.getGeometry().getCoordinates(), e.feature.getGeometry().getCoordinates().join(","));
        } else if ("leave" === e.type) {
            // alert("leave  " + e.coordinate.join(","));
            infoBox1.hide();
        }
    });
    map2.addInteraction("click", [layer2, layer3], function (e) {
        // alert(JSON.stringify(e.target.getPosition()));
        var coordinate = e.target.getPosition();
        coordinate = [coordinate.lng, coordinate.lat];
        infoBox2.show(coordinate, coordinate.join(","));

    });
    map2.addInteraction("hover", [layer4], function (e) {
        if ("onmouseover" === e.type) {
            var coordinate = e.target.getPosition();
            coordinate = [coordinate.lng, coordinate.lat];
            infoBox2.show(coordinate, coordinate.join(","));
        } else if ("onmouseout" === e.type) {
            infoBox2.hide();
        }
    });

    // map1.removeLayer(layer1);