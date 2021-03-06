﻿var constMaxZoomScale = 5; //最大缩放系数

// 邻接链表邻接矩阵数据
var tableData = undefined;
// 邻接链表/矩阵图区宽高
var tWidth = parseInt(d3.select("#table").attr("width"));
var tHeight = parseInt(d3.select("#table").attr("height"));


// 画表
function paintTable(tData, status) {
        if (status != "success") {
                ///////////////////////////////////////////////////////
                //                  提醒用户没有加载成功                      //
                ///////////////////////////////////////////////////////
                return console.log(status);
        }
        // TODO
        tableData = tData;
        drawLinklist();
}

// Usage                         
var dataset = {
        rowLabel: [],
        columnLabel: [],
        value: []
};

var opts = {
        width: 200,
        height: 200,
        margins: { top: 20, right: 20, bottom: 20, left: 20 }
};

//opts.width = width;
//opts.height = height;

// SVG 
var zoom = d3.behavior.zoom()
                        .scaleExtent([1, 10])
                        .on("zoom", zoomed);

function zoomed() {
        d3.select(this).attr("transform",
			 "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

//$("#divTable").ready(function () { drawLinklist(); });


function matrix() {
        if (!tableData) {
                ///////////////////////////////////////////////////////
                //           提醒用户链表和矩阵还没有准备好            //
                ///////////////////////////////////////////////////////
                return console.log(tableData);
        }

        var svgdiv = document.getElementById("divTable");
        svgdiv.style.overflow = "hidden";
        svgdiv.innerHTML = "";
        populate(tableData);
        /*$.get("../json/graph.json", */function populate(data) {

                //是否有向
                var isdirected = 1;
                if (data.type == false) {
                        isdirected = 0;
                }

                //是否有权
                var isWeighted = 1;
                if (data.weight == false) {
                        isWeighted = 0;
                }

                dataset.rowLabel = [];
                dataset.columnLabel = [];
                dataset.value = [];

                var nodes = data.nodes;
                for (var i = 0; i < nodes.length; i++) {
                        dataset.rowLabel[i] = nodes[i].name;
                        dataset.columnLabel[i] = nodes[i].name;
                }

                var links = data.edges;
                for (var i = 0; i < nodes.length; i++) {
                        dataset.value[i] = new Array();
                        for (var j = 0; j < nodes.length; j++) {
                                dataset.value[i][j] = 0;
                        }
                }

                for (var i = 0; i < links.length; i++) {
                        if (isWeighted == 1) {
                                dataset.value[links[i].source][links[i].target] = links[i].weight;
                                if (isdirected == 0) {
                                        dataset.value[links[i].target][links[i].source] = links[i].weight;
                                }
                        }
                        else {
                                dataset.value[links[i].source][links[i].target] = 1;
                                if (isdirected == 0) {
                                        dataset.value[links[i].target][links[i].source] = 1;
                                }
                        }
                }

                // Table module ////////////////////////////////////
                var Table = function module() {

                        // DOM preparation
                        // Size
                        var chartW = Math.max(tWidth - opts.margins.left - opts.margins.right, 0.1);
                        var chartH = Math.max(tHeight - opts.margins.top - opts.margins.bottom, 0.1);
                        // Table
                        var rowHeaderLevelNum = 1;
                        var colHeaderLevelNum = 1;
                        //var cellH = chartH / (value.length + rowHeaderLevelNum);
                        //var cellW = chartW / (value.length + colHeaderLevelNum);
                        var cellH = 25;
                        var cellW = 40;

                        var table_width = (dataset.columnLabel.length + colHeaderLevelNum) * cellW;
                        var table_height = (dataset.rowLabel.length + rowHeaderLevelNum) * cellH;

                        if (tWidth > table_width) {
                                opts.margins.left = (tWidth - table_width) / 2;
                                opts.margins.right = (tWidth - table_width) / 2;
                        }

                        if (tHeight > table_height) {
                                opts.margins.top = (tHeight - table_height) / 2;
                                opts.margins.bottom = (tHeight - table_height) / 2;
                        }


                        var svg = d3.select("#divTable").append("svg")
	              .attr("width", tWidth)
	              .attr("height", tHeight);

                        var visSvg = svg.append('g')
                                           .call(zoom)
                                           .attr('class', 'vis-group')
                                               .attr('transform', 'translate(' + opts.margins.left + ',' + opts.margins.top + ')');

                        function exports(selection) {
                                selection.each(function (dataset) {
                                        // Data
                                        var columnLabel = dataset.columnLabel;
                                        var rowLabel = dataset.rowLabel;
                                        var value = dataset.value;

                                        var tableBodySvg = visSvg.append('g').attr('class', 'chart-group');
                                        var tableHeaderSvg = visSvg.append('g').attr('class', 'chart-group');
                                        var rowHeaderSvg = tableHeaderSvg.append('g').attr('class', 'row-header');
                                        var colHeaderSvg = tableHeaderSvg.append('g').attr('class', 'col-header');


                                        // Row header
                                        var rowHeaderCell = rowHeaderSvg.selectAll('rect.row-header-cell')
                                            .data(rowLabel);
                                        rowHeaderCell.enter().append('rect')
                                            .attr({
                                                    class: 'row-header-cell',
                                                    width: cellW, height: cellH,
                                                    x: 0,
                                                    y: function (d, i) { return i * cellH + (cellH * colHeaderLevelNum) }
                                            })
                                            .style({ fill: '#eee', stroke: 'silver' });

                                        // Row header text
                                        rowHeaderCell.enter().append('text')
                                            .attr({
                                                    class: 'row-header-content',
                                                    x: 0,
                                                    y: function (d, i) { return i * cellH + (cellH * colHeaderLevelNum) },
                                                    dx: cellW / 2,
                                                    dy: cellH / 2 + cellH / 4
                                            })
                                            .style({ fill: 'black', 'text-anchor': 'middle' })
                                            .text(function (d, i) { return d; });

                                        // Col header
                                        var colHeaderCell = colHeaderSvg.selectAll('rect.col-header-cell')
                                            .data(columnLabel);
                                        colHeaderCell.enter().append('rect')
                                            .attr({
                                                    class: 'col-header-cell',
                                                    width: cellW, height: cellH,
                                                    x: function (d, i) { return i * cellW + (cellW * rowHeaderLevelNum) },
                                                    y: 0
                                            })
                                            .style({ fill: '#eee', stroke: 'silver' });

                                        // Col header text
                                        colHeaderCell.enter().append('text')
                                            .attr({
                                                    class: 'col-header-content',
                                                    x: function (d, i) { return i * cellW + (cellW * rowHeaderLevelNum) },
                                                    y: 0,
                                                    dx: cellW / 2,
                                                    dy: cellH / 2 + cellH / 4
                                            })
                                            .style({ fill: 'black', 'text-anchor': 'middle' })
                                            .text(function (d, i) { return d; });

                                        // Body
                                        var row = tableBodySvg.selectAll('g.row')
                                            .data(value);
                                        row.enter().append('g')
                                            .attr('class', 'cell row')
                                            .each(function (pD, pI) {
                                                    // Cells
                                                    var cell = d3.select(this)
                                                        .selectAll('rect.cell')
                                                        .data(pD);
                                                    cell.enter().append('rect')
                                                        .attr({
                                                                class: 'cell', width: cellW, height: cellH,
                                                                x: function (d, i) { return i * cellW + (cellW * rowHeaderLevelNum) },
                                                                y: function (d, i) { return pI * cellH + cellH }
                                                        })
                                                        .style({ fill: 'white', stroke: 'silver' });
                                                    // Text
                                                    cell.enter().append('text')
                                                        .attr({
                                                                class: 'cell-content', width: cellW, height: cellH,
                                                                x: function (d, i) { return i * cellW + (cellW * rowHeaderLevelNum) },
                                                                y: function (d, i) { return pI * cellH + cellH },
                                                                dx: cellW / 2,
                                                                dy: cellH / 2 + cellH / 4
                                                        })
                                                        .style({ fill: 'black', 'text-anchor': 'middle' })
                                                        .text(function (d, i) { return d; });
                                            });
                                });
                        }

                        exports.opts = opts;
                        createAccessors(exports, opts);
                        return exports;
                };

                // Helper function                       
                var createAccessors = function (visExport) {
                        for (var n in visExport.opts) {
                                if (!visExport.opts.hasOwnProperty(n)) continue;
                                visExport[n] = (function (n) {
                                        return function (v) {
                                                return arguments.length ? (visExport.opts[n] = v, this) : visExport.opts[n];
                                        }
                                })(n);
                        }
                };

                var table = Table().width(tWidth).height(tHeight);

                d3.select('body')
                    .datum(dataset)
                    .call(table);

        }/*);*/

}

//canvas 画链表
function drawLinklist() {
        if (!tableData) {
                ///////////////////////////////////////////////////////
                //           提醒用户链表和矩阵还没有准备好            //
                ///////////////////////////////////////////////////////
                return console.log(tableData);
        }

        // 获取上下文 
        //var matrix = document.getElementById('matrix'); 
        //matrix.style.display = "none";
        var tablediv = document.getElementById("divTable");
        tablediv.style.overflow = "auto";
        tablediv.innerHTML = "";

        var a_canvas = document.createElement("canvas");
        tablediv.appendChild(a_canvas);

        var context = a_canvas.getContext("2d");

        //表头节点大小 
        var cell_height = 30;
        var cell_width = 45;

        //链表表头后的节点大小
        var offset_x = 14;
        var offset_y = 8;
        var node_width = cell_width - offset_x;
        var node_height = cell_height - offset_y;

        /* var winWidth, winHeight;
         if (window.innerWidth){
       winWidth = window.innerWidth;
         }   
 else if ((document.body) && (document.body.clientWidth)){
       winWidth = document.body.clientWidth;
         }
 // 获取窗口高度
 if (window.innerHeight){
      winHeight = window.innerHeight;
         }
 else if ((document.body) && (document.body.clientHeight)){
      winHeight = document.body.clientHeight;
         }
 // 通过深入 Document 内部对 body 进行检测，获取窗口大小
 if (document.documentElement && document.documentElement.clientHeight && document.documentElement.clientWidth){
     winHeight = document.documentElement.clientHeight;
     winWidth = document.documentElement.clientWidth;
 }
          a_canvas.width = winWidth;
          a_canvas.height = winHeight;*/

        a_canvas.width = tWidth - 10;
        a_canvas.height = tHeight - 15;

        populate(tableData);
        /*$.get("../json/graph.json", */function populate(data) {

                //节点个数      
                var n = data.nodes.length;

                //是否有向
                var isdirected = 1;
                if (data.type == false) {
                        isdirected = 0;
                }

                //是否有权
                var ngrid = 3;
                var isWeighted = 1;
                if (data.weight == false) {
                        ngrid = 2;
                        isWeighted = 0;
                }

                //最大链长度
                var maxm = 0;

                dataset.rowLabel = [];
                dataset.columnLabel = [];
                dataset.value = [];

                var nodes = data.nodes;
                for (var i = 0; i < nodes.length; i++) {
                        dataset.rowLabel[i] = nodes[i].name;
                }

                var links = data.edges;
                var len_link = [];

                for (var i = 0; i < nodes.length; i++) {
                        dataset.value[i] = new Array();
                        len_link[i] = 0;
                        for (var j = 0; j < nodes.length; j++) {
                                dataset.value[i][j] = 0;
                        }
                }

                for (var i = 0; i < links.length; i++) {

                        if (isWeighted == 1) {
                                dataset.value[links[i].source][links[i].target] = links[i].weight;
                                if (isdirected == 0) {
                                        dataset.value[links[i].target][links[i].source] = links[i].weight;
                                }
                        }
                        else {
                                dataset.value[links[i].source][links[i].target] = 1;
                                if (isdirected == 0) {
                                        dataset.value[links[i].target][links[i].source] = 1;
                                }
                        }
                }

                for (var i = 0; i < n; i++) {
                        for (var j = 0; j < n; j++) {
                                if (dataset.value[i][j] != 0) {
                                        len_link[i]++;
                                }
                        }
                }

                for (var i = 0; i < nodes.length; i++) {
                        if (len_link[i] > maxm) {
                                maxm = len_link[i];
                        }
                }

                var margin_left = (a_canvas.width - cell_width * 3 - node_width * (maxm * (ngrid + 1) - 1)) / 2;
                if (margin_left <= 0) {
                        var tmp = margin_left;
                        margin_left = 20;
                        a_canvas.width = a_canvas.width - tmp * 2 + margin_left * 2;
                }

                var margin_top = (a_canvas.height - cell_height * n) / 2;
                if (margin_top <= 0) {
                        var tmp = margin_top;
                        margin_top = 20;
                        a_canvas.height = a_canvas.height - tmp * 2 + margin_top * 2;
                }

                context.clearRect(0, 0, a_canvas.width, a_canvas.height);
                // 绘制背景 
                var gradient = context.createLinearGradient(0, 0, 0, 300);

                gradient.addColorStop(0, "#ffffff");
                gradient.addColorStop(1, "#ffffff");

                context.fillStyle = gradient;

                // 描绘边框 
                context.lineWidth = 1;
                context.strokeStyle = "#585858";
                context.fillRect(0, 0, a_canvas.width, a_canvas.height);

                // 字体格式
                context.font = "15px Arial";
                context.fillStyle = "black";
                context.textAlign = "center";
                context.textBaseline = "middle";

                //邻接链表表头节点编号
                drawNodeLabel(context, 0 + margin_left, 0 + margin_top, cell_width, cell_height, dataset.rowLabel);

                context.font = "12px Arial";
                for (var row = 0; row < n; row++) {
                        var yh = margin_top + row * cell_height;

                        var x1 = margin_left + cell_width + cell_width / 2;
                        var x2 = x1 + cell_width * ngrid / 2;

                        //链长度
                        var m = 0;
                        var col_element = [];
                        for (var col = 0; col < n; col++) {
                                if (dataset.value[row][col] != 0) {
                                        col_element[m] = col;
                                        m++;
                                }
                        }

                        //填充表头方块
                        if (m != 0) {
                                context.fillStyle = "#eee";
                                context.fillRect(margin_left + cell_width, yh, cell_width, cell_height);
                                context.fillStyle = "black";
                        }

                        //邻接链表表头节点
                        drawRectangle(context, margin_left + cell_width, yh, cell_width, cell_height, 1);

                        var xt = 0;

                        //链表表头后的节点链			 
                        for (var col = 0; col < m; col++) {
                                xt = x2 + col * node_width * (ngrid + 1);
                                var xs = xt - node_width * 3 / 2;

                                //填充表体方块			  
                                context.fillStyle = "#eee";
                                if (col < m - 1) {
                                        context.fillRect(xt, yh + offset_y / 2, node_width * ngrid, node_height);
                                }
                                else {
                                        context.fillRect(xt, yh + offset_y / 2, node_width * (ngrid - 1), node_height);
                                }
                                context.fillStyle = "black";

                                //节点项
                                drawRectangle(context, xt, yh + offset_y / 2, node_width, node_height, ngrid);

                                //节点编号
                                drawNodeValue(context, xt, yh + offset_y / 2, node_width, node_height, dataset.rowLabel[col_element[col]]);

                                //边权值
                                if (isWeighted == 1) {
                                        drawNodeValue(context, xt + node_width, yh + offset_y / 2, node_width, node_height, dataset.value[row][col_element[col]]);
                                }

                                if (col == 0) {
                                        drawArrow(context, 0, 0, x1, yh + cell_height / 2, xt, yh + cell_height / 2);
                                }
                                else {
                                        drawArrow(context, 0, 0, xs, yh + cell_height / 2, xt, yh + cell_height / 2);
                                }
                        }
                        //链表末尾链接指针为空
                        context.beginPath();
                        if (m != 0) {
                                context.moveTo(xt + node_width * (ngrid - 1), yh + offset_y / 2);
                                context.lineTo(xt + node_width * ngrid, yh + offset_y / 2 + node_height);
                        }
                        else {
                                context.moveTo(margin_left + cell_width, yh);
                                context.lineTo(margin_left + cell_width * 2, yh + cell_height);
                        }
                        context.closePath();
                        context.stroke();
                }
        }/*);*/

}

function drawRectangle(context, x, y, width, height, n) {

        // 结束边框描绘 
        context.beginPath();
        // 准备画竖线  
        for (var col = 0; col <= n; col++) {
                var xx = x + col * width;
                context.moveTo(xx, y);
                context.lineTo(xx, y + height);
        }
        // 准备画横线
        for (var row = 0; row <= 1; row++) {
                var yy = y + row * height;
                context.moveTo(x, yy);
                context.lineTo(x + n * width, yy);
        }

        context.closePath();
        context.stroke();
}

function drawNodeLabel(context, x, y, width, height, rowLabel) {

        for (var row = 0; row < rowLabel.length; row++) {
                var yy = y + row * height;
                context.fillText(rowLabel[row], x + width / 2, yy + height / 2);
        }

}

function drawNodeValue(context, x, y, width, height, value) {
        context.fillText(value, x + width / 2, y + height / 2);
}

function drawArrow(ctx, ox, oy, x1, y1, x2, y2) {
        //参数说明 canvas的 id ，原点坐标  第一个端点的坐标，第二个端点的坐标  
        var sta = new Array(x1, y1);
        var end = new Array(x2, y2);

        //画线   
        ctx.beginPath();
        ctx.translate(ox, oy, 0); //坐标源点   
        ctx.moveTo(sta[0], sta[1]);
        ctx.lineTo(end[0], end[1]);
        ctx.fill();
        ctx.stroke();
        ctx.save();

        //画箭头   
        ctx.translate(end[0], end[1]);
        //我的箭头本垂直向下，算出直线偏离Y的角，然后旋转 ,rotate是顺时针旋转的，所以加个负号  
        var ang = (end[0] - sta[0]) / (end[1] - sta[1]);
        ang = Math.atan(ang);
        if (end[1] - sta[1] >= 0) {
                ctx.rotate(-ang);
        }
        else {
                ctx.rotate(Math.PI - ang);//加个180度，反过来  
        }
        ctx.lineTo(-5, -10);
        ctx.lineTo(0, -5);
        ctx.lineTo(5, -10);
        ctx.lineTo(0, 0);
        ctx.fill(); //箭头是个封闭图形  
        ctx.restore();   //恢复到堆的上一个状态，其实这里没什么用。  
        ctx.closePath();
}