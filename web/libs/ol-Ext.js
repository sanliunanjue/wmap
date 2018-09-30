/** Interaction hover do to something when hovering a feature
 * @constructor
 * @extends {ol.interaction.Interaction}
 * @fires hover, enter, leave
 * @param {olx.interaction.HoverOptions}
 *	- cursor { string | undefined } css cursor propertie or a function that gets a feature, default: none
 *	- featureFilter {function | undefined} filter a function with two arguments, the feature and the layer of the feature. Return true to select the feature
 *	- layerFilter {function | undefined} filter a function with one argument, the layer to test. Return true to test the layer
 *	- handleEvent { function | undefined } Method called by the map to notify the interaction that a browser event was dispatched to the map. The function may return false to prevent the propagation of the event to other interactions in the map's interactions chain.
 */
ol.interaction.Hover = function(options)
{	if (!options) options={};
    var self = this;
    ol.interaction.Interaction.call(this,
        {	handleEvent: function(e)
            {	if (e.type=="pointermove") { self.handleMove_(e); };
                if (options.handleEvent) return options.handleEvent(e);
                return true;
            }
        });
    this.setFeatureFilter (options.featureFilter);
    this.setLayerFilter (options.layerFilter);
    this.setCursor (options.cursor);
};
ol.inherits(ol.interaction.Hover, ol.interaction.Interaction);
/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.interaction.Hover.prototype.setMap = function(map)
{	if (this.previousCursor_!==undefined && this.getMap())
{	this.getMap().getTargetElement().style.cursor = this.previousCursor_;
    this.previousCursor_ = undefined;
}
    ol.interaction.Interaction.prototype.setMap.call (this, map);
};
/**
 * Set cursor on hover
 * @param { string } cursor css cursor propertie or a function that gets a feature, default: none
 * @api stable
 */
ol.interaction.Hover.prototype.setCursor = function(cursor)
{	if (!cursor && this.previousCursor_!==undefined && this.getMap())
{	this.getMap().getTargetElement().style.cursor = this.previousCursor_;
    this.previousCursor_ = undefined;
}
    this.cursor_ = cursor;
};
/** Feature filter to get only one feature
 * @param {function} filter a function with two arguments, the feature and the layer of the feature. Return true to select the feature
 */
ol.interaction.Hover.prototype.setFeatureFilter = function(filter)
{	if (typeof (filter) == 'function') this.featureFilter_ = filter;
else this.featureFilter_ = function(){ return true; };
};
/** Feature filter to get only one feature
 * @param {function} filter a function with one argument, the layer to test. Return true to test the layer
 */
ol.interaction.Hover.prototype.setLayerFilter = function(filter)
{	if (typeof (filter) == 'function') this.layerFilter_ = filter;
else this.layerFilter_ = function(){ return true; };
};
/** Get features whenmove
 * @param {ol.event} e "move" event
 */
ol.interaction.Hover.prototype.handleMove_ = function(e)
{	var map = this.getMap();
    if (map)
    {	//var b = map.hasFeatureAtPixel(e.pixel);
        var feature, layer;
        var self = this;
        var b = map.forEachFeatureAtPixel(e.pixel,
            function(f, l)
            {	if (self.layerFilter_.call(null, l)
                && self.featureFilter_.call(null,f,l))
            {	feature = f;
                layer = l;
                return true;
            }
            else
            {	feature = layer = null;
                return false;
            }
            });
        if (b) this.dispatchEvent({ type:"hover", feature:feature, layer:layer, coordinate:e.coordinate, pixel: e.pixel, map: e.map, dragging:e.dragging });
        if (this.feature_===feature && this.layer_===layer)
        {
        }
        else
        {	this.feature_ = feature;
            this.layer_ = layer;
            if (feature) this.dispatchEvent({ type:"enter", feature:feature, layer:layer, coordinate:e.coordinate, pixel: e.pixel, map: e.map, dragging:e.dragging });
            else this.dispatchEvent({ type:"leave", coordinate:e.coordinate, pixel: e.pixel, map: e.map, dragging:e.dragging });
        }
        if (this.cursor_)
        {	var style = map.getTargetElement().style;
            if (b)
            {	if (style.cursor != this.cursor_)
            {	this.previousCursor_ = style.cursor;
                style.cursor = this.cursor_;
            }
            }
            else if (this.previousCursor_ !== undefined)
            {	style.cursor = this.previousCursor_;
                this.previousCursor_ = undefined;
            }
        }
    }
};
/**
 * @classdesc
 * A popup element to be displayed over the map and attached to a single map
 * location. The popup are customized using CSS.
 *
 * @example
var popup = new ol.Overlay.Popup();
map.addOverlay(popup);
popup.show(coordinate, "Hello!");
popup.hide();
 *
 * @constructor
 * @extends {ol.Overlay}
 * @param {} options Extend Overlay options 
 *	@param {String} options.popupClass the a class of the overlay to style the popup.
 *	@param {bool} options.closeBox popup has a close box, default false.
 *	@param {function|undefined} options.onclose: callback function when popup is closed
 *	@param {function|undefined} options.onshow callback function when popup is shown
 *	@param {ol.OverlayPositioning | string | undefined} options.positionning 
 *		the 'auto' positioning var the popup choose its positioning to stay on the map.
 * @api stable
 */
