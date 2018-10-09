// @flow
import React, { PureComponent } from 'react';
import styled from 'styled-components';

import { DragSource } from 'react-dnd';

import type { Tree } from './types';

// This type must be assigned to the tree via the `dndType` prop as well
export const externalNodeType = 'yourNodeType';
const externalNodeSpec = {
  // This needs to return an object with a property `node` in it.
  // Object rest spread is recommended to avoid side effects of
  // referencing the same object in different trees.
  beginDrag: (props, monitor, component) => ({
    node: { ...props.node, title: component.state.title || props.node.title },
  }),

  endDrag: (props, monitor, component) => {
    if (props.editable) {
      component.resetTitle();
    }
  },
};
const externalNodeCollect = _connect => ({
  connectDragSource: _connect.dragSource(),
});
class externalNodeBaseComponent extends PureComponent<
  {
    node: Tree,
    editable?: boolean,
    connectDragSource: any,
  },
  { title: string }
> {
  state = {
    title: '',
  };

  resetTitle = () => {
    this.setState({ title: '' });
  };

  handleChange = e => {
    this.setState({
      title: e.currentTarget.value,
    });
  };

  render() {
    const { connectDragSource, node, editable } = this.props;

    return (
      <Box
        innerRef={instance =>
          connectDragSource(instance, { dropEffect: 'copy' })
        }
      >
        {editable ? (
          <Input
            placeholder={node.title}
            value={this.state.title}
            onChange={this.handleChange}
          />
        ) : (
          node.title
        )}
      </Box>
    );
  }
}

const Box = styled.div`
  position: relative;
  flex-basis: 42px;
  flex-shrink: 0;
  border: solid #bbb 1px;
  box-shadow: 0 2px 2px -2px;
  padding: 0 5px 0 10px;
  border-radius: 2px;
  margin-bottom: 25px;
  margin-top: -15px;
  min-width: 230px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: white;
  color: black;
`;

const Input = styled.input`
  height: 100%;
  width: calc(100% + 15px);
  border: 0;
  margin-left: -10px;
  padding: 0 5px 0 10px;
  font-size: 14px;
`;

export default DragSource(
  externalNodeType,
  externalNodeSpec,
  externalNodeCollect
)(externalNodeBaseComponent);
