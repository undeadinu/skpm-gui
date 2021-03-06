// @flow
import React, { Component, Fragment } from 'react';
import styled from 'styled-components';

import loaderSrc from '../../assets/images/loader.gif';
import { COLORS } from '../../constants';

import Heading from '../Heading';
import Spacer from '../Spacer';

type Props = {
  name: string,
  queued: boolean,
};

class DependencyInstalling extends Component<Props> {
  render() {
    const { name, queued } = this.props;
    const stylizedName = (
      <span style={{ color: COLORS.orange[500] }}>{name}</span>
    );

    return (
      <Wrapper>
        <InnerWrapper>
          <Loader src={loaderSrc} />
          <Spacer size={50} />
          <Heading size="small">
            {queued ? (
              <Fragment>{stylizedName} is queued for install...</Fragment>
            ) : (
              <Fragment>Installing {stylizedName}...</Fragment>
            )}
          </Heading>
        </InnerWrapper>
      </Wrapper>
    );
  }
}

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const InnerWrapper = styled.div`
  text-align: center;
`;

const Loader = styled.img`
  width: 148px;
`;

export default DependencyInstalling;
