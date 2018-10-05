// @flow
import React, { Component } from 'react';
import styled from 'styled-components';

type Status = 'default' | 'highlighted' | 'faded';

type Props = {
  size: number,
  colors: Array<string>,
  status: Status,
  children: (status: Status) => React$Node,
};

class SelectableItem extends Component<Props> {
  render() {
    const { size, colors, status, children, ...delegated } = this.props;

    return (
      <ButtonElem size={size} {...delegated}>
        {children(status)}
      </ButtonElem>
    );
  }
}

const ButtonElem = styled.button`
  position: relative;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border: none;
  background: none;
  outline: none;
  padding: 0;
  cursor: pointer;
  &:active rect {
    stroke-width: 4;
  }
`;

export default SelectableItem;
