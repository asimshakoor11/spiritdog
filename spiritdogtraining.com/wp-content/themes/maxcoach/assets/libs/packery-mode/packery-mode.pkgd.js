/*!
* Packery layout mode PACKAGED v2.0.1
* sub-classes Packery
*/(function(window,factory){if(typeof define=='function'&&define.amd){define('packery/js/rect',factory);}else if(typeof module=='object'&&module.exports){module.exports=factory();}else{window.Packery=window.Packery||{};window.Packery.Rect=factory();}}(window,function factory(){function Rect(props){for(var prop in Rect.defaults){this[prop]=Rect.defaults[prop];}
for(prop in props){this[prop]=props[prop];}}
Rect.defaults={x:0,y:0,width:0,height:0};var proto=Rect.prototype;proto.contains=function(rect){var otherWidth=rect.width||0;var otherHeight=rect.height||0;return this.x<=rect.x&&this.y<=rect.y&&this.x+this.width>=rect.x+otherWidth&&this.y+this.height>=rect.y+otherHeight;};proto.overlaps=function(rect){var thisRight=this.x+this.width;var thisBottom=this.y+this.height;var rectRight=rect.x+rect.width;var rectBottom=rect.y+rect.height;return this.x<rectRight&&thisRight>rect.x&&this.y<rectBottom&&thisBottom>rect.y;};proto.getMaximalFreeRects=function(rect){if(!this.overlaps(rect)){return false;}
var freeRects=[];var freeRect;var thisRight=this.x+this.width;var thisBottom=this.y+this.height;var rectRight=rect.x+rect.width;var rectBottom=rect.y+rect.height;if(this.y<rect.y){freeRect=new Rect({x:this.x,y:this.y,width:this.width,height:rect.y-this.y});freeRects.push(freeRect);}
if(thisRight>rectRight){freeRect=new Rect({x:rectRight,y:this.y,width:thisRight-rectRight,height:this.height});freeRects.push(freeRect);}
if(thisBottom>rectBottom){freeRect=new Rect({x:this.x,y:rectBottom,width:this.width,height:thisBottom-rectBottom});freeRects.push(freeRect);}
if(this.x<rect.x){freeRect=new Rect({x:this.x,y:this.y,width:rect.x-this.x,height:this.height});freeRects.push(freeRect);}
return freeRects;};proto.canFit=function(rect){return this.width>=rect.width&&this.height>=rect.height;};return Rect;}));(function(window,factory){if(typeof define=='function'&&define.amd){define('packery/js/packer',['./rect'],factory);}else if(typeof module=='object'&&module.exports){module.exports=factory(require('./rect'));}else{var Packery=window.Packery=window.Packery||{};Packery.Packer=factory(Packery.Rect);}}(window,function factory(Rect){function Packer(width,height,sortDirection){this.width=width||0;this.height=height||0;this.sortDirection=sortDirection||'downwardLeftToRight';this.reset();}
var proto=Packer.prototype;proto.reset=function(){this.spaces=[];var initialSpace=new Rect({x:0,y:0,width:this.width,height:this.height});this.spaces.push(initialSpace);this.sorter=sorters[this.sortDirection]||sorters.downwardLeftToRight;};proto.pack=function(rect){for(var i=0;i<this.spaces.length;i++){var space=this.spaces[i];if(space.canFit(rect)){this.placeInSpace(rect,space);break;}}};proto.columnPack=function(rect){for(var i=0;i<this.spaces.length;i++){var space=this.spaces[i];var canFitInSpaceColumn=space.x<=rect.x&&space.x+space.width>=rect.x+rect.width&&space.height>=rect.height-0.01;if(canFitInSpaceColumn){rect.y=space.y;this.placed(rect);break;}}};proto.rowPack=function(rect){for(var i=0;i<this.spaces.length;i++){var space=this.spaces[i];var canFitInSpaceRow=space.y<=rect.y&&space.y+space.height>=rect.y+rect.height&&space.width>=rect.width-0.01;if(canFitInSpaceRow){rect.x=space.x;this.placed(rect);break;}}};proto.placeInSpace=function(rect,space){rect.x=space.x;rect.y=space.y;this.placed(rect);};proto.placed=function(rect){var revisedSpaces=[];for(var i=0;i<this.spaces.length;i++){var space=this.spaces[i];var newSpaces=space.getMaximalFreeRects(rect);if(newSpaces){revisedSpaces.push.apply(revisedSpaces,newSpaces);}else{revisedSpaces.push(space);}}
this.spaces=revisedSpaces;this.mergeSortSpaces();};proto.mergeSortSpaces=function(){Packer.mergeRects(this.spaces);this.spaces.sort(this.sorter);};proto.addSpace=function(rect){this.spaces.push(rect);this.mergeSortSpaces();};Packer.mergeRects=function(rects){var i=0;var rect=rects[i];rectLoop:while(rect){var j=0;var compareRect=rects[i+j];while(compareRect){if(compareRect==rect){j++;}else if(compareRect.contains(rect)){rects.splice(i,1);rect=rects[i];continue rectLoop;}else if(rect.contains(compareRect)){rects.splice(i+j,1);}else{j++;}
compareRect=rects[i+j];}
i++;rect=rects[i];}
return rects;};var sorters={downwardLeftToRight:function(a,b){return a.y-b.y||a.x-b.x;},rightwardTopToBottom:function(a,b){return a.x-b.x||a.y-b.y;}};return Packer;}));(function(window,factory){if(typeof define=='function'&&define.amd){define('packery/js/item',['outlayer/outlayer','./rect'],factory);}else if(typeof module=='object'&&module.exports){module.exports=factory(require('outlayer'),require('./rect'));}else{window.Packery.Item=factory(window.Outlayer,window.Packery.Rect);}}(window,function factory(Outlayer,Rect){var docElemStyle=document.documentElement.style;var transformProperty=typeof docElemStyle.transform=='string'?'transform':'WebkitTransform';var Item=function PackeryItem(){Outlayer.Item.apply(this,arguments);};var proto=Item.prototype=Object.create(Outlayer.Item.prototype);var __create=proto._create;proto._create=function(){__create.call(this);this.rect=new Rect();};var _moveTo=proto.moveTo;proto.moveTo=function(x,y){var dx=Math.abs(this.position.x-x);var dy=Math.abs(this.position.y-y);var canHackGoTo=this.layout.dragItemCount&&!this.isPlacing&&!this.isTransitioning&&dx<1&&dy<1;if(canHackGoTo){this.goTo(x,y);return;}
_moveTo.apply(this,arguments);};proto.enablePlacing=function(){this.removeTransitionStyles();if(this.isTransitioning&&transformProperty){this.element.style[transformProperty]='none';}
this.isTransitioning=false;this.getSize();this.layout._setRectSize(this.element,this.rect);this.isPlacing=true;};proto.disablePlacing=function(){this.isPlacing=false;};proto.removeElem=function(){this.element.parentNode.removeChild(this.element);this.layout.packer.addSpace(this.rect);this.emitEvent('remove',[this]);};proto.showDropPlaceholder=function(){var dropPlaceholder=this.dropPlaceholder;if(!dropPlaceholder){dropPlaceholder=this.dropPlaceholder=document.createElement('div');dropPlaceholder.className='packery-drop-placeholder';dropPlaceholder.style.position='absolute';}
dropPlaceholder.style.width=this.size.width+'px';dropPlaceholder.style.height=this.size.height+'px';this.positionDropPlaceholder();this.layout.element.appendChild(dropPlaceholder);};proto.positionDropPlaceholder=function(){this.dropPlaceholder.style[transformProperty]='translate('+
this.rect.x+'px, '+this.rect.y+'px)';};proto.hideDropPlaceholder=function(){this.layout.element.removeChild(this.dropPlaceholder);};return Item;}));/*!
* Packery v2.0.0
* Gapless, draggable grid layouts
*
* Licensed GPLv3 for open source use
* or Packery Commercial License for commercial use
*
* http://packery.metafizzy.co
* Copyright 2016 Metafizzy
*/(function(window,factory){if(typeof define=='function'&&define.amd){define('packery/js/packery',['get-size/get-size','outlayer/outlayer','./rect','./packer','./item'],factory);}else if(typeof module=='object'&&module.exports){module.exports=factory(require('get-size'),require('outlayer'),require('./rect'),require('./packer'),require('./item'));}else{window.Packery=factory(window.getSize,window.Outlayer,window.Packery.Rect,window.Packery.Packer,window.Packery.Item);}}(window,function factory(getSize,Outlayer,Rect,Packer,Item){Rect.prototype.canFit=function(rect){return this.width>=rect.width-1&&this.height>=rect.height-1;};var Packery=Outlayer.create('packery');Packery.Item=Item;var proto=Packery.prototype;proto._create=function(){Outlayer.prototype._create.call(this);this.packer=new Packer();this.shiftPacker=new Packer();this.isEnabled=true;this.dragItemCount=0;var _this=this;this.handleDraggabilly={dragStart:function(){_this.itemDragStart(this.element);},dragMove:function(){_this.itemDragMove(this.element,this.position.x,this.position.y);},dragEnd:function(){_this.itemDragEnd(this.element);}};this.handleUIDraggable={start:function handleUIDraggableStart(event,ui){if(!ui){return;}
_this.itemDragStart(event.currentTarget);},drag:function handleUIDraggableDrag(event,ui){if(!ui){return;}
_this.itemDragMove(event.currentTarget,ui.position.left,ui.position.top);},stop:function handleUIDraggableStop(event,ui){if(!ui){return;}
_this.itemDragEnd(event.currentTarget);}};};proto._resetLayout=function(){this.getSize();this._getMeasurements();var width,height,sortDirection;if(this._getOption('horizontal')){width=Infinity;height=this.size.innerHeight+this.gutter;sortDirection='rightwardTopToBottom';}else{width=this.size.innerWidth+this.gutter;height=Infinity;sortDirection='downwardLeftToRight';}
this.packer.width=this.shiftPacker.width=width;this.packer.height=this.shiftPacker.height=height;this.packer.sortDirection=this.shiftPacker.sortDirection=sortDirection;this.packer.reset();this.maxY=0;this.maxX=0;};proto._getMeasurements=function(){this._getMeasurement('columnWidth','width');this._getMeasurement('rowHeight','height');this._getMeasurement('gutter','width');};proto._getItemLayoutPosition=function(item){this._setRectSize(item.element,item.rect);if(this.isShifting||this.dragItemCount>0){var packMethod=this._getPackMethod();this.packer[packMethod](item.rect);}else{this.packer.pack(item.rect);}
this._setMaxXY(item.rect);return item.rect;};proto.shiftLayout=function(){this.isShifting=true;this.layout();delete this.isShifting;};proto._getPackMethod=function(){return this._getOption('horizontal')?'rowPack':'columnPack';};proto._setMaxXY=function(rect){this.maxX=Math.max(rect.x+rect.width,this.maxX);this.maxY=Math.max(rect.y+rect.height,this.maxY);};proto._setRectSize=function(elem,rect){var size=getSize(elem);var w=size.outerWidth;var h=size.outerHeight;if(w||h){w=this._applyGridGutter(w,this.columnWidth);h=this._applyGridGutter(h,this.rowHeight);}
rect.width=Math.min(w,this.packer.width);rect.height=Math.min(h,this.packer.height);};proto._applyGridGutter=function(measurement,gridSize){if(!gridSize){return measurement+this.gutter;}
gridSize+=this.gutter;var remainder=measurement%gridSize;var mathMethod=remainder&&remainder<1?'round':'ceil';measurement=Math[mathMethod](measurement/gridSize)*gridSize;return measurement;};proto._getContainerSize=function(){if(this._getOption('horizontal')){return{width:this.maxX-this.gutter};}else{return{height:this.maxY-this.gutter};}};proto._manageStamp=function(elem){var item=this.getItem(elem);var rect;if(item&&item.isPlacing){rect=item.rect;}else{var offset=this._getElementOffset(elem);rect=new Rect({x:this._getOption('originLeft')?offset.left:offset.right,y:this._getOption('originTop')?offset.top:offset.bottom});}
this._setRectSize(elem,rect);this.packer.placed(rect);this._setMaxXY(rect);};function verticalSorter(a,b){return a.position.y-b.position.y||a.position.x-b.position.x;}
function horizontalSorter(a,b){return a.position.x-b.position.x||a.position.y-b.position.y;}
proto.sortItemsByPosition=function(){var sorter=this._getOption('horizontal')?horizontalSorter:verticalSorter;this.items.sort(sorter);};proto.fit=function(elem,x,y){var item=this.getItem(elem);if(!item){return;}
this.stamp(item.element);item.enablePlacing();this.updateShiftTargets(item);x=x===undefined?item.rect.x:x;y=y===undefined?item.rect.y:y;this.shift(item,x,y);this._bindFitEvents(item);item.moveTo(item.rect.x,item.rect.y);this.shiftLayout();this.unstamp(item.element);this.sortItemsByPosition();item.disablePlacing();};proto._bindFitEvents=function(item){var _this=this;var ticks=0;function onLayout(){ticks++;if(ticks!=2){return;}
_this.dispatchEvent('fitComplete',null,[item]);}
item.once('layout',onLayout);this.once('layoutComplete',onLayout);};proto.resize=function(){if(!this.isResizeBound||!this.needsResizeLayout()){return;}
if(this.options.shiftPercentResize){this.resizeShiftPercentLayout();}else{this.layout();}};proto.needsResizeLayout=function(){var size=getSize(this.element);var innerSize=this._getOption('horizontal')?'innerHeight':'innerWidth';return size[innerSize]!=this.size[innerSize];};proto.resizeShiftPercentLayout=function(){var items=this._getItemsForLayout(this.items);var isHorizontal=this._getOption('horizontal');var coord=isHorizontal?'y':'x';var measure=isHorizontal?'height':'width';var segmentName=isHorizontal?'rowHeight':'columnWidth';var innerSize=isHorizontal?'innerHeight':'innerWidth';var previousSegment=this[segmentName];previousSegment=previousSegment&&previousSegment+this.gutter;if(previousSegment){this._getMeasurements();var currentSegment=this[segmentName]+this.gutter;items.forEach(function(item){var seg=Math.round(item.rect[coord]/previousSegment);item.rect[coord]=seg*currentSegment;});}else{var currentSize=getSize(this.element)[innerSize]+this.gutter;var previousSize=this.packer[measure];items.forEach(function(item){item.rect[coord]=(item.rect[coord]/previousSize)*currentSize;});}
this.shiftLayout();};proto.itemDragStart=function(elem){if(!this.isEnabled){return;}
this.stamp(elem);var item=this.getItem(elem);if(!item){return;}
item.enablePlacing();item.showDropPlaceholder();this.dragItemCount++;this.updateShiftTargets(item);};proto.updateShiftTargets=function(dropItem){this.shiftPacker.reset();this._getBoundingRect();var isOriginLeft=this._getOption('originLeft');var isOriginTop=this._getOption('originTop');this.stamps.forEach(function(stamp){var item=this.getItem(stamp);if(item&&item.isPlacing){return;}
var offset=this._getElementOffset(stamp);var rect=new Rect({x:isOriginLeft?offset.left:offset.right,y:isOriginTop?offset.top:offset.bottom});this._setRectSize(stamp,rect);this.shiftPacker.placed(rect);},this);var isHorizontal=this._getOption('horizontal');var segmentName=isHorizontal?'rowHeight':'columnWidth';var measure=isHorizontal?'height':'width';this.shiftTargetKeys=[];this.shiftTargets=[];var boundsSize;var segment=this[segmentName];segment=segment&&segment+this.gutter;if(segment){var segmentSpan=Math.ceil(dropItem.rect[measure]/segment);var segs=Math.floor((this.shiftPacker[measure]+this.gutter)/segment);boundsSize=(segs-segmentSpan)*segment;for(var i=0;i<segs;i++){this._addShiftTarget(i*segment,0,boundsSize);}}else{boundsSize=(this.shiftPacker[measure]+this.gutter)-dropItem.rect[measure];this._addShiftTarget(0,0,boundsSize);}
var items=this._getItemsForLayout(this.items);var packMethod=this._getPackMethod();items.forEach(function(item){var rect=item.rect;this._setRectSize(item.element,rect);this.shiftPacker[packMethod](rect);this._addShiftTarget(rect.x,rect.y,boundsSize);var cornerX=isHorizontal?rect.x+rect.width:rect.x;var cornerY=isHorizontal?rect.y:rect.y+rect.height;this._addShiftTarget(cornerX,cornerY,boundsSize);if(segment){var segSpan=Math.round(rect[measure]/segment);for(var i=1;i<segSpan;i++){var segX=isHorizontal?cornerX:rect.x+segment*i;var segY=isHorizontal?rect.y+segment*i:cornerY;this._addShiftTarget(segX,segY,boundsSize);}}},this);};proto._addShiftTarget=function(x,y,boundsSize){var checkCoord=this._getOption('horizontal')?y:x;if(checkCoord!==0&&checkCoord>boundsSize){return;}
var key=x+','+y;var hasKey=this.shiftTargetKeys.indexOf(key)!=-1;if(hasKey){return;}
this.shiftTargetKeys.push(key);this.shiftTargets.push({x:x,y:y});};proto.shift=function(item,x,y){var shiftPosition;var minDistance=Infinity;var position={x:x,y:y};this.shiftTargets.forEach(function(target){var distance=getDistance(target,position);if(distance<minDistance){shiftPosition=target;minDistance=distance;}});item.rect.x=shiftPosition.x;item.rect.y=shiftPosition.y;};function getDistance(a,b){var dx=b.x-a.x;var dy=b.y-a.y;return Math.sqrt(dx*dx+dy*dy);}
var DRAG_THROTTLE_TIME=120;proto.itemDragMove=function(elem,x,y){var item=this.isEnabled&&this.getItem(elem);if(!item){return;}
x-=this.size.paddingLeft;y-=this.size.paddingTop;var _this=this;function onDrag(){_this.shift(item,x,y);item.positionDropPlaceholder();_this.layout();}
var now=new Date();if(this._itemDragTime&&now-this._itemDragTime<DRAG_THROTTLE_TIME){clearTimeout(this.dragTimeout);this.dragTimeout=setTimeout(onDrag,DRAG_THROTTLE_TIME);}else{onDrag();this._itemDragTime=now;}};proto.itemDragEnd=function(elem){var item=this.isEnabled&&this.getItem(elem);if(!item){return;}
clearTimeout(this.dragTimeout);item.element.classList.add('is-positioning-post-drag');var completeCount=0;var _this=this;function onDragEndLayoutComplete(){completeCount++;if(completeCount!=2){return;}
item.element.classList.remove('is-positioning-post-drag');item.hideDropPlaceholder();_this.dispatchEvent('dragItemPositioned',null,[item]);}
item.once('layout',onDragEndLayoutComplete);this.once('layoutComplete',onDragEndLayoutComplete);item.moveTo(item.rect.x,item.rect.y);this.layout();this.dragItemCount=Math.max(0,this.dragItemCount-1);this.sortItemsByPosition();item.disablePlacing();this.unstamp(item.element);};proto.bindDraggabillyEvents=function(draggie){this._bindDraggabillyEvents(draggie,'on');};proto.unbindDraggabillyEvents=function(draggie){this._bindDraggabillyEvents(draggie,'off');};proto._bindDraggabillyEvents=function(draggie,method){var handlers=this.handleDraggabilly;draggie[method]('dragStart',handlers.dragStart);draggie[method]('dragMove',handlers.dragMove);draggie[method]('dragEnd',handlers.dragEnd);};proto.bindUIDraggableEvents=function($elems){this._bindUIDraggableEvents($elems,'on');};proto.unbindUIDraggableEvents=function($elems){this._bindUIDraggableEvents($elems,'off');};proto._bindUIDraggableEvents=function($elems,method){var handlers=this.handleUIDraggable;$elems
[method]('dragstart',handlers.start)
[method]('drag',handlers.drag)
[method]('dragstop',handlers.stop);};var _destroy=proto.destroy;proto.destroy=function(){_destroy.apply(this,arguments);this.isEnabled=false;};Packery.Rect=Rect;Packery.Packer=Packer;return Packery;}));/*!
* Packery layout mode v2.0.1
* sub-classes Packery
*/(function(window,factory){if(typeof define=='function'&&define.amd){define(['isotope-layout/js/layout-mode','packery/js/packery'],factory);}else if(typeof module=='object'&&module.exports){module.exports=factory(require('isotope-layout/js/layout-mode'),require('packery'));}else{factory(window.Isotope.LayoutMode,window.Packery);}}(window,function factor(LayoutMode,Packery){var PackeryMode=LayoutMode.create('packery');var proto=PackeryMode.prototype;var keepModeMethods={_getElementOffset:true,_getMeasurement:true};for(var method in Packery.prototype){if(!keepModeMethods[method]){proto[method]=Packery.prototype[method];}}
var _resetLayout=proto._resetLayout;proto._resetLayout=function(){this.packer=this.packer||new Packery.Packer();this.shiftPacker=this.shiftPacker||new Packery.Packer();_resetLayout.apply(this,arguments);};var _getItemLayoutPosition=proto._getItemLayoutPosition;proto._getItemLayoutPosition=function(item){item.rect=item.rect||new Packery.Rect();return _getItemLayoutPosition.call(this,item);};var _needsResizeLayout=proto.needsResizeLayout;proto.needsResizeLayout=function(){if(this._getOption('horizontal')){return this.needsVerticalResizeLayout();}else{return _needsResizeLayout.call(this);}};var _getOption=proto._getOption;proto._getOption=function(option){if(option=='horizontal'){return this.options.isHorizontal!==undefined?this.options.isHorizontal:this.options.horizontal;}
return _getOption.apply(this.isotope,arguments);};return PackeryMode;}));