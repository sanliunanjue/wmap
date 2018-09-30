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
  searchlayer = new WLayer("search", mapType); //查询结果图层
  layerLocation = new WLayer("location", mapType); //定位图层

  map.addLayer(hoslayer);
  map.addLayer(comlayer);
  map.addLayer(schlayer);
  map.addLayer(searchlayer);
  map.addLayer(layerLocation);

  var number = 2000;
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