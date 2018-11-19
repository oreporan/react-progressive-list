"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var lodash_times_1 = require("lodash.times");
var ReactProgressiveList = /** @class */ (function (_super) {
    __extends(ReactProgressiveList, _super);
    function ReactProgressiveList(props) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var _this = _super.apply(this, [props].concat(args)) || this;
        _this.isLoading = false;
        _this.handleScroll = function (e) {
            var _a = _this.props, rowCount = _a.rowCount, progressiveAmount = _a.progressiveAmount, useWindowScroll = _a.useWindowScroll, _b = _a.scrollBuffer, scrollBuffer = _b === void 0 ? 0 : _b;
            var numRenderRows = _this.state.numRenderRows;
            var top, height, scrollHeight, reachedLimit;
            if (useWindowScroll) {
                var boundingClientRect = _this.ref && _this.ref.getBoundingClientRect();
                top = boundingClientRect && boundingClientRect.top || 0;
                height = boundingClientRect && boundingClientRect.height || 0;
                scrollHeight = window.innerHeight;
                reachedLimit = top + height <= scrollHeight + scrollBuffer;
            }
            else {
                top = e.target.scrollTop;
                height = e.target.offsetHeight;
                scrollHeight = e.target.scrollHeight;
                reachedLimit = top + height + scrollBuffer >= scrollHeight;
            }
            if (reachedLimit && numRenderRows !== rowCount && !_this.isLoading) {
                _this.loadMore(progressiveAmount);
            }
        };
        _this.progressivelyLoadMore = function (immediateLoad) {
            if (immediateLoad === void 0) { immediateLoad = true; }
            var _a = _this.props, rowCount = _a.rowCount, idleAmount = _a.idleAmount;
            var numRenderRows = _this.state.numRenderRows;
            if (!window.requestIdleCallback || idleAmount === 0)
                return;
            if (immediateLoad)
                _this.loadMore(idleAmount);
            if (numRenderRows < rowCount) {
                _this.requestId = window.requestIdleCallback(_this.progressivelyLoadMore);
            }
        };
        var rowCount = props.rowCount, initialAmount = props.initialAmount, isActive = props.isActive;
        _this.requestId = 0;
        _this.state = {
            numRenderRows: isActive ? initialAmount : rowCount
        };
        return _this;
    }
    ReactProgressiveList.prototype.componentDidMount = function () {
        var useWindowScroll = this.props.useWindowScroll;
        this.progressivelyLoadMore(false);
        var scrollParent = useWindowScroll ? window : this.ref && this.ref.parentElement;
        scrollParent && scrollParent.addEventListener('scroll', this.handleScroll, {
            passive: true
        });
    };
    ReactProgressiveList.prototype.componentWillReceiveProps = function (nextProps) {
        if (nextProps.rowCount !== this.props.rowCount) {
            this.initializeList(nextProps);
        }
    };
    ReactProgressiveList.prototype.componentWillUnmount = function () {
        var useWindowScroll = this.props.useWindowScroll;
        if (window.requestIdleCallback)
            window.cancelIdleCallback(this.requestId);
        var scrollParent = useWindowScroll ? window : this.ref && this.ref.parentElement;
        scrollParent && scrollParent.removeEventListener('scroll', this.handleScroll);
    };
    ReactProgressiveList.prototype.initializeList = function (props) {
        var _this = this;
        var rowCount = props.rowCount, isActive = props.isActive, initialAmount = props.initialAmount;
        if (window.requestIdleCallback)
            window.cancelIdleCallback(this.requestId);
        this.setState({
            numRenderRows: isActive ? initialAmount : rowCount
        }, function () {
            _this.progressivelyLoadMore(false);
        });
    };
    ReactProgressiveList.prototype.loadMore = function (amount) {
        var _this = this;
        if (amount === void 0) { amount = 10; }
        var rowCount = this.props.rowCount;
        if (this.state.numRenderRows >= rowCount)
            return;
        this.isLoading = true;
        this.setState(function (state) { return ({
            numRenderRows: Math.min(state.numRenderRows + amount, rowCount)
        }); }, function () {
            _this.isLoading = false;
        });
    };
    ReactProgressiveList.prototype.render = function () {
        var _this = this;
        var _a = this.props, className = _a.className, renderItem = _a.renderItem, renderLoader = _a.renderLoader, rowCount = _a.rowCount;
        var numRenderRows = this.state.numRenderRows;
        return (React.createElement("div", { ref: function (ref) {
                _this.ref = ref;
            }, className: className },
            lodash_times_1.default(numRenderRows, function (i) { return renderItem(i); }),
            numRenderRows < rowCount && renderLoader && renderLoader()));
    };
    ReactProgressiveList.defaultProps = {
        className: undefined,
        idleAmount: 0,
        initialAmount: 10,
        isActive: true,
        progressiveAmount: 10,
        renderLoader: function () { return null; },
        useWindowScroll: false
    };
    return ReactProgressiveList;
}(React.PureComponent));
exports.default = ReactProgressiveList;
