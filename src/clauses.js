const { QueryTypes, ExpressionTypes, MethodTypes } = require("./types");
const v = require("./validations");
const e = require("./errors");

function batchAction(action, type, entity, state, payload) {
	if (state.getError() !== null) {
		return state;
	}
	try {
		state.setMethod(type);
		for (let facets of payload) {
			let batchState = action(entity, state.createSubState(), facets);
			if (batchState.getError() !== null) {
				throw batchState.getError();
			}
		}
		return state;
	} catch(err) {
		state.setError(err);
		return state;
	}
}

let clauses = {
	index: {
		name: "index",
		children: ["get", "delete", "update", "query", "put", "scan", "collection", "create", "remove", "patch", "batchPut", "batchDelete", "batchGet"],
	},
	collection: {
		name: "collection",
		/* istanbul ignore next */
		action(entity, state, collection = "", facets /* istanbul ignore next */ = {}) {
			if (state.getError() !== null) {
				return state;
			}
			try {
				entity._expectFacets(facets, Object.keys(facets), `"query collection" composite attributes`);
				const {pk} = state.getCompositeAttributes();
				return state
					.setType(QueryTypes.collection)
					.setMethod(MethodTypes.query)
					.setCollection(collection)
					.setPK(entity._expectFacets(facets, pk));

			} catch(err) {
				state.setError(err);
				return state;
			}
		},
		children: ["params", "go", "page"],
	},
	scan: {
		name: "scan",
		action(entity, state) {
			if (state.getError() !== null) {
				return state;
			}
			try {
				return state.setMethod(MethodTypes.scan);
			} catch(err) {
				state.setError(err);
				return state;
			}
		},
		children: ["params", "go", "page"],
	},
	get: {
		name: "get",
		/* istanbul ignore next */
		action(entity, state, facets = {}) {
			if (state.getError() !== null) {
				return state;
			}
			try {
				const attributes = state.getCompositeAttributes();
				return state
					.setMethod(MethodTypes.get)
					.setType(QueryTypes.eq)
					.setPK(entity._expectFacets(facets, attributes.pk))
					.ifSK(() => {
						entity._expectFacets(facets, attributes.sk);
						state.setSK(entity._buildQueryFacets(facets, attributes.sk));
					});
			} catch(err) {
				state.setError(err);
				return state;
			}
		},
		children: ["params", "go"],
	},
	batchGet: {
		name: "batchGet",
		action: (entity, state, payload) => batchAction(clauses.get.action, MethodTypes.batchGet, entity, state, payload),
		children: ["params", "go"],
	},
	batchDelete: {
		name: "batchDelete",
		action: (entity, state, payload) => batchAction(clauses.delete.action, MethodTypes.batchWrite, entity, state, payload),
		children: ["params", "go"],
	},
	delete: {
		name: "delete",
		/* istanbul ignore next */
		action(entity, state, facets = {}) {
			if (state.getError() !== null) {
				return state;
			}
			try {
				const attributes = state.getCompositeAttributes();
				return state
					.setMethod(MethodTypes.delete)
					.setType(QueryTypes.eq)
					.setPK(entity._expectFacets(facets, attributes.pk))
					.ifSK(() => {
						entity._expectFacets(facets, attributes.sk);
						state.setSK(entity._buildQueryFacets(facets, attributes.sk));
					});
			} catch(err) {
				state.setError(err);
				return state;
			}
		},
		children: ["where", "params", "go"],
	},
	remove: {
		name: "remove",
		/* istanbul ignore next */
		action(entity, state, facets = {}) {
			if (state.getError() !== null) {
				return state;
			}
			try {
				const attributes = state.getCompositeAttributes();
				return state
					.setMethod(MethodTypes.delete)
					.setType(QueryTypes.eq)
					.setPK(entity._expectFacets(facets, attributes.pk))
					.ifSK(() => {
						entity._expectFacets(facets, attributes.sk);
						state.setSK(entity._buildQueryFacets(facets, attributes.sk));
					});
			} catch(err) {
				state.setError(err);
				return state;
			}
		},
		children: ["where", "params", "go"],
	},
	put: {
		name: "put",
		/* istanbul ignore next */
		action(entity, state, payload = {}) {
			if (state.getError() !== null) {
				return state;
			}
			try {
				let record = entity.model.schema.checkCreate({...payload});
				const attributes = state.getCompositeAttributes();
				return state
					.setMethod(MethodTypes.put)
					.setType(QueryTypes.eq)
					.setPut(record)
					.setPK(entity._expectFacets(record, attributes.pk))
					.ifSK(() => {
						entity._expectFacets(record, attributes.sk);
						state.setSK(entity._buildQueryFacets(record, attributes.sk));
					});
			} catch(err) {
				state.setError(err);
				return state;
			}
		},
		children: ["params", "go"],
	},
	batchPut: {
		name: "batchPut",
		action: (entity, state, payload) => batchAction(clauses.put.action, MethodTypes.batchWrite, entity, state, payload),
		children: ["params", "go"],
	},
	create: {
		name: "create",
		action(entity, state, payload) {
			if (state.getError() !== null) {
				return state;
			}
			try {
				let record = entity.model.schema.checkCreate({...payload});
				const attributes = state.getCompositeAttributes();
				return state
					.setMethod(MethodTypes.put)
					.setType(QueryTypes.eq)
					.setPut(record)
					.setPK(entity._expectFacets(record, attributes.pk))
					.ifSK(() => {
						entity._expectFacets(record, attributes.sk);
						state.setSK(entity._buildQueryFacets(record, attributes.sk));
					});
			} catch(err) {
				state.setError(err);
				return state;
			}
		},
		children: ["params", "go"],
	},
	patch: {
		name: "patch",
		action(entity, state, facets) {
			if (state.getError() !== null) {
				return state;
			}
			try {
				const attributes = state.getCompositeAttributes();
				return state
					.setMethod(MethodTypes.update)
					.setType(QueryTypes.eq)
					.setPK(entity._expectFacets(facets, attributes.pk))
					.ifSK(() => {
						entity._expectFacets(facets, attributes.sk);
						state.setSK(entity._buildQueryFacets(facets, attributes.sk));
					});
			} catch(err) {
				state.setError(err);
				return state;
			}
		},
		children: ["set", "append", "remove", "add", "subtract"],
	},
	update: {
		name: "update",
		action(entity, state, facets) {
			if (state.getError() !== null) {
				return state;
			}
			try {
				const attributes = state.getCompositeAttributes();
				return state
					.setMethod(MethodTypes.update)
					.setType(QueryTypes.eq)
					.setPK(entity._expectFacets(facets, attributes.pk))
					.ifSK(() => {
						entity._expectFacets(facets, attributes.sk);
						state.setSK(entity._buildQueryFacets(facets, attributes.sk));
					});
			} catch(err) {
				state.setError(err);
				return state;
			}
		},
		children: ["set", "append", "remove", "add", "subtract"],
	},
	set: {
		name: "set",
		action(entity, state, data) {
			if (state.getError() !== null) {
				return state;
			}
			try {
				let record = entity.model.schema.checkUpdate({...data});
				return state.setUpdateSet(record)
			} catch(err) {
				state.setError(err);
				return state;
			}
		},
		children: ["set", "go", "params"],
	},
	// append: {
	// 	name: "append",
	// 	action(entity, state, data = {}) {
	// 		let attributes = {}
	// 		let payload = {};
	// 		for (let path of Object.keys(data)) {
	// 			let parsed = entity.model.schema.parseAttributePath(path);
	//
	// 		}
	// 	},
	// 	children: ["set", "append", "remove", "add", "subtract", "go", "params"]
	// },
	// remove: {
	// 	name: "remove",
	// 	action(entity, state, data) {
	//
	// 	},
	// 	children: ["set", "append", "remove", "add", "subtract", "go", "params"]
	// },
	// add: {
	// 	name: "add",
	// 	action(entity, state, data) {
	//
	// 	},
	// 	children: ["set", "append", "remove", "add", "subtract", "go", "params"]
	// },
	// subtract: {
	// 	name: "subtract",
	// 	action(entity, state, data) {
	//
	// 	},
	// 	children: ["set", "append", "remove", "add", "subtract", "go", "params"]
	// },
	query: {
		name: "query",
		action(entity, state, facets, options = {}) {
			if (state.getError() !== null) {
				return state;
			}
			try {
				const attributes = state.getCompositeAttributes();
				entity._expectFacets(facets, Object.keys(facets), `"query" composite attributes`);
				return state
					.setMethod(MethodTypes.query)
					.setType(QueryTypes.is)
					.setPK(entity._expectFacets(facets, attributes.pk))
					.ifSK(() => {
						state.setSK(entity._buildQueryFacets(facets, attributes.sk))
					});
			} catch(err) {
				state.setError(err);
				return state;
			}
		},
		children: ["between", "gte", "gt", "lte", "lt", "begins", "params", "go", "page"],
	},
	between: {
		name: "between",
		action(entity, state, startingFacets = {}, endingFacets = {}) {
			if (state.getError() !== null) {
				return state;
			}
			try {
				const attributes = state.getCompositeAttributes();
				entity._expectFacets(
					startingFacets,
					Object.keys(startingFacets),
					`"between" composite attributes`,
				);
				entity._expectFacets(
					endingFacets,
					Object.keys(endingFacets),
					`"and" composite attributes`,
				);
				return state
					.setType(QueryTypes.and)
					.setSK(entity._buildQueryFacets(endingFacets, attributes.sk))
					.setType(QueryTypes.between)
					.setSK(entity._buildQueryFacets(startingFacets, attributes.sk))
			} catch(err) {
				state.setError(err);
				return state;
			}
		},
		children: ["go", "params", "page"],
	},
	begins: {
		name: "begins",
		action(entity, state, facets = {}) {
			if (state.getError() !== null) {
				return state;
			}
			try {
				entity._expectFacets(facets, Object.keys(facets), `"begins" composite attributes`);

				return state
					.setType(QueryTypes.begins)
					.ifSK(state => {
						const attributes = state.getCompositeAttributes();
						state.setSK(entity._buildQueryFacets(facets, attributes.sk))
					});
			} catch(err) {
				state.setError(err);
				return state;
			}
		},
		children: ["go", "params", "page"],
	},
	gt: {
		name: "gt",
		action(entity, state, facets = {}) {
			if (state.getError() !== null) {
				return state;
			}
			try {
				entity._expectFacets(facets, Object.keys(facets), `"gt" composite attributes`);
				return state
					.setType(QueryTypes.gt)
					.ifSK(state => {
						const attributes = state.getCompositeAttributes();
						state.setSK(entity._buildQueryFacets(facets, attributes.sk))
					});
			} catch(err) {
				state.setError(err);
				return state;
			}
		},
		children: ["go", "params", "page"],
	},
	gte: {
		name: "gte",
		action(entity, state, facets = {}) {
			if (state.getError() !== null) {
				return state;
			}
			try {
				entity._expectFacets(facets, Object.keys(facets), `"gte" composite attributes`);
				return state
					.setType(QueryTypes.gte)
					.ifSK(state => {
						const attributes = state.getCompositeAttributes();
						state.setSK(entity._buildQueryFacets(facets, attributes.sk))
					});
			} catch(err) {
				state.setError(err);
				return state;
			}
		},
		children: ["go", "params", "page"],
	},
	lt: {
		name: "lt",
		action(entity, state, facets = {}) {
			if (state.getError() !== null) {
				return state;
			}
			try {
				entity._expectFacets(facets, Object.keys(facets), `"lt" composite attributes`);
				return state.setType(QueryTypes.lt)
					.ifSK(state => {
						const attributes = state.getCompositeAttributes();
						state.setSK(entity._buildQueryFacets(facets, attributes.sk))
					});
			} catch(err) {
				state.setError(err);
				return state;
			}
		},
		children: ["go", "params", "page"],
	},
	lte: {
		name: "lte",
		action(entity, state, facets = {}) {
			if (state.getError() !== null) {
				return state;
			}
			try {
				entity._expectFacets(facets, Object.keys(facets), `"lte" composite attributes`);
				return state.setType(QueryTypes.lte)
					.ifSK(state => {
						const attributes = state.getCompositeAttributes();
						state.setSK(entity._buildQueryFacets(facets, attributes.sk))
					});
			} catch(err) {
				state.setError(err);
				return state;
			}
		},
		children: ["go", "params", "page"],
	},
	params: {
		name: "params",
		action(entity, state, options = {}) {
			if (state.getError() !== null) {
				throw state.error;
			}
			try {
				if (!v.isStringHasLength(options.table) && !v.isStringHasLength(entity._getTableName())) {
					throw new e.ElectroError(e.ErrorCodes.MissingTable, `Table name not defined. Table names must be either defined on the model, instance configuration, or as a query option.`);
				}
				let results;
				switch (state.getMethod()) {
					case MethodTypes.query:
						results = entity._queryParams(state, options);
						break;
					case MethodTypes.batchWrite:
						results = entity._batchWriteParams(state, options);
						break
					case MethodTypes.batchGet:
						results = entity._batchGetParams(state, options);
						break;
					default:
						results = entity._params(state, options);
						break;
				}
				return results;
			} catch(err) {
				throw err;
			}
		},
		children: [],
	},
	go: {
		name: "go",
		action(entity, state, options = {}) {
			if (state.getError() !== null) {
				return Promise.reject(state.error);
			}
			try {
				if (entity.client === undefined) {
					throw new e.ElectroError(e.ErrorCodes.NoClientDefined, "No client defined on model");
				}
				let params = clauses.params.action(entity, state, options);
				let {config} = entity._applyParameterOptions({}, state.getOptions(), options);
				return entity.go(state.getMethod(), params, config);
			} catch(err) {
				return Promise.reject(err);
			}
		},
		children: [],
	},
	page: {
		name: "page",
		action(entity, state, page = null, options = {}) {
			if (state.getError() !== null) {
				return Promise.reject(state.error);
			}
			try {
				options.page = page;
				options._isPagination = true;
				if (entity.client === undefined) {
					throw new e.ElectroError(e.ErrorCodes.NoClientDefined, "No client defined on model");
				}
				let params = clauses.params.action(entity, state, options);
				let {config} = entity._applyParameterOptions({}, state.getOptions(), options);
				return entity.go(state.getMethod(), params, config);
			} catch(err) {
				return Promise.reject(err);
			}
		},
		children: []
	},
};

