  //绘制管理
  function drawingManager(params) {
    //WDrawingManger 绘制模块
    layerDrawing = new WLayer("drawing", mapType);
    map.addLayer(layerDrawing);
    var drawingManager = new WDrawingManager(map, layerDrawing);

    $("#drawingManager").change(function () {
      //变化查询方式时，做相应的清理和显示工作
      layerDrawing.clear();
      searchlayer.clear();
      layerHospital.show();
      layerCompany.show();
      layreSchool.show();

      //查询管理
      switch ($(this).val()) {
        case "featureInReactangle":
          queryRectangle(drawingManager);
          drawingManager.open();
          break;
        case "featureInCircle":
          queryCircle(drawingManager);
          drawingManager.open();
          break;
        default:
          drawingManager.close();
          break;
      }
    })

    $("#location").change(function () {
      switch ($(this).val()) {
        case "drawPoint":
          drawingManager.setDrawingMode("DRAWING_MARKER", locationCallback);
          drawingManager.open();
          break;
        case "none":
          drawingManager.close();
          layerLocation.clear();
          break;
        default:
          pointLocation([120, 30, 14]);
          drawingManager.close();
          break;
      }
    })

    function locationCallback(e) {
      alert("定位完成");
      drawingManager.close();
    }
  }