ol.Overlay.Popup = function (options)
{	var self = this;
	var elt = this._elt = $("<div>");
	options.element = elt.get(0);
	this.offsetBox = options.offsetBox;
	// Anchor div
	$("<div>").addClass("anchor").appendTo(elt);
	var d = $("<div>").addClass('ol-overlaycontainer-stopevent').appendTo(elt);
	// Content
	this.content = $("<div>").addClass("content").appendTo(d).get(0);
	// Closebox
	this.closeBox = options.closeBox;
	this.onclose = options.onclose;      
	this.onshow = options.onshow;      
	$("<button>").addClass("closeBox").addClass(options.closeBox?"hasclosebox":"")
				.attr('type', 'button')
				.prependTo(d)
				.click(function()
				{	self.hide();
				});
	// Stop event
	options.stopEvent = true;
	d.on("mousedown touchstart", function(e){ e.stopPropagation(); })
	ol.Overlay.call(this, options);
	// call setPositioning first in constructor so getClassPositioning is called only once
	this.setPositioning(options.positioning);
	this.setPopupClass(options.popupClass);
};
ol.inherits(ol.Overlay.Popup, ol.Overlay);
/**
 * Get CSS class of the popup according to its positioning.
 * @private
 */
ol.Overlay.Popup.prototype.getClassPositioning = function ()
{	var c = "";
	var pos = this.getPositioning();
	if (/bottom/.test(pos)) c += "ol-popup-bottom ";
	if (/top/.test(pos)) c += "ol-popup-top ";
	if (/left/.test(pos)) c += "ol-popup-left ";
	if (/right/.test(pos)) c += "ol-popup-right ";
	if (/^center/.test(pos)) c += "ol-popup-middle ";
	if (/center$/.test(pos)) c += "ol-popup-center ";
	return c;
};
/**
 * Set a close box to the popup.
 * @param {bool} b
 * @api stable
 */
ol.Overlay.Popup.prototype.setClosebox = function (b)
{	this.closeBox = b;
	if (b) this._elt.addClass("hasclosebox");
	else this._elt.removeClass("hasclosebox");
};
/**
 * Set the CSS class of the popup.
 * @param {string} c class name.
 * @api stable
 */
ol.Overlay.Popup.prototype.setPopupClass = function (c)
{	this._elt.removeClass()
		.addClass("ol-popup "+(c||"default")+" "+this.getClassPositioning()+(this.closeBox?" hasclosebox":""));
};
/**
 * Add a CSS class to the popup.
 * @param {string} c class name.
 * @api stable
 */
ol.Overlay.Popup.prototype.addPopupClass = function (c)
{	this._elt.addClass(c);
};
/**
 * Remove a CSS class to the popup.
 * @param {string} c class name.
 * @api stable
 */
ol.Overlay.Popup.prototype.removePopupClass = function (c)
{	this._elt.removeClass(c);
};
/**
 * Set positionning of the popup
 * @param {ol.OverlayPositioning | string | undefined} pos an ol.OverlayPositioning 
 * 		or 'auto' to var the popup choose the best position
 * @api stable
 */
ol.Overlay.Popup.prototype.setPositioning = function (pos)
{	if (pos === undefined)
		return;
	if (/auto/.test(pos))
	{	this.autoPositioning = pos.split('-');
		if (this.autoPositioning.length==1) this.autoPositioning[1]="auto";
	}
	else this.autoPositioning = false;
	pos = pos.replace(/auto/g,"center");
	if (pos=="center") pos = "bottom-center";
	this.setPositioning_(pos);
};
/** @private
 * @param {ol.OverlayPositioning | string | undefined} pos  
 */
ol.Overlay.Popup.prototype.setPositioning_ = function (pos)
{	ol.Overlay.prototype.setPositioning.call(this, pos);
	this._elt.removeClass("ol-popup-top ol-popup-bottom ol-popup-left ol-popup-right ol-popup-center ol-popup-middle");
	this._elt.addClass(this.getClassPositioning());
};
/** Check if popup is visible
* @return {boolean}
*/
ol.Overlay.Popup.prototype.getVisible = function ()
{	return this._elt.hasClass("visible");
};
/**
 * Set the position and the content of the popup.
 * @param {ol.Coordinate|string} coordinate the coordinate of the popup or the HTML content.
 * @param {string|undefined} html the HTML content (undefined = previous content).
 * @example
var popup = new ol.Overlay.Popup();
// Show popup
popup.show([166000, 5992000], "Hello world!");
// Move popup at coord with the same info
popup.show([167000, 5990000]);
// set new info
popup.show("New informations");
 * @api stable
 */
