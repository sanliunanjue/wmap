/**
 * 构造函数
 * 基于数组存储数据
 * @constructor
 */
function Set(){
    this.dataList = [];
}
Set.prototype = {
    /* 修正constructor */
    constructor: Set,
    /* 显示当前集合 */
    show: function(){
        return this.dataList;
    },
    /* 返回集合元素个数 */
    size: function(){
        return this.dataList.length;
    },
    /* 判断集合中是否存在某成员 */
    contains: function(data){
        return this.dataList.indexOf(data) > -1 ? true : false;
    },
    /* 添加元素 */
    add: function(data){
        if(!this.contains(data)){
            // 不存在,插入元素,并返回true
            this.dataList.push(data);
            return true;
        }
        // 存在,返回false
        return false;
    },
    /* 删除元素 */
    remove: function(data){
        var index = this.dataList.indexOf(data);
        if(index > -1){
            // 存在当前数据,则删除并返回true
            this.dataList.splice(index, 1);
            return true;
        }
        // 不存在返回false
        return false;
    },
    clear: function () {
        this.dataList = [];
    }
};