// @flow
import React, { PureComponent } from 'react';
import styled from 'styled-components';
import IconBase from 'react-icons-kit';
import { plus } from 'react-icons-kit/feather/plus';

import { COLORS } from '../../constants';

import MountAfter from '../MountAfter';
import Spacer from '../Spacer';

type Props = {
  onClick: () => void,
  children: React$Node,
};

export default class AddNewButton extends PureComponent<Props> {
  render() {
    return (
      <MountAfter
        delay={1000}
        reason={`
                A _really weird_ Chrome bug means that for a brief moment
                during initial mount, a large grey rectangle shows up on the
                screen.

                I traced it back to AddDependencyButton, and the fact that it
                has a "dashed" border. If I change that border to "solid", it
                fixes the bug o_O

                For reasons unknown, if I delay the rendering of this component,
                the bug is fixed. And because this component isn't needed
                immediately, that's ok!

                See the bug in action: https://imgur.com/a/SanrY61
              `}
      >
        <AddDependencyButton onClick={this.props.onClick}>
          <IconBase icon={plus} size={20} />
          <Spacer size={6} />
          {this.props.children}
        </AddDependencyButton>
      </MountAfter>
    );
  }
}

const AddDependencyButton = styled.button`
  width: 100%;
  height: 42px;
  padding: 8px 10px;
  margin-top: 10px;
  border: 2px dashed ${COLORS.gray[300]};
  border-radius: 6px;
  color: ${COLORS.gray[500]};
  background: none;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 17px;
  font-weight: 500;
  -webkit-font-smoothing: antialiased;
  cursor: pointer;

  &:hover {
    border: 2px dashed ${COLORS.gray[400]};
    color: ${COLORS.gray[600]};
  }
`;