ol.Overlay.Popup.prototype.show = function (coordinate, html)
{	if (!html && typeof(coordinate)=='string') 
	{	html = coordinate; 
		coordinate = null;
	}
	var self = this;
	var map = this.getMap();
	if (!map) return;
	if (html && html !== this.prevHTML) 
	{	// Prevent flickering effect
		this.prevHTML = html;
		$(this.content).html("").append(html);
		// Refresh when loaded (img)
		$("*", this.content).on('load',function()
		{	map.renderSync();
		})
	}
	if (coordinate) 
	{	// Auto positionning
		if (this.autoPositioning)
		{	var p = map.getPixelFromCoordinate(coordinate);
			var s = map.getSize();
			var pos=[];
			if (this.autoPositioning[0]=='auto')
			{	pos[0] = (p[1]<s[1]/3) ? "top" : "bottom";
			}
			else pos[0] = this.autoPositioning[0];
			pos[1] = (p[0]<2*s[0]/3) ? "left" : "right";
			this.setPositioning_(pos[0]+"-"+pos[1]);
			if (this.offsetBox)
			{	this.setOffset([this.offsetBox[pos[1]=="left"?2:0], this.offsetBox[pos[0]=="top"?3:1] ]);
			}
		}
		// Show
		this.setPosition(coordinate);
		// Set visible class (wait to compute the size/position first)
		this._elt.parent().show();
                if (typeof (this.onshow) == 'function') this.onshow();
		this._tout = setTimeout (function()
		{	self._elt.addClass("visible"); 
		}, 0);
	}
};
/**
 * Hide the popup
 * @api stable
 */
ol.Overlay.Popup.prototype.hide = function ()
{	if (this.getPosition() == undefined) return;
	if (typeof (this.onclose) == 'function') this.onclose();
	this.setPosition(undefined);
	if (this._tout) clearTimeout(this._tout);
	this._elt.removeClass("visible");
};

/** Interaction rotate
 * @constructor
 * @extends {ol.interaction.Interaction}
 * @fires drawstart, drawing, drawend, drawcancel
 * @param {olx.interaction.TransformOptions} options
 *  @param {Array<ol.Layer>} source Destination source for the drawn features
 *  @param {ol.Collection<ol.Feature>} features Destination collection for the drawn features 
 *	@param {ol.style.Style | Array.<ol.style.Style> | ol.style.StyleFunction | undefined} style style for the sketch
 *	@param {integer} sides number of sides, default 0 = circle
 *	@param { ol.events.ConditionType | undefined } squareCondition A function that takes an ol.MapBrowserEvent and returns a boolean to draw square features.
 *	@param { ol.events.ConditionType | undefined } centerCondition A function that takes an ol.MapBrowserEvent and returns a boolean to draw centered features.
 *	@param { bool } canRotate Allow rotation when centered + square, default: true
 *	@param { number } clickTolerance click tolerance on touch devices, default: 6
 *	@param { number } maxCircleCoordinates Maximum number of point on a circle, default: 100
 */
ol.interaction.DrawRegular = function(options)
{	if (!options) options={};
	var self = this;
	this.squaredClickTolerance_ = options.clickTolerance ? options.clickTolerance * options.clickTolerance : 36;
	this.maxCircleCoordinates_ = options.maxCircleCoordinates || 100;
	// Collection of feature to transform 
	this.features_ = options.features;
	// List of layers to transform 
	this.source_ = options.source;
	// Square condition
	this.squareFn_ = options.squareCondition;
	// Centered condition
	this.centeredFn_ = options.centerCondition;
	// Allow rotation when centered + square
	this.canRotate_ = (options.canRotate !== false);
	// Number of sides (default=0: circle)
	this.setSides(options.sides);
	// Style
	var white = [255, 255, 255, 1];
	var blue = [0, 153, 255, 1];
	var width = 3;
	var defaultStyle = [
		new ol.style.Style({
			stroke: new ol.style.Stroke({ color: white, width: width + 2 })
		}),
		new ol.style.Style({
			image: new ol.style.Circle({
				radius: width * 2,
				fill: new ol.style.Fill({ color: blue }),
				stroke: new ol.style.Stroke({ color: white, width: width / 2 })
			}),
			stroke: new ol.style.Stroke({ color: blue, width: width }),
			fill: new ol.style.Fill({
				color: [255, 255, 255, 0.5]
			})
		})
	];
	// Create a new overlay layer for the sketch
	this.sketch_ = new ol.Collection();
	this.overlayLayer_ = new ol.layer.Vector(
		{	source: new ol.source.Vector({
				features: this.sketch_,
				useSpatialIndex: false
			}),
			name:'DrawRegular overlay',
			displayInLayerSwitcher: false,
			style: options.style || defaultStyle
		});
	ol.interaction.Interaction.call(this,
		{	
			/*
			handleDownEvent: this.handleDownEvent_,
			handleMoveEvent: this.handleMoveEvent_,
			handleUpEvent: this.handleUpEvent_,
			*/
			handleEvent: this.handleEvent_
		});
};
ol.inherits(ol.interaction.DrawRegular, ol.interaction.Interaction);
/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.interaction.DrawRegular.prototype.setMap = function(map)
{	if (this.getMap()) this.getMap().removeLayer(this.overlayLayer_);
	ol.interaction.Interaction.prototype.setMap.call (this, map);
	this.overlayLayer_.setMap(map);
};
/**
 * Activate/deactivate the interaction
 * @param {boolean}
 * @api stable
 */
ol.interaction.DrawRegular.prototype.setActive = function(b)
{	this.reset();
	ol.interaction.Interaction.prototype.setActive.call (this, b);
}
/**
 * Reset the interaction
 * @api stable
 */
ol.interaction.DrawRegular.prototype.reset = function()
{	this.overlayLayer_.getSource().clear();
	this.started_ = false;
}
/**
 * Set the number of sides.
 * @param {int} number of sides.
 * @api stable
 */
