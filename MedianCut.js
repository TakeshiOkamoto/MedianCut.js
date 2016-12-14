/**************************************************/
/*                                                */
/*     MedianCut.js                               */
/*                                      v0.88     */
/*                                                */
/*     Copyright 2016 Takeshi Okamoto (Japan)     */
/*                                                */
/*     Released under the MIT license             */
/*     https://github.com/TakeshiOkamoto/         */
/*                                                */
/*                            Date: 2016-12-14    */
/**************************************************/
 
////////////////////////////////////////////////////////////////////////////////
// Generic Function
////////////////////////////////////////////////////////////////////////////////

// 画像のカラー情報の取得
function getColorInfo(imagedata){
  var height = imagedata.height;
  var width  = imagedata.width;
  var raw    = imagedata.data;
  
  // 使用色/使用回数(面積)を取得
  var cnt = 0;
  var uses_colors = new Object;
  
  for(var i = 0; i< height;i++){
    for(var j = 0; j< width;j++){
      var key = raw[cnt]   + ',' + 
                raw[cnt+1] + ',' + 
                raw[cnt+2] ;
      if (!uses_colors[key]) 
        uses_colors[key] = 1;
      else  
        uses_colors[key] += 1;
        
      cnt = cnt + 4;
    }
  }

  // 連想配列を配列へ設定
  var rgb;
  var colors = new Array();   
  for (var key in uses_colors) {
    rgb = key.split(",");
    colors[colors.length] = {'r':parseInt(rgb[0],10),
                             'g':parseInt(rgb[1],10),
                             'b':parseInt(rgb[2],10),
                             'uses':uses_colors[key]}; // 使用数
  }
  return colors;
}

////////////////////////////////////////////////////////////////////////////////
// Generic Class
////////////////////////////////////////////////////////////////////////////////

// ---------------------
//  TMedianCut            
// ---------------------
// imagedata : 減色するImageDataオブジェクト
// colors    : getColorInfo()で取得したカラー情報 
function TMedianCut(imagedata,colors) {
  
  this.raw    = imagedata.data;
  this.width  = imagedata.width;
  this.height = imagedata.height;
  this.msg    = ''; 
  this.colors = colors;
}

