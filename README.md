邮箱：weixiquan@cetiti.com

WMap的目的是融合百度和openlayers两种（以后会是多种）地图，在这两种地图的基础上，抽象并封装出一套WMap地图。

二次开发者只需要了解WMap的规范和使用方法，就可以同时进行百度和openlayers开发。

百度地图逻辑：    BMap -> BFeature                     feature的控制权在地图级别
openlayers逻辑：  OMap -> OLayer -> OFeature           feature的控制权在图层级别

综合考虑两种地图及应用场景，WMap需要layer层对不同类别feature进行管理，所以WMap也有三个级别。

WMap逻辑：        WMAP -> WLayer -> WFeature           feature的控制权在图层级别

WMap的核心思想是： MAP层只控制layer层，layer层只控制feature层。 

为了兼容百度地图对于feature的控制，WMap需要在layer层注入map对象，因此WMap的最重要的规范就是先在map层添加layer，然后layer层添加feature(很重要)。

WMAP为纯前端工具，如果想用baidu或者openlayers地图的其他服务，可以通过new WMap().getMap()获取对应的map对象，进行相关操作。

运行： 在浏览器环境中打开/web/html/index.html即可，此页面包含了两种地图及相关图层，feature，以及交互是实现。 对map,layer和feature的操作可以参考html文件夹下对应的html。