ol.interaction.DrawRegular.prototype.setSides = function (nb)
{	nb = parseInt(nb);
	this.sides_ = nb>2 ? nb : 0;
}
/**
 * Allow rotation when centered + square
 * @param {bool} 
 * @api stable
 */
ol.interaction.DrawRegular.prototype.canRotate = function (b)
{	if (b===true || b===false) this.canRotate_ = b;
	return this.canRotate_;
}
/**
 * Get the number of sides.
 * @return {int} number of sides.
 * @api stable
 */
ol.interaction.DrawRegular.prototype.getSides = function ()
{	return this.sides_;
}
/** Default start angle array for each sides
*/
ol.interaction.DrawRegular.prototype.startAngle =
{	'default':Math.PI/2,
	3: -Math.PI/2,
	4: Math.PI/4
};
/** Get geom of the current drawing
* @return {ol.geom.Polygon | ol.geom.Point}
*/
ol.interaction.DrawRegular.prototype.getGeom_ = function ()
{	this.overlayLayer_.getSource().clear();
	if (!this.center_) return false;
	var g;
	if (this.coord_)
	{	var center = this.center_;
		var coord = this.coord_;
		// Special case: circle
		if (!this.sides_ && this.square_ && !this.centered_){
			center = [(coord[0] + center[0])/2, (coord[1] + center[1])/2];
			var d = [coord[0] - center[0], coord[1] - center[1]];
			var r = Math.sqrt(d[0]*d[0]+d[1]*d[1]);
			var circle = new ol.geom.Circle(center, r, 'XY');
			// Optimize points on the circle
			var centerPx = this.getMap().getPixelFromCoordinate(center);
			var dmax = Math.max (100, Math.abs(centerPx[0]-this.coordPx_[0]), Math.abs(centerPx[1]-this.coordPx_[1]));
			dmax = Math.min ( this.maxCircleCoordinates_, Math.round(dmax / 3 ));
			return ol.geom.Polygon.fromCircle (circle, dmax, 0);
		}
		else {
			var hasrotation = this.canRotate_ && this.centered_ && this.square_;
			var d = [coord[0] - center[0], coord[1] - center[1]];
			if (this.square_ && !hasrotation) 
			{	//var d = [coord[0] - center[0], coord[1] - center[1]];
				var dm = Math.max (Math.abs(d[0]), Math.abs(d[1])); 
				coord[0] = center[0] + (d[0]>0 ? dm:-dm);
				coord[1] = center[1] + (d[1]>0 ? dm:-dm);
			}
			var r = Math.sqrt(d[0]*d[0]+d[1]*d[1]);
			if (r>0)
			{	var circle = new ol.geom.Circle(center, r, 'XY');
				var a;
				if (hasrotation) a = Math.atan2(d[1], d[0]);
				else a = this.startAngle[this.sides_] || this.startAngle['default'];
				if (this.sides_) g = ol.geom.Polygon.fromCircle (circle, this.sides_, a);
				else
				{	// Optimize points on the circle
					var centerPx = this.getMap().getPixelFromCoordinate(this.center_);
					var dmax = Math.max (100, Math.abs(centerPx[0]-this.coordPx_[0]), Math.abs(centerPx[1]-this.coordPx_[1]));
					dmax = Math.min ( this.maxCircleCoordinates_, Math.round(dmax / (this.centered_ ? 3:5) ));
					g = ol.geom.Polygon.fromCircle (circle, dmax, 0);
				}
				if (hasrotation) return g;
				// Scale polygon to fit extent
				var ext = g.getExtent();
				if (!this.centered_) center = this.center_;
				else center = [ 2*this.center_[0]-this.coord_[0], 2*this.center_[1]-this.coord_[1] ];
				var scx = (center[0] - coord[0]) / (ext[0] - ext[2]);
				var scy = (center[1] - coord[1]) / (ext[1] - ext[3]);
				if (this.square_) 
				{	var sc = Math.min(Math.abs(scx),Math.abs(scy));
					scx = Math.sign(scx)*sc;
					scy = Math.sign(scy)*sc;
				}
				var t = [ center[0] - ext[0]*scx, center[1] - ext[1]*scy ];
				g.applyTransform(function(g1, g2, dim)
				{	for (i=0; i<g1.length; i+=dim)
					{	g2[i] = g1[i]*scx + t[0];
						g2[i+1] = g1[i+1]*scy + t[1];
					}
					return g2;
				});
				return g;
			}
		}
	}
	// No geom => return a point
	return new ol.geom.Point(this.center_);
};
/** Draw sketch
* @return {ol.Feature} The feature being drawn.
*/
ol.interaction.DrawRegular.prototype.drawSketch_ = function(evt)
{	this.overlayLayer_.getSource().clear();
	if (evt)
	{	this.square_ = this.squareFn_ ? this.squareFn_(evt) : evt.originalEvent.shiftKey;
		this.centered_ = this.centeredFn_ ? this.centeredFn_(evt) : evt.originalEvent.metaKey || evt.originalEvent.ctrlKey;
		var g = this.getGeom_();
		if (g) 
		{	var f = this.feature_;
			f.setGeometry (g);
			this.overlayLayer_.getSource().addFeature(f);
			if (this.coord_ && this.square_ && ((this.canRotate_ && this.centered_ && this.coord_) || (!this.sides_ && !this.centered_)))
			{	this.overlayLayer_.getSource().addFeature(new ol.Feature(new ol.geom.LineString([this.center_,this.coord_])));
			}
			return f;
		}
	}
};
/** Draw sketch (Point)
*/
ol.interaction.DrawRegular.prototype.drawPoint_ = function(pt, noclear)
{	if (!noclear) this.overlayLayer_.getSource().clear();
	this.overlayLayer_.getSource().addFeature(new ol.Feature(new ol.geom.Point(pt)));
};
/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 */
ol.interaction.DrawRegular.prototype.handleEvent_ = function(evt)
{	switch (evt.type)
	{	case "pointerdown": {
			this.downPx_ = evt.pixel;
			this.start_(evt);
		}
		break;
		case "pointerup":
			// Started and fisrt move
			if (this.started_ && this.coord_)
			{	var dx = this.downPx_[0] - evt.pixel[0];
				var dy = this.downPx_[1] - evt.pixel[1];
				if (dx*dx + dy*dy <= this.squaredClickTolerance_) 
				{	// The pointer has moved
					if ( this.lastEvent == "pointermove" )
					{	this.end_(evt);
					}
					// On touch device there is no move event : terminate = click on the same point
					else
					{	dx = this.upPx_[0] - evt.pixel[0];
						dy = this.upPx_[1] - evt.pixel[1];
						if ( dx*dx + dy*dy <= this.squaredClickTolerance_)
						{	this.end_(evt);
						}
						else 
						{	this.handleMoveEvent_(evt);
							this.drawPoint_(evt.coordinate,true);
						}
					}
				}
			}
			this.upPx_ = evt.pixel;	
		break;
		case "pointerdrag":
			if (this.started_)
			{	var centerPx = this.getMap().getPixelFromCoordinate(this.center_);
				var dx = centerPx[0] - evt.pixel[0];
				var dy = centerPx[1] - evt.pixel[1];
				if (dx*dx + dy*dy <= this.squaredClickTolerance_) 
				{ 	this.reset();
				}
			}
			break;
		case "pointermove":
			if (this.started_)
			{	var dx = this.downPx_[0] - evt.pixel[0];
				var dy = this.downPx_[1] - evt.pixel[1];
				if (dx*dx + dy*dy > this.squaredClickTolerance_) 
				{	this.handleMoveEvent_(evt);
					this.lastEvent = evt.type;
				}
			}
			break;
		default:
			this.lastEvent = evt.type;
			// Prevent zoom in on dblclick
			if (this.started_ && evt.type==='dblclick') 
			{	//evt.stopPropagation();
				return false;
			}
			break;
	}
	return true;
}
/** Stop drawing.
 */