class ExpressionState {
	constructor() {
		this.names = {};
		this.values = {};
		this.counts = {};
		this.expressions = {
			[ExpressionTypes.ConditionExpression]: "",
			[ExpressionTypes.FilterExpression]: "",
			[ExpressionTypes.UpdateExpression]: "",
			[ExpressionTypes.KeyConditionExpression]: ""
		}
	}

	incrementName(name) {
		if (this.counts[name] === undefined) {
			this.counts[name] = 1;
		}
		return this.counts[name]++;
	}

	setName(name, value) {
		this.names[name] = value;
	}

	getNames() {
		return this.names;
	}

	setValue(name, value) {
		this.values[name] = value;
	}

	getValues() {
		return this.values;
	}

	setExpression(type, value) {
		const name = ExpressionTypes[type];
		if (!name) {
			throw new Error(`Invalid expression type: "${type}"`);
		}
		this.expressions[name] = value;
	}

	getExpression(type) {
		const name = ExpressionTypes[type];
		return this.expressions[name];
	}
}

class ChainState {
	constructor(index = "", facets = {}, hasSortKey = false, options = {}, parentState = null) {
		this.parentState = parentState;
		this.error = null
		this.query = {
			collection: "",
			index: index,
				type: "",
				method: "",
				facets: { ...facets },
			update: {
				set: {},
				append: {},
				remove: {},
				add: {},
				subtract: {}
			},
			put: {
				data: {},
			},
			keys: {
				pk: {},
				sk: [],
			},
			filter: {},
			options,
		};

		this.expressions = new ExpressionState();
		this.subStates = [];
		this.hasSortKey = hasSortKey;
		this.prev = null;
		this.self = null;
	}

