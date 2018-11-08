// @flow
import React, { PureComponent } from 'react';
import styled from 'styled-components';

import emptyIconSrc from '../../assets/images/empty.svg';
import webviewIconSrc from '../../assets/images/webview.svg';
import datasupplierIconSrc from '../../assets/images/datasupplier.svg';

import ButtonWithIcon from '../ButtonWithIcon';
import Spacer from '../Spacer';

import type { ProjectType } from '../../types';
type Props = {
  projectType: ?ProjectType,
  onSelectProjectType: (type: ProjectType) => void,
};

class ProjectTypeSelection extends PureComponent<Props> {
  select = (ev: SyntheticEvent<*>, projectType: ProjectType) => {
    ev.preventDefault();
    this.props.onSelectProjectType(projectType);
  };

  render() {
    const { projectType } = this.props;
    return (
      <ProjectTypeTogglesWrapper>
        {/* Todo: Make it easier to add new flows - e.g. map over an array to generate the UI*/}
        <ButtonWithIcon
          showStroke={projectType === 'empty'}
          icon={<EmptyIcon src={emptyIconSrc} />}
          onClick={(ev: SyntheticEvent<*>) => this.select(ev, 'empty')}
        >
          Empty
        </ButtonWithIcon>
        <Spacer inline size={10} />
        <ButtonWithIcon
          showStroke={projectType === 'webview'}
          icon={<Icon src={webviewIconSrc} />}
          onClick={(ev: SyntheticEvent<*>) => this.select(ev, 'webview')}
        >
          Webview
        </ButtonWithIcon>
        <Spacer inline size={10} />
        <ButtonWithIcon
          showStroke={projectType === 'datasupplier'}
          icon={<Icon src={datasupplierIconSrc} />}
          onClick={(ev: SyntheticEvent<*>) => this.select(ev, 'datasupplier')}
        >
          Data Supplier
        </ButtonWithIcon>
      </ProjectTypeTogglesWrapper>
    );
  }
}

const Icon = styled.img`
  width: 22px;
  height: 22px;
`;

const EmptyIcon = styled.img`
  width: 18px;
  height: 18px;
`;

const ProjectTypeTogglesWrapper = styled.div`
  margin-top: 8px;
  margin-left: -8px;
`;

export default ProjectTypeSelection;