ol.interaction.DrawRegular.prototype.finishDrawing = function()
{	if (this.started_ && this.coord_)
	{	this.end_({ pixel: this.upPx_, coordinate: this.coord_});
	}
};
/**
 * @param {ol.MapBrowserEvent} evt Event.
 */
ol.interaction.DrawRegular.prototype.handleMoveEvent_ = function(evt)
{	if (this.started_)
	{	this.coord_ = evt.coordinate;
		this.coordPx_ = evt.pixel;
		var f = this.drawSketch_(evt);
		this.dispatchEvent({ 
			type:'drawing', 
			feature: f, 
			pixel: evt.pixel, 
			startCoordinate: this.center_,
			coordinate: evt.coordinate, 
			square: this.square_, 
			centered: this.centered_ 
		});
	}
	else 
	{	this.drawPoint_(evt.coordinate);
	}
};
/** Start an new draw
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `false` to stop the drag sequence.
 */
ol.interaction.DrawRegular.prototype.start_ = function(evt)
{	if (!this.started_)
	{	this.started_ = true;
		this.center_ = evt.coordinate;
		this.coord_ = null;
		var f = this.feature_ = new ol.Feature();
		this.drawSketch_(evt);
		this.dispatchEvent({ type:'drawstart', feature: f, pixel: evt.pixel, coordinate: evt.coordinate });
	}
	else 
	{	this.coord_ = evt.coordinate;
	}
};
/** End drawing
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `false` to stop the drag sequence.
 */
ol.interaction.DrawRegular.prototype.end_ = function(evt)
{	this.coord_ = evt.coordinate;
	this.started_ = false;
	// Add new feature
	if (this.coord_ && this.center_[0]!=this.coord_[0] && this.center_[1]!=this.coord_[1])
	{	var f = this.feature_;
		f.setGeometry(this.getGeom_());
		if (this.source_) this.source_.addFeature(f);
		else if (this.features_) this.features_.push(f);
		this.dispatchEvent({ type:'drawend', feature: f, pixel: evt.pixel, coordinate: evt.coordinate, square: this.square_, centered: this.centered_ });
	}
	else
	{	this.dispatchEvent({ type:'drawcancel', feature: null, pixel: evt.pixel, coordinate: evt.coordinate, square: this.square_, centered: this.centered_ });
	}
	this.center_ = this.coord_ = null;
	this.drawSketch_();
};
/** Interaction rotate
 * @constructor
 * @extends {ol.interaction.Pointer}
 * @fires select | rotatestart | rotating | rotateend | translatestart | translating | translateend | scalestart | scaling | scaleend
 * @param {olx.interaction.TransformOptions} 
 *  - layers {Array<ol.Layer>} array of layers to transform, 
 *  - features {ol.Collection<ol.Feature>} collection of feature to transform, 
 *	- translateFeature {bool} Translate when click on feature
 *	- translate {bool} Can translate the feature
 *	- stretch {bool} can stretch the feature
 *	- scale {bool} can scale the feature
 *	- rotate {bool} can rotate the feature
 *	- keepAspectRatio { ol.events.ConditionType | undefined } A function that takes an ol.MapBrowserEvent and returns a boolean to keep aspect ratio, default ol.events.condition.shiftKeyOnly.
 *	- style {} list of ol.style for handles
 *
 */
