  //地图配置
  var mapType = "openlayers";

  //全局变量
  var map,
    layerHospital,
    layerCompany,
    layreSchool,
    searchlayer,
    layerDrawing,
    layerLocation,
    infoBox,
    infoBox2,
    wfeature = new WFeature(mapType) //初始化一个wfeature实例就可以了  


  //应用
  mapInit(mapType);
  layerInit(map, mapType); //初始化地图图层,添加features
  interactionInit(); //静态点的悬浮和点击事件
  drawingManager(); //绘制管理