// ---------------------
//  TMedianCut.Method     
// ---------------------
TMedianCut.prototype = {
   
  // プロパティの設定
  _setProperty : function (color){    
    var total =   0;
    var maxR  =   0, maxG =   0, maxB =  0;
    var minR  = 255, minG = 255, minB = 255;
    
    // 立方体の1辺の長さ
    for(var i = 0; i < color.length;i++){
      
      if (color[i].rgb.r > maxR) maxR = color[i].rgb.r ;
      if (color[i].rgb.g > maxG) maxG = color[i].rgb.g ;
      if (color[i].rgb.b > maxB) maxB = color[i].rgb.b ;
      
      if (color[i].rgb.r < minR) minR = color[i].rgb.r ;
      if (color[i].rgb.g < minG) minG = color[i].rgb.g ;
      if (color[i].rgb.b < minB) minB = color[i].rgb.b ;

      // キューブで使用している面積
      total += color[i].rgb.uses;
    }

    var dr  = (maxR - minR)*1.2;
    var dg  = (maxG - minG)*1.2; 
    var db  = (maxB - minB);
    
    // 同一の場合はrを優先する
    var colortype = 'r';
    
    // r 
    if (dr > dg && dr > db){
      colortype = 'r';
    }
    
    // g
    if (dg > dr && dg > db){
      colortype = 'g';
    }
    
    // b
    if (db > dr && db > dg){
      colortype = 'b';
    }    

    return { 'color' : color,    // キューブの各色情報
             'total' : total,    // キューブの総面積(総色数)
             'type'  : colortype,// キューブの種類(R/G/B)
             // キューブの体積用 'volume': dr * dg * db
             };
  },  
   
 // メディアンカット
  _MedianCut : function(cubes,colorsize){
    var count = 0;
    var index = 0;     
    
    // 面積(色数)が最大のキューブを選択
    for(var i = 0; i < cubes.length;i++){ 
      if(cubes[i].total > count){
        // 1点は除く
        if (cubes[i].color.length != 1){
          index = i;
          count = cubes[i].total;
        }
      }      
    }   
   
    // 体積が最大のキューブを選択
    //if(cubes[index].color.length == 1){      
    //  
    //  count =0;  index =0;
    //  
    // for(var i = 0; i < cubes.length;i++){ 
    //    if(cubes[i].volume > count){
    //      index = i;
    //      count = cubes[i].volume;
    //    }      
    //  }
    //}
    

    if (cubes[index].total == 1){
      // Cube could not be split.
      this.msg += colorsize + '色までキューブを分割できませんでした。\n';      
      return cubes;
    }
    
    if(cubes[index].color.length == 1){
      // Cube could not be split.
      this.msg += colorsize + '色までキューブを分割できませんでした。\n';
      return cubes;
    }    

    // メディアン由来の中央値を算出する
    var colortype = cubes[index].type;
    cubes[index].color.sort(function(a,b){
      if(a.rgb[colortype] < b.rgb[colortype] ) return -1;
      if(a.rgb[colortype] > b.rgb[colortype] ) return 1;
      return 0;
    });   
    split_border = Math.floor((cubes[index].color.length+1)/2);
    
    // 分割の開始       
    var split1 = new Array;
    var split2 = new Array;    
    for(var i = 0; i < cubes[index].color.length;i++){ 
      if (i < split_border){
        split1[split1.length] = cubes[index].color[i];
      }else{
        split2[split2.length] = cubes[index].color[i];
      }
    }   
    
    // プロパティの設定
    split1 = this._setProperty(split1);
    split2 = this._setProperty(split2);  
    
    // キューブ配列の再編成
    var result = new Array();
    for(var i = 0; i < cubes.length;i++){ 
      if (i != index){
        result[result.length] = cubes[i];
      }
    }
    result[result.length] = split1;
    result[result.length] = split2;
        
    if (result.length < colorsize){
      return this._MedianCut(result,colorsize);
    }else{
      return result;
    }
  },
  
  // 減色の実行
  // colorsize : 最大何色まで減色するかの色数(2- 256) 
  // update    : true ピクセルデータを更新 false 更新しない
  run : function(colorsize,update){    
   
    if (this.colors.length <= colorsize){
       // It has already been reduced color.
       this.msg = '既に'+ this.colors.length +'色に減色されています。\n';
       //return;
    }

    // 1個目のキューブの作成
    var plane = new Array;  
    for(var i = 0; i < this.colors.length;i++){ 
       plane[plane.length] = {'rgb': this.colors[i]};         
    }       

    var dummy = new Array();
    dummy[0] = this._setProperty(plane);
    
    // キューブの分割
    var cubes = this._MedianCut(dummy,colorsize);
     
    // キューブ毎に代表色(重み係数による平均)を算出する
    var rep_color = new Array();  
    for(var i = 0; i < cubes.length;i++){
      var count = 0;
      var r =0,g=0,b=0; 
      for(var j = 0; j < cubes[i].color.length;j++){ 
        r += cubes[i].color[j].rgb.r * cubes[i].color[j].rgb.uses; 
        g += cubes[i].color[j].rgb.g * cubes[i].color[j].rgb.uses; 
        b += cubes[i].color[j].rgb.b * cubes[i].color[j].rgb.uses; 
        count += cubes[i].color[j].rgb.uses;
      }
      rep_color[i] = {'r': Math.round(r/count),
                      'g': Math.round(g/count),
                      'b': Math.round(b/count)};    
    } 
    
    // 代表色の保存
    this.rep_color = rep_color;   
        
    // ピクセルデータの更新
    if (update) {

      // ピクセルデータ設定用の連想配列(高速化用)
      var pixels = new Object;
      for(var i = 0; i < cubes.length;i++){ 
        for(var j = 0; j < cubes[i].color.length;j++){ 
          pixels[cubes[i].color[j].rgb.r  + ',' + 
                 cubes[i].color[j].rgb.g  + ',' +
                 cubes[i].color[j].rgb.b] = {'r': rep_color[i].r,
                                             'g': rep_color[i].g,
                                             'b': rep_color[i].b}; 
        }
      }
          
      // データの設定                               
      var key,cnt =0;                               
      for(var i = 0; i< this.height;i++){
        for(var j = 0; j< this.width;j++){
          
          key = this.raw[cnt]   + ',' + 
                this.raw[cnt+1] + ',' + 
                this.raw[cnt+2];
          
          this.raw[cnt]   = pixels[key].r; 
          this.raw[cnt+1] = pixels[key].g; 
          this.raw[cnt+2] = pixels[key].b; 
           
          cnt = cnt + 4;
        }
      } 
    } 
  }  
}