	getMethod() {
		return this.query.method;
	}

	getOptions() {
		return this.query.options;
	}

	walk(entity, allClauses, currentClause) {
		let current = {};
		for (let child of currentClause.children) {
			current[child] = (...args) => {
				this.prev = this.self;
				this.self = child;
				let results = allClauses[child].action(entity, this, ...args);
				if (allClauses[child].children.length) {
					return this.walk(entity, allClauses, allClauses[child]);
				} else {
					return results;
				}
			};
		}
		return current;
	}

	setPK(attributes) {
		this.query.keys.pk = attributes;
		return this;
	}

	ifSK(cb) {
		if (this.hasSortKey) {
			cb(this);
		}
		return this;
	}

	getCompositeAttributes() {
		return this.query.facets;
	}

	setSK(attributes, type = this.query.type) {
		if (this.hasSortKey) {
			this.query.keys.sk.push({
				type: type,
				facets: attributes
			});
		}
		return this;
	}

	setType(type) {
		if (!QueryTypes[type]) {
			throw new Error(`Invalid query type: "${type}"`);
		}
		this.query.type = QueryTypes[type];
		return this;
	}

	setMethod(method) {
		if (!MethodTypes[method]) {
			throw new Error(`Invalid method type: "${method}"`);
		}
		this.query.method = MethodTypes[method];
		return this;
	}

