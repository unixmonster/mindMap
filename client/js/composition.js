kampfer.require('events.EventTarget');

kampfer.provide('mindMap.Composition');

/**
 * 实现一个composition模式的类，用于组织对象，协调对象的关系。
 * 涉及parent的方法(get,set)只会影响到实例对象本身，而涉及child的方法不仅会影响对象自己，
 * 还会影响child实例对象。所以请使用child相关方法维护对象间的组织关系。
 */
kampfer.mindMap.Composition = kampfer.events.EventTarget.extend({
	
	//init : function() {},
	
	//Composition实例
	_parent : null,
	
	//对象，每一项都应该是Composition实例
	_children : null,
	
	_id : null,
	
	setId : function(id) {
		var oldId = this._id;
		
		this._id = id;
		
		if(this._parent && this._parent._children) {
			this._parent._children[oldId] = null;
			this._parent.addChild(this);
		}
	},
	
	getId : function() {
		return this._id || ( this._id = this.generateUniqueId() );
	},
	
	/**
	 * 设置父对象。不能将parent设置为composition自己。
	 * 以下情况setParent将抛出异常：
	 * 1. parent非null但不是一个composition实例
	 * 2. 尝试将parent设置为composition自己
	 * 3. parent非null且composition已经拥有了一个_parent且_parent!=parent
	 * @param	{kampfer.mindMap.Composition}parent
	 */
	setParent : function(parent) {
		if( parent && !(parent instanceof kampfer.mindMap.Composition) ) {
			throw('parent is not instanceof composition');
		}
		
		if( parent === this ) {
			throw('parent cant be composition itself');
		}
		
		//如果parent已经存在
		if( parent && this._parent && this._parent !== parent ) {
			throw('parent already exist');
		}
		
		this.setParentEventTarget(parent);
		this._parent = parent;
	},
	
	getParent : function() {
		return this._parent;
	},
	
	/**
	 * 添加子对象。
 	 * @param {kampfer.mindMap.Composition} child
	 */
	addChild : function(child) {
		
		if( !(child instanceof kampfer.mindMap.Composition) ) {
			throw('wrong type param');
		}
		
		var id = child.getId();
	
		if(!this._children) {
			this._children = {};
		}
		
		if(!this._children[id]) {
			this._children[id] = child;
		}else{
			throw('can not add child');
		}
		
		child.setParent(this);
	},
	
	/**
	 * 删除子对象
 	 * @param {string|kampfer.mindMap.Composition} child
	 */
	removeChild : function(child) {
		if(child) {
			var id, type = kampfer.type(child);
			
			if(type === 'string') {
				id = child;
				child = this.getChild(id);
			} else if(type === 'object') {
				if( !(child instanceof kampfer.mindMap.Composition) ) {
					throw('wrong type param');
				}
				id = child.getId();
			}
			
			if(id && (id in this._children)) {
				delete this._children[id];
				child.setParent(null);
			}
		}
		
		return child;
	},
	
	//composition只负责子component
	getChild : function(id) {
		if(this._children) {
			return this._children[id];
		}
	},
	
	//fn(child, id)
	eachChild : function(fn, context) {
		if(this._children) {
			for(var id in this._children) {
				if( fn.call(context, this._children[id], id) === false ) {
					return;
				}
			}
		}
	},
	
	/*
	 * 生成唯一id
	 * 直接使用时间戳不可行
	 * 以下方法摘自http://www.cnblogs.com/NoRoad/archive/2010/03/12/1684759.html
	 */
	generateUniqueId : function() {
		var guid = "";
		for(var i = 1; i <= 32; i++) {
			var n = Math.floor(Math.random() * 16.0).toString(16);
			guid += n;
			if((i == 8) || (i == 12) || (i == 16) || (i == 20)) {
				guid += "-";
			}
		}
		return guid;
	},
	
	dispose : function() {
		this._super();
		this._parent = null;
		this._children = null;
	}
	
});