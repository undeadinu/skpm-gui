// @flow
import React, { Fragment, PureComponent } from 'react';
import styled from 'styled-components';

import emptyIconSrc from '../../assets/images/empty.svg';
import webviewIconSrc from '../../assets/images/webview.svg';
import datasupplierIconSrc from '../../assets/images/datasupplier.svg';

import ButtonWithIcon from '../ButtonWithIcon';
import Spacer from '../Spacer';

import type { ProjectType } from '../../types';
type Props = {
  projectType: ?ProjectType,
  onSelectProjectType: (projectType: ProjectType) => void,
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
        {mapProjectTypeToComponent.map((curProjectType, index) => (
          <Fragment key={curProjectType.type}>
            <ButtonWithIcon
              showStroke={projectType === curProjectType.type}
              icon={curProjectType.Component}
              onClick={(ev: SyntheticEvent<*>) =>
                this.select(ev, curProjectType.type)
              }
            >
              {curProjectType.caption}
            </ButtonWithIcon>
            {index < mapProjectTypeToComponent.length - 1 ? (
              <Spacer inline size={10} />
            ) : null}
          </Fragment>
        ))}
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

const mapProjectTypeToComponent = [
  {
    type: 'empty',
    Component: <EmptyIcon src={emptyIconSrc} />,
    caption: 'Vanilla React',
  },
  {
    type: 'webview',
    Component: <Icon src={webviewIconSrc} />,
    caption: 'WebView',
  },
  {
    type: 'datasupplier',
    Component: <Icon src={datasupplierIconSrc} />,
    caption: 'Data Supplier',
  },
];

export default ProjectTypeSelection;
