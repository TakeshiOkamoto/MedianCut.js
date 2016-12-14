# MedianCut.js
High quality, median-cut algorithm, reduced color (Reduce the color of the image),  with pure JavaScript.

## How to use 

Japanese  
[http://www.petitmonte.com/javascript/howto_mediancut_js.html](http://www.petitmonte.com/javascript/howto_mediancut_js.html)  

English

```rb
// *** Constructor   
// First  argument : ImageData object  
// Second argument : Return value of getColorInfo()  
var MedianCut = new TMedianCut(imagedata,colors);  
  
// *** Method  
// First  argument : Number of colors (2 - 256)  
// Second argument : Update pixel data (true or false)  
MedianCut.run(256,true);  
  
// Number of colors after color reduction    
alert(MedianCut.rep_color.length);  
```

## Caution
If the HTML file is not uploaded to the server, it may not work depending on browser specifications.

HTML5 Web Woker makes it multi-threaded and faster.

## Contact
sorry, no warranty, no support. English Can understand only 3-year-old level.  

## Author
Copyright (c) 2016 Takeshi Okamoto

## Licence
MIT license.  
