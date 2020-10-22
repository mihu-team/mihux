Object.defineProperty(exports, "__esModule", { value: true });
exports.useComponent = exports.Context = exports.Mihux = void 0;
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importStar(require("react"));
var react_hooks_redux_1 = tslib_1.__importDefault(require("react-hooks-redux"));
var immutable_1 = require("immutable");
var Context = react_1.default.createContext({});
exports.Context = Context;
var useComponent = function (Component) {
    return function (props) {
        var component = react_1.useMemo(function () { return new Component(props); }, []);
        var _a = react_1.useState(component.state), state = _a[0], setState = _a[1];
        component.setState = setState;
        react_1.useEffect(function () {
            if (component.componentWillMount) {
                component.componentWillMount();
            }
            if (component.componentDidMount) {
                component.props = props;
                component.state = state;
                component.componentDidMount();
            }
            return function () {
                if (component.componentWillUnMount) {
                    component.componentWillUnMount();
                }
            };
        }, []);
        component.props = props;
        component.state = state;
        return component.render();
    };
};
exports.useComponent = useComponent;
var Mihux = (function () {
    function Mihux() {
        var _this = this;
        this.state = {};
        this.returnMap = {};
        this.store = {};
        this.mutation = {};
        this.mapState = {};
        this.getNewState = function () {
            var newState = Object.assign({}, _this.store.getState());
            var mapState = immutable_1.Map(tslib_1.__assign({}, newState));
            return mapState;
        };
        this.set = function (key, value) {
            var mapState = _this.getNewState();
            return mapState.set(key, value);
        };
        this.setIn = function (keys, value) {
            var mapState = _this.getNewState();
            return mapState.setIn(keys, value);
        };
        this.merge = function (values) {
            var mapState = _this.getNewState();
            return mapState.merge(tslib_1.__assign({}, values));
        };
        this.getValue = function (state, key) {
            var values = state.get(key);
            try {
                return values.toJS();
            }
            catch (_a) {
                return values;
            }
        };
        this.mapMutation = function (fns, model, flag) {
            var me = _this;
            var createReducer = function (key, mapNewState) {
                var doReducer = function () {
                    return {
                        type: key,
                        reducer: function (state) {
                            var mapState = immutable_1.fromJS(state);
                            me.returnMap = mapState === null || mapState === void 0 ? void 0 : mapState.merge(mapNewState);
                            return me.returnMap.toJS();
                        },
                    };
                };
                _this.store.dispatch(doReducer());
                return me.returnMap;
            };
            var builtIn = {
                mutation: _this.mutation[model],
                setState: _this.set,
                setInState: _this.setIn,
                mergeState: _this.merge,
                getValue: _this.getValue
            };
            Object.keys(fns).forEach(function (key) {
                switch (flag) {
                    case 'async':
                        var toUpperCaseKey_1 = 'async' + key.replace(key[0], key[0].toUpperCase());
                        (_this.mutation[model][toUpperCaseKey_1] = function (values) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                            var _a, _b;
                            return tslib_1.__generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _a = createReducer;
                                        _b = [toUpperCaseKey_1];
                                        return [4, fns[key](this.returnMap, values, builtIn)];
                                    case 1: return [2, _a.apply(void 0, _b.concat([_c.sent()]))];
                                }
                            });
                        }); });
                        break;
                    default:
                        (_this.mutation[model][key] = function (values) {
                            return createReducer(key, fns[key](_this.returnMap, values, builtIn));
                        });
                }
            });
        };
        this.init = function () {
            var _a = react_hooks_redux_1.default({ initialState: tslib_1.__assign({}, _this.state) }), Provider = _a.Provider, store = _a.store;
            _this.store = store;
            _this.mapState = immutable_1.Map(tslib_1.__assign({}, _this.state));
            _this.returnMap = _this.mapState;
            return { store: store, Provider: Provider };
        };
        this.register = function (registerProps) {
            var _a = registerProps.state, state = _a === void 0 ? {} : _a, _b = registerProps.sync, sync = _b === void 0 ? {} : _b, _c = registerProps.async, async = _c === void 0 ? {} : _c;
            var model = '@__for_page__model__mihux__key__only_global__!_{0}_{0}_$_#!_';
            _this.mutation[model] = {};
            _this.mapMutation(sync, model);
            _this.mapMutation(async, model, 'async');
            _this.state = Object.assign({}, tslib_1.__assign({}, state), tslib_1.__assign({}, _this.mutation[model]));
        };
        this.Provider = function (props) {
            var _a = _this.init(), store = _a.store, Provider = _a.Provider;
            var newProps = { store: store };
            var ProviderChildren = function (props) {
                var store = react_1.useContext(Context).store;
                var children = props.children;
                var state = store.useContext();
                return (react_1.default.createElement(Context.Provider, { value: state }, children));
            };
            return (react_1.default.createElement(Context.Provider, { value: newProps },
                react_1.default.createElement(Provider, null,
                    react_1.default.createElement(ProviderChildren, tslib_1.__assign({}, props)))));
        };
    }
    return Mihux;
}());
exports.Mihux = Mihux;
//# sourceMappingURL=index.js.map