	setCollection(collection) {
		this.query.collection = collection;
		return this;
	}

	createSubState() {
		let subState = new ChainState(this.query.index, this.query.facets, this.hasSortKey, this.query.options, this);
		this.subStates.push(subState);
		return subState;
	}

	getError() {
		return this.error;
	}

	setError(err) {
		this.error = err;
		if (this.parentState) {
			this.parentState.setError(err);
		}
	}

	setPut(data = {}) {
		this.query.put.data = {...this.query.put.data, ...data};
		return this;
	}

	setUpdateSet(data = {}) {
		this.query.update.set = {...this.query.update.set, ...data}
		return this;
	}
}

function initChainState(index, facets = {}, hasSortKey, options) {
	return {
		error: null,
		query: {
			index: index,
			type: "",
			method: "",
			facets: { ...facets },
			update: {
				set: {},
				append: {},
				remove: {},
				add: {},
				subtract: {}
			},
			put: {
				data: {},
			},
			keys: {
				pk: {},
				sk: [],
			},
			filter: {},
			options,
		},
		batch: {
			items: [],
			create() {
				return initChainState(index, facets, hasSortKey, options);
			},
			push(state) {
				this.items.push(state);
			}
		},
		hasSortKey: hasSortKey,
	};
}

module.exports = {
	clauses,
	initChainState,
	ChainState
};
