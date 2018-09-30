  //查询管理

  //圆查询
  function queryCircle(drawingManager) {
    drawingManager.setDrawingMode("DRAWING_CIRCLE", circleCallback);
  
    function circleCallback(e) {
      var circle = e.feature;
      var utils = new WUtils(map);
  
      //给圆右侧添加拖拽图标
      var center = circle.getGeometry().getCenter();
      var center1 = [center[0], center[1] + 0.01];
      var circleExtent = circle.getGeometry().getExtent();
      var circleRight = [circleExtent[2], center[1]];
      var circleRadius = utils.getCircleRadius(circle);
      var distance = circleRadius.toFixed(1);
      var output;
      if (distance > 1000) {
        output = (Math.round(distance / 1000 * 100) / 100) +
          ' ' + 'km';
      } else {
        output = (Math.round(distance * 100) / 100) +
          ' ' + 'm';
      }
      var dragIcon = wfeature.TextIcon(circleRight, {
        text: output + "",
        offsetX: 40,
        offsetY: 0
      }, "../../img/dragerIcon.png", [34, 20], [17, 10]);
      layerDrawing.addFeature(dragIcon);
  
      //圆右边的拖拽按钮事件
      utils.enableDragging([dragIcon], dragingCallback, dragendCallback);
  
  
      //找到在圆内的poi点
      utils.forFeaturesInCircle(circle, [layerHospital, layerCompany, layreSchool], circleFeaturesCallback);
      drawingManager.close();
  
      //拖拽过程中的处理 
      function dragingCallback(e) {
        //使得圆跟随拖拽按钮变化
        var iconCoordinates = e.feature.getGeometry().getCoordinates();
        var dragingRadius = Math.abs(iconCoordinates[0] - center[0]);
        circle.getGeometry().setRadius(dragingRadius);
        //使得拖拽按钮保持在圆最右边
        e.feature.getGeometry().setCoordinates([iconCoordinates[0], center[1]]);
        //更新拖拽按钮显示的半径
        var textStyle = e.feature.getStyle().getText();
        //获取圆的半径（米）
        var distance = utils.getCircleRadius(circle).toFixed(1);
        var output;
        if (distance > 1000) {
          output = (Math.round(distance / 1000 * 100) / 100) +
            ' ' + 'km';
        } else {
          output = (Math.round(distance * 100) / 100) +
            ' ' + 'm';
        }
        textStyle.setText(output);
      }
      //拖拽结束后的处理
      function dragendCallback(e) {
  
        //显示在圆内的点
        utils.forFeaturesInCircle(circle, [layerHospital, layerCompany, layreSchool], circleFeaturesCallback);
      }
      //对这些点做相应的处理
      function circleFeaturesCallback(features) {
        searchlayer.clear();
        layerHospital.hide();
        layerCompany.hide();
        layreSchool.hide();
        searchlayer.addFeatures(features);
        searchlayer.show();
      }
    }
  }

  //矩形框查询
  function queryRectangle(drawingManager) {
    drawingManager.setDrawingMode("DRAWING_RECTANGLE", rectangleCallback);

    function rectangleCallback(e) {
      var rectangle = e.feature;
      var utils = new WUtils(map);
      //找到在矩形内的poi点
      utils.forFeaturesInRectangle(rectangle, [layerHospital, layerCompany, layreSchool], rectangleFeaturesCallback);
      drawingManager.close();

      //对这些点做相应的处理
      function rectangleFeaturesCallback(features) {
        layerHospital.hide();
        layerCompany.hide();
        layreSchool.hide();
        searchlayer.addFeatures(features);
        searchlayer.show();
      }
    }
  }

  //定位点
  function pointLocation(coordinates) {
    map.setCenter(coordinates[0], coordinates[1], 14);

    var locationFeature = wfeature.Icon(coordinates, "../../img/position_marker.png", [48, 48], [24, 24]);
    layerLocation.clear();
    layerLocation.addFeature(locationFeature);
  }