ol.interaction.Transform = function(options)
{	if (!options) options={};
	var self = this;
	// Create a new overlay layer for the sketch
	this.handles_ = new ol.Collection();
	this.overlayLayer_ = new ol.layer.Vector(
		{	source: new ol.source.Vector({
				features: this.handles_,
				useSpatialIndex: false
			}),
			name:'Transform overlay',
			displayInLayerSwitcher: false,
			// Return the style according to the handle type
			style: function (feature)
				{	return (self.style[(feature.get('handle')||'default')+(feature.get('constraint')||'')+(feature.get('option')||'')]);
				}
		});
	// Extend pointer
	ol.interaction.Pointer.call(this,
	{	handleDownEvent: this.handleDownEvent_,
		handleDragEvent: this.handleDragEvent_,
		handleMoveEvent: this.handleMoveEvent_,
		handleUpEvent: this.handleUpEvent_
	});
	/** Collection of feature to transform */
	this.features_ = options.features;
	/** List of layers to transform */
	this.layers_ = options.layers ? (options.layers instanceof Array) ? options.layers:[options.layers] : null;
	/** Translate when click on feature */
	this.set('translateFeature', (options.translateFeature!==false));
	/** Can translate the feature */
	this.set('translate', (options.translate!==false));
	/** Can stretch the feature */
	this.set('stretch', (options.stretch!==false));
	/** Can scale the feature */
	this.set('scale', (options.scale!==false));
	/** Can rotate the feature */
	this.set('rotate', (options.rotate!==false));
	/** Keep aspect ratio */
	this.set('keepAspectRatio', (options.keepAspectRatio || function(e){ return e.originalEvent.shiftKey }));
	// Force redraw when changed
	this.on ('propertychange', function()
	{	this.drawSketch_();
	});
	// setstyle
	this.setDefaultStyle();
};
ol.inherits(ol.interaction.Transform, ol.interaction.Pointer);
/** Cursors for transform
*/
ol.interaction.Transform.prototype.Cursors =
{	'default':	'auto',
	'select':	'pointer',
	'translate':'move',
	'rotate':	'move',
	'scale':	'ne-resize', 
	'scale1':	'nw-resize', 
	'scale2':	'ne-resize', 
	'scale3':	'nw-resize',
	'scalev':	'e-resize', 
	'scaleh1':	'n-resize', 
	'scalev2':	'e-resize', 
	'scaleh3':	'n-resize'
};
/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.interaction.Transform.prototype.setMap = function(map)
{	if (this.getMap()) this.getMap().removeLayer(this.overlayLayer_);
	ol.interaction.Pointer.prototype.setMap.call (this, map);
	this.overlayLayer_.setMap(map);
 	if (map !== null) {
		this.isTouch = /touch/.test(map.getViewport().className);
		this.setDefaultStyle();
	}
};
/**
 * Activate/deactivate interaction
 * @param {bool} 
 * @api stable
 */
ol.interaction.Transform.prototype.setActive = function(b)
{	this.select(null);
	this.overlayLayer_.setVisible(b);
	ol.interaction.Pointer.prototype.setActive.call (this, b);
};
/** Set efault sketch style
*/
ol.interaction.Transform.prototype.setDefaultStyle = function()
{	// Style
	var stroke = new ol.style.Stroke({ color: [255,0,0,1], width: 1 });
	var strokedash = new ol.style.Stroke({ color: [255,0,0,1], width: 1, lineDash:[4,4] });
	var fill0 = new ol.style.Fill({ color:[255,0,0,0.01] });
	var fill = new ol.style.Fill({ color:[255,255,255,0.8] });
	var circle = new ol.style.RegularShape({
					fill: fill,
					stroke: stroke,
					radius: this.isTouch ? 12 : 6,
					points: 15
				});
	circle.getAnchor()[0] = this.isTouch ? -10 : -5;
	var bigpt = new ol.style.RegularShape({
					fill: fill,
					stroke: stroke,
					radius: this.isTouch ? 16 : 8,
					points: 4,
					angle: Math.PI/4
				});
	var smallpt = new ol.style.RegularShape({
					fill: fill,
					stroke: stroke,
					radius: this.isTouch ? 12 : 6,
					points: 4,
					angle: Math.PI/4
				});
	function createStyle (img, stroke, fill) 
	{	return [ new ol.style.Style({image:img, stroke:stroke, fill:fill}) ];
	}
	/** Style for handles */
	this.style = 
	{	'default': createStyle (bigpt, strokedash, fill0),
		'translate': createStyle (bigpt, stroke, fill),
		'rotate': createStyle (circle, stroke, fill),
		'rotate0': createStyle (bigpt, stroke, fill),
		'scale': createStyle (bigpt, stroke, fill),
		'scale1': createStyle (bigpt, stroke, fill),
		'scale2': createStyle (bigpt, stroke, fill),
		'scale3': createStyle (bigpt, stroke, fill),
		'scalev': createStyle (smallpt, stroke, fill),
		'scaleh1': createStyle (smallpt, stroke, fill),
		'scalev2': createStyle (smallpt, stroke, fill),
		'scaleh3': createStyle (smallpt, stroke, fill),
	};
	this.drawSketch_();
}
/**
 * Set sketch style.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.interaction.Transform.prototype.setStyle = function(style, olstyle)
{	if (!olstyle) return;
	if (olstyle instanceof Array) this.style[style] = olstyle;
	else this.style[style] = [ olstyle ];
	for (var i=0; i<this.style[style].length; i++)
	{	var im = this.style[style][i].getImage();
		if (im) 
		{	if (style == 'rotate') im.getAnchor()[0] = -5;
			if (this.isTouch) im.setScale(1.8);
		}
		var tx = this.style[style][i].getText();
		if (tx) 
		{	if (style == 'rotate') tx.setOffsetX(this.isTouch ? 14 : 7);
			if (this.isTouch) tx.setScale(1.8);
		}
	}
	this.drawSketch_();
};
/** Get Feature at pixel
 * @param {ol.Pixel} 
 * @return {ol.feature} 
 * @private
 */
