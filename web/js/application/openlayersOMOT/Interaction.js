//初始化交互
function interactionInit() {
  infoBox = new WOverlay(map);
  infoBox2 = new WOverlay(map);
  //悬浮事件
  map.addInteraction("hover", [layerHospital, layerCompany, layreSchool], function (e) {
    if ("enter" === e.type) {
      infoBox.show(e.feature.getGeometry().getCoordinates(), "hover: " + e.feature.getGeometry().getCoordinates()
        .join(","));
    } else if ("leave" === e.type) {
      infoBox.hide();
    }
  });
  //click事件
  map.addInteraction("click", [layerHospital, layerCompany, layreSchool], function (e) {
    infoBox2.show(e.selected[0].getGeometry().getCoordinates(), "click!");
    infoBox.hide();
  });
}