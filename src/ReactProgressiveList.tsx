import * as React from 'react';
import times from 'lodash.times';

// [MC] Progressive load list items. By default it loads X rows first, then
// when you scroll to the end of that list it requests to load more (displaying a loader at the end
// of the list by default).
//
// You can also choose to lazily load more rows on each idle frame.
//
// This results in a fast initial render and avoids the complicated nature of a virtualised list.
//
// NOTE - This is a pure component so be sure to pass in new props if you need the list to update.
// By default if the rowCount prop doesn't change then the list won't update.
//
// NOTE - requestIdleCallback is currently not supported by safari.

interface Window {
  requestIdleCallback?: (fn: () => void) => number;
  cancelIdleCallback: (id: number) => void;
  addEventListener: (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => void;
  removeEventListener: (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) => void;
  innerHeight: number
}

declare var window: Window;


type Props = {
  className?: string,
  idleAmount?: number,
  scrollBuffer?: number,
  initialAmount: number,
  isActive?: boolean,
  progressiveAmount?: number,
  renderItem: (index: number) => any,
  rowCount: number,
  renderLoader?: () => any,
  useWindowScroll?: boolean
};


type State = {
  numRenderRows: number,
};

class ReactProgressiveList extends React.PureComponent<Props, State> {
  state: State;
  requestId: number;
  ref?: HTMLDivElement | null;
  isLoading = false;

  static defaultProps = {
    className: undefined,	 
    idleAmount: 0, // load one extra row on idle by default	     
    initialAmount: 10,
    isActive: true,	
    progressiveAmount: 10,	
    renderLoader: () => null,	
    useWindowScroll: false
  };

  constructor(props: Props, ...args: Array<any>) {
    super(props, ...args);
    const { rowCount, initialAmount, isActive } = props;
    this.requestId = 0;
    this.state = {
      numRenderRows: isActive ? initialAmount : rowCount
    };
  }

  componentDidMount() {
    const { useWindowScroll } = this.props;
    this.progressivelyLoadMore(false);
    const scrollParent = useWindowScroll ? window : this.ref && this.ref.parentElement;
    scrollParent && scrollParent.addEventListener('scroll', this.handleScroll, {
      passive: true
    });
  }

  handleScroll = (e: any) => {
    const { rowCount, progressiveAmount, useWindowScroll, scrollBuffer = 0 } = this.props;
    const { numRenderRows } = this.state;
    let top, height, scrollHeight, reachedLimit;
    if (useWindowScroll) {
      const boundingClientRect = this.ref && this.ref.getBoundingClientRect();
      top = boundingClientRect && boundingClientRect.top || 0;
      height = boundingClientRect && boundingClientRect.height || 0;
      scrollHeight = window.innerHeight;
      reachedLimit = top + height <= scrollHeight + scrollBuffer;
    } else {
      top = e.target.scrollTop;
      height = e.target.offsetHeight;
      scrollHeight = e.target.scrollHeight;
      reachedLimit = top + height + scrollBuffer >= scrollHeight;
    }
    if (reachedLimit && numRenderRows !== rowCount && !this.isLoading) {
      this.loadMore(progressiveAmount);
    }
  };

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.rowCount !== this.props.rowCount) {
      this.initializeList(nextProps);
    }
  }

  componentWillUnmount() {
    const { useWindowScroll } = this.props;
    if (window.requestIdleCallback) window.cancelIdleCallback(this.requestId);
    const scrollParent = useWindowScroll ? window : this.ref && this.ref.parentElement;
    scrollParent && scrollParent.removeEventListener('scroll', this.handleScroll);
  }

  initializeList(props: Props) {
    const { rowCount, isActive, initialAmount } = props;
    if (window.requestIdleCallback) window.cancelIdleCallback(this.requestId);
    this.setState(
      {
        numRenderRows: isActive ? initialAmount : rowCount
      },
      () => {
        this.progressivelyLoadMore(false);
      }
    );
  }

  progressivelyLoadMore = (immediateLoad: boolean = true) => {
    const { rowCount, idleAmount } = this.props;
    const { numRenderRows } = this.state;
    if (!window.requestIdleCallback || idleAmount === 0) return;
    if (immediateLoad) this.loadMore(idleAmount);
    if (numRenderRows < rowCount) {
      this.requestId = window.requestIdleCallback(this.progressivelyLoadMore);
    }
  };

  loadMore(amount: number = 10) {
    const { rowCount } = this.props;
    if (this.state.numRenderRows >= rowCount) return;
    this.isLoading = true;
    this.setState(
      state => ({
        numRenderRows: Math.min(state.numRenderRows + amount, rowCount)
      }),
      () => {
        this.isLoading = false;
      }
    );
  }

  render() {
    const { className, renderItem, renderLoader, rowCount } = this.props;
    const { numRenderRows } = this.state;
    return (
      <div
        ref={ref => {
          this.ref = ref;
        }}
        className={className}
      >
        {times(numRenderRows, (i: number) => renderItem(i))}
        {numRenderRows < rowCount && renderLoader && renderLoader()}
      </div>
    );
  }
}

export default ReactProgressiveList;
