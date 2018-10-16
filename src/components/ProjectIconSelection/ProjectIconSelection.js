// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { remote } from 'electron';
import * as fs from 'fs';

import { DEFAULT_PLUGIN_ICON } from '../../config/app';

import SelectableImage from '../SelectableImage';
import { FillButton } from '../Button';

const DEFAULT_SUBSET_LENGTH = 21;
const DEFAULT_ICON_SIZE = 60;

type Props = {
  icon: ?string,
  onSelectIcon: (src: string, ev: SyntheticMouseEvent<*>) => void,
};

class ProjectIconSelection extends Component<Props> {
  static defaultProps = {
    limitTo: DEFAULT_SUBSET_LENGTH,
  };

  updateIcon = (ev: SyntheticMouseEvent<*>) => {
    ev.persist();
    remote.dialog.showOpenDialog(
      {
        title: 'Plugin Icon',
        buttonLabel: 'Choose',
        properties: ['openFile'],
        filters: [{ name: 'Images', extensions: ['png'] }],
      },
      paths => {
        if (paths && paths[0]) {
          fs.readFile(paths[0], 'base64', (err, icon) => {
            if (err) {
              console.error(err);
              return;
            }
            this.props.onSelectIcon(icon, ev);
          });
        }
      }
    );
  };

  render() {
    const { icon } = this.props;

    return (
      <ProjectIconWrapper>
        <SelectableImage
          src={`data:image/png;base64, ${icon ? `icon` : DEFAULT_PLUGIN_ICON}`}
          size={DEFAULT_ICON_SIZE}
          onClick={this.updateIcon}
          status="default"
        />
        <ProjectIconButton onClick={this.updateIcon}>
          Choose Another Icon
        </ProjectIconButton>
      </ProjectIconWrapper>
    );
  }
}

const ProjectIconWrapper = styled.div`
  margin-top: 16px;
`;

const ProjectIconButton = styled(FillButton)`
  position: relative;
  margin-left: 20px;
  top: -24px;
`;

export default ProjectIconSelection;
