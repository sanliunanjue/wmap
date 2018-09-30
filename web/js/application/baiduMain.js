! function () {
  var mapType = "baidu";
  var map, //初始化地图底图
    layerHospital,
    layerCompany,
    layreSchool,
    wfeature = new WFeature(mapType); //初始化一个wfeature实例就可以了
  //WOverlay 弹框层模块
  mapInit(mapType);
  layerInit(map, mapType); //初始化地图图层,添加features
  var infoBox = new WOverlay(map);
  var infoBox2 = new WOverlay(map);



  //应用
  interactionInit(); //静态点的悬浮和点击事件
  layerManager(); //图层管理
  drawingManager(); //绘制管理
  queryManager(); //查询管理

  //初始化地图
  function mapInit(mapType) {
    map = new WMap("map_container", mapType);
    map.setCenter(120, 30, 14);
  }

  //初始化图层
  function layerInit(map, mapType) {
    var hoslayer = new WLayer("hospital", mapType); //医院图层
    var comlayer = new WLayer("company", mapType); //公司图层
    var schlayer = new WLayer("school", mapType); //学校图层

    map.addLayer(hoslayer);
    map.addLayer(comlayer);
    map.addLayer(schlayer);
    var number = 200;
    var hosFeatures = randomPoiInit(mapType, "hospital", number);
    var comFeatures = randomPoiInit(mapType, "company", number);
    var schFeatures = randomPoiInit(mapType, "school", number);

    hoslayer.addFeatures(hosFeatures);
    comlayer.addFeatures(comFeatures);
    schlayer.addFeatures(schFeatures);

    layerHospital = hoslayer;
    layerCompany = comlayer;
    layreSchool = schlayer;
  }

  //产生随机静态点
  function randomPoiInit(mapType, layerName, number) {
    var url;
    switch (layerName) {
      case "hospital":
        url = "../../img/poi_hospital.png"
        break;
      case "school":
        url = "../../img/poi_school.png"
        break;
      case "company":
        url = "../../img/poi_company.png"
        break;
      default:
        url = "../../img/poi_company.png"
        break;
    }
    var allFeatures = [];
    for (var i = 1; i <= number; i++) {
      var adjustx = Math.random() * 0.2 - 0.1;
      var adjusty = Math.random() * 0.2 - 0.1;
      allFeatures.push(wfeature.Icon([120 + adjustx, 30 + adjusty], url, [24, 24], [12, 12]));
    }
    return allFeatures;
  }

  //初始化交互
  function interactionInit() {
    //悬浮事件
    map.addInteraction("hover", [layerHospital, layerCompany, layreSchool], function (e) {
      if ("onmouseover" === e.type) {
        var coordinate = e.target.getPosition();
        coordinate = [coordinate.lng, coordinate.lat];
        infoBox.show(coordinate, "hover: " + coordinate.join(","));
      } else if ("onmouseout" === e.type) {
        infoBox.hide();
      }
    });
    //click事件
    map.addInteraction("click", [layerHospital, layerCompany, layreSchool], function (e) {
      var coordinate = e.target.getPosition();
      coordinate = [coordinate.lng, coordinate.lat];
      infoBox2.show(coordinate, "click: " + coordinate.join(","));
  
    });
  }

  //图层管理
  function layerManager(params) {

  }

  //绘制管理
  function drawingManager(params) {
    //WDrawingManger 绘制模块
    var layerDrawing = new WLayer("drawing", mapType);
    map.addLayer(layerDrawing);
    var drawingManager = new WDrawingManager(map, layerDrawing);

    $("#drawingManager").change(function () {
      switch ($(this).val()) {
        case "featureInReactangle":
          drawingManager.setDrawingMode("DRAWING_RECTANGLE", callback);
          drawingManager.getDrawingManager().removeEventListener("DRAWING_RECTANGLE", callback);
          drawingManager.open();
          break;
        case "featureInCircle":
          drawingManager.setDrawingMode("DRAWING_CIRCLE", callback);
          drawingManager.getDrawingManager().removeEventListener("DRAWING_RECTANGLE", callback);
          drawingManager.open();
          break;
        default:
          drawingManager.close();
          break;
      }
    })

    function callback(overlay) {
      alert("hh");
      drawingManager.close();
    }
  }

  //查询管理
  function queryManager(params) {

  }
}();