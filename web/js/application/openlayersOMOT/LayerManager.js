 //图层管理
 //显示某个图层
 function showLayer(category) {
   switch (category) {
     case 1:
       layerHospital.show();
       break;
     case 2:
       layreSchool.show();
       break;
     case 3:
       layerCompany.show();
       break;
     default:
       break;
   }
 }
 function hideLayer(category) {
  switch (category) {
    case 1:
      layerHospital.hide();
      break;
    case 2:
      layreSchool.hide();
      break;
    case 3:
      layerCompany.hide();
      break;
    default:
      break;
  }
 }