// @flow
import React from 'react';
import styled from 'styled-components';
import IconBase from 'react-icons-kit';
import { externalLink } from 'react-icons-kit/feather/externalLink';

import { COLORS, BREAKPOINTS } from '../../constants';
import { capitalize } from '../../utils';

import ExternalLink from '../ExternalLink';
import LargeLED from '../LargeLED';
import Spacer from '../Spacer';

import type { TaskStatus } from '../../types';

type Props = {
  status: TaskStatus,
  port?: number,
};

const DevelopmentServerStatus = ({ status, port }: Props) => {
  return (
    <Wrapper>
      <LargeLED status={status} />
      <StatusTextWrapper>
        <Status>{getLabel(status)}</Status>
        <StatusCaption>
          <ExternalLink
            color={COLORS.gray[700]}
            hoverColor={COLORS.gray[900]}
            href="sketch://"
          >
            <IconLinkContents>
              <IconBase icon={externalLink} />
              <Spacer inline size={5} />
              Open Sketch
            </IconLinkContents>
          </ExternalLink>
        </StatusCaption>
      </StatusTextWrapper>
    </Wrapper>
  );
};

const getLabel = (status: TaskStatus) => {
  switch (status) {
    case 'success':
      return 'Running';
    default:
      return capitalize(status);
  }
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  border: 2px solid ${COLORS.gray[200]};
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 24px;

  @media ${BREAKPOINTS.sm} {
    flex-direction: column;
    width: 250px;
    text-align: center;
  }

  @media ${BREAKPOINTS.mdMin} {
    margin-top: 20px;
  }
`;

const StatusTextWrapper = styled.div`
  position: relative;

  @media ${BREAKPOINTS.sm} {
    margin-top: 5px;
  }

  @media ${BREAKPOINTS.mdMin} {
    margin-left: 10px;
  }
`;

const StatusCaption = styled.div`
  margin-top: 4px;
  font-size: 14px;
  font-weight: 400;
`;

const IconLinkContents = styled.div`
  display: flex;
  align-items: center;
`;

const Status = styled.div`
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -1px;
  -webkit-font-smoothing: antialiased;
  color: ${COLORS.gray[900]};
  line-height: 28px;
`;

export default DevelopmentServerStatus;
