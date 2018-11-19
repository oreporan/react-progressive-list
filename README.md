<div align="center">
    <img alt="react-progressive-list" src="https://raw.githubusercontent.com/mattcolman/react-progressive-list/master/react-progressive-list.jpg" height="200px" />
</div>

<br> 
This is a fork to the original [react-progressive-list](https://www.npmjs.com/package/react-progressive-list) library but with some added features:

1. written in typescript
2. added a scrollBuffer so that you can start loading the next items before the end is reached


</br>
<br />

Read the [blog post](https://medium.com/@mattcolman/an-alternative-to-react-virtualized-fba2299f10b1)

<br />

[React Progressive List](https://www.npmjs.com/package/react-progressive-list)
is an alternative to
[React Virtualized](https://github.com/bvaughn/react-virtualized). It wins in
two possible scenarios:

1. Your list rows are complex and slow to render. react-virtualized cannot
   render new rows fast enough to maintain a smooth 60fps scroll.
2. You've tried react-virtualized and found it to be overly complicated for your
   basic needs.

## Demo

[Demo Site](http://mattcolman.com/labs/react-progressive-list)

<div align="center">
    <img alt="example" src="https://raw.githubusercontent.com/mattcolman/react-progressive-list/master/example.gif" height="300px" />
</div>

<br />

## Install

`yarn add react-progressive-list-typescript`

## Example

```
  renderRow = index => {
    return <Row key={index} avatar={avatars[index]} name={names[index]} />;
  }

  render() {
    return (
      <ReactProgressiveList
        initialAmount={40}
        progressiveAmount={20}
        renderItem={this.renderRow}
        renderLoader={() => <Spinner />}
        rowCount={400}
        scrollBuffer={20}
        useWindowScroll
      />
    );
  }
```

### Props

| Property            | Type                          | Default    | Description                                                                                            |
| :------------------ | :---------------------------- | :--------- | :----------------------------------------------------------------------------------------------------- |
| `className`         | string                        | undefined  | className to apply to the parent div                                                                   |
| `initialAmount`     | number                        | 10         | initial number of rows to display                                                                      |
| `progressiveAmount` | number                        | 10         | number of rows to render each time a new batch is requested                                            |
| `idleAmount`        | number                        | 0          | number of rows to render when the browser is idle (limited browser support for requestIdleCallback)    |
| `isActive`          | boolean                       | true       | setting to false will render the full list without any progressive loading                             |
| `renderItem`        | (index: number) => React.Node | required   | function that returns the row to render                                                                |
| `renderLoader`      | () => React.Node              | () => null | function that returns a loader to render                                                               |
| `rowCount`          | number                        | required   | the length of your list                                                                                |
| `useWindowScroll`   | boolean                       | false      | When true will use a scroll listener on the window, otherwise will use a scroll listener on the parent |
| `scrollBuffer`      | number                        | 0          | How many pixels before the end is reached, should we start loading more items                          |