ol.interaction.Transform.prototype.getFeatureAtPixel_ = function(pixel)
{	var self = this;
	return this.getMap().forEachFeatureAtPixel(pixel,
		function(feature, layer) 
		{	var found = false;
			// Overlay ?
			if (!layer)
			{	if (feature===self.bbox_) return false;
				self.handles_.forEach (function(f) { if (f===feature) found=true; });
				if (found) return { feature: feature, handle:feature.get('handle'), constraint:feature.get('constraint'), option:feature.get('option') };
			}
			// feature belong to a layer
			if (self.layers_)
			{	for (var i=0; i<self.layers_.length; i++)
				{	if (self.layers_[i]===layer) return { feature: feature };
				}
				return null;
			}
			// feature in the collection
			else if (self.features_)
			{	self.features_.forEach (function(f) { if (f===feature) found=true; });
				if (found) return { feature: feature };
				else return null;
			}
			// Others
			else return { feature: feature };
		}) || {};
}
/** Draw transform sketch
* @param {boolean} draw only the center
*/
ol.interaction.Transform.prototype.drawSketch_ = function(center)
{
	this.overlayLayer_.getSource().clear();
	if (!this.feature_) return;
	if (center===true)
	{	if (!this.ispt_) 
		{	this.overlayLayer_.getSource().addFeature(new ol.Feature( { geometry: new ol.geom.Point(this.center_), handle:'rotate0' }) );
			var ext = this.feature_.getGeometry().getExtent();
			var geom = ol.geom.Polygon.fromExtent(ext);
			var f = this.bbox_ = new ol.Feature(geom);
			this.overlayLayer_.getSource().addFeature (f);
		}
	}
	else
	{	var ext = this.feature_.getGeometry().getExtent();
		if (this.ispt_) 
		{	var p = this.getMap().getPixelFromCoordinate([ext[0], ext[1]]);
			ext = ol.extent.boundingExtent(
				[	this.getMap().getCoordinateFromPixel([p[0]-10, p[1]-10]),
					this.getMap().getCoordinateFromPixel([p[0]+10, p[1]+10])
				]);
		}
		var geom = ol.geom.Polygon.fromExtent(ext);
		var f = this.bbox_ = new ol.Feature(geom);
		var features = [];
		var g = geom.getCoordinates()[0];
		if (!this.ispt_) 
		{	features.push(f);
			// Middle
			if (this.get('stretch') && this.get('scale')) for (var i=0; i<g.length-1; i++)
			{	f = new ol.Feature( { geometry: new ol.geom.Point([(g[i][0]+g[i+1][0])/2,(g[i][1]+g[i+1][1])/2]), handle:'scale', constraint:i%2?"h":"v", option:i });
				features.push(f);
			}
			// Handles
			if (this.get('scale')) for (var i=0; i<g.length-1; i++)
			{	f = new ol.Feature( { geometry: new ol.geom.Point(g[i]), handle:'scale', option:i });
				features.push(f);
			}
			// Center
			if (this.get('translate') && !this.get('translateFeature'))
			{	f = new ol.Feature( { geometry: new ol.geom.Point([(g[0][0]+g[2][0])/2, (g[0][1]+g[2][1])/2]), handle:'translate' });
				features.push(f);
			}
		}
		// Rotate
		if (this.get('rotate')) 
		{	f = new ol.Feature( { geometry: new ol.geom.Point(g[3]), handle:'rotate' });
			features.push(f);
		}
		// Add sketch
		this.overlayLayer_.getSource().addFeatures(features);
	}
};
/** Select a feature to transform
* @param {ol.Feature} the feature to transform
*/
ol.interaction.Transform.prototype.select = function(feature)
{	this.feature_ = feature;
	this.ispt_ = this.feature_ ? (this.feature_.getGeometry().getType() == "Point") : false;
	this.drawSketch_();
	this.dispatchEvent({ type:'select', feature: this.feature_ });
}
/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
ol.interaction.Transform.prototype.handleDownEvent_ = function(evt)
{
	var sel = this.getFeatureAtPixel_(evt.pixel);
	var feature = sel.feature;
	if (this.feature_ && this.feature_==feature && ((this.ispt_ && this.get('translate')) || this.get('translateFeature')))
	{	sel.handle = 'translate';
	}
	if (sel.handle)
	{	this.mode_ = sel.handle;
		this.opt_ = sel.option;
		this.constraint_ = sel.constraint;
		// Save info
		this.coordinate_ = evt.coordinate;
		this.pixel_ = evt.pixel;
		this.geom_ = this.feature_.getGeometry().clone();
		this.extent_ = (ol.geom.Polygon.fromExtent(this.geom_.getExtent())).getCoordinates()[0];
		this.center_ = ol.extent.getCenter(this.geom_.getExtent());
		this.angle_ = Math.atan2(this.center_[1]-evt.coordinate[1], this.center_[0]-evt.coordinate[0]);
		this.dispatchEvent({ type:this.mode_+'start', feature: this.feature_, pixel: evt.pixel, coordinate: evt.coordinate });
		return true;
	}
	else
	{	this.feature_ = feature;
		this.ispt_ = this.feature_ ? (this.feature_.getGeometry().getType() == "Point") : false;
		this.drawSketch_();
		this.dispatchEvent({ type:'select', feature: this.feature_, pixel: evt.pixel, coordinate: evt.coordinate });
		return false;
	}
};
/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 */
ol.interaction.Transform.prototype.handleDragEvent_ = function(evt)
{
	switch (this.mode_)
	{	case 'rotate':
		{	var a = Math.atan2(this.center_[1]-evt.coordinate[1], this.center_[0]-evt.coordinate[0]);
			if (!this.ispt)
			{	var geometry = this.geom_.clone();
				geometry.rotate(a-this.angle_, this.center_);
				this.feature_.setGeometry(geometry);
			}
			this.drawSketch_(true);
			this.dispatchEvent({ type:'rotating', feature: this.feature_, angle: a-this.angle_, pixel: evt.pixel, coordinate: evt.coordinate });
			break;
		}
		case 'translate':
		{	var deltaX = evt.coordinate[0] - this.coordinate_[0];
			var deltaY = evt.coordinate[1] - this.coordinate_[1];
			this.feature_.getGeometry().translate(deltaX, deltaY);
			this.handles_.forEach(function(f)
			{	f.getGeometry().translate(deltaX, deltaY);
			});
			this.coordinate_ = evt.coordinate;
			this.dispatchEvent({ type:'translating', feature: this.feature_, delta:[deltaX,deltaY], pixel: evt.pixel, coordinate: evt.coordinate });
			break;
		}
		case 'scale':
		{	var center = this.center_;
			if (evt.originalEvent.metaKey || evt.originalEvent.ctrlKey)
			{	center = this.extent_[(Number(this.opt_)+2)%4];
			}
			var scx = (evt.coordinate[0] - center[0]) / (this.coordinate_[0] - center[0]);
			var scy = (evt.coordinate[1] - center[1]) / (this.coordinate_[1] - center[1]);
			if (this.constraint_)
			{	if (this.constraint_=="h") scx=1;
				else scy=1;
			}
			else
			{	if (this.get('keepAspectRatio')(evt)) //evt.originalEvent.shiftKey)
				{	scx = scy = Math.min(scx,scy);
				}
			}
			var geometry = this.geom_.clone();
			geometry.applyTransform(function(g1, g2, dim)
			{	if (dim<2) return g2;
				for (i=0; i<g1.length; i+=dim)
				{	if (scx!=1) g2[i] = center[0] + (g1[i]-center[0])*scx;
					if (scy!=1) g2[i+1] = center[1] + (g1[i+1]-center[1])*scy;
				}
				return g2;
			});
			this.feature_.setGeometry(geometry);
			this.drawSketch_();
			this.dispatchEvent({ type:'scaling', feature: this.feature_, scale:[scx,scy], pixel: evt.pixel, coordinate: evt.coordinate });
		}
		default: break;
	}
};
/**
 * @param {ol.MapBrowserEvent} evt Event.
 */
ol.interaction.Transform.prototype.handleMoveEvent_ = function(evt)
{
	// console.log("handleMoveEvent");
	if (!this.mode_) 
	{	var map = evt.map;
		var sel = this.getFeatureAtPixel_(evt.pixel);
		var element = evt.map.getTargetElement();
		if (sel.feature) 
		{	var c = sel.handle ? this.Cursors[(sel.handle||'default')+(sel.constraint||'')+(sel.option||'')] : this.Cursors.select;
			if (this.previousCursor_===undefined) 
			{	this.previousCursor_ = element.style.cursor;
			}
			element.style.cursor = c;
		} 
		else  
		{	if (this.previousCursor_!==undefined) element.style.cursor = this.previousCursor_;
			this.previousCursor_ = undefined;
		}
	}
};
/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `false` to stop the drag sequence.
 */
ol.interaction.Transform.prototype.handleUpEvent_ = function(evt)
{	//dispatchEvent 
	this.dispatchEvent({ type:this.mode_+'end', feature: this.feature_, oldgeom: this.geom_ });
	this.drawSketch_();
	this.mode_ = null;
	return false